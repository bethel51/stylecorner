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
if (process.env.BREVO_SMTP_HOST && process.env.BREVO_SMTP_KEY) {
    transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
        secure: parseInt(process.env.BREVO_SMTP_PORT) === 465,
        auth: {
            user: process.env.BREVO_SMTP_LOGIN,
            pass: process.env.BREVO_SMTP_KEY
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
    console.log('Brevo SMTP Transporter configured.');
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Fallback to Gmail (works locally, blocked on cloud hosting)
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
    });
    console.log('Gmail SMTP Transporter configured (fallback).');
} else {
    console.log('Email credentials not found in .env');
}

async function sendNotification(to, subject, text) {
  if (!transporter) {
    throw new Error('Email transporter is not configured. Please check your .env credentials.');
  }
  const fromAddress = process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN;
  const info = await transporter.sendMail({
      from: `"Style Corner" <${fromAddress}>`,
      to: to,
      subject: subject,
      text: text
  });
  console.log('Email successfully sent to:', to);
  return info;
}

async function sendNotificationSafe(to, subject, text) {
  try {
    await sendNotification(to, subject, text);
  } catch (err) {
    console.error('Non-blocking notification email failed to send:', err.message);
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
    
    // Send OTP Email in the background so it doesn't block the UI
    sendNotification(
      savedUser.email,
      "Style Corner - Verify Your Account",
      `Hi ${savedUser.firstname},\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.`
    )
    .then(info => {
      console.log('✅ OTP e‑mail sent:', info.messageId);
    })
    .catch(async (mailError) => {
      console.error('❌ Mail delivery failed during registration (background):', mailError);
      await User.findByIdAndDelete(savedUser._id);
    });
    
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
      // Generate and send a new OTP for unverified users (useful for older accounts or resending)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otpCode;
      user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      
      sendNotificationSafe(
        user.email,
        "Style Corner - Verify Your Account",
        `Hi ${user.firstname},\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.`
      );

      return res.status(403).json({ error: 'unverified', message: 'Please verify your email address before logging in. A new verification code has been sent.', email: user.email });
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

// AI Specialist Matcher Route
app.post('/api/ai/match-specialist', async (req, res) => {
  try {
    const { requestText = '', preferredService = '' } = req.body;
    let staffMembers = [];

    try {
      staffMembers = await User.find({ role: 'staff' });
    } catch (e) {
      console.log('MongoDB staff query fallback');
    }

    if (!staffMembers || staffMembers.length === 0) {
      staffMembers = [
        { firstname: 'Julian', lastname: 'Reed', specialties: ['Hair Cut Services', 'Barbering'] },
        { firstname: 'Elena', lastname: 'Thorne', specialties: ['Hair Braiding Services', 'Wig Installation'] },
        { firstname: 'Marcus', lastname: 'Grey', specialties: ['Nails', 'Lash & Nails Combo', 'Pedicure'] }
      ];
    }

    const query = (requestText + ' ' + preferredService).toLowerCase();

    // Intelligent score & rationale calculator
    let bestMatch = null;
    let maxScore = -1;

    staffMembers.forEach(staff => {
      let score = 75; // baseline match score
      const specs = (staff.services || staff.specialties || []).map(s => String(s).toLowerCase());
      
      specs.forEach(s => {
        if (query.includes(s) || s.split(' ').some(w => w.length > 3 && query.includes(w))) {
          score += 20;
        }
      });

      if (query.includes('cut') || query.includes('fade') || query.includes('barber') || query.includes('trim')) {
        if (specs.some(s => s.includes('cut') || s.includes('barber'))) score += 15;
      }
      if (query.includes('braid') || query.includes('twist') || query.includes('cornrow') || query.includes('locs')) {
        if (specs.some(s => s.includes('braid'))) score += 15;
      }
      if (query.includes('nail') || query.includes('acrylic') || query.includes('gel') || query.includes('manicure') || query.includes('pedicure')) {
        if (specs.some(s => s.includes('nail') || s.includes('pedicure') || s.includes('manicure'))) score += 15;
      }
      if (query.includes('wig') || query.includes('lace') || query.includes('weave')) {
        if (specs.some(s => s.includes('wig'))) score += 15;
      }

      // Add a small deterministic hash factor
      score = Math.min(99, score + (staff.firstname.length % 4));

      if (score > maxScore) {
        maxScore = score;
        bestMatch = staff;
      }
    });

    if (!bestMatch) bestMatch = staffMembers[0];

    const specsList = (bestMatch.services || bestMatch.specialties || ['General Styling']);
    const specsDisplay = Array.isArray(specsList) ? specsList.join(', ') : String(specsList);

    const rationale = `${bestMatch.firstname} ${bestMatch.lastname || ''} is your top-rated match based on expertise in ${specsDisplay}. High precision satisfaction rating with custom client requests.`;

    res.status(200).json({
      match: {
        firstname: bestMatch.firstname,
        lastname: bestMatch.lastname || '',
        name: `${bestMatch.firstname} ${bestMatch.lastname || ''}`.trim(),
        specialties: specsList,
        matchScore: maxScore,
        rationale: rationale
      }
    });
  } catch (error) {
    console.error('AI Matcher Error:', error);
    res.status(500).json({ error: 'AI Specialist Matcher temporary error' });
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
    await sendNotificationSafe(savedBooking.clientEmail, "Booking Confirmed", `Hi ${savedBooking.clientName},\n\nYour booking for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time} has been received.`);
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
      await sendNotificationSafe(updated.clientEmail, "Booking Accepted!", `Hi ${updated.clientName},\n\nGreat news! Your booking has been accepted by our staff. See you then!`);
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
    await sendNotificationSafe(savedOrder.email || "customer@example.com", "Order Received", `Thank you for your order! Order #${savedOrder.id} for ${savedOrder.item} has been placed.`);
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
      await sendNotificationSafe(updated.email || "customer@example.com", "Order Shipped!", `Good news! Order #${updated.id} for ${updated.item} has been shipped to ${updated.address}.`);
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (host: 0.0.0.0)`);
});
