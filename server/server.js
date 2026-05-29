require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const Booking = require('./models/Booking');
const Order = require('./models/Order');
const User = require('./models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-prototype-key-12345';

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 5000
    });
    console.log('Live Gmail Transporter configured.');
} else {
    console.log('Email credentials not found in .env');
}

async function sendNotification(to, subject, text) {
  if (!transporter) return;
  try {
      const info = await transporter.sendMail({
          from: '"Style Corner" <noreply@stylecorner.com>',
          to: to,
          subject: subject,
          text: text
      });
      console.log('Email sent: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
      console.error('Error sending email:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '../')));

// MongoDB Connection
mongoose.set('bufferCommands', false); // Disable command buffering so queries fail fast if not connected
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error. Check your network or IP whitelist:', err.message));

// --- API ROUTES ---

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    try {
      const fullUser = await User.findById(decoded.id);
      if (!fullUser) return res.status(403).json({ error: 'User no longer exists.' });
      req.user = fullUser;
      next();
    } catch (e) {
      res.status(500).json({ error: 'Server error during authentication.' });
    }
  });
}

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password, phone, role, services } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer',
      specialties: services ? services.split(',') : [],
      isVerified: false,
      otpCode,
      otpExpiresAt
    });

    const savedUser = await user.save();
    
    // Send OTP Email
    await sendNotification(
      savedUser.email, 
      "Style Corner - Verify Your Account", 
      `Hi ${savedUser.firstname},\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.`
    );
    
    // Do NOT return token yet. Require verification.
    res.status(201).json({ message: 'Registration successful. Please verify your email.', email: savedUser.email });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify OTP
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (user.otpCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Code is valid
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Issue token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Verification successful', user, token });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'unverified', message: 'Please verify your email address before logging in.', email: user.email });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { firstname, lastname, phone } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { firstname, lastname, phone } },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all specialists (staff)
app.get('/api/specialists', async (req, res) => {
  try {
    const specialists = await User.find({ role: 'staff' });
    res.status(200).json(specialists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch specialists' });
  }
});
// Get all bookings (Filtered by Role)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { clientEmail: req.user.email };
    } else if (req.user.role === 'staff') {
      query = { $or: [{ status: 'pending' }, { staff: req.user.firstname }] };
    }
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    // Prevent double booking (one active booking at a time for client)
    const existingClientBooking = await Booking.findOne({ 
      clientEmail: req.body.clientEmail, 
      status: { $in: ['pending', 'accepted'] } 
    });
    if (existingClientBooking) {
      return res.status(400).json({ error: 'You already have an active appointment. Please wait until it is completed or cancelled.' });
    }

    // Prevent Double Booking Stylist (The Overlapping Expert)
    if (req.body.stylist && req.body.stylist !== 'Any Specialist') {
      const existingStylistBooking = await Booking.findOne({
        stylist: req.body.stylist,
        date: req.body.date,
        time: req.body.time,
        status: { $in: ['pending', 'accepted'] }
      });
      if (existingStylistBooking) {
        return res.status(400).json({ error: 'This stylist is already booked for that specific date and time.' });
      }
    }

    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    await sendNotification(savedBooking.clientEmail, "Booking Confirmed", `Hi ${savedBooking.clientName},\n\nYour booking for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time} has been received.`);
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// Update a booking status
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.status === 'accepted') {
      await sendNotification(updated.clientEmail, "Booking Accepted!", `Hi ${updated.clientName},\n\nGreat news! Your booking has been accepted by our staff. See you then!`);
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Get all orders (Filtered by Role)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { email: req.user.email };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order (from store checkout)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    await sendNotification(savedOrder.email || "customer@example.com", "Order Received", `Thank you for your order! Order #${savedOrder.id} for ${savedOrder.item} has been placed.`);
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Update an order status
app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.status === 'shipped') {
      await sendNotification(updated.email || "customer@example.com", "Order Shipped!", `Good news! Order #${updated.id} for ${updated.item} has been shipped to ${updated.address}.`);
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
