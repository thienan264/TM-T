import 'package:flutter/material.dart';
import '../services/order_service.dart';
import '../utils/url_utils.dart';
import 'order_detail_screen.dart';
import '../widgets/gradient_app_bar.dart';
import 'package:cached_network_image/cached_network_image.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final OrderService _orderService = OrderService();
  bool _loading = true;
  List<dynamic> _orders = [];
  String money(num n) {
    final s = n.round().toString();
    final b = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      b.write(s[i]);
      final left = s.length - i - 1;
      if (left > 0 && left % 3 == 0) b.write('.');
    }
    return '${b.toString()} VND';
  }

  Color statusColor(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'COMPLETE':
        return Colors.green;
      case 'CANCELLED':
      case 'CANCEL':
        return Colors.red;
      case 'PENDING':
      default:
        return Colors.orange;
    }
  }

  String statusText(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'COMPLETE':
        return 'Hoàn tất';
      case 'CANCELLED':
      case 'CANCEL':
        return 'Đã hủy';
      case 'PENDING':
      default:
        return 'Đang xử lý';
    }
  }

  String formatDate(String? iso) {
    final dt = DateTime.tryParse(iso ?? '');
    if (dt == null) return iso ?? '';
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(dt.day)}/${two(dt.month)}/${dt.year} ${two(dt.hour)}:${two(dt.minute)}';
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await _orderService.getMyOrders();
      setState(() {
        _orders = list;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Đơn hàng của tôi'),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _orders.isEmpty
              ? const Center(child: Text('Chưa có đơn hàng'))
              : RefreshIndicator(
                onRefresh: _load,
                child: ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: _orders.length,
                  itemBuilder: (context, i) {
                    final o = _orders[i];
                    final items = (o['orderDetails'] as List<dynamic>? ?? []);
                    final firstImg =
                        items.isNotEmpty
                            ? buildImageUrl(items[0]['product']?['image'])
                            : '';
                    final status = (o['status'] ?? '').toString();
                    final created = (o['createdAt'] ?? '').toString();
                    final totalPriceStr = (o['totalPrice'] ?? '0').toString();
                    final totalPrice = double.tryParse(totalPriceStr) ?? 0;
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 3,
                      shadowColor: Colors.grey.shade200,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap:
                            () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder:
                                    (_) => OrderDetailScreen(
                                      orderId: o['id'] as int,
                                    ),
                              ),
                            ),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: SizedBox(
                                  width: 56,
                                  height: 56,
                                  child:
                                      firstImg.isNotEmpty
                                          ? CachedNetworkImage(
                                            imageUrl: firstImg,
                                            fit: BoxFit.cover,
                                            placeholder:
                                                (_, __) => Container(
                                                  color: Colors.grey.shade200,
                                                ),
                                            errorWidget:
                                                (_, __, ___) => const Icon(
                                                  Icons.receipt_long,
                                                ),
                                          )
                                          : const Icon(Icons.receipt_long),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          '#${o['id']}',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Chip(
                                          label: Text(statusText(status)),
                                          labelStyle: const TextStyle(
                                            color: Colors.white,
                                          ),
                                          backgroundColor: statusColor(status),
                                          visualDensity: VisualDensity.compact,
                                        ),
                                        const Spacer(),
                                        Text(
                                          money(totalPrice),
                                          style: TextStyle(
                                            color: Colors.blue.shade700,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Ngày: ${formatDate(created)}',
                                      style: const TextStyle(
                                        color: Colors.black54,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
    );
  }
}
