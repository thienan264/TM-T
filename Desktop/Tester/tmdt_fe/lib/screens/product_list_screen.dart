import 'package:flutter/material.dart';
import '../services/product_service.dart';
import '../utils/url_utils.dart';
import '../services/review_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../widgets/gradient_app_bar.dart';
import 'product_detail_screen.dart';
import '../widgets/skeleton.dart';
import '../utils/money.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final ProductService _productService = ProductService();
  final ReviewService _reviewService = ReviewService();
  bool _loading = true;
  List<dynamic> _products = [];
  int _page = 1;
  final int _limit = 12;
  bool _hasNext = false;
  String? _search;
  final TextEditingController _searchCtrl = TextEditingController();
  Map<int, Map<String, dynamic>> _ratingStats = {};

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts({bool reset = false}) async {
    try {
      if (reset) {
        _page = 1;
        _products = [];
      }
      final data = await _productService.getProducts(
        search: _search,
        page: _page,
        limit: _limit,
      );
      setState(() {
        _products = [..._products, ...data];
        _loading = false;
        _hasNext = data.length == _limit;
      });
      await _loadRatings(data);
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải sản phẩm: $e')));
    }
  }

  Future<void> _loadRatings(List<dynamic> batch) async {
    final ids = batch.map((p) => p['id']).whereType<int>().toList();
    final map = Map<int, Map<String, dynamic>>.from(_ratingStats);
    for (final id in ids) {
      try {
        final s = await _reviewService.getRatingStats(id);
        if (s != null) map[id] = s;
      } catch (_) {}
    }
    setState(() => _ratingStats = map);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Danh sách sản phẩm'),
      body:
          _loading
              ? ListView.builder(
                itemCount: 8,
                itemBuilder:
                    (_, i) => const Padding(
                      padding: EdgeInsets.all(8),
                      child: RectSkeleton(width: double.infinity, height: 90),
                    ),
              )
              : RefreshIndicator(
                onRefresh: () => _loadProducts(reset: true),
                child:
                    _products.isEmpty
                        ? const Center(child: Text('Không có sản phẩm nào'))
                        : ListView.builder(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: _products.length + (_hasNext ? 1 : 0),
                          itemBuilder: (context, i) {
                            if (_hasNext && i == _products.length) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                child: ElevatedButton(
                                  onPressed: () {
                                    setState(() => _loading = true);
                                    _page += 1;
                                    _loadProducts();
                                  },
                                  child: const Text('Tải thêm'),
                                ),
                              );
                            }
                            final p = _products[i];
                            final imageUrl = buildImageUrl(p['image']);

                            return InkWell(
                              onTap:
                                  () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (_) =>
                                              ProductDetailScreen(product: p),
                                    ),
                                  ),
                              child: Card(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                elevation: 2,
                                child: Row(
                                  children: [
                                    // 🖼 Ảnh lớn, đảm bảo load được
                                    Container(
                                      width: 100,
                                      height: 100,
                                      decoration: BoxDecoration(
                                        borderRadius: const BorderRadius.only(
                                          topLeft: Radius.circular(10),
                                          bottomLeft: Radius.circular(10),
                                        ),
                                        color: Colors.grey.shade100,
                                      ),
                                      child:
                                          imageUrl.isNotEmpty
                                              ? ClipRRect(
                                                borderRadius:
                                                    const BorderRadius.only(
                                                      topLeft: Radius.circular(
                                                        10,
                                                      ),
                                                      bottomLeft:
                                                          Radius.circular(10),
                                                    ),
                                                child: CachedNetworkImage(
                                                  imageUrl: imageUrl,
                                                  fit: BoxFit.cover,
                                                  placeholder:
                                                      (_, __) => Container(
                                                        color:
                                                            Colors
                                                                .grey
                                                                .shade200,
                                                      ),
                                                  errorWidget:
                                                      (_, __, ___) =>
                                                          const Icon(
                                                            Icons.broken_image,
                                                            color: Colors.grey,
                                                            size: 48,
                                                          ),
                                                ),
                                              )
                                              : const Icon(
                                                Icons.image_outlined,
                                                size: 48,
                                                color: Colors.grey,
                                              ),
                                    ),

                                    // 🔹 Nội dung
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 10,
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              p['name'] ?? 'Không có tên',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w600,
                                                fontSize: 16,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              moneyVnd(p['price']),
                                              style: const TextStyle(
                                                color: Colors.blueAccent,
                                                fontSize: 15,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              p['category'] ??
                                                  'Chưa có danh mục',
                                              style: TextStyle(
                                                color: Colors.grey.shade600,
                                                fontSize: 13,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.star,
                                                  color: Colors.amber,
                                                  size: 16,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${(_ratingStats[p['id']]?['averageRating'] ?? '-')}',
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  '(${(_ratingStats[p['id']]?['totalReviews'] ?? 0)})',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey.shade700,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
              ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                decoration: const InputDecoration(labelText: 'Tìm kiếm'),
                onSubmitted: (v) {
                  setState(() {
                    _search = v.trim();
                    _loading = true;
                  });
                  _loadProducts(reset: true);
                },
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _search = _searchCtrl.text.trim();
                  _loading = true;
                });
                _loadProducts(reset: true);
              },
              child: const Text('Lọc'),
            ),
          ],
        ),
      ),
    );
  }
}
