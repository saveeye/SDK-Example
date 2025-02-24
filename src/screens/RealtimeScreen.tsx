import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk, {
  type RealtimeReading,
} from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import type { MainFlowNavigaton, StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.REALTIME> {}

export const RealtimeScreen = ({ navigation, route }: Props) => {
  const [realtimeReadings, setRealtimeReadings] = useState<RealtimeReading[]>(
    []
  );

  useEffect(() => {
    console.log('Got device id', route.params.deviceId);
    SaveeyeSdk.getInstance().subscribeToRealtimeData(
      route.params.deviceId,
      (data) => {
        console.log('Got realtime data:', data);
        let tmpReadings = [...realtimeReadings];
        tmpReadings.push(data);
        setRealtimeReadings(tmpReadings);
      }
    );

    return () => {
      SaveeyeSdk.getInstance().unsubscribeFromRealtimeData();
    };
  }, [route.params.deviceId]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Readings</Text>
      <ScrollView>
        {realtimeReadings?.map((reading, index) => {
          return (
            <Text key={index} style={styles.period}>
              {reading.timestamp.toISOString()} - Consumption:{' '}
              {reading.currentConsumptionWh.total} kWh - Production:{' '}
              {reading.currentProductionWh.total} kWh
            </Text>
          );
        })}
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
  period: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
