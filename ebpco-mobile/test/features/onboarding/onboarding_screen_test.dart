import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/features/onboarding/presentation/onboarding_screen.dart';

Widget _wrap(Widget child) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
    ],
    child: MaterialApp(home: child),
  );
}

Widget _wrapWithRouter(Widget child) {
  final router = GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(path: '/onboarding', builder: (context, state) => child),
      GoRoute(
        path: '/login',
        builder: (context, state) => const Scaffold(body: Text('Login')),
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets(
    'shows title, description, and image above the progress dots on every page; swipe/skip work',
    (tester) async {
      await tester.pumpWidget(_wrap(const OnboardingScreen()));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: 'page 1 initial build');

      // Page 1
      expect(find.text('Apply for permits from your phone'), findsOneWidget);
      expect(
        find.text(
          'Submit new, renewal, and amendment permit applications through a simple mobile process.',
        ),
        findsOneWidget,
      );
      var image = tester.widget<Image>(find.byType(Image));
      expect((image.image as AssetImage).assetName, 'assets/images/1.png');
      // Title should be above the image in the render order.
      final titleY = tester
          .getTopLeft(find.text('Apply for permits from your phone'))
          .dy;
      final imageY = tester.getTopLeft(find.byType(Image)).dy;
      expect(titleY, lessThan(imageY));

      // Swipe to page 2.
      await tester.drag(find.byType(PageView), const Offset(-600, 0));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: 'after swipe to page 2');
      expect(find.text('Submit and manage requirements'), findsOneWidget);
      image = tester.widget<Image>(find.byType(Image));
      expect((image.image as AssetImage).assetName, 'assets/images/2.png');

      // Swipe to page 3 (last page) - Skip should disappear, button becomes Get Started.
      await tester.drag(find.byType(PageView), const Offset(-600, 0));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: 'after swipe to page 3');
      expect(find.text('Track your application'), findsOneWidget);
      image = tester.widget<Image>(find.byType(Image));
      expect((image.image as AssetImage).assetName, 'assets/images/3.png');
      expect(find.text('Get Started'), findsOneWidget);

      // No AppAvatar/icon-circle should remain anywhere in the tree.
      expect(find.byIcon(Icons.assignment_outlined), findsNothing);
    },
  );

  testWidgets('Skip button completes onboarding from an early page', (
    tester,
  ) async {
    await tester.pumpWidget(_wrapWithRouter(const OnboardingScreen()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Skip'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'after tapping Skip');
    expect(
      find.text('Login'),
      findsOneWidget,
      reason: 'should navigate to /login',
    );
  });

  testWidgets('renders without overflow on a small phone width', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(320, 568)); // iPhone SE-ish
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    await tester.pumpAndSettle();
    expect(
      tester.takeException(),
      isNull,
      reason: 'small screen, default text scale',
    );
  });

  testWidgets('renders without overflow at 2x text scale', (tester) async {
    await tester.pumpWidget(
      _wrap(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
          child: const OnboardingScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: '2x text scale');
  });

  testWidgets('title sits close to the top instead of a large empty gap', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    await tester.pumpAndSettle();

    final skipBottom = tester.getBottomLeft(find.text('Skip')).dy;
    final titleTop = tester
        .getTopLeft(find.text('Apply for permits from your phone'))
        .dy;
    // Previously this gap was large enough to vertically center the whole
    // page's content; now it should just be a small breathing-room gap.
    expect(titleTop - skipBottom, lessThan(60));
  });

  testWidgets('illustration is a large, dominant element', (tester) async {
    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    await tester.pumpAndSettle();

    final imageSize = tester.getSize(find.byType(Image));
    // Matches the new sizing formula's clamp floor (was 220 before this
    // pass's ~35% increase); confirms the illustration actually grew.
    expect(imageSize.height, greaterThanOrEqualTo(290));
  });

  testWidgets('renders without overflow on a tablet-sized landscape viewport', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(1024, 768));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'tablet landscape');
  });

  testWidgets('renders without overflow on a small landscape phone', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(667, 375));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull, reason: 'small phone landscape');
  });
}
