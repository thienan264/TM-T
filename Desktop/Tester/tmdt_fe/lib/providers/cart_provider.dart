import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/cart_service.dart';
import '../services/auth_service.dart';

class CartProvider with ChangeNotifier {
  final CartService _cartService = CartService();
  final AuthService _authService = AuthService();
  List<dynamic> _cartItems = [];

  CartProvider() {
    Future.microtask(_loadGuestCart);
  }

  List<dynamic> get cartItems => _cartItems;

  // 🧮 Tổng tiền — ép kiểu an toàn
  double get totalPrice {
    double total = 0;
    for (var item in _cartItems) {
      final priceRaw = item['price'];
      final qtyRaw = item['quantity'];

      // Ép kiểu để tránh lỗi "String is not subtype of num"
      final price =
          (priceRaw is num)
              ? priceRaw.toDouble()
              : double.tryParse(priceRaw.toString()) ?? 0.0;

      final quantity =
          (qtyRaw is num)
              ? qtyRaw.toDouble()
              : double.tryParse(qtyRaw.toString()) ?? 1.0;

      total += price * quantity;
    }
    return total;
  }

  // 🟢 Lấy giỏ hàng từ backend
  Future<void> fetchCart() async {
    try {
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        _cartItems = await _cartService.getCart();
      } else {
        await _loadGuestCart();
      }
      print('🛒 Giỏ hàng hiện tại: $_cartItems');
      notifyListeners();
    } catch (e) {
      print('❌ Lỗi khi lấy giỏ hàng: $e');
    }
  }

  // 🟢 Thêm vào giỏ
  Future<void> addToCart(
    int productId, {
    int quantity = 1,
    Map<String, dynamic>? product,
  }) async {
    try {
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        await _cartService.addToCart(productId, quantity);
        await fetchCart();
      } else {
        final existingIdx = _cartItems.indexWhere(
          (e) => (e['id'] ?? e['product']?['id']) == productId,
        );
        if (existingIdx >= 0) {
          _cartItems[existingIdx]['quantity'] =
              (_cartItems[existingIdx]['quantity'] ?? 1) + quantity;
        } else {
          _cartItems.add({
            'id': productId,
            'product': product ?? {},
            'name': product?['name'],
            'price': product?['price'],
            'image': product?['image'],
            'quantity': quantity,
          });
        }
        await _saveGuestCart();
        notifyListeners();
      }
    } catch (e) {
      print('❌ Lỗi khi thêm giỏ hàng: $e');
    }
  }

  // 🟢 Xóa 1 sản phẩm khỏi giỏ
  Future<void> removeFromCart(int itemId) async {
    try {
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        await _cartService.removeFromCart(itemId);
        await fetchCart();
      } else {
        _cartItems.removeWhere(
          (e) => (e['id'] ?? 0) == itemId || e['product']?['id'] == itemId,
        );
        await _saveGuestCart();
        notifyListeners();
      }
    } catch (e) {
      print('❌ Lỗi khi xóa sản phẩm: $e');
    }
  }

  // 🟢 Cập nhật số lượng
  Future<void> updateQuantity(int itemId, int newQty) async {
    try {
      if (newQty <= 0) {
        await removeFromCart(itemId);
        return;
      }
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        await _cartService.updateItemQuantity(itemId, newQty);
        await fetchCart();
      } else {
        final idx = _cartItems.indexWhere((e) => (e['id'] ?? 0) == itemId || e['product']?['id'] == itemId);
        if (idx >= 0) {
          _cartItems[idx]['quantity'] = newQty;
          await _saveGuestCart();
          notifyListeners();
        }
      }
    } catch (e) {
      print('❌ Lỗi khi cập nhật số lượng: $e');
    }
  }

  // 🟡 Xóa toàn bộ giỏ hàng
  Future<void> clearCart() async {
    try {
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        await _cartService.clearCart();
        _cartItems = [];
        notifyListeners();
      } else {
        _cartItems = [];
        await _saveGuestCart();
        notifyListeners();
      }
    } catch (e) {
      print('❌ Lỗi khi clear giỏ hàng: $e');
    }
  }

  // 🟢 Thanh toán (khi có API)
  Future<void> checkout() async {
    try {
      // Việc checkout sẽ thực hiện ở màn hình Checkout, provider giữ vai trò state
    } catch (e) {
      print('❌ Lỗi khi checkout: $e');
    }
  }

  Future<void> _loadGuestCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString('guest_cart');
      if (raw != null && raw.isNotEmpty) {
        final parsed = jsonDecode(raw);
        if (parsed is List) {
          _cartItems = parsed;
        }
      }
    } catch (e) {
      print('❌ Lỗi load guest cart: $e');
    }
  }

  Future<void> _saveGuestCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('guest_cart', jsonEncode(_cartItems));
    } catch (e) {
      print('❌ Lỗi save guest cart: $e');
    }
  }
}
