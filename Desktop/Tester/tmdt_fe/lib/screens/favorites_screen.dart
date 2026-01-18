import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/wishlist_provider.dart';
import '../services/product_service.dart';
import '../utils/url_utils.dart';
import 'product_detail_screen.dart';
import '../widgets/gradient_app_bar.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/money.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final ProductService _productService = ProductService();
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final favIds = context.read<WishlistProvider>().ids;
    // Đơn giản: lấy tất cả rồi lọc theo id
    final all = await _productService.getAllProducts();
    setState(() {
      _products = all.where((p) => favIds.contains(p['id'])).toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Yêu thích'),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _products.isEmpty
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.favorite_border,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 12),
                    const Text('Chưa có sản phẩm yêu thích'),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () => Navigator.of(context).pushNamed('/home'),
                      child: const Text('Khám phá thêm'),
                    ),
                  ],
                ),
              )
              : Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                child: GridView.builder(
                  itemCount: _products.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  itemBuilder: (context, i) {
                    final p = _products[i];
                    final img = buildImageUrl(p['image']);
                    return InkWell(
                      borderRadius: BorderRadius.circular(12),
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
                              padding: const EdgeInsets.all(10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p['name'] ?? 'Không tên',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    moneyVnd(p['price']),
                                    style: TextStyle(
                                      color: Colors.blue.shade700,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Spacer(),
                                      Consumer<WishlistProvider>(
                                        builder: (_, fav, __) {
                                          final id = p['id'] as int;
                                          final liked = fav.isFav(id);
                                          return IconButton(
                                            onPressed: () {
                                              fav.toggle(id);
                                              setState(() {
                                                _products =
                                                    _products
                                                        .where(
                                                          (e) => fav.isFav(
                                                            e['id'] as int,
                                                          ),
                                                        )
                                                        .toList();
                                              });
                                            },
                                            icon: Icon(
                                              liked
                                                  ? Icons.favorite
                                                  : Icons.favorite_border,
                                              color:
                                                  liked
                                                      ? Colors.red
                                                      : Colors.grey,
                                            ),
                                          );
                                        },
                                      ),
                                    ],
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
              ),
    );
  }
}
