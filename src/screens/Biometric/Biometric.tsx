import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import Images from '../../assets';
import { InfoCard, ScreenNavigatorButtons } from '../../components';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import {
  checkIfSensorAvailable,
  createBiometricKeys,
  showBiometricPrompt,
} from './Biometric.utils';

type BiometricProps = StackScreenProps<
  OnboardingStackParams,
  Screens.Biometric
>;

const Biometric: React.FC<BiometricProps> = ({ navigation }) => {
  const [error, setError] = useState<string | undefined>('');
  const { t } = useTranslation();

  const biometricEnable = async () => {
    const { available } = await checkIfSensorAvailable();
    if (available) {
      const { success, error } = await showBiometricPrompt();
      if (success) {
        await createBiometricKeys();
        setError(t<string>('Biometric.BiometricSuccess'));
        navigation.navigate(Screens.Initialization);
      } else {
        setError(error);
      }
    } else {
      setError(t<string>('Biometric.BiometricNotSupport'));
    }
  };

  const onBack = async () => {
    navigation.navigate(Screens.CreatePin);
  };

  return (
    <View style={[style.container]}>
      <Image source={Images.biometricIcon} style={style.biometricIconImg} />
      <InfoCard showBottomIcon={false} showTopIcon errorMsg={error}>
        {t<string>('Biometric.BiometricInfo')}
      </InfoCard>
      <ScreenNavigatorButtons
        onLeftPress={onBack}
        onRightPress={biometricEnable}
      />
    </View>
  );
};

export default Biometric;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  btnContainer: {
    marginTop: 20,
  },
  label: {
    ...TextTheme.label,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  biometricIconImg: {
    height: 150,
    width: '40%',
    alignSelf: 'center',
  },
});
