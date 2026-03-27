// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:sharing_app/main.dart';

void main() {
  testWidgets('App launches and shows home screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the app shows RideShare title
    expect(find.text('RideShare'), findsOneWidget);
    
    // Verify that both user type buttons are present
    expect(find.text('I\'m a Driver'), findsOneWidget);
    expect(find.text('I need a Ride'), findsOneWidget);
    
    // Verify the fixed fare is displayed
    expect(find.text('Fixed fare: \$8.00 per ride'), findsOneWidget);
  });

  testWidgets('Driver button navigation works', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Tap the driver button
    await tester.tap(find.text('I\'m a Driver'));
    await tester.pumpAndSettle();

    // Verify navigation to driver dashboard
    expect(find.text('Driver Dashboard'), findsOneWidget);
  });

  testWidgets('Rider button navigation works', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Tap the rider button
    await tester.tap(find.text('I need a Ride'));
    await tester.pumpAndSettle();

    // Verify navigation to rider dashboard
    expect(find.text('Rider Dashboard'), findsOneWidget);
  });
}
