import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import md5 from 'md5';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler, Keyboard, StyleSheet, View } from 'react-native';
import { Loader, TextInput } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { useCreateAgent } from '../../hooks/useInitAgent';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import { getPassphrase, getPincode } from '../../utils/keychain';
import { warningToast } from '../../utils/toast';
import {
  checkIfSensorAvailable,
  removeOnboardingCompleteStage,
  showBiometricPrompt,
} from './PinEnter.utils';

type PinEnterProps = StackScreenProps<OnboardingStackParams, Screens.EnterPin>;

const PinEnter: React.FC<PinEnterProps> = ({ navigation, route }) => {
  const { setAgent, setAuthenticated } = route.params;
  const [pin, setPin] = useState('');
  const [loginAttemtsFailed, setLoginAttemtsFailed] = useState(0);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const startAgent = useCallback(async () => {
    const passCodeCredentials = await getPassphrase();
    if (passCodeCredentials) {
      const newAgent = await useCreateAgent({
        walletConfig: {
          key: String(md5(passCodeCredentials.password)),
        },
      });
      setAgent(newAgent);
    }
  }, []);

  const checkBiometricIfPresent = useCallback(async () => {
    const { available } = await checkIfSensorAvailable();
    if (!available) return;

    const { success, error } = await showBiometricPrompt();
    if (success) {
      setLoading(true);
      await startAgent();
      setLoading(false);
      setAuthenticated(true);
    } else if (error) {
      warningToast(t<string>('Biometric.BiometricCancel'));
    }
  }, [setAuthenticated, startAgent, t]);

  useEffect(() => {
    checkBiometricIfPresent();
  }, [checkBiometricIfPresent]);

  const checkPin = async (pin: string) => {
    const passCodeCredentials = await getPincode();

    if (passCodeCredentials && pin === passCodeCredentials.password) {
      setLoading(true);
      await startAgent();
      setAuthenticated(true);
      setLoading(false);
    } else {
      warningToast(t<string>('PinEnter.IncorrectPin'));
      setLoginAttemtsFailed(loginAttemtsFailed + 1);
      if (loginAttemtsFailed === 5) {
        Alert.alert(t<string>('Registration.RegisterAgain'));
        navigation.navigate(Screens.EnterPin);
        await removeOnboardingCompleteStage();
      }
    }
  };

  return (
    <View style={[style.container]}>
      <Loader loading={loading} />
      <TextInput
        label={t<string>('Global.EnterPin')}
        accessible
        accessibilityLabel={t<string>('Global.EnterPin')}
        placeholder={t<string>('Global.SixDigitPin')}
        placeholderTextColor={ColorPallet.baseColors.lightGrey}
        maxLength={6}
        keyboardType="numeric"
        secureTextEntry
        value={pin}
        returnKeyType="done"
        onChangeText={(pin: string) => {
          setPin(pin.replace(/[^0-9]/g, ''));
          if (pin.length === 6) {
            Keyboard.dismiss();
          }
        }}
      />
      <Button
        title={t<string>('Global.Submit')}
        buttonType={ButtonType.Primary}
        onPress={() => checkPin(pin)}
      />
    </View>
  );
};

export default PinEnter;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  verticalSpacer: {
    marginVertical: 20,
    textAlign: 'center',
  },
});
