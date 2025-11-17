import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/MyListings.css';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('restaurants');
  const [listings, setListings] = useState({
    restaurants: [],
    accommodations: [],
    events: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user's restaurants (both approved and pending)
      const [restaurantsRes, restaurantReqsRes, accommodationsRes, accommodationReqsRes, eventsRes, eventReqsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/restaurants', config),
        axios.get('http://localhost:5000/api/restaurantreq/my-requests', config),
        axios.get('http://localhost:5000/api/accommodations', config),
        axios.get('http://localhost:5000/api/accommodationreq/my-requests', config),
        axios.get('http://localhost:5000/api/events', config),
        axios.get('http://localhost:5000/api/eventreq/my-requests', config)
      ]);

      // Filter approved listings by current user
      const myRestaurants = restaurantsRes.data.filter(r => r.createdBy === user._id);
      const myAccommodations = accommodationsRes.data.filter(a => a.createdBy === user._id);
      const myEvents = eventsRes.data.filter(e => e.createdBy === user._id);

      setListings({
        restaurants: [
          ...myRestaurants.map(r => ({ ...r, status: 'approved', type: 'approved' })),
          ...restaurantReqsRes.data.map(r => ({ ...r, type: 'request' }))
        ],
        accommodations: [
          ...myAccommodations.map(a => ({ ...a, status: 'approved', type: 'approved' })),
          ...accommodationReqsRes.data.map(a => ({ ...a, type: 'request' }))
        ],
        events: [
          ...myEvents.map(e => ({ ...e, status: 'approved', type: 'approved' })),
          ...eventReqsRes.data.map(e => ({ ...e, type: 'request' }))
        ]
      });

      setError('');
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id, currentStatus, listingType) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      
      let endpoint = '';
      if (listingType === 'restaurants') {
        endpoint = `http://localhost:5000/api/restaurants/${id}/status`;
      } else if (listingType === 'accommodations') {
        endpoint = `http://localhost:5000/api/accommodations/${id}/status`;
      } else if (listingType === 'events') {
        endpoint = `http://localhost:5000/api/events/${id}/status`;
      }

      await axios.patch(endpoint, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Refresh listings
      fetchMyListings();
      alert(`Successfully marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id, listingType, type) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (type === 'approved') {
        if (listingType === 'restaurants') {
          endpoint = `http://localhost:5000/api/restaurants/${id}`;
        } else if (listingType === 'accommodations') {
          endpoint = `http://localhost:5000/api/accommodations/${id}`;
        } else if (listingType === 'events') {
          endpoint = `http://localhost:5000/api/events/${id}`;
        }
      } else {
        if (listingType === 'restaurants') {
          endpoint = `http://localhost:5000/api/restaurantreq/${id}`;
        } else if (listingType === 'accommodations') {
          endpoint = `http://localhost:5000/api/accommodationreq/${id}`;
        } else if (listingType === 'events') {
          endpoint = `http://localhost:5000/api/eventreq/${id}`;
        }
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchMyListings();
      alert('Listing deleted successfully');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing');
    }
  };

  const getStatusBadge = (listing) => {
    if (listing.type === 'approved') {
      const availStatus = listing.availability || listing.status;
      if (availStatus === 'closed' || availStatus === 'soldout') {
        return <span className="status-badge closed">Closed</span>;
      }
      return <span className="status-badge approved">Active</span>;
    }
    
    switch (listing.status) {
      case 'pending':
        return <span className="status-badge pending">Pending Review</span>;
      case 'approved':
        return <span className="status-badge approved">Approved</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const renderListingCard = (listing, listingType) => {
    const isApproved = listing.type === 'approved';
    const isClosed = listing.availability === 'closed' || listing.status === 'soldout';
    
    return (
      <div key={listing._id} className={`listing-card ${isClosed ? 'closed-listing' : ''}`}>
        <div className="listing-image">
          <img src={listing.image || listing.images?.[0]} alt={listing.name || listing.title} />
          {isClosed && <div className="closed-overlay">CLOSED</div>}
        </div>
        
        <div className="listing-info">
          <div className="listing-header">
            <h3>{listing.name || listing.title}</h3>
            {getStatusBadge(listing)}
          </div>
          
          <p className="listing-location">
            📍 {listing.city}, {listing.country}
          </p>
          
          {listing.type === 'request' && listing.status === 'rejected' && listing.rejectionReason && (
            <div className="rejection-reason">
              <strong>Rejection Reason:</strong> {listing.rejectionReason}
            </div>
          )}
          
          <div className="listing-meta">
            <span>📅 Submitted: {new Date(listing.createdAt).toLocaleDateString()}</span>
            {listingType === 'events' && listing.date && (
              <span>🎫 Event Date: {new Date(listing.date).toLocaleDateString()}</span>
            )}
          </div>
          
          <div className="listing-actions">
            {isApproved && (
              <>
                <button 
                  className={`btn-status ${isClosed ? 'btn-open' : 'btn-close'}`}
                  onClick={() => handleToggleAvailability(
                    listing._id, 
                    isClosed ? 'closed' : 'open',
                    listingType
                  )}
                >
                  {isClosed ? '🔓 Mark as Open' : '🔒 Mark as Closed'}
                </button>
                
                <Link 
                  to={`/edit-${listingType.slice(0, -1)}/${listing._id}`}
                  className="btn-edit"
                >
                  ✏️ Edit
                </Link>
              </>
            )}
            
            {listing.type === 'request' && listing.status === 'pending' && (
              <span className="pending-text">⏳ Waiting for admin approval...</span>
            )}
            
            <button 
              className="btn-delete"
              onClick={() => handleDelete(listing._id, listingType, listing.type)}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  const currentListings = listings[activeTab];

  return (
    <div className="my-listings-container">
      <div className="listings-header">
        <h1>My Listings</h1>
        <p>Manage your restaurants, accommodations, and events</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          🍽️ Restaurants ({listings.restaurants.length})
        </button>
        <button
          className={`tab ${activeTab === 'accommodations' ? 'active' : ''}`}
          onClick={() => setActiveTab('accommodations')}
        >
          🏠 Accommodations ({listings.accommodations.length})
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎉 Events ({listings.events.length})
        </button>
      </div>

      <div className="listings-content">
        {currentListings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't added any {activeTab} yet.</p>
            <Link 
              to={`/add-${activeTab.slice(0, -1)}`}
              className="btn-add-new"
            >
              Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {currentListings.map(listing => renderListingCard(listing, activeTab))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
