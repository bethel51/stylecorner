/**
 * Style Corner Luxury Email Template System
 * Responsive, bulletproof HTML email templates designed with an Atelier Champagne-Gold aesthetic.
 * Fully compatible with Gmail, Apple Mail, Outlook, Android, and iOS mail clients.
 */

const APP_URL = process.env.CLIENT_URL || 'https://stylecorner.onrender.com';

/**
 * Base Email Layout Wrapper
 */
function buildBaseEmailLayout({
  badge = 'ATELIER NOTIFICATION',
  title = 'Notification',
  subtitle = '',
  contentHtml = '',
  ctaText = '',
  ctaUrl = '',
  footerNote = 'You received this notification because your account is registered on Style Corner Atelier.',
}) {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #0c0e14;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }
    img {
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
    }
    a {
      text-decoration: none;
    }
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: auto !important;
        padding: 12px !important;
      }
      .stack-column {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        direction: ltr !important;
      }
    }
  </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #0c0e14;">
  <center style="width: 100%; background-color: #0c0e14; padding: 24px 0;">
    
    <!-- Visually Hidden Preheader -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      ${subtitle || title} — Style Corner Atelier
    </div>

    <!-- Main Container Table -->
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto;" class="email-container">
      
      <!-- HEADER LOGO BANNER -->
      <tr>
        <td style="padding: 24px 20px 18px; text-align: center;">
          <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="text-align: center;">
                <div style="display: inline-block; padding: 6px 14px; background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 50px; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 800; color: #f5b942; letter-spacing: 2px; text-transform: uppercase;">
                    STYLE CORNER
                  </span>
                </div>
                <div style="font-size: 10px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">
                  HAIR & GROOMING ATELIER
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- MAIN CONTENT CARD -->
      <tr>
        <td style="background-color: #151822; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 36px 32px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.65);">
          
          <!-- Badge -->
          ${badge ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
            <tr>
              <td style="background: rgba(245, 185, 66, 0.12); border: 1px solid rgba(245, 185, 66, 0.35); border-radius: 50px; padding: 4px 14px;">
                <span style="font-size: 11px; font-weight: 800; color: #f5b942; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                  ${badge}
                </span>
              </td>
            </tr>
          </table>` : ''}

          <!-- Headline -->
          <h1 style="margin: 0 0 8px 0; font-size: 24px; line-height: 1.3; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
            ${title}
          </h1>

          <!-- Subtitle / Meta -->
          ${subtitle ? `
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #94a3b8;">
            ${subtitle}
          </p>` : '<div style="height: 16px;"></div>'}

          <!-- Dynamic Content Body -->
          <div style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
            ${contentHtml}
          </div>

          <!-- Call to Action Button -->
          ${ctaText && ctaUrl ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px; width: 100%;">
            <tr>
              <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius: 12px; background: linear-gradient(135deg, #f5b942 0%, #c99326 100%); text-align: center;">
                      <a href="${ctaUrl}" target="_blank" style="background: linear-gradient(135deg, #f5b942 0%, #c99326 100%); border: 1px solid #f5b942; font-size: 14px; font-weight: 800; font-family: sans-serif; text-decoration: none; padding: 14px 32px; color: #0c0e14; border-radius: 12px; display: inline-block; letter-spacing: 0.02em;">
                        ${ctaText} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>` : ''}

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding: 28px 20px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #64748b;">
            ${footerNote}
          </p>
          <p style="margin: 0 0 12px; font-size: 12px; color: #64748b;">
            Style Corner Atelier &bull; Victoria Island, Lagos, Nigeria
          </p>
          <div style="font-size: 11px; color: #475569;">
            &copy; ${currentYear} Style Corner. All rights reserved. &bull; <a href="${APP_URL}/policies" style="color: #94a3b8; text-decoration: underline;">Privacy & Terms</a>
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}

/**
 * 1. Account Registration / Verification OTP Email
 */
function getVerificationOtpEmail({ firstname = 'Valued Member', otpCode, expiresMinutes = 15 }) {
  const contentHtml = `
    <p style="margin: 0 0 18px;">
      Hello <strong style="color: #ffffff;">${firstname}</strong>,
    </p>
    <p style="margin: 0 0 22px;">
      Welcome to <strong>Style Corner Atelier</strong>. To secure your account and verify your email address, please use the 6-digit verification code below:
    </p>

    <!-- OTP DISPLAY BOX -->
    <div style="background: rgba(245, 185, 66, 0.06); border: 1.5px dashed rgba(245, 185, 66, 0.45); border-radius: 14px; padding: 22px 16px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
        One-Time Verification Code
      </div>
      <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f5b942; font-family: monospace, sans-serif;">
        ${otpCode}
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
        Expires in <strong>${expiresMinutes} minutes</strong>
      </div>
    </div>

    <p style="margin: 0 0 10px; font-size: 13px; color: #94a3b8;">
      &bull; Enter this code on the verification screen to complete your registration.<br>
      &bull; If you did not create an account on Style Corner, please ignore this email.
    </p>
  `;

  return buildBaseEmailLayout({
    badge: 'Email Verification',
    title: 'Verify Your Style Corner Account',
    subtitle: 'Complete your profile setup to unlock luxury styling and bookings.',
    contentHtml,
    ctaText: 'Enter Verification Code',
    ctaUrl: `${APP_URL}/verify`,
    footerNote: 'Never share this code with anyone. Style Corner staff will never ask for your verification code.',
  });
}

