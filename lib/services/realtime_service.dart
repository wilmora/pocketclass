import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';
import '../models/route_model.dart';
import '../models/ride_booking.dart';

// Real-time event types
enum RealtimeEventType {
  routeStatusChanged,
  newBooking,
  bookingStatusChanged,
  driverLocationUpdate,
  riderLocationUpdate,
  routeDeleted,
  routeCreated,
  messageReceived,
}

// Real-time event data structure
class RealtimeEvent {
  final RealtimeEventType type;
  final String? userId;
  final String? routeId;
  final String? bookingId;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  const RealtimeEvent({
    required this.type,
    this.userId,
    this.routeId,
    this.bookingId,
    required this.data,
    required this.timestamp,
  });

  factory RealtimeEvent.fromJson(Map<String, dynamic> json) {
    return RealtimeEvent(
      type: RealtimeEventType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => RealtimeEventType.routeStatusChanged,
      ),
      userId: json['userId'],
      routeId: json['routeId'],
      bookingId: json['bookingId'],
      data: json['data'] ?? {},
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class RealtimeService {
  static final RealtimeService _instance = RealtimeService._internal();
  factory RealtimeService() => _instance;
  RealtimeService._internal();

  io.Socket? _socket;
  String? _currentUserId;
  bool _isConnected = false;

  // Stream controllers for different event types
  final StreamController<RealtimeEvent> _eventController = StreamController.broadcast();
  final StreamController<RouteModel> _routeUpdatesController = StreamController.broadcast();
  final StreamController<RideBooking> _bookingUpdatesController = StreamController.broadcast();
  final StreamController<Map<String, dynamic>> _locationUpdatesController = StreamController.broadcast();

  // Public streams
  Stream<RealtimeEvent> get events => _eventController.stream;
  Stream<RouteModel> get routeUpdates => _routeUpdatesController.stream;
  Stream<RideBooking> get bookingUpdates => _bookingUpdatesController.stream;
  Stream<Map<String, dynamic>> get locationUpdates => _locationUpdatesController.stream;

  bool get isConnected => _isConnected;
  String? get currentUserId => _currentUserId;

  // Initialize connection
  Future<void> connect(String userId, {String? token}) async {
    if (_isConnected && _currentUserId == userId) {
      return; // Already connected for this user
    }

    _currentUserId = userId;
    
    try {
      // Disconnect existing connection
      await disconnect();

      // Create new socket connection
      _socket = io.io(
        ApiConfig.webSocketUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .enableReconnection()
            .setReconnectionDelay(1000)
            .setReconnectionAttempts(5)
            .setAuth({
              'token': token,
              'userId': userId,
            })
            .build(),
      );

      _setupEventHandlers();
      
      // Connect to server
      _socket!.connect();
      
    } catch (e) {
      debugPrint('Failed to connect to real-time service: $e');
      rethrow;
    }
  }

  // Setup event handlers
  void _setupEventHandlers() {
    if (_socket == null) return;

    // Connection events
    _socket!.onConnect((_) {
      debugPrint('Connected to real-time service');
      _isConnected = true;
      
      // Join user-specific room
      _socket!.emit('join_user_room', _currentUserId);
    });

    _socket!.onDisconnect((_) {
      debugPrint('Disconnected from real-time service');
      _isConnected = false;
    });

    _socket!.onConnectError((error) {
      debugPrint('Connection error: $error');
      _isConnected = false;
    });

    _socket!.onReconnect((_) {
      debugPrint('Reconnected to real-time service');
      _isConnected = true;
      
      // Rejoin user room on reconnection
      _socket!.emit('join_user_room', _currentUserId);
    });

    // Route events
    _socket!.on('route_status_changed', (data) {
      _handleRouteStatusChanged(data);
    });

    _socket!.on('route_created', (data) {
      _handleRouteCreated(data);
    });

    _socket!.on('route_deleted', (data) {
      _handleRouteDeleted(data);
    });

    // Booking events
    _socket!.on('new_booking', (data) {
      _handleNewBooking(data);
    });

    _socket!.on('booking_status_changed', (data) {
      _handleBookingStatusChanged(data);
    });

    // Location events
    _socket!.on('location_update', (data) {
      _handleLocationUpdate(data);
    });

    // General events
    _socket!.on('realtime_event', (data) {
      _handleRealtimeEvent(data);
    });
  }

  // Event handlers
  void _handleRouteStatusChanged(dynamic data) {
    try {
      final routeData = data as Map<String, dynamic>;
      final route = RouteModel.fromJson(routeData['route']);
      _routeUpdatesController.add(route);
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.routeStatusChanged,
        routeId: route.id,
        userId: route.driver.id,
        data: routeData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling route status change: $e');
    }
  }

  void _handleRouteCreated(dynamic data) {
    try {
      final routeData = data as Map<String, dynamic>;
      final route = RouteModel.fromJson(routeData['route']);
      _routeUpdatesController.add(route);
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.routeCreated,
        routeId: route.id,
        userId: route.driver.id,
        data: routeData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling route creation: $e');
    }
  }

  void _handleRouteDeleted(dynamic data) {
    try {
      final eventData = data as Map<String, dynamic>;
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.routeDeleted,
        routeId: eventData['routeId'],
        userId: eventData['driverId'],
        data: eventData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling route deletion: $e');
    }
  }

  void _handleNewBooking(dynamic data) {
    try {
      final bookingData = data as Map<String, dynamic>;
      final booking = RideBooking.fromJson(bookingData['booking']);
      _bookingUpdatesController.add(booking);
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.newBooking,
        bookingId: booking.id,
        routeId: booking.routeId,
        userId: booking.riderId,
        data: bookingData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling new booking: $e');
    }
  }

  void _handleBookingStatusChanged(dynamic data) {
    try {
      final bookingData = data as Map<String, dynamic>;
      final booking = RideBooking.fromJson(bookingData['booking']);
      _bookingUpdatesController.add(booking);
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.bookingStatusChanged,
        bookingId: booking.id,
        routeId: booking.routeId,
        userId: booking.riderId,
        data: bookingData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling booking status change: $e');
    }
  }

  void _handleLocationUpdate(dynamic data) {
    try {
      final locationData = data as Map<String, dynamic>;
      _locationUpdatesController.add(locationData);
      
      _eventController.add(RealtimeEvent(
        type: RealtimeEventType.driverLocationUpdate,
        userId: locationData['userId'],
        routeId: locationData['routeId'],
        data: locationData,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      debugPrint('Error handling location update: $e');
    }
  }

  void _handleRealtimeEvent(dynamic data) {
    try {
      final eventData = data as Map<String, dynamic>;
      final event = RealtimeEvent.fromJson(eventData);
      _eventController.add(event);
    } catch (e) {
      debugPrint('Error handling realtime event: $e');
    }
  }

  // Emit events
  void joinRouteRoom(String routeId) {
    if (_isConnected) {
      _socket!.emit('join_route_room', routeId);
    }
  }

  void leaveRouteRoom(String routeId) {
    if (_isConnected) {
      _socket!.emit('leave_route_room', routeId);
    }
  }

  void updateLocation(double latitude, double longitude, {String? routeId}) {
    if (_isConnected) {
      _socket!.emit('location_update', {
        'userId': _currentUserId,
        'latitude': latitude,
        'longitude': longitude,
        'routeId': routeId,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  void sendMessage(String recipientId, String message, {String? routeId}) {
    if (_isConnected) {
      _socket!.emit('send_message', {
        'senderId': _currentUserId,
        'recipientId': recipientId,
        'message': message,
        'routeId': routeId,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  // Route-related emit methods
  void emitRouteCreated(RouteModel route) {
    if (_isConnected) {
      _socket!.emit('route_created', {
        'route': route.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  void emitRouteUpdate(RouteModel route) {
    if (_isConnected) {
      _socket!.emit('route_updated', {
        'route': route.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  void emitRouteDeleted(String routeId) {
    if (_isConnected) {
      _socket!.emit('route_deleted', {
        'routeId': routeId,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  // Booking-related emit methods
  void emitBookingCreated(RideBooking booking) {
    if (_isConnected) {
      _socket!.emit('booking_created', {
        'booking': booking.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  void emitBookingUpdate(RideBooking booking) {
    if (_isConnected) {
      _socket!.emit('booking_updated', {
        'booking': booking.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  // Disconnect from service
  Future<void> disconnect() async {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }
    
    _isConnected = false;
    _currentUserId = null;
  }

  // Dispose resources
  void dispose() {
    disconnect();
    _eventController.close();
    _routeUpdatesController.close();
    _bookingUpdatesController.close();
    _locationUpdatesController.close();
  }
}