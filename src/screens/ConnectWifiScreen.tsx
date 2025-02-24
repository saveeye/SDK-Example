import {
  ESPWifiAuthMode,
  type ESPWifiList,
} from '@orbital-systems/react-native-esp-idf-provisioning';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MainFlowNavigaton, type StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.CONNECT_WIFI> {}

export const ConnectWifiScreen = ({ route, navigation }: Props) => {
  const [availableWifi, setAvailableWifi] = useState<ESPWifiList[]>([]);

  useEffect(() => {
    console.log('Device: ', route.params.device);
    SaveeyeSdk.getInstance()
      .getAvailableSSIDForDevice(route.params.device)
      .then((wifiList) => {
        console.log('Available wifi: ', wifiList);
        setAvailableWifi(wifiList);
      })
      .catch((error) => {
        console.error('Error fetching available wifi: ', error);
      });
  }, [route.params.device]);

  return (
    <View style={styles.container}>
      <Text>Connect Wifi</Text>
      {availableWifi.map((wifi) => (
        <WifiView
          key={wifi.ssid}
          wifi={wifi}
          onTap={() => {
            console.log('Connecting to wifi: ', wifi);
            if (wifi.auth === ESPWifiAuthMode.open) {
              // CONNECT
              SaveeyeSdk.getInstance()
                .connectToWiFi(route.params.device, wifi.ssid, '')
                .then(() => {
                  console.log('Connected to wifi: ', wifi);
                  navigation.navigate(MainFlowNavigaton.MAIN);
                });
            } else {
              Alert.prompt('Enter password', '', (password) => {
                SaveeyeSdk.getInstance()
                  .connectToWiFi(route.params.device, wifi.ssid, password)
                  .then(() => {
                    console.log('Connected to wifi: ', wifi);
                    navigation.navigate(MainFlowNavigaton.MAIN);
                  });
              });
            }
          }}
        />
      ))}
    </View>
  );
};

type WifiView = {
  wifi: ESPWifiList;
  onTap: () => void;
};

const WifiView = (props: WifiView) => {
  return (
    <Pressable onPress={props.onTap}>
      <View style={styles.item}>
        <Text style={styles.itemText}>{props.wifi.ssid}</Text>
        {props.wifi.auth !== ESPWifiAuthMode.open && (
          <Icon name="lock" size={30} color="black" />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: 'white',
  },
  itemText: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});
