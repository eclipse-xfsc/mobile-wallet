import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';
import { LocalStorageKeys } from '../../constants';

export const storeOnboardingCompleteStage = async () => {
  await AsyncStorage.setItem(LocalStorageKeys.OnboardingCompleteStage, 'true');
};

export const createMD5HashFromString = (value: string) => {
  const hash = String(md5(value));
  return hash;
};
