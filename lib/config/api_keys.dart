class ApiKeys {
  // Google Maps API Keys
  // TODO: Replace these with your actual API keys from Google Cloud Console
  
  // For Android
  static const String googleMapsAndroid = 'YOUR_ANDROID_GOOGLE_MAPS_API_KEY';
  
  // For iOS
  static const String googleMapsIos = 'YOUR_IOS_GOOGLE_MAPS_API_KEY';
  
  // For Web
  static const String googleMapsWeb = 'YOUR_WEB_GOOGLE_MAPS_API_KEY';
  
  // Helper method to get the appropriate key for the current platform
  static String get googleMapsApiKey {
    // In a real app, you might use Platform.isAndroid, Platform.isIOS, etc.
    // For now, we'll use a single key for all platforms
    return googleMapsAndroid;
  }
}

// IMPORTANT SECURITY NOTES:
// 1. Never commit real API keys to version control
// 2. Use environment variables or secure key management in production
// 3. Restrict API keys in Google Cloud Console to specific:
//    - Applications (bundle IDs/package names)
//    - APIs (only enable Maps SDK, Geocoding, Places if needed)
//    - IP addresses (for web deployment)

// Example of how to set up API key restrictions:
// 1. Go to Google Cloud Console → APIs & Services → Credentials
// 2. Click on your API key
// 3. Under "Application restrictions":
//    - For Android: Select "Android apps" and add your package name and SHA-1
//    - For iOS: Select "iOS apps" and add your bundle ID
//    - For Web: Select "HTTP referrers" and add your domain
// 4. Under "API restrictions":
//    - Select "Restrict key"
//    - Enable: Maps SDK for Android, Maps SDK for iOS, Maps JavaScript API
//    - Optionally enable: Geocoding API, Places API