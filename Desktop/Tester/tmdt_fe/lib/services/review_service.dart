import './api_service.dart';

class ReviewService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getProductReviews(int productId) async {
    final res = await _api.get('/products/$productId/reviews', needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic> && data['reviews'] is List) return data['reviews'] as List<dynamic>;
    if (data is List) return data;
    return [];
  }

  Future<Map<String, dynamic>?> getRatingStats(int productId) async {
    final res = await _api.get('/products/$productId/rating-stats', needsAuth: false) as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : null;
  }

  Future<Map<String, dynamic>?> createReview(int productId, int rating, String comment) async {
    final res = await _api.post('/products/$productId/reviews', {
      'rating': rating,
      'comment': comment,
    }, needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : null;
  }

  Future<Map<String, dynamic>?> updateReview(int reviewId, int rating, String comment) async {
    final res = await _api.post('/reviews/$reviewId', {
      'rating': rating,
      'comment': comment,
      '_method': 'PUT',
    }, needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : null;
  }

  Future<void> deleteReview(int reviewId) async {
    await _api.delete('/reviews/$reviewId', needsAuth: true);
  }
}
