import i18next from 'i18next';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const checkIfSensorAvailable = async () => {
  const result = await rnBiometrics.isSensorAvailable();
  return result;
};

export const showBiometricPrompt = async () => {
  const result = await rnBiometrics.simplePrompt({
    promptMessage: i18next.t<string>('Biometric.BiometricConfirm'),
  });
  return result;
};

export const authenticateUser = args => {
  const res = args.reduce((prev, curr) => {
    if (prev === curr) {
      return true;
    }
    return false;
  });
  return res;
};
