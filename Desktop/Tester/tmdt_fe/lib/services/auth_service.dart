import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import './api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  // 🟢 Đăng nhập
  Future<String> login(String email, String password) async {
    try {
      final body = {'email': email.trim(), 'password': password.trim()};

      final data =
          await _apiService.post('/auth/login', body) as Map<String, dynamic>;

      final token = data['token'] ?? data['data']?['token'];
      if (token == null || token.toString().isEmpty) {
        throw Exception("Không nhận được token từ server");
      }

      await _storage.write(key: 'jwt_token', value: token.trim());
      print('✅ Token đã lưu: $token');
      return token;
    } catch (e) {
      print('❌ Lỗi đăng nhập: $e');
      throw Exception(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  // 🟢 Đăng ký (gửi đủ tất cả field, BE tự bỏ qua nếu không dùng)
  Future<void> register(
    String fullName,
    String email,
    String password,
    String phone,
    String address,
  ) async {
    try {
      final body = {
        'name': fullName.trim(),
        'fullName': fullName.trim(),
        'email': email.trim(),
        'password': password.trim(),
        'phone': phone.trim(),
        'address': address.trim(),
      };

      print("📤 Gửi request đăng ký: $body");

      final data = await _apiService.post('/auth/register', body);

      print("✅ Đăng ký thành công: $data");
    } catch (e) {
      print("❌ Lỗi đăng ký: $e");
      throw Exception(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  // 🟡 Đăng xuất
  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    print('🚪 Đã đăng xuất, token bị xóa');
  }

  // 🟣 Kiểm tra login
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'jwt_token');
    print('🔎 Token hiện tại: $token');
    return token != null && token.isNotEmpty;
  }

  // 🟢 Lấy token
  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  // 🔐 Đổi mật khẩu
  Future<void> changePassword(String oldPassword, String newPassword) async {
    final body = {
      'oldPassword': oldPassword.trim(),
      'newPassword': newPassword.trim(),
    };
    await _apiService.post('/auth/change-password', body, needsAuth: true);
  }
}
