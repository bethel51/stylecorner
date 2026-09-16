import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: './server/.env' });

console.log('Testing Brevo SMTP Configuration (Primary Provider)...');
console.log('EMAIL_USER (Sender/Admin):', process.env.EMAIL_USER);
console.log('BREVO_SMTP_HOST:', process.env.BREVO_SMTP_HOST);
console.log('BREVO_SMTP_LOGIN:', process.env.BREVO_SMTP_LOGIN);

const senderEmail = process.env.EMAIL_SENDER || process.env.EMAIL_USER || 'support@stylecorner.com';

async function testBrevo() {
  if (!process.env.BREVO_SMTP_HOST || !process.env.BREVO_SMTP_KEY) {
    console.error('\n❌ Brevo SMTP credentials not found in server/.env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
    secure: parseInt(process.env.BREVO_SMTP_PORT) === 465,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Style Corner" <${senderEmail}>`,
      to: process.env.EMAIL_USER,
      subject: 'Style Corner - Brevo Verification Test',
      text: 'Congratulations! Brevo SMTP is fully configured and delivering emails successfully.',
    });
    console.log('\n✅ Brevo email delivered successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Sent to: ${process.env.EMAIL_USER}`);
  } catch (err) {
    console.error('\n❌ Brevo delivery failed:', err.message);
  }
}

testBrevo();
