import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorageKeys } from '../../constants';

export const storeAppIntroCompleteStage = async () => {
  await AsyncStorage.setItem(
    LocalStorageKeys.OnboardingCompleteStage,
    'appIntroComplete',
  );
};

export default storeAppIntroCompleteStage;
