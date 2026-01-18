import '../config/env.dart';

String buildImageUrl(String? image) {
  if (image == null || image.isEmpty) return '';
  if (image.startsWith('http')) return image;
  final cleanPath = image.replaceFirst(RegExp(r'^/'), '');
  return '${Env.imageBaseUrl}$cleanPath';
}
