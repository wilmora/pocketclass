enum RideStatus { pending, accepted, inProgress, completed, cancelled }

class RideBooking {
  final String id;
  final String routeId;
  final String riderId;
  final String riderName;
  final String driverId;
  final RideStatus status;
  final DateTime bookingDate;
  final DateTime rideDate;
  final double fare;
  final String? specialRequests;
  final String? paymentIntentId;
  final String? paymentStatus; // 'pending', 'completed', 'failed'

  const RideBooking({
    required this.id,
    required this.routeId,
    required this.riderId,
    required this.riderName,
    required this.driverId,
    required this.status,
    required this.bookingDate,
    required this.rideDate,
    this.fare = 8.0, // Fixed $8 fare
    this.specialRequests,
    this.paymentIntentId,
    this.paymentStatus,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'routeId': routeId,
      'riderId': riderId,
      'riderName': riderName,
      'driverId': driverId,
      'status': status.toString(),
      'bookingDate': bookingDate.toIso8601String(),
      'rideDate': rideDate.toIso8601String(),
      'fare': fare,
      'specialRequests': specialRequests,
      'paymentIntentId': paymentIntentId,
      'paymentStatus': paymentStatus,
    };
  }

  factory RideBooking.fromJson(Map<String, dynamic> json) {
    return RideBooking(
      id: json['id'],
      routeId: json['routeId'],
      riderId: json['riderId'],
      riderName: json['riderName'],
      driverId: json['driverId'],
      status: RideStatus.values.firstWhere(
        (status) => status.toString() == json['status'],
      ),
      bookingDate: DateTime.parse(json['bookingDate']),
      rideDate: DateTime.parse(json['rideDate']),
      fare: json['fare']?.toDouble() ?? 8.0,
      specialRequests: json['specialRequests'],
      paymentIntentId: json['paymentIntentId'],
      paymentStatus: json['paymentStatus'],
    );
  }

  RideBooking copyWith({
    String? id,
    String? routeId,
    String? riderId,
    String? riderName,
    String? driverId,
    RideStatus? status,
    DateTime? bookingDate,
    DateTime? rideDate,
    double? fare,
    String? specialRequests,
    String? paymentIntentId,
    String? paymentStatus,
  }) {
    return RideBooking(
      id: id ?? this.id,
      routeId: routeId ?? this.routeId,
      riderId: riderId ?? this.riderId,
      riderName: riderName ?? this.riderName,
      driverId: driverId ?? this.driverId,
      status: status ?? this.status,
      bookingDate: bookingDate ?? this.bookingDate,
      rideDate: rideDate ?? this.rideDate,
      fare: fare ?? this.fare,
      specialRequests: specialRequests ?? this.specialRequests,
      paymentIntentId: paymentIntentId ?? this.paymentIntentId,
      paymentStatus: paymentStatus ?? this.paymentStatus,
    );
  }
}