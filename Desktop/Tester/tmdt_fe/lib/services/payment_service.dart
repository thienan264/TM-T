import './api_service.dart';

class PaymentService {
  final ApiService _api = ApiService();

  Future<String?> createVnPayUrl(int orderId) async {
    final res = await _api.post('/payments/vnpay/create', {'orderId': orderId}, needsAuth: true) as Map<String, dynamic>;
    final data = res['data'];
    if (data is Map<String, dynamic>) {
      final url = data['paymentUrl']?.toString();
      return (url != null && url.isNotEmpty) ? url : null;
    }
    return null;
  }
}
