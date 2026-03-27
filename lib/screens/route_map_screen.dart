import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/route_model.dart';

class RouteMapScreen extends StatefulWidget {
  final RouteModel route;

  const RouteMapScreen({
    super.key,
    required this.route,
  });

  @override
  State<RouteMapScreen> createState() => _RouteMapScreenState();
}

class _RouteMapScreenState extends State<RouteMapScreen> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _setupMapData();
  }

  void _setupMapData() {
    // Create markers for start and end points
    _markers = {
      Marker(
        markerId: const MarkerId('start'),
        position: LatLng(widget.route.startLat, widget.route.startLng),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        infoWindow: InfoWindow(
          title: 'Pickup Point',
          snippet: widget.route.startAddress,
        ),
      ),
      Marker(
        markerId: const MarkerId('end'),
        position: LatLng(widget.route.endLat, widget.route.endLng),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(
          title: 'Drop-off Point',
          snippet: widget.route.endAddress,
        ),
      ),
    };

    // Create a simple polyline between start and end
    _polylines = {
      Polyline(
        polylineId: const PolylineId('route'),
        points: [
          LatLng(widget.route.startLat, widget.route.startLng),
          LatLng(widget.route.endLat, widget.route.endLng),
        ],
        color: Colors.blue,
        width: 5,
        patterns: [PatternItem.dash(20), PatternItem.gap(10)],
      ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final centerLat = (widget.route.startLat + widget.route.endLat) / 2;
    final centerLng = (widget.route.startLng + widget.route.endLng) / 2;

    return Scaffold(
      appBar: AppBar(
        title: Text('Route: ${widget.route.driverName}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          // Route Info Card
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.route.driverName,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.schedule, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text('Departs: ${widget.route.departureTime}'),
                        const SizedBox(width: 16),
                        const Icon(Icons.people, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text('${widget.route.currentPassengers}/${widget.route.maxPassengers}'),
                        const SizedBox(width: 16),
                        const Icon(Icons.attach_money, size: 16, color: Colors.green),
                        const SizedBox(width: 4),
                        const Text('8.00', style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        )),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 4,
                      children: widget.route.availableDays.map((day) => Chip(
                        label: Text(day.substring(0, 3)),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      )).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Map
          Expanded(
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(centerLat, centerLng),
                zoom: 12,
              ),
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
                _fitBounds();
              },
              markers: _markers,
              polylines: _polylines,
              mapType: MapType.normal,
            ),
          ),

          // Action Buttons
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: widget.route.currentPassengers < widget.route.maxPassengers
                        ? () => _bookRide(context)
                        : null,
                    icon: const Icon(Icons.event_seat),
                    label: Text(
                      widget.route.currentPassengers < widget.route.maxPassengers
                          ? 'Book This Ride - \$8.00'
                          : 'Fully Booked',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showDirections(),
                        icon: const Icon(Icons.directions),
                        label: const Text('Directions'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _shareRoute(),
                        icon: const Icon(Icons.share),
                        label: const Text('Share'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _fitBounds() {
    if (_mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(
              widget.route.startLat < widget.route.endLat ? widget.route.startLat : widget.route.endLat,
              widget.route.startLng < widget.route.endLng ? widget.route.startLng : widget.route.endLng,
            ),
            northeast: LatLng(
              widget.route.startLat > widget.route.endLat ? widget.route.startLat : widget.route.endLat,
              widget.route.startLng > widget.route.endLng ? widget.route.startLng : widget.route.endLng,
            ),
          ),
          100.0, // Padding
        ),
      );
    }
  }

  void _bookRide(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Book This Ride'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Driver: ${widget.route.driverName}'),
            const SizedBox(height: 4),
            Text('From: ${widget.route.startAddress}'),
            const SizedBox(height: 4),
            Text('To: ${widget.route.endAddress}'),
            const SizedBox(height: 4),
            Text('Departure: ${widget.route.departureTime}'),
            const SizedBox(height: 8),
            const Divider(),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total Fare:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('\$8.00', style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.green,
                )),
              ],
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
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ride booked successfully!'),
                  backgroundColor: Colors.green,
                ),
              );
              Navigator.of(context).pop(); // Go back to routes list
            },
            child: const Text('Book Ride'),
          ),
        ],
      ),
    );
  }

  void _showDirections() {
    // In a real app, you would integrate with Google Maps app or show directions
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Opening directions in Google Maps...'),
      ),
    );
  }

  void _shareRoute() {
    // In a real app, you would use the share package
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sharing route details...'),
      ),
    );
  }
}