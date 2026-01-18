import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../widgets/gradient_app_bar.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();

  final _fullName = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();

  bool _loading = false;

  @override
  void dispose() {
    for (final c in [
      _fullName,
      _phone,
      _address,
      _email,
      _password,
      _confirmPassword
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      await _authService.register(
        _fullName.text,
        _email.text,
        _password.text,
        _phone.text,
        _address.text,
      );
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký thành công! Vui lòng đăng nhập.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // Hàm tạo TextFormField gọn gàng
  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscure = false,
    TextInputType type = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        keyboardType: type,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          prefixIcon: Icon(icon),
        ),
        validator: validator,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Đăng ký tài khoản'),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                _buildField(
                  controller: _fullName,
                  label: 'Họ và tên',
                  icon: Icons.person,
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Vui lòng nhập họ tên' : null,
                ),
                _buildField(
                  controller: _phone,
                  label: 'Số điện thoại',
                  icon: Icons.phone,
                  type: TextInputType.phone,
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Vui lòng nhập SĐT' : null,
                ),
                _buildField(
                  controller: _address,
                  label: 'Địa chỉ',
                  icon: Icons.home,
                  type: TextInputType.streetAddress,
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Vui lòng nhập địa chỉ' : null,
                ),
                _buildField(
                  controller: _email,
                  label: 'Email',
                  icon: Icons.email,
                  type: TextInputType.emailAddress,
                  validator: (v) =>
                      v == null || !v.contains('@') ? 'Email không hợp lệ' : null,
                ),
                _buildField(
                  controller: _password,
                  label: 'Mật khẩu',
                  icon: Icons.lock,
                  obscure: true,
                  validator: (v) =>
                      v != null && v.length >= 6 ? null : 'Tối thiểu 6 ký tự',
                ),
                _buildField(
                  controller: _confirmPassword,
                  label: 'Xác nhận mật khẩu',
                  icon: Icons.lock_outline,
                  obscure: true,
                  validator: (v) =>
                      v != _password.text ? 'Mật khẩu không khớp' : null,
                ),
                const SizedBox(height: 10),
                _loading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _submit,
                        style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 48)),
                        child: const Text('Đăng ký'),
                      ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Đã có tài khoản? Đăng nhập'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
