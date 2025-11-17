import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import VerificationPopup from '../components/VerificationPopup';
import MapLocationPicker from '../components/MapLocationPicker';
import '../styles/Forms.css';

// JWT decoder function
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const AddEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    country: '',
    city: '',
    address: '',
    organizer: {
      name: '',
      contactNumber: '',
      email: ''
    },
    category: '',
    price: '',
    capacity: '',
    image: '',
    ticketTypes: []
  });

  const [ticketType, setTicketType] = useState({
    name: '',
    price: '',
    quantity: '',
    description: ''
  });

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Initialize Cloudinary widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Hardcoded countries and cities
  const countries = ['Sri Lanka', 'India', 'Maldives', 'Thailand', 'Malaysia', 'United Kingdom', 'Australia', 'United Arab Emirates'];
  const cities = {
    'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
    'Maldives': ['Male', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi'],
    'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya'],
    'Malaysia': ['Kuala Lumpur', 'George Town', 'Malacca City', 'Kota Kinabalu'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah']
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData(prev => ({
      ...prev,
      country,
      city: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('organizer.')) {
      const organizerField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organizer: {
          ...prev.organizer,
          [organizerField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTicketTypeChange = (e) => {
    const { name, value } = e.target;
    setTicketType(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTicketType = () => {
    console.log('Add ticket type clicked', ticketType);
    console.log('Current formData.ticketTypes:', formData.ticketTypes);
    
    if (!ticketType.name || !ticketType.price || !ticketType.quantity) {
      setError('Please fill in all required ticket type fields (name, price, quantity)');
      console.log('Validation failed:', { name: ticketType.name, price: ticketType.price, quantity: ticketType.quantity });
      return;
    }

    const newTicket = {
      name: ticketType.name,
      price: Number(ticketType.price),
      quantity: Number(ticketType.quantity),
      available: Number(ticketType.quantity),
      description: ticketType.description
    };

    console.log('Adding new ticket:', newTicket);

    // Update formData with new ticket type
    const updatedTicketTypes = [...formData.ticketTypes, newTicket];
    console.log('Updated ticket types:', updatedTicketTypes);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        ticketTypes: updatedTicketTypes
      };
      console.log('New formData:', updated);
      return updated;
    });

    // Reset ticket type form
    setTicketType({
      name: '',
      price: '',
      quantity: '',
      description: ''
    });
    setError('');
    
    console.log('Ticket type added successfully, total tickets:', updatedTicketTypes.length);
  };

  const removeTicketType = (index) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const handleMapLocationSelect = (location) => {
    console.log('Map location selected:', location);
    setFormData(prev => ({
      ...prev,
      address: location.address,
      country: location.country || prev.country,
      city: location.city || prev.city
    }));
  };

  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzetdg1sz',
        uploadPreset: 'eventsreq',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#f4f4f5",
            windowBorder: "#90a0b3",
            tabIcon: "#000000",
            inactiveTabIcon: "#555a5f",
            menuIcons: "#555a5f",
            link: "#0433ff",
            action: "#339933",
            inProgress: "#0433ff",
            complete: "#339933",
            error: "#cc0000",
            textDark: "#000000",
            textLight: "#fcfffd"
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData(prev => ({
            ...prev,
            image: result.info.secure_url
          }));
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate ticket types
      if (!formData.ticketTypes || formData.ticketTypes.length === 0) {
        setError('Please add at least one ticket type before submitting');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to submit an event');
      }

      // Get user from context and localStorage
      const currentUser = user;
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!currentUser && !storedUser) {
        throw new Error('User information not found. Please log in again.');
      }

      // Use the user ID from either source
      const userId = currentUser?._id || storedUser?._id || storedUser?.id;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Format the date to ISO string
      const formattedDate = new Date(formData.date).toISOString();

      // Create the event request data with proper types
      const eventReqData = {
        title: formData.title,
        description: formData.description,
        date: formattedDate,
        time: formData.time,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        organizer: {
          name: formData.organizer.name,
          contactNumber: formData.organizer.contactNumber,
          email: formData.organizer.email
        },
        category: formData.category,
        price: formData.ticketTypes.length > 0 ? Math.min(...formData.ticketTypes.map(t => t.price)) : Number(formData.price),
        capacity: formData.ticketTypes.length > 0 ? formData.ticketTypes.reduce((sum, t) => sum + t.quantity, 0) : Number(formData.capacity),
        ticketTypes: formData.ticketTypes,
        image: formData.image,
        status: 'pending',
        createdBy: userId
      };

      console.log('==== SUBMITTING EVENT REQUEST ====');
      console.log('formData.ticketTypes:', formData.ticketTypes);
      console.log('eventReqData.ticketTypes:', eventReqData.ticketTypes);
      console.log('Full eventReqData:', JSON.stringify(eventReqData, null, 2));
      console.log('==================================');

      const response = await axios.post('http://localhost:5000/api/eventreq', eventReqData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setShowVerification(true);
      } else {
        throw new Error('No response from server');
      }
    } catch (err) {
      console.error('Error submitting event request:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to submit event request');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    navigate('/events');
  };

  return (
    <div className="form-container">
      <h1>Add New Event</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleCountryChange}
            required
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={!formData.country}
          >
            <option value="">Select City</option>
            {formData.country &&
              cities[formData.country].map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>
        </div>

        {/* Map Location Picker */}
        <div className="form-group">
          <label>Select Location on Map</label>
          <MapLocationPicker onLocationSelect={handleMapLocationSelect} />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address (Auto-filled from map)</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            readOnly
            required
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            placeholder="Click on the map to set location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizer.name">Organizer Name</label>
          <input
            type="text"
            id="organizer.name"
            name="organizer.name"
            value={formData.organizer.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizer.contactNumber">Organizer Contact Number</label>
          <input
            type="tel"
            id="organizer.contactNumber"
            name="organizer.contactNumber"
            value={formData.organizer.contactNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizer.email">Organizer Email</label>
          <input
            type="email"
            id="organizer.email"
            name="organizer.email"
            value={formData.organizer.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Food & Culture">Food & Culture</option>
            <option value="Cultural Festival">Cultural Festival</option>
            <option value="Film & Arts">Film & Arts</option>
            <option value="Music & Performance">Music & Performance</option>
            <option value="Arts & Culture">Arts & Culture</option>
          </select>
        </div>

        {/* Ticket Types Section */}
        <div className="form-section">
          <h3>Ticket Types (For concerts, shows, events)</h3>
          <p className="form-hint">Add different ticket categories like VIP, Balcony, Standing, ODC Reserved, etc. with their prices and quantities.</p>
          
          <div className="ticket-type-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ticketName">Ticket Type Name</label>
                <input
                  type="text"
                  id="ticketName"
                  name="name"
                  value={ticketType.name}
                  onChange={handleTicketTypeChange}
                  placeholder="e.g., VIP, Seating, Standing"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticketPrice">Price</label>
                <input
                  type="number"
                  id="ticketPrice"
                  name="price"
                  value={ticketType.price}
                  onChange={handleTicketTypeChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticketQuantity">Quantity</label>
                <input
                  type="number"
                  id="ticketQuantity"
                  name="quantity"
                  value={ticketType.quantity}
                  onChange={handleTicketTypeChange}
                  min="1"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ticketDescription">Description (Optional)</label>
              <input
                type="text"
                id="ticketDescription"
                name="description"
                value={ticketType.description}
                onChange={handleTicketTypeChange}
                placeholder="e.g., Front row seats with exclusive access"
              />
            </div>

            <button type="button" onClick={addTicketType} className="btn-add-ticket">
              Add Ticket Type
            </button>
          </div>

          {formData.ticketTypes.length > 0 && (
            <div className="added-tickets">
              <h4>Added Ticket Types:</h4>
              <div className="ticket-list">
                {formData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="ticket-item">
                    <div className="ticket-info">
                      <strong>{ticket.name}</strong> - LKR {ticket.price.toLocaleString()} ({ticket.quantity} tickets)
                      {ticket.description && <span className="ticket-desc"> - {ticket.description}</span>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeTicketType(index)}
                      className="btn-remove-ticket"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image</label>
          <button type="button" onClick={openCloudinaryWidget}>
            Upload Image
          </button>
          {formData.image && <img src={formData.image} alt="Event" />}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Event'}
        </button>
      </form>
      {showVerification && <VerificationPopup onClose={handleVerificationClose} />}
    </div>
  );
};

export default AddEvent;
