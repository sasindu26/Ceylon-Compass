const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("✗ Email transporter configuration error:", error);
  } else {
    console.log("✓ Email transporter is ready to send emails");
  }
});

// 1. Welcome Email - New User Registration
const sendWelcomeEmail = async (userEmail, userName, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🎉 Welcome to Ceylon Compass!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 2em; }
            .content { background: #ffffff; padding: 40px 30px; }
            .welcome-box { background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066FF; margin: 20px 0; }
            .feature-list { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .feature-item:last-child { border-bottom: none; }
            .feature-icon { display: inline-block; width: 30px; text-align: center; font-size: 1.2em; }
            .button { display: inline-block; padding: 15px 40px; background: #0066FF; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
            .social-links { margin: 20px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #0066FF; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌴 Welcome to Ceylon Compass!</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.1em;">Your Gateway to Sri Lanka</p>
            </div>

            <div class="content">
              <h2>Hello ${firstName || userName}! 👋</h2>

              <div class="welcome-box">
                <p style="margin: 0; font-size: 1.1em;">
                  <strong>Thank you for joining Ceylon Compass!</strong><br>
                  We're thrilled to have you as part of our community.
                </p>
              </div>

              <p>Ceylon Compass is your one-stop platform to discover amazing places, experiences, and accommodations across Sri Lanka.</p>

              <h3 style="color: #0066FF;">🎯 What You Can Do:</h3>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">🍽️</span>
                  <strong>Discover Restaurants</strong> - Find the best local and international cuisines
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎉</span>
                  <strong>Book Events</strong> - Get tickets to concerts, shows, and cultural events
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏠</span>
                  <strong>Find Accommodations</strong> - Browse hotels, guesthouses, and vacation rentals
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📝</span>
                  <strong>List Your Business</strong> - Share your restaurant, event, or property
                </div>
                <div class="feature-item">
                  <span class="feature-icon">💬</span>
                  <strong>Connect & Chat</strong> - Message hosts and event organizers directly
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}" class="button">
                  Start Exploring Now →
                </a>
              </div>

              <p style="margin-top: 30px;">
                <strong>Need Help?</strong><br>
                Our support team is here to assist you. Feel free to reach out at
                <a href="mailto:${process.env.EMAIL_USER}" style="color: #0066FF;">${process.env.EMAIL_USER}</a>
              </p>
            </div>

            <div class="footer">
              <p><strong>Ceylon Compass</strong></p>
              <p>Discover Sri Lanka Like Never Before</p>
              <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Instagram</a> |
                <a href="#">Twitter</a>
              </div>
              <p style="font-size: 0.8em; color: #999; margin-top: 20px;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Welcome email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending welcome email:", error);
    return false;
  }
};

// 2. Password Reset Email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🔐 Password Reset Request - Ceylon Compass",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 15px 40px; background: #0066FF; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .token-box { background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 1.1em; text-align: center; margin: 20px 0; word-break: break-all; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
            .security-notice { background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>

            <div class="content">
              <h2>Hello ${userName},</h2>

              <div class="alert-box">
                <p style="margin: 0;">
                  <strong>⚠️ We received a request to reset your password.</strong>
                </p>
              </div>

              <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>

              <p style="color: #666; font-size: 0.9em;">
                Or copy and paste this link into your browser:
              </p>
              <div class="token-box">
                ${resetUrl}
              </div>

              <div class="security-notice">
                <p style="margin: 0;"><strong>🛡️ Security Notice:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>If you didn't request this password reset, please ignore this email.</li>
                  <li>Your password will remain unchanged.</li>
                  <li>Never share this link with anyone.</li>
                  <li>This link expires in 1 hour for your security.</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">
                If you're having trouble clicking the button, you can also reset your password by visiting your profile settings.
              </p>
            </div>

            <div class="footer">
              <p><strong>Ceylon Compass Security Team</strong></p>
              <p>If you need assistance, contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0066FF;">${process.env.EMAIL_USER}</a></p>
              <p style="font-size: 0.8em; color: #999; margin-top: 20px;">
                This is an automated security email. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Password reset email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending password reset email:", error);
    return false;
  }
};

