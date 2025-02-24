import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
} from 'react-native';
import type { MainFlowNavigaton, StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<
    StackParams,
    MainFlowNavigaton.DEVICE_SETTINGS
  > {}

export const DeviceSettingsScreen = ({ navigation, route }: Props) => {
  const [deviceName, setDeviceName] = useState<string>();
  const [localMqttEnabled, setLocalMqttEnabled] = useState<boolean>(false);
  const [mqttBroker, setMqttBroker] = useState<string>();
  const [mqttPort, setMqttPort] = useState<number>();
  const [mqttUsername, setMqttUsername] = useState<string>();
  const [mqttPassword, setMqttPassword] = useState<string>();
  const [alertMaxWh, setAlarmMaxWh] = useState<number>();
  const [alertMinWh, setAlarmMinWh] = useState<number>();

  useEffect(() => {
    console.log('Got device id', route.params.deviceId);
    SaveeyeSdk.getInstance()
      .getDeviceSettings(route.params.deviceId)
      .then((settings) => {
        console.log('Device settings:', settings);
        setLocalMqttEnabled(settings.localMqttEnabled);
        setDeviceName(settings.alias);
        setMqttBroker(settings.localMqttBroker);
        setMqttPort(settings.localMqttPort);
        setMqttUsername(settings.localMqttUser);
        setMqttPassword(settings.localMqttPassword);
        setAlarmMaxWh(settings.consumptionAlarmMaxWh);
        setAlarmMinWh(settings.consumptionAlarmMinWh);
      });
  }, [route.params.deviceId]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Device Settings</Text>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.settingsHeader}>Device name</Text>
        <TextInput
          placeholder="Enter device name"
          value={deviceName}
          onChangeText={setDeviceName}
        />
        <Button
          title="Save device name"
          onPress={() => {
            SaveeyeSdk.getInstance()
              .setDeviceAlias(route.params.deviceId, deviceName)
              .then(() => {
                navigation.goBack();
              });
          }}
        />
        <Text style={styles.settingsHeader}>MQTT Settings</Text>
        <Text>Local MQTT enabled</Text>
        <Switch onValueChange={setLocalMqttEnabled} value={localMqttEnabled} />
        <TextInput
          placeholder="MQTT Server"
          value={String(mqttBroker)}
          onChangeText={setMqttBroker}
        />
        <TextInput
          placeholder="MQTT Port"
          value={String(mqttPort)}
          onChangeText={(change) => setMqttPort(Number(change))}
        />
        <TextInput
          placeholder="MQTT Username"
          value={mqttUsername}
          onChangeText={setMqttUsername}
        />
        <TextInput
          placeholder="MQTT Password"
          value={mqttPassword}
          onChangeText={setMqttPassword}
        />
        <Button
          title="Save MQTT"
          onPress={() => {
            SaveeyeSdk.getInstance()
              .setLocalMQTTSettings(
                route.params.deviceId,
                localMqttEnabled,
                mqttBroker,
                Number(mqttPort),
                mqttUsername,
                mqttPassword
              )
              .then(() => {
                navigation.goBack();
              });
          }}
        />
        <Text>Device alerts</Text>
        <TextInput
          value={alertMaxWh ? String(alertMaxWh) : ''}
          onChangeText={(text) => setAlarmMaxWh(Number(text))}
          placeholder="Enter alert max"
        />
        <TextInput
          value={alertMinWh ? String(alertMinWh) : ''}
          onChangeText={(text) => setAlarmMinWh(Number(text))}
          placeholder="Enter alert min"
        />
        <Button
          title="Save alerts"
          onPress={() => {
            SaveeyeSdk.getInstance()
              .setDeviceAlarmThresholds(
                route.params.deviceId,
                alertMaxWh,
                alertMinWh
              )
              .then(() => {
                navigation.goBack();
              });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceId: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  settingsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    rowGap: 16,
    alignItems: 'center',
  },
});
