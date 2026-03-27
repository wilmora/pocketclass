import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart' as stripe;
import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/payment_models.dart' as models;
import 'http_service.dart';

class PaymentService {
  final HttpService _httpService = HttpService();
  
  // Initialize Stripe
  static Future<void> initializeStripe(String publishableKey) async {
    stripe.Stripe.publishableKey = publishableKey;
    await stripe.Stripe.instance.applySettings();
  }

  // Create payment intent for ride booking
  Future<ApiResponse<models.PaymentIntent>> createRidePaymentIntent({
    required String rideBookingId,
    required double amount,
    String currency = 'usd',
    String? paymentMethodId,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/create-intent',
        body: {
          'rideBookingId': rideBookingId,
          'amount': (amount * 100).round(), // Convert to cents
          'currency': currency,
          'paymentMethodId': paymentMethodId,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.PaymentIntent.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.PaymentIntent>(
        success: false,
        message: 'Failed to create payment intent: ${e.toString()}',
      );
    }
  }

  // Create payment intent for subscription
  Future<ApiResponse<models.PaymentIntent>> createSubscriptionPaymentIntent({
    required String subscriptionType,
    required double amount,
    String currency = 'usd',
    String? paymentMethodId,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/create-subscription-intent',
        body: {
          'subscriptionType': subscriptionType,
          'amount': (amount * 100).round(),
          'currency': currency,
          'paymentMethodId': paymentMethodId,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.PaymentIntent.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.PaymentIntent>(
        success: false,
        message: 'Failed to create subscription payment intent: ${e.toString()}',
      );
    }
  }

  // Process payment using Stripe
  Future<ApiResponse<models.Payment>> processStripePayment({
    required String paymentIntentClientSecret,
    required stripe.PaymentMethodData paymentMethodData,
  }) async {
    try {
      // Confirm payment with Stripe
      await stripe.Stripe.instance.confirmPayment(
        paymentIntentClientSecret: paymentIntentClientSecret,
        data: stripe.PaymentMethodParams.card(
          paymentMethodData: paymentMethodData,
        ),
      );

      // Verify payment with backend
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/verify',
        body: {
          'paymentIntentId': _extractPaymentIntentId(paymentIntentClientSecret),
        },
      );

      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Payment processing failed: ${e.toString()}',
      );
    }
  }

