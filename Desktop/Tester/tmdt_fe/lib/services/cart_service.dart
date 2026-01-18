import './api_service.dart';

class CartService {
  final ApiService _api = ApiService();

  // 🟢 Lấy giỏ hàng (cần đăng nhập)
  Future<List<dynamic>> getCart() async {
    final res =
        await _api.get('/cart', needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    // Vì BE trả { cartDetails: [...] }
    return (data is Map<String, dynamic>) ? (data['cartDetails'] ?? []) : [];
  }

  // 🟢 Thêm vào giỏ (cần đăng nhập)
  Future<void> addToCart(int productId, int quantity) async {
    await _api.post(
      '/cart/items',
      {'productId': productId, 'quantity': quantity},
      needsAuth: true, // 👈 QUAN TRỌNG
    );
  }

  // 🟢 Xóa 1 sản phẩm trong giỏ (id của CartDetail)
  Future<void> removeFromCart(int itemId) async {
    await _api.delete('/cart/items/$itemId', needsAuth: true); // 👈 QUAN TRỌNG
  }

  // 🟢 Cập nhật số lượng mục giỏ (CartDetail)
  Future<void> updateItemQuantity(int itemId, int quantity) async {
    await _api.patch(
      '/cart/items/$itemId',
      {
        'quantity': quantity,
      },
      needsAuth: true,
    );
  }

  // 🟡 Clear giỏ hàng (tạm bỏ)
  Future<void> clearCart() async {
    // Nếu backend có API riêng thì thêm sau
  }

  // 🟡 Thanh toán (tạm bỏ)
  Future<Map<String, dynamic>> checkout(Map<String, dynamic> body) async {
    final res =
        await _api.post('/cart/checkout', body, needsAuth: true)
            as Map<String, dynamic>;
    final data = res['data'];
    return data is Map<String, dynamic> ? data : {};
  }
}
