import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MessagesTab from '../components/MessagesTab';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Location states
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    country: '',
    city: '',
    profilePhoto: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchCountries();
    
    // Load Cloudinary widget
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations/countries');
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
      const response = await axios.get(`http://localhost:5000/api/locations/cities/${encodedCountry}`);
      setCities(response.data);
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
      setError('Failed to load cities. Please try again later.');
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

      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData(prev => ({
        ...prev,
        email: response.data.email,
        country: response.data.country || '',
        city: response.data.city || '',
        profilePhoto: response.data.profilePhoto || ''
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        email: formData.email,
        country: formData.country,
        city: formData.city,
        profilePhoto: formData.profilePhoto
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
        'http://localhost:5000/api/auth/profile/password',
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
      case 'profile':
        return (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
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
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.country}
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
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
                  {user?.username?.charAt(0).toUpperCase()}
                  <div className="photo-overlay">
                    <span>Add Photo</span>
                  </div>
                </>
              )}
            </div>
            <h2>{user?.username}</h2>
            <p>{user?.email}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
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