import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import logo from "../assets/images/logo.jpg";

const Navbar = () => {
  const { user, logout, unreadNotificationsCount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo - Left Side */}
        <Link to="/" className="navbar-logo">
          <img
            src={logo}
            alt="Ceylon Compass Logo"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">CeylonCompass</span>
        </Link>

        {/* Hamburger Menu Toggle for Mobile */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <div className={`hamburger ${menuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Center Navigation Links */}
        <ul className={`navbar-nav ${menuOpen ? "open" : ""}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive("/")}`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/restaurants"
              className={`nav-link ${isActive("/restaurants")}`}
              onClick={() => setMenuOpen(false)}
            >
              Restaurants
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/events"
              className={`nav-link ${isActive("/events")}`}
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/accommodations"
              className={`nav-link ${isActive("/accommodations")}`}
              onClick={() => setMenuOpen(false)}
            >
              Accommodations
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/about"
              className={`nav-link ${isActive("/about")}`}
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/contact"
              className={`nav-link ${isActive("/contact")}`}
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Right Side - Location & User Menu */}
        <div className={`navbar-right ${menuOpen ? "open" : ""}`}>
          {/* Location Display - Only shown when user is logged in and not an admin */}
          {user && user.country && user.role !== "admin" && (
            <div className="location-display">
              <i className="fas fa-map-marker-alt"></i>
              <div className="location-text">
                <span className="location-city">
                  {user.city || "Your Location"}
                </span>
                <span className="location-country">{user.country}</span>
              </div>
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              {/* Only show Profile link for non-admin users */}
              {user.role !== "admin" && (
                <Link
                  to="/profile"
                  className={`profile-link ${isActive("/profile")}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="profile-link-container">
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="notification-badge">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`admin-link ${isActive("/admin")}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fas fa-cog"></i>
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn-login"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-register"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
