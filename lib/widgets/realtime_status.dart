import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';

/// Widget that displays the real-time connection status
class RealtimeStatusIndicator extends StatelessWidget {
  final bool showLabel;
  final double iconSize;
  
  const RealtimeStatusIndicator({
    super.key,
    this.showLabel = true,
    this.iconSize = 16.0,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, child) {
        final isConnected = appState.isRealtimeConnected;
        
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isConnected ? Icons.wifi : Icons.wifi_off,
              size: iconSize,
              color: isConnected ? Colors.green : Colors.red,
            ),
            if (showLabel) ...[
              const SizedBox(width: 4),
              Text(
                isConnected ? 'Live' : 'Offline',
                style: TextStyle(
                  fontSize: 12,
                  color: isConnected ? Colors.green : Colors.red,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}

/// Widget that displays real-time connection status in the app bar
class RealtimeAppBarStatus extends StatelessWidget {
  const RealtimeAppBarStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, child) {
        return Padding(
          padding: const EdgeInsets.only(right: 16.0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: appState.isRealtimeConnected 
                ? Colors.green.withOpacity(0.1)
                : Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: appState.isRealtimeConnected 
                  ? Colors.green.withOpacity(0.3)
                  : Colors.red.withOpacity(0.3),
              ),
            ),
            child: const RealtimeStatusIndicator(
              showLabel: true,
              iconSize: 14,
            ),
          ),
        );
      },
    );
  }
}

/// Widget that shows a toast notification when connection status changes
class RealtimeConnectionNotifier extends StatefulWidget {
  final Widget child;
  
  const RealtimeConnectionNotifier({
    super.key,
    required this.child,
  });

  @override
  State<RealtimeConnectionNotifier> createState() => _RealtimeConnectionNotifierState();
}

class _RealtimeConnectionNotifierState extends State<RealtimeConnectionNotifier> {
  bool? _previousConnectionStatus;

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, child) {
        final isConnected = appState.isRealtimeConnected;
        
        // Show notification when connection status changes
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_previousConnectionStatus != null && 
              _previousConnectionStatus != isConnected) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(
                      isConnected ? Icons.wifi : Icons.wifi_off,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isConnected 
                        ? 'Connected to live updates'
                        : 'Disconnected from live updates',
                    ),
                  ],
                ),
                backgroundColor: isConnected ? Colors.green : Colors.red,
                duration: const Duration(seconds: 3),
              ),
            );
          }
          _previousConnectionStatus = isConnected;
        });
        
        return widget.child;
      },
    );
  }
}