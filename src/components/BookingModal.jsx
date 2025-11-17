import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/BookingModal.css';

const BookingModal = ({ event, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBookings, setUserBookings] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    console.log('==== BOOKING MODAL EVENT DATA ====');
    console.log('Event:', event);
    console.log('Event ticketTypes:', event?.ticketTypes);
    console.log('ticketTypes length:', event?.ticketTypes?.length);
    console.log('ticketTypes array:', JSON.stringify(event?.ticketTypes, null, 2));
    
    // Use ticketTypes if available, otherwise use event price as default ticket
    if (event && event.ticketTypes && event.ticketTypes.length > 0) {
      console.log('✅ Using event ticket types:', event.ticketTypes);
      setSelectedTicketType(event.ticketTypes[0]);
    } else if (event && event.price) {
      // Create a default ticket type from event price
      console.log('⚠️ Creating default ticket type from event price:', event.price);
      setSelectedTicketType({
        name: 'General Admission',
        price: event.price,
        available: event.capacity || 100
      });
    } else {
      console.log('❌ No ticket types or price found!');
    }
    
    // Check user's existing bookings for this event
    checkExistingBookings();
  }, [event]);

  const checkExistingBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/bookings/check/${event._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error checking bookings:', error);
    }
  };

  const getTotalPrice = () => {
    if (!selectedTicketType) return 0;
    return selectedTicketType.price * quantity;
  };

  const getMaxQuantity = () => {
    if (!selectedTicketType) return 0;
    const available = selectedTicketType.available;
    const alreadyBooked = userBookings?.totalTickets || 0;
    const remaining = 5 - alreadyBooked; // Max 5 tickets per user per event
    return Math.min(available, remaining);
  };

  const handleBooking = async () => {
    if (!user) {
      setError('Please login to book tickets');
      return;
    }

    if (!selectedTicketType) {
      setError('Please select a ticket type');
      return;
    }

    const maxQty = getMaxQuantity();
    if (quantity > maxQty) {
      setError(`You can only book ${maxQty} more ticket(s)`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        eventId: event._id,
        ticketType: selectedTicketType.name,
        quantity: quantity,
        totalPrice: getTotalPrice(),
        paymentMethod: 'online', // This will be updated after payment gateway integration
        userDetails: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || ''
        }
      };

      const response = await axios.post(
        'https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/bookings',
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Simulate payment gateway - In production, integrate with Stripe/PayPal/etc
        setBookingData(response.data);
        
        // Show success after 2 seconds (simulating payment processing)
        setTimeout(() => {
          setLoading(false);
          setBookingSuccess(true);
          
          // Close modal and call success callback after another 2 seconds
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(response.data);
            }
            onClose();
          }, 2000);
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
      setLoading(false);
    }
  };

  if (!event) return null;

  const maxQty = getMaxQuantity();
  const totalBooked = userBookings?.totalTickets || 0;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{event.title}</h2>
          <p className="event-date-time">
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} at {event.time}
          </p>
          <p className="event-location">📍 {event.address}</p>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {totalBooked >= 5 ? (
            <div className="warning-message">
              You have already booked the maximum of 5 tickets for this event.
            </div>
          ) : (
            <>
              {/* Ticket Type Selection - Show if event has multiple ticket types */}
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                <div className="form-group">
                  <label>Select Ticket Type</label>
                  <div className="ticket-types">
                    {event.ticketTypes.map((ticket, index) => (
                      <div
                        key={index}
                        className={`ticket-type-option ${selectedTicketType?.name === ticket.name ? 'selected' : ''} ${ticket.available === 0 ? 'sold-out' : ''}`}
                        onClick={() => ticket.available > 0 && setSelectedTicketType(ticket)}
                      >
                        <div className="ticket-type-info">
                          <span className="ticket-name">{ticket.name}</span>
                          <span className="ticket-price">LKR {ticket.price.toLocaleString()}</span>
                        </div>
                        <div className="ticket-availability">
                          {ticket.available === 0 ? (
                            <span className="sold-out-badge">Sold Out</span>
                          ) : (
                            <span className="available-badge">{ticket.available} available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Show single ticket info if no ticket types */
                selectedTicketType && (
                  <div className="form-group">
                    <label>Ticket Information</label>
                    <div className="single-ticket-info">
                      <div className="ticket-detail">
                        <span className="label">Type:</span>
                        <span className="value">{selectedTicketType.name}</span>
                      </div>
                      <div className="ticket-detail">
                        <span className="label">Price per ticket:</span>
                        <span className="value">LKR {selectedTicketType.price.toLocaleString()}</span>
                      </div>
                      <div className="ticket-detail">
                        <span className="label">Available:</span>
                        <span className="value">{selectedTicketType.available} tickets</span>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Quantity Selection */}
              {selectedTicketType && selectedTicketType.available > 0 && (
                <div className="form-group">
                  <label>Number of Tickets</label>
                  <div className="quantity-selector">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={maxQty}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      disabled={quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>
                  <p className="qty-info">
                    Maximum {maxQty} ticket(s) available 
                    {totalBooked > 0 && ` (You've already booked ${totalBooked})`}
                  </p>
                </div>
              )}

              {/* Price Summary */}
              {selectedTicketType && (
                <div className="price-summary">
                  <div className="summary-row">
                    <span>Ticket Price:</span>
                    <span>LKR {selectedTicketType.price.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Quantity:</span>
                    <span>×{quantity}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>LKR {getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          {totalBooked < 5 && selectedTicketType && selectedTicketType.available > 0 && (
            <button
              className="book-button"
              onClick={handleBooking}
              disabled={loading || !selectedTicketType}
            >
              {loading ? 'Processing Payment...' : `Proceed to Payment - LKR ${getTotalPrice().toLocaleString()}`}
            </button>
          )}
          <button className="cancel-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>

        {loading && !bookingSuccess && (
          <div className="payment-processing">
            <div className="spinner"></div>
            <p>Processing your payment...</p>
            <p className="payment-note">This is a demo. In production, you'll be redirected to the payment gateway.</p>
          </div>
        )}

        {bookingSuccess && bookingData && (
          <div className="booking-success">
            <div className="success-icon">✓</div>
            <h3>Booking Confirmed!</h3>
            <p>Your booking has been successfully confirmed.</p>
            <div className="success-details">
              <p><strong>Booking ID:</strong> {bookingData._id}</p>
              <p><strong>Tickets:</strong> {bookingData.quantity}x {bookingData.ticketType}</p>
              <p><strong>Total Paid:</strong> LKR {bookingData.totalPrice.toLocaleString()}</p>
              <p><strong>Email:</strong> {bookingData.userDetails.email}</p>
            </div>
            <p className="success-note">A confirmation email has been sent to your email address.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;

