console.log(">>> ViewMnemonic.tsx wurde geladen <<<");
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  Share,
  TouchableOpacity,
} from 'react-native';
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

  const shareMnemonic = async () => {
    try {
      await Share.share({
        message: mnemonicText,
      });
    } catch (error) {
      warningToast(t<string>('Global.ShareError'));
    }
  };

  return (
    <View style={style.container}>
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
          <View style={style.mnemonicBox}>
            <Text style={style.mnemonicText}>{mnemonicText}</Text>
          </View>
          <Text style={style.bodyText}>
            {t<string>('Registration.MnemonicMsg')}
          </Text>

          <View style={style.buttonRow}>
            <View>
              <Button
                title={t<string>('Global.Share')}
                buttonType={ButtonType.Primary}
                onPress={shareMnemonic}
              />
            </View>
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
    flex: 1,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mnemonicBox: {
    backgroundColor: ColorPallet.baseColors.lightGrey,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  mnemonicText: {
    ...TextTheme.normal,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: ColorPallet.grayscale.black,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
