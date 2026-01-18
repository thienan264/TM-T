import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AddressService {
  Future<List<Map<String, String>>> getAddresses() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('addresses');
    if (raw == null) return [];
    final list = List<Map<String, dynamic>>.from(jsonDecode(raw));
    return list.map((e) => e.map((k, v) => MapEntry(k, v?.toString() ?? ''))).toList();
  }

  Future<void> addAddress(Map<String, String> a) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await getAddresses();
    current.add(a);
    await prefs.setString('addresses', jsonEncode(current));
  }

  Future<void> updateAddress(int index, Map<String, String> a) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await getAddresses();
    if (index < 0 || index >= current.length) return;
    current[index] = {...current[index], ...a};
    await prefs.setString('addresses', jsonEncode(current));
  }

  Future<void> removeAddress(int index) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await getAddresses();
    if (index < 0 || index >= current.length) return;
    current.removeAt(index);
    await prefs.setString('addresses', jsonEncode(current));
  }

  Future<void> setDefault(int index) async {
    final prefs = await SharedPreferences.getInstance();
    final current = await getAddresses();
    for (int i = 0; i < current.length; i++) {
      current[i]['default'] = i == index ? 'true' : 'false';
    }
    await prefs.setString('addresses', jsonEncode(current));
  }
}
