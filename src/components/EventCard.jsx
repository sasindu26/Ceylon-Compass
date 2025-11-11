import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ id, title, image, location, category, date, time, price, ticketTypes, showBookButton = false, capacity }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const navigate = useNavigate();

  const handleImageError = () => {
    setImgSrc("https://via.placeholder.com/400x500?text=Event+Image");
  };

  const handleCardClick = (e) => {
    // Only navigate if not clicking the book button
    if (!e.target.closest('.book-now-btn')) {
      navigate(`/events/${id}`);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/events/${id}`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day}, ${month} ${year}`;
  };

  // Format time to 12-hour
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get price display
  const getPriceDisplay = () => {
    if (ticketTypes && ticketTypes.length > 0) {
      const prices = ticketTypes.map(t => t.price);
      const minPrice = Math.min(...prices);
      return `${minPrice.toLocaleString()} LKR`;
    }
    return price !== undefined ? `${price.toLocaleString()} LKR` : '';
  };

  // Get total available tickets
  const getTotalAvailable = () => {
    if (ticketTypes && ticketTypes.length > 0) {
      return ticketTypes.reduce((sum, t) => sum + t.available, 0);
    }
    return capacity || 0;
  };

  const availableTickets = getTotalAvailable();

  return (
    <div className="event-card-modern" onClick={handleCardClick}>
      <div className="event-card-image-wrapper">
        <img
          src={imgSrc}
          alt={title || "Event"}
          className="event-card-image-modern"
          onError={handleImageError}
        />
        <div className="event-date-badge">
          <div className="badge-day">{new Date(date).getDate()}</div>
          <div className="badge-month">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</div>
        </div>
      </div>
      
      <div className="event-card-content-modern">
        <div className="event-time-modern">{formatTime(time)}</div>
        <h3 className="event-title-modern">{title}</h3>
        <p className="event-location-modern">{location}</p>
        
        <div className="event-ticket-info">
          <div className="ticket-category">{category || 'Indoor Musical Concert'}</div>
          <div className="ticket-details">
            <div className="ticket-label">Tickets</div>
            <div className="ticket-price-row">
              <span className="ticket-price">{getPriceDisplay()}</span>
              <span className="ticket-availability">{availableTickets} Upwards</span>
            </div>
          </div>
        </div>

        {showBookButton && (
          <button className="book-now-btn" onClick={handleBookNow}>
            Book Now <span className="arrow">»</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard; 