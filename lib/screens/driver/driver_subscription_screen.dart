import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/app_state.dart';
import '../../models/user_model.dart';

class DriverSubscriptionScreen extends StatelessWidget {
  const DriverSubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Subscription'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        leading: IconButton(
          onPressed: () => context.go('/driver'),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          final user = appState.currentUser;
          final isSubscribed = user?.isSubscriptionActive ?? false;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Current Status Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Icon(
                          isSubscribed ? Icons.check_circle : Icons.circle_outlined,
                          size: 64,
                          color: isSubscribed ? Colors.green : Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          isSubscribed ? 'Premium Driver' : 'Basic Driver',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isSubscribed 
                              ? 'You have access to all premium features'
                              : 'Upgrade to unlock premium features',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Subscription Plans
                Text(
                  'Choose Your Plan',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),

                // Basic Plan
                _buildPlanCard(
                  context,
                  title: 'Basic',
                  price: 'Free',
                  period: '',
                  features: [
                    'Create up to 3 routes',
                    'Basic route management',
                    'Standard booking notifications',
                    'Basic earnings tracking',
                  ],
                  isActive: !isSubscribed,
                  onTap: isSubscribed ? () => _downgradePlan(context, appState) : null,
                  buttonText: isSubscribed ? 'Current Plan' : 'Free Forever',
                  isPremium: false,
                ),
                const SizedBox(height: 16),

                // Premium Plan
                _buildPlanCard(
                  context,
                  title: 'Premium',
                  price: '\$9.99',
                  period: '/month',
                  features: [
                    'Unlimited routes',
                    'Advanced analytics',
                    'Priority customer support',
                    'Route optimization suggestions',
                    'Passenger feedback insights',
                    'Flexible scheduling tools',
                    'Enhanced earnings reports',
                  ],
                  isActive: isSubscribed,
                  onTap: !isSubscribed ? () => _upgradePlan(context, appState) : null,
                  buttonText: isSubscribed ? 'Active' : 'Upgrade Now',
                  isPremium: true,
                ),
                const SizedBox(height: 24),

                // Benefits Section
                Text(
                  'Why Go Premium?',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildBenefitItem(
                          context,
                          Icons.trending_up,
                          'Maximize Earnings',
                          'Advanced analytics help you optimize your routes for maximum profit',
                        ),
                        const Divider(),
                        _buildBenefitItem(
                          context,
                          Icons.schedule,
                          'Save Time',
                          'Smart scheduling tools reduce planning time and increase efficiency',
                        ),
                        const Divider(),
                        _buildBenefitItem(
                          context,
                          Icons.star,
                          'Better Service',
                          'Passenger insights help you improve service and get better ratings',
                        ),
                        const Divider(),
                        _buildBenefitItem(
                          context,
                          Icons.support_agent,
                          'Priority Support',
                          'Get help faster with dedicated premium customer support',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Money Back Guarantee
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.verified_user,
                        color: Colors.green[700],
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '30-Day Money Back Guarantee',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.green[700],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Try premium risk-free. Cancel anytime.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.green[700],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlanCard(
    BuildContext context, {
    required String title,
    required String price,
    required String period,
    required List<String> features,
    required bool isActive,
    required VoidCallback? onTap,
    required String buttonText,
    required bool isPremium,
  }) {
    return Card(
      elevation: isPremium ? 8 : 2,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: isPremium
              ? Border.all(color: Theme.of(context).colorScheme.primary, width: 2)
              : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Plan Header
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              title,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (isPremium) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.orange,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'POPULAR',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              price,
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            if (period.isNotEmpty)
                              Text(
                                period,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (isActive)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'ACTIVE',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 20),

              // Features
              ...features.map((feature) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        feature,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              )),
              const SizedBox(height: 20),

              // Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isActive 
                        ? Colors.grey[300] 
                        : (isPremium 
                            ? Theme.of(context).colorScheme.primary 
                            : Theme.of(context).colorScheme.outline),
                    foregroundColor: isActive 
                        ? Colors.grey[600] 
                        : (isPremium 
                            ? Theme.of(context).colorScheme.onPrimary 
                            : Theme.of(context).colorScheme.onSurface),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    buttonText,
                    style: const TextStyle(
                      fontSize: 16,
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

  Widget _buildBenefitItem(BuildContext context, IconData icon, String title, String description) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).colorScheme.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _upgradePlan(BuildContext context, AppState appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upgrade to Premium'),
        content: const Text('Upgrade to Premium for \$9.99/month?\n\nYou\'ll get access to all premium features immediately.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // Simulate subscription upgrade
              final user = appState.currentUser;
              if (user != null) {
                final updatedUser = user.copyWith(
                  subscription: Subscription(
                    type: SubscriptionType.premium,
                    isActive: true,
                    startDate: DateTime.now(),
                    endDate: DateTime.now().add(const Duration(days: 30)),
                  ),
                );
                appState.setCurrentUser(updatedUser);
              }
              
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Successfully upgraded to Premium!'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Upgrade'),
          ),
        ],
      ),
    );
  }

  void _downgradePlan(BuildContext context, AppState appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Downgrade to Basic'),
        content: const Text('Are you sure you want to downgrade to Basic?\n\nYou\'ll lose access to premium features.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // Simulate subscription downgrade
              final user = appState.currentUser;
              if (user != null) {
                final updatedUser = user.copyWith(
                  subscription: const Subscription(
                    type: SubscriptionType.basic,
                    isActive: false,
                  ),
                );
                appState.setCurrentUser(updatedUser);
              }
              
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Downgraded to Basic plan'),
                ),
              );
            },
            child: const Text('Downgrade'),
          ),
        ],
      ),
    );
  }
}