# Copilot Instructions for RideShare App

## Project Overview
This is a Flutter cross-platform ride-sharing application with separate interfaces for drivers and riders. The app features a fixed $8 fare system regardless of distance, with subscription plans for enhanced features.

## Key Architecture Points

### Project Structure
- `lib/main.dart` - App entry point with GoRouter navigation
- `lib/models/` - Data models (UserModel, RouteModel, RideBooking)
- `lib/providers/app_state.dart` - Central state management using Provider
- `lib/screens/` - UI screens organized by user type (driver/, rider/, home_screen.dart)
- Uses Material Design 3 with blue color scheme (`Colors.blue` seed color)

### Core Features & User Flows
- **Driver Flow**: Create routes → Manage active/inactive status → View bookings → Subscription management
- **Rider Flow**: Browse routes → Filter by location/day → Book rides → Subscription management
- **Fixed Pricing**: $8.00 per ride regardless of distance
- **Route Management**: Drivers set pickup/dropoff points, schedule, and passenger capacity

## Dependencies & Configuration
- **State Management**: `provider: ^6.1.1` for app-wide state
- **Navigation**: `go_router: ^12.1.3` for declarative routing
- **Location Services**: `geolocator: ^10.1.0`, `geocoding: ^2.1.1`
- **Maps**: `google_maps_flutter: ^2.5.0`, `flutter_map: ^6.1.0`
- **Storage**: `shared_preferences: ^2.2.2` for user persistence
- **HTTP**: `http: ^1.1.2` for API calls (not yet implemented)

## Development Workflows

### Essential Commands
```bash
flutter pub get              # Install dependencies
flutter run                  # Run on connected device/emulator
flutter test                 # Run widget tests
flutter analyze              # Static analysis
flutter build apk            # Build Android APK
flutter build web            # Build for web deployment
```

### State Management Pattern
- **AppState**: Central provider managing users, routes, and bookings
- **Sample Data**: `initializeSampleData()` provides demo routes and bookings
- **User Types**: Enum-based UserType (driver/rider) with role-based navigation
- **Route Status**: Toggle-able active/inactive states for driver routes

## Code Patterns & Conventions

### Navigation Structure
```
/ (HomeScreen)
├── /driver (DriverDashboard)
│   ├── /driver/create-route (CreateRouteScreen)
│   └── /driver/subscription (DriverSubscriptionScreen)
└── /rider (RiderDashboard)
    ├── /rider/routes (AvailableRoutesScreen)
    └── /rider/subscription (RiderSubscriptionScreen)
```

### Model Architecture
- **RouteModel**: Driver-created routes with coordinates, schedule, and capacity
- **RideBooking**: Bookings linking riders to routes with status tracking
- **UserModel**: User profiles with subscription status and preferences
- Fixed fare system: All models assume $8.00 per ride

### UI Components
- Card-based layouts with Material Design 3
- Status indicators (active/inactive routes, booking statuses)
- Filter chips for day selection and route filtering
- Subscription tiers with feature comparison cards

## Integration Points
- **Package ID**: `com.example.sharing_app` (update for production)
- **Maps Integration**: Google Maps for route creation (requires API keys)
- **Location Services**: Real-time location for pickup/dropoff
- **Payment Processing**: Not yet implemented (subscription dialogs are UI-only)

## Development Notes
- **Demo Mode**: App includes sample data for testing without backend
- **Coordinate System**: Uses NYC area coordinates (40.7x, -73.9x) for demo routes
- **Subscription Logic**: UI-complete but needs payment integration
- **Real-time Features**: Route status changes are local-only, needs websocket/polling
- **Testing**: Widget tests cover navigation and core UI elements