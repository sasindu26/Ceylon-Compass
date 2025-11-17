import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import '../styles/Details.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      console.log(`Fetching event details for ID: ${id}`);
      const response = await axios.get(`https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events/${id}`);
      console.log('==== EVENT DETAILS RECEIVED ====');
      console.log('Event data received:', response.data);
      console.log('Has ticketTypes:', response.data.ticketTypes ? 'YES' : 'NO');
      console.log('ticketTypes length:', response.data.ticketTypes?.length || 0);
      console.log('ticketTypes data:', JSON.stringify(response.data.ticketTypes, null, 2));
      console.log('================================');
      setEvent(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      alert('Please login to book tickets');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBookingModal(false);
    setBookingSuccess(true);
    // Refresh event data to show updated ticket availability
    fetchEvent();
    
    setTimeout(() => {
      alert(`Booking successful! Confirmation sent to ${booking.userDetails.email}`);
      setBookingSuccess(false);
    }, 500);
  };

  const getTotalAvailable = () => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + t.available, 0);
    }
    return event.capacity || 0;
  };

  const openInMaps = () => {
    if (!event.address) return;
    
    // If event has GPS coordinates, use them for more accurate location
    if (event.location?.coordinates?.lat && event.location?.coordinates?.lng) {
      const { lat, lng } = event.location.coordinates;
      // Open Google Maps with coordinates
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else {
      // Otherwise, use address search
      const addressQuery = encodeURIComponent(event.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  return (
    <div className="simplified-details-container">
      <h1 className="event-title">{event.title}</h1>
      <h2 className="event-location">{event.city}, {event.country}</h2>
      
      {bookingSuccess && (
        <div className="success-banner">
          ✓ Booking successful! Check your email for confirmation.
        </div>
      )}
      
      <div className="event-content">
        <div className="event-image-container">
          <img src={event.image} alt={event.title} className="event-image" />
        </div>
        
        <div className="event-info">
          <div className="event-description">
            <p>{event.description}</p>
          </div>
          
          {/* Book Now Button */}
          <div className="booking-section">
            <button className="book-now-button-large" onClick={handleBookNow}>
              <span>🎫 Book Tickets Now</span>
              <span className="available-count">
                {getTotalAvailable()} tickets available
              </span>
            </button>
          </div>
          
          <div className="event-metadata">
            <div className="metadata-item">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="metadata-item">
              <strong>Time:</strong> {event.time}
            </div>
            <div className="metadata-item">
              <strong>Category:</strong> {event.category}
            </div>
            <div className="metadata-item metadata-item-address">
              <strong>Address:</strong> 
              <span className="address-link" onClick={openInMaps} title="Click to open in Google Maps">
                📍 {event.address || 'Not specified'}
              </span>
            </div>
            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div className="ticket-types-section">
                <h3 className="section-heading">Ticket Types</h3>
                <div className="ticket-types-list">
                  {event.ticketTypes.map((ticket, index) => (
                    <div key={index} className="ticket-type-card">
                      <div className="ticket-type-header">
                        <h4>{ticket.name}</h4>
                        <span className="ticket-price">LKR {ticket.price.toLocaleString()}</span>
                      </div>
                      {ticket.description && (
                        <p className="ticket-description">{ticket.description}</p>
                      )}
                      <div className="ticket-availability">
                        <span className={ticket.available > 0 ? 'available' : 'sold-out'}>
                          {ticket.available > 0 
                            ? `${ticket.available} of ${ticket.quantity} available` 
                            : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : event.price > 0 && (
              <div className="metadata-item">
                <strong>Price:</strong> LKR {event.price.toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="organizer-section">
            <h3 className="section-heading">For More Info Contact:</h3>
            <div className="organizer-details">
              <div className="metadata-item">
                <strong>Organizer:</strong> {event.organizer?.name || 'Not specified'}
              </div>
              <div className="metadata-item">
                <strong>Phone:</strong> {event.organizer?.contactNumber || 'Not specified'}
              </div>
              <div className="metadata-item">
                <strong>Email:</strong> {event.organizer?.email || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          event={event}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default EventDetails; 