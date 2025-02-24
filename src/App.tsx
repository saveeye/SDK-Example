import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { ConnectWifiScreen } from './screens/ConnectWifiScreen';
import { DeviceSettingsScreen } from './screens/DeviceSettingsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { CreateUserScreen } from './screens/login/CreateUserScreen';
import { LoginScreen } from './screens/login/LoginScreen';
import { MainScreen } from './screens/MainScreen';
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
  MAIN = 'Main',
  HISTORY = 'History',
  REALTIME = 'Realtime',
  DEVICE_SETTINGS = 'DeviceSettings',
}

export enum AuthFlowNavigation {
  CREATE = 'CreateUser',
  LOGIN = 'Login',
}

type filter = {
  deviceSN: string;
  alias: string;
};

export type StackParams = {
  [MainFlowNavigaton.HOME]: undefined;
  [MainFlowNavigaton.QR]: undefined;
  [MainFlowNavigaton.PAIR]: { deviceId: string };
  [MainFlowNavigaton.CONNECT_WIFI]: { device: ESPDevice };
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

  function onAuthStateChanged(updatedUser: FirebaseAuthTypes.User | null) {
    setUser(updatedUser);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initializing) return null;

  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator
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
