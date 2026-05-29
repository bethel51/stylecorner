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
        }
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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

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

    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer',
      specialties: services ? services.split(',') : []
    });

    const savedUser = await user.save();
    await sendNotification(savedUser.email, "Welcome to Style Corner!", `Hi ${savedUser.firstname},\n\nWelcome to Style Corner! Your account has been created successfully as a ${savedUser.role}.`);
    
    // Create JWT
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: savedUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
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

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
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
