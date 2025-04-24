import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { useAgent } from '@credo-ts/react-hooks';
import { UserCredentials } from 'react-native-keychain';
import { ColorPallet } from '../../theme/theme';
import { TextInput, Loader } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { Screens, SettingStackParams } from '../../types/navigators';
import { warningToast, successToast } from '../../utils/toast';
import { KeychainStorageKeys } from '../../constants';
import { getValueFromKeychain, saveValueInKeychain } from '../../utils/generic';

type ChangePinProps = StackScreenProps<SettingStackParams, Screens.ChangePin>;

const ChangePin: React.FC<ChangePinProps> = () => {
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [pinTwo, setPinTwo] = useState('');
  const [pinThree, setPinThree] = useState('');
  const { t } = useTranslation();
  const { agent } = useAgent();

  const passcodeCreate = async (passcode: string) => {
    try {
      setLoading(true);
      const [guid, oldPasscode] = await Promise.all([
        new Promise(resolve => {
          resolve(getValueFromKeychain(KeychainStorageKeys.GUID));
        }),
        new Promise(resolve => {
          resolve(getValueFromKeychain(KeychainStorageKeys.Passcode));
        }),
        new Promise(resolve => {
          resolve(
            saveValueInKeychain(
              KeychainStorageKeys.Passcode,
              passcode,
              'passcode',
            ),
          );
        }),
      ]);
      setLoading(true);
      await agent?.shutdown();
      await agent?.wallet.rotateKey({
        id: (guid as UserCredentials).password,
        key: (oldPasscode as UserCredentials).password,
        rekey: passcode,
      });
      await agent?.initialize();
      await saveValueInKeychain(
        KeychainStorageKeys.Passcode,
        passcode,
        'passcode',
      );
      setLoading(false);
      successToast(t<string>('PinCreate.PinChange'));
    } catch (e: any) {
      Alert.alert(e);
      setLoading(false);
    }
  };

  const confirmEntry = async (
    oldPin: string,
    newPin: string,
    reEnterNewPin: string,
  ) => {
    const passcode = (await getValueFromKeychain(
      KeychainStorageKeys.Passcode,
    )) as UserCredentials;

    if (oldPin.length < 6 || newPin.length < 6) {
      warningToast(t<string>('PinCreate.PinMustBe6DigitsInLength'));
    } else if (newPin !== reEnterNewPin) {
      warningToast(t<string>('PinCreate.PinsEnteredDoNotMatch'));
    } else if (passcode.password !== oldPin) {
      warningToast(t<string>('PinCreate.ValidOldPin'));
    } else if (newPin === oldPin) {
      warningToast(t<string>('PinCreate.NewPinMatchWithOld'));
    } else {
      passcodeCreate(newPin);
    }
  };

  return (
    <View style={style.container}>
      <Loader loading={loading} />

      <TextInput
        label={t<string>('Global.OldPin')}
        placeholder={t<string>('Global.SixDigitPin')}
        placeholderTextColor={ColorPallet.baseColors.lightGrey}
        accessible
        accessibilityLabel={t<string>('Global.OldPin')}
        maxLength={6}
        autoFocus
        secureTextEntry
        keyboardType="number-pad"
        value={pin}
        onChangeText={setPin}
        returnKeyType="done"
      />
      <TextInput
        label={t<string>('Global.EnterNewPin')}
        accessible
        accessibilityLabel={t<string>('Global.EnterNewPin')}
        placeholder={t<string>('Global.SixDigitPin')}
        placeholderTextColor={ColorPallet.baseColors.lightGrey}
        maxLength={6}
        secureTextEntry
        keyboardType="number-pad"
        returnKeyType="done"
        value={pinTwo}
        onChangeText={(text: string) => {
          setPinTwo(text);
        }}
      />
      <TextInput
        label={t<string>('PinCreate.ReenterNewPin')}
        accessible
        accessibilityLabel={t<string>('PinCreate.ReenterNewPin')}
        placeholder={t<string>('Global.SixDigitPin')}
        placeholderTextColor={ColorPallet.baseColors.lightGrey}
        maxLength={6}
        secureTextEntry
        keyboardType="number-pad"
        returnKeyType="done"
        value={pinThree}
        onChangeText={(text: string) => {
          setPinThree(text);
          if (text.length === 6) {
            Keyboard.dismiss();
          }
        }}
      />
      <Button
        title={t<string>('PinCreate.ChangePin')}
        buttonType={ButtonType.Primary}
        onPress={() => {
          Keyboard.dismiss();
          confirmEntry(pin, pinTwo, pinThree);
        }}
      />
    </View>
  );
};

export default ChangePin;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
  },
});
