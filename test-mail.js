require('dotenv').config({ path: './server/.env' });
const nodemailer = require('nodemailer');

// Build transporter using Brevo variables (same logic as server.js)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: `"Style Corner" <${process.env.BREVO_SMTP_LOGIN}>`,
      to: process.env.EMAIL_USER, // send to your own Gmail address defined in .env
      subject: 'Brevo test email from Style Corner',
      text: 'If you see this, the SMTP config works.',
    });
    console.log('✅ Test email sent. Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Test email failed:', err);
  }
}

sendTest();
