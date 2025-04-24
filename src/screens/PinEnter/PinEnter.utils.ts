import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import md5 from 'md5';
import i18next from 'i18next';
import { LocalStorageKeys } from '../../constants';

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

export const createMD5HashFromString = (value: string) => {
  const hash = String(md5(value));
  return hash;
};

export const removeOnboardingCompleteStage = async () => {
  await AsyncStorage.removeItem(LocalStorageKeys.OnboardingCompleteStage);
};
