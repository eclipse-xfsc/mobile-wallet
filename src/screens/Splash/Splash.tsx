import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorPallet } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import {
  getOnboardingCompleteStage,
  hideNativeSplashScreen,
} from './Splash.utils';

type SplashProps = StackScreenProps<OnboardingStackParams, Screens.Splash>;

const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const checkStack = async () => {
    const onboardingCompleteStage = await getOnboardingCompleteStage();
    hideNativeSplashScreen();
    switch (onboardingCompleteStage) {
      case 'true':
        navigation.navigate(Screens.EnterPin);
        break;
      case 'appIntroComplete':
        navigation.navigate(Screens.Terms);
        break;
      case 'termsComplete':
        navigation.navigate(Screens.CreatePin);
        break;
      default:
        navigation.navigate(Screens.Onboarding);
    }
  };

  useEffect(() => {
    checkStack();
  }, []);

  return <View style={styles.container} />;
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPallet.grayscale.white,
  },
});
