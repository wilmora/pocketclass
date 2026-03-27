import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/route_model.dart';
import 'http_service.dart';

class RouteService {
  final HttpService _httpService = HttpService();

  // Get all routes with optional filters
  Future<PaginatedResponse<RouteModel>> getRoutes({
    int page = 1,
    int limit = 10,
    String? day,
    double? pickupLat,
    double? pickupLng,
    double? dropoffLat,
    double? dropoffLng,
    int maxDistance = 5000,
    int minSeats = 1,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'maxDistance': maxDistance.toString(),
      'minSeats': minSeats.toString(),
    };

    if (day != null) queryParams['day'] = day;
    if (pickupLat != null) queryParams['pickupLat'] = pickupLat.toString();
    if (pickupLng != null) queryParams['pickupLng'] = pickupLng.toString();
    if (dropoffLat != null) queryParams['dropoffLat'] = dropoffLat.toString();
    if (dropoffLng != null) queryParams['dropoffLng'] = dropoffLng.toString();

    final uri = Uri.parse(ApiConfig.routes).replace(queryParameters: queryParams);
    
    final response = await _httpService.get<Map<String, dynamic>>(
      uri.toString(),
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      return PaginatedResponse.fromJson(
        response.data!,
        (json) => RouteModel.fromJson(json),
      );
    }

    return PaginatedResponse<RouteModel>(
      success: false,
      count: 0,
      total: 0,
      page: page,
      pages: 0,
      data: [],
    );
  }

  // Get single route
  Future<ApiResponse<RouteModel>> getRoute(String routeId) async {
    final response = await _httpService.get<Map<String, dynamic>>(
      '${ApiConfig.routes}/$routeId',
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      final routeData = response.data!['data'] ?? response.data!;
      final route = RouteModel.fromJson(routeData);
      return ApiResponse.success(data: route);
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to get route',
      message: response.message,
    );
  }

  // Create new route (drivers only)
  Future<ApiResponse<RouteModel>> createRoute({
    required String title,
    String? description,
    required LocationPoint pickupLocation,
    required LocationPoint dropoffLocation,
    required RouteSchedule schedule,
    required int maxPassengers,
    double fare = 8.0,
    RoutePreferences? preferences,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      'title': title,
      'pickupLocation': pickupLocation.toJson(),
      'dropoffLocation': dropoffLocation.toJson(),
      'schedule': schedule.toJson(),
      'maxPassengers': maxPassengers,
      'fare': fare,
    };

    if (description != null) body['description'] = description;
    if (preferences != null) body['preferences'] = preferences.toJson();
    if (notes != null) body['notes'] = notes;

    final response = await _httpService.post<Map<String, dynamic>>(
      ApiConfig.routes,
      body: body,
    );

    if (response.success && response.data != null) {
      final routeData = response.data!['data'] ?? response.data!;
      final route = RouteModel.fromJson(routeData);
      return ApiResponse.success(
        data: route,
        message: 'Route created successfully',
      );
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to create route',
      message: response.message,
    );
  }

  // Update route (owner only)
  Future<ApiResponse<RouteModel>> updateRoute({
    required String routeId,
    String? title,
    String? description,
    LocationPoint? pickupLocation,
    LocationPoint? dropoffLocation,
    RouteSchedule? schedule,
    int? maxPassengers,
    double? fare,
    RoutePreferences? preferences,
    String? notes,
  }) async {
    final body = <String, dynamic>{};

    if (title != null) body['title'] = title;
    if (description != null) body['description'] = description;
    if (pickupLocation != null) body['pickupLocation'] = pickupLocation.toJson();
    if (dropoffLocation != null) body['dropoffLocation'] = dropoffLocation.toJson();
    if (schedule != null) body['schedule'] = schedule.toJson();
    if (maxPassengers != null) body['maxPassengers'] = maxPassengers;
    if (fare != null) body['fare'] = fare;
    if (preferences != null) body['preferences'] = preferences.toJson();
    if (notes != null) body['notes'] = notes;

    final response = await _httpService.put<Map<String, dynamic>>(
      '${ApiConfig.routes}/$routeId',
      body: body,
    );

    if (response.success && response.data != null) {
      final routeData = response.data!['data'] ?? response.data!;
      final route = RouteModel.fromJson(routeData);
      return ApiResponse.success(
        data: route,
        message: 'Route updated successfully',
      );
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to update route',
      message: response.message,
    );
  }

  // Delete route (owner only)
  Future<ApiResponse<void>> deleteRoute(String routeId) async {
    final response = await _httpService.delete<Map<String, dynamic>>(
      '${ApiConfig.routes}/$routeId',
    );

    if (response.success) {
      return ApiResponse.success(message: 'Route deleted successfully');
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to delete route',
      message: response.message,
    );
  }

  // Toggle route status (active/inactive)
  Future<ApiResponse<RouteModel>> toggleRouteStatus(String routeId) async {
    final response = await _httpService.patch<Map<String, dynamic>>(
      '${ApiConfig.routes}/$routeId/toggle-status',
      body: {},
    );

    if (response.success && response.data != null) {
      final routeData = response.data!['data'] ?? response.data!;
      final route = RouteModel.fromJson(routeData);
      return ApiResponse.success(
        data: route,
        message: 'Route status updated successfully',
      );
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to update route status',
      message: response.message,
    );
  }

  // Get driver's routes
  Future<PaginatedResponse<RouteModel>> getDriverRoutes({
    required String driverId,
    int page = 1,
    int limit = 10,
    String status = 'all',
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'status': status,
    };

    final uri = Uri.parse('${ApiConfig.routes}/driver/$driverId')
        .replace(queryParameters: queryParams);
    
    final response = await _httpService.get<Map<String, dynamic>>(
      uri.toString(),
    );

    if (response.success && response.data != null) {
      return PaginatedResponse.fromJson(
        response.data!,
        (json) => RouteModel.fromJson(json),
      );
    }

    return PaginatedResponse<RouteModel>(
      success: false,
      count: 0,
      total: 0,
      page: page,
      pages: 0,
      data: [],
    );
  }

  // Search routes
  Future<PaginatedResponse<RouteModel>> searchRoutes({
    required String from,
    required String to,
    String? day,
    int maxDistance = 5000,
    int minSeats = 1,
    int page = 1,
    int limit = 10,
  }) async {
    final queryParams = <String, String>{
      'from': from,
      'to': to,
      'maxDistance': maxDistance.toString(),
      'minSeats': minSeats.toString(),
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (day != null) queryParams['day'] = day;

    final uri = Uri.parse('${ApiConfig.routes}/search')
        .replace(queryParameters: queryParams);
    
    final response = await _httpService.get<Map<String, dynamic>>(
      uri.toString(),
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      return PaginatedResponse.fromJson(
        response.data!,
        (json) => RouteModel.fromJson(json),
      );
    }

    return PaginatedResponse<RouteModel>(
      success: false,
      count: 0,
      total: 0,
      page: page,
      pages: 0,
      data: [],
    );
  }

  // Get routes by day
  Future<PaginatedResponse<RouteModel>> getRoutesByDay({
    required String day,
    int page = 1,
    int limit = 10,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    final uri = Uri.parse('${ApiConfig.routes}/by-day/$day')
        .replace(queryParameters: queryParams);
    
    final response = await _httpService.get<Map<String, dynamic>>(
      uri.toString(),
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      return PaginatedResponse.fromJson(
        response.data!,
        (json) => RouteModel.fromJson(json),
      );
    }

    return PaginatedResponse<RouteModel>(
      success: false,
      count: 0,
      total: 0,
      page: page,
      pages: 0,
      data: [],
    );
  }
}