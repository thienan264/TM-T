import './api_service.dart';

class OrderService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getMyOrders({int page = 1, int limit = 10}) async {
    final res = await _api.get('/orders?page=$page&limit=$limit', needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic> && data['orders'] is List) {
      return data['orders'] as List<dynamic>;
    }
    return [];
  }

  Future<Map<String, dynamic>?> getOrderById(int id) async {
    final res = await _api.get('/orders/$id', needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : null;
  }
}
