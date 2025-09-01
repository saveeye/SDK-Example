import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { BlinksPerKwhScreen } from './screens/BlinksPerKwhScreen';
import { ConnectWifiScreen } from './screens/ConnectWifiScreen';
import { DeviceSettingsScreen } from './screens/DeviceSettingsScreen';
import { EncryptionKeyScreen } from './screens/EncryptionKeyScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { CreateUserScreen } from './screens/login/CreateUserScreen';
import { LoginScreen } from './screens/login/LoginScreen';
import { MainScreen } from './screens/MainScreen';
import { OnboardingWaitScreen } from './screens/OnboardingWaitScreen';
import { PairScreen } from './screens/PairScreen';
import { QRScanScreen } from './screens/QRScanScreen';
import { RealtimeScreen } from './screens/RealtimeScreen';
import { AppSdkKey } from './Secrets';
if (__DEV__) {
  require('../ReactotronConfig');
}

export enum MainFlowNavigaton {
  HOME = 'Home',
  QR = 'QR',
  PAIR = 'Pair',
  CONNECT_WIFI = 'ConnectWifi',
  BLINKS_PER_KWH = 'BlinksPerKwh',
  ONBOARDING_WAIT = 'OnboardingWait',
  ENCRYPTION_KEY = 'EncryptionKey',
  MAIN = 'Main',
  HISTORY = 'History',
  REALTIME = 'Realtime',
  DEVICE_SETTINGS = 'DeviceSettings',
}

export enum AuthFlowNavigation {
  CREATE = 'CreateUser',
  LOGIN = 'Login',
}

export type StackParams = {
  [MainFlowNavigaton.HOME]: undefined;
  [MainFlowNavigaton.QR]: undefined;
  [MainFlowNavigaton.PAIR]: { deviceId: string };
  [MainFlowNavigaton.CONNECT_WIFI]: {
    device: { espDevice: ESPDevice; deviceId: string };
  };
  [MainFlowNavigaton.BLINKS_PER_KWH]: { deviceId: string };
  [MainFlowNavigaton.ONBOARDING_WAIT]: { deviceId: string };
  [MainFlowNavigaton.ENCRYPTION_KEY]: { deviceId: string };
  [MainFlowNavigaton.MAIN]: undefined;
  [MainFlowNavigaton.HISTORY]: { deviceId: string };
  [MainFlowNavigaton.REALTIME]: { deviceId: string };
  [MainFlowNavigaton.DEVICE_SETTINGS]: { deviceId: string };

  [AuthFlowNavigation.CREATE]: undefined;
  [AuthFlowNavigation.LOGIN]: undefined;
};

export default function App() {
  async function getJWTToken(): Promise<string> {
    let token = await auth().currentUser?.getIdToken();
    return token ?? '';
  }

  SaveeyeSdk.getInstance().initialize(AppSdkKey, getJWTToken);

  const Stack = createNativeStackNavigator<StackParams>();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Function to request Bluetooth permissions
  const requestBluetoothPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android API 31+ (Android 12+)
        if (Platform.Version >= 31) {
          const bluetoothScanPermission = await request(
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN
          );
          const bluetoothConnectPermission = await request(
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
          );
          const bluetoothAdvertisePermission = await request(
            PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
          );

          // Also request location permission as it's required for Bluetooth scanning
          const locationPermission = await request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          );

          if (
            bluetoothScanPermission === RESULTS.DENIED ||
            bluetoothConnectPermission === RESULTS.DENIED ||
            bluetoothAdvertisePermission === RESULTS.DENIED ||
            locationPermission === RESULTS.DENIED
          ) {
            Alert.alert(
              'Permissions Required',
              'Bluetooth and location permissions are required for device pairing and communication.',
              [{ text: 'OK' }]
            );
          }
        } else {
          // For older Android versions, request location permission (Bluetooth permissions are granted by default)
          const locationPermission = await request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          );

          if (locationPermission === RESULTS.DENIED) {
            Alert.alert(
              'Permissions Required',
              'Location permission is required for Bluetooth device scanning.',
              [{ text: 'OK' }]
            );
          }
        }
      } else if (Platform.OS === 'ios') {
        // For iOS, request Bluetooth permission
        const bluetoothPermission = await request(PERMISSIONS.IOS.BLUETOOTH);

        if (bluetoothPermission === RESULTS.DENIED) {
          Alert.alert(
            'Bluetooth Permission Required',
            'Bluetooth permission is required for device pairing and communication.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error requesting Bluetooth permissions:', error);
    }
  };

  // Function to check if permissions are granted
  const checkBluetoothPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          const bluetoothScanPermission = await check(
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN
          );
          const bluetoothConnectPermission = await check(
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
          );
          const bluetoothAdvertisePermission = await check(
            PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
          );
          const locationPermission = await check(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          );

          return (
            bluetoothScanPermission === RESULTS.GRANTED &&
            bluetoothConnectPermission === RESULTS.GRANTED &&
            bluetoothAdvertisePermission === RESULTS.GRANTED &&
            locationPermission === RESULTS.GRANTED
          );
        } else {
          // For older Android versions, only check location permission
          const locationPermission = await check(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          );

          return locationPermission === RESULTS.GRANTED;
        }
      } else if (Platform.OS === 'ios') {
        const bluetoothPermission = await check(PERMISSIONS.IOS.BLUETOOTH);
        return bluetoothPermission === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error checking Bluetooth permissions:', error);
      return false;
    }
  };

  function onAuthStateChanged(updatedUser: FirebaseAuthTypes.User | null) {
    setUser(updatedUser);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    // Request Bluetooth permissions when app starts
    const initializePermissions = async () => {
      const hasPermissions = await checkBluetoothPermissions();
      if (!hasPermissions) {
        await requestBluetoothPermissions();
      }
    };

    initializePermissions();

    return subscriber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initializing) return null;

  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          initialRouteName={MainFlowNavigaton.MAIN}
          screenOptions={{
            headerShown: true,
          }}
        >
          <Stack.Screen name={MainFlowNavigaton.QR} component={QRScanScreen} />
          <Stack.Screen name={MainFlowNavigaton.PAIR} component={PairScreen} />
          <Stack.Screen
            name={MainFlowNavigaton.CONNECT_WIFI}
            component={ConnectWifiScreen}
          />
          <Stack.Screen
            name={MainFlowNavigaton.BLINKS_PER_KWH}
            component={BlinksPerKwhScreen}
          />
          <Stack.Screen
            name={MainFlowNavigaton.ONBOARDING_WAIT}
            component={OnboardingWaitScreen}
          />
          <Stack.Screen
            name={MainFlowNavigaton.ENCRYPTION_KEY}
            component={EncryptionKeyScreen}
          />
          <Stack.Screen name={MainFlowNavigaton.MAIN} component={MainScreen} />
          <Stack.Screen
            name={MainFlowNavigaton.HISTORY}
            component={HistoryScreen}
          />
          <Stack.Screen
            name={MainFlowNavigaton.REALTIME}
            component={RealtimeScreen}
          />
          <Stack.Screen
            name={MainFlowNavigaton.DEVICE_SETTINGS}
            component={DeviceSettingsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          initialRouteName={AuthFlowNavigation.LOGIN}
          screenOptions={{
            headerShown: true,
          }}
        >
          <Stack.Screen
            name={AuthFlowNavigation.LOGIN}
            component={LoginScreen}
          />
          <Stack.Screen
            name={AuthFlowNavigation.CREATE}
            component={CreateUserScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
