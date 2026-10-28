# TAVI Mobile Application — Android & iOS Build Guide
**Platform:** React Native with Expo SDK 52 & TypeScript  
**Brand:** TAVI (*Move. Manage. Grow.*)  
**Package Name:** `com.tavi.app`  

---

## 1. Quick Start: Test on Your Phone in 60 Seconds (Zero Setup Required)

You do **not** need Android Studio, Xcode, or a developer account to run and test TAVI on your physical phone!

### Step 1: Install Expo Go
- **Android Phone:** Open Google Play Store and install **Expo Go**.
- **iPhone:** Open Apple App Store and install **Expo Go**.

### Step 2: Start the Development Server
In your computer terminal, navigate to the `mobile` folder and run:
```bash
cd mobile
npm install
npx expo start
```

### Step 3: Scan the QR Code
- A large QR code will appear in your terminal.
- **Android:** Open the Expo Go app and tap **"Scan QR code"**.
- **iPhone:** Open your iPhone Camera app, point it at the QR code, and tap the notification banner.
- The TAVI app will load on your physical phone with live reload!

---

## 2. Generating a Standalone Android APK (Installable File)

If you want an `.apk` file that you or your beta testers can download and install directly on any Android device without Expo Go:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo (Free Account)
```bash
eas login
```
*(If you do not have an Expo account, create one for free at https://expo.dev)*

### Step 3: Build the Android APK
```bash
eas build -p android --profile preview
```
- EAS will compile the Android APK in the cloud.
- Once finished, it will output a direct download link (e.g. `https://expo.dev/artifacts/eas/...apk`).
- Download the `.apk` file onto your Android device and install it!

---

## 3. Production Google Play Store App Bundle (AAB)

When you are ready to publish TAVI on the Google Play Store:
```bash
eas build -p android --profile production
```
This produces an optimized `.aab` (Android App Bundle) matching Google Play Store requirements.

---

## 4. iOS TestFlight / App Store Build

For iOS:
1. An **Apple Developer Account** ($99/year) is required by Apple.
2. Run:
```bash
eas build -p ios --profile production
```
3. EAS will ask for your Apple Developer credentials, generate signing certificates, and upload the build directly to Apple TestFlight.
