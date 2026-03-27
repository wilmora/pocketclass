import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../models/user_model.dart';
import '../models/route_model.dart';
import '../models/ride_booking.dart';
import '../services/realtime_service.dart';

class AppState extends ChangeNotifier {
  UserModel? _currentUser;
  List<RouteModel> _routes = [];
  List<RideBooking> _bookings = [];
  
  // Real-time service instance
  final RealtimeService _realtimeService = RealtimeService();
  
  // Subscriptions for real-time updates
  StreamSubscription<RouteModel>? _routeUpdatesSubscription;
  StreamSubscription<RideBooking>? _bookingUpdatesSubscription;
  StreamSubscription<RealtimeEvent>? _eventSubscription;
  
  // Connection status
  bool _isRealtimeConnected = false;

  UserModel? get currentUser => _currentUser;
  List<RouteModel> get routes => _routes;
  List<RideBooking> get bookings => _bookings;
  bool get isRealtimeConnected => _isRealtimeConnected;
  RealtimeService get realtimeService => _realtimeService;

  // Get routes for the current driver
  List<RouteModel> get currentDriverRoutes {
    if (_currentUser?.userType != UserType.driver) return [];
    return _routes.where((route) => route.driverId == _currentUser!.id).toList();
  }

  // Get active routes for riders to see
  List<RouteModel> get activeRoutes {
    return _routes.where((route) => route.isActive).toList();
  }

  // Get bookings for current user
  List<RideBooking> get currentUserBookings {
    if (_currentUser == null) return [];
    
    if (_currentUser!.userType == UserType.driver) {
      return _bookings.where((booking) => booking.driverId == _currentUser!.id).toList();
    } else {
      return _bookings.where((booking) => booking.riderId == _currentUser!.id).toList();
    }
  }

  // Set current user
  void setCurrentUser(UserModel user) {
    _currentUser = user;
    _saveUserToPrefs(user);
    notifyListeners();
  }

