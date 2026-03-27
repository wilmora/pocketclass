import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/api_response.dart';

class HttpService {
  static final HttpService _instance = HttpService._internal();
  factory HttpService() => _instance;
  HttpService._internal();

  final _storage = const FlutterSecureStorage();
  String? _authToken;

  // Get stored auth token
  Future<String?> getAuthToken() async {
    _authToken ??= await _storage.read(key: 'auth_token');
    return _authToken;
  }

  // Save auth token
  Future<void> saveAuthToken(String token) async {
    _authToken = token;
    await _storage.write(key: 'auth_token', value: token);
  }

  // Remove auth token
  Future<void> removeAuthToken() async {
    _authToken = null;
    await _storage.delete(key: 'auth_token');
  }

  // GET request
  Future<ApiResponse<T>> get<T>(
    String url, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
    bool requiresAuth = true,
  }) async {
    try {
      final requestHeaders = await _buildHeaders(headers, requiresAuth);
      
      Uri uri = Uri.parse(url);
      if (queryParameters != null && queryParameters.isNotEmpty) {
        uri = uri.replace(queryParameters: queryParameters.map(
          (key, value) => MapEntry(key, value.toString()),
        ));
      }
      
      final response = await http
          .get(
            uri,
            headers: requestHeaders,
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  // POST request
  Future<ApiResponse<T>> post<T>(
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
    bool requiresAuth = true,
  }) async {
    try {
      final requestHeaders = await _buildHeaders(headers, requiresAuth);
      
      final response = await http
          .post(
            Uri.parse(url),
            headers: requestHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  // PUT request
  Future<ApiResponse<T>> put<T>(
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
    bool requiresAuth = true,
  }) async {
    try {
      final requestHeaders = await _buildHeaders(headers, requiresAuth);
      
      final response = await http
          .put(
            Uri.parse(url),
            headers: requestHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  // PATCH request
  Future<ApiResponse<T>> patch<T>(
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
    bool requiresAuth = true,
  }) async {
    try {
      final requestHeaders = await _buildHeaders(headers, requiresAuth);
      
      final response = await http
          .patch(
            Uri.parse(url),
            headers: requestHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  // DELETE request
  Future<ApiResponse<T>> delete<T>(
    String url, {
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
    bool requiresAuth = true,
  }) async {
    try {
      final requestHeaders = await _buildHeaders(headers, requiresAuth);
      
      final response = await http
          .delete(
            Uri.parse(url),
            headers: requestHeaders,
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  // Build headers with auth if required
  Future<Map<String, String>> _buildHeaders(
    Map<String, String>? additionalHeaders,
    bool requiresAuth,
  ) async {
    Map<String, String> headers = {...ApiConfig.defaultHeaders};

    if (additionalHeaders != null) {
      headers.addAll(additionalHeaders);
    }

    if (requiresAuth) {
      final token = await getAuthToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // Handle HTTP response
  ApiResponse<T> _handleResponse<T>(
    http.Response response,
    T Function(dynamic)? fromJson,
  ) {
    try {
      final Map<String, dynamic> jsonData = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResponse<T>.fromJson(jsonData, fromJson);
      } else {
        return ApiResponse<T>.error(
          error: jsonData['error'] ?? 'Request failed',
          message: jsonData['message'],
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse<T>.error(
        error: 'Failed to parse response',
        message: e.toString(),
        statusCode: response.statusCode,
      );
    }
  }

  // Handle errors
  ApiResponse<T> _handleError<T>(dynamic error) {
    String errorMessage = 'Unknown error occurred';
    
    if (error is SocketException) {
      errorMessage = 'No internet connection';
    } else if (error is TimeoutException) {
      errorMessage = 'Request timeout';
    } else if (error is FormatException) {
      errorMessage = 'Invalid response format';
    } else {
      errorMessage = error.toString();
    }

    return ApiResponse<T>.error(
      error: errorMessage,
      message: 'Please check your internet connection and try again',
    );
  }
}