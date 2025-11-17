import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation as useLocationContext } from '../context/LocationContext';
import LocationFilter from '../components/LocationFilter';
import EventCard from '../components/EventCard';
import '../styles/Listings.css';
import '../styles/EventCard.css';

const Events = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    showAll: false
  });
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Set initial filters from user data when component mounts
  useEffect(() => {
    if (!filtersInitialized) {
      if (user) {
        const newFilters = {
          country: user.country || '',
          city: '', // Don't auto-set city, let user choose
          showAll: false
        };
        console.log('==== EVENTS PAGE INITIALIZATION ====');
        console.log('User object:', user);
        console.log('User country:', user.country);
        console.log('User city:', user.city);
        console.log('Setting initial user location filters for events:', newFilters);
        setFilters(newFilters);
      } else {
        // If no user is logged in, show all events
        const newFilters = {
          country: '',
          city: '',
          showAll: true
        };
        console.log('==== EVENTS PAGE INITIALIZATION ====');
        console.log('No user detected, showing all events');
        setFilters(newFilters);
      }
      setFiltersInitialized(true);
    }
  }, [user, filtersInitialized]);

  // Fetch events when filters change or component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/events';
        
        // Add query parameters based on filters
        const params = new URLSearchParams();
        
        // We need to check if filters.showAll is false and if we have country/city data
        if (!filters.showAll) {
          if (filters.country) {
            params.append('country', filters.country);
            
            // Only add city if country is present
            if (filters.city) {
              params.append('city', filters.city);
            }
          }
        } else {
          // If showAll is true, explicitly set it in the query params
          params.append('showAll', 'true');
        }
        
        // Always sort by date in ascending order (upcoming events first)
        params.append('sort', 'asc');
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        console.log(`Fetching events with filters:`, filters);
        console.log(`Fetching events from ${url}`);

        const response = await axios.get(url);
        console.log(`Received ${response.data.length} events:`, response.data);
        
        // Debug ticket types
        console.log('==== EVENTS TICKET TYPES DEBUG ====');
        response.data.forEach((event, index) => {
          console.log(`Event ${index + 1}: ${event.title}`);
          console.log('  - Has ticketTypes:', event.ticketTypes ? 'YES' : 'NO');
          console.log('  - ticketTypes length:', event.ticketTypes?.length || 0);
          if (event.ticketTypes && event.ticketTypes.length > 0) {
            console.log('  - Ticket types:', event.ticketTypes.map(t => `${t.name} (LKR ${t.price})`).join(', '));
          }
        });
        console.log('==== END TICKET TYPES DEBUG ====');
        
        // Create today's date at 00:00:00 for accurate date comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter out any past events on the client side as a backup
        let filteredEvents = response.data.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });
        
        // Sort events by date (upcoming first)
        filteredEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
        
        // Check if the response data appears to be filtered correctly
        if (!filters.showAll && filters.country) {
          filteredEvents = filteredEvents.filter(event => 
            event.country === filters.country && 
            (!filters.city || event.city === filters.city)
          );
        }
        
        setEvents(filteredEvents);
        setError('');
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch events whenever filters change
    if (filtersInitialized) {
      fetchEvents();
    }
  }, [filters, filtersInitialized]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">Events</h1>
        <p className="listings-subtitle">
          Browse upcoming events.
        </p>
      </div>
      
      <div className="filter-actions-container">
        <LocationFilter 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-message">
          No events found. Try changing your filters or location.
        </div>
      ) : (
        <div className="events-grid-modern">
          {events.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              image={event.image}
              location={`${event.city}, ${event.country}`}
              category={event.category}
              date={event.date}
              time={event.time}
              price={event.price}
              ticketTypes={event.ticketTypes}
              capacity={event.capacity}
              showBookButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events; 