  // Load user from preferences
  Future<void> loadUserFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('current_user');
    if (userData != null) {
      // In a real app, you'd parse JSON here
      // For demo purposes, we'll create a sample user
      _currentUser = UserModel(
        id: 'demo_user',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+1234567890',
        userType: UserType.driver,
        createdAt: DateTime.now(),
      );
      notifyListeners();
    }
  }

  // Save user to preferences
  Future<void> _saveUserToPrefs(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('current_user', user.toJson().toString());
  }

  // Add a new route
  void addRoute(RouteModel route) {
    _routes.add(route);
    
    // Emit real-time event if connected
    if (_isRealtimeConnected) {
      _realtimeService.emitRouteCreated(route);
    }
    
    notifyListeners();
  }

  // Update route
  void updateRoute(RouteModel updatedRoute) {
    final index = _routes.indexWhere((route) => route.id == updatedRoute.id);
    if (index != -1) {
      _routes[index] = updatedRoute;
      
      // Emit real-time event if connected
      if (_isRealtimeConnected) {
        _realtimeService.emitRouteUpdate(updatedRoute);
      }
      
      notifyListeners();
    }
  }

  // Toggle route active status
  void toggleRouteStatus(String routeId) {
    final index = _routes.indexWhere((route) => route.id == routeId);
    if (index != -1) {
      _routes[index] = _routes[index].copyWith(
        isActive: !_routes[index].isActive,
      );
      
      // Emit real-time event if connected
      if (_isRealtimeConnected) {
        _realtimeService.emitRouteUpdate(_routes[index]);
      }
      
      notifyListeners();
    }
  }

  // Book a ride
  void bookRide(RideBooking booking) {
    _bookings.add(booking);
    
    // Update available seats (decrease when booking)
    final routeIndex = _routes.indexWhere((route) => route.id == booking.routeId);
    if (routeIndex != -1) {
      final currentRoute = _routes[routeIndex];
      if (currentRoute.availableSeats > 0) {
        _routes[routeIndex] = currentRoute.copyWith(
          availableSeats: currentRoute.availableSeats - 1,
        );
        
        // Emit real-time events if connected
        if (_isRealtimeConnected) {
          _realtimeService.emitBookingCreated(booking);
          _realtimeService.emitRouteUpdate(_routes[routeIndex]);
        }
      }
    }
    
    notifyListeners();
  }

  // Add booking (alias for bookRide)
  void addBooking(RideBooking booking) {
    bookRide(booking);
  }

  // Update booking status
  void updateBookingStatus(String bookingId, RideStatus status) {
    final index = _bookings.indexWhere((booking) => booking.id == bookingId);
    if (index != -1) {
      _bookings[index] = _bookings[index].copyWith(status: status);
      
      // Emit real-time event if connected
      if (_isRealtimeConnected) {
        _realtimeService.emitBookingUpdate(_bookings[index]);
      }
      
      notifyListeners();
    }
  }

  // Switch user type (for demo purposes)
  void switchUserType(UserType newType) {
    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(userType: newType);
      notifyListeners();
    }
  }

  // Initialize with sample data
  void initializeSampleData() {
    // Sample routes
    _routes = [
      RouteModel(
        id: 'route_1',
        driver: const DriverInfo(
          id: 'driver_1',
          name: 'John Doe',
        ),
        title: 'Main St to Oak Ave',
        pickupLocation: const LocationPoint(
          name: 'Main Street Pickup',
          address: '123 Main St, City A',
          latitude: 40.7128,
          longitude: -74.0060,
        ),
        dropoffLocation: const LocationPoint(
          name: 'Oak Avenue Dropoff',
          address: '456 Oak Ave, City B',
          latitude: 40.7589,
          longitude: -73.9851,
        ),
        schedule: const RouteSchedule(
          daysOfWeek: ['monday', 'wednesday', 'friday'],
          departureTime: '08:00',
        ),
        maxPassengers: 3,
        availableSeats: 2,
        isActive: true,
        createdAt: DateTime.now(),
      ),
      RouteModel(
        id: 'route_2',
        driver: const DriverInfo(
          id: 'driver_2',
          name: 'Jane Smith',
        ),
        title: 'Pine St to Elm St',
        pickupLocation: const LocationPoint(
          name: 'Pine Street Pickup',
          address: '789 Pine St, City A',
          latitude: 40.7505,
          longitude: -73.9934,
        ),
        dropoffLocation: const LocationPoint(
          name: 'Elm Street Dropoff',
          address: '321 Elm St, City C',
          latitude: 40.7831,
          longitude: -73.9712,
        ),
        schedule: const RouteSchedule(
          daysOfWeek: ['tuesday', 'thursday'],
          departureTime: '07:30',
        ),
        maxPassengers: 4,
        availableSeats: 4,
        isActive: true,
        createdAt: DateTime.now(),
      ),
    ];

    // Sample bookings
    _bookings = [
      RideBooking(
        id: 'booking_1',
        routeId: 'route_1',
        riderId: 'rider_1',
        riderName: 'Alice Johnson',
        driverId: 'driver_1',
        status: RideStatus.accepted,
        bookingDate: DateTime.now(),
        rideDate: DateTime.now().add(const Duration(days: 1)),
      ),
    ];

    notifyListeners();
  }

  // Initialize real-time connection
  Future<void> initializeRealtime() async {
    if (_currentUser == null) return;

    try {
      await _realtimeService.connect(_currentUser!.id);
      _isRealtimeConnected = true;
      
      // Subscribe to route updates
      _routeUpdatesSubscription = _realtimeService.routeUpdates.listen((updatedRoute) {
        final index = _routes.indexWhere((route) => route.id == updatedRoute.id);
        if (index != -1) {
          _routes[index] = updatedRoute;
          notifyListeners();
        }
      });
      
      // Subscribe to booking updates
      _bookingUpdatesSubscription = _realtimeService.bookingUpdates.listen((updatedBooking) {
        final index = _bookings.indexWhere((booking) => booking.id == updatedBooking.id);
        if (index != -1) {
          _bookings[index] = updatedBooking;
          notifyListeners();
        } else {
          // New booking
          _bookings.add(updatedBooking);
          notifyListeners();
        }
      });
      
      // Subscribe to general events
      _eventSubscription = _realtimeService.events.listen((event) {
        // Handle general real-time events like notifications
        _handleRealtimeEvent(event);
      });
      
      notifyListeners();
    } catch (e) {
      print('Failed to initialize real-time connection: $e');
      _isRealtimeConnected = false;
      notifyListeners();
    }
  }

  // Handle real-time events
  void _handleRealtimeEvent(RealtimeEvent event) {
    switch (event.type) {
      case RealtimeEventType.newBooking:
        // Handle new booking request
        print('New booking request: ${event.data}');
        break;
      case RealtimeEventType.routeStatusChanged:
        // Handle route status changes
        print('Route status changed: ${event.data}');
        break;
      case RealtimeEventType.driverLocationUpdate:
      case RealtimeEventType.riderLocationUpdate:
        // Handle location updates
        print('Location update: ${event.data}');
        break;
      default:
        print('Unknown event type: ${event.type}');
    }
  }

  // Disconnect real-time service
  Future<void> disconnectRealtime() async {
    await _routeUpdatesSubscription?.cancel();
    await _bookingUpdatesSubscription?.cancel();
    await _eventSubscription?.cancel();
    
    _routeUpdatesSubscription = null;
    _bookingUpdatesSubscription = null;
    _eventSubscription = null;
    
    await _realtimeService.disconnect();
    _isRealtimeConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    disconnectRealtime();
    super.dispose();
  }
}