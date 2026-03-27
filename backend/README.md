# RideShare Backend API

A Node.js/Express backend API for the RideShare mobile application with MongoDB database integration.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Driver and rider profiles with subscription management
- **Route Management**: CRUD operations for ride routes with geolocation
- **Booking System**: Complete ride booking workflow with real-time status updates
- **Rating System**: Mutual rating system between drivers and riders
- **Messaging**: In-app messaging between booking participants
- **Geolocation**: Location-based route finding and user matching
- **Security**: Comprehensive security middleware (helmet, rate limiting, CORS)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Mongoose validation with custom error handling
- **Environment**: dotenv for configuration management

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `PUT /reset-password/:token` - Reset password
- `POST /logout` - User logout

### Users (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /nearby` - Find nearby users
- `GET /:id` - Get single user
- `PUT /:id` - Update user (own profile only)
- `DELETE /:id` - Deactivate account
- `GET /:id/stats` - Get user statistics
- `GET /:id/rides` - Get user's ride history
- `PUT /:id/subscription` - Update subscription
- `DELETE /:id/subscription` - Cancel subscription

### Routes (`/api/routes`)
- `GET /` - Get all available routes (with filtering)
- `GET /search` - Search routes by location/criteria
- `GET /by-day/:day` - Get routes by day of week
- `GET /driver/:driverId` - Get driver's routes
- `POST /` - Create new route (drivers only)
- `GET /:id` - Get single route details
- `PUT /:id` - Update route (owner only)
- `DELETE /:id` - Delete route (owner only)
- `PATCH /:id/toggle-status` - Toggle route active/inactive
- `GET /:id/bookings` - Get route bookings (driver only)

### Bookings (`/api/bookings`)
- `POST /` - Create new booking (riders only)
- `GET /` - Get user's bookings
- `GET /:id` - Get booking details
- `PATCH /:id/status` - Update booking status (driver only)
- `DELETE /:id` - Cancel booking
- `POST /:id/rate` - Add rating/review
- `POST /:id/messages` - Send message
- `GET /:id/messages` - Get booking messages

## Installation & Setup

### Prerequisites
1. **Node.js** (v16+ recommended) - [Download Node.js](https://nodejs.org/)
2. **MongoDB** - [Install MongoDB](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
3. **Git** - [Download Git](https://git-scm.com/downloads)

### Setup Steps

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following required variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/rideshare_app
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   # On Windows
   mongod
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Test the API**:
   - Open browser: `http://localhost:3000`
   - Health check: `http://localhost:3000/api/health`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/rideshare_app
JWT_SECRET=your-jwt-secret-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

## Database Models

### User Model
- Authentication and profile data
- Role-based fields (driver/rider specific)
- Subscription management
- Location and preferences
- Rating system integration

### Route Model
- Pickup and dropoff locations with coordinates
- Scheduling and capacity management
- Pricing (fixed $8.00 fare)
- Driver preferences and requirements
- Statistics and booking tracking

### RideBooking Model
- Complete booking lifecycle management
- Payment integration ready
- Real-time messaging system
- Rating and review system
- Cancellation and refund handling

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin request handling
- **Helmet.js**: Security headers and protection
- **Input Validation**: Comprehensive Mongoose validation
- **Password Hashing**: Bcrypt for secure password storage
- **Environment Isolation**: Secure configuration management

## API Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "userType": "rider"
}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john@example.com",
  "password": "securePassword123"
}'
```

### Create a Route (Driver)
```bash
curl -X POST http://localhost:3000/api/routes \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "title": "NYC to JFK Airport",
  "pickupLocation": {
    "name": "Times Square",
    "address": "Times Square, New York, NY",
    "coordinates": [-73.985656, 40.758896]
  },
  "dropoffLocation": {
    "name": "JFK Airport",
    "address": "JFK Airport, Queens, NY",
    "coordinates": [-73.778139, 40.641311]
  },
  "schedule": {
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "departureTime": "08:00"
  },
  "maxPassengers": 3
}'
```

### Book a Ride (Rider)
```bash
curl -X POST http://localhost:3000/api/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "routeId": "ROUTE_ID_HERE",
  "rideDate": "2024-01-15",
  "numberOfPassengers": 1,
  "paymentMethod": "card"
}'
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear auth failure responses
- **Authorization Errors**: Permission-based error messages
- **Database Errors**: Graceful handling of DB connection issues
- **Rate Limiting**: Clear rate limit exceeded messages
- **Server Errors**: Sanitized error responses in production

## Integration with Flutter App

The backend is designed to work seamlessly with the Flutter frontend:

1. **Authentication Flow**: JWT tokens for stateless authentication
2. **Data Models**: JSON responses match Flutter model classes
3. **File Uploads**: Ready for profile image uploads
4. **Push Notifications**: FCM integration prepared
5. **Real-time Features**: WebSocket endpoints for live updates
6. **Geolocation**: Full coordinate-based matching system

## Future Enhancements

- **Payment Integration**: Stripe/PayPal payment processing
- **Real-time Tracking**: Socket.io for live ride tracking
- **Push Notifications**: Firebase Cloud Messaging
- **Email Service**: Automated email notifications
- **File Upload**: Profile image and document upload
- **Analytics**: Ride statistics and reporting
- **Admin Panel**: Web-based administration interface

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@rideshare.com
- Documentation: [API Documentation](http://localhost:3000/api)

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Complete authentication system
- Route management functionality
- Booking system implementation
- Rating and messaging features
- Production-ready security measures