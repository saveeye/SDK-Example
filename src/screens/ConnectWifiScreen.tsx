import {
  ESPWifiAuthMode,
  type ESPWifiList,
} from '@orbital-systems/react-native-esp-idf-provisioning';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MainFlowNavigaton, type StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.CONNECT_WIFI> {}

export const ConnectWifiScreen = ({ route, navigation }: Props) => {
  const [availableWifi, setAvailableWifi] = useState<ESPWifiList[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState<ESPWifiList | null>(null);
  const [wifiPassword, setWifiPassword] = useState('');

  useEffect(() => {
    console.log('Device: ', route.params.device);
    SaveeyeSdk.getInstance()
      .getAvailableSSIDForDevice(route.params.device.espDevice)
      .then((wifiList) => {
        console.log('Available wifi: ', wifiList);
        setAvailableWifi(wifiList);
      })
      .catch((error) => {
        console.error('Error fetching available wifi: ', error);
      });
  }, [route.params.device]);

  const checkDeviceType = () => {
    SaveeyeSdk.getInstance()
      .getDeviceById(route.params.device.deviceId)
      .then((device) => {
        if (
          device.deviceType.profile === 1 ||
          device.deviceType.profile === 2
        ) {
          navigation.navigate(MainFlowNavigaton.BLINKS_PER_KWH, {
            deviceId: route.params.device.deviceId,
          });
        } else {
          navigation.navigate(MainFlowNavigaton.ONBOARDING_WAIT, {
            deviceId: route.params.device.deviceId,
          });
        }
      })
      .catch((error) => {
        console.error('Error getting device: ', error);
        Alert.alert('Error', 'Error getting device info');
      });
  };

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
                .connectToWiFi(
                  route.params.device.espDevice,
                  route.params.device.deviceId,
                  wifi.ssid,
                  ''
                )
                .then(() => {
                  console.log('Connected to wifi: ', wifi);
                  checkDeviceType();
                })
                .catch((error) => {
                  console.error('Error connecting to wifi: ', error);
                  Alert.alert('Error', 'Failed to connect to WiFi');
                });
            } else {
              if (Platform.OS === 'ios') {
                Alert.prompt('Enter password', '', (password) => {
                  SaveeyeSdk.getInstance()
                    .connectToWiFi(
                      route.params.device.espDevice,
                      route.params.device.deviceId,
                      wifi.ssid,
                      password
                    )
                    .then(() => {
                      console.log('Connected to wifi: ', wifi);
                      checkDeviceType();
                    })
                    .catch((error) => {
                      console.error('Error connecting to wifi: ', error);
                      Alert.alert('Error', 'Failed to connect to WiFi');
                    });
                });
              } else {
                setSelectedWifi(wifi);
                setShowPasswordModal(true);
              }
            }
          }}
        />
      ))}

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}
          >
            <Text>Enter password for {selectedWifi?.ssid}</Text>
            <TextInput
              value={wifiPassword}
              onChangeText={setWifiPassword}
              placeholder="Password"
              secureTextEntry
              style={{ borderBottomWidth: 1, marginBottom: 20, marginTop: 10 }}
            />
            <Button
              title="Connect"
              onPress={() => {
                if (selectedWifi) {
                  SaveeyeSdk.getInstance()
                    .connectToWiFi(
                      route.params.device.espDevice,
                      route.params.device.deviceId,
                      selectedWifi.ssid,
                      wifiPassword
                    )
                    .then(() => {
                      setShowPasswordModal(false);
                      setWifiPassword('');
                      setSelectedWifi(null);
                      console.log('Connected to wifi: ', selectedWifi);
                      checkDeviceType();
                    })
                    .catch((error) => {
                      setShowPasswordModal(false);
                      setWifiPassword('');
                      setSelectedWifi(null);
                      console.error('Error connecting to wifi: ', error);
                      Alert.alert('Error', 'Failed to connect to WiFi');
                    });
                }
              }}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setShowPasswordModal(false);
                setWifiPassword('');
                setSelectedWifi(null);
              }}
            />
          </View>
        </View>
      </Modal>
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
