const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { sendBookingConfirmationEmail } = require('../utils/emailService');

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;
    const userId = req.user._id;

    // Validate quantity
    if (quantity < 1 || quantity > 5) {
      return res.status(400).json({ message: 'You can only book between 1 and 5 tickets' });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot book tickets for past events' });
    }

    // Check user's existing bookings for this event
    const existingBookings = await Booking.find({ 
      userId, 
      eventId,
      status: { $ne: 'cancelled' }
    });
    
    const totalBooked = existingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
    
    if (totalBooked + quantity > 5) {
      return res.status(400).json({ 
        message: `You can only book maximum 5 tickets per event. You have already booked ${totalBooked} ticket(s).` 
      });
    }

    // Calculate price and check availability
    let price = event.price;
    let availableTickets = event.capacity;

    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const selectedTicketType = event.ticketTypes.find(t => t.name === ticketType);
      if (!selectedTicketType) {
        return res.status(400).json({ message: 'Invalid ticket type' });
      }
      price = selectedTicketType.price;
      availableTickets = selectedTicketType.available;

      if (availableTickets < quantity) {
        return res.status(400).json({ 
          message: `Only ${availableTickets} ticket(s) available for ${ticketType}` 
        });
      }

      // Update ticket availability
      selectedTicketType.available -= quantity;
      await event.save();
    } else {
      // For events without ticket types
      if (availableTickets < quantity) {
        return res.status(400).json({ 
          message: `Only ${availableTickets} ticket(s) available` 
        });
      }

      // Update event capacity
      event.capacity -= quantity;
      await event.save();
    }

    // Generate seat numbers
    const seatNumbers = [];
    const startingSeatNumber = Math.floor(Math.random() * 900) + 100; // Random starting seat
    for (let i = 0; i < quantity; i++) {
      seatNumbers.push(`${ticketType.charAt(0).toUpperCase()}${startingSeatNumber + i}`);
    }

    // Create booking
    const booking = new Booking({
      userId,
      eventId,
      ticketType: ticketType || 'General',
      quantity,
      seatNumbers,
      totalPrice: price * quantity,
      status: 'confirmed',
      userDetails: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });

    await booking.save();

    // Populate event details for response
    await booking.populate('eventId', 'title date time image address organizer');

    // Send confirmation email (don't wait for it to complete)
    sendBookingConfirmationEmail(booking, event, req.user).catch(err => {
      console.error('Failed to send booking confirmation email:', err);
    });

    res.status(201).json({ 
      message: 'Booking confirmed successfully!',
      booking 
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user._id,
      status: { $ne: 'cancelled' }
    })
    .populate('eventId')
    .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check user's booking status for an event
router.get('/check/:eventId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
      eventId: req.params.eventId,
      status: { $ne: 'cancelled' }
    });

    const totalBooked = bookings.reduce((sum, booking) => sum + booking.quantity, 0);
    const canBookMore = totalBooked < 5;

    res.json({
      totalBooked,
      canBookMore,
      remainingSlots: 5 - totalBooked,
      bookings
    });
  } catch (error) {
    console.error('Error checking booking status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Get event and restore ticket availability
    const event = await Event.findById(booking.eventId);
    if (event) {
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        const ticketType = event.ticketTypes.find(t => t.name === booking.ticketType);
        if (ticketType) {
          ticketType.available += booking.quantity;
        }
      } else {
        event.capacity += booking.quantity;
      }
      await event.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
