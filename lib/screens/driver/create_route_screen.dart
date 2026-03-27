import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../providers/app_state.dart';
import '../../models/route_model.dart';

class CreateRouteScreen extends StatefulWidget {
  const CreateRouteScreen({super.key});

  @override
  State<CreateRouteScreen> createState() => _CreateRouteScreenState();
}

class _CreateRouteScreenState extends State<CreateRouteScreen> {
  final _formKey = GlobalKey<FormState>();
  final _startAddressController = TextEditingController();
  final _endAddressController = TextEditingController();
  final _departureTimeController = TextEditingController();
  final _maxPassengersController = TextEditingController(text: '4');

  final Set<String> _selectedDays = {};
  TimeOfDay _selectedTime = const TimeOfDay(hour: 8, minute: 0);
  
  // Google Maps related variables
  GoogleMapController? _mapController;
  LatLng? _startLocation;
  LatLng? _endLocation;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};
  final bool _isSelectingStart = true;
  Position? _currentPosition;

  final List<String> _daysOfWeek = [
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  @override
  void initState() {
    super.initState();
    _departureTimeController.text = '08:00';
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _startAddressController.dispose();
    _endAddressController.dispose();
    _departureTimeController.dispose();
    _maxPassengersController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Route'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        leading: IconButton(
          onPressed: () => context.go('/driver'),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Route Details',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      
                      // Start Address with Map Integration
                      TextFormField(
                        controller: _startAddressController,
                        decoration: InputDecoration(
                          labelText: 'Starting Point',
                          hintText: 'Enter pickup address or tap map',
                          prefixIcon: const Icon(Icons.my_location),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.map),
                            onPressed: () => _showMapPicker(true),
                            tooltip: 'Select on map',
                          ),
                          border: const OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a starting point';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      
                      // End Address with Map Integration
                      TextFormField(
                        controller: _endAddressController,
                        decoration: InputDecoration(
                          labelText: 'Destination',
                          hintText: 'Enter destination address or tap map',
                          prefixIcon: const Icon(Icons.location_on),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.map),
                            onPressed: () => _showMapPicker(false),
                            tooltip: 'Select on map',
                          ),
                          border: const OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a destination';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Schedule',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      
                      // Departure Time
                      TextFormField(
                        controller: _departureTimeController,
                        readOnly: true,
                        decoration: const InputDecoration(
                          labelText: 'Departure Time',
                          prefixIcon: Icon(Icons.schedule),
                          border: OutlineInputBorder(),
                        ),
                        onTap: _selectTime,
                      ),
                      const SizedBox(height: 16),
                      
                      // Available Days
                      Text(
                        'Available Days',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: _daysOfWeek.map((day) {
                          return FilterChip(
                            label: Text(day),
                            selected: _selectedDays.contains(day),
                            onSelected: (selected) {
                              setState(() {
                                if (selected) {
                                  _selectedDays.add(day);
                                } else {
                                  _selectedDays.remove(day);
                                }
                              });
                            },
                          );
                        }).toList(),
                      ),
                      if (_selectedDays.isEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            'Please select at least one day',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                              fontSize: 12,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Capacity',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      
                      // Max Passengers
                      TextFormField(
                        controller: _maxPassengersController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Maximum Passengers',
                          hintText: '1-8 passengers',
                          prefixIcon: Icon(Icons.people),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter maximum passengers';
                          }
                          final num = int.tryParse(value);
                          if (num == null || num < 1 || num > 8) {
                            return 'Please enter a number between 1 and 8';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Fare Information
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.attach_money,
                      size: 32,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Fixed Fare: \$8.00',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Per ride, regardless of distance',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Create Route Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _createRoute,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  ),
                  child: const Text(
                    'Create Route',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null && picked != _selectedTime) {
      setState(() {
        _selectedTime = picked;
        _departureTimeController.text = 
            '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      });
    }
  }

  void _createRoute() {
    if (_formKey.currentState!.validate() && _selectedDays.isNotEmpty) {
      final appState = context.read<AppState>();
      final user = appState.currentUser;

      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User not found')),
        );
        return;
      }

      final route = RouteModel(
        id: 'route_${DateTime.now().millisecondsSinceEpoch}',
        driver: DriverInfo(
          id: user.id,
          name: user.name,
        ),
        title: '${_startAddressController.text} to ${_endAddressController.text}',
        pickupLocation: LocationPoint(
          name: 'Pickup Point',
          address: _startAddressController.text,
          latitude: _startLocation?.latitude ?? (40.7128 + (DateTime.now().millisecond % 100) / 1000),
          longitude: _startLocation?.longitude ?? (-74.0060 + (DateTime.now().millisecond % 100) / 1000),
        ),
        dropoffLocation: LocationPoint(
          name: 'Dropoff Point',
          address: _endAddressController.text,
          latitude: _endLocation?.latitude ?? (40.7589 + (DateTime.now().millisecond % 100) / 1000),
          longitude: _endLocation?.longitude ?? (-73.9851 + (DateTime.now().millisecond % 100) / 1000),
        ),
        schedule: RouteSchedule(
          daysOfWeek: _selectedDays.toList(),
          departureTime: _departureTimeController.text,
        ),
        maxPassengers: int.parse(_maxPassengersController.text),
        availableSeats: int.parse(_maxPassengersController.text),
        isActive: true,
        createdAt: DateTime.now(),
      );

      appState.addRoute(route);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Route created successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      context.go('/driver');
    } else if (_selectedDays.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one available day')),
      );
    }
  }

  // Google Maps Integration Methods
  
  Future<void> _getCurrentLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        return;
      }

      _currentPosition = await Geolocator.getCurrentPosition();
    } catch (e) {
      debugPrint('Error getting current location: $e');
    }
  }

  void _showMapPicker(bool isStartLocation) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MapPickerScreen(
          isStartLocation: isStartLocation,
          currentPosition: _currentPosition,
          onLocationSelected: (LatLng location, String address) {
            setState(() {
              if (isStartLocation) {
                _startLocation = location;
                _startAddressController.text = address;
              } else {
                _endLocation = location;
                _endAddressController.text = address;
              }
            });
          },
        ),
      ),
    );
  }

  Future<String> _getAddressFromLatLng(LatLng position) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return '${place.street}, ${place.locality}, ${place.administrativeArea}';
      }
    } catch (e) {
      debugPrint('Error getting address: $e');
    }
    return '${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
  }
}

