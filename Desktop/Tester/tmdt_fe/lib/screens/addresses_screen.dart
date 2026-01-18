import 'package:flutter/material.dart';
import '../services/address_service.dart';
import '../widgets/gradient_app_bar.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});
  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  final AddressService _svc = AddressService();
  bool _loading = true;
  List<Map<String, String>> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final rows = await _svc.getAddresses();
    setState(() { _items = rows; _loading = false; });
  }

  Future<void> _addOrEdit({int? index}) async {
    final nameCtrl = TextEditingController(text: index != null ? _items[index]['name'] ?? '' : '');
    final phoneCtrl = TextEditingController(text: index != null ? _items[index]['phone'] ?? '' : '');
    final addrCtrl = TextEditingController(text: index != null ? _items[index]['address'] ?? '' : '');
    final formKey = GlobalKey<FormState>();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(index == null ? 'Thêm địa chỉ' : 'Sửa địa chỉ', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 12),
                TextFormField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Họ tên', border: OutlineInputBorder()), validator: (v) => v==null||v.isEmpty?'Nhập họ tên':null),
                const SizedBox(height: 12),
                TextFormField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Số điện thoại', border: OutlineInputBorder()), keyboardType: TextInputType.phone, validator: (v) => v==null||v.isEmpty?'Nhập số điện thoại':null),
                const SizedBox(height: 12),
                TextFormField(controller: addrCtrl, decoration: const InputDecoration(labelText: 'Địa chỉ', border: OutlineInputBorder()), validator: (v) => v==null||v.isEmpty?'Nhập địa chỉ':null),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) return;
                      final data = {'name': nameCtrl.text.trim(), 'phone': phoneCtrl.text.trim(), 'address': addrCtrl.text.trim()};
                      if (index == null) {
                        await _svc.addAddress(data);
                      } else {
                        await _svc.updateAddress(index, data);
                      }
                      if (!mounted) return;
                      Navigator.of(context).pop();
                      await _load();
                    },
                    child: Text(index == null ? 'Lưu' : 'Cập nhật'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: buildGradientAppBar('Địa chỉ giao hàng'),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => _addOrEdit(), label: const Text('Thêm'), icon: const Icon(Icons.add)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.location_on_outlined, size: 64, color: Colors.grey), const SizedBox(height: 12), const Text('Chưa có địa chỉ')]))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, i) {
                    final a = _items[i];
                    final isDefault = (a['default'] ?? 'false') == 'true';
                    return Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Expanded(child: Text(a['name'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
                            if (isDefault) const Chip(label: Text('Mặc định')),
                          ]),
                          const SizedBox(height: 6),
                          Text(a['phone'] ?? '', style: const TextStyle(color: Colors.black54)),
                          const SizedBox(height: 4),
                          Text(a['address'] ?? ''),
                          const SizedBox(height: 12),
                          Row(children: [
                            FilledButton.tonal(onPressed: () => _addOrEdit(index: i), child: const Text('Sửa')),
                            const SizedBox(width: 8),
                            OutlinedButton(onPressed: () async { await _svc.removeAddress(i); await _load(); }, child: const Text('Xóa')),
                            const Spacer(),
                            if (!isDefault)
                              FilledButton(onPressed: () async { await _svc.setDefault(i); await _load(); }, child: const Text('Đặt mặc định'))
                          ])
                        ]),
                      ),
                    );
                  },
                ),
    );
  }
}
