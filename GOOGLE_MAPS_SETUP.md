# Google Maps Setup Instructions

## 🗝️ Getting Google Maps API Keys

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "RideShare App"

### 2. Enable Required APIs
Navigate to **APIs & Services → Library** and enable:
- Maps SDK for Android
- Maps SDK for iOS  
- Maps JavaScript API
- Geocoding API (for address lookups)
- Places API (optional, for place suggestions)

### 3. Create API Keys
Go to **APIs & Services → Credentials → Create Credentials → API Key**

You'll need **3 separate API keys** (recommended for security):
- **Android API Key**
- **iOS API Key** 
- **Web API Key**

### 4. Restrict API Keys (IMPORTANT!)

#### For Android Key:
- **Application restrictions**: Android apps
- Add package name: `com.example.sharing_app`
- Add SHA-1 fingerprint (get with: `cd android && ./gradlew signingReport`)

#### For iOS Key:
- **Application restrictions**: iOS apps
- Add bundle ID: `com.example.sharingApp`

#### For Web Key:
- **Application restrictions**: HTTP referrers
- Add your domain (e.g., `https://yourdomain.com/*`)

#### API Restrictions (for all keys):
- Maps SDK for Android/iOS/JavaScript API
- Geocoding API

## 🔧 Configuration Steps

### 1. Replace API Keys in Code

#### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ANDROID_GOOGLE_MAPS_API_KEY" />
```

#### iOS (`ios/Runner/Info.plist`):
```xml
<key>GOOGLE_MAPS_API_KEY</key>
<string>YOUR_IOS_GOOGLE_MAPS_API_KEY</string>
```

#### Web (`web/index.html`):
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_WEB_GOOGLE_MAPS_API_KEY"></script>
```

#### Flutter Code (`lib/config/api_keys.dart`):
```dart
static const String googleMapsAndroid = 'YOUR_ANDROID_GOOGLE_MAPS_API_KEY';
static const String googleMapsIos = 'YOUR_IOS_GOOGLE_MAPS_API_KEY';
static const String googleMapsWeb = 'YOUR_WEB_GOOGLE_MAPS_API_KEY';
```

### 2. Security Setup

#### Create `.env` file (recommended):
```bash
# Don't commit this to version control!
GOOGLE_MAPS_ANDROID_KEY=your_android_key_here
GOOGLE_MAPS_IOS_KEY=your_ios_key_here  
GOOGLE_MAPS_WEB_KEY=your_web_key_here
```

#### Add to `.gitignore`:
```
.env
lib/config/api_keys.dart
```

### 3. Get SHA-1 Fingerprint for Android

```bash
cd android
./gradlew signingReport
```

Look for SHA1 under "Variant: debug" - add this to your Android API key restrictions.

### 4. Test the Setup

```bash
flutter pub get
flutter run
```

## 📱 Features Implemented

### ✅ Create Route Screen
- Map picker for start/end locations
- Address autocomplete with geocoding
- Real coordinates saved to routes

### ✅ Route Visualization  
- Full-screen map showing route
- Start/end markers with info windows
- Polyline connecting points
- Book ride functionality

### ✅ Location Services
- Current location detection
- Address to coordinates conversion
- Interactive map selection

## 🚨 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables in production**
3. **Restrict keys to specific apps/domains**
4. **Enable only required APIs**
5. **Monitor API usage in Google Cloud Console**
6. **Use different keys for dev/staging/prod**

## 🌐 Production Deployment

### Android:
1. Generate release keystore
2. Get production SHA-1 fingerprint
3. Add to API key restrictions
4. Build release APK: `flutter build apk --release`

### iOS:
1. Configure bundle ID in Xcode
2. Add bundle ID to API key restrictions  
3. Build archive in Xcode

### Web:
1. Build for web: `flutter build web`
2. Deploy to your domain
3. Add domain to web API key restrictions

## 🔍 Troubleshooting

### Common Issues:

#### "This app isn't authorized to use Google Maps"
- Check API key is correct
- Verify package name/bundle ID matches restrictions
- Ensure SHA-1 fingerprint is added (Android)

#### "Map shows but location services don't work"
- Check location permissions in AndroidManifest.xml/Info.plist
- Enable Geocoding API in Google Cloud
- Test on real device (simulator location can be unreliable)

#### "Web maps don't load"
- Check browser console for errors
- Verify web API key in index.html
- Ensure Maps JavaScript API is enabled

## 💡 Next Steps

1. **Add route directions** using Google Directions API
2. **Implement place autocomplete** for better address input
3. **Add real-time tracking** during rides
4. **Optimize map performance** with clustering for many routes
5. **Add offline map support** for poor network areas

## 📝 API Usage Monitoring

Monitor your API usage at [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) to avoid unexpected charges.

**Free tier includes:**
- 28,500 map loads per month
- 40,000 geocoding requests per month
- 2,500 directions requests per month