/**
 * 2. Password Reset OTP Email
 */
function getPasswordResetOtpEmail({ firstname = 'Member', otpCode, expiresMinutes = 15 }) {
  const contentHtml = `
    <p style="margin: 0 0 18px;">
      Hello <strong style="color: #ffffff;">${firstname}</strong>,
    </p>
    <p style="margin: 0 0 22px;">
      We received a request to reset the password for your Style Corner account. Use the one-time code below to reset your password:
    </p>

    <div style="background: rgba(245, 185, 66, 0.06); border: 1.5px dashed rgba(245, 185, 66, 0.45); border-radius: 14px; padding: 22px 16px; text-align: center; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
        Password Reset Code
      </div>
      <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f5b942; font-family: monospace, sans-serif;">
        ${otpCode}
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
        Expires in <strong>${expiresMinutes} minutes</strong>
      </div>
    </div>

    <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 6px; padding: 12px 14px; margin-top: 20px;">
      <span style="font-size: 13px; color: #fca5a5;">
        <strong>Security Notice:</strong> If you did not request this password reset, your account is still secure. You can safely disregard this email.
      </span>
    </div>
  `;

  return buildBaseEmailLayout({
    badge: 'Security Alert',
    title: 'Password Reset Request',
    subtitle: 'Follow the instructions below to choose a new password.',
    contentHtml,
    ctaText: 'Reset Password',
    ctaUrl: `${APP_URL}/forgot-password`,
    footerNote: 'For security purposes, this password reset link will expire after 15 minutes.',
  });
}

/**
 * 3. Password Reset Success Confirmation
 */
function getPasswordResetSuccessEmail({ firstname = 'Member' }) {
  const contentHtml = `
    <p style="margin: 0 0 18px;">
      Hello <strong style="color: #ffffff;">${firstname}</strong>,
    </p>
    <p style="margin: 0 0 20px;">
      Your password for <strong>Style Corner</strong> has been successfully updated.
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; color: #94a3b8;">
      You can now log in using your new credentials. If you did not make this change, please contact our concierge support immediately.
    </p>
  `;

  return buildBaseEmailLayout({
    badge: 'Security Updated',
    title: 'Password Changed Successfully',
    subtitle: 'Your Atelier account is secure with your new credentials.',
    contentHtml,
    ctaText: 'Sign In to Your Account',
    ctaUrl: `${APP_URL}/login`,
  });
}

/**
 * 4. Booking Request Submitted (Client Confirmation)
 */
