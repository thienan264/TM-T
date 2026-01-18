import 'package:flutter/material.dart';
import '../services/order_service.dart';
import '../services/api_service.dart';
import '../widgets/gradient_app_bar.dart';
import '../utils/url_utils.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../widgets/reviews_section.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final OrderService _orderService = OrderService();
  Map<String, dynamic>? _order;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final o = await _orderService.getOrderById(widget.orderId);
    setState(() {
      _order = o;
      _loading = false;
    });
  }

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

  String statusText(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'COMPLETE':
        return 'Thành công';
      case 'CANCELLED':
      case 'CANCEL':
        return 'Đã hủy';
      case 'PENDING':
      default:
        return 'Đang xử lý';
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Đơn #${widget.orderId}'),
      body:
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _order == null
              ? const Center(child: Text('Không tìm thấy đơn'))
              : Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Đơn #${widget.orderId}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Chip(
                          label: Text(
                            statusText(_order?['status']?.toString()),
                          ),
                          labelStyle: const TextStyle(color: Colors.white),
                          backgroundColor: statusColor(
                            _order?['status']?.toString(),
                          ),
                          visualDensity: VisualDensity.compact,
                        ),
                        const Spacer(),
                        Text(
                          money(
                            double.tryParse(
                                  (_order?['totalPrice'] ?? '0').toString(),
                                ) ??
                                0,
                          ),
                          style: TextStyle(
                            color: Colors.blue.shade700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Sản phẩm',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView.separated(
                        itemCount:
                            (_order?['orderDetails'] as List<dynamic>? ?? [])
                                .length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, i) {
                          final d =
                              (_order?['orderDetails'] as List<dynamic>)[i];
                          final prod =
                              d['product'] as Map<String, dynamic>? ?? {};
                          final img = buildImageUrl(prod['image']);
                          final qty = (d['quantity'] ?? 1).toString();
                          final price =
                              double.tryParse((d['price'] ?? '0').toString()) ??
                              0;
                          final st =
                              (_order?['status'] ?? '')
                                  .toString()
                                  .toUpperCase();
                          final canRate =
                              st == 'COMPLETED' ||
                              st == 'COMPLETE' ||
                              st == 'PAID';
                          return Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: SizedBox(
                                      width: 64,
                                      height: 64,
                                      child:
                                          img.isNotEmpty
                                              ? CachedNetworkImage(
                                                imageUrl: img,
                                                fit: BoxFit.cover,
                                                placeholder:
                                                    (_, __) => Container(
                                                      color:
                                                          Colors.grey.shade200,
                                                    ),
                                                errorWidget:
                                                    (_, __, ___) => const Icon(
                                                      Icons.image_not_supported,
                                                    ),
                                              )
                                              : const Icon(
                                                Icons.image_outlined,
                                              ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          prod['name'] ?? 'Không tên',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Text('x$qty'),
                                            const Spacer(),
                                            Text(
                                              money(price),
                                              style: TextStyle(
                                                color: Colors.blue.shade700,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (canRate) ...[
                                          const SizedBox(height: 8),
                                          Align(
                                            alignment: Alignment.centerRight,
                                            child: OutlinedButton.icon(
                                              onPressed: () {
                                                showModalBottomSheet(
                                                  context: context,
                                                  isScrollControlled: true,
                                                  shape: const RoundedRectangleBorder(
                                                    borderRadius:
                                                        BorderRadius.vertical(
                                                          top: Radius.circular(
                                                            16,
                                                          ),
                                                        ),
                                                  ),
                                                  builder:
                                                      (ctx) => Padding(
                                                        padding: EdgeInsets.only(
                                                          bottom:
                                                              MediaQuery.of(ctx)
                                                                  .viewInsets
                                                                  .bottom,
                                                        ),
                                                        child: SingleChildScrollView(
                                                          child: Padding(
                                                            padding:
                                                                const EdgeInsets.all(
                                                                  16,
                                                                ),
                                                            child:
                                                                ReviewsSection(
                                                                  productId:
                                                                      prod['id']
                                                                          as int,
                                                                  product: prod,
                                                                ),
                                                          ),
                                                        ),
                                                      ),
                                                );
                                              },
                                              icon: const Icon(
                                                Icons.rate_review,
                                              ),
                                              label: const Text('Đánh giá'),
                                            ),
                                          ),
                                        ],
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
                    const SizedBox(height: 8),
                    Builder(
                      builder: (context) {
                        final st =
                            (_order?['status'] ?? '').toString().toUpperCase();
                        final canCancel = st == 'PENDING';
                        if (!canCancel) {
                          return const Text(
                            'Đơn đã thành công hoặc đã hủy, không thể hủy.',
                            style: TextStyle(color: Colors.black54),
                          );
                        }
                        return SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: () async {
                              try {
                                await ApiService().post(
                                  '/user-orders/${widget.orderId}/cancel',
                                  {},
                                  needsAuth: true,
                                );
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Đã hủy đơn')),
                                );
                                if (mounted) Navigator.of(context).pop();
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Không hủy được: $e')),
                                );
                              }
                            },
                            child: const Text('Hủy đơn'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
    );
  }
}
