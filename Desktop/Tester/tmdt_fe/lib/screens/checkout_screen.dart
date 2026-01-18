import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/cart_provider.dart';
import '../utils/navigation_intent.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import '../services/payment_service.dart';
import 'payment_status_screen.dart';
import '../services/coupon_service.dart';
import '../services/address_service.dart';
import '../widgets/gradient_app_bar.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  final _couponController = TextEditingController();

  final _auth = AuthService();
  final _cartService = CartService();
  final _paymentService = PaymentService();
  final _couponService = CouponService();
  final _addressService = AddressService();
  bool _loading = false;
  String _paymentMethod = 'cod'; // 'cod' hoặc 'vnpay'
  Map<String, dynamic>? _couponInfo;
  String _deliveryMethod = 'standard';
  num _shippingFee = 15000;
  num _discountAmount(num subtotal) {
    final raw = _couponInfo?['discountAmount'];
    num discount = 0;
    if (raw is num) {
      discount = raw;
    } else if (raw != null) {
      discount = double.tryParse(raw.toString()) ?? 0;
    }
    if (discount > subtotal) discount = subtotal;
    if (discount < 0) discount = 0;
    return discount;
  }
  num _finalTotal(num subtotal) {
    final discount = _discountAmount(subtotal);
    final totalBeforeShipping = math.max(0, subtotal - discount);
    return totalBeforeShipping + _shippingFee;
  }
  String money(num n) {
    final s = n.round().toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      buf.write(s[i]);
      final left = s.length - i - 1;
      if (left > 0 && left % 3 == 0) buf.write('.');
    }
    return '${buf.toString()} VND';
  }

  Future<void> _doCheckout() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final loggedIn = await _auth.isLoggedIn();
      final cart = Provider.of<CartProvider>(context, listen: false);
      if (!loggedIn) {
        NavigationIntent.set('/checkout');
        if (mounted) Navigator.of(context).pushNamed('/login');
        setState(() => _loading = false);
        return;
      }

      for (final item in cart.cartItems) {
        final pid = item['product']?['id'] ?? item['id'];
        final qty = item['quantity'] ?? 1;
        if (pid != null) {
          await _cartService.addToCart(pid, qty);
        }
      }

      final order = await _cartService.checkout({
        'shippingAddress': _addressController.text.trim(),
        'recipientPhone': _phoneController.text.trim(),
        'recipientName': _nameController.text.trim(),
        'couponCode':
            _couponController.text.trim().isEmpty
                ? null
                : _couponController.text.trim(),
        'paymentMethod': _paymentMethod,
        'deliveryMethod': _deliveryMethod,
        'shippingFee': _shippingFee,
      });
      final orderId = order['id'] ?? order['data']?['id'];
      final amount = order['totalPrice'] ?? order['data']?['totalPrice'] ?? cart.totalPrice;
      if (orderId == null) {
        throw Exception('Không tạo được đơn hàng');
      }
      if (_paymentMethod == 'vnpay') {
        final url = await _paymentService.createVnPayUrl(orderId);
        if (url == null) {
          throw Exception('Không tạo được URL thanh toán');
        }
        final uri = Uri.parse(url);
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã mở VNPAY, vui lòng hoàn tất thanh toán để xác nhận đơn.'),
            ),
          );
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => PaymentStatusScreen(orderId: orderId),
            ),
          );
        }
      } else {
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil(
            '/payment-success',
            (route) => false,
            arguments: {
              'orderId': orderId,
              'amount': amount,
              'paymentMethod': _paymentMethod,
            },
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    if (_addressController.text.isEmpty) {
      _addressService.getAddresses().then((list) {
        if (list.isNotEmpty && mounted) {
          _addressController.text = list.last['address'] ?? '';
          _nameController.text = list.last['name'] ?? '';
          _phoneController.text = list.last['phone'] ?? '';
        }
      });
    }
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Thanh toán'),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Người nhận',
                          border: OutlineInputBorder(),
                        ),
                        validator:
                            (v) =>
                                v == null || v.isEmpty
                                    ? 'Nhập tên người nhận'
                                    : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Số điện thoại',
                          border: OutlineInputBorder(),
                        ),
                        validator:
                            (v) =>
                                v == null || v.isEmpty
                                    ? 'Nhập số điện thoại'
                                    : null,
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Địa chỉ giao hàng',
                          border: OutlineInputBorder(),
                        ),
                        validator:
                            (v) =>
                                v == null || v.isEmpty ? 'Nhập địa chỉ' : null,
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
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: _couponController,
                        decoration: const InputDecoration(
                          labelText: 'Mã giảm giá (tuỳ chọn)',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          FilledButton(
                            onPressed: () async {
                              try {
                                final total =
                                    Provider.of<CartProvider>(
                                      context,
                                      listen: false,
                                    ).totalPrice;
                                final code = _couponController.text.trim();
                                if (code.isEmpty) return;
                                final info = await _couponService.validate(
                                  code,
                                  total,
                                );
                                setState(() => _couponInfo = info);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Mã hợp lệ, giảm ${info['discountAmount'] ?? 0} VND',
                                    ),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              } catch (e) {
                                setState(() => _couponInfo = null);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Mã không hợp lệ: ${e.toString().replaceFirst('Exception: ', '')}',
                                    ),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                            child: const Text('Kiểm tra mã'),
                          ),
                          const SizedBox(width: 12),
                          if (_couponInfo != null)
                            Text(
                              'Tổng mới: ${money(_finalTotal(cart.totalPrice))}',
                            ),
                        ],
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
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.payments),
                      title: const Text('Thanh toán khi nhận hàng (COD)'),
                      trailing: Radio<String>(
                        value: 'cod',
                        groupValue: _paymentMethod,
                        onChanged:
                            (v) => setState(() => _paymentMethod = v ?? 'cod'),
                      ),
                      onTap: () => setState(() => _paymentMethod = 'cod'),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.qr_code),
                      title: const Text('Thanh toán qua VNPAY'),
                      trailing: Radio<String>(
                        value: 'vnpay',
                        groupValue: _paymentMethod,
                        onChanged:
                            (v) =>
                                setState(() => _paymentMethod = v ?? 'vnpay'),
                      ),
                      onTap: () => setState(() => _paymentMethod = 'vnpay'),
                    ),
                  ],
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
                  child: Column(
                    children: [
                      Wrap(
                        spacing: 12,
                        runSpacing: 8,
                        alignment: WrapAlignment.spaceBetween,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('Phương thức vận chuyển:'),
                              const SizedBox(width: 12),
                              DropdownButton<String>(
                                value: _deliveryMethod,
                                items: const [
                                  DropdownMenuItem(
                                    value: 'standard',
                                    child: Text('Tiêu chuẩn'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'fast',
                                    child: Text('Nhanh'),
                                  ),
                                ],
                                onChanged: (v) {
                                  setState(() {
                                    _deliveryMethod = v ?? 'standard';
                                    _shippingFee =
                                        _deliveryMethod == 'fast'
                                            ? 30000
                                            : 15000;
                                  });
                                },
                              ),
                            ],
                          ),
                          Text(
                            'Phí: ${money(_shippingFee)}',
                            overflow: TextOverflow.fade,
                            softWrap: false,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Tạm tính: ${money(cart.totalPrice)}'),
                          Text(
                            'Tổng: ${money(_finalTotal(cart.totalPrice))}',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              _loading
                  ? const CircularProgressIndicator()
                  : SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _doCheckout,
                      child: const Text('Đặt hàng'),
                    ),
                  ),
            ],
          ),
        ),
      ),
    );
  }
}
