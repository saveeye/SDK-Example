import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SaveeyeSdk, {
  PlusDeviceOnboardingSessionStatus,
} from '@saveeye/saveeye-sdk-reactnative';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MainFlowNavigaton, type StackParams } from '../App';

interface Props
  extends NativeStackScreenProps<
    StackParams,
    MainFlowNavigaton.ONBOARDING_WAIT
  > {}

interface DeviceError {
  errorCode: string;
  errorMessage: string;
  canContinue: boolean;
  pushToPage?: string;
}

export const OnboardingWaitScreen = ({ route, navigation }: Props) => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<DeviceError | null>(null);

  useEffect(() => {
    const possibleErrors: DeviceError[] = [
      {
        errorCode: 'DecryptionError',
        errorMessage: '',
        canContinue: false,
        pushToPage: MainFlowNavigaton.ENCRYPTION_KEY,
      },
      {
        errorCode: 'AuthenticationFailure',
        errorMessage: '',
        canContinue: false,
        pushToPage: MainFlowNavigaton.ENCRYPTION_KEY,
      },
      {
        errorCode: 'ACKError',
        errorMessage:
          'Error connecting to the device. Try reconnecting the device to the meter.',
        canContinue: true,
      },
      {
        errorCode: 'Timeout',
        errorMessage:
          'No response from meter. The port might be closed or the device is not properly connected.',
        canContinue: true,
      },
      {
        errorCode: 'LengthMismatch',
        errorMessage:
          'Invalid message received from meter. If the error persists it could be a connection or hardware issue.',
        canContinue: true,
      },
      {
        errorCode: 'SequenceError',
        errorMessage:
          'Invalid message received from meter. If the error persists it could be a connection or hardware issue.',
        canContinue: true,
      },
      {
        errorCode: 'InvalidData',
        errorMessage:
          'Invalid message received from meter. If the error persists it could be a connection or hardware issue.',
        canContinue: true,
      },
      {
        errorCode: 'CRCError',
        errorMessage:
          "Invalid data received from meter. Try removing the splitter if you're using one.",
        canContinue: true,
      },
      {
        errorCode: 'IdentificationError',
        errorMessage:
          'Error communicating with the meter. If the error persists contact customer support.',
        canContinue: true,
      },
      {
        errorCode: 'NegotiateError',
        errorMessage:
          'The device had trouble negotiating with the meter. Try adjusting the placement of the device.',
        canContinue: false,
      },
      {
        errorCode: 'LogonError',
        errorMessage:
          'Error while communicating with the meter. If the error persists it could be a hardware issue.',
        canContinue: true,
      },
      {
        errorCode: 'SecurityError',
        errorMessage: '',
        canContinue: false,
        pushToPage: MainFlowNavigaton.ENCRYPTION_KEY,
      },
      {
        errorCode: 'ReadError',
        errorMessage: 'Error reading data from the meter.',
        canContinue: true,
      },
      {
        errorCode: 'InvalidDeviceID',
        errorMessage:
          "Couldn't read data from meter. Contact customer support.",
        canContinue: false,
      },
      {
        errorCode: 'InitializationError',
        errorMessage:
          "Couldn't read data from meter. Contact customer support.",
        canContinue: false,
      },
      {
        errorCode: 'AssociationError',
        errorMessage:
          "Couldn't read data from meter. Contact customer support.",
        canContinue: false,
      },
    ];

    const handleError = (errorCode: string) => {
      const error = possibleErrors.find((e) => e.errorCode === errorCode);
      if (!error) {
        setError({
          errorCode: 'GenericError',
          errorMessage: 'An error occurred. Please try again.',
          canContinue: false,
        });
        return;
      }

      if (error.pushToPage) {
        navigation.navigate(error.pushToPage as any, {
          deviceId: route.params.deviceId,
        });
        return;
      } else {
        setError(error);
      }
    };

    const poll = async () => {
      try {
        const res = await SaveeyeSdk.getInstance().getOnboardingSession(
          route.params.deviceId
        );
        console.log('Onboarding session result:', res);

        setStatus(res.status);
        if (res.status === PlusDeviceOnboardingSessionStatus.Done) {
          navigation.navigate(MainFlowNavigaton.MAIN);
        } else if (
          res.status === PlusDeviceOnboardingSessionStatus.ErrorMessages &&
          res.errorCode
        ) {
          handleError(res.errorCode);
        } else {
          setTimeout(poll, 2000);
        }
      } catch (e) {
        console.error('Error polling onboarding session:', e);
      }
    };

    poll();
  }, [route.params.deviceId, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finishing setup</Text>

      {status === PlusDeviceOnboardingSessionStatus.FirmwareUpdateInProgress ? (
        <FirmwareUpdateWidget />
      ) : (
        <FinishingSetupWidget error={error} />
      )}

      {!error && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Please wait while we finish onboarding your device.
          </Text>
        </View>
      )}
    </View>
  );
};

function FinishingSetupWidget({ error }: { error: DeviceError | null }) {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error.errorMessage}</Text>
        <Text style={styles.errorCode}>Error Code: {error.errorCode}</Text>
      </View>
    );
  }
  return null;
}

function FirmwareUpdateWidget() {
  return (
    <View style={styles.firmwareContainer}>
      <Text style={styles.firmwareTitle}>Firmware updating</Text>
      <Text style={styles.firmwareDescription}>
        Please keep your device powered on and nearby. Do not close the app
        during the update.
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
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorMessage: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorCode: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  firmwareContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  firmwareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  firmwareDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
});
