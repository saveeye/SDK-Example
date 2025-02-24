import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import auth from '@react-native-firebase/auth';
import type { NavigationProp } from '@react-navigation/native';
import SaveeyeSdk, { MyDeviceFragment } from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { MainFlowNavigaton } from '../App';

type MainScreenProps = {
  navigation: NavigationProp<any>;
};

export const MainScreen = ({ navigation }: MainScreenProps) => {
  const [devices, setDevices] = useState<MyDeviceFragment[]>([]);

  useEffect(() => {
    const unSubscribe = navigation.addListener('focus', () => {
      SaveeyeSdk.getInstance()
        .getMyDevices()
        .then((myDevices) => {
          console.log('My devices:', myDevices);
          setDevices(myDevices);
        });
    });

    return unSubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {devices.length > 0 ? (
        <>
          <Text>You have {devices.length} device(s) registered</Text>
          <Button
            title="See device history"
            onPress={() =>
              navigation.navigate(MainFlowNavigaton.HISTORY, {
                deviceId: devices[0].id,
              })
            }
          />
          <Button
            title="Start realtime monitoring"
            onPress={() => {
              navigation.navigate(MainFlowNavigaton.REALTIME, {
                deviceId: devices[0].id,
              });
            }}
          />
          <Button
            title="Device settings"
            onPress={() => {
              navigation.navigate(MainFlowNavigaton.DEVICE_SETTINGS, {
                deviceId: devices[0].id,
              });
            }}
          />
        </>
      ) : (
        <View style={styles.container}>
          <Text>You have no devices</Text>
          <Button
            title="Pair new device"
            onPress={() => navigation.navigate(MainFlowNavigaton.QR)}
          />
        </View>
      )}
      <Button
        title="Sign out"
        onPress={() => {
          auth().signOut();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
