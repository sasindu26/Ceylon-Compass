// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app';

export const API_URL = `${API_BASE_URL}/api`;

export default {
  BASE_URL: API_BASE_URL,
  API_URL: API_URL,
  
  // API Endpoints
  endpoints: {
    // Auth
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    forgotPassword: `${API_URL}/auth/forgot-password`,
    resetPassword: `${API_URL}/auth/reset-password`,
    
    // Events
    events: `${API_URL}/events`,
    eventRequests: `${API_URL}/eventreq`,
    
    // Restaurants
    restaurants: `${API_URL}/restaurants`,
    restaurantRequests: `${API_URL}/restaurantreq`,
    
    // Accommodations
    accommodations: `${API_URL}/accommodations`,
    accommodationRequests: `${API_URL}/accommodationreq`,
    
    // Bookings
    bookings: `${API_URL}/bookings`,
    
    // Locations
    locations: `${API_URL}/locations`,
    countries: `${API_URL}/locations/countries`,
    cities: (country) => `${API_URL}/locations/cities/${encodeURIComponent(country)}`,
    
    // Notifications
    notifications: `${API_URL}/notifications`,
    userNotifications: `${API_URL}/notifications/user`,
    
    // Contact
    contact: `${API_URL}/contact`,
    
    // Users
    users: `${API_URL}/users`,
    profile: `${API_URL}/users/profile`,
  }
};
