import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import { 
  LocationOn, 
  MyLocation, 
  ZoomIn, 
  ZoomOut,
  Layers
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const startIcon = createCustomIcon('green');
const endIcon = createCustomIcon('red');
const currentIcon = createCustomIcon('blue');
const breakIcon = createCustomIcon('orange');

// Map controls component
const MapControls = ({ onLocate, onZoomIn, onZoomOut, onChangeLayer }) => {
  const [layerIndex, setLayerIndex] = useState(0);
  const layers = ['street', 'satellite', 'terrain'];
  
  const handleLayerChange = () => {
    const newIndex = (layerIndex + 1) % layers.length;
    setLayerIndex(newIndex);
    onChangeLayer(layers[newIndex]);
  };
  
  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        right: 10, 
        top: 10, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: '50%', 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Tooltip title="My Location" placement="left" arrow>
          <IconButton size="small" onClick={onLocate} color="primary">
            <MyLocation />
          </IconButton>
        </Tooltip>
      </Paper>
      
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: '50%', 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Tooltip title="Zoom In" placement="left" arrow>
          <IconButton size="small" onClick={onZoomIn} color="primary">
            <ZoomIn />
          </IconButton>
        </Tooltip>
      </Paper>
      
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: '50%', 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Tooltip title="Zoom Out" placement="left" arrow>
          <IconButton size="small" onClick={onZoomOut} color="primary">
            <ZoomOut />
          </IconButton>
        </Tooltip>
      </Paper>
      
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: '50%', 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Tooltip title={`Map Style: ${layers[layerIndex]}`} placement="left" arrow>
          <IconButton size="small" onClick={handleLayerChange} color="primary">
            <Layers />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

// Component to handle map interactions
const MapInteractions = ({ center, zoom, locateUser, mapLayer }) => {
  const map = useMap();
  
  // Handle zooming
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  // Handle centering on user
  const handleLocate = () => {
    if (locateUser) {
      map.setView([locateUser.latitude, locateUser.longitude], 16);
    }
  };
  
  // Handle changing map layer
  const handleChangeLayer = (layer) => {
    // Implementation for changing map layer would go here
    // This would require additional map providers
    console.log('Changing to', layer);
  };
  
  // Update center when it changes
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return (
    <MapControls 
      onLocate={handleLocate} 
      onZoomIn={handleZoomIn} 
      onZoomOut={handleZoomOut} 
      onChangeLayer={handleChangeLayer}
    />
  );
};

const EnhancedLocationMap = ({ 
  locationData, 
  currentLocation, 
  shift,
  height = 400
}) => {
  const theme = useTheme();
  const [mapLayer, setMapLayer] = useState('street');
  
  // If no valid data is provided
  if (!locationData && !currentLocation && !shift) {
    return (
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <LocationOn sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          Location data not available
        </Typography>
      </Paper>
    );
  }

  // Determine position to center the map
  let position = [0, 0];
  let zoom = 13;
  
  if (locationData && Array.isArray(locationData) && locationData.length === 2) {
    // For backward compatibility with the old component
    position = [locationData[1], locationData[0]]; // [lat, lng]
  } else if (currentLocation) {
    position = [currentLocation.latitude, currentLocation.longitude];
    zoom = 15;
  } else if (shift && shift.startLocation) {
    position = [shift.startLocation.coordinates[1], shift.startLocation.coordinates[0]];
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        height,
        position: 'relative',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Map info panel */}
      <Fade in={true}>
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(255,255,255,0.8)',
            p: 1,
            borderRadius: 1,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: 1,
            maxWidth: 200,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
            Current Position
          </Typography>
          <Typography variant="caption">
            Lat: {position[0].toFixed(6)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Lng: {position[1].toFixed(6)}
          </Typography>
        </Box>
      </Fade>
      
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Show current location */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]} 
            icon={currentIcon}
          >
            <Popup>
              Your current location
              <br />
              {new Date().toLocaleTimeString()}
            </Popup>
            <Circle 
              center={[currentLocation.latitude, currentLocation.longitude]}
              radius={100}
              pathOptions={{ 
                color: theme.palette.primary.main, 
                fillColor: theme.palette.primary.main,
                fillOpacity: 0.2
              }}
            />
          </Marker>
        )}
        
        {/* Show shift locations if available */}
        {shift && shift.startLocation && Array.isArray(shift.startLocation.coordinates) && 
         shift.startLocation.coordinates.length >= 2 && (
          <Marker 
            position={[shift.startLocation.coordinates[1], shift.startLocation.coordinates[0]]}
            icon={startIcon}
          >
            <Popup>
              Shift start location
              <br />
              {shift.startTime ? new Date(shift.startTime).toLocaleString() : 'No time data'}
            </Popup>
          </Marker>
        )}
        
        {shift && shift.endLocation && Array.isArray(shift.endLocation.coordinates) && 
         shift.endLocation.coordinates.length >= 2 && (
          <Marker 
            position={[shift.endLocation.coordinates[1], shift.endLocation.coordinates[0]]}
            icon={endIcon}
          >
            <Popup>
              Shift end location
              <br />
              {shift.endTime ? new Date(shift.endTime).toLocaleString() : 'No time data'}
            </Popup>
          </Marker>
        )}
        
        {/* Show break locations */}
        {shift && shift.breaks && Array.isArray(shift.breaks) && shift.breaks.map((breakItem, index) => {
          // Only render markers for break items with valid location data
          if (!breakItem || !breakItem.location || !Array.isArray(breakItem.location.coordinates) || 
              breakItem.location.coordinates.length < 2) {
            return null;
          }
          
          return (
            <Marker
              key={index}
              position={[breakItem.location.coordinates[1], breakItem.location.coordinates[0]]}
              icon={breakIcon}
            >
              <Popup>
                {breakItem.type || 'Unknown'} break
                <br />
                Started: {breakItem.startTime ? new Date(breakItem.startTime).toLocaleString() : 'Unknown'}
                <br />
                {breakItem.endTime ? `Ended: ${new Date(breakItem.endTime).toLocaleString()}` : 'Still on break'}
              </Popup>
            </Marker>
          );
        })}
        
        <MapInteractions 
          center={position} 
          zoom={zoom} 
          locateUser={currentLocation}
          mapLayer={mapLayer}
        />
      </MapContainer>
    </Paper>
  );
};

export default EnhancedLocationMap;
