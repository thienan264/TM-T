import 'dart:async';
import 'package:flutter/material.dart';
import '../services/order_service.dart';

class PaymentStatusScreen extends StatefulWidget {
  final int orderId;
  const PaymentStatusScreen({super.key, required this.orderId});

  @override
  State<PaymentStatusScreen> createState() => _PaymentStatusScreenState();
}

class _PaymentStatusScreenState extends State<PaymentStatusScreen> {
  final OrderService _orderService = OrderService();
  Timer? _timer;
  String _status = 'PENDING';
  bool _done = false;

  @override
  void initState() {
    super.initState();
    _poll();
    _timer = Timer.periodic(const Duration(seconds: 2), (_) => _poll());
  }

  Future<void> _poll() async {
    if (_done) return;
    try {
      final order = await _orderService.getOrderById(widget.orderId);
      if (order != null) {
        setState(() => _status = (order['status'] ?? 'PENDING').toString());
        if (_status.toUpperCase() == 'COMPLETE') {
          _done = true;
          _timer?.cancel();
          if (mounted) {
            Navigator.of(context).pushNamedAndRemoveUntil(
              '/payment-success',
              (route) => false,
              arguments: {
                'orderId': widget.orderId,
                'amount': order['totalPrice'] ?? 0,
                'paymentMethod': order['paymentMethod'] ?? 'vnpay',
              },
            );
          }
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Xử lý thanh toán')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.payment, size: 64, color: Colors.blue),
            const SizedBox(height: 12),
            Text('Mã đơn: ${widget.orderId}'),
            const SizedBox(height: 8),
            Text('Trạng thái: ${_status}'),
            const SizedBox(height: 20),
            const Text('Đang kiểm tra kết quả thanh toán...'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false),
              child: const Text('Về Trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}
