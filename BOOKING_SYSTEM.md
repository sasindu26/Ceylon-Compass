# 🎫 Ceylon Compass Ticket Booking System

## Overview
Complete ticket booking system with payment gateway integration for Ceylon Compass events platform.

## ✅ Features Implemented

### 1. Modern Event Cards (TicketsMinistry Style)
- **Blue "Book Now" buttons** (#0066FF)
- **Date badges** on event images
- **Ticket pricing** display (LKR currency)
- **Availability counter**
- **Responsive grid layout**
- **Hover animations**

### 2. Booking System
- **Maximum 5 tickets per user per event**
- **Multiple ticket types** support
- **Real-time availability** updates
- **Automatic ticket count** reduction after booking
- **User booking history** tracking

### 3. Backend API (Already Created)
Located in: `backend/routes/bookings.js`

**Endpoints:**
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/check/:eventId` - Check user's existing bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

**Validation:**
- Checks user hasn't exceeded 5 ticket limit
- Verifies ticket availability
- Prevents overbooking
- Auto-updates ticket counts

### 4. Payment Gateway Integration (Demo)

**Current Status:** Demo mode with simulated payment processing

**To Integrate Real Payment Gateway:**

#### Option 1: Stripe (Recommended for International)
```javascript
// Install Stripe
npm install @stripe/stripe-js @stripe/react-stripe-js

// In BookingModal.jsx
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('YOUR_PUBLISHABLE_KEY');

const handleBooking = async () => {
  // Create payment intent on backend
  const { clientSecret } = await axios.post('/api/create-payment-intent', {
    amount: getTotalPrice() * 100, // Convert to cents
    currency: 'lkr'
  });

  // Redirect to Stripe checkout
  const stripe = await stripePromise;
  await stripe.confirmCardPayment(clientSecret);
};
```

#### Option 2: PayHere (Sri Lankan Payment Gateway)
```javascript
// Add PayHere script to index.html
<script src="https://www.payhere.lk/lib/payhere.js"></script>

// In BookingModal.jsx
const handleBooking = () => {
  payhere.startPayment({
    sandbox: true, // Set to false for production
    merchant_id: 'YOUR_MERCHANT_ID',
    return_url: 'http://localhost:5173/payment-success',
    cancel_url: 'http://localhost:5173/payment-cancel',
    notify_url: 'http://localhost:5000/api/payment/notify',
    order_id: bookingId,
    items: event.title,
    amount: getTotalPrice(),
    currency: 'LKR',
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phoneNumber
  });
};
```

## 📁 File Structure

```
src/
├── components/
│   ├── EventCard.jsx           # Modern event card component
│   └── BookingModal.jsx         # Ticket booking modal
├── pages/
│   ├── Events.jsx              # Events listing page
│   └── EventDetails.jsx        # Event details with booking
└── styles/
    ├── EventCard.css           # Event card styles
    ├── BookingModal.css        # Booking modal styles
    └── Details.css             # Event details styles

backend/
├── models/
│   └── Booking.js              # Booking schema
└── routes/
    └── bookings.js             # Booking API routes
```

## 🚀 How to Use

### For Users:
1. Navigate to **Events** page
2. Browse events with modern cards
3. Click **"Book Now"** button (blue)
4. Select ticket type and quantity (max 5)
5. Click **"Proceed to Payment"**
6. Complete payment (currently demo mode)
7. Receive confirmation email

### For Admins:
- View all bookings in admin panel
- Manage events and ticket availability
- Track booking statistics

## 🔧 Configuration

### Backend Server
Ensure backend is running on port 5000:
```bash
cd backend
npm start
```

### Frontend Server
Ensure frontend is running on port 5173:
```bash
npm run dev
```

### Database
MongoDB connection required for bookings to persist.

## 📊 Ticket Management

### Automatic Updates:
- ✅ Ticket count decreases when booking is made
- ✅ Ticket count increases when booking is cancelled
- ✅ Shows "Sold Out" when no tickets available
- ✅ Prevents booking when user has 5+ tickets

### Example Event Data:
```json
{
  "title": "Saumyawanthiyo",
  "ticketTypes": [
    {
      "name": "VIP",
      "price": 5000,
      "quantity": 100,
      "available": 95
    },
    {
      "name": "General",
      "price": 3500,
      "quantity": 200,
      "available": 200
    }
  ]
}
```

## 🎨 Design Features

### Event Cards:
- **Image**: 350px height, cover fit
- **Date Badge**: Top-right corner, white background
- **Blue Button**: #0066FF with hover effect
- **Ticket Info**: Price in LKR with availability
- **Grid Layout**: Responsive, 320px minimum width

### Booking Modal:
- **Ticket Selection**: Visual cards with prices
- **Quantity Selector**: +/- buttons
- **Price Summary**: Real-time calculation
- **Payment Processing**: Animated loading state
- **Success Messages**: Green confirmation banner

## 🔐 Security

- ✅ Authentication required for booking
- ✅ Token-based API authorization
- ✅ User ID verification
- ✅ Booking validation
- ✅ SQL injection prevention (Mongoose)

## 📧 Email Notifications

Bookings trigger email confirmations with:
- Event details
- Ticket information
- QR code (future feature)
- Payment receipt

## 🐛 Troubleshooting

### Issue: Booking fails
**Solution**: Check backend server is running and MongoDB is connected

### Issue: Tickets not updating
**Solution**: Refresh page or check API response in console

### Issue: Payment not processing
**Solution**: Currently in demo mode. Integrate real payment gateway.

## 📈 Future Enhancements

1. **QR Code Tickets**: Generate unique codes for each booking
2. **Seat Selection**: For venues with seating maps
3. **Multi-Currency**: Support USD, EUR, etc.
4. **Digital Wallet**: Store tickets in app
5. **Refund System**: Automated refund processing
6. **Analytics Dashboard**: Booking trends and revenue reports

## 💳 Payment Gateway Setup Guide

### For Production:

1. **Get API Keys**:
   - Stripe: https://dashboard.stripe.com/apikeys
   - PayHere: https://www.payhere.lk/merchant/signup

2. **Add to Environment Variables**:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
```

3. **Update Backend**:
Create `backend/routes/payment.js`:
```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency || 'lkr',
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

module.exports = router;
```

4. **Update Frontend**:
Replace the demo payment logic in `BookingModal.jsx` with real payment integration.

## 📱 Contact

For support with payment gateway integration or booking system issues:
- Check backend logs: `backend/logs/`
- Check browser console for errors
- Verify API endpoints are accessible

---

**Status**: ✅ Fully Functional (Demo Mode)
**Last Updated**: November 10, 2025
**Version**: 1.0.0
