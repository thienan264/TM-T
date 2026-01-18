import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../utils/navigation_intent.dart';

class AuthGuard extends StatefulWidget {
  final String routeName;
  final Widget child;
  const AuthGuard({super.key, required this.routeName, required this.child});

  @override
  State<AuthGuard> createState() => _AuthGuardState();
}

class _AuthGuardState extends State<AuthGuard> {
  final AuthService _auth = AuthService();
  bool _checked = false;
  bool _loggedIn = false;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    final ok = await _auth.isLoggedIn();
    if (!ok && mounted) {
      NavigationIntent.set(widget.routeName);
      Navigator.of(context).pushNamed('/login');
    }
    if (mounted) setState(() { _checked = true; _loggedIn = ok; });
  }

  @override
  Widget build(BuildContext context) {
    if (!_checked) return const SizedBox.shrink();
    return _loggedIn ? widget.child : const SizedBox.shrink();
  }
}
