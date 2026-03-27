class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.statusCode,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T? Function(dynamic)? fromJson) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      message: json['message'],
      error: json['error'],
      statusCode: json['statusCode'],
      data: json['data'] != null && fromJson != null
          ? fromJson(json['data'])
          : json['data'],
    );
  }

  // Success response
  factory ApiResponse.success({T? data, String? message}) {
    return ApiResponse<T>(
      success: true,
      data: data,
      message: message,
      statusCode: 200,
    );
  }

  // Error response
  factory ApiResponse.error({
    required String error,
    String? message,
    int? statusCode,
  }) {
    return ApiResponse<T>(
      success: false,
      error: error,
      message: message,
      statusCode: statusCode ?? 400,
    );
  }
}

class PaginatedResponse<T> {
  final bool success;
  final int count;
  final int total;
  final int page;
  final int pages;
  final List<T> data;

  PaginatedResponse({
    required this.success,
    required this.count,
    required this.total,
    required this.page,
    required this.pages,
    required this.data,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    return PaginatedResponse<T>(
      success: json['success'] ?? false,
      count: json['count'] ?? 0,
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      pages: json['pages'] ?? 1,
      data: json['data'] != null
          ? (json['data'] as List)
              .map((item) => fromJson(item as Map<String, dynamic>))
              .toList()
          : [],
    );
  }
}

class AuthResponse {
  final bool success;
  final String? token;
  final Map<String, dynamic>? user;
  final String? message;
  final String? error;

  AuthResponse({
    required this.success,
    this.token,
    this.user,
    this.message,
    this.error,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] ?? false,
      token: json['token'],
      user: json['user'],
      message: json['message'],
      error: json['error'],
    );
  }
}