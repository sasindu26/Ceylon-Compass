import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';  // Make sure to import axios
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import HomeFeatures from '../components/HomeFeatures';
import HomePageTop from '../components/HomePageTop';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [counts, setCounts] = useState({
    restaurants: 0,
    accommodations: 0,
    events: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming events
        const eventsResponse = await axios.get('http://localhost:5000/api/events?showAll=true&sort=asc');
        
        // Fetch restaurants count
        const restaurantsResponse = await axios.get('http://localhost:5000/api/restaurants?showAll=true');
        
        // Fetch accommodations count
        const accommodationsResponse = await axios.get('http://localhost:5000/api/accommodations?showAll=true');
        
        if (eventsResponse.data && Array.isArray(eventsResponse.data)) {
          // Filter future events and sort by date
          const currentDate = new Date();
          const futureEvents = eventsResponse.data
            .filter(event => new Date(event.date) > currentDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3); // Get only the 3 nearest events
          
          setUpcomingEvents(futureEvents);
          
          // Set counts
          setCounts({
            restaurants: restaurantsResponse.data?.length || 0,
            accommodations: accommodationsResponse.data?.length || 0,
            events: eventsResponse.data.filter(event => new Date(event.date) > currentDate).length
          });
          
          setError('');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setUpcomingEvents([]);
        setCounts({ restaurants: 0, accommodations: 0, events: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dummy event data to display if API fails
  const dummyEvents = [
    {
      _id: 'dummy1',
      title: 'Sri Lankan Cultural Festival',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: '10:00 AM',
      city: 'Colombo',
      country: 'Sri Lanka',
      image: 'https://res.cloudinary.com/dzetdg1sz/image/upload/v1710517285/sri-lankan-cultural-festival.jpg'
    },
    {
      _id: 'dummy2',
      title: 'Tamil New Year Celebration',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      time: '6:00 PM',
      city: 'Jaffna',
      country: 'Sri Lanka',
      image: 'https://res.cloudinary.com/dzetdg1sz/image/upload/v1710517285/tamil-new-year.jpg'
    },
    {
      _id: 'dummy3',
      title: 'Sinhala Food Festival',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      time: '12:00 PM',
      city: 'Kandy',
      country: 'Sri Lanka',
      image: 'https://res.cloudinary.com/dzetdg1sz/image/upload/v1710517285/food-festival.jpg'
    }
  ];

  // Choose which events to display - API data or dummy data if there's an error or no events
  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : (error ? dummyEvents : []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <HomePageTop />

      {/* Features Section */}
      <HomeFeatures />

      {/* Upcoming Events Section */}
      <section className="upcoming-events-section">
        <h2 className="section-title">Upcoming Events</h2>
        
        {loading ? (
          <div className="loading">Loading upcoming events...</div>
        ) : error && displayEvents.length === 0 ? (
          <div className="error-message">{error}</div>
        ) : displayEvents.length === 0 ? (
          <div className="empty-message">No upcoming events found</div>
        ) : (
          <div className="events-grid">
            {displayEvents.map((event) => (
              <Link to={`/events/${event._id}`} key={event._id} className="event-card">
                <div className="event-image">
                  <img 
                    src={event.image || "https://res.cloudinary.com/dzetdg1sz/image/upload/v1710517285/sri-lankan-event-default.jpg"} 
                    alt={event.title} 
                  />
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-date">
                    {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                  </p>
                  <p className="event-location">
                    {event.city}, {event.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Explore Section */}
      <section className="explore-section">
        <h2 className="section-title">Explore</h2>
        
                  <div className="explore-grid">
          {/* Restaurants Card */}
          <div className="explore-card">
            <div className="explore-image">
              <img 
                src="https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?q=80&w=2110&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Restaurants" 
                className="explore-img"
              />
            </div>
            <div className="explore-content">
              <h3 className="explore-title">RESTAURANTS</h3>
              <p className="explore-count">({counts.restaurants} Restaurant{counts.restaurants !== 1 ? 's' : ''})</p>
              <Link to="/restaurants" className="explore-link">
                Explore Restaurants
                <svg xmlns="http://www.w3.org/2000/svg" className="explore-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Accommodations Card */}
          <div className="explore-card">
            <div className="explore-image">
              <img 
                src="https://images.unsplash.com/photo-1633104069776-ea7e61258ec9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Accommodations" 
                className="explore-img"
              />
            </div>
            <div className="explore-content">
              <h3 className="explore-title">APARTMENT</h3>
              <p className="explore-count">({counts.accommodations} Apartment{counts.accommodations !== 1 ? 's' : ''})</p>
              <Link to="/accommodations" className="explore-link">
                Find Accommodations
                <svg xmlns="http://www.w3.org/2000/svg" className="explore-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Events Card */}
          <div className="explore-card">
            <div className="explore-image">
              <img 
                src="https://images.unsplash.com/photo-1556340346-5e30da977c4d?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Events" 
                className="explore-img"
              />
            </div>
            <div className="explore-content">
              <h3 className="explore-title">EVENTS</h3>
              <p className="explore-count">({counts.events} Upcoming Event{counts.events !== 1 ? 's' : ''})</p>
              <Link to="/events" className="explore-link">
                Discover Events
                <svg xmlns="http://www.w3.org/2000/svg" className="explore-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when user is not logged in */}
      {!isAuthenticated && (
        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers who trust us for their events and accommodations</p>
          <Link to="/register" className="btn-primary">Sign Up Now</Link>
        </section>
      )}
    </div>
  );
};

export default Home;