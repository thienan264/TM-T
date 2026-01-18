import 'package:flutter/material.dart';

class GradientHeading extends StatelessWidget {
  final String text;
  final double fontSize;
  const GradientHeading({super.key, required this.text, this.fontSize = 28});

  @override
  Widget build(BuildContext context) {
    final gradient = const LinearGradient(
      colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ).createShader(Rect.fromLTWH(0, 0, text.length * fontSize, fontSize));

    return Stack(
      alignment: Alignment.center,
      children: [
        Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w900,
            foreground: Paint()
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2.0
              ..color = const Color(0xFF01579B),
            shadows: const [
              Shadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2)),
            ],
          ),
        ),
        Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w900,
            foreground: Paint()..shader = gradient,
            shadows: const [
              Shadow(color: Colors.white24, blurRadius: 3, offset: Offset(0, 0)),
            ],
          ),
        ),
      ],
    );
  }
}
