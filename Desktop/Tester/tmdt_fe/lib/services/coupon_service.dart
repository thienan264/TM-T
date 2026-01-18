import './api_service.dart';

class CouponService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> validate(String code, num orderTotal) async {
    final res = await _api.post('/coupons/validate', {
      'code': code,
      'orderTotal': orderTotal,
    }, needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : {};
  }
}
