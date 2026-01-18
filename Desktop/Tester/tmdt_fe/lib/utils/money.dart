String moneyVnd(dynamic value) {
  num n;
  if (value is num) {
    n = value;
  } else {
    n = num.tryParse(value?.toString() ?? '') ?? 0;
  }
  final s = n.round().toString();
  final buf = StringBuffer();
  for (int i = 0; i < s.length; i++) {
    buf.write(s[i]);
    final left = s.length - i - 1;
    if (left > 0 && left % 3 == 0) buf.write('.');
  }
  return '${buf.toString()} VND';
}

