import Clipboard from '@react-native-clipboard/clipboard';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { UserCredentials } from 'react-native-keychain';
import { TextInput } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { KeychainStorageKeys } from '../../constants';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { getValueKeychain } from '../../utils/keychain';
import { warningToast } from '../../utils/toast';
import {
  authenticateUser,
  checkIfSensorAvailable,
  showBiometricPrompt,
} from './ViewMnemonic.utils';

const ViewMnemonic: React.FC = () => {
  const [pin, setPin] = useState('');
  const [showMnemonicView, setMnemonicView] = useState(false);
  const [mnemonicText, setMnemonic] = useState('');
  const { t } = useTranslation();

  const checkBiometricIfPresent = useCallback(async () => {
    const { available } = await checkIfSensorAvailable();
    if (available) {
      const { success, error } = await showBiometricPrompt();
      if (success) {
        showMnemonic();
      } else if (error) {
        warningToast(error);
      } else {
        warningToast(t<string>('Biometric.BiometricCancel'));
      }
    }
  }, [t]);

  useEffect(() => {
    checkBiometricIfPresent();
  }, [checkBiometricIfPresent]);

  const checkPin = async (pin: string) => {
    const passcode = (await getValueKeychain({
      service: 'passcode',
    })) as UserCredentials;

    const params = [pin, passcode.password];
    const result = authenticateUser(params);
    if (result) {
      showMnemonic();
    } else {
      warningToast(t<string>('PinEnter.IncorrectPin'));
    }
  };

  const showMnemonic = async () => {
    const passphraseEntry = (await getValueKeychain({
      service: KeychainStorageKeys.Passphrase,
    })) as UserCredentials;

    setMnemonic(passphraseEntry.password);
    setMnemonicView(true);
  };

  const copyMnemonic = async () => {
    Clipboard.setString(mnemonicText);
  };

  return (
    <View style={[style.container]}>
      {!showMnemonicView && (
        <>
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
            onPress={() => {
              Keyboard.dismiss();
              checkPin(pin);
            }}
          />
        </>
      )}
      {showMnemonicView && (
        <>
          <Text style={style.label}>Mnemonic</Text>
          <View style={style.boxContainer}>
            <Text style={style.headerText}>{mnemonicText}</Text>
            <Text style={style.bodyText}>
              {t<string>('Registration.MnemonicMsg')}
            </Text>
            <Button
              title={t<string>('Global.Copy')}
              buttonType={ButtonType.Primary}
              onPress={copyMnemonic}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default ViewMnemonic;

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
  subContainer: {
    backgroundColor: ColorPallet.grayscale.white,
    flex: 1,
    margin: 20,
  },
  boxContainer: {
    backgroundColor: ColorPallet.notification.info,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: ColorPallet.notification.infoBorder,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    ...TextTheme.normal,
    fontWeight: 'bold',
  },
  headerText: {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
    flexShrink: 1,
  },
});
