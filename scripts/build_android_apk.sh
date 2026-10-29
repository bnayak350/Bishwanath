#!/usr/bin/env bash
set -e

echo "=== Building Android APK for My Daily Khata (White Screen Fix) ==="

WORK_DIR="/tmp/apk_work"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
mkdir -p "$WORK_DIR/src/com/mydailykhata/app"
mkdir -p "$WORK_DIR/res/values"
mkdir -p "$WORK_DIR/res/drawable"
mkdir -p "$WORK_DIR/res/mipmap-hdpi"
mkdir -p "$WORK_DIR/res/mipmap-mdpi"
mkdir -p "$WORK_DIR/res/mipmap-xhdpi"
mkdir -p "$WORK_DIR/res/mipmap-xxhdpi"
mkdir -p "$WORK_DIR/assets/www"
mkdir -p "$WORK_DIR/bin"
mkdir -p "$WORK_DIR/gen"

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

# 1. Rebuild web assets with relative base: './'
echo "Building web bundle with npm run build..."
npm run build

echo "Copying offline web assets into APK assets/www/..."
cp -r dist/* "$WORK_DIR/assets/www/"

# Verify index.html exists
if [ ! -f "$WORK_DIR/assets/www/index.html" ]; then
    echo "ERROR: index.html not found in assets/www!"
    exit 1
fi

# 2. Create res/values/strings.xml
cat << 'EOF' > "$WORK_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My Khata</string>
</resources>
EOF

# 3. Create app launcher icon PNG from real logo
cp public/app-logo.png "$WORK_DIR/res/mipmap-hdpi/ic_launcher.png"
cp public/app-logo.png "$WORK_DIR/res/mipmap-mdpi/ic_launcher.png"
cp public/app-logo.png "$WORK_DIR/res/mipmap-xhdpi/ic_launcher.png"
cp public/app-logo.png "$WORK_DIR/res/mipmap-xxhdpi/ic_launcher.png"
cp public/app-logo.png "$WORK_DIR/res/drawable/ic_launcher.png"

# 4. Create AndroidManifest.xml
cat << 'EOF' > "$WORK_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mydailykhata.app"
    android:versionCode="2"
    android:versionName="1.1">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:hardwareAccelerated="true"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:allowBackup="false">

        <activity
            android:name="com.mydailykhata.app.MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize"
            android:theme="@android:style/Theme.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 5. Create MainActivity.java with robust asset interceptor & live fallback
cat << 'EOF' > "$WORK_DIR/src/com/mydailykhata/app/MainActivity.java"
package com.mydailykhata.app;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String TAG = "MyDailyKhata";
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String ONLINE_URL = "https://ais-pre-b2gqdxuvqvsj46qr2kcvrc-44825223263.asia-southeast1.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure system status bar
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#059669"));

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, cm.message() + " -- Line " + cm.lineNumber() + " of " + cm.sourceId());
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (url != null && ASSET_HOST.equalsIgnoreCase(url.getHost())) {
                    return handleLocalAsset(url.getPath());
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String urlString) {
                Uri url = Uri.parse(urlString);
                if (url != null && ASSET_HOST.equalsIgnoreCase(url.getHost())) {
                    return handleLocalAsset(url.getPath());
                }
                return super.shouldInterceptRequest(view, urlString);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView Error (" + errorCode + "): " + description + " at " + failingUrl);
                // Fallback to online app if local assets fail
                if (failingUrl != null && failingUrl.contains(ASSET_HOST)) {
                    view.loadUrl(ONLINE_URL);
                }
            }
        });

        // Load through HTTPS secure origin so ES modules, Web Crypto, and localStorage work cleanly
        webView.loadUrl("https://" + ASSET_HOST + "/index.html");
    }

    private WebResourceResponse handleLocalAsset(String path) {
        if (path == null || path.isEmpty() || path.equals("/")) {
            path = "/index.html";
        }
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        try {
            InputStream is = getAssets().open("www/" + path);
            String mimeType = getMimeType(path);
            return new WebResourceResponse(mimeType, "UTF-8", is);
        } catch (Exception e) {
            Log.w(TAG, "Asset not found: www/" + path + ", trying fallback to index.html for SPA router");
            try {
                InputStream is = getAssets().open("www/index.html");
                return new WebResourceResponse("text/html", "UTF-8", is);
            } catch (Exception ex) {
                Log.e(TAG, "Fatal asset load failure: " + path, ex);
                return null;
            }
        }
    }

    private String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".ttf")) return "font/ttf";
        return "application/octet-stream";
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
EOF

# 6. Run aapt to package resources and generate R.java
echo "Running aapt to generate R.java..."
aapt package -m -J "$WORK_DIR/gen" \
    -M "$WORK_DIR/AndroidManifest.xml" \
    -S "$WORK_DIR/res" \
    -I "$ANDROID_JAR"

# 7. Compile Java source files
echo "Compiling Java sources with javac..."
javac -source 8 -target 8 \
    -cp "$ANDROID_JAR:$WORK_DIR/gen" \
    -d "$WORK_DIR/bin" \
    "$WORK_DIR/gen/com/mydailykhata/app/R.java" \
    "$WORK_DIR/src/com/mydailykhata/app/MainActivity.java"

# 8. Convert class files to Dalvik bytecode (classes.dex)
echo "Converting bytecode with dalvik-exchange (dx)..."
dalvik-exchange --dex --output="$WORK_DIR/bin/classes.dex" "$WORK_DIR/bin"

# 9. Package unaligned APK with aapt
echo "Packaging APK with aapt..."
aapt package -f \
    -M "$WORK_DIR/AndroidManifest.xml" \
    -S "$WORK_DIR/res" \
    -A "$WORK_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$WORK_DIR/unaligned.apk"

# Add classes.dex into the APK
cd "$WORK_DIR/bin"
aapt add "$WORK_DIR/unaligned.apk" classes.dex
cd -

# 10. Align APK with zipalign
echo "Aligning APK with zipalign..."
zipalign -f -p 4 "$WORK_DIR/unaligned.apk" "$WORK_DIR/aligned.apk"

# 11. Sign APK with apksigner
echo "Signing APK with apksigner..."
KEYSTORE="/tmp/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkey -v -keystore "$KEYSTORE" \
        -alias androiddebugkey -storepass android -keypass android \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US"
fi

apksigner sign --ks "$KEYSTORE" \
    --ks-key-alias androiddebugkey \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out "$WORK_DIR/My_Daily_Khata.apk" \
    "$WORK_DIR/aligned.apk"

# Verify signature
echo "Verifying APK signature..."
apksigner verify --verbose "$WORK_DIR/My_Daily_Khata.apk"

# Copy to outputs
mkdir -p public/
mkdir -p build/app/outputs/flutter-apk/
cp "$WORK_DIR/My_Daily_Khata.apk" public/My_Khata.apk
cp "$WORK_DIR/My_Daily_Khata.apk" public/My_Daily_Khata.apk
cp "$WORK_DIR/My_Daily_Khata.apk" build/app/outputs/flutter-apk/app-release.apk
cp "$WORK_DIR/My_Daily_Khata.apk" build/app/outputs/flutter-apk/My_Khata.apk

echo "=== SUCCESS! New APK built at public/My_Khata.apk and build/app/outputs/flutter-apk/app-release.apk ==="
ls -lh public/My_Khata.apk
