import 'package:flutter/material.dart';

AppBar buildGradientAppBar(String title, {List<Widget>? actions}) {
  return AppBar(
    title: Text(title),
    backgroundColor: Colors.blue.shade500,
    flexibleSpace: Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
    ),
    actions: actions,
  );
}
