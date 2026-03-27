# Routes - Ride Together 🚗

A Flutter-based ride-sharing application with real-time updates, payment integration, and a fixed $8 fare system.

## ✨ Features

### Core Functionality
- **Fixed $8 Fare** - Simple pricing regardless of distance
- **Driver Dashboard** - Create and manage routes, view bookings
- **Rider Dashboard** - Browse available routes, book rides
- **Route Management** - Set pickup/dropoff locations with scheduling
- **Real-time Updates** - Live route status and booking notifications

### Advanced Features  
- **Payment System** - Stripe integration with digital wallet
- **Subscription Tiers** - Premium features for drivers and riders
- **Live Status Indicators** - Real-time connection monitoring
- **Interactive Maps** - Google Maps integration for route visualization
- **Cross-platform** - Works on Android, iOS, and Web

## 🚀 Quick Start

### Prerequisites
- Flutter SDK (3.0+)
- Android Studio / VS Code
- Android device/emulator or iOS simulator

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd routes-app

# Install dependencies
flutter pub get

# Run the app
flutter run
```

### Try the Demo
1. **Select User Type** - Choose Driver or Rider on home screen
2. **Explore Features** - Navigate through dashboards and screens
3. **Real-time Demo** - Tap the TV icon to see live updates
4. **Payment Demo** - Access payment screens (Stripe test mode)

## 📱 Screenshots

### Home Screen & Branding
- Clean green theme with Routes logo
- User type selection (Driver/Rider)
- Professional Material Design 3 interface

### Driver Features
- Route creation with pickup/dropoff points
- Active/inactive route toggling with real-time sync
- Booking management and passenger tracking
- Subscription management for premium features

### Rider Features  
- Browse available routes with filters
- Real-time seat availability updates
- One-click booking with instant confirmation
- Payment integration with multiple methods

### Real-time System
- Live connection status indicators
- WebSocket-based instant updates
- Interactive demo with simulation buttons
- Toast notifications for connection changes

## 🛠 Technology Stack

- **Frontend**: Flutter (Dart)
- **State Management**: Provider pattern
- **Navigation**: GoRouter for declarative routing
- **Payments**: Stripe SDK integration
- **Real-time**: Socket.IO WebSocket client
- **Maps**: Google Maps Flutter plugin
- **Storage**: SharedPreferences for user data

## 🌐 Platform Support

- ✅ **Android** - APK ready for installation
- ✅ **Web** - Deployable to any hosting service  
- ✅ **iOS** - Requires macOS for building
- ✅ **Windows** - Desktop app support
- ✅ **macOS/Linux** - Cross-platform compatibility

## 🔧 Configuration

### API Keys Required (Optional)
- **Google Maps**: For route visualization
- **Stripe**: For payment processing
- **Backend WebSocket**: For real-time features

### Environment Setup
```dart
// lib/config/api_keys.dart (create if needed)
class ApiKeys {
  static const String googleMapsApi = 'your-google-maps-key';
  static const String stripePublishableKey = 'your-stripe-key';
}
```

## 🚦 Real-time Features

The app includes a comprehensive real-time system:

- **WebSocket Integration** - Socket.IO client for live updates
- **Event Broadcasting** - Route and booking changes sync instantly  
- **Connection Management** - Auto-reconnection with status indicators
- **Demo Mode** - Interactive testing without backend server

### Backend Requirements
For full real-time functionality, set up a WebSocket server:
```javascript
// Basic Socket.IO server (Node.js)
const io = require('socket.io')(3001);
io.on('connection', (socket) => {
  // Handle route updates, bookings, location sharing
});
```

## 💳 Payment Integration

Stripe-powered payment system includes:
- **Digital Wallet** - Store payment methods securely
- **Transaction History** - Track all ride payments
- **Subscription Billing** - Recurring premium features
- **Test Mode** - Safe testing with demo cards

## 📦 Build & Deploy

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Web Deployment
```bash
flutter build web --release
# Output: build/web/ (ready for any hosting service)
```

### App Stores
- **Google Play**: Upload `flutter build appbundle`
- **App Store**: Build on macOS with `flutter build ios`

## 🤝 Contributing

This is a demonstration project showcasing:
- Flutter cross-platform development
- Real-time WebSocket integration  
- Payment system implementation
- Professional UI/UX design
- State management patterns

## 📄 License

This project is for demonstration purposes. See individual package licenses for dependencies.

## 🎯 Future Enhancements

- [ ] Backend API integration
- [ ] Push notifications
- [ ] GPS tracking with live maps
- [ ] Driver rating system  
- [ ] Multi-language support
- [ ] Offline mode capabilities

---

**Try the live demo:** [Deploy to web hosting service]  
**Download APK:** [Link to release APK]  
**View Code:** [GitHub repository link]

Built with ❤️ using Flutter
