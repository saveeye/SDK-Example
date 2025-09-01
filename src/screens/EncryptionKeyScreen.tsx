import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk, {
  PlusDeviceOnboardingSessionStatus,
} from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
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
    MainFlowNavigaton.ENCRYPTION_KEY
  > {}

export const EncryptionKeyScreen = ({ route, navigation }: Props) => {
  const [opticalKey, setOpticalKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceProfile, setDeviceProfile] = useState<number>();
  const [mepKey, setMEPKey] = useState('');
  const [gpk60Key, setGPK60Key] = useState('');
  const [gpk61Key, setGPK61Key] = useState('');
  const [showWaitWidget, setShowWaitWidget] = useState(false);

  useEffect(() => {
    SaveeyeSdk.getInstance()
      .getDeviceById(route.params.deviceId)
      .then((device) => {
        console.log('Device:', device);
        setDeviceProfile(device.deviceType.profile);
      })
      .catch((error) => {
        console.error('Error getting device:', error);
        Alert.alert('Error', 'Failed to get device information');
      });
  }, [route.params.deviceId]);

  const handleContinue = async () => {
    if (loading) return;
    setLoading(true);

    SaveeyeSdk.getInstance()
      .setEncryptionKey(
        route.params.deviceId,
        mepKey,
        gpk60Key,
        gpk61Key,
        opticalKey
      )
      .then(() => {
        setShowWaitWidget(true);
      })
      .catch((error) => {
        console.error('Error setting encryption key:', error);
        Alert.alert('Error', 'Failed to set encryption key');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (showWaitWidget) {
    return (
      <EncryptionWaiter
        deviceId={route.params.deviceId}
        onTimeout={() => setShowWaitWidget(false)}
        onDone={() => navigation.navigate(MainFlowNavigaton.MAIN)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encryption Key</Text>
      <Text style={styles.description}>
        Please enter the encryption key for your device.
      </Text>

      <View style={styles.inputContainer}>
        {deviceProfile === 4 && (
          <OpticalKeyWidget
            opticalKey={opticalKey}
            setOpticalKey={setOpticalKey}
          />
        )}
        {deviceProfile === 5 && (
          <MEPKeyWidget mepKey={mepKey} setMEPKey={setMEPKey} />
        )}
        {deviceProfile === 6 && (
          <GPKKeyWidget
            gpk60Key={gpk60Key}
            gpk61Key={gpk61Key}
            setGpk60Key={setGPK60Key}
            setGpk61Key={setGPK61Key}
          />
        )}
      </View>

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

function OpticalKeyWidget(props: {
  opticalKey: string;
  setOpticalKey: (key: string) => void;
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Enter optical key"
      value={props.opticalKey}
      onChangeText={props.setOpticalKey}
      secureTextEntry
      autoCapitalize="none"
    />
  );
}

function MEPKeyWidget(props: {
  mepKey: string;
  setMEPKey: (key: string) => void;
}) {
  const [error, setError] = useState('');

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Enter MEP key"
        value={props.mepKey}
        onChangeText={props.setMEPKey}
        secureTextEntry
        autoCapitalize="none"
        onBlur={() => {
          if (props.mepKey.length !== 20) {
            setError('MEP key must be exactly 20 characters long');
          } else {
            setError('');
          }
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function GPKKeyWidget(props: {
  gpk60Key: string;
  gpk61Key: string;
  setGpk60Key: (key: string) => void;
  setGpk61Key: (key: string) => void;
}) {
  const [gpk60Error, setGpk60Error] = useState('');
  const [gpk61Error, setGpk61Error] = useState('');

  return (
    <View style={styles.gpkContainer}>
      <TextInput
        style={styles.input}
        placeholder="Enter GPK60 key"
        value={props.gpk60Key}
        onChangeText={props.setGpk60Key}
        secureTextEntry
        autoCapitalize="none"
        onBlur={() => {
          if (props.gpk60Key.length !== 32) {
            setGpk60Error('GPK60 key must be exactly 32 characters long');
          } else {
            setGpk60Error('');
          }
        }}
      />
      {gpk60Error ? <Text style={styles.errorText}>{gpk60Error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Enter GPK61 key"
        value={props.gpk61Key}
        onChangeText={props.setGpk61Key}
        secureTextEntry
        autoCapitalize="none"
        onBlur={() => {
          if (props.gpk61Key.length !== 32) {
            setGpk61Error('GPK61 key must be exactly 32 characters long');
          } else {
            setGpk61Error('');
          }
        }}
      />
      {gpk61Error ? <Text style={styles.errorText}>{gpk61Error}</Text> : null}
    </View>
  );
}

function EncryptionWaiter({
  deviceId,
  onTimeout,
  onDone,
}: {
  deviceId: string;
  onTimeout: () => void;
  onDone: () => void;
}) {
  const [decryptionErrorStart, setDecryptionErrorStart] = useState<
    number | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const res =
          await SaveeyeSdk.getInstance().getOnboardingSession(deviceId);
        if (cancelled) return;

        console.log('Poll res:', res);
        if (res.status === PlusDeviceOnboardingSessionStatus.Done) {
          onDone();
        } else if (
          res.status === PlusDeviceOnboardingSessionStatus.ErrorMessages
        ) {
          if (res.errorCode === 'DecryptionError') {
            if (!decryptionErrorStart) {
              setDecryptionErrorStart(Date.now());
            } else {
              const elapsed = Date.now() - decryptionErrorStart;
              if (elapsed > 180000) {
                // 3 minutes
                onTimeout();
                return;
              }
            }
            timeoutId = setTimeout(poll, 2000);
          }
        } else {
          setDecryptionErrorStart(null);
          timeoutId = setTimeout(poll, 2000);
        }
      } catch (e) {
        console.error('Error polling encryption session:', e);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deviceId, onTimeout, onDone, decryptionErrorStart]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Encryption</Text>
      <Text style={styles.description}>
        Please wait while we process your encryption key.
      </Text>
    </View>
  );
}

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
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  gpkContainer: {
    width: '100%',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 10,
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
