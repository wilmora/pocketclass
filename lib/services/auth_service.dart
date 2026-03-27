import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';
import 'http_service.dart';

class AuthService {
  final HttpService _httpService = HttpService();

  // Register new user
  Future<ApiResponse<UserModel>> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserType userType,
    DriverDetails? driverDetails,
    RiderDetails? riderDetails,
  }) async {
    final body = <String, dynamic>{
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
      'userType': userType.name,
    };

    if (userType == UserType.driver && driverDetails != null) {
      body['driverDetails'] = driverDetails.toJson();
    } else if (userType == UserType.rider && riderDetails != null) {
      body['riderDetails'] = riderDetails.toJson();
    }

    final response = await _httpService.post<Map<String, dynamic>>(
      ApiConfig.register,
      body: body,
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      
      // Save token
      if (authData['token'] != null) {
        await _httpService.saveAuthToken(authData['token']);
      }

      // Return user data
      if (authData['user'] != null) {
        final user = UserModel.fromJson(authData['user']);
        return ApiResponse.success(data: user, message: 'Registration successful');
      }
    }

    return ApiResponse.error(
      error: response.error ?? 'Registration failed',
      message: response.message,
    );
  }

  // Login user
  Future<ApiResponse<UserModel>> login({
    required String email,
    required String password,
  }) async {
    final response = await _httpService.post<Map<String, dynamic>>(
      ApiConfig.login,
      body: {
        'email': email,
        'password': password,
      },
      requiresAuth: false,
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      
      // Save token
      if (authData['token'] != null) {
        await _httpService.saveAuthToken(authData['token']);
      }

      // Return user data
      if (authData['user'] != null) {
        final user = UserModel.fromJson(authData['user']);
        return ApiResponse.success(data: user, message: 'Login successful');
      }
    }

    return ApiResponse.error(
      error: response.error ?? 'Login failed',
      message: response.message,
    );
  }

  // Get current user profile
  Future<ApiResponse<UserModel>> getCurrentUser() async {
    final response = await _httpService.get<Map<String, dynamic>>(
      ApiConfig.me,
      fromJson: (data) => data,
    );

    if (response.success && response.data != null) {
      final userData = response.data!['user'] ?? response.data!;
      final user = UserModel.fromJson(userData);
      return ApiResponse.success(data: user);
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to get user profile',
      message: response.message,
    );
  }

  // Update user profile
  Future<ApiResponse<UserModel>> updateProfile({
    String? name,
    String? phone,
    String? profileImage,
    DriverDetails? driverDetails,
    RiderDetails? riderDetails,
    Map<String, dynamic>? location,
  }) async {
    final body = <String, dynamic>{};
    
    if (name != null) body['name'] = name;
    if (phone != null) body['phone'] = phone;
    if (profileImage != null) body['profileImage'] = profileImage;
    if (location != null) body['location'] = location;
    if (driverDetails != null) body['driverDetails'] = driverDetails.toJson();
    if (riderDetails != null) body['riderDetails'] = riderDetails.toJson();

    final response = await _httpService.put<Map<String, dynamic>>(
      ApiConfig.profile,
      body: body,
    );

    if (response.success && response.data != null) {
      final userData = response.data!['user'] ?? response.data!;
      final user = UserModel.fromJson(userData);
      return ApiResponse.success(data: user, message: 'Profile updated successfully');
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to update profile',
      message: response.message,
    );
  }

  // Change password
  Future<ApiResponse<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _httpService.put<Map<String, dynamic>>(
      ApiConfig.changePassword,
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );

    if (response.success) {
      // Update token if provided
      if (response.data?['token'] != null) {
        await _httpService.saveAuthToken(response.data!['token']);
      }
      
      return ApiResponse.success(message: 'Password changed successfully');
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to change password',
      message: response.message,
    );
  }

  // Forgot password
  Future<ApiResponse<void>> forgotPassword({required String email}) async {
    final response = await _httpService.post<Map<String, dynamic>>(
      ApiConfig.forgotPassword,
      body: {'email': email},
      requiresAuth: false,
    );

    if (response.success) {
      return ApiResponse.success(
        message: response.message ?? 'Password reset email sent',
      );
    }

    return ApiResponse.error(
      error: response.error ?? 'Failed to send password reset email',
      message: response.message,
    );
  }

  // Logout
  Future<ApiResponse<void>> logout() async {
    // Remove token regardless of response
    await _httpService.removeAuthToken();

    return ApiResponse.success(message: 'Logged out successfully');
  }

  // Update subscription
  Future<ApiResponse<UserModel>> updateSubscription({
    required SubscriptionType type,
    String? paymentMethod,
  }) async {
    final response = await _httpService.get<Map<String, dynamic>>(
      ApiConfig.me,
      fromJson: (data) => data,
    );

    if (!response.success || response.data == null) {
      return ApiResponse.error(error: 'Failed to get user data');
    }

    final userData = response.data!['user'] ?? response.data!;
    final userId = userData['id'] ?? userData['_id'];

    final subscriptionResponse = await _httpService.put<Map<String, dynamic>>(
      '${ApiConfig.users}/$userId/subscription',
      body: {
        'type': type.name,
        'paymentMethod': paymentMethod,
      },
    );

    if (subscriptionResponse.success && subscriptionResponse.data != null) {
      final updatedUserData = subscriptionResponse.data!['data'] ?? 
                             subscriptionResponse.data!['user'] ?? 
                             subscriptionResponse.data!;
      final user = UserModel.fromJson(updatedUserData);
      return ApiResponse.success(
        data: user, 
        message: 'Subscription updated successfully',
      );
    }

    return ApiResponse.error(
      error: subscriptionResponse.error ?? 'Failed to update subscription',
      message: subscriptionResponse.message,
    );
  }

  // Cancel subscription
  Future<ApiResponse<UserModel>> cancelSubscription() async {
    final response = await _httpService.get<Map<String, dynamic>>(
      ApiConfig.me,
      fromJson: (data) => data,
    );

    if (!response.success || response.data == null) {
      return ApiResponse.error(error: 'Failed to get user data');
    }

    final userData = response.data!['user'] ?? response.data!;
    final userId = userData['id'] ?? userData['_id'];

    final subscriptionResponse = await _httpService.delete<Map<String, dynamic>>(
      '${ApiConfig.users}/$userId/subscription',
    );

    if (subscriptionResponse.success && subscriptionResponse.data != null) {
      final updatedUserData = subscriptionResponse.data!['data'] ?? 
                             subscriptionResponse.data!['user'] ?? 
                             subscriptionResponse.data!;
      final user = UserModel.fromJson(updatedUserData);
      return ApiResponse.success(
        data: user, 
        message: 'Subscription cancelled successfully',
      );
    }

    return ApiResponse.error(
      error: subscriptionResponse.error ?? 'Failed to cancel subscription',
      message: subscriptionResponse.message,
    );
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await _httpService.getAuthToken();
    if (token == null) return false;
    
    // Verify token by making a request to get current user
    final response = await getCurrentUser();
    return response.success;
  }
}