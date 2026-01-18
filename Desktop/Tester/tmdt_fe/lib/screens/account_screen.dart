import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import '../widgets/gradient_app_bar.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final _storage = const FlutterSecureStorage();
  final _authService = AuthService();
  String? _email;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    // Nếu backend có endpoint /me thì có thể gọi để lấy profile
    final token = await _storage.read(key: 'jwt_token');
    setState(() {
      _email =
          token != null && token.isNotEmpty ? 'Đã đăng nhập' : 'Chưa đăng nhập';
    });
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Tài khoản'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.blue.shade100,
                      child: const Icon(
                        Icons.person,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Tài khoản',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(
                                (_email == 'Đã đăng nhập')
                                    ? Icons.check_circle
                                    : Icons.error_outline,
                                color:
                                    (_email == 'Đã đăng nhập')
                                        ? Colors.green
                                        : Colors.orange,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(_email ?? '...'),
                            ],
                          ),
                        ],
                      ),
                    ),
                    FilledButton.tonal(
                      onPressed: _logout,
                      child: const Text('Đăng xuất'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: Icon(
                      Icons.receipt_long,
                      color: Colors.blue.shade600,
                    ),
                    title: const Text('Đơn hàng của tôi'),
                    subtitle: const Text('Xem lịch sử mua hàng'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).pushNamed('/orders'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Icon(
                      Icons.location_on_outlined,
                      color: Colors.blue.shade600,
                    ),
                    title: const Text('Địa chỉ giao hàng'),
                    subtitle: const Text('Quản lý địa chỉ'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).pushNamed('/addresses'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.favorite, color: Colors.red),
                    title: const Text('Sản phẩm yêu thích'),
                    subtitle: const Text('Danh sách đã lưu'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).pushNamed('/favorites'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Icon(
                      Icons.lock_reset,
                      color: Colors.blue.shade600,
                    ),
                    title: const Text('Đổi mật khẩu'),
                    subtitle: const Text('Cập nhật mật khẩu tài khoản'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap:
                        () =>
                            Navigator.of(context).pushNamed('/change-password'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
