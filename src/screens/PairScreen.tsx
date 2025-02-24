import { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { ConnectionStages } from '../../../src/enums/ConnectionStages';
import { MainFlowNavigaton, type StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.PAIR> {}

export const PairScreen = ({ route, navigation }: Props) => {
  const saveeyesdk = SaveeyeSdk.getInstance();
  const [deviceStatus, setDeviceStatus] = useState<ConnectionStages>(
    ConnectionStages.NONE
  );
  const [onError, setOnError] = useState<boolean>(false);

  const startDeviceProvisioning = useCallback(() => {
    setOnError(false);
    saveeyesdk
      .provisioningDevice(route.params.deviceId)
      .then((device) => {
        console.log('Device paired successfully, connecting to wifi');
        navigation.navigate(MainFlowNavigaton.CONNECT_WIFI, { device: device });
      })
      .catch((error) => {
        console.error('Error provisioning device: ', error);
        setOnError(true);
      });
  }, [route.params.deviceId, navigation, saveeyesdk]);

  useEffect(() => {
    const handleDeviceStatus = (status: string) => {
      const connectionStatus = status as ConnectionStages;
      console.log('Device status: ', connectionStatus);
      setDeviceStatus(connectionStatus);
    };

    saveeyesdk.onDeviceStatusUpdate(handleDeviceStatus);

    startDeviceProvisioning();
    return () => {
      saveeyesdk.stopDeviceStatusUpdates();
    };
  }, [route.params.deviceId, saveeyesdk, startDeviceProvisioning]);

  const renderStatusMessage = () => {
    switch (deviceStatus) {
      case ConnectionStages.SEARCHING:
        return <Text>Searching for device</Text>;
      case ConnectionStages.PAIRING:
        return <Text>Pairing with device</Text>;
      case ConnectionStages.PAIRED:
        return <Text>Device paired successfully</Text>;
      case ConnectionStages.FETCHED_DEVICE_CONFIG:
        return <Text>Fetched device configuration</Text>;
      case ConnectionStages.CONNECTED:
        return <Text>Device connected</Text>;
      default:
        return <Text>Initializing...</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {onError ? (
        <>
          <Text>Error provisioning device, reset device and try again</Text>
          <Button
            title="Retry"
            onPress={() => {
              startDeviceProvisioning();
            }}
          />
        </>
      ) : (
        renderStatusMessage()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
