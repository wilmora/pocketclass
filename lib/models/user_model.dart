enum UserType { driver, rider }

enum SubscriptionType { basic, premium }

class DriverDetails {
  final String? licenseNumber;
  final VehicleInfo? vehicleInfo;
  final double rating;
  final int totalRides;
  final double earnings;
  final bool isApproved;

  const DriverDetails({
    this.licenseNumber,
    this.vehicleInfo,
    this.rating = 5.0,
    this.totalRides = 0,
    this.earnings = 0.0,
    this.isApproved = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'licenseNumber': licenseNumber,
      'vehicleInfo': vehicleInfo?.toJson(),
      'rating': rating,
      'totalRides': totalRides,
      'earnings': earnings,
      'isApproved': isApproved,
    };
  }

  factory DriverDetails.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const DriverDetails();
    
    return DriverDetails(
      licenseNumber: json['licenseNumber'],
      vehicleInfo: json['vehicleInfo'] != null
          ? VehicleInfo.fromJson(json['vehicleInfo'])
          : null,
      rating: (json['rating'] ?? 5.0).toDouble(),
      totalRides: json['totalRides'] ?? 0,
      earnings: (json['earnings'] ?? 0.0).toDouble(),
      isApproved: json['isApproved'] ?? false,
    );
  }
}

class VehicleInfo {
  final String make;
  final String model;
  final int year;
  final String color;
  final String licensePlate;

  const VehicleInfo({
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.licensePlate,
  });

  Map<String, dynamic> toJson() {
    return {
      'make': make,
      'model': model,
      'year': year,
      'color': color,
      'licensePlate': licensePlate,
    };
  }

  factory VehicleInfo.fromJson(Map<String, dynamic> json) {
    return VehicleInfo(
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      year: json['year'] ?? DateTime.now().year,
      color: json['color'] ?? '',
      licensePlate: json['licensePlate'] ?? '',
    );
  }
}

class RiderDetails {
  final EmergencyContact? emergencyContact;
  final RiderPreferences? preferences;
  final double rating;
  final int totalRides;

  const RiderDetails({
    this.emergencyContact,
    this.preferences,
    this.rating = 5.0,
    this.totalRides = 0,
  });

  Map<String, dynamic> toJson() {
    return {
      'emergencyContact': emergencyContact?.toJson(),
      'preferences': preferences?.toJson(),
      'rating': rating,
      'totalRides': totalRides,
    };
  }

  factory RiderDetails.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const RiderDetails();
    
    return RiderDetails(
      emergencyContact: json['emergencyContact'] != null
          ? EmergencyContact.fromJson(json['emergencyContact'])
          : null,
      preferences: json['preferences'] != null
          ? RiderPreferences.fromJson(json['preferences'])
          : null,
      rating: (json['rating'] ?? 5.0).toDouble(),
      totalRides: json['totalRides'] ?? 0,
    );
  }
}

class EmergencyContact {
  final String name;
  final String phone;

  const EmergencyContact({
    required this.name,
    required this.phone,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
    };
  }

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
    );
  }
}

class RiderPreferences {
  final String? musicPreference;
  final String? temperaturePreference;
  final String conversationLevel;

  const RiderPreferences({
    this.musicPreference,
    this.temperaturePreference,
    this.conversationLevel = 'no-preference',
  });

  Map<String, dynamic> toJson() {
    return {
      'musicPreference': musicPreference,
      'temperaturePreference': temperaturePreference,
      'conversationLevel': conversationLevel,
    };
  }

  factory RiderPreferences.fromJson(Map<String, dynamic> json) {
    return RiderPreferences(
      musicPreference: json['musicPreference'],
      temperaturePreference: json['temperaturePreference'],
      conversationLevel: json['conversationLevel'] ?? 'no-preference',
    );
  }
}

class Subscription {
  final SubscriptionType type;
  final bool isActive;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? paymentMethod;

  const Subscription({
    required this.type,
    required this.isActive,
    this.startDate,
    this.endDate,
    this.paymentMethod,
  });

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'isActive': isActive,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'paymentMethod': paymentMethod,
    };
  }

  factory Subscription.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const Subscription(
        type: SubscriptionType.basic,
        isActive: false,
      );
    }
    
    return Subscription(
      type: SubscriptionType.values.firstWhere(
        (type) => type.name == json['type'],
        orElse: () => SubscriptionType.basic,
      ),
      isActive: json['isActive'] ?? false,
      startDate: json['startDate'] != null 
          ? DateTime.parse(json['startDate']) 
          : null,
      endDate: json['endDate'] != null 
          ? DateTime.parse(json['endDate']) 
          : null,
      paymentMethod: json['paymentMethod'],
    );
  }
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final UserType userType;
  final String? profileImage;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final Subscription subscription;
  final DriverDetails? driverDetails;
  final RiderDetails? riderDetails;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.userType,
    this.profileImage,
    this.isEmailVerified = false,
    this.isPhoneVerified = false,
    this.subscription = const Subscription(
      type: SubscriptionType.basic,
      isActive: false,
    ),
    this.driverDetails,
    this.riderDetails,
    required this.createdAt,
  });

  // Legacy getters for backward compatibility
  SubscriptionType get subscriptionType => subscription.type;
  bool get isSubscriptionActive => subscription.isActive;
  DateTime? get subscriptionEndDate => subscription.endDate;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'userType': userType.name,
      'profileImage': profileImage,
      'isEmailVerified': isEmailVerified,
      'isPhoneVerified': isPhoneVerified,
      'subscription': subscription.toJson(),
      'driverDetails': driverDetails?.toJson(),
      'riderDetails': riderDetails?.toJson(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final userTypeStr = json['userType'] ?? 'rider';
    final userType = UserType.values.firstWhere(
      (type) => type.name == userTypeStr || type.toString() == userTypeStr,
      orElse: () => UserType.rider,
    );

    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      userType: userType,
      profileImage: json['profileImage'],
      isEmailVerified: json['isEmailVerified'] ?? false,
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      subscription: Subscription.fromJson(json['subscription']),
      driverDetails: userType == UserType.driver 
          ? DriverDetails.fromJson(json['driverDetails'])
          : null,
      riderDetails: userType == UserType.rider 
          ? RiderDetails.fromJson(json['riderDetails'])
          : null,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
    );
  }

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    UserType? userType,
    String? profileImage,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    Subscription? subscription,
    DriverDetails? driverDetails,
    RiderDetails? riderDetails,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      userType: userType ?? this.userType,
      profileImage: profileImage ?? this.profileImage,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      subscription: subscription ?? this.subscription,
      driverDetails: driverDetails ?? this.driverDetails,
      riderDetails: riderDetails ?? this.riderDetails,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}