import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/ride_booking.dart';
import 'http_service.dart';

class BookingService {
  final HttpService _httpService = HttpService();

  // Create a new booking
  Future<ApiResponse<RideBooking>> createBooking({
    required String routeId,
    required String pickupLocation,
    required String dropoffLocation,
    required DateTime bookingDate,
    int seatsRequested = 1,
    String? specialRequests,
  }) async {
    try {
      final response = await _httpService.post(
        ApiConfig.bookings,
        body: {
          'routeId': routeId,
          'pickupLocation': pickupLocation,
          'dropoffLocation': dropoffLocation,
          'bookingDate': bookingDate.toIso8601String(),
          'seatsRequested': seatsRequested,
          'specialRequests': specialRequests,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to create booking: ${e.toString()}',
      );
    }
  }

  // Get user's bookings (both as rider and driver)
  Future<ApiResponse<List<RideBooking>>> getMyBookings({
    String? status,
    String? type, // 'rider' or 'driver'
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (status != null) queryParams['status'] = status;
      if (type != null) queryParams['type'] = type;
      
      final response = await _httpService.get(
        '${ApiConfig.bookings}/my-bookings',
        queryParameters: queryParams,
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => (data as List)
            .map((booking) => RideBooking.fromJson(booking as Map<String, dynamic>))
            .toList(),
      );
    } catch (e) {
      return ApiResponse<List<RideBooking>>(
        success: false,
        message: 'Failed to fetch bookings: ${e.toString()}',
        data: [],
      );
    }
  }

  // Get bookings for a specific route (driver only)
  Future<ApiResponse<List<RideBooking>>> getRouteBookings(
    String routeId, {
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (status != null) queryParams['status'] = status;
      
      final response = await _httpService.get(
        '${ApiConfig.bookings}/route/$routeId',
        queryParameters: queryParams,
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => (data as List)
            .map((booking) => RideBooking.fromJson(booking as Map<String, dynamic>))
            .toList(),
      );
    } catch (e) {
      return ApiResponse<List<RideBooking>>(
        success: false,
        message: 'Failed to fetch route bookings: ${e.toString()}',
        data: [],
      );
    }
  }

  // Get a specific booking by ID
  Future<ApiResponse<RideBooking>> getBooking(String bookingId) async {
    try {
      final response = await _httpService.get(
        '${ApiConfig.bookings}/$bookingId',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to fetch booking: ${e.toString()}',
      );
    }
  }

  // Cancel a booking
  Future<ApiResponse<RideBooking>> cancelBooking(
    String bookingId, {
    String? reason,
  }) async {
    try {
      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/cancel',
        body: {
          if (reason != null) 'reason': reason,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to cancel booking: ${e.toString()}',
      );
    }
  }

  // Accept a booking (driver only)
  Future<ApiResponse<RideBooking>> acceptBooking(String bookingId) async {
    try {
      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/accept',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to accept booking: ${e.toString()}',
      );
    }
  }

  // Reject a booking (driver only)
  Future<ApiResponse<RideBooking>> rejectBooking(
    String bookingId, {
    String? reason,
  }) async {
    try {
      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/reject',
        body: {
          if (reason != null) 'reason': reason,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to reject booking: ${e.toString()}',
      );
    }
  }

  // Complete a ride (driver only)
  Future<ApiResponse<RideBooking>> completeRide(String bookingId) async {
    try {
      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/complete',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to complete ride: ${e.toString()}',
      );
    }
  }

  // Start a ride (driver only)
  Future<ApiResponse<RideBooking>> startRide(String bookingId) async {
    try {
      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/start',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to start ride: ${e.toString()}',
      );
    }
  }

  // Rate a completed ride
  Future<ApiResponse<RideBooking>> rateRide(
    String bookingId, {
    required int rating,
    String? review,
  }) async {
    try {
      if (rating < 1 || rating > 5) {
        return ApiResponse<RideBooking>(
          success: false,
          message: 'Rating must be between 1 and 5',
        );
      }

      final response = await _httpService.patch(
        '${ApiConfig.bookings}/$bookingId/rate',
        body: {
          'rating': rating,
          if (review != null) 'review': review,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => RideBooking.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<RideBooking>(
        success: false,
        message: 'Failed to rate ride: ${e.toString()}',
      );
    }
  }

  // Send message in booking chat
  Future<ApiResponse<Map<String, dynamic>>> sendMessage(
    String bookingId, {
    required String message,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.bookings}/$bookingId/messages',
        body: {
          'message': message,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );
    } catch (e) {
      return ApiResponse<Map<String, dynamic>>(
        success: false,
        message: 'Failed to send message: ${e.toString()}',
      );
    }
  }

  // Get messages for a booking
  Future<ApiResponse<List<Map<String, dynamic>>>> getMessages(
    String bookingId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final response = await _httpService.get(
        '${ApiConfig.bookings}/$bookingId/messages',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => List<Map<String, dynamic>>.from(data as List),
      );
    } catch (e) {
      return ApiResponse<List<Map<String, dynamic>>>(
        success: false,
        message: 'Failed to fetch messages: ${e.toString()}',
        data: [],
      );
    }
  }

  // Get booking statistics
  Future<ApiResponse<Map<String, dynamic>>> getBookingStats() async {
    try {
      final response = await _httpService.get(
        '${ApiConfig.bookings}/stats',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );
    } catch (e) {
      return ApiResponse<Map<String, dynamic>>(
        success: false,
        message: 'Failed to fetch booking stats: ${e.toString()}',
      );
    }
  }
}