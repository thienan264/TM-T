import 'package:flutter/material.dart';
import '../services/product_service.dart';
import '../utils/url_utils.dart';
import '../widgets/gradient_heading.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'product_detail_screen.dart';
import '../services/review_service.dart';
import '../widgets/skeleton.dart';
import 'package:provider/provider.dart';
import '../providers/wishlist_provider.dart';
import '../services/banner_service.dart';
import '../utils/money.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final ProductService _productService = ProductService();
  final ReviewService _reviewService = ReviewService();
  final BannerService _bannerService = BannerService();
  bool loading = true;
  List<dynamic> products = [];
  int _selectedIndex = 0;
  String _viewMode = 'grid';
  final TextEditingController _searchCtrl = TextEditingController();
  Map<int, Map<String, dynamic>> _ratingStats = {};
  List<Map<String, dynamic>> _banners = [];
  int _bannerIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _loadBanners();
  }

  // 🟢 Lấy danh sách sản phẩm
  Future<void> _loadProducts() async {
    try {
      final data = await _productService.getAllProducts();
      setState(() {
        products = data;
        loading = false;
      });
      await _loadRatings();
    } catch (e) {
      setState(() => loading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải sản phẩm: $e')));
      }
    }
  }

  Future<void> _loadBanners() async {
    try {
      final rows = await _bannerService.getBanners(position: 'home');
      if (mounted) setState(() => _banners = rows);
    } catch (_) {}
  }

  Future<void> _loadRatings() async {
    final ids = products.map((p) => p['id']).whereType<int>().toList();
    final map = <int, Map<String, dynamic>>{};
    for (final id in ids) {
      try {
        final s = await _reviewService.getRatingStats(id);
        if (s != null) map[id] = s;
      } catch (_) {}
    }
    if (mounted) setState(() => _ratingStats = map);
  }

  void _logout(BuildContext context) {
    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  }

  // 🩺 Danh mục
  final List<Map<String, dynamic>> categories = [
    {'icon': '🩺', 'name': 'Dụng cụ vệ sinh mũi', 'color': Colors.blue},
    {'icon': '💊', 'name': 'Kim các loại', 'color': Colors.green},
    {'icon': '💆', 'name': 'Máy massage', 'color': Colors.purple},
    {'icon': '👶', 'name': 'Túi chườm', 'color': Colors.pink},
    {'icon': '💉', 'name': 'Ống tiêm', 'color': Colors.red},
    {'icon': '🧤', 'name': 'Găng tay', 'color': Colors.orange},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body:
          loading
              ? ListView.builder(
                itemCount: 6,
                itemBuilder:
                    (_, i) => Padding(
                      padding: const EdgeInsets.all(12),
                      child: const RectSkeleton(
                        width: double.infinity,
                        height: 120,
                      ),
                    ),
              )
              : CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  // 🎨 AppBar gradient
                  SliverAppBar(
                    expandedHeight: 160,
                    pinned: true,
                    backgroundColor: Colors.blue.shade500,
                    flexibleSpace: FlexibleSpaceBar(
                      background: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: SafeArea(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // 🔹 Header
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.9),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Text(
                                        'DY',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    const Expanded(
                                      child: Text(
                                        'Dụng Cụ Y Tế',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.shopping_cart_outlined,

                                        color: Colors.white,
                                      ),
                                      onPressed: () {
                                        Navigator.of(
                                          context,
                                        ).pushNamed('/cart');
                                      },
                                    ),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.logout,
                                        color: Colors.white,
                                      ),
                                      onPressed: () => _logout(context),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // 🔍 Search Bar
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(25),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 8,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                  ),
                                  height: 45,
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.search,
                                        color: Colors.grey.shade500,
                                        size: 22,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: TextField(
                                          controller: _searchCtrl,
                                          decoration: const InputDecoration(
                                            border: InputBorder.none,
                                            hintText:
                                                'Tìm kiếm dụng cụ y tế...',
                                          ),
                                          textInputAction:
                                              TextInputAction.search,
                                          onSubmitted: (q) async {
                                            setState(() => loading = true);
                                            try {
                                              final data = await _productService
                                                  .getProducts(search: q);
                                              setState(() {
                                                products = data;
                                                loading = false;
                                              });
                                              await _loadRatings();
                                            } catch (e) {
                                              setState(() => loading = false);
                                            }
                                          },
                                        ),
                                      ),
                                      IconButton(
                                        onPressed: () async {
                                          final q = _searchCtrl.text.trim();
                                          setState(() => loading = true);
                                          try {
                                            final data = await _productService
                                                .getProducts(search: q);
                                            setState(() {
                                              products = data;
                                              loading = false;
                                            });
                                            await _loadRatings();
                                          } catch (e) {
                                            setState(() => loading = false);
                                          }
                                        },
                                        icon: Icon(
                                          Icons.search,
                                          color: Colors.blue.shade600,
                                          size: 22,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // 🖼 Banner động từ BE
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Stack(
                          children: [
                            SizedBox(
                              height: 160,
                              width: double.infinity,
                              child:
                                  _banners.isEmpty
                                      ? Container(
                                        decoration: const BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              Color(0xFF4FC3F7),
                                              Color(0xFF0288D1),
                                            ],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          ),
                                        ),
                                      )
                                      : PageView.builder(
                                        itemCount: _banners.length,
                                        onPageChanged:
                                            (idx) => setState(
                                              () => _bannerIndex = idx,
                                            ),
                                        itemBuilder: (_, i) {
                                          final b = _banners[i];
                                          final img = buildImageUrl(b['image']);
                                          return img.isNotEmpty
                                              ? CachedNetworkImage(
                                                imageUrl: img,
                                                fit: BoxFit.cover,
                                                placeholder:
                                                    (_, __) => Container(
                                                      color:
                                                          Colors.grey.shade200,
                                                    ),
                                                errorWidget:
                                                    (_, __, ___) => Container(
                                                      color:
                                                          Colors.grey.shade300,
                                                    ),
                                              )
                                              : Container(
                                                color: Colors.grey.shade300,
                                              );
                                        },
                                      ),
                            ),
                            Container(
                              height: 160,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.black.withOpacity(0.25),
                                    Colors.black.withOpacity(0.05),
                                  ],
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 16,
                              bottom: 16,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(
                                    width:
                                        MediaQuery.of(context).size.width - 32,
                                    child: Center(
                                      child: GradientHeading(
                                        text:
                                            _banners.isEmpty
                                                ? 'ƯU ĐÃI RA MẮT'
                                                : ((_banners[_bannerIndex]['title'] ??
                                                        '')
                                                    as String),
                                        fontSize: 30,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Ưu đãi hấp dẫn và giao nhanh',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // 🛍️ Tiêu đề sản phẩm
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Sản phẩm nổi bật',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              _viewMode == 'grid'
                                  ? Icons.grid_view
                                  : Icons.view_list_rounded,
                              color: Colors.blue.shade600,
                            ),
                            onPressed: () {
                              setState(() {
                                _viewMode =
                                    _viewMode == 'grid' ? 'list' : 'grid';
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 🧾 Danh sách sản phẩm
                  if (loading)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(50),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverGrid(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: _viewMode == 'grid' ? 2 : 1,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: _viewMode == 'grid' ? 0.72 : 2.8,
                        ),
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final p = products[index];
                          final img = buildImageUrl(p['image']);
                          return InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap:
                                () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (_) => ProductDetailScreen(product: p),
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
                                                      color:
                                                          Colors.grey.shade200,
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
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
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
                                            const Spacer(),
                                            Consumer<WishlistProvider>(
                                              builder: (_, fav, __) {
                                                final id = p['id'] as int;
                                                final liked = fav.isFav(id);
                                                return IconButton(
                                                  onPressed:
                                                      () => fav.toggle(id),
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
                        }, childCount: products.length),
                      ),
                    ),

                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),

      // 🧭 Bottom Navigation
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.white,
        elevation: 8,
        height: 65,
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          switch (index) {
            case 0:
              Navigator.of(context).pushReplacementNamed('/home');
              break;
            case 1:
              Navigator.of(context).pushNamed('/categories');
              break;
            case 2:
              Navigator.of(context).pushNamed('/favorites');
              break;
            case 3:
              Navigator.of(context).pushNamed('/account');
              break;
          }
        },
        destinations: [
          NavigationDestination(
            icon: Icon(MdiIcons.homeOutline),
            selectedIcon: Icon(MdiIcons.home),
            label: 'Trang chủ',
          ),
          NavigationDestination(
            icon: Icon(MdiIcons.viewGridOutline),
            selectedIcon: Icon(MdiIcons.viewGrid),
            label: 'Danh mục',
          ),
          NavigationDestination(
            icon: Icon(MdiIcons.heartOutline),
            selectedIcon: Icon(MdiIcons.heart),
            label: 'Yêu thích',
          ),
          NavigationDestination(
            icon: Icon(MdiIcons.accountOutline),
            selectedIcon: Icon(MdiIcons.account),
            label: 'Tài khoản',
          ),
        ],
      ),
    );
  }
}
