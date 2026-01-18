import './api_service.dart';

class ProductService {
  final ApiService _api = ApiService();

  // 🛍️ Lấy danh sách sản phẩm
  Future<List<dynamic>> getAllProducts() async {
    final res = await _api.get('/products', needsAuth: false);
    print('📦 Dữ liệu nhận được từ backend: $res');

    if (res is Map &&
        res.containsKey('data') &&
        res['data'] is Map &&
        res['data']['products'] is List) {
      return res['data']['products'];
    }

    return [];
  }

  // 📚 Lấy danh sách loại thiết bị y tế từ BE
  Future<List<String>> getDeviceTypes() async {
    final res = await _api.get('/products/device-types', needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic> && data['types'] is List) {
      final list = (data['types'] as List).map((e) => e.toString()).toList();
      return List<String>.from(list);
    }
    return [];
  }

  // 📚 Lấy danh mục thiết bị y tế có nhãn hiển thị
  Future<List<Map<String, String>>> getDeviceTypeOptions() async {
    final res = await _api.get('/products/device-type-options', needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic> && data['options'] is List) {
      final list = (data['options'] as List).cast<Map<String, dynamic>>();
      return list
          .map((e) => {
                'key': e['key']?.toString() ?? '',
                'label': e['label']?.toString() ?? (e['key']?.toString() ?? ''),
              })
          .toList();
    }
    return [];
  }

  // 🔎 Lấy sản phẩm với tham số lọc từ backend
  Future<List<dynamic>> getProducts({
    String? search,
    String? category,
    String? deviceType,
    num? minPrice,
    num? maxPrice,
    String? sortBy,
    String? sortOrder,
    int? page,
    int? limit,
  }) async {
    final params = <String, String>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (deviceType != null && deviceType.isNotEmpty)
      params['deviceType'] = deviceType;
    if (minPrice != null) params['minPrice'] = minPrice.toString();
    if (maxPrice != null) params['maxPrice'] = maxPrice.toString();
    if (sortBy != null) params['sortBy'] = sortBy;
    if (sortOrder != null) params['sortOrder'] = sortOrder;
    if (page != null) params['page'] = page.toString();
    if (limit != null) params['limit'] = limit.toString();

    final query = params.entries
        .map(
          (e) =>
              '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent(e.value)}',
        )
        .join('&');
    final endpoint = query.isEmpty ? '/products' : '/products?$query';

    final res = await _api.get(endpoint, needsAuth: false);
    if (res is Map &&
        res.containsKey('data') &&
        res['data'] is Map &&
        res['data']['products'] is List) {
      return res['data']['products'];
    }
    return [];
  }

  // 🔍 Lấy chi tiết sản phẩm
  Future<Map<String, dynamic>?> getProductById(int id) async {
    final res = await _api.get('/products/$id', needsAuth: false);
    if (res is Map &&
        res.containsKey('data') &&
        res['data'] is Map<String, dynamic>) {
      return res['data'] as Map<String, dynamic>;
    }
    return null;
  }
}
