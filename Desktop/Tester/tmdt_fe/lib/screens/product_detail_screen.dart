import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../utils/url_utils.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../widgets/reviews_section.dart';
import '../widgets/gradient_app_bar.dart';
import '../utils/money.dart';

class ProductDetailScreen extends StatelessWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final imageUrl = buildImageUrl(product['image']);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar(product['name'] ?? 'Chi tiết sản phẩm'),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: SizedBox(
                        height: 220,
                        width: double.infinity,
                        child:
                            imageUrl.isNotEmpty
                                ? CachedNetworkImage(
                                  imageUrl: imageUrl,
                                  fit: BoxFit.cover,
                                  placeholder:
                                      (_, __) => Container(
                                        color: Colors.grey.shade200,
                                      ),
                                  errorWidget:
                                      (_, __, ___) => const Icon(
                                        Icons.image_not_supported,
                                        size: 100,
                                      ),
                                )
                                : const Icon(
                                  Icons.image,
                                  size: 100,
                                  color: Colors.grey,
                                ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              product['name'] ?? 'Không có tên',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            moneyVnd(product['price']),
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              color: Colors.blue.shade700,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: ReviewsSection(
                        productId: product['id'],
                        product: product,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () async {
                    try {
                      await Provider.of<CartProvider>(
                        context,
                        listen: false,
                      ).addToCart(product['id'], quantity: 1, product: product);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('🛒 Đã thêm vào giỏ hàng!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Lỗi khi thêm vào giỏ hàng: $e'),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    }
                  },
                  icon: const Icon(Icons.shopping_cart),
                  label: const Text('Thêm vào giỏ hàng'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
