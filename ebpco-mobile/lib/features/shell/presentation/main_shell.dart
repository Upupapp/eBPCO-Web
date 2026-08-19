import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Main app shell with a bottom navigation bar. Tab state is preserved via
/// go_router's [StatefulShellRoute.indexedStack], which keeps each branch's
/// navigator (and its widget tree) alive across tab switches.
class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // No top SafeArea here: screens without an AppBar (e.g. Dashboard's
      // HeroHeader) render full-bleed and apply their own top inset;
      // AppBar-based screens already position themselves below the status
      // bar via Scaffold, so this was previously a redundant wrapper.
      body: navigationShell,
      bottomNavigationBar: SafeArea(
        top: false,
        child: NavigationBar(
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: _onTap,
          // Slightly taller than Material 3's 80dp default so that if a
          // label ever still wraps to two lines on an unusually narrow
          // device or high text-scale combination, the second line has
          // room to render instead of being clipped at the bar's edge.
          height: 88,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.folder_outlined),
              selectedIcon: Icon(Icons.folder),
              label: 'Applications',
            ),
            NavigationDestination(
              icon: Icon(Icons.payments_outlined),
              selectedIcon: Icon(Icons.payments),
              label: 'Payments',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
