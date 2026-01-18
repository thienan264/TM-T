import 'package:flutter/material.dart';
import '../services/product_service.dart';
import '../utils/url_utils.dart';
import 'product_detail_screen.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../widgets/gradient_app_bar.dart';
import '../utils/money.dart';

class CategoryProductsScreen extends StatefulWidget {
  final String? category;
  final String? deviceType;
  const CategoryProductsScreen({super.key, this.category, this.deviceType});

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final ProductService _productService = ProductService();
  bool _loading = true;
  List<dynamic> _products = [];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final res = await _productService.getProducts(
        category: widget.category,
        deviceType: widget.deviceType,
      );
      setState(() {
        _products = res;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải sản phẩm: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar(
        widget.deviceType ?? widget.category ?? 'Danh mục',
      ),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _products.isEmpty
              ? const Center(child: Text('Không có sản phẩm'))
              : GridView.builder(
                padding: const EdgeInsets.all(12),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.72,
                ),
                itemCount: _products.length,
                itemBuilder: (context, i) {
                  final p = _products[i];
                  final img = buildImageUrl(p['image']);
                  return InkWell(
                    onTap:
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ProductDetailScreen(product: p),
                          ),
                        ),
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 3,
                      shadowColor: Colors.grey.shade200,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(12),
                              ),
                              child:
                                  img.isNotEmpty
                                      ? CachedNetworkImage(
                                        imageUrl: img,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        placeholder:
                                            (_, __) => Container(
                                              color: Colors.grey.shade200,
                                            ),
                                        errorWidget:
                                            (_, __, ___) => const Icon(
                                              Icons.image_not_supported,
                                              color: Colors.grey,
                                              size: 48,
                                            ),
                                      )
                                      : Container(
                                        color: Colors.grey.shade100,
                                        child: const Center(
                                          child: Icon(
                                            Icons.image_outlined,
                                            size: 48,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p['name'] ?? 'Không tên',
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  moneyVnd(p['price']),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue.shade700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
    );
  }
}
