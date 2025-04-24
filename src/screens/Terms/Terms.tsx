import { useFocusEffect } from '@react-navigation/core';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { ScreenNavigatorButtons } from '../../components';
import LegalAndPrivacyLinks from '../../components/LegalAndPrivacyLinks';
import { ColorPallet } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import {
  restoreAppIntroCompleteStage,
  storeTermsCompleteStage,
} from './Terms.utils';

type TermsProps = StackScreenProps<OnboardingStackParams, Screens.Terms>;

const Terms: React.FC<TermsProps> = ({ navigation }) => {
  let backCount = 0;

  const onSubmitPressed = async () => {
    await storeTermsCompleteStage();
    navigation.navigate(Screens.CreatePin);
  };

  const onBack = async () => {
    await restoreAppIntroCompleteStage();
    navigation.navigate(Screens.Onboarding);
  };
  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        backCount++;
        if (backCount === 1) {
          await restoreAppIntroCompleteStage();
          navigation.navigate(Screens.Onboarding);
        } else {
          BackHandler.exitApp();
        }

        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [backCount, navigation]),
  );
  return (
    <View style={styles.container}>
      <LegalAndPrivacyLinks />
      <View style={styles.bottom}>
        <ScreenNavigatorButtons
          onLeftPress={onBack}
          onRightPress={onSubmitPressed}
        />
      </View>
    </View>
  );
};

export default Terms;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
    flex: 1,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    width: '100%',
  },
});
