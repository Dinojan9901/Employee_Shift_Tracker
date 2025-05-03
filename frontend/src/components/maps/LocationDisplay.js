import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationDisplay = ({ locationData }) => {
  // If locationData is not available
  if (!locationData || !Array.isArray(locationData) || locationData.length !== 2) {
    return (
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Location data not available
        </Typography>
      </Paper>
    );
  }

  // Extract longitude and latitude
  const [longitude, latitude] = locationData;
  
  // Create position array for leaflet
  const position = [latitude, longitude];

  return (
    <Box
      sx={{
        height: 200,
        width: '100%',
        position: 'relative',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: 'rgba(255,255,255,0.8)',
          p: 0.5,
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption">
          Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
        </Typography>
      </Box>
      
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Your location at {new Date().toLocaleTimeString()}
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default LocationDisplay;
