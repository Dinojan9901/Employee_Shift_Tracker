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
├── backend/           # Node.js Express API
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Auth middleware
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── utils/         # Helper functions
│   └── server.js      # Entry point
│
├── frontend/          # React application
    ├── public/        # Static files
    └── src/           # React source code
        ├── components/# React components
        ├── context/   # Context API providers
        ├── pages/     # Page components
        └── utils/     # Helper functions
```

## Deployment Instructions

The application has been configured for easy deployment to Render for both frontend and backend.

### Frontend Deployment to Render

1. Create a Render account at [render.com](https://render.com)
2. Create a new Static Site
3. Connect your GitHub repository
4. Use the following settings:
   - **Name**: employeeshift
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
5. Add the environment variables from your `.env.production` file
6. Click "Create Static Site"

This will deploy your frontend to a URL like `https://employeeshift.onrender.com`.

### Backend Deployment to Render

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Use the following settings:
   - **Name**: employee-shift-tracker-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the following environment variables:
   - `NODE_ENV`: production
   - `MONGO_URI`: your MongoDB connection string
   - `JWT_SECRET`: your secret key
   - `JWT_EXPIRE`: 30d
   - `JWT_COOKIE_EXPIRE`: 30
   - `EMAIL_HOST`: your SMTP server
   - `EMAIL_PORT`: your SMTP port
   - `EMAIL_USER`: your email username
   - `EMAIL_PASS`: your email password
   - `EMAIL_FROM`: sender email address

### Connecting Frontend to Backend

After deploying both services:

1. Get your backend API URL from Render (e.g., https://employee-shift-tracker.onrender.com)
2. Update the file `frontend/.env.production` with:
   ```
   REACT_APP_API_URL=https://employee-shift-tracker.onrender.com/api
   REACT_APP_USE_LOCAL_API=false
   ```
3. Add these environment variables to your Render static site settings
4. Redeploy the frontend to apply the changes

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up a database user and password
4. Whitelist all IP addresses (0.0.0.0/0) for development
5. Get your connection string and replace `<username>`, `<password>`, and `<dbname>` with your credentials
6. Use this connection string as your `MONGO_URI` environment variable

## Live Demo

Access the live demo of the application:

- **Frontend**: [https://employeeshift.onrender.com](https://employeeshift.onrender.com)
- **Backend API**: [https://employee-shift-tracker.onrender.com](https://employee-shift-tracker.onrender.com)
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
