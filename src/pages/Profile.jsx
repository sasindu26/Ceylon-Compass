import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MessagesTab from '../components/MessagesTab';
import SearchableSelect from '../components/SearchableSelect';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Location states
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    city: '',
    profilePhoto: '',
    phone: '',
    location: {
      address: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchCountries();
    fetchUnreadCount();
    
    // Load Cloudinary widget
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    // Poll for unread count every 30 seconds
    const unreadInterval = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      clearInterval(unreadInterval);
    };
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/locations/countries');
      setCountries(response.data);
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error fetching countries:', err);
      setCountries([]);
      setError('Failed to load countries. Please try again later.');
    }
  };

  const fetchCities = async (country) => {
    if (!country || country.trim() === '') {
      setCities([]);
      return;
    }
    
    try {
      const encodedCountry = encodeURIComponent(country);
      const response = await axios.get(`https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/locations/cities/${encodedCountry}`);
      setCities(response.data);
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
      setError('Failed to load cities. Please try again later.');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await axios.get('https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData(prev => ({
        ...prev,
        username: response.data.username || '',
        title: response.data.title || 'Mr.',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email,
        country: response.data.country || '',
        city: response.data.city || '',
        profilePhoto: response.data.profilePhoto || '',
        phone: response.data.phone || '',
        location: response.data.location || {
          address: '',
          coordinates: { latitude: null, longitude: null }
        }
      }));
      
      if (response.data.country) {
        setSelectedCountry(response.data.country);
      }
      
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login');
      } else {
        setError('Failed to load user data. Please refresh the page.');
      }
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object (location.address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setSuccess('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address and location details
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const address = data.address;
            let detectedCountry = address.country || '';
            const detectedCity = address.city || address.town || address.village || address.state || '';
            
            console.log('GPS Detected:', { country: detectedCountry, city: detectedCity, address: data.display_name });
            
            // Map country name variations
            const countryMapping = {
              'United States of America': 'United States',
              'USA': 'United States',
              'UK': 'United Kingdom'
            };
            detectedCountry = countryMapping[detectedCountry] || detectedCountry;
            
            // Fetch cities for detected country
            try {
              const citiesResponse = await axios.get(
                `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/locations/cities/${encodeURIComponent(detectedCountry)}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              
              if (citiesResponse.data && citiesResponse.data.length > 0) {
                setCities(citiesResponse.data);
                setSelectedCountry(detectedCountry);
                
                // Use detected city if it exists in database, otherwise use first city
                const cityExists = citiesResponse.data.includes(detectedCity);
                const finalCity = cityExists ? detectedCity : citiesResponse.data[0];
                
                setFormData(prev => ({
                  ...prev,
                  country: detectedCountry,
                  city: finalCity,
                  location: {
                    address: data.display_name || '',
                    coordinates: { latitude, longitude }
                  }
                }));
                
                setSuccess(`✓ Location set to ${finalCity}, ${detectedCountry}. Country & City dropdowns updated!`);
              } else {
                throw new Error('No cities found');
              }
            } catch (cityError) {
              // Country not in database or error fetching cities
              console.error('City fetch error:', cityError);
              setFormData(prev => ({
                ...prev,
                location: {
                  address: data.display_name || '',
                  coordinates: { latitude, longitude }
                }
              }));
              setError(`Country "${detectedCountry}" not in our database. Please select manually.`);
            }
          } else {
            setError('Could not detect location details. Please select manually.');
          }
          
          setTimeout(() => { setSuccess(''); setError(''); }, 5000);
        } catch (error) {
          console.error('Geocoding error:', error);
          setError('Error detecting location. Please try again or select manually.');
          setTimeout(() => setError(''), 4000);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to access your location. Please enable location permissions and try again.');
        setTimeout(() => setError(''), 4000);
      }
    );
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData(prev => ({
      ...prev,
      country,
      city: '' // Reset city when country changes
    }));
    setCities([]); // Reset cities when country changes
    setError(''); // Clear any existing errors
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Use the updateProfile function from AuthContext
      await updateProfile({
        username: formData.username,
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        country: formData.country,
        city: formData.city,
        profilePhoto: formData.profilePhoto,
        phone: formData.phone,
        location: formData.location
      });
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzetdg1sz',
        uploadPreset: 'restaurants', // Using existing preset that works
        sources: ['local', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingDefaultSelectionRatio: 1,
        showSkipCropButton: false,
        defaultSource: 'local',
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
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
            profilePhoto: result.info.secure_url
          }));
          setSuccess('Photo uploaded! Click "Update Profile" to save.');
        } else if (error) {
          setError('Failed to upload photo. Please try again.');
          console.error('Cloudinary upload error:', error);
        }
      }
    );
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in again');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        'https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/auth/profile/password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Password update error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update password. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return <MessagesTab />;
      case 'marketplace':
        return (
          <div className="profile-section">
            <h2>Add New Listings</h2>
            <p className="setup-description">Choose what you'd like to add to Ceylon Compass</p>
            <div className="setup-cards">
              <div className="setup-card" onClick={() => navigate('/restaurants/add')}>
                <img src="/src/assets/images/restaurant-card.jpg" alt="Restaurant" className="setup-image" />
                <div className="setup-content">
                  <h3>Add Restaurant</h3>
                  <p>Share a great restaurant with travelers</p>
                  <button className="setup-button">Add New Restaurant</button>
                </div>
              </div>
              <div className="setup-card" onClick={() => navigate('/accommodations/add')}>
                <img src="/src/assets/images/apartment-card.jpg" alt="Accommodation" className="setup-image" />
                <div className="setup-content">
                  <h3>Add Accommodation</h3>
                  <p>List a place to stay</p>
                  <button className="setup-button">Add New Accommodation</button>
                </div>
              </div>
              <div className="setup-card" onClick={() => navigate('/events/add')}>
                <img src="/src/assets/images/event-card.jpg" alt="Event" className="setup-image" />
                <div className="setup-content">
                  <h3>Add Event</h3>
                  <p>Promote an upcoming event</p>
                  <button className="setup-button">Add New Event</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <small style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  Username must be unique
                </small>
              </div>
              <div className="form-group">
                <label>Title</label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <SearchableSelect
                  options={countries}
                  value={formData.country}
                  onChange={handleCountryChange}
                  placeholder="Select a country"
                  name="country"
                  isSearchable={true}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <SearchableSelect
                  options={cities}
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Select a city"
                  name="city"
                  isDisabled={!formData.country}
                  isSearchable={true}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="form-group">
                <label>Address (Auto-filled from GPS location)</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  readOnly
                  placeholder="Click 'Use Current Location' to auto-fill"
                  style={{ backgroundColor: '#f8fafc', cursor: 'default' }}
                />
                <button
                  type="button"
                  className="location-button"
                  onClick={handleGetCurrentLocation}
                >
                  📍 Use Current Location
                </button>
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  You can update your location anytime using GPS. Country, City, and Address will be auto-filled.
                </small>
              </div>
              
              {formData.location.coordinates.latitude && formData.location.coordinates.longitude && (
                <div className="map-container">
                  <p className="location-info">
                    Lat: {formData.location.coordinates.latitude.toFixed(6)}, 
                    Lng: {formData.location.coordinates.longitude.toFixed(6)}
                  </p>
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '8px' }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.location.coordinates.longitude-0.01},${formData.location.coordinates.latitude-0.01},${formData.location.coordinates.longitude+0.01},${formData.location.coordinates.latitude+0.01}&layer=mapnik&marker=${formData.location.coordinates.latitude},${formData.location.coordinates.longitude}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              <button type="submit" className="update-button">
                Update Profile
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-info">
            <div className="profile-avatar" onClick={openCloudinaryWidget} style={{ cursor: 'pointer', position: 'relative' }}>
              {formData.profilePhoto ? (
                <>
                  <img 
                    src={formData.profilePhoto} 
                    alt="Profile" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }} 
                  />
                  <div className="photo-overlay">
                    <span>Change Photo</span>
                  </div>
                </>
              ) : (
                <>
                  {formData.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                  <div className="photo-overlay">
                    <span>Add Photo</span>
                  </div>
                </>
              )}
            </div>
            <h2>{user?.username}</h2>
            <p className="profile-fullname">{formData.firstName} {formData.lastName}</p>
            <p>{user?.email}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketplace')}
            >
              Marketplace
            </button>
            <button
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('messages');
                // Refresh unread count after messages are loaded
                setTimeout(() => fetchUnreadCount(), 2000);
              }}
            >
              Messages
              {unreadCount > 0 && (
                <span className="unread-badge"></span>
              )}
            </button>
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="profile-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile; 