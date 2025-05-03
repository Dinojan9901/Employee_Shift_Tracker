# Employee Shift Tracker

A full stack web application that enables employees to log in, track their working hours, and record their check-in/check-out location using browser geolocation.

## Tech Stack

- **Frontend**: React, Material-UI, React Router DOM, Leaflet Maps
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication

## Features

- **Authentication System**
  - Employee login with JWT authentication
  - Registration functionality
  
- **Shift Management**
  - Start Shift: Record time and location
  - Pause Shift: Take lunch or short breaks
  - Resume Shift after breaks
  - End Shift (Check-Out): Record end time and location
  - Display total hours worked, excluding break time
  
- **Location Tracking**
  - Capture GPS location (latitude & longitude) at:
    - Check-In
    - Breaks
    - Check-Out
  
- **Dashboard**
  - Show current shift status (e.g., Working, On Break)
  - Display total hours worked for the current day
  - View history of past shifts
  
- **Admin Panel**
  - View all employee check-in/check-out times
  - Track shift durations and locations
  - Export shift records as CSV

- **Additional Features**
  - Dark mode toggle
  - Responsive design (mobile + desktop)
  - Map preview for location using Leaflet
  - Employee shift statistics: weekly/monthly total hours
  - Error handling and form validations

## Project Structure

```
employee-shift-tracker/
│
├── backend/                 # Backend Node.js/Express API
│   ├── config/              # Configuration settings
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── server.js            # Entry point
│
└── frontend/                # React frontend
    ├── public/              # Static files
    └── src/
        ├── assets/          # Images, fonts, etc.
        ├── components/      # React components
        │   ├── auth/        # Authentication components
        │   ├── dashboard/   # Dashboard components
        │   ├── layouts/     # Layout components
        │   ├── maps/        # Map components
        │   └── shifts/      # Shift management components
        ├── context/         # React context providers
        ├── hooks/           # Custom hooks
        ├── pages/           # Page components
        ├── services/        # API services
        └── utils/           # Utility functions
```

## Installation and Setup

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory
   ```
   cd employee-shift-tracker/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/shift-tracker
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the backend server
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd employee-shift-tracker/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the frontend development server
   ```
   npm start
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get token
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/logout` - Logout user

### Shift Management Endpoints

- `POST /api/shifts/start` - Start a new shift
- `PUT /api/shifts/end` - End current shift
- `PUT /api/shifts/break/start` - Start a break
- `PUT /api/shifts/break/end` - End a break
- `GET /api/shifts/current` - Get current active shift
- `GET /api/shifts` - Get all shifts for current user
- `GET /api/shifts/all` - Get all shifts (admin only)

## License

This project is licensed under the MIT License.
