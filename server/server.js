const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Booking = require('./models/Booking');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const Notification = require('./models/Notification');
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

const createInAppNotification = async ({ userEmail, title, message, type = 'order', orderId, bookingId }) => {
  try {
    if (!userEmail) return null;
    const cleanEmail = userEmail.trim().toLowerCase();
    const notif = new Notification({
      userEmail: cleanEmail,
      title,
      message,
      type,
      orderId: orderId ? String(orderId) : undefined,
      bookingId: bookingId ? String(bookingId) : undefined,
    });
    return await notif.save();
  } catch (err) {
    console.error('In-app notification creation error:', err.message);
    return null;
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password || !firstname) {
      return res.status(400).json({ error: 'Firstname, email, and password are required.' });
    }
    
    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = new User({
      firstname: firstname.trim(),
      lastname: (lastname || '').trim(),
      email: cleanEmail,
      phone: (phone || '').trim(),
      password: hashedPassword,
      role: (role === 'staff' || role === 'expert') ? 'staff' : 'customer',
      specialties: services ? (Array.isArray(services) ? services : services.split(',').map(s => s.trim())) : [],
      isVerified: false,
      otpCode,
      otpExpiresAt
    });

    const savedUser = await user.save();
    
    // Send OTP Email safely without deleting the account if SMTP fails
    sendNotificationSafe(
      savedUser.email,
      "Style Corner - Verify Your Account",
      `Hi ${savedUser.firstname},\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.`
    );
    
    res.status(201).json({ message: 'Registration successful. Please verify your email.', email: savedUser.email });
  } catch (error) {
    console.error('Registration backend error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Verify OTP
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').toString().trim();
    
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: 'Account not found. Please register.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account is already verified. You can log in.' });

    if (user.otpCode !== cleanCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }
    
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
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
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

