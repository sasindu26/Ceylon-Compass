import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Listings.css';
import LocationFilter from '../components/LocationFilter';
import AccomodationCard from '../components/AccomodationCard';

const Accommodations = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        console.log('==== ACCOMMODATIONS PAGE INITIALIZATION ====');
        console.log('User object:', user);
        console.log('User country:', user.country);
        console.log('User city:', user.city);
        console.log('Setting initial user location filters for accommodations:', newFilters);
        setFilters(newFilters);
      } else {
        // If no user is logged in, show all accommodations
        const newFilters = {
          country: '',
          city: '',
          showAll: true
        };
        console.log('==== ACCOMMODATIONS PAGE INITIALIZATION ====');
        console.log('No user detected, showing all accommodations');
        setFilters(newFilters);
      }
      setFiltersInitialized(true);
    }
  }, [user, filtersInitialized]);

  // Fetch accommodations when filters change or component mounts
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        let url = 'https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/accommodations';
        
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
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        console.log(`Fetching accommodations with filters:`, filters);
        console.log(`Fetching accommodations from ${url}`);

        // Public endpoint, no token needed
        const response = await axios.get(url);
        
        console.log(`Received ${response.data.length} accommodations:`, response.data);
        
        // Log image URLs for debugging
        response.data.forEach(acc => {
          console.log(`Accommodation ${acc._id} (${acc.name}) - Image sources:`, {
            imageUrl: acc.imageUrl || 'N/A',
            images: acc.images || 'N/A'
          });
        });
        
        // Check if the response data appears to be filtered correctly
        if (!filters.showAll && filters.country) {
          const matchingAccommodations = response.data.filter(accommodation => 
            accommodation.country === filters.country && 
            (!filters.city || accommodation.city === filters.city)
          );
          
          if (matchingAccommodations.length !== response.data.length) {
            console.warn(`Warning: Not all accommodations match the filter criteria. ${matchingAccommodations.length} match out of ${response.data.length}.`);
            // If backend filtering isn't working, we can do it client-side
            setAccommodations(matchingAccommodations);
          } else {
            setAccommodations(response.data);
          }
        } else {
          setAccommodations(Array.isArray(response.data) ? response.data : []);
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching accommodations:', error);
        setError(error.response?.data?.message || 'Failed to load accommodations. Please try again later.');
        setAccommodations([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch accommodations whenever filters are initialized or changed
    if (filtersInitialized) {
      fetchAccommodations();
    }
  }, [filters, filtersInitialized]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">Accommodations</h1>
      </div>
      
      <div className="filter-actions-container">
        <LocationFilter 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading accommodations...</div>
      ) : accommodations.length === 0 ? (
        <div className="empty-message">
          No accommodations found. Try changing your filters or location.
        </div>
      ) : (
        <div className="listings-grid">
          {accommodations.map((accommodation) => (
            <AccomodationCard
              key={accommodation._id}
              id={accommodation._id}
              title={accommodation.name}
              photo={accommodation.imageUrl || (accommodation.images && accommodation.images.length > 0 ? accommodation.images[0] : null)}
              location={{
                country: accommodation.country,
                city: accommodation.city
              }}
              type={accommodation.type}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Accommodations; 