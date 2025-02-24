import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk, {
  IntervalType,
  type DeviceHistory,
} from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { MainFlowNavigaton, StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.HISTORY> {}

export const HistoryScreen = ({ navigation, route }: Props) => {
  const [history, setHistory] = useState<DeviceHistory>();

  useEffect(() => {
    console.log('Got device id', route.params.deviceId);
    const fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);

    SaveeyeSdk.getInstance()
      .getDeviceHistory(
        route.params.deviceId,
        fromDate,
        new Date(),
        IntervalType.Hour
      )
      .then((serverHistory) => {
        console.log('HistoryScreen history:', serverHistory);
        setHistory(serverHistory);
      });
  }, [route.params.deviceId]);
  return (
    <SafeAreaView style={styles.container}>
      <Text>History Screen</Text>
      {history && <Text style={styles.deviceId}>{history.deviceId}</Text>}
      {history?.energyUsageSummaries?.map((summary, index) => {
        return (
          <View key={index}>
            <Text style={styles.period}>{summary.aggregationPeriod}</Text>
            <Text>
              Consumption: {summary.energyConsumedKWh} - Production:{' '}
              {summary.energyProducedKWh}
            </Text>
          </View>
        );
      })}
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
});
