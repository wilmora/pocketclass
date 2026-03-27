import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'screens/home_screen.dart';
import 'screens/driver/driver_dashboard.dart';
import 'screens/driver/create_route_screen.dart';
import 'screens/driver/driver_subscription_screen.dart';
import 'screens/rider/rider_dashboard.dart';
import 'screens/rider/available_routes_screen.dart';
import 'screens/rider/rider_subscription_screen.dart';
import 'screens/payment/payment_methods_screen.dart';
import 'screens/demo/realtime_demo.dart';
import 'providers/app_state.dart';
import 'widgets/realtime_status.dart';

void main() {
  runApp(const MyApp());
}

final GoRouter _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/driver',
      builder: (context, state) => const DriverDashboard(),
    ),
    GoRoute(
      path: '/driver/create-route',
      builder: (context, state) => const CreateRouteScreen(),
    ),
    GoRoute(
      path: '/driver/subscription',
      builder: (context, state) => const DriverSubscriptionScreen(),
    ),
    GoRoute(
      path: '/rider',
      builder: (context, state) => const RiderDashboard(),
    ),
    GoRoute(
      path: '/rider/routes',
      builder: (context, state) => const AvailableRoutesScreen(),
    ),
    GoRoute(
      path: '/rider/subscription',
      builder: (context, state) => const RiderSubscriptionScreen(),
    ),
    GoRoute(
      path: '/payment',
      builder: (context, state) => const PaymentMethodsScreen(),
    ),
    GoRoute(
      path: '/demo/realtime',
      builder: (context, state) => const RealtimeDemo(),
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AppState(),
      child: RealtimeConnectionNotifier(
        child: MaterialApp.router(
          title: 'Routes - Ride Together',
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2E7D32)), // Green theme
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              centerTitle: true,
              titleTextStyle: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          routerConfig: _router,
        ),
      ),
    );
  }
}
