# Android Release APK Build Guide for My Daily Khata

This guide provides the exact steps to compile the installable release APK (`My_Daily_Khata.apk`) using the Flutter SDK.

## Prerequisites
- **Flutter SDK**: 3.16.0 or higher ([flutter.dev](https://flutter.dev))
- **Android Studio** / **Android SDK**: Build Tools 34.0.0, Platform API 34
- **Java Development Kit (JDK)**: OpenJDK 17

## Build Commands

From the `flutter_project/` directory:

```bash
# 1. Fetch Flutter & Dart packages
flutter pub get

# 2. Run static code analysis
flutter analyze

# 3. Run automated tests (Section 13)
flutter test

# 4. Compile the Release APK
flutter build apk --release
```

## Generated APK Location
Upon completion, the installable Android APK is located at:
```
build/app/outputs/flutter-apk/app-release.apk
```

Rename to `My_Daily_Khata.apk` for distribution:
```bash
cp build/app/outputs/flutter-apk/app-release.apk My_Daily_Khata.apk
```

## Release Signing Configuration
To sign with your production upload key rather than the default debug keystore:
1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore my-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. Create `android/key.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=upload
   storeFile=/path/to/my-upload-key.jks
   ```
3. Re-run `flutter build apk --release`.

## In-Browser Mobile Installation (Instant PWA)
You can also open the live web app in Chrome on your Android device and tap **"Install App"** (or Chrome menu `⋮` -> **"Add to Home screen" / "Install"**) to immediately run **My Daily Khata** as a standalone Android app with offline storage, icon, and full-screen experience.
