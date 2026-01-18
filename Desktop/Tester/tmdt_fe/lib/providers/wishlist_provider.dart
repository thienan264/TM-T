import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WishlistProvider with ChangeNotifier {
  List<int> _ids = [];
  List<int> get ids => _ids;

  WishlistProvider() {
    Future.microtask(_load);
  }

  bool isFav(int id) => _ids.contains(id);

  Future<void> toggle(int id) async {
    if (_ids.contains(id)) {
      _ids.remove(id);
    } else {
      _ids.add(id);
    }
    await _save();
    notifyListeners();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('wishlist_ids');
    if (raw != null) {
      try {
        final arr = List<int>.from(jsonDecode(raw));
        _ids = arr;
      } catch (_) {}
    }
    notifyListeners();
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('wishlist_ids', jsonEncode(_ids));
  }
}
