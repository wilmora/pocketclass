enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  cancelled,
  refunded,
}

enum PaymentMethod {
  creditCard,
  debitCard,
  applePay,
  googlePay,
  paypal,
  bankTransfer,
}

class PaymentCard {
  final String id;
  final String last4;
  final String brand; // visa, mastercard, amex, etc.
  final int expMonth;
  final int expYear;
  final String holderName;
  final bool isDefault;
  final String? nickname;

  const PaymentCard({
    required this.id,
    required this.last4,
    required this.brand,
    required this.expMonth,
    required this.expYear,
    required this.holderName,
    this.isDefault = false,
    this.nickname,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'last4': last4,
      'brand': brand,
      'expMonth': expMonth,
      'expYear': expYear,
      'holderName': holderName,
      'isDefault': isDefault,
      'nickname': nickname,
    };
  }

  factory PaymentCard.fromJson(Map<String, dynamic> json) {
    return PaymentCard(
      id: json['id'] ?? '',
      last4: json['last4'] ?? '',
      brand: json['brand'] ?? '',
      expMonth: json['expMonth'] ?? 0,
      expYear: json['expYear'] ?? 0,
      holderName: json['holderName'] ?? '',
      isDefault: json['isDefault'] ?? false,
      nickname: json['nickname'],
    );
  }

  PaymentCard copyWith({
    String? id,
    String? last4,
    String? brand,
    int? expMonth,
    int? expYear,
    String? holderName,
    bool? isDefault,
    String? nickname,
  }) {
    return PaymentCard(
      id: id ?? this.id,
      last4: last4 ?? this.last4,
      brand: brand ?? this.brand,
      expMonth: expMonth ?? this.expMonth,
      expYear: expYear ?? this.expYear,
      holderName: holderName ?? this.holderName,
      isDefault: isDefault ?? this.isDefault,
      nickname: nickname ?? this.nickname,
    );
  }
}

class PaymentIntent {
  final String id;
  final String clientSecret;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final String? description;
  final Map<String, dynamic>? metadata;

  const PaymentIntent({
    required this.id,
    required this.clientSecret,
    required this.amount,
    required this.currency,
    required this.status,
    this.description,
    this.metadata,
  });

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    return PaymentIntent(
      id: json['id'] ?? '',
      clientSecret: json['client_secret'] ?? '',
      amount: (json['amount'] ?? 0).toDouble() / 100, // Stripe uses cents
      currency: json['currency'] ?? 'usd',
      status: PaymentStatus.values.firstWhere(
        (status) => status.name == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
      description: json['description'],
      metadata: json['metadata'],
    );
  }
}

class Payment {
  final String id;
  final String userId;
  final String? rideBookingId;
  final String? subscriptionId;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final PaymentMethod method;
  final String? cardLast4;
  final String? cardBrand;
  final String? transactionId;
  final String? description;
  final DateTime createdAt;
  final DateTime? processedAt;
  final String? failureReason;
  final Map<String, dynamic>? metadata;

  const Payment({
    required this.id,
    required this.userId,
    this.rideBookingId,
    this.subscriptionId,
    required this.amount,
    required this.currency,
    required this.status,
    required this.method,
    this.cardLast4,
    this.cardBrand,
    this.transactionId,
    this.description,
    required this.createdAt,
    this.processedAt,
    this.failureReason,
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'rideBookingId': rideBookingId,
      'subscriptionId': subscriptionId,
      'amount': amount,
      'currency': currency,
      'status': status.name,
      'method': method.name,
      'cardLast4': cardLast4,
      'cardBrand': cardBrand,
      'transactionId': transactionId,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'processedAt': processedAt?.toIso8601String(),
      'failureReason': failureReason,
      'metadata': metadata,
    };
  }

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      rideBookingId: json['rideBookingId'],
      subscriptionId: json['subscriptionId'],
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'usd',
      status: PaymentStatus.values.firstWhere(
        (status) => status.name == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
      method: PaymentMethod.values.firstWhere(
        (method) => method.name == json['method'],
        orElse: () => PaymentMethod.creditCard,
      ),
      cardLast4: json['cardLast4'],
      cardBrand: json['cardBrand'],
      transactionId: json['transactionId'],
      description: json['description'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      processedAt: json['processedAt'] != null 
          ? DateTime.parse(json['processedAt']) 
          : null,
      failureReason: json['failureReason'],
      metadata: json['metadata'],
    );
  }

