const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEventAcceptedEmail = async (userEmail, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Event Request Has Been Accepted!',
      html: `
        <h1>Congratulations!</h1>
        <p>Your event request "${eventTitle}" has been accepted.</p>
        <p>Your event is now live on our platform and visible to all users.</p>
        <p>Thank you for contributing to our community!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Event acceptance email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error as email sending is not critical
  }
};

const sendBookingConfirmationEmail = async (booking, event, user) => {
  try {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Confirmation - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #666; }
            .value { color: #0066FF; font-weight: 600; }
            .total { font-size: 1.2em; font-weight: 700; color: #0066FF; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            .button { display: inline-block; padding: 12px 30px; background: #0066FF; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName} ${user.lastName},</h2>
              <p>Your booking has been successfully confirmed! Here are your ticket details:</p>
              
              <div class="ticket-details">
                <h3 style="color: #0066FF; margin-top: 0;">${event.title}</h3>
                
                <div class="detail-row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${booking._id}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">${eventDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span class="value">${event.time}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span class="value">${event.address}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Ticket Type:</span>
                  <span class="value">${booking.ticketType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Number of Tickets:</span>
                  <span class="value">${booking.quantity}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Seat Numbers:</span>
                  <span class="value">${booking.seatNumbers && booking.seatNumbers.length > 0 ? booking.seatNumbers.join(', ') : 'Not assigned'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span class="total">LKR ${booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <p><strong>Important Information:</strong></p>
              <ul>
                <li>Please bring a valid ID to the event</li>
                <li>Arrive at least 30 minutes before the event starts</li>
                <li>This email serves as your booking confirmation</li>
                <li>You can view your booking details in your profile</li>
              </ul>
              
              <p>If you have any questions, please contact the event organizer:</p>
              <p><strong>Email:</strong> ${event.organizer.email}<br>
              <strong>Phone:</strong> ${event.organizer.contactNumber}</p>
            </div>
            
            <div class="footer">
              <p>Thank you for using Ceylon Compass!</p>
              <p style="font-size: 0.8em; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendEventAcceptedEmail,
  sendBookingConfirmationEmail
}; 