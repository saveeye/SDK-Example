import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk, {
  EnergyUsageHistory,
  IntervalType,
} from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PowerUsageHistory } from '../../../src/__generated__/graphql';
import type { MainFlowNavigaton, StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<StackParams, MainFlowNavigaton.HISTORY> {}

export const HistoryScreen = ({ navigation, route }: Props) => {
  const [history, setHistory] = useState<EnergyUsageHistory>();
  const [powerHistory, setPowerHistory] = useState<PowerUsageHistory>();

  useEffect(() => {
    console.log('Got device id', route.params.deviceId);
    const fromDate = new Date();
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);

    SaveeyeSdk.getInstance()
      .getPowerUsageHistory(
        route.params.deviceId,
        fromDate,
        new Date(),
        IntervalType.Hour
      )
      .then((serverHistory) => {
        console.log('HistoryScreen history:', serverHistory);
        setPowerHistory(serverHistory);
      });

    SaveeyeSdk.getInstance()
      .getEnergyUsageHistory(
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
      {powerHistory?.powerUsageSummaries?.map((summary, index) => {
        return (
          <View key={index}>
            <Text style={styles.period}>{summary.aggregationPeriod}</Text>
            <Text>Power: {summary.averageConsumptionWatt} W</Text>
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
