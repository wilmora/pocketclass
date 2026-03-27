class LocationPoint {
  final String name;
  final String address;
  final double latitude;
  final double longitude;

  const LocationPoint({
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'address': address,
      'coordinates': [longitude, latitude], // Backend expects [lng, lat]
    };
  }

  factory LocationPoint.fromJson(Map<String, dynamic> json) {
    final coordinates = json['coordinates'] as List<dynamic>? ?? [0.0, 0.0];
    return LocationPoint(
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      longitude: coordinates[0].toDouble(),
      latitude: coordinates[1].toDouble(),
    );
  }
}

class RouteSchedule {
  final List<String> daysOfWeek;
  final String departureTime;
  final String frequency;

  const RouteSchedule({
    required this.daysOfWeek,
    required this.departureTime,
    this.frequency = 'weekly',
  });

  Map<String, dynamic> toJson() {
    return {
      'daysOfWeek': daysOfWeek.map((day) => day.toLowerCase()).toList(),
      'departureTime': departureTime,
      'frequency': frequency,
    };
  }

  factory RouteSchedule.fromJson(Map<String, dynamic> json) {
    return RouteSchedule(
      daysOfWeek: List<String>.from(json['daysOfWeek'] ?? []),
      departureTime: json['departureTime'] ?? '08:00',
      frequency: json['frequency'] ?? 'weekly',
    );
  }
}

class RoutePreferences {
  final bool smokingAllowed;
  final bool petsAllowed;
  final String musicPreference;
  final String conversationLevel;
  final String luggageSpace;

  const RoutePreferences({
    this.smokingAllowed = false,
    this.petsAllowed = false,
    this.musicPreference = 'no-preference',
    this.conversationLevel = 'no-preference',
    this.luggageSpace = 'small-bag',
  });

  Map<String, dynamic> toJson() {
    return {
      'smokingAllowed': smokingAllowed,
      'petsAllowed': petsAllowed,
      'musicPreference': musicPreference,
      'conversationLevel': conversationLevel,
      'luggageSpace': luggageSpace,
    };
  }

  factory RoutePreferences.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const RoutePreferences();
    
    return RoutePreferences(
      smokingAllowed: json['smokingAllowed'] ?? false,
      petsAllowed: json['petsAllowed'] ?? false,
      musicPreference: json['musicPreference'] ?? 'no-preference',
      conversationLevel: json['conversationLevel'] ?? 'no-preference',
      luggageSpace: json['luggageSpace'] ?? 'small-bag',
    );
  }
}

class DriverInfo {
  final String id;
  final String name;
  final String? profileImage;
  final double? rating;

  const DriverInfo({
    required this.id,
    required this.name,
    this.profileImage,
    this.rating,
  });

  factory DriverInfo.fromJson(Map<String, dynamic> json) {
    return DriverInfo(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      profileImage: json['profileImage'],
      rating: json['rating']?.toDouble() ?? 
              json['driverDetails']?['rating']?.toDouble(),
    );
  }
}

class RouteModel {
  final String id;
  final DriverInfo driver;
  final String title;
  final String? description;
  final LocationPoint pickupLocation;
  final LocationPoint dropoffLocation;
  final RouteSchedule schedule;
  final int maxPassengers;
  final int availableSeats;
  final double fare;
  final bool isActive;
  final String status;
  final RoutePreferences preferences;
  final int totalBookings;
  final int completedRides;
  final double earnings;
  final DateTime createdAt;
  final String? notes;

  const RouteModel({
    required this.id,
    required this.driver,
    required this.title,
    this.description,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.schedule,
    required this.maxPassengers,
    required this.availableSeats,
    this.fare = 8.0,
    required this.isActive,
    this.status = 'active',
    this.preferences = const RoutePreferences(),
    this.totalBookings = 0,
    this.completedRides = 0,
    this.earnings = 0.0,
    required this.createdAt,
    this.notes,
  });

  // Legacy getters for backward compatibility
  String get driverId => driver.id;
  String get driverName => driver.name;
  String get startAddress => pickupLocation.address;
  String get endAddress => dropoffLocation.address;
  double get startLat => pickupLocation.latitude;
  double get startLng => pickupLocation.longitude;
  double get endLat => dropoffLocation.latitude;
  double get endLng => dropoffLocation.longitude;
  List<String> get availableDays => schedule.daysOfWeek;
  String get departureTime => schedule.departureTime;
  int get currentPassengers => maxPassengers - availableSeats;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'driver': {
        'id': driver.id,
        'name': driver.name,
        'profileImage': driver.profileImage,
        'rating': driver.rating,
      },
      'title': title,
      'description': description,
      'pickupLocation': pickupLocation.toJson(),
      'dropoffLocation': dropoffLocation.toJson(),
      'schedule': schedule.toJson(),
      'maxPassengers': maxPassengers,
      'availableSeats': availableSeats,
      'fare': fare,
      'isActive': isActive,
      'status': status,
      'preferences': preferences.toJson(),
      'totalBookings': totalBookings,
      'completedRides': completedRides,
      'earnings': earnings,
      'createdAt': createdAt.toIso8601String(),
      'notes': notes,
    };
  }

  factory RouteModel.fromJson(Map<String, dynamic> json) {
    return RouteModel(
      id: json['id'] ?? json['_id'] ?? '',
      driver: DriverInfo.fromJson(json['driver'] ?? {}),
      title: json['title'] ?? '',
      description: json['description'],
      pickupLocation: LocationPoint.fromJson(json['pickupLocation'] ?? {}),
      dropoffLocation: LocationPoint.fromJson(json['dropoffLocation'] ?? {}),
      schedule: RouteSchedule.fromJson(json['schedule'] ?? {}),
      maxPassengers: json['maxPassengers'] ?? 4,
      availableSeats: json['availableSeats'] ?? json['maxPassengers'] ?? 4,
      fare: (json['fare'] ?? 8.0).toDouble(),
      isActive: json['isActive'] ?? true,
      status: json['status'] ?? 'active',
      preferences: RoutePreferences.fromJson(json['preferences']),
      totalBookings: json['totalBookings'] ?? 0,
      completedRides: json['completedRides'] ?? 0,
      earnings: (json['earnings'] ?? 0.0).toDouble(),
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      notes: json['notes'],
    );
  }

  RouteModel copyWith({
    String? id,
    DriverInfo? driver,
    String? title,
    String? description,
    LocationPoint? pickupLocation,
    LocationPoint? dropoffLocation,
    RouteSchedule? schedule,
    int? maxPassengers,
    int? availableSeats,
    double? fare,
    bool? isActive,
    String? status,
    RoutePreferences? preferences,
    int? totalBookings,
    int? completedRides,
    double? earnings,
    DateTime? createdAt,
    String? notes,
  }) {
    return RouteModel(
      id: id ?? this.id,
      driver: driver ?? this.driver,
      title: title ?? this.title,
      description: description ?? this.description,
      pickupLocation: pickupLocation ?? this.pickupLocation,
      dropoffLocation: dropoffLocation ?? this.dropoffLocation,
      schedule: schedule ?? this.schedule,
      maxPassengers: maxPassengers ?? this.maxPassengers,
      availableSeats: availableSeats ?? this.availableSeats,
      fare: fare ?? this.fare,
      isActive: isActive ?? this.isActive,
      status: status ?? this.status,
      preferences: preferences ?? this.preferences,
      totalBookings: totalBookings ?? this.totalBookings,
      completedRides: completedRides ?? this.completedRides,
      earnings: earnings ?? this.earnings,
      createdAt: createdAt ?? this.createdAt,
      notes: notes ?? this.notes,
    );
  }
}