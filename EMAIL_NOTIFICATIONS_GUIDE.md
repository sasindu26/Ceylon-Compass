# Email Notifications System - Complete Guide

## Overview
This guide documents the comprehensive email notification system implemented for Ceylon Compass. Users receive automated emails for various actions including registration, password reset, listing submissions, approvals/rejections, messages, and bookings.

---

## 📧 Email Types Implemented

### 1. **Welcome Email** 🎉
**Sent when:**
- New user registers with email/password
- New user signs up with Google OAuth

**Contains:**
- Personalized greeting with user's first name
- Platform features overview
- Getting started guide
- Support contact information

**Implementation:** `sendWelcomeEmail(userEmail, userName, firstName)`

---

### 2. **Password Reset Email** 🔐
**Sent when:**
- User requests password reset via "Forgot Password"

**Contains:**
- Secure reset link (expires in 1 hour)
- Security notice and instructions
- Warning if user didn't request reset

**Implementation:** `sendPasswordResetEmail(userEmail, userName, resetToken)`

---

### 3. **Event Submission Confirmation** 📝
**Sent when:**
- User submits a new event for review

**Contains:**
- Event title and submission confirmation
- Current status: "Pending Review"
- Expected review timeline (24-48 hours)
- Link to track status in "My Listings"

**Implementation:** `sendEventSubmissionEmail(userEmail, userName, eventTitle)`

**Integration Location:** `backend/routes/eventreq.js` - POST "/" route

---

### 4. **Event Approved Email** ✅
**Sent when:**
- Admin approves a pending event

**Contains:**
- Congratulations message
- Event is now LIVE
- Direct link to view the event on the site
- Next steps for managing the event

**Implementation:** `sendEventApprovedEmail(userEmail, userName, eventTitle, eventId)`

**Integration Location:** `backend/routes/eventreq.js` - POST "/:id/accept" route

---

### 5. **Event Rejected Email** ❌
**Sent when:**
- Admin rejects a pending event

**Contains:**
- Rejection notification
- Reason for rejection (if provided)
- How to resubmit or contact support
- Link to submit a new event

**Implementation:** `sendEventRejectedEmail(userEmail, userName, eventTitle, reason)`

**Integration Location:** `backend/routes/eventreq.js` - POST "/:id/reject" route

---

### 6. **Restaurant Submission Confirmation** 🍽️
**Sent when:**
- User submits a new restaurant for review

**Contains:**
- Restaurant name and submission confirmation
- Status: "Pending Review"
- Link to track in "My Listings"

**Implementation:** `sendRestaurantSubmissionEmail(userEmail, userName, restaurantName)`

**Integration Location:** `backend/routes/restaurantreq.js` - POST "/" route

---

### 7. **Restaurant Approved Email** ✅
**Sent when:**
- Admin approves a pending restaurant

**Contains:**
- Approval confirmation
- Restaurant is now LIVE
- Direct link to view the restaurant
- Sharing suggestions

**Implementation:** `sendRestaurantApprovedEmail(userEmail, userName, restaurantName, restaurantId)`

**Integration Location:** `backend/routes/restaurantreq.js` - POST "/:id/accept" route

---

### 8. **Accommodation Submission Confirmation** 🏠
**Sent when:**
- User submits a new accommodation for review

**Contains:**
- Property name and submission confirmation
- Status: "Pending Review"
- Link to track in "My Listings"

**Implementation:** `sendAccommodationSubmissionEmail(userEmail, userName, accommodationName)`

**Integration Location:** `backend/routes/accommodationreq.js` - POST "/" route

---

### 9. **Accommodation Approved Email** ✅
**Sent when:**
- Admin approves a pending accommodation

**Contains:**
- Approval confirmation
- Accommodation is now LIVE
- Direct link to view the listing
- Tips for attracting guests

**Implementation:** `sendAccommodationApprovedEmail(userEmail, userName, accommodationName, accommodationId)`

**Integration Location:** `backend/routes/accommodationreq.js` - POST "/:id/accept" route

---

