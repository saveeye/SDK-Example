# SaveEye SDK Example App

This example app demonstrates how to use the SaveEye SDK to interact with SaveEye devices. The app includes examples of provisioning devices, connecting to WiFi, retrieving device information, and subscribing to real-time data.

## SDK

An overview of the SDK can be found here: [SaveEyeSDK](https://www.npmjs.com/package/@saveeye/saveeye-sdk-reactnative?activeTab=readme)

## Prerequisites

Before running the example app, ensure you have the following installed:

- Node.js (>= 14.x)
- Yarn package manager
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/your-repo/saveeye-sdk-example.git
cd saveeye-sdk-example
```

2. Install dependencies:

```sh
yarn install
```

3. Add your `GoogleService-Info.plist` file to the appropriate directory for iOS and `google-services.json` for Android.

4. Add your SDK key in a new file called `Secrets.tsx`:

```tsx
// filepath: /src/Secrets.tsx
export const AppSdkKey = 'YOUR_SDK_KEY_HERE';
```

## Running the App

### iOS

1. Install CocoaPods dependencies:

```sh
cd ios
pod install
cd ..
```

2. Run the app:

```sh
yarn ios
```

### Android

1. Run the app:

```sh
yarn android
```

The example app includes the following features:

- Initialize
- Provisioning a Device
- Connecting to WiFi
- Retrieving Device Information
- Subscribing to Real-Time Data
- Unsubscribing from Real-Time Data
- Setting Device Alias
- Setting Local MQTT Settings
- Setting Device Alarm Thresholds

## Support

For support or questions, please contact [thj@saveeye.com](mailto:thj@saveeye.com).
