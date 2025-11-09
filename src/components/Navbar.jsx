import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout, unreadNotificationsCount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path) => {
    return window.location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Ceylon<span>Compass</span>
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        <div className={`navbar-content ${menuOpen ? 'open' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/restaurants" className={`nav-link ${isActive('/restaurants')}`} onClick={() => setMenuOpen(false)}>
                Restaurants
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/events" className={`nav-link ${isActive('/events')}`} onClick={() => setMenuOpen(false)}>
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/accommodations" className={`nav-link ${isActive('/accommodations')}`} onClick={() => setMenuOpen(false)}>
                Accommodations
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={() => setMenuOpen(false)}>
                Contact Us
              </Link>
            </li>
          </ul>
          
          <div className="navbar-right">
            {/* Location Display - Only shown when user is logged in */}
            {user && user.city && user.country && (
              <div className="location-display">
                <i className="fas fa-map-marker-alt"></i>
                <span>{`${user.city}, ${user.country}`}</span>
              </div>
            )}
            
            {/* User Menu */}
            {user ? (
              <div className="user-menu">
                {/* Only show Profile link for non-admin users */}
                {user.role !== 'admin' && (
                  <Link to="/profile" className={`profile-link ${isActive('/profile')}`} onClick={() => setMenuOpen(false)}>
                    <div className="profile-link-container">
                      <i className="fas fa-user"></i>
                      <span>Profile</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="notification-badge">{unreadNotificationsCount}</span>
                      )}
                    </div>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className={`admin-link ${isActive('/admin')}`} onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-cog"></i>
                    <span>Admin</span>
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;