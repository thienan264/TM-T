import 'package:flutter/material.dart';
import '../services/review_service.dart';
import '../services/auth_service.dart';
import '../utils/navigation_intent.dart';

class ReviewsSection extends StatefulWidget {
  final int productId;
  final Map<String, dynamic> product;
  const ReviewsSection({super.key, required this.productId, required this.product});

  @override
  State<ReviewsSection> createState() => _ReviewsSectionState();
}

class _ReviewsSectionState extends State<ReviewsSection> {
  final ReviewService _service = ReviewService();
  final AuthService _auth = AuthService();
  bool _loading = true;
  List<dynamic> _reviews = [];
  Map<String, dynamic>? _stats;
  final _contentCtrl = TextEditingController();
  int _rating = 5;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await _service.getProductReviews(widget.productId);
      final s = await _service.getRatingStats(widget.productId);
      setState(() {
        _reviews = r;
        _stats = s;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    try {
      final loggedIn = await _auth.isLoggedIn();
      if (!loggedIn) {
        NavigationIntent.set('/product_detail', args: widget.product);
        Navigator.of(context).pushNamed('/login');
        return;
      }
      await _service.createReview(widget.productId, _rating, _contentCtrl.text.trim());
      _contentCtrl.clear();
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã gửi đánh giá')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_stats != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text('Đánh giá trung bình: ${_stats?['averageRating'] ?? '-'}⭐ (${_stats?['totalReviews'] ?? 0} lượt)'),
          ),
        const SizedBox(height: 8),
        Text('Đánh giá sản phẩm', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(
          children: [
            DropdownButton<int>(
              value: _rating,
              items: List.generate(5, (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1}⭐'))),
              onChanged: (v) => setState(() => _rating = v ?? 5),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _contentCtrl,
                decoration: const InputDecoration(hintText: 'Viết nhận xét...'),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(onPressed: _submit, child: const Text('Gửi')),
          ],
        ),
        const SizedBox(height: 12),
        ..._reviews.map((e) => ListTile(
              leading: const Icon(Icons.person),
              title: Text('${e['rating'] ?? ''}⭐  ${e['user']?['fullName'] ?? ''}'),
              subtitle: Text('${e['comment'] ?? ''}'),
              trailing: PopupMenuButton<String>(
                onSelected: (cmd) async {
                  if (cmd == 'edit') {
                    _contentCtrl.text = e['comment'] ?? '';
                    _rating = (e['rating'] ?? 5) is int ? e['rating'] : 5;
                    final updated = await _service.updateReview(e['id'], _rating, _contentCtrl.text.trim());
                    await _load();
                  } else if (cmd == 'delete') {
                    await _service.deleteReview(e['id']);
                    await _load();
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Sửa')),
                  PopupMenuItem(value: 'delete', child: Text('Xóa')),
                ],
              ),
            )),
      ],
    );
  }
}