// 3. Event Submission Confirmation Email
const sendEventSubmissionEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "📝 Event Submission Received - Ceylon Compass",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .info-box { background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066FF; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Event Submitted Successfully!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for submitting your event to Ceylon Compass!</p>

              <div class="info-box">
                <p style="margin: 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="margin: 10px 0 0 0;"><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending Review</span></p>
              </div>

              <p>Your event submission has been received and is now under review by our team. We typically review submissions within 24-48 hours.</p>

              <h3>What Happens Next?</h3>
              <ol>
                <li>Our team will review your event details</li>
                <li>We'll verify the information provided</li>
                <li>You'll receive an email once the review is complete</li>
                <li>If approved, your event will be published on our platform</li>
              </ol>

              <p>You can track the status of your submission by visiting the <strong>"My Listings"</strong> section in your profile.</p>

              <p style="margin-top: 30px;">Thank you for contributing to Ceylon Compass!</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
              <p>Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0066FF;">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Event submission email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending event submission email:", error);
    return false;
  }
};

// 4. Event Approved Email
const sendEventApprovedEmail = async (
  userEmail,
  userName,
  eventTitle,
  eventId,
) => {
  try {
    const eventUrl = `${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/events/${eventId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🎉 Your Event Has Been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .success-box { background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; text-align: center; }
            .button { display: inline-block; padding: 15px 40px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p style="font-size: 1.2em; margin: 10px 0 0 0;">Your Event is Now Live!</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>

              <div class="success-box">
                <h3 style="color: #28a745; margin: 0;">✅ ${eventTitle}</h3>
                <p style="margin: 10px 0 0 0; font-size: 1.1em;">Status: <strong>APPROVED</strong></p>
              </div>

              <p>Great news! Your event has been approved and is now published on Ceylon Compass. Users can now discover and book tickets for your event!</p>

              <h3>Next Steps:</h3>
              <ul>
                <li>📊 Monitor bookings in your dashboard</li>
                <li>💬 Respond to user inquiries promptly</li>
                <li>📧 Check your email for booking notifications</li>
                <li>📱 Share your event link on social media</li>
              </ul>

              <div style="text-align: center;">
                <a href="${eventUrl}" class="button">View Your Event →</a>
              </div>

              <p style="margin-top: 30px;">Thank you for making Ceylon Compass a vibrant community!</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
              <p>Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0066FF;">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Event approval email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending event approval email:", error);
    return false;
  }
};

// 5. Event Rejected Email
const sendEventRejectedEmail = async (
  userEmail,
  userName,
  eventTitle,
  reason,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "❌ Event Submission Update - Ceylon Compass",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .reject-box { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .reason-box { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 15px 40px; background: #0066FF; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Submission Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>

              <div class="reject-box">
                <p style="margin: 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="margin: 10px 0 0 0;"><strong>Status:</strong> <span style="color: #dc3545;">❌ Not Approved</span></p>
              </div>

              <p>Thank you for your submission. Unfortunately, we cannot approve your event at this time.</p>

              ${
                reason
                  ? `
              <div class="reason-box">
                <p style="margin: 0;"><strong>Reason:</strong></p>
                <p style="margin: 10px 0 0 0;">${reason}</p>
              </div>
              `
                  : ""
              }

              <h3>What You Can Do:</h3>
              <ul>
                <li>Review our event submission guidelines</li>
                <li>Make necessary corrections to your event details</li>
                <li>Resubmit your event with updated information</li>
                <li>Contact our support team for clarification</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/events/add" class="button">Submit New Event</a>
              </div>

              <p style="margin-top: 30px;">We appreciate your interest in contributing to Ceylon Compass. If you have questions, please don't hesitate to reach out.</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
              <p>Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0066FF;">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Event rejection email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending event rejection email:", error);
    return false;
  }
};

// 6. Restaurant Submission Confirmation
const sendRestaurantSubmissionEmail = async (
  userEmail,
  userName,
  restaurantName,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🍽️ Restaurant Submission Received - Ceylon Compass",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .info-box { background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Restaurant Submitted!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for adding your restaurant to Ceylon Compass!</p>

              <div class="info-box">
                <p style="margin: 0;"><strong>Restaurant:</strong> ${restaurantName}</p>
                <p style="margin: 10px 0 0 0;"><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending Review</span></p>
              </div>

              <p>Your restaurant submission is now being reviewed by our team. We'll notify you once the review is complete.</p>

              <p>Track your submission status in the <strong>"My Listings"</strong> section of your profile.</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Restaurant submission email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending restaurant submission email:", error);
    return false;
  }
};

// 7. Restaurant Approved Email
const sendRestaurantApprovedEmail = async (
  userEmail,
  userName,
  restaurantName,
  restaurantId,
) => {
  try {
    const restaurantUrl = `${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/restaurants/${restaurantId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "✅ Your Restaurant Has Been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .success-box { background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; text-align: center; }
            .button { display: inline-block; padding: 15px 40px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p style="font-size: 1.2em; margin: 10px 0 0 0;">Your Restaurant is Now Listed!</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>

              <div class="success-box">
                <h3 style="color: #28a745; margin: 0;">✅ ${restaurantName}</h3>
                <p style="margin: 10px 0 0 0; font-size: 1.1em;">Status: <strong>APPROVED</strong></p>
              </div>

              <p>Excellent news! Your restaurant has been approved and is now visible on Ceylon Compass. Food lovers can now discover your restaurant!</p>

              <div style="text-align: center;">
                <a href="${restaurantUrl}" class="button">View Your Restaurant →</a>
              </div>

              <p style="margin-top: 30px;">Share your listing on social media to attract more customers!</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Restaurant approval email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending restaurant approval email:", error);
    return false;
  }
};

// 8. Accommodation Submission Confirmation
const sendAccommodationSubmissionEmail = async (
  userEmail,
  userName,
  accommodationName,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🏠 Accommodation Submission Received - Ceylon Compass",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .info-box { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Accommodation Submitted!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for listing your accommodation on Ceylon Compass!</p>

              <div class="info-box">
                <p style="margin: 0;"><strong>Property:</strong> ${accommodationName}</p>
                <p style="margin: 10px 0 0 0;"><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending Review</span></p>
              </div>

              <p>Your accommodation listing is now being reviewed by our team. We'll notify you once the review is complete.</p>

              <p>Track your submission status in the <strong>"My Listings"</strong> section of your profile.</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Accommodation submission email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending accommodation submission email:", error);
    return false;
  }
};

// 9. Accommodation Approved Email
const sendAccommodationApprovedEmail = async (
  userEmail,
  userName,
  accommodationName,
  accommodationId,
) => {
  try {
    const accommodationUrl = `${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/accommodations/${accommodationId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "✅ Your Accommodation Has Been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .success-box { background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; text-align: center; }
            .button { display: inline-block; padding: 15px 40px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p style="font-size: 1.2em; margin: 10px 0 0 0;">Your Accommodation is Now Listed!</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>

              <div class="success-box">
                <h3 style="color: #28a745; margin: 0;">✅ ${accommodationName}</h3>
                <p style="margin: 10px 0 0 0; font-size: 1.1em;">Status: <strong>APPROVED</strong></p>
              </div>

              <p>Great news! Your accommodation has been approved and is now visible on Ceylon Compass. Travelers can now discover and book your property!</p>

              <div style="text-align: center;">
                <a href="${accommodationUrl}" class="button">View Your Listing →</a>
              </div>

              <p style="margin-top: 30px;">Share your listing to attract more guests!</p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Accommodation approval email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending accommodation approval email:", error);
    return false;
  }
};

// 10. New Message Notification Email
const sendNewMessageEmail = async (
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
) => {
  try {
    const messagesUrl = `${process.env.FRONTEND_URL || "https://ceylon-compass.vercel.app"}/profile?tab=messages`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `💬 New Message from ${senderName} - Ceylon Compass`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { background: #ffffff; padding: 40px 30px; }
            .message-box { background: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; font-style: italic; }
            .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message!</h1>
            </div>
            <div class="content">
              <h2>Hello ${recipientName},</h2>

              <p>You have received a new message from <strong>${senderName}</strong> on Ceylon Compass.</p>

              <div class="message-box">
                <p style="margin: 0;">${messagePreview}...</p>
              </div>

              <div style="text-align: center;">
                <a href="${messagesUrl}" class="button">Read Message →</a>
              </div>

              <p style="margin-top: 30px; color: #666;">
                💡 Tip: Reply quickly to maintain good communication with your guests and hosts!
              </p>
            </div>
            <div class="footer">
              <p><strong>Ceylon Compass</strong></p>
              <p style="font-size: 0.8em; color: #999;">
                You're receiving this email because you have messages enabled. You can manage your notification preferences in your profile settings.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ New message notification email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending message notification email:", error);
    return false;
  }
};

// 11. Booking Confirmation Email
const sendBookingConfirmationEmail = async (booking, event, user) => {
  try {
    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `🎫 Booking Confirmation - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { background: #ffffff; padding: 30px; }
            .ticket-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px dashed #0066FF; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #666; }
            .value { color: #0066FF; font-weight: 600; }
            .total { font-size: 1.3em; font-weight: 700; color: #0066FF; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p style="margin: 5px 0 0 0;">Your tickets are ready!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName} ${user.lastName},</h2>
              <p>Your booking has been successfully confirmed!</p>

              <div class="ticket-details">
                <h3 style="color: #0066FF; margin-top: 0; text-align: center;">${event.title}</h3>

                <div class="detail-row">
                  <span class="label">📌 Booking ID:</span>
                  <span class="value">${booking._id}</span>
                </div>

                <div class="detail-row">
                  <span class="label">📅 Date:</span>
                  <span class="value">${eventDate}</span>
                </div>

                <div class="detail-row">
                  <span class="label">🕐 Time:</span>
                  <span class="value">${event.time}</span>
                </div>

                <div class="detail-row">
                  <span class="label">📍 Location:</span>
                  <span class="value">${event.address}</span>
                </div>

                <div class="detail-row">
                  <span class="label">🎫 Ticket Type:</span>
                  <span class="value">${booking.ticketType}</span>
                </div>

                <div class="detail-row">
                  <span class="label">🔢 Quantity:</span>
                  <span class="value">${booking.quantity}</span>
                </div>

                ${
                  booking.seatNumbers && booking.seatNumbers.length > 0
                    ? `
                <div class="detail-row">
                  <span class="label">💺 Seats:</span>
                  <span class="value">${booking.seatNumbers.join(", ")}</span>
                </div>
                `
                    : ""
                }

                <div class="detail-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #0066FF;">
                  <span class="label" style="font-size: 1.1em;">💰 Total Paid:</span>
                  <span class="total">LKR ${booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <h3>📋 Important Information:</h3>
              <ul style="line-height: 1.8;">
                <li>✅ Please bring a valid ID to the event</li>
                <li>⏰ Arrive at least 30 minutes before the event starts</li>
                <li>📧 This email serves as your booking confirmation</li>
                <li>👤 Check "My Bookings" in your profile for details</li>
              </ul>

              <h3>📞 Event Organizer Contact:</h3>
              <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                <strong>Name:</strong> ${event.organizer.name}<br>
                <strong>Email:</strong> ${event.organizer.email}<br>
                <strong>Phone:</strong> ${event.organizer.contactNumber}
              </p>

              <p style="text-align: center; margin-top: 30px;">
                <strong>Enjoy the event! 🎊</strong>
              </p>
            </div>

            <div class="footer">
              <p><strong>Ceylon Compass</strong></p>
              <p>Your Gateway to Amazing Experiences</p>
              <p style="font-size: 0.8em; color: #999; margin-top: 15px;">
                This is an automated confirmation email. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "✓ Booking confirmation email sent successfully to:",
      user.email,
    );
    return true;
  } catch (error) {
    console.error("✗ Error sending booking confirmation email:", error);
    return false;
  }
};

// 12. Contact Form Submission Email
const sendContactFormEmail = async (formData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Admin email
      subject: `📧 New Contact Form Submission from ${formData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #0066FF; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .field { margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
            .label { font-weight: 600; color: #666; }
            .value { color: #333; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${formData.email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${formData.phone || "Not provided"}</div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${formData.subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${formData.message}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Contact form email sent successfully");
    return true;
  } catch (error) {
    console.error("✗ Error sending contact form email:", error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEventSubmissionEmail,
  sendEventApprovedEmail,
  sendEventRejectedEmail,
  sendRestaurantSubmissionEmail,
  sendRestaurantApprovedEmail,
  sendAccommodationSubmissionEmail,
  sendAccommodationApprovedEmail,
  sendNewMessageEmail,
  sendBookingConfirmationEmail,
  sendContactFormEmail,
};
