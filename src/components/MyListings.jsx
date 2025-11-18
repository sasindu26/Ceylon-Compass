import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MyListings.css";

const MyListings = () => {
  const [listings, setListings] = useState({
    events: [],
    restaurants: [],
    accommodations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: "",
    id: "",
    title: "",
  });
  const [activeFilter, setActiveFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your listings");
        return;
      }

      // Fetch all user's listings
      const [eventsRes, restaurantsRes, accommodationsRes] = await Promise.all([
        axios
          .get(
            "https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events/my-listings",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(() => ({ data: [] })),
        axios
          .get(
            "https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/restaurants/my-listings",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(() => ({ data: [] })),
        axios
          .get(
            "https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/accommodations/my-listings",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(() => ({ data: [] })),
      ]);

      // Separate events into listings and requests
      const eventsData = eventsRes.data || [];
      const eventsListings = eventsData.filter(
        (item) => item.type !== "request",
      );
      const eventsRequests = eventsData.filter(
        (item) => item.type === "request",
      );

      setListings({
        events: [...eventsListings, ...eventsRequests], // Combine for display
        restaurants: restaurantsRes.data || [],
        accommodations: accommodationsRes.data || [],
      });
      setError("");
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const { type, id } = deleteModal;

      let endpoint = "";
      if (type === "event") {
        endpoint = `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events/${id}`;
      } else if (type === "restaurant") {
        endpoint = `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/restaurants/${id}`;
      } else if (type === "accommodation") {
        endpoint = `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/accommodations/${id}`;
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh listings after deletion
      await fetchUserListings();
      setDeleteModal({ show: false, type: "", id: "", title: "" });
      alert("Listing deleted successfully!");
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing. Please try again.");
    }
  };

  const openDeleteModal = (type, id, title, itemType) => {
    if (itemType === "request") {
      alert(
        "Pending requests cannot be deleted. Please contact admin if needed.",
      );
      return;
    }
    setDeleteModal({ show: true, type, id, title });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, type: "", id: "", title: "" });
  };

  const getStatusBadge = (status, type) => {
    if (type === "request") {
      return (
        <span className="status-badge status-pending">Pending Review</span>
      );
    }
    const statusMap = {
      pending: { text: "Pending Review", class: "status-pending" },
      approved: { text: "Approved", class: "status-approved" },
      rejected: { text: "Rejected", class: "status-rejected" },
    };
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const filterListings = (items) => {
    if (activeFilter === "all") return items;
    return items.filter((item) => {
      if (item.type === "request") {
        return activeFilter === "pending";
      }
      return item.status?.toLowerCase() === activeFilter;
    });
  };

  const renderListingCard = (item, type) => {
    const typeConfig = {
      event: { icon: "🎉", label: "Event", color: "#0066ff" },
      restaurant: { icon: "🍽️", label: "Restaurant", color: "#ff6b6b" },
      accommodation: { icon: "🏠", label: "Accommodation", color: "#51cf66" },
    };
    const config = typeConfig[type];

    return (
      <div key={item._id} className="listing-card">
        <div className="listing-image">
          <img
            src={item.image || item.images?.[0]}
            alt={item.title || item.name}
          />
          <div
            className="listing-type"
            style={{ backgroundColor: config.color }}
          >
            {config.icon} {config.label}
          </div>
        </div>
        <div className="listing-content">
          <div className="listing-header">
            <h3>{item.title || item.name}</h3>
            {getStatusBadge(item.status, item.type)}
          </div>
          <p className="listing-location">
            📍 {item.city}, {item.country}
          </p>
          {item.date && (
            <p className="listing-date">
              📅 {new Date(item.date).toLocaleDateString()}
            </p>
          )}
          {item.price && (
            <p className="listing-price">
              💰 LKR {item.price.toLocaleString()}
            </p>
          )}
          {item.pricePerNight && (
            <p className="listing-price">
              💰 LKR {item.pricePerNight.toLocaleString()} / night
            </p>
          )}
          <p className="listing-description">
            {item.description?.substring(0, 100)}...
          </p>

          <div className="listing-actions">
            {item.type !== "request" && (
              <button
                className="delete-button"
                onClick={() =>
                  openDeleteModal(
                    type,
                    item._id,
                    item.title || item.name,
                    item.type,
                  )
                }
              >
                🗑️ Delete
              </button>
            )}
            {item.type === "request" && (
              <span className="pending-note">Awaiting admin approval</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getTotalCount = () => {
    const all = [
      ...listings.events,
      ...listings.restaurants,
      ...listings.accommodations,
    ];
    return {
      all: all.length,
      pending: all.filter(
        (item) =>
          item.type === "request" || item.status?.toLowerCase() === "pending",
      ).length,
      approved: all.filter(
        (item) =>
          item.type !== "request" && item.status?.toLowerCase() === "approved",
      ).length,
      rejected: all.filter(
        (item) =>
          item.type !== "request" && item.status?.toLowerCase() === "rejected",
      ).length,
    };
  };

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  const counts = getTotalCount();
  const hasListings = counts.all > 0;

  return (
    <div className="my-listings-container">
      <div className="listings-header">
        <h2>My Listings</h2>
        <p className="listings-subtitle">
          Manage your events, restaurants, and accommodations
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All ({counts.all})
        </button>
        <button
          className={`filter-tab ${activeFilter === "pending" ? "active" : ""}`}
          onClick={() => setActiveFilter("pending")}
        >
          Pending ({counts.pending})
        </button>
        <button
          className={`filter-tab ${activeFilter === "approved" ? "active" : ""}`}
          onClick={() => setActiveFilter("approved")}
        >
          Approved ({counts.approved})
        </button>
        <button
          className={`filter-tab ${activeFilter === "rejected" ? "active" : ""}`}
          onClick={() => setActiveFilter("rejected")}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {!hasListings ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Listings Yet</h3>
          <p>Start by adding your first event, restaurant, or accommodation!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {/* Events */}
          {filterListings(listings.events).map((event) =>
            renderListingCard(event, "event"),
          )}

          {/* Restaurants */}
          {filterListings(listings.restaurants).map((restaurant) =>
            renderListingCard(restaurant, "restaurant"),
          )}

          {/* Accommodations */}
          {filterListings(listings.accommodations).map((accommodation) =>
            renderListingCard(accommodation, "accommodation"),
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete "{deleteModal.title}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="confirm-delete-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
