import { useFocusEffect, type NavigationProp } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { getIdFromQR } from '../../../src/utils/SaveEyeUtil';
import { MainFlowNavigaton } from '../App';

type QRScanScreenProps = {
  navigation: NavigationProp<any>;
};

export const QRScanScreen = ({ navigation }: QRScanScreenProps) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [serialMatchFound, setSerialMatchFound] = useState<boolean>(false);
  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (!serialMatchFound) {
        codes.map((code) => {
          if (code.value) {
            const deviceId = getIdFromQR(code.value);
            if (deviceId) {
              setSerialMatchFound(true);
              console.log('Found deviceid: ', deviceId);
              navigation.navigate(MainFlowNavigaton.PAIR, {
                deviceId: deviceId,
              });
            }
          }
        });
      }
    },
  });

  useFocusEffect(
    useCallback(() => {
      // Function to run when the view appears
      console.log('QRScanScreen is focused');
      setSerialMatchFound(false);

      return () => {
        // Cleanup function to run when the view disappears
        console.log('QRScanScreen is unfocused');
      };
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text>QR Scan</Text>
        {hasPermission && device ? (
          <Camera
            device={device}
            style={[StyleSheet.absoluteFill]}
            isActive={true}
            codeScanner={codeScanner}
          />
        ) : (
          <Button title="Request Permission" onPress={requestPermission} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
});
