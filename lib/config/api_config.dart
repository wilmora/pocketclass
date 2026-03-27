class ApiConfig {
  // Base URL for your backend API
  static const String baseUrl = 'http://localhost:3000/api';
  
  // WebSocket URL for real-time features
  static const String webSocketUrl = 'http://localhost:3000';
  
  // API endpoints
  static const String auth = '$baseUrl/auth';
  static const String users = '$baseUrl/users';
  static const String routes = '$baseUrl/routes';
  static const String bookings = '$baseUrl/bookings';
  
  // Specific endpoints
  static const String register = '$auth/register';
  static const String login = '$auth/login';
  static const String me = '$auth/me';
  static const String profile = '$auth/profile';
  static const String changePassword = '$auth/change-password';
  static const String forgotPassword = '$auth/forgot-password';
  static const String logout = '$auth/logout';
  
  // Request timeouts
  static const Duration requestTimeout = Duration(seconds: 30);
  static const Duration connectionTimeout = Duration(seconds: 10);
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
}