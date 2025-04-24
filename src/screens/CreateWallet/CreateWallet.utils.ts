import { Alert } from 'react-native';
import md5 from 'md5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setValueKeychain } from '../../utils/keychain';
import wordsList from '../../utils/wordsList';
import { LocalStorageKeys } from '../../constants';

export const createMD5HashFromString = (value: string) => {
  const hash = String(md5(value));
  return hash;
};
export const storeOnboardingCompleteStage = async () => {
  await AsyncStorage.setItem(LocalStorageKeys.OnboardingCompleteStage, 'true');
};
