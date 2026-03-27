import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/app_state.dart';
import '../../models/route_model.dart';
import '../route_map_screen.dart';
import '../../widgets/realtime_status.dart';

class AvailableRoutesScreen extends StatefulWidget {
  const AvailableRoutesScreen({super.key});

  @override
  State<AvailableRoutesScreen> createState() => _AvailableRoutesScreenState();
}

class _AvailableRoutesScreenState extends State<AvailableRoutesScreen> {
  String _searchQuery = '';
  String _selectedDay = '';

  final List<String> _daysOfWeek = [
    'All Days',
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Routes'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        leading: IconButton(
          onPressed: () => context.go('/rider'),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final routes = _filteredRoutes(appState.activeRoutes);

          return Column(
            children: [
              // Search and Filter Section
              Container(
                padding: const EdgeInsets.all(16),
                color: Theme.of(context).colorScheme.surface,
                child: Column(
                  children: [
                    // Search Bar
                    TextField(
                      decoration: const InputDecoration(
                        hintText: 'Search by location...',
                        prefixIcon: Icon(Icons.search),
                        border: OutlineInputBorder(),
                        filled: true,
                      ),
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value.toLowerCase();
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    
                    // Day Filter
                    SizedBox(
                      height: 40,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _daysOfWeek.length,
                        itemBuilder: (context, index) {
                          final day = _daysOfWeek[index];
                          final isSelected = _selectedDay == day || (day == 'All Days' && _selectedDay.isEmpty);
                          
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(day == 'All Days' ? day : day.substring(0, 3)),
                              selected: isSelected,
                              onSelected: (selected) {
                                setState(() {
                                  _selectedDay = day == 'All Days' ? '' : day;
                                });
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Routes List
              Expanded(
                child: routes.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: routes.length,
                        itemBuilder: (context, index) {
                          return _buildRouteCard(context, routes[index], appState);
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  List<RouteModel> _filteredRoutes(List<RouteModel> routes) {
    return routes.where((route) {
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final searchMatch = route.startAddress.toLowerCase().contains(_searchQuery) ||
            route.endAddress.toLowerCase().contains(_searchQuery) ||
            route.driverName.toLowerCase().contains(_searchQuery);
        if (!searchMatch) return false;
      }

      // Day filter
      if (_selectedDay.isNotEmpty && _selectedDay != 'All Days') {
        if (!route.availableDays.contains(_selectedDay)) return false;
      }

      // Only show routes with available seats
      return route.currentPassengers < route.maxPassengers;
    }).toList();
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.route_outlined,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              'No routes found',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _searchQuery.isNotEmpty || _selectedDay.isNotEmpty
                  ? 'Try adjusting your filters'
                  : 'No routes are currently available',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRouteCard(BuildContext context, RouteModel route, AppState appState) {
    final availableSeats = route.maxPassengers - route.currentPassengers;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Route Info Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        route.driverName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.star, size: 16, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            '4.8', // Mock rating
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '(${20 + route.id.hashCode % 50} rides)', // Mock ride count
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    const RealtimeStatusIndicator(
                      showLabel: false,
                      iconSize: 14,
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: availableSeats > 0 ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '$availableSeats seat${availableSeats != 1 ? 's' : ''} left',
                        style: TextStyle(
                          color: availableSeats > 0 ? Colors.green[700] : Colors.red[700],
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Route Details
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          route.startAddress,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 2,
                        height: 20,
                        color: Colors.grey[400],
                        margin: const EdgeInsets.only(left: 5),
                      ),
                      const SizedBox(width: 17),
                      Text(
                        'Departs at ${route.departureTime}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          route.endAddress,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Schedule and Fare
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Available Days:',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 4,
                        children: route.availableDays.take(3).map((day) => Chip(
                          label: Text(
                            day.substring(0, 3),
                            style: const TextStyle(fontSize: 10),
                          ),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                        )).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$8.00',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    Text(
                      'per ride',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Book Button and Map View
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => RouteMapScreen(route: route),
                        ),
                      );
                    },
                    icon: const Icon(Icons.map),
                    label: const Text('View on Map'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: availableSeats > 0 
                        ? () => _bookRide(context, route, appState)
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      availableSeats > 0 ? 'Book Ride' : 'Full',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _bookRide(BuildContext context, RouteModel route, AppState appState) {
    final user = appState.currentUser;
    
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to book a ride')),
      );
      return;
    }

    // Show booking confirmation dialog with payment options
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Booking'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Driver: ${route.driverName}'),
            const SizedBox(height: 8),
            Text('From: ${route.startAddress}'),
            const SizedBox(height: 4),
            Text('To: ${route.endAddress}'),
            const SizedBox(height: 8),
            Text('Departure: ${route.schedule.departureTime}'),
            const SizedBox(height: 8),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Fare:',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  '\$8.00',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.payment, color: Colors.blue[600]),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Payment will be processed securely using your chosen payment method',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              
              // Store the route info for payment processing
              // In a real app, you'd store this more elegantly
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Proceeding to payment...'),
                  backgroundColor: Colors.blue,
                  action: SnackBarAction(
                    label: 'Continue',
                    textColor: Colors.white,
                    onPressed: () {
                      context.go('/payment');
                    },
                  ),
                ),
              );
              
              // For demo purposes, automatically navigate to payment after a delay
              Future.delayed(const Duration(seconds: 2), () {
                if (context.mounted) {
                  context.go('/payment');
                }
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Pay Now - \$8.00'),
          ),
        ],
      ),
    );
  }
}