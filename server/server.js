const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
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
    const { firstname, lastname, phone, avatarUrl } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { firstname, lastname, phone, avatarUrl } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (error) {
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
        { firstname: 'Julian', lastname: 'Reed', specialties: ['Precision Skin Fade & Cut', 'Beard Trim & Sculpting', 'Barbering'] },
        { firstname: 'Elena', lastname: 'Thorne', specialties: ['Knotless Box Braids', 'Cornrows & Custom Pattern', 'Wig Installation'] },
        { firstname: 'Marcus', lastname: 'Grey', specialties: ['Full Gel Nail Architecture', 'Luxury Pedicure Session', 'Full Atelier Grooming Combo'] }
      ];
    }

    const query = (requestText + ' ' + primaryService + ' ' + secondaryService).toLowerCase();

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

    const specsList = (bestMatch.services || bestMatch.specialties || ['General Styling']);
    const specsDisplay = Array.isArray(specsList) ? specsList.join(', ') : String(specsList);

    const rationale = `${bestMatch.firstname} ${bestMatch.lastname || ''} is your top match based on expertise in ${specsDisplay}. Ideal match for ${primaryService || 'your requested style'}${secondaryService ? ' + ' + secondaryService : ''}.`;

    res.status(200).json({
      match: {
        firstname: bestMatch.firstname,
        lastname: bestMatch.lastname || '',
        name: `${bestMatch.firstname} ${bestMatch.lastname || ''}`.trim(),
        specialties: specsList,
        primaryService: primaryService || 'Precision Skin Fade & Cut',
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
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (req.body.status === 'accepted') {
      await sendNotificationSafe(updated.clientEmail, "Booking Accepted!", `Hi ${updated.clientName},\n\nGreat news! Your booking for ${updated.service} on ${updated.date} at ${updated.time} has been accepted by your expert!`);
    } else if (req.body.status === 'completed') {
      await sendNotificationSafe(updated.clientEmail, "Service Completed!", `Hi ${updated.clientName},\n\nYour scheduled services have been rendered. Thanks for using Style Corner!`);
    } else if (req.body.status === 'rejected') {
      await sendNotificationSafe(updated.clientEmail, "Booking Request Update", `Hi ${updated.clientName},\n\nYour request was rejected. Try booking again with another specialist.`);
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
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
      email: userEmail
    };
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // 1. Send confirmation to Customer
    await sendNotificationSafe(savedOrder.email, "Order Received", `Thank you for your order! Order #${savedOrder._id} for ${savedOrder.item} has been placed.`);
    
    // 2. Send instant alert email to Store Admin / Manager
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN;
    if (adminEmail && adminEmail !== savedOrder.email) {
      await sendNotificationSafe(
        adminEmail,
        `📦 New Store Order Alert: Order #${savedOrder._id}`,
        `ADMIN NOTIFICATION\n\nA new order has been placed on the Atelier Store!\n\nOrder Details:\n- Order ID: #${savedOrder._id}\n- Items: ${savedOrder.item}\n- Customer: ${savedOrder.name || 'Customer'} (${savedOrder.email})\n- Phone: ${savedOrder.phone || 'N/A'}\n- Delivery Address: ${savedOrder.address || 'N/A'}\n- Total Price: $${savedOrder.totalPrice || savedOrder.price}`
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
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (req.body.status === 'shipped') {
      await sendNotificationSafe(updated.email || "customer@example.com", "Order Shipped!", `Good news! Order #${updated.id} for ${updated.item} has been shipped to ${updated.address}.`);
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Serve dist directory if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Catch-all Route for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
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

