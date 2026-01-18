import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/url_utils.dart';
import '../widgets/gradient_app_bar.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({Key? key}) : super(key: key);

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    await Provider.of<CartProvider>(context, listen: false).fetchCart();
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Giỏ hàng của tôi'),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : cart.cartItems.isEmpty
              ? const Center(child: Text('Giỏ hàng trống'))
              : Column(
                children: [
                  Expanded(
                    child: ListView.builder(
                      itemCount: cart.cartItems.length,
                      itemBuilder: (ctx, i) {
                        final item = cart.cartItems[i];

                        final imageUrl = buildImageUrl(
                          item['image'] ?? item['product']?['image'] ?? '',
                        );

                        final name =
                            item['name'] ??
                            item['product']?['name'] ??
                            'Sản phẩm';
                        final price =
                            double.tryParse(
                              item['price']?.toString() ??
                                  item['product']?['price']?.toString() ??
                                  '0',
                            ) ??
                            0;
                        final quantity = item['quantity'] ?? 1;

                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 2,
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(8),
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child:
                                  imageUrl.isNotEmpty
                                      ? CachedNetworkImage(
                                        imageUrl: imageUrl,
                                        width: 60,
                                        height: 60,
                                        fit: BoxFit.cover,
                                        placeholder:
                                            (_, __) => Container(
                                              color: Colors.grey.shade200,
                                              width: 60,
                                              height: 60,
                                            ),
                                        errorWidget:
                                            (_, __, ___) => const Icon(
                                              Icons.broken_image,
                                              size: 40,
                                              color: Colors.grey,
                                            ),
                                      )
                                      : const Icon(
                                        Icons.image,
                                        size: 40,
                                        color: Colors.grey,
                                      ),
                            ),
                            title: Text(name),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Giá: ${price.toStringAsFixed(0)} VND',
                                  style: const TextStyle(fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(
                                        Icons.remove_circle,
                                        color: Colors.redAccent,
                                      ),
                                      onPressed:
                                          quantity > 1
                                              ? () {
                                                Provider.of<CartProvider>(
                                                  context,
                                                  listen: false,
                                                ).updateQuantity(
                                                  item['id'] ??
                                                      item['product']?['id'] ??
                                                      0,
                                                  quantity - 1,
                                                );
                                              }
                                              : null,
                                    ),
                                    Text(
                                      '$quantity',
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.add_circle,
                                        color: Colors.green,
                                      ),
                                      onPressed: () {
                                        Provider.of<CartProvider>(
                                          context,
                                          listen: false,
                                        ).updateQuantity(
                                          item['id'] ??
                                              item['product']?['id'] ??
                                              0,
                                          quantity + 1,
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            trailing: IconButton(
                              icon: const Icon(
                                Icons.delete,
                                color: Colors.redAccent,
                              ),
                              onPressed:
                                  () => cart.removeFromCart(item['id'] ?? 0),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // 🔹 Tổng tiền & nút đặt hàng
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      border: const Border(
                        top: BorderSide(color: Colors.black12),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Tổng cộng:',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              '${cart.cartItems.fold<double>(0, (sum, item) {
                                final p = double.tryParse(item['price']?.toString() ?? item['product']?['price']?.toString() ?? '0') ?? 0;
                                final q = item['quantity'] ?? 1;
                                return sum + (p * q);
                              }).toStringAsFixed(0)} VND',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.blueAccent,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pushNamed('/checkout');
                          },
                          icon: const Icon(Icons.shopping_bag),
                          label: const Text('Đặt hàng'),
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
    );
  }
}
