const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    type: String,
    default: 'General'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  paymentMethod: {
    type: String,
    default: 'online'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  userDetails: {
    name: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

// Index to quickly find user's bookings for an event
bookingSchema.index({ userId: 1, eventId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