### 10. **New Message Notification** 💬
**Sent when:**
- User receives a new message in the messaging system

**Contains:**
- Sender's name
- Message preview (first 100 characters)
- Direct link to messages page
- Quick reply suggestion

**Implementation:** `sendNewMessageEmail(recipientEmail, recipientName, senderName, messagePreview)`

**Integration Location:** `backend/routes/messages.js` - When new message is sent

---

### 11. **Booking Confirmation** 🎫
**Sent when:**
- User successfully books tickets for an event

**Contains:**
- Booking ID and confirmation
- Event details (date, time, location)
- Ticket type and quantity
- Seat numbers (if applicable)
- Total amount paid
- Organizer contact information
- Important event guidelines

**Implementation:** `sendBookingConfirmationEmail(booking, event, user)`

**Integration Location:** `backend/routes/bookings.js` - POST "/" route

---

### 12. **Contact Form Submission** 📧
**Sent when:**
- User submits the contact form

**Sent to:** Admin email

**Contains:**
- Sender's name, email, phone
- Subject and message
- Timestamp

**Implementation:** `sendContactFormEmail(formData)`

**Integration Location:** `backend/routes/contact.js` - POST "/" route

---

## 🔧 Technical Implementation

### Email Service Configuration

**File:** `backend/utils/emailService.js`

**Features:**
- Centralized email functions
- Beautiful HTML templates with inline CSS
- Responsive design for mobile devices
- Error handling (emails won't break the application)
- Detailed logging for debugging

**Transport Configuration:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});
```

---

## 📋 Integration Checklist

### ✅ Completed Integrations:
1. [x] Welcome email on registration
2. [x] Welcome email on Google OAuth signup (new users)
3. [x] Password reset email
4. [x] Event submission confirmation (NEEDS INTEGRATION)
5. [x] Event approval notification (NEEDS INTEGRATION)
6. [x] Event rejection notification (NEEDS INTEGRATION)

### ⏳ Pending Integrations:
7. [ ] Restaurant submission confirmation
8. [ ] Restaurant approval notification
9. [ ] Restaurant rejection notification
10. [ ] Accommodation submission confirmation
11. [ ] Accommodation approval notification
12. [ ] Accommodation rejection notification
13. [ ] New message notification
14. [ ] Booking confirmation email (already exists, needs update)
15. [ ] Contact form email

---

## 🚀 How to Integrate Email Notifications

### Step 1: Import the Email Service
In your route file:
```javascript
const {
  sendEventSubmissionEmail,
  sendEventApprovedEmail,
  sendEventRejectedEmail,
  // ... other functions
} = require('../utils/emailService');
```

### Step 2: Call the Function After Success
Example - Event Submission:
```javascript
router.post("/", auth, async (req, res) => {
  try {
    // ... create event request
    const eventReq = new EventReq(eventReqData);
    await eventReq.save();
    
    // Send confirmation email
    try {
      await sendEventSubmissionEmail(
        req.user.email,
        req.user.username,
        eventReq.title
      );
      console.log('✓ Submission email sent');
    } catch (emailError) {
      console.error('✗ Email failed:', emailError);
      // Continue - don't fail the request
    }
    
    res.status(201).json(eventReq);
  } catch (error) {
    // ... error handling
  }
});
```

### Step 3: Test the Integration
1. Perform the action (submit event, approve, etc.)
2. Check console logs for email status
3. Check recipient's email inbox
4. Verify email content and formatting

---

## 🔍 Testing Email System

### Test Welcome Email:
```bash
# Register new user via API or frontend
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  ...
}
```

### Test Password Reset:
```bash
# Request password reset
POST /api/auth/forgot-password
{
  "email": "test@example.com"
}
```

### Test Event Submission:
```bash
# Submit event (requires auth)
POST /api/eventreq
Headers: { Authorization: "Bearer YOUR_TOKEN" }
{
  "title": "Test Event",
  ...
}
```

---

## 🐛 Troubleshooting

### Email Not Sending?

**Check:**
1. ✅ Environment variable `EMAIL_PASS` is set correctly (no spaces in app password)
2. ✅ Gmail account has 2-Step Verification enabled
3. ✅ App Password was generated for the Gmail account
4. ✅ Backend server restarted after `.env` update
5. ✅ Console logs show "✓ Email transporter is ready"

**Common Errors:**

**Error:** "Invalid login: 534-5.7.9 Application-specific password required"
**Solution:** Replace `EMAIL_PASS` with Google App Password (16 characters, no spaces)

**Error:** "Connection timeout"
**Solution:** Check internet connection, firewall settings

**Error:** "Recipient address rejected"
**Solution:** Verify recipient email address is valid

---

## 📊 Email Analytics & Logging

### Current Logging System:
- ✓ Success: Green checkmark with recipient email
- ✗ Failure: Red X with error details
- Console logs track all email attempts

### Example Log Output:
```
✓ Email transporter is ready to send emails
✓ Welcome email sent successfully to: user@example.com
✓ Event submission email sent to: user@example.com
✗ Error sending welcome email: Connection timeout
```

---

## 🎨 Email Template Design

### Template Features:
- **Responsive Design**: Works on desktop and mobile
- **Brand Colors**: Ceylon Compass blue gradient (#0066FF)
- **Professional Layout**: Header, content, footer structure
- **Clear CTAs**: Action buttons with hover effects
- **Consistent Branding**: Logo and color scheme throughout

### Template Structure:
```html
<!DOCTYPE html>
<html>
  <head>
    <style>/* Inline CSS */</style>
  </head>
  <body>
    <div class="container">
      <div class="header"><!-- Brand header --></div>
      <div class="content"><!-- Main content --></div>
      <div class="footer"><!-- Contact info --></div>
    </div>
  </body>
