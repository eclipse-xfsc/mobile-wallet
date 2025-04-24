import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { ColorPallet } from '../../theme/theme';

import { OnboardingStackParams, Screens } from '../../types/navigators';

type SetupDelayProps = StackScreenProps<
  OnboardingStackParams,
  Screens.SetupDelay
>;

const SetupDelay: React.FC<SetupDelayProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const backAction = () => {
    // TODO move to translations
    Alert.alert('PCM', 'Are you sure you want to exit?', [
      {
        text: 'NO',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => BackHandler.exitApp() },
    ]);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  return (
    <View style={styles.container}>
      <CircularProgress
        value={0}
        radius={120}
        maxValue={40}
        initialValue={40}
        title={t<string>('Registration.SecondCounter')}
        progressValueFontSize={40}
        titleFontSize={16}
        progressValueColor={ColorPallet.brand.primary}
        activeStrokeColor={ColorPallet.brand.primary}
        activeStrokeWidth={15}
        inActiveStrokeColor={ColorPallet.grayscale.lightGrey}
        inActiveStrokeWidth={17}
        duration={40000}
        onAnimationComplete={() =>
          navigation.navigate(Screens.WalletInitialized)
        }
      />
    </View>
  );
};

export default SetupDelay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
  },
});
