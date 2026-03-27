import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../widgets/realtime_status.dart';
import '../../models/ride_booking.dart';

/// Demo screen to showcase real-time updates functionality
class RealtimeDemo extends StatefulWidget {
  const RealtimeDemo({super.key});

  @override
  State<RealtimeDemo> createState() => _RealtimeDemoState();
}

class _RealtimeDemoState extends State<RealtimeDemo> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Real-time Updates Demo'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: const [
          RealtimeAppBarStatus(),
        ],
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Connection Status Card
                Card(
                  child: ListTile(
                    leading: Icon(
                      appState.isRealtimeConnected ? Icons.wifi : Icons.wifi_off,
                      color: appState.isRealtimeConnected ? Colors.green : Colors.red,
                    ),
                    title: Text(
                      'Real-time Connection',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    subtitle: Text(
                      appState.isRealtimeConnected
                          ? 'Connected - Receiving live updates'
                          : 'Disconnected - Using cached data',
                    ),
                    trailing: appState.isRealtimeConnected
                        ? const Icon(Icons.check_circle, color: Colors.green)
                        : const Icon(Icons.error, color: Colors.red),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Demo Actions
                Text(
                  'Demo Actions',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                
                // Simulate route status change
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Simulate Route Updates',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'In a real application, these updates would come from other users in real-time:',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () => _simulateRouteUpdate(appState),
                              icon: const Icon(Icons.route, size: 18),
                              label: const Text('Toggle Route Status'),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => _simulateBooking(appState),
                              icon: const Icon(Icons.book, size: 18),
                              label: const Text('Add New Booking'),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => _simulateLocationUpdate(appState),
                              icon: const Icon(Icons.location_on, size: 18),
                              label: const Text('Location Update'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Real-time Events Log
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Live Activity Feed',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: ListView(
                              children: [
                                _buildEventTile(
                                  'Route Status Changed',
                                  'Route "Main St to Oak Ave" was activated',
                                  Icons.route,
                                  Colors.blue,
                                  '2 minutes ago',
                                ),
                                _buildEventTile(
                                  'New Booking',
                                  'Rider "Sarah M." booked a seat',
                                  Icons.book,
                                  Colors.green,
                                  '5 minutes ago',
                                ),
                                _buildEventTile(
                                  'Driver Location',
                                  'Driver is approaching pickup location',
                                  Icons.location_on,
                                  Colors.orange,
                                  '8 minutes ago',
                                ),
                                _buildEventTile(
                                  'Booking Updated',
                                  'Booking status changed to "confirmed"',
                                  Icons.check_circle,
                                  Colors.green,
                                  '12 minutes ago',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Real-time features are now active! 🚀'),
              backgroundColor: Colors.green,
            ),
          );
        },
        child: const Icon(Icons.live_tv),
      ),
    );
  }

  Widget _buildEventTile(String title, String subtitle, IconData icon, Color color, String time) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Text(
        time,
        style: const TextStyle(fontSize: 12, color: Colors.grey),
      ),
    );
  }

  void _simulateRouteUpdate(AppState appState) {
    if (appState.routes.isNotEmpty) {
      final route = appState.routes.first;
      appState.toggleRouteStatus(route.id);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Route ${route.isActive ? "deactivated" : "activated"} - Real-time update sent!',
          ),
          backgroundColor: Colors.blue,
        ),
      );
    }
  }

  void _simulateBooking(AppState appState) {
    if (appState.routes.isNotEmpty && appState.currentUser != null) {
      final route = appState.routes.first;
      final booking = RideBooking(
        id: 'demo_${DateTime.now().millisecondsSinceEpoch}',
        routeId: route.id,
        riderId: appState.currentUser!.id,
        riderName: appState.currentUser!.name,
        driverId: route.driverId,
        status: RideStatus.pending,
        bookingDate: DateTime.now(),
        rideDate: DateTime.now().add(const Duration(hours: 2)),
      );
      
      appState.addBooking(booking);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('New booking created - Real-time notification sent!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _simulateLocationUpdate(AppState appState) {
    if (appState.isRealtimeConnected) {
      appState.realtimeService.updateLocation(40.7128, -74.0060);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location update sent - Other users will see this live!'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }
}