import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/payment_models.dart' as models;
import '../../services/payment_service.dart';
import '../../providers/app_state.dart';
import '../../widgets/routes_logo.dart';

class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  final PaymentService _paymentService = PaymentService();
  late Future<void> _loadDataFuture;
  models.Wallet? _wallet;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadDataFuture = _loadWalletData();
  }

  Future<void> _loadWalletData() async {
    final response = await _paymentService.getWallet();
    if (response.success && response.data != null) {
      setState(() {
        _wallet = response.data;
      });
    }
  }

  Future<void> _addPaymentMethod() async {
    final appState = context.read<AppState>();
    final user = appState.currentUser;
    
    if (user == null) {
      _showError('User not found');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await _paymentService.setupPaymentMethod(
        context: context,
        customerName: user.name,
        customerEmail: user.email,
      );

      if (result.success) {
        _showSuccess('Payment method added successfully');
        await _loadWalletData();
      } else {
        _showError(result.message ?? 'Failed to add payment method');
      }
    } catch (e) {
      _showError('Failed to add payment method: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _removePaymentMethod(String paymentMethodId) async {
    final result = await _paymentService.removePaymentMethod(paymentMethodId);
    
    if (result.success) {
      _showSuccess('Payment method removed');
      await _loadWalletData();
    } else {
      _showError(result.message ?? 'Failed to remove payment method');
    }
  }

  Future<void> _setDefaultPaymentMethod(String paymentMethodId) async {
    final result = await _paymentService.setDefaultPaymentMethod(paymentMethodId);
    
    if (result.success) {
      _showSuccess('Default payment method updated');
      await _loadWalletData();
    } else {
      _showError(result.message ?? 'Failed to set default payment method');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showRemoveConfirmation(models.PaymentCard card) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Payment Method'),
        content: Text('Are you sure you want to remove this ${card.brand.toUpperCase()} ending in ${card.last4}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _removePaymentMethod(card.id);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const RoutesLogo(
              size: 24,
              showText: false,
            ),
            const SizedBox(width: 8),
            const Text('Payment'),
          ],
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: FutureBuilder<void>(
        future: _loadDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          
          return RefreshIndicator(
            onRefresh: _loadWalletData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Wallet Balance Section
                  if (_wallet != null) ...[
                    _buildWalletBalanceCard(),
                    const SizedBox(height: 24),
                  ],
                  
                  // Payment Methods Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Payment Methods',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: _isLoading ? null : _addPaymentMethod,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Card'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  if (_wallet?.hasCards == true)
                    ..._wallet!.cards.map((card) => _buildPaymentCard(card))
                  else
                    _buildEmptyPaymentMethods(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildWalletBalanceCard() {
    return Card(
      elevation: 4,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.shade600,
              Colors.blue.shade800,
            ],
          ),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Wallet Balance',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              PaymentService.formatCurrency(_wallet!.balance),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showAddMoneyDialog(),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Money'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.blue.shade800,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  onPressed: () => _showTransactionHistory(),
                  icon: const Icon(Icons.history, color: Colors.white),
                  tooltip: 'Transaction History',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentCard(models.PaymentCard card) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 50,
          height: 32,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            color: _getCardColor(card.brand),
          ),
          child: Center(
            child: Text(
              card.brand.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        title: Text('•••• •••• •••• ${card.last4}'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${card.holderName} • ${card.expMonth.toString().padLeft(2, '0')}/${card.expYear}'),
            if (card.nickname != null)
              Text(
                card.nickname!,
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Colors.grey.shade600,
                ),
              ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'default':
                _setDefaultPaymentMethod(card.id);
                break;
              case 'remove':
                _showRemoveConfirmation(card);
                break;
            }
          },
          itemBuilder: (context) => [
            if (!card.isDefault)
              const PopupMenuItem(
                value: 'default',
                child: ListTile(
                  leading: Icon(Icons.star),
                  title: Text('Set as Default'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            const PopupMenuItem(
              value: 'remove',
              child: ListTile(
                leading: Icon(Icons.delete, color: Colors.red),
                title: Text('Remove', style: TextStyle(color: Colors.red)),
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyPaymentMethods() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(
            Icons.credit_card,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'No Payment Methods',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add a payment method to start making payments',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _addPaymentMethod,
            icon: const Icon(Icons.add),
            label: const Text('Add Payment Method'),
          ),
        ],
      ),
    );
  }

  Color _getCardColor(String brand) {
    switch (brand.toLowerCase()) {
      case 'visa':
        return Colors.blue;
      case 'mastercard':
        return Colors.red;
      case 'amex':
        return Colors.green;
      case 'discover':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  void _showAddMoneyDialog() {
    showDialog(
      context: context,
      builder: (context) => AddMoneyDialog(
        wallet: _wallet!,
        onSuccess: () => _loadWalletData(),
      ),
    );
  }

  void _showTransactionHistory() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const PaymentHistoryScreen(),
      ),
    );
  }
}

class AddMoneyDialog extends StatefulWidget {
  final models.Wallet wallet;
  final VoidCallback onSuccess;

  const AddMoneyDialog({
    super.key,
    required this.wallet,
    required this.onSuccess,
  });

  @override
  State<AddMoneyDialog> createState() => _AddMoneyDialogState();
}

class _AddMoneyDialogState extends State<AddMoneyDialog> {
  final TextEditingController _amountController = TextEditingController();
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = false;
  String? _selectedCardId;

  @override
  void initState() {
    super.initState();
    _selectedCardId = widget.wallet.defaultCardId;
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _addMoney() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      _showError('Please enter a valid amount');
      return;
    }

    if (_selectedCardId == null) {
      _showError('Please select a payment method');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await _paymentService.addMoneyToWallet(
        amount: amount,
        paymentMethodId: _selectedCardId!,
      );

      if (result.success) {
        Navigator.of(context).pop();
        widget.onSuccess();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Successfully added ${PaymentService.formatCurrency(amount)}'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        _showError(result.message ?? 'Failed to add money to wallet');
      }
    } catch (e) {
      _showError('Failed to add money: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Money to Wallet'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Amount',
              prefixText: '\$',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Select Payment Method:'),
          const SizedBox(height: 8),
          ...widget.wallet.cards.map((card) => RadioListTile<String>(
            title: Text('•••• •••• •••• ${card.last4}'),
            subtitle: Text(card.brand.toUpperCase()),
            value: card.id,
            groupValue: _selectedCardId,
            onChanged: (value) {
              setState(() {
                _selectedCardId = value;
              });
            },
          )),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _addMoney,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Add Money'),
        ),
      ],
    );
  }
}

class PaymentHistoryScreen extends StatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  State<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends State<PaymentHistoryScreen> {
  final PaymentService _paymentService = PaymentService();
  List<models.Payment> _payments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPaymentHistory();
  }

  Future<void> _loadPaymentHistory() async {
    final response = await _paymentService.getPaymentHistory();
    if (response.success && response.data != null) {
      setState(() {
        _payments = response.data!;
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment History'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPaymentHistory,
              child: _payments.isEmpty
                  ? const Center(
                      child: Text('No payment history found'),
                    )
                  : ListView.builder(
                      itemCount: _payments.length,
                      itemBuilder: (context, index) {
                        final payment = _payments[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 4,
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getStatusColor(payment.status),
                              child: Icon(
                                _getStatusIcon(payment.status),
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                            title: Text(
                              PaymentService.formatCurrency(payment.amount),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(payment.description ?? 'Payment'),
                                Text(
                                  '${payment.createdAt.day}/${payment.createdAt.month}/${payment.createdAt.year}',
                                  style: TextStyle(color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusColor(payment.status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _getStatusColor(payment.status),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                payment.status.name.toUpperCase(),
                                style: TextStyle(
                                  color: _getStatusColor(payment.status),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Color _getStatusColor(models.PaymentStatus status) {
    switch (status) {
      case models.PaymentStatus.completed:
        return Colors.green;
      case models.PaymentStatus.failed:
        return Colors.red;
      case models.PaymentStatus.pending:
      case models.PaymentStatus.processing:
        return Colors.orange;
      case models.PaymentStatus.cancelled:
        return Colors.grey;
      case models.PaymentStatus.refunded:
        return Colors.blue;
    }
  }

  IconData _getStatusIcon(models.PaymentStatus status) {
    switch (status) {
      case models.PaymentStatus.completed:
        return Icons.check;
      case models.PaymentStatus.failed:
        return Icons.close;
      case models.PaymentStatus.pending:
      case models.PaymentStatus.processing:
        return Icons.schedule;
      case models.PaymentStatus.cancelled:
        return Icons.cancel;
      case models.PaymentStatus.refunded:
        return Icons.replay;
    }
  }
}