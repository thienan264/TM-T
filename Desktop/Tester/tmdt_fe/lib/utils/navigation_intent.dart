class NavigationIntent {
  static String? nextRoute;
  static Object? nextArgs;
  static void set(String route, {Object? args}) {
    nextRoute = route;
    nextArgs = args;
  }
  static void clear() {
    nextRoute = null;
    nextArgs = null;
  }
}
