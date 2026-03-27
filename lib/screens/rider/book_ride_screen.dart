import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../models/route_model.dart';
import '../../models/ride_booking.dart';
import '../../models/payment_models.dart' as models;
import '../../services/payment_service.dart';
import '../../providers/app_state.dart';

class BookRideScreen extends StatefulWidget {
  final RouteModel route;

  const BookRideScreen({
    super.key,
    required this.route,
  });

  @override
  State<BookRideScreen> createState() => _BookRideScreenState();
}

class _BookRideScreenState extends State<BookRideScreen> {
  final PaymentService _paymentService = PaymentService();
  models.Wallet? _wallet;
  List<models.PaymentCard> _paymentMethods = [];
  String? _selectedPaymentMethodId;
  bool _isLoading = false;
  bool _useWallet = false;

  @override
  void initState() {
    super.initState();
    _loadPaymentData();
  }

  Future<void> _loadPaymentData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load wallet data
      final walletResult = await _paymentService.getWallet();
      if (walletResult.success) {
        setState(() {
          _wallet = walletResult.data!;
        });
      }

      // Load payment methods
      final methodsResult = await _paymentService.getPaymentMethods();
      if (methodsResult.success) {
        setState(() {
          _paymentMethods = methodsResult.data!;
          if (_paymentMethods.isNotEmpty) {
            _selectedPaymentMethodId = _paymentMethods
                .firstWhere((method) => method.isDefault, 
                    orElse: () => _paymentMethods.first)
                .id;
          }
        });
      }
    } catch (e) {
      _showError('Failed to load payment data: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _bookRide() async {
    if (!_useWallet && _selectedPaymentMethodId == null) {
      _showError('Please select a payment method');
      return;
    }

    if (_useWallet && (_wallet?.balance ?? 0) < 8.00) {
      _showError('Insufficient wallet balance. Please add money to your wallet.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final appState = Provider.of<AppState>(context, listen: false);
      final currentUser = appState.currentUser;

      if (currentUser == null) {
        _showError('User not logged in');
        return;
      }

      // Create the booking first
      final booking = RideBooking(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        routeId: widget.route.id,
        riderId: currentUser.id,
        riderName: currentUser.name,
        driverId: widget.route.driver.id,
        status: RideStatus.pending,
        bookingDate: DateTime.now(),
        rideDate: DateTime.now(), // For now, same day booking
        fare: 8.00,
        paymentStatus: 'pending',
      );

      // Process payment
      bool paymentSuccess = false;
      String? paymentIntentId;

      if (_useWallet) {
        // Use wallet payment
        final walletResult = await _paymentService.processWalletPayment(
          amount: 8.00,
          description: 'Ride booking payment',
          rideBookingId: booking.id,
        );
        if (walletResult.success) {
          paymentSuccess = true;
          paymentIntentId = walletResult.data?.id;
        } else {
          _showError(walletResult.message ?? 'Wallet payment failed');
          return;
        }
      } else {
        // For demo purposes, simulate successful card payment
        // In a real app, you'd process the actual payment here
        paymentSuccess = true;
        paymentIntentId = 'demo_payment_${DateTime.now().millisecondsSinceEpoch}';
        
        // Show processing delay
        await Future.delayed(const Duration(seconds: 1));
      }

      if (paymentSuccess) {
        // Update booking with payment success
        final successfulBooking = booking.copyWith(
          status: RideStatus.accepted,
          paymentStatus: 'completed',
          paymentIntentId: paymentIntentId,
        );

        // Add booking to app state
        appState.addBooking(successfulBooking);

        _showSuccess('Ride booked successfully!');
        
        // Navigate back to rider dashboard
        if (mounted) {
          context.go('/rider');
        }
      }
    } catch (e) {
      _showError('Failed to book ride: ${e.toString()}');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showSuccess(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Ride'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Route Details Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Route Details',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.location_on, color: Colors.green),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'From: ${widget.route.pickupLocation}',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on, color: Colors.red),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'To: ${widget.route.dropoffLocation}',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.schedule),
                              const SizedBox(width: 8),
                              Text(
                                'Time: ${widget.route.schedule.departureTime}',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.attach_money),
                              const SizedBox(width: 8),
                              Text(
                                'Fare: \$8.00',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  color: Colors.green,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Payment Method Selection
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Payment Method',
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const Spacer(),
                              TextButton(
                                onPressed: () => context.push('/payment'),
                                child: const Text('Manage'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Wallet option
                          if (_wallet != null)
                            Card(
                              child: RadioListTile<bool>(
                                title: const Text('Wallet'),
                                subtitle: Text('Balance: \$${_wallet!.balance.toStringAsFixed(2)}'),
                                value: true,
                                groupValue: _useWallet,
                                onChanged: _wallet!.balance >= 8.00
                                    ? (bool? value) {
                                        setState(() {
                                          _useWallet = value ?? false;
                                          if (_useWallet) {
                                            _selectedPaymentMethodId = null;
                                          }
                                        });
                                      }
                                    : null,
                                secondary: const Icon(Icons.account_balance_wallet),
                              ),
                            ),

                          // Payment methods
                          if (_paymentMethods.isNotEmpty)
                            ...(_paymentMethods.map((method) => Card(
                              child: RadioListTile<String>(
                                title: Text('•••• •••• •••• ${method.last4}'),
                                subtitle: Text('${method.brand.toUpperCase()} ${method.isDefault ? '(Default)' : ''}'),
                                value: method.id,
                                groupValue: _useWallet ? null : _selectedPaymentMethodId,
                                onChanged: (String? value) {
                                  setState(() {
                                    _selectedPaymentMethodId = value;
                                    _useWallet = false;
                                  });
                                },
                                secondary: Icon(_getCardIcon(method.brand)),
                              ),
                            )).toList()),

                          if (_paymentMethods.isEmpty && _wallet == null)
                            Card(
                              child: ListTile(
                                leading: const Icon(Icons.add),
                                title: const Text('Add Payment Method'),
                                subtitle: const Text('No payment methods available'),
                                onTap: () => context.push('/payment'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Book Ride Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: (_useWallet && (_wallet?.balance ?? 0) >= 8.00) ||
                              (!_useWallet && _selectedPaymentMethodId != null)
                          ? _bookRide
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Book Ride - \$8.00',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  IconData _getCardIcon(String brand) {
    switch (brand.toLowerCase()) {
      case 'visa':
        return Icons.credit_card;
      case 'mastercard':
        return Icons.credit_card;
      case 'amex':
        return Icons.credit_card;
      default:
        return Icons.payment;
    }
  }
}