function getBookingCreatedEmail({
  clientName = 'Valued Client',
  stylistName = 'Specialist',
  serviceName = 'Atelier Service',
  date,
  time,
  price = 0,
}) {
  const formattedPrice = price ? `₦${Number(price).toLocaleString()}` : 'Custom Fee';

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Hi <strong style="color: #ffffff;">${clientName}</strong>,
    </p>
    <p style="margin: 0 0 22px;">
      Thank you for booking with Style Corner. Your appointment request has been submitted and is awaiting confirmation from your specialist.
    </p>

    <!-- RECEIPT CARD -->
    <div style="background: #10131b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #f5b942; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
        Appointment Summary
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Service:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Specialist:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${stylistName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Scheduled Date:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Time:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${time}</td>
        </tr>
        <tr style="border-top: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 800; font-size: 15px;">Estimated Fee:</td>
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 900; font-size: 18px; text-align: right;">${formattedPrice}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
      You will receive an instant notification as soon as <strong>${stylistName}</strong> accepts your request.
    </p>
  `;

  return buildBaseEmailLayout({
    badge: 'Booking Submitted',
    title: 'Appointment Request Received ✂️',
    subtitle: `${serviceName} with ${stylistName} on ${date}`,
    contentHtml,
    ctaText: 'View in Customer Dashboard',
    ctaUrl: `${APP_URL}/customer-dashboard`,
  });
}

/**
 * 5. Booking Alert for Specialist
 */
function getSpecialistBookingAlertEmail({
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  date,
  time,
  price = 0,
}) {
  const formattedPrice = price ? `₦${Number(price).toLocaleString()}` : 'Custom Fee';

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      You have a <strong style="color: #f5b942;">new booking request</strong> waiting for your review and acceptance!
    </p>

    <!-- RECEIPT CARD -->
    <div style="background: #10131b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #f5b942; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
        Client & Booking Details
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Client Name:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Phone:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${clientPhone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Email:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${clientEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Requested Service:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Scheduled For:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${date} at ${time}</td>
        </tr>
        <tr style="border-top: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 800; font-size: 15px;">Your Payout:</td>
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 900; font-size: 18px; text-align: right;">${formattedPrice}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
      Please open your Expert Dashboard to <strong>Accept</strong> or <strong>Decline</strong> this booking.
    </p>
  `;

  return buildBaseEmailLayout({
    badge: 'Action Required',
    title: `New Booking: ${clientName}`,
    subtitle: `Incoming appointment request for ${serviceName}`,
    contentHtml,
    ctaText: 'Accept or Decline Booking',
    ctaUrl: `${APP_URL}/expert-dashboard`,
  });
}

/**
 * 6. Booking Accepted (Client Notification)
 */
function getBookingAcceptedEmail({
  clientName = 'Client',
  stylistName = 'Your Specialist',
  serviceName,
  date,
  time,
}) {
  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Great news <strong style="color: #ffffff;">${clientName}</strong>!
    </p>
    <p style="margin: 0 0 20px;">
      Your specialist <strong style="color: #f5b942;">${stylistName}</strong> has officially <strong>ACCEPTED</strong> your appointment for <strong>${serviceName}</strong>.
    </p>

    <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
        Confirmed Appointment
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        ${date} &bull; ${time}
      </div>
      <div style="font-size: 14px; color: #cbd5e1;">
        ${serviceName} with ${stylistName}
      </div>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
      Please arrive 5–10 minutes early. If you need to make adjustments, you can view your appointment details or chat with your specialist via the Customer Dashboard.
    </p>
  `;

  return buildBaseEmailLayout({
    badge: 'Booking Accepted 🎉',
    title: 'Your Appointment is Confirmed!',
    subtitle: `${serviceName} with ${stylistName}`,
    contentHtml,
    ctaText: 'View Booking in Dashboard',
    ctaUrl: `${APP_URL}/customer-dashboard`,
  });
}

/**
 * 7. Store Order Received Confirmation
 */
function getStoreOrderEmail({
  clientName = 'Valued Customer',
  orderId,
  items,
  totalPrice = 0,
  deliveryAddress,
  phone,
  isAdmin = false,
}) {
  const formattedPrice = `₦${Number(totalPrice).toLocaleString()}`;
  const shortId = String(orderId).slice(-6).toUpperCase();

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      ${isAdmin ? `A new order has been placed on the Atelier Store!` : `Thank you for your order, <strong style="color: #ffffff;">${clientName}</strong>!`}
    </p>

    <!-- ORDER RECEIPT -->
    <div style="background: #10131b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #f5b942; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
        Order #${shortId}
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Items:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${items}</td>
        </tr>
        ${deliveryAddress ? `
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Delivery To:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${deliveryAddress}</td>
        </tr>` : ''}
        ${phone ? `
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Contact:</td>
          <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${phone}</td>
        </tr>` : ''}
        <tr style="border-top: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 800; font-size: 15px;">Total Paid:</td>
          <td style="padding: 12px 0 4px; color: #f5b942; font-weight: 900; font-size: 18px; text-align: right;">${formattedPrice}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
      ${isAdmin ? `Please prepare this order for fulfillment in the Admin Dashboard.` : `Our atelier team is packing your products. You can track delivery status live in your Customer Dashboard.`}
    </p>
  `;

  return buildBaseEmailLayout({
    badge: isAdmin ? 'Admin Alert' : 'Order Received 📦',
    title: isAdmin ? `New Store Order #${shortId}` : `Order #${shortId} Placed Successfully`,
    subtitle: `Total: ${formattedPrice} &bull; ${items}`,
    contentHtml,
    ctaText: isAdmin ? 'Manage Orders in Admin' : 'Track Order in Dashboard',
    ctaUrl: isAdmin ? `${APP_URL}/admin` : `${APP_URL}/customer-dashboard`,
  });
}

/**
 * 8. Automatic HTML Fallback for any Plain Text Email
 */
function generateAutoHtmlFallback(subject, text) {
  const paragraphs = (text || '')
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 16px; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return buildBaseEmailLayout({
    badge: 'Style Corner Atelier',
    title: subject,
    subtitle: '',
    contentHtml: paragraphs,
    ctaText: 'Visit Style Corner',
    ctaUrl: APP_URL,
  });
}

module.exports = {
  buildBaseEmailLayout,
  getVerificationOtpEmail,
  getPasswordResetOtpEmail,
  getPasswordResetSuccessEmail,
  getBookingCreatedEmail,
  getSpecialistBookingAlertEmail,
  getBookingAcceptedEmail,
  getStoreOrderEmail,
  generateAutoHtmlFallback,
};