// Resend OTP Code
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account is already verified.' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendNotificationSafe(
      user.email,
      "Style Corner - Verification Code",
      `Hi ${user.firstname},\n\nYour new verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.`
    );

    res.status(200).json({ message: 'A new 6-digit verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to resend verification code' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    // Strict Role Enforcement
    if (role) {
      const expectedRole = (role === 'staff' || role === 'expert') ? 'staff' : 'customer';
      if (user.role !== expectedRole) {
        const message = expectedRole === 'staff'
          ? 'Access denied. This is a Customer account. Please select the Customer tab to sign in.'
          : 'Access denied. This is an Expert account. Please select the Expert tab to sign in.';
        return res.status(403).json({ error: message });
      }
    }

    if (!user.isVerified) {
      // Generate and send a new OTP for unverified users
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
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Request Password Reset OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendNotificationSafe(
      user.email,
      "Style Corner - Password Reset Code",
      `Hi ${user.firstname},\n\nYour password reset code is: ${otpCode}\n\nThis code will expire in 15 minutes.\nIf you did not request a password reset, please ignore this email.`
    );

    res.status(200).json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

// Verify Password Reset OTP
app.post('/api/auth/verify-reset-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) return res.status(400).json({ error: 'Email and OTP code are required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: 'User not found.' });

    if (!user.otpCode || user.otpCode !== otpCode.toString().trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// Complete Password Reset
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: 'User not found.' });

    if (!user.otpCode || user.otpCode !== otpCode.toString().trim()) {
      return res.status(400).json({ error: 'Invalid or expired verification session.' });
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please restart process.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    sendNotificationSafe(
      user.email,
      "Style Corner - Password Reset Successful",
      `Hi ${user.firstname},\n\nYour Style Corner account password has been successfully reset.\n\nYou can now log in using your new password.`
    );

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
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
    const { firstname, lastname, phone, avatarUrl, coverImage, title, bio, location, state, lga, street, houseNumber, address, services, specialties } = req.body;
    
    const updatePayload = {};
    if (firstname !== undefined) updatePayload.firstname = firstname;
    if (lastname !== undefined) updatePayload.lastname = lastname;
    if (phone !== undefined) updatePayload.phone = phone;
    if (avatarUrl !== undefined) updatePayload.avatarUrl = avatarUrl;
    if (coverImage !== undefined) updatePayload.coverImage = coverImage;
    if (title !== undefined) updatePayload.title = title;
    if (bio !== undefined) updatePayload.bio = bio;
    if (location !== undefined) updatePayload.location = location;
    if (state !== undefined) updatePayload.state = state;
    if (lga !== undefined) updatePayload.lga = lga;
    if (street !== undefined) updatePayload.street = street;
    if (houseNumber !== undefined) updatePayload.houseNumber = houseNumber;
    if (address !== undefined) updatePayload.address = address;
    if (services !== undefined) updatePayload.services = services;
    if (specialties !== undefined) updatePayload.specialties = specialties;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account permanently
app.delete('/api/users/account', authenticateToken, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    await Booking.deleteMany({
      $or: [
        { clientEmail: new RegExp('^' + userEmail + '$', 'i') },
        { user: req.user._id }
      ]
    });
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Admin: Get all registered users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Delete user account by ID
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const userEmail = (targetUser.email || '').trim().toLowerCase();
    await User.findByIdAndDelete(req.params.id);
    if (userEmail) {
      await Booking.deleteMany({ clientEmail: new RegExp('^' + userEmail + '$', 'i') });
    }

    console.log(`🗑️ Admin deleted user: ${targetUser.email} (${req.params.id})`);
    res.status(200).json({ message: 'User account permanently deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin Delete User by Email Utility
app.post('/api/admin/delete-user-by-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await User.deleteMany({ email: new RegExp('^' + cleanEmail + '$', 'i') });
    await Booking.deleteMany({ clientEmail: new RegExp('^' + cleanEmail + '$', 'i') });
    console.log(`🗑️ Admin deleted user account: ${cleanEmail}`);
    res.status(200).json({ message: `Deleted user matching ${cleanEmail}`, count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const { requestText = '', primaryService = '', secondaryService = '' } = req.body;
    let staffMembers = [];

    try {
      staffMembers = await User.find({ role: 'staff' });
    } catch (e) {
      console.log('MongoDB staff query fallback');
    }

    if (!staffMembers || staffMembers.length === 0) {
      staffMembers = [
        { firstname: 'Verified', lastname: 'Artisan', specialties: ['Precision Hair Styling', 'Bespoke Grooming', 'Scalp Architecture'] }
      ];
    }

    const query = (requestText + ' ' + primaryService + ' ' + secondaryService).toLowerCase();

    // Intelligent score & rationale calculator
    let bestMatch = null;
    let maxScore = -1;

    staffMembers.forEach(staff => {
      let score = 75; // baseline match score
      const rawSpecs = staff.services || staff.specialties || [];
      const specsNames = rawSpecs.map(s => {
        if (typeof s === 'string') return s;
        if (s && typeof s === 'object') return s.name || s.title || s.service || '';
        return String(s || '');
      }).filter(Boolean);

      const specs = specsNames.map(s => s.toLowerCase());
      
      specs.forEach(s => {
        if (query.includes(s) || s.split(' ').some(w => w.length > 3 && query.includes(w))) {
          score += 20;
        }
      });

      if (query.includes('cut') || query.includes('fade') || query.includes('barber') || query.includes('trim')) {
        if (specs.some(s => s.includes('cut') || s.includes('barber') || s.includes('fade'))) score += 15;
      }
      if (query.includes('braid') || query.includes('twist') || query.includes('cornrow') || query.includes('locs')) {
        if (specs.some(s => s.includes('braid') || s.includes('cornrow'))) score += 15;
      }
      if (query.includes('nail') || query.includes('acrylic') || query.includes('gel') || query.includes('manicure') || query.includes('pedicure')) {
        if (specs.some(s => s.includes('nail') || s.includes('pedicure') || s.includes('gel'))) score += 15;
      }

      score = Math.min(99, score + (staff.firstname.length % 4));

      if (score > maxScore) {
        maxScore = score;
        bestMatch = staff;
      }
    });

    if (!bestMatch) bestMatch = staffMembers[0];

    const rawList = (bestMatch.services && bestMatch.services.length > 0)
      ? bestMatch.services
      : (bestMatch.specialties && bestMatch.specialties.length > 0)
        ? bestMatch.specialties
        : ['General Styling'];

    const specsDisplay = rawList.map(s => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object') return s.name || s.title || s.service || '';
      return String(s || '');
    }).filter(Boolean).join(', ') || 'General Styling';

    const rationale = `${bestMatch.firstname} ${bestMatch.lastname || ''} is your top match based on expertise in ${specsDisplay}. Ideal match for ${primaryService || 'your requested style'}.`;

    res.status(200).json({
      match: {
        firstname: bestMatch.firstname,
        lastname: bestMatch.lastname || '',
        name: `${bestMatch.firstname} ${bestMatch.lastname || ''}`.trim(),
        specialties: specsDisplay,
        primaryService: primaryService || 'Precision Styling',
        secondaryService: secondaryService || '',
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
      const userEmail = (req.user.email || '').trim();
      query = { clientEmail: new RegExp('^' + userEmail + '$', 'i') };
    } else if (req.user.role === 'staff') {
      const staffName = (req.user.firstname || '').trim();
      query = {
        $or: [
          { status: 'pending' },
          { stylist: new RegExp(staffName, 'i') },
          { stylist: 'Any Specialist' },
        ],
      };
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
    // Prevent Double Booking Stylist for exact date and time
    if (req.body.stylist && req.body.stylist !== 'Any Specialist') {
      const existingStylistBooking = await Booking.findOne({
        stylist: req.body.stylist,
        date: req.body.date,
        time: req.body.time,
        status: { $in: ['pending', 'accepted'] }
      });
      if (existingStylistBooking) {
        return res.status(400).json({ error: 'This specialist is already booked for that specific date and time.' });
      }
    }

    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    
    // 1. Notify Customer
    await sendNotificationSafe(savedBooking.clientEmail, "Booking Confirmed", `Hi ${savedBooking.clientName},\n\nYour booking for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time} has been received.`);
    
    // 2. Notify Salon Admin / Manager
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN;
    if (adminEmail && adminEmail !== savedBooking.clientEmail) {
      await sendNotificationSafe(
        adminEmail,
        `🔔 New Salon Booking Alert: ${savedBooking.clientName}`,
        `ADMIN NOTIFICATION\n\nNew Booking Details:\n- Client: ${savedBooking.clientName} (${savedBooking.clientEmail})\n- Phone: ${savedBooking.clientPhone || 'N/A'}\n- Service: ${savedBooking.service}\n- Specialist: ${savedBooking.stylist}\n- Date & Time: ${savedBooking.date} at ${savedBooking.time}\n- Price: $${savedBooking.price}`
      );
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// Update a booking status
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const updateObj = typeof req.body === 'string' ? { status: req.body } : req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const newStatus = updateObj.status || updated.status;
    if (newStatus === 'confirmed' || newStatus === 'accepted') {
      if (updated.clientEmail) {
        await sendNotificationSafe(updated.clientEmail, "Booking Confirmed!", `Hi ${updated.clientName || 'Client'},\n\nGreat news! Your booking for ${updated.service} on ${updated.date} at ${updated.time} has been confirmed!`);
      }
    } else if (newStatus === 'completed') {
      if (updated.clientEmail) {
        await sendNotificationSafe(updated.clientEmail, "Service Completed!", `Hi ${updated.clientName || 'Client'},\n\nYour scheduled service (${updated.service}) has been completed. Thanks for choosing Style Corner!`);
      }
    } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
      if (updated.clientEmail) {
        await sendNotificationSafe(updated.clientEmail, "Booking Request Update", `Hi ${updated.clientName || 'Client'},\n\nYour booking request status has been updated to ${newStatus}.`);
      }
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Failed to update booking status:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Clear all booking history for logged in user
app.delete('/api/bookings/clear-history', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      const userEmail = (req.user.email || '').trim();
      query = { clientEmail: new RegExp('^' + userEmail + '$', 'i') };
    } else if (req.user.role === 'staff') {
      const staffName = (req.user.firstname || '').trim();
      query = {
        $or: [
          { stylist: new RegExp(staffName, 'i') },
          { staff: new RegExp(staffName, 'i') },
          { clientEmail: new RegExp('^' + (req.user.email || '').trim() + '$', 'i') }
        ]
      };
    }
    const result = await Booking.deleteMany(query);
    res.status(200).json({ message: 'Booking history cleared successfully', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Failed to clear booking history:', error);
    res.status(500).json({ error: 'Failed to clear booking history' });
  }
});

// Delete a booking by ID
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// ── Automated Appointment Day Reminder Function ──
const checkAndSendDayReminders = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookingsToday = await Booking.find({
      status: { $in: ['accepted', 'pending'] },
      reminderSent: { $ne: true }
    });

    for (const b of bookingsToday) {
      if (b.date && b.date.includes(todayStr)) {
        // 1. Send reminder to Customer
        await sendNotificationSafe(
          b.clientEmail,
          "Reminder: Your Style Session is Today! ✂️",
          `Hi ${b.clientName},\n\nThis is a friendly reminder from Style Corner that your styling visit for ${b.service} is scheduled for TODAY at ${b.time}.\n\nLocation: 12 Style Lane, Fashion District.\nWe look forward to giving you an exceptional experience!`
        );

        // 2. Send reminder to Expert / Technician
        if (b.stylist && b.stylist !== 'Any Specialist') {
          const staffUser = await User.findOne({ firstname: new RegExp(b.stylist, 'i'), role: 'staff' });
          if (staffUser && staffUser.email) {
            await sendNotificationSafe(
              staffUser.email,
              `Reminder: Client Appointment Today - ${b.clientName}`,
              `Hi ${staffUser.firstname},\n\nYou have an upcoming appointment scheduled for TODAY at ${b.time} with ${b.clientName} for ${b.service}. Please be ready!`
            );
          }
        }

        // Mark as reminded
        b.reminderSent = true;
        await b.save();
        console.log(`✅ Appointment reminder sent for ${b.clientName} (${b.service})`);
      }
    }
  } catch (err) {
    console.error('Error running appointment day reminders:', err);
  }
};

// Endpoint to manually or externally trigger day reminders
app.get('/api/cron/send-reminders', async (req, res) => {
  await checkAndSendDayReminders();
  res.status(200).json({ message: 'Appointment day reminders checked and sent.' });
});

// Run reminder check every hour
setInterval(checkAndSendDayReminders, 60 * 60 * 1000);

// Get all orders (Filtered by Role)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      const userEmail = (req.user.email || '').trim();
      query = { email: new RegExp('^' + userEmail + '$', 'i') };
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
    const userEmail = (req.body.email || req.user.email || '').trim();
    const orderData = {
      ...req.body,
      email: userEmail,
      status: req.body.status || 'processing',
      trackingStatus: req.body.trackingStatus || 'Order Placed'
    };
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // 1. Send confirmation to Customer
    await sendNotificationSafe(savedOrder.email, "Order Received", `Thank you for your order! Order #${savedOrder._id} for ${savedOrder.item} has been placed.`);
    
    // In-app notifications
    await createInAppNotification({
      userEmail: savedOrder.email,
      title: "Order Placed 📦",
      message: `Your order #${savedOrder._id.toString().slice(-6).toUpperCase()} for ${savedOrder.item} has been placed.`,
      type: 'order',
      orderId: savedOrder._id
    });
    await createInAppNotification({
      userEmail: 'admin@stylecorner.com',
      title: "New Store Order Alert 🛒",
      message: `Order #${savedOrder._id.toString().slice(-6).toUpperCase()} placed by ${savedOrder.name || savedOrder.email} (₦${Number(savedOrder.totalPrice || savedOrder.price || 0).toLocaleString()})`,
      type: 'order',
      orderId: savedOrder._id
    });

    // 2. Send instant alert email to Store Admin / Manager
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN;
    if (adminEmail && adminEmail !== savedOrder.email) {
      await sendNotificationSafe(
        adminEmail,
        `📦 New Store Order Alert: Order #${savedOrder._id}`,
        `ADMIN NOTIFICATION\n\nA new order has been placed on the Atelier Store!\n\nOrder Details:\n- Order ID: #${savedOrder._id}\n- Items: ${savedOrder.item}\n- Customer: ${savedOrder.name || 'Customer'} (${savedOrder.email})\n- Phone: ${savedOrder.phone || 'N/A'}\n- Delivery Address: ${savedOrder.address || 'N/A'}\n- Total Price: ₦${Number(savedOrder.totalPrice || savedOrder.price || 0).toLocaleString()}`
      );
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Update an order status
app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const updateObj = typeof req.body === 'string' ? { status: req.body } : req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const newStatus = updateObj.status || updated.status;
    if (updated.email) {
      await createInAppNotification({
        userEmail: updated.email,
        title: `Order Status: ${newStatus.toUpperCase()} 🚚`,
        message: `Order #${updated._id.toString().slice(-6).toUpperCase()} status changed to ${newStatus}`,
        type: 'order',
        orderId: updated._id
      });
    }

    if (newStatus === 'shipped') {
      const recipient = updated.email || updated.customerInfo?.email;
      if (recipient) {
        const itemNames = Array.isArray(updated.items)
          ? updated.items.map(i => i.name || i.title).join(', ')
          : (updated.items || 'your store items');
        await sendNotificationSafe(
          recipient,
          "Order Shipped! 📦",
          `Good news! Order #${updated._id} for ${itemNames} has been shipped to ${updated.address || updated.customerInfo?.address || 'your address'}.`
        );
      }
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update Order Tracking (Admin or System)
app.put('/api/orders/:id/tracking', authenticateToken, async (req, res) => {
  try {
    const { trackingStatus, trackingNumber, estimatedDelivery, status } = req.body;
    const updateFields = {};
    if (trackingStatus !== undefined) updateFields.trackingStatus = trackingStatus;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;
    if (estimatedDelivery !== undefined) updateFields.estimatedDelivery = estimatedDelivery;
    if (status !== undefined) updateFields.status = status;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

    // Send notification to customer if tracking status changes
    if (trackingStatus && updatedOrder.email) {
      await createInAppNotification({
        userEmail: updatedOrder.email,
        title: `Order Tracking Update 🚚`,
        message: `Order #${updatedOrder._id.toString().slice(-6).toUpperCase()} is now ${trackingStatus}. Est: ${updatedOrder.estimatedDelivery || 'Pending'}`,
        type: 'order',
        orderId: updatedOrder._id
      });

      await sendNotificationSafe(
        updatedOrder.email,
        `Order Tracking Update: Order #${updatedOrder._id}`,
        `Hi ${updatedOrder.name || 'Customer'},\n\nYour order #${updatedOrder._id} tracking status has been updated to: ${trackingStatus}.\n\nEstimated Delivery: ${updatedOrder.estimatedDelivery || 'Pending updates'}\nTracking Number: ${updatedOrder.trackingNumber || 'N/A'}`
      );
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Failed to update tracking info:', error);
    res.status(500).json({ error: 'Failed to update tracking information' });
  }
});

// Add a message to an Order conversation (Customer <-> Admin communication)
app.post('/api/orders/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isSenderAdmin = req.user.role === 'staff' || req.user.role === 'admin';
    const newMessage = {
      sender: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim() || req.user.email,
      senderRole: isSenderAdmin ? 'admin' : 'customer',
      text: text.trim(),
      createdAt: new Date()
    };

    order.messages.push(newMessage);
    await order.save();

    if (isSenderAdmin) {
      // Admin replied -> Notify Customer in-app & via email!
      await createInAppNotification({
        userEmail: order.email,
        title: `Admin Replied on Order #${order._id.toString().slice(-6).toUpperCase()} 💬`,
        message: `Admin: "${text.trim()}"`,
        type: 'message',
        orderId: order._id
      });
      await sendNotificationSafe(
        order.email,
        `Admin Replied to Order #${order._id}`,
        `Admin response:\n\n"${newMessage.text}"\n\nLog in to your Style Corner dashboard to view and reply.`
      );
    } else {
      // Customer sent message -> Notify Admin in-app & via email!
      await createInAppNotification({
        userEmail: 'admin@stylecorner.com',
        title: `Customer Message on Order #${order._id.toString().slice(-6).toUpperCase()} 💬`,
        message: `${newMessage.sender}: "${text.trim()}"`,
        type: 'message',
        orderId: order._id
      });
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN;
      if (adminEmail) {
        await sendNotificationSafe(
          adminEmail,
          `New Customer Message on Order #${order._id}`,
          `New message from ${newMessage.sender}:\n\n"${newMessage.text}"\n\nLog in to Admin Dashboard to reply.`
        );
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Failed to post message to order:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// --- NOTIFICATION ROUTES ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';
    const query = {
      $or: [
        { userEmail: new RegExp('^' + userEmail + '$', 'i') },
        ...(isAdmin ? [{ userEmail: 'admin@stylecorner.com' }, { userEmail: 'admin' }] : [])
      ]
    };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';
    await Notification.updateMany(
      {
        $or: [
          { userEmail: new RegExp('^' + userEmail + '$', 'i') },
          ...(isAdmin ? [{ userEmail: 'admin@stylecorner.com' }, { userEmail: 'admin' }] : [])
        ]
      },
      { $set: { read: true } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});


// --- PRODUCT ROUTES ---
const INITIAL_PRODUCTS = [
  {
    title: 'Atelier Gold Pomade',
    price: 28,
    rating: 4.9,
    desc: 'Medium-hold matte finish pomade infused with organic argan oil.',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Botanical Beard Elixir',
    price: 24,
    rating: 4.8,
    desc: 'Nourishing oil blend with jojoba and cedarwood fragrance.',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Sculpting Clay Wax',
    price: 26,
    rating: 4.9,
    desc: 'High-hold textured clay wax for textured crops and modern fades.',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Scalp Revitalizing Shampoo',
    price: 32,
    rating: 4.7,
    desc: 'Sulfate-free tea tree shampoo for deep scalp hydration.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Wooden Comb Set',
    price: 18,
    rating: 4.9,
    desc: 'Anti-static sandalwood comb set for precise hair and beard styling.',
    image: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Silk Edge Wrap Scarf',
    price: 15,
    rating: 5.0,
    desc: '100% mulberry silk wrap for protecting braid edges and locs.',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=80',
  },
];

// Fetch all products (seed default if empty)
app.get('/api/products', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let products = await Product.find({}).sort({ createdAt: -1 });
    if (products.length === 0) {
      products = await Product.insertMany(INITIAL_PRODUCTS);
    }
    res.status(200).json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (Admin)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { title, price, rating, desc, badge, image, secondaryImage } = req.body;
    if (!title || price === undefined || !image) {
      return res.status(400).json({ error: 'Title, price, and image URL are required.' });
    }
    const product = new Product({
      title,
      price: Number(price),
      rating: rating ? Number(rating) : 4.8,
      desc: desc || '',
      badge: badge || '',
      image,
      secondaryImage: secondaryImage || ''
    });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (Admin)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { title, price, rating, desc, badge, image, secondaryImage } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          price: Number(price),
          rating: rating ? Number(rating) : 4.8,
          desc: desc || '',
          badge: badge || '',
          image,
          secondaryImage: secondaryImage || ''
        }
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// AI Specialist Matcher Endpoint
app.post('/api/ai/match-specialist', async (req, res) => {
  try {
    const { query, service, location } = req.body;
    
    // Find verified staff users from MongoDB
    const staffMembers = await User.find({ role: 'staff' }).select('-password');

    if (staffMembers && staffMembers.length > 0) {
      // Find staff whose title/services match requested service
      const matched = staffMembers.find(s => {
        const titleStr = (s.title || '').toLowerCase();
        const servStr = Array.isArray(s.services) ? s.services.map(item => (item.name || item).toLowerCase()).join(' ') : '';
        const searchStr = (service || '').toLowerCase();
        return titleStr.includes(searchStr) || servStr.includes(searchStr);
      }) || staffMembers[0];

      const fullName = `${matched.firstname || ''} ${matched.lastname || ''}`.trim() || 'Verified Specialist';

      return res.status(200).json({
        match: {
          id: matched._id,
          name: fullName,
          role: matched.title || 'Certified Atelier Specialist',
          rating: 5.0,
          matchScore: 98,
          location: matched.location || location || 'Lagos, Nigeria',
          rationale: `Matched based on verified track record in ${service || 'styling'} with top client ratings and executive service standards.`,
          avatar: matched.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          primaryService: service || 'Hair Stylist (Braider)'
        }
      });
    }

    // Generic fallback if no staff members registered yet
    return res.status(200).json({
      match: {
        name: 'Style Corner Atelier Specialist',
        role: 'Verified Master Stylist',
        rating: 5.0,
        matchScore: 95,
        location: location || 'Lagos, Nigeria',
        rationale: `Matched based on your requested service (${service || 'beauty styling'}). Dedicated to bespoke client care and executive grooming.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        primaryService: service || 'Hair Stylist (Braider)'
      }
    });
  } catch (error) {
    console.error('AI match specialist error:', error);
    res.status(500).json({ error: 'Failed to match specialist' });
  }
});

// Delete product (Admin)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Serve dist directory if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Catch-all Route for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.startsWith('/assets') || req.path.endsWith('.js') || req.path.endsWith('.css')) {
    return res.status(404).send('Asset not found');
  }
  if (req.method !== 'GET') return next();

  const compiledIndex = path.join(distPath, 'index.html');
  if (require('fs').existsSync(compiledIndex)) {
    return res.sendFile(compiledIndex);
  }

  const rootIndex = path.join(__dirname, '../index.html');
  if (require('fs').existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }

  res.status(500).send('Application build in progress. Please refresh in a moment.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Style Corner server is live on port ${PORT}`);
});

