import './api_service.dart';

class BannerService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getBanners({String position = 'home'}) async {
    final res = await _api.get('/banners?position=$position', needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic> && data['banners'] is List) {
      return List<Map<String, dynamic>>.from(data['banners']);
    }
    return [];
  }
}
