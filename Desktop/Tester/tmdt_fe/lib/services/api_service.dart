import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/env.dart';

class ApiService {
  static const String _baseUrl = Env.apiBaseUrl;
  static void Function()? onUnauthorized;
  final _storage = const FlutterSecureStorage();

  // 🟢 POST request
  Future<dynamic> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool needsAuth = false,
  }) async {
    final headers = await _getHeaders(needsAuth: needsAuth);
    final url = Uri.parse('$_baseUrl$endpoint');

    print('📤 POST $url');
    print('🪪 Headers: $headers');
    print('📦 Body: $body');

    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(body),
    );
    return await _handleResponse(response, handle401: needsAuth);
  }

  // 🟢 GET request
  Future<dynamic> get(String endpoint, {bool needsAuth = true}) async {
    final headers = await _getHeaders(needsAuth: needsAuth);
    final url = Uri.parse('$_baseUrl$endpoint');

    print('🔍 GET $url');
    print('🪪 Headers: $headers');

    final response = await http.get(url, headers: headers);
    return await _handleResponse(response, handle401: needsAuth);
  }

  // 🟢 DELETE request
  Future<dynamic> delete(String endpoint, {bool needsAuth = true}) async {
    final headers = await _getHeaders(needsAuth: needsAuth);
    final url = Uri.parse('$_baseUrl$endpoint');

    print('❌ DELETE $url');
    print('🪪 Headers: $headers');

    final response = await http.delete(url, headers: headers);
    return await _handleResponse(response, handle401: needsAuth);
  }

  // 🟢 PATCH request
  Future<dynamic> patch(
    String endpoint,
    Map<String, dynamic> body, {
    bool needsAuth = false,
  }) async {
    final headers = await _getHeaders(needsAuth: needsAuth);
    final url = Uri.parse('$_baseUrl$endpoint');

    print('✏️ PATCH $url');
    print('🪪 Headers: $headers');
    print('📦 Body: $body');

    final response = await http.patch(
      url,
      headers: headers,
      body: jsonEncode(body),
    );
    return await _handleResponse(response, handle401: needsAuth);
  }

  // 🔑 Headers (đảm bảo có Bearer token)
  Future<Map<String, String>> _getHeaders({bool needsAuth = false}) async {
    final headers = {'Content-Type': 'application/json; charset=UTF-8'};

    if (needsAuth) {
      final token = await _storage.read(key: 'jwt_token');
      print('🔑 Token đọc từ SecureStorage: $token');

      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token'.trim();
      } else {
        print('⚠️ Không có jwt_token -> cần đăng nhập lại!');
      }
    }

    return headers;
  }

  // 🧠 Xử lý response
  Future<dynamic> _handleResponse(http.Response response, {bool handle401 = true}) async {
    final status = response.statusCode;
    print('📬 Response ($status): ${response.body}');
    dynamic data;

    try {
      data = jsonDecode(response.body);
    } catch (_) {
      data = {'message': 'Không đọc được dữ liệu JSON'};
    }

    if (status >= 200 && status < 300) return data;

    if (status == 401) {
      if (handle401) {
        await _storage.delete(key: 'jwt_token');
        if (onUnauthorized != null) {
          onUnauthorized!.call();
        }
        throw Exception('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      } else {
        if (data is Map<String, dynamic> && data.containsKey('message')) {
          throw Exception(data['message']);
        }
        throw Exception('Tài khoản hoặc mật khẩu không chính xác');
      }
    }

    if (data is Map<String, dynamic> && data.containsKey('message')) {
      throw Exception(data['message']);
    }

    throw Exception('Lỗi không xác định. Status code: $status');
  }
}