  Payment copyWith({
    String? id,
    String? userId,
    String? rideBookingId,
    String? subscriptionId,
    double? amount,
    String? currency,
    PaymentStatus? status,
    PaymentMethod? method,
    String? cardLast4,
    String? cardBrand,
    String? transactionId,
    String? description,
    DateTime? createdAt,
    DateTime? processedAt,
    String? failureReason,
    Map<String, dynamic>? metadata,
  }) {
    return Payment(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      rideBookingId: rideBookingId ?? this.rideBookingId,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      method: method ?? this.method,
      cardLast4: cardLast4 ?? this.cardLast4,
      cardBrand: cardBrand ?? this.cardBrand,
      transactionId: transactionId ?? this.transactionId,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      processedAt: processedAt ?? this.processedAt,
      failureReason: failureReason ?? this.failureReason,
      metadata: metadata ?? this.metadata,
    );
  }
}

class Wallet {
  final String userId;
  final double balance;
  final String currency;
  final List<PaymentCard> cards;
  final String? defaultCardId;
  final bool autoRecharge;
  final double autoRechargeThreshold;
  final double autoRechargeAmount;

  const Wallet({
    required this.userId,
    this.balance = 0.0,
    this.currency = 'usd',
    this.cards = const [],
    this.defaultCardId,
    this.autoRecharge = false,
    this.autoRechargeThreshold = 10.0,
    this.autoRechargeAmount = 50.0,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'balance': balance,
      'currency': currency,
      'cards': cards.map((card) => card.toJson()).toList(),
      'defaultCardId': defaultCardId,
      'autoRecharge': autoRecharge,
      'autoRechargeThreshold': autoRechargeThreshold,
      'autoRechargeAmount': autoRechargeAmount,
    };
  }

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      userId: json['userId'] ?? '',
      balance: (json['balance'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'usd',
      cards: (json['cards'] as List<dynamic>? ?? [])
          .map((cardJson) => PaymentCard.fromJson(cardJson))
          .toList(),
      defaultCardId: json['defaultCardId'],
      autoRecharge: json['autoRecharge'] ?? false,
      autoRechargeThreshold: (json['autoRechargeThreshold'] ?? 10.0).toDouble(),
      autoRechargeAmount: (json['autoRechargeAmount'] ?? 50.0).toDouble(),
    );
  }

  Wallet copyWith({
    String? userId,
    double? balance,
    String? currency,
    List<PaymentCard>? cards,
    String? defaultCardId,
    bool? autoRecharge,
    double? autoRechargeThreshold,
    double? autoRechargeAmount,
  }) {
    return Wallet(
      userId: userId ?? this.userId,
      balance: balance ?? this.balance,
      currency: currency ?? this.currency,
      cards: cards ?? this.cards,
      defaultCardId: defaultCardId ?? this.defaultCardId,
      autoRecharge: autoRecharge ?? this.autoRecharge,
      autoRechargeThreshold: autoRechargeThreshold ?? this.autoRechargeThreshold,
      autoRechargeAmount: autoRechargeAmount ?? this.autoRechargeAmount,
    );
  }

  PaymentCard? get defaultCard {
    if (defaultCardId == null) return null;
    try {
      return cards.firstWhere((card) => card.id == defaultCardId);
    } catch (e) {
      return null;
    }
  }

  bool get hasCards => cards.isNotEmpty;

  bool get hasDefaultCard => defaultCard != null;

  double get availableBalance => balance;
}