  // Process payment using existing payment method  
  Future<ApiResponse<models.Payment>> processPaymentWithSavedCard({
    required String paymentIntentClientSecret,
    required String paymentMethodId,
  }) async {
    try {
      // For saved payment methods, we typically handle this server-side
      // This method primarily verifies the payment after server processing
      
      // Verify payment with backend
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/process-with-saved-card',
        body: {
          'paymentIntentClientSecret': paymentIntentClientSecret,
          'paymentMethodId': paymentMethodId,
        },
      );

      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Payment processing failed: ${e.toString()}',
      );
    }
  }

  // Get user's payment history
  Future<ApiResponse<List<models.Payment>>> getPaymentHistory({
    int page = 1,
    int limit = 20,
    models.PaymentStatus? status,
    models.PaymentMethod? method,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (status != null) queryParams['status'] = status.name;
      if (method != null) queryParams['method'] = method.name;

      final response = await _httpService.get(
        '${ApiConfig.baseUrl}/payments/history',
        queryParameters: queryParams,
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => (data as List)
            .map((payment) => models.Payment.fromJson(payment as Map<String, dynamic>))
            .toList(),
      );
    } catch (e) {
      return ApiResponse<List<models.Payment>>(
        success: false,
        message: 'Failed to fetch payment history: ${e.toString()}',
        data: [],
      );
    }
  }

  // Get user's wallet
  Future<ApiResponse<models.Wallet>> getWallet() async {
    try {
      final response = await _httpService.get(
        '${ApiConfig.baseUrl}/payments/wallet',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.Wallet.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Wallet>(
        success: false,
        message: 'Failed to fetch wallet: ${e.toString()}',
      );
    }
  }

  // Add payment method to wallet
  Future<ApiResponse<models.PaymentCard>> addPaymentMethod({
    required String paymentMethodId,
    String? nickname,
    bool isDefault = false,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/payment-methods',
        body: {
          'paymentMethodId': paymentMethodId,
          'nickname': nickname,
          'isDefault': isDefault,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.PaymentCard.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.PaymentCard>(
        success: false,
        message: 'Failed to add payment method: ${e.toString()}',
      );
    }
  }

  // Remove payment method
  Future<ApiResponse<bool>> removePaymentMethod(String paymentMethodId) async {
    try {
      await _httpService.delete(
        '${ApiConfig.baseUrl}/payments/payment-methods/$paymentMethodId',
      );
      
      return ApiResponse<bool>(
        success: true,
        message: 'Payment method removed successfully',
        data: true,
      );
    } catch (e) {
      return ApiResponse<bool>(
        success: false,
        message: 'Failed to remove payment method: ${e.toString()}',
        data: false,
      );
    }
  }

  // Set default payment method
  Future<ApiResponse<bool>> setDefaultPaymentMethod(String paymentMethodId) async {
    try {
      await _httpService.put(
        '${ApiConfig.baseUrl}/payments/payment-methods/$paymentMethodId/default',
      );
      
      return ApiResponse<bool>(
        success: true,
        message: 'Default payment method updated',
        data: true,
      );
    } catch (e) {
      return ApiResponse<bool>(
        success: false,
        message: 'Failed to update default payment method: ${e.toString()}',
        data: false,
      );
    }
  }

  // Add money to wallet
  Future<ApiResponse<models.Payment>> addMoneyToWallet({
    required double amount,
    required String paymentMethodId,
    String currency = 'usd',
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/wallet/add-money',
        body: {
          'amount': (amount * 100).round(),
          'currency': currency,
          'paymentMethodId': paymentMethodId,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Failed to add money to wallet: ${e.toString()}',
      );
    }
  }

  // Process wallet payment (for rides or subscriptions)
  Future<ApiResponse<models.Payment>> processWalletPayment({
    required double amount,
    required String description,
    String? rideBookingId,
    String? subscriptionId,
    String currency = 'usd',
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/wallet/pay',
        body: {
          'amount': (amount * 100).round(),
          'currency': currency,
          'description': description,
          'rideBookingId': rideBookingId,
          'subscriptionId': subscriptionId,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Wallet payment failed: ${e.toString()}',
      );
    }
  }

  // Request refund
  Future<ApiResponse<models.Payment>> requestRefund({
    required String paymentId,
    required double amount,
    required String reason,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/$paymentId/refund',
        body: {
          'amount': (amount * 100).round(),
          'reason': reason,
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Refund request failed: ${e.toString()}',
      );
    }
  }

  // Get payment details
  Future<ApiResponse<models.Payment>> getPaymentDetails(String paymentId) async {
    try {
      final response = await _httpService.get(
        '${ApiConfig.baseUrl}/payments/$paymentId',
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.Payment.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.Payment>(
        success: false,
        message: 'Failed to fetch payment details: ${e.toString()}',
      );
    }
  }

  // Setup payment method using Stripe
  Future<ApiResponse<String>> setupPaymentMethod({
    required BuildContext context,
    required String customerName,
    required String customerEmail,
  }) async {
    try {
      // Create setup intent
      final setupIntentResponse = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/setup-intent',
        body: {
          'customerName': customerName,
          'customerEmail': customerEmail,
        },
      );

      if (!setupIntentResponse.success) {
        return ApiResponse<String>(
          success: false,
          message: 'Failed to create setup intent',
        );
      }

      final clientSecret = setupIntentResponse.data['client_secret'];

      // Present payment sheet
      await stripe.Stripe.instance.initPaymentSheet(
        paymentSheetParameters: stripe.SetupPaymentSheetParameters(
          setupIntentClientSecret: clientSecret,
          merchantDisplayName: 'RideShare App',
          customerEphemeralKeySecret: setupIntentResponse.data['ephemeral_key'],
          customerId: setupIntentResponse.data['customer_id'],
          style: ThemeMode.system,
        ),
      );

      await stripe.Stripe.instance.presentPaymentSheet();

      return ApiResponse<String>(
        success: true,
        message: 'Payment method added successfully',
        data: setupIntentResponse.data['payment_method_id'],
      );
    } catch (e) {
      return ApiResponse<String>(
        success: false,
        message: 'Payment method setup failed: ${e.toString()}',
      );
    }
  }

  // Utility method to extract payment intent ID from client secret
  String _extractPaymentIntentId(String clientSecret) {
    return clientSecret.split('_secret')[0];
  }

  // Format currency display
  static String formatCurrency(double amount, {String currency = 'USD'}) {
    switch (currency.toUpperCase()) {
      case 'USD':
        return '\$${amount.toStringAsFixed(2)}';
      case 'EUR':
        return '€${amount.toStringAsFixed(2)}';
      case 'GBP':
        return '£${amount.toStringAsFixed(2)}';
      default:
        return '${amount.toStringAsFixed(2)} ${currency.toUpperCase()}';
    }
  }

  // Validate credit card number using Luhn algorithm
  static bool isValidCreditCard(String cardNumber) {
    if (cardNumber.isEmpty) return false;
    
    // Remove spaces and non-numeric characters
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    // Luhn algorithm
    int sum = 0;
    bool isEven = false;
    
    for (int i = cleanNumber.length - 1; i >= 0; i--) {
      int digit = int.parse(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 == 0;
  }

  // Get all payment methods for current user
  Future<ApiResponse<List<models.PaymentCard>>> getPaymentMethods() async {
    try {
      final response = await _httpService.get('${ApiConfig.baseUrl}/payments/methods');
      
      final List<dynamic> methodsData = response.data['paymentMethods'] ?? [];
      final methods = methodsData
          .map((data) => models.PaymentCard.fromJson(data as Map<String, dynamic>))
          .toList();
      
      return ApiResponse<List<models.PaymentCard>>(
        success: true,
        data: methods,
        message: 'Payment methods retrieved successfully',
      );
    } catch (e) {
      return ApiResponse<List<models.PaymentCard>>(
        success: false,
        message: 'Failed to get payment methods: ${e.toString()}',
      );
    }
  }

  // Process payment with amount and payment method
  Future<ApiResponse<models.PaymentIntent>> processPayment({
    required double amount,
    String currency = 'usd',
    required String paymentMethodId,
    Map<String, String>? metadata,
  }) async {
    try {
      final response = await _httpService.post(
        '${ApiConfig.baseUrl}/payments/process',
        body: {
          'amount': (amount * 100).round(), // Convert to cents
          'currency': currency,
          'paymentMethodId': paymentMethodId,
          'metadata': metadata ?? {},
        },
      );
      
      return ApiResponse.fromJson(
        response.data,
        (data) => models.PaymentIntent.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      return ApiResponse<models.PaymentIntent>(
        success: false,
        message: 'Failed to process payment: ${e.toString()}',
      );
    }
  }

  // Get card brand from number
  static String getCardBrand(String cardNumber) {
    final cleanNumber = cardNumber.replaceAll(RegExp(r'\D'), '');
    
    if (cleanNumber.startsWith(RegExp(r'^4'))) return 'visa';
    if (cleanNumber.startsWith(RegExp(r'^5[1-5]'))) return 'mastercard';
    if (cleanNumber.startsWith(RegExp(r'^3[47]'))) return 'amex';
    if (cleanNumber.startsWith(RegExp(r'^6011|^65'))) return 'discover';
    
    return 'unknown';
  }
}