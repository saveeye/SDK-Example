import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk from '@saveeye/saveeye-sdk-reactnative';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MainFlowNavigaton, type StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<
    StackParams,
    MainFlowNavigaton.BLINKS_PER_KWH
  > {}

export const BlinksPerKwhScreen = ({ route, navigation }: Props) => {
  const [blinksPerKwh, setBlinksPerKwh] = useState(1000); // Default value
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;

    if (isNaN(blinksPerKwh) || blinksPerKwh <= 0) {
      Alert.alert('Error', 'Blinks per kWh must be a higher number than 0.');
      return;
    }

    setLoading(true);
    SaveeyeSdk.getInstance()
      .setBlinksPerKwh(route.params.deviceId, blinksPerKwh)
      .then(() => {
        navigation.navigate(MainFlowNavigaton.ONBOARDING_WAIT, {
          deviceId: route.params.deviceId,
        });
      })
      .catch((error) => {
        console.error('Error setting blinksPerKwh: ', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blinks per kWh</Text>
      <Text style={styles.description}>
        Enter the number of LED blinks your meter uses to indicate 1 kWh used.
        This is usually printed on the meter (e.g. 1000 or 2000).
      </Text>

      <TextInput
        style={styles.input}
        value={blinksPerKwh === 0 ? '' : blinksPerKwh.toString()}
        onChangeText={(text) => {
          const value = text === '' ? 0 : Number(text);
          setBlinksPerKwh(value);
        }}
        placeholder="e.g. 1000"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
