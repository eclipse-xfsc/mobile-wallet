import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import { LocalStorageKeys } from '../../constants';

export const getOnboardingCompleteStage = async () => {
  const onboardingCompleteStage = await AsyncStorage.getItem(
    LocalStorageKeys.OnboardingCompleteStage,
  );
  return onboardingCompleteStage;
};

export const hideNativeSplashScreen = () => {
  SplashScreen.hide();
};
