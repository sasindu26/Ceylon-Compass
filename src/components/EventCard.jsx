import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ id, title, image, location, category, date, time, price, ticketTypes }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const navigate = useNavigate();

  const handleImageError = () => {
    setImgSrc("https://via.placeholder.com/300x150?text=Event+Image+Not+Available");
  };

  const handleClick = () => {
    navigate(`/events/${id}`);
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get price display text
  const getPriceDisplay = () => {
    if (ticketTypes && ticketTypes.length > 0) {
      const prices = ticketTypes.map(t => t.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return minPrice > 0 ? `$${minPrice}` : 'Free';
      } else if (minPrice === 0) {
        return `Free - $${maxPrice}`;
      } else {
        return `$${minPrice} - $${maxPrice}`;
      }
    }
    return price !== undefined ? (price > 0 ? `$${price}` : 'Free') : '';
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card-image-container">
        <img
          src={imgSrc}
          alt={title || "Event"}
          className="event-card-photo"
          onError={handleImageError}
        />
        {category && (
          <div className="event-card-category">{category}</div>
        )}
      </div>
      <div className="event-card-details">
        <h3 className="event-card-title">{title}</h3>
        <p className="event-card-location">
          <i className="fas fa-map-marker-alt"></i>
          {location?.city}, {location?.country}
        </p>
        {date && (
          <p className="event-card-date">
            <i className="far fa-calendar"></i>
            {formatDate(date)} {time && `at ${time}`}
          </p>
        )}
        {getPriceDisplay() && (
          <p className="event-card-price">
            {getPriceDisplay()}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCard; 