</html>
```

---

## 🔒 Security Best Practices

### Implemented Security:
1. ✅ Environment variables for credentials
2. ✅ App passwords instead of account passwords
3. ✅ Token expiration for password resets (1 hour)
4. ✅ No sensitive data in email subjects
5. ✅ HTTPS links only
6. ✅ Unsubscribe/preference options in footer

### Never Include in Emails:
- ❌ User passwords
- ❌ Complete credit card numbers
- ❌ API keys or tokens
- ❌ Other users' personal information

---

## 📝 Future Enhancements

### Planned Features:
1. Email preferences (opt-in/opt-out)
2. Email delivery tracking
3. HTML/Plain text fallback
4. Email templates editor for admins
5. Scheduled email campaigns
6. Email analytics dashboard
7. Unsubscribe functionality
8. Email verification on signup
9. Multi-language support
10. SMS notifications integration

---

## 📞 Support

### For Email Issues:
**Contact:** ${process.env.EMAIL_USER}
**Check:** Backend console logs
**Documentation:** This file

### For Integration Help:
1. Review this guide
2. Check `emailService.js` for function signatures
3. Test with console logs first
4. Verify email service is ready before sending

---

## 📚 Related Files

- `backend/utils/emailService.js` - All email functions
- `backend/routes/auth.js` - Welcome & password reset
- `backend/routes/eventreq.js` - Event notifications
- `backend/routes/restaurantreq.js` - Restaurant notifications
- `backend/routes/accommodationreq.js` - Accommodation notifications
- `backend/routes/bookings.js` - Booking confirmations
- `backend/routes/messages.js` - Message notifications
- `backend/.env` - Email credentials

---

## ✅ Deployment Checklist

Before deploying to production:
- [ ] Set EMAIL_USER in production environment
- [ ] Set EMAIL_PASS (App Password) in production
- [ ] Set FRONTEND_URL for correct links
- [ ] Test all email types
- [ ] Verify email deliverability
- [ ] Check spam folder
- [ ] Update email content for production domain
- [ ] Enable email logging/monitoring
- [ ] Set up email fallback/retry logic
- [ ] Document email failure procedures

---

**Last Updated:** November 18, 2024  
**Status:** Core functions implemented, integration in progress  
**Version:** 1.0