// Map Picker Screen for selecting locations
class MapPickerScreen extends StatefulWidget {
  final bool isStartLocation;
  final Position? currentPosition;
  final Function(LatLng, String) onLocationSelected;

  const MapPickerScreen({
    super.key,
    required this.isStartLocation,
    required this.currentPosition,
    required this.onLocationSelected,
  });

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  GoogleMapController? _mapController;
  LatLng? _selectedLocation;
  String _selectedAddress = '';

  @override
  Widget build(BuildContext context) {
    final initialLocation = widget.currentPosition != null
        ? LatLng(widget.currentPosition!.latitude, widget.currentPosition!.longitude)
        : const LatLng(40.7128, -74.0060); // Default to NYC

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isStartLocation ? 'Select Starting Point' : 'Select Destination'),
        actions: [
          if (_selectedLocation != null)
            TextButton(
              onPressed: () {
                widget.onLocationSelected(_selectedLocation!, _selectedAddress);
                Navigator.of(context).pop();
              },
              child: const Text('CONFIRM'),
            ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: initialLocation,
              zoom: 15,
            ),
            onMapCreated: (GoogleMapController controller) {
              _mapController = controller;
            },
            onTap: _onMapTapped,
            markers: _selectedLocation != null
                ? {
                    Marker(
                      markerId: const MarkerId('selected'),
                      position: _selectedLocation!,
                      infoWindow: InfoWindow(
                        title: widget.isStartLocation ? 'Starting Point' : 'Destination',
                        snippet: _selectedAddress,
                      ),
                    ),
                  }
                : {},
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
          ),
          if (_selectedLocation == null)
            Container(
              padding: const EdgeInsets.all(16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    widget.isStartLocation
                        ? 'Tap on the map to select your starting point'
                        : 'Tap on the map to select your destination',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _onMapTapped(LatLng location) async {
    setState(() {
      _selectedLocation = location;
      _selectedAddress = 'Loading address...';
    });

    // Get address from coordinates
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        location.latitude,
        location.longitude,
      );
      
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        setState(() {
          _selectedAddress = '${place.street}, ${place.locality}, ${place.administrativeArea}';
        });
      }
    } catch (e) {
      setState(() {
        _selectedAddress = '${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)}';
      });
    }
  }
}