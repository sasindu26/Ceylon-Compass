import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  
  return null;
};

const LocationMarker = ({ position, onMarkerClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      const newPos = e.latlng;
      onMarkerClick(newPos);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMarkerClick]);

  return position ? <Marker position={position} /> : null;
};

const MapLocationPicker = ({ onLocationSelect, initialPosition = null }) => {
  const defaultCenter = initialPosition || { lat: 7.8731, lng: 80.7718 }; // Sri Lanka center
  const [position, setPosition] = useState(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([defaultCenter.lat, defaultCenter.lng]);
  const [mapZoom, setMapZoom] = useState(8);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=lk`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = { lat, lng };
    
    setPosition(newPos);
    setMapCenter([lat, lng]);
    setMapZoom(16);
    setSearchQuery(result.display_name);
    setSearchResults([]);

    if (onLocationSelect) {
      onLocationSelect({
        address: result.display_name,
        coordinates: {
          lat: lat,
          lng: lng
        }
      });
    }
  };

  const handleMarkerClick = (newPos) => {
    setPosition(newPos);
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
      .then(response => response.json())
      .then(data => {
        const address = data.display_name;
        setSearchQuery(address);
        if (onLocationSelect) {
          onLocationSelect({
            address: address,
            coordinates: {
              lat: newPos.lat,
              lng: newPos.lng
            }
          });
        }
      })
      .catch(error => {
        console.error('Error getting address:', error);
        const fallbackAddress = `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`;
        setSearchQuery(fallbackAddress);
        if (onLocationSelect) {
          onLocationSelect({
            address: fallbackAddress,
            coordinates: {
              lat: newPos.lat,
              lng: newPos.lng
            }
          });
        }
      });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '15px', position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Search location (e.g., OGF Colombo, Galle Fort, etc.)"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {searching && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '12px',
            fontSize: '12px',
            color: '#666'
          }}>
            Searching...
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginTop: '5px',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(result)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                  {result.display_name.split(',')[0]}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {result.display_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Search for a location above or click on the map to select
      </p>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        <LocationMarker 
          position={position} 
          onMarkerClick={handleMarkerClick}
        />
      </MapContainer>
    </div>
  );
};

export default MapLocationPicker;
