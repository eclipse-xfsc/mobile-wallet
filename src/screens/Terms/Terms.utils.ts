import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorageKeys } from '../../constants';

export const storeTermsCompleteStage = async () => {
  await AsyncStorage.setItem(
    LocalStorageKeys.OnboardingCompleteStage,
    'termsComplete',
  );
};

export const restoreAppIntroCompleteStage = async () => {
  await AsyncStorage.removeItem(LocalStorageKeys.OnboardingCompleteStage);
};
