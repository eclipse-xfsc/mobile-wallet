import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Toast from 'react-native-toast-message';
// @ts-ignore
import {
  WalletConfig,
  WalletExportImportConfig,
} from '@credo-ts/core/build/types';
import { useAgent } from '@credo-ts/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import RNFS from 'react-native-fs';
import { UserCredentials } from 'react-native-keychain';
import { Loader, Text, TextInput } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { ToastType } from '../../components/toast/BaseToast';
import { LocalStorageKeys } from '../../constants';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import { getAppGuid, getPincode, setPasshprase } from '../../utils/keychain';

type ImportWalletProps = StackScreenProps<
  OnboardingStackParams,
  Screens.ImportWallet
>;

const ImportWallet: React.FC<ImportWalletProps> = ({ route }) => {
  const { t } = useTranslation();
  const { setAuthenticated } = route.params;
  const [mnemonic, setMnemonic] = useState('');
  const [walletBackupFilePath, setWalletBackupFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const { agent } = useAgent();

  const storeOnboardingCompleteStage = async () => {
    await AsyncStorage.setItem(
      LocalStorageKeys.OnboardingCompleteStage,
      'true',
    );
  };

  const pickBackupFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      });

      RNFS.stat(res.uri)
        .then((stats) => {
          // https://github.com/react-native-image-picker/react-native-image-picker/issues/107#issuecomment-443420588
          setWalletBackupFilePath(stats.path.replace('file://', ''));
        })
        .catch((err) => {
          Toast.show({
            type: ToastType.Error,
            text1: t<string>('Toasts.Warning'),
            text2: t<string>(err),
          });
        });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        Toast.show({
          type: ToastType.Error,
          text1: t<string>('Toasts.Warning'),
          text2: t<string>(err),
        });
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        Toast.show({
          type: ToastType.Error,
          text1: t<string>('Toasts.Warning'),
          text2: t<string>(err),
        });
      }
    }
  };

  const importWallet = async () => {
    if (mnemonic.length === 0) {
      Toast.show({
        type: ToastType.Warn,
        text1: t<string>('Toasts.Warning'),
        text2: t<string>('ImportWallet.EmptyMnemonic'),
      });
    } else {
      setLoading(true);
      const guidEntry = (await getAppGuid()) as UserCredentials;
      const keychainEntry = (await getPincode()) as UserCredentials;

      const importConfig: WalletExportImportConfig = {
        key: mnemonic,
        path: walletBackupFilePath,
      };

      const walletConfig: WalletConfig = {
        id: guidEntry.password,
        key: keychainEntry.password,
      };

      try {
        await agent.wallet.import(walletConfig, importConfig);
        await agent.wallet.initialize(walletConfig);
        await agent.initialize();
        await storeOnboardingCompleteStage();
        await setPasshprase(mnemonic);
        setAuthenticated(true);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        Toast.show({
          type: ToastType.Error,
          text1: t<string>('Toasts.Warning'),
          text2: t<string>('ImportWallet.ImportError'),
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      <View style={styles.btnContainer}>
        <Button
          title={t<string>('ImportWallet.SelectWalletFile')}
          buttonType={ButtonType.Primary}
          onPress={() => {
            Keyboard.dismiss();
            pickBackupFile();
          }}
        />
      </View>
      <Text style={styles.label}>{walletBackupFilePath}</Text>
      <TextInput
        label={t<string>('Settings.EnterMnemonic')}
        placeholder={t<string>('Settings.EnterMnemonic')}
        placeholderTextColor={ColorPallet.brand.primary}
        accessible
        accessibilityLabel={t<string>('Settings.EnterMnemonic')}
        autoFocus
        value={mnemonic}
        onChangeText={setMnemonic}
        autoCapitalize="none"
        returnKeyType="done"
      />
      <View style={styles.btnContainer}>
        <Button
          title={t<string>('Global.ImportWallet')}
          buttonType={ButtonType.Primary}
          disabled={walletBackupFilePath.length === 0 && mnemonic.length === 0}
          onPress={importWallet}
        />
      </View>
    </View>
  );
};

export default ImportWallet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
  },
  label: {
    ...TextTheme.normal,
    fontWeight: 'bold',
  },
  btnContainer: {
    marginTop: 20,
  },
});
