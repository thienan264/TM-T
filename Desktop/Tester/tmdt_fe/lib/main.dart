import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // 👈 thêm dòng này
import 'providers/cart_provider.dart'; // 👈 thêm dòng này
import 'providers/wishlist_provider.dart';
import 'services/api_service.dart';

import 'screens/cart_screen.dart';
import 'screens/product_detail_screen.dart';
import 'screens/product_list_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/categories_screen.dart';
import 'screens/account_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/favorites_screen.dart';
import 'widgets/auth_guard.dart';
import 'screens/checkout_screen.dart';
import 'screens/addresses_screen.dart';
import 'screens/change_password_screen.dart';
import 'screens/payment_success_screen.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() {
  _configureApiUnauthorizedHandler();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => CartProvider(),
        ), // 👈 thêm provider giỏ hàng
        ChangeNotifierProvider(
          create: (_) => WishlistProvider(),
        ),
      ],
      child: const MyApp(), // 👈 bọc MyApp bên trong
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'TMĐT App',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      showPerformanceOverlay: false,
      initialRoute: '/home',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home': (_) => const HomeScreen(),
        '/categories': (_) => const CategoriesScreen(),
        '/account': (_) => const AccountScreen(),
        '/orders': (_) => AuthGuard(routeName: '/orders', child: const OrdersScreen()),
        '/checkout': (_) => const CheckoutScreen(),
        '/addresses': (_) => const AddressesScreen(),
        '/change-password': (_) => const ChangePasswordScreen(),
        '/products': (_) => const ProductListScreen(),
        '/cart': (_) => const CartScreen(),
        '/favorites': (_) => const FavoritesScreen(),
      },

      // ✅ Xử lý route động có arguments (chi tiết sản phẩm)
      onGenerateRoute: (settings) {
        if (settings.name == '/product_detail') {
          final product = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          );
        }
        if (settings.name == '/payment-success') {
          final args = (settings.arguments as Map?) ?? {};
          return MaterialPageRoute(
            builder: (_) => PaymentSuccessScreen(
              orderId: args['orderId'] ?? 0,
              amount: args['amount'] ?? 0,
              paymentMethod: args['paymentMethod']?.toString() ?? 'cod',
            ),
          );
        }
        return null;
      },
    );
  }
}

void _configureApiUnauthorizedHandler() {
  ApiService.onUnauthorized = () {
    navigatorKey.currentState?.pushNamedAndRemoveUntil(
      '/login',
      (route) => false,
    );
  };
}
