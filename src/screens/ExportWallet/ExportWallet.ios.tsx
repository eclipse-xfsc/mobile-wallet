import { WalletExportImportConfig } from '@credo-ts/core/build/types';
import { useAgent } from '@credo-ts/react-hooks';
import { useNavigation } from '@react-navigation/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { UserCredentials } from 'react-native-keychain';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'rn-fetch-blob';
import { Loader, TextInput } from '../../components';
import { ToastType } from '../../components/toast/BaseToast';

import Button, { ButtonType } from '../../components/button/Button';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { getPassphrase } from '../../utils/keychain';

const ExportWallet = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const { agent } = useAgent();
  const nav = useNavigation();

  const exportWallet = async () => {
    try {
      setLoading(true);

      const { fs } = RNFetchBlob;

      const documentDirectory = fs.dirs.DocumentDir;

      const zipDirectory = `${documentDirectory}/PCM_Backup`;

      const destFileExists = await fs.exists(zipDirectory);
      if (destFileExists) {
        await fs.unlink(zipDirectory);
      }

      const date = new Date();
      const dformat = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      const WALLET_FILE_NAME = `PCM_Wallet_${dformat}`;

      await fs
        .mkdir(zipDirectory)
        .then(() => console.log('generated'))
        .catch((err) => console.log('not generated', err));
      const encryptedFileName = `${WALLET_FILE_NAME}.wallet`;
      const encryptedFileLocation = `${zipDirectory}/${encryptedFileName}`;

      const passphraseEntry = (await getPassphrase()) as UserCredentials;

      const exportConfig: WalletExportImportConfig = {
        key: passphraseEntry.password,
        path: encryptedFileLocation,
      };

      await agent.wallet.export(exportConfig);

      const { success, message } = await Share.open({
        title: 'Share file',
        failOnCancel: false,
        saveToFiles: true,
        url: encryptedFileLocation,
      });

      if (success) {
        Toast.show({
          type: ToastType.Success,
          text1: t<string>('ExportWallet.WalletExportedPath'),
          text2: message,
        });
      }
      setLoading(false);
      nav.goBack();
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const compareMnemonic = async () => {
    const passphraseEntry = (await getPassphrase()) as UserCredentials;

    if (mnemonic !== '') {
      if (mnemonic === passphraseEntry.password) {
        Toast.show({
          type: ToastType.Success,
          text1: t<string>('Toasts.Success'),
          text2: t<string>('Settings.ValidMnemonic'),
        });
        await exportWallet();
      } else {
        Toast.show({
          type: ToastType.Error,
          text1: t<string>('Toasts.Error'),
          text2: t<string>('Settings.InvalidMnemonic'),
        });
      }
    } else {
      Toast.show({
        type: ToastType.Warn,
        text1: t<string>('Toasts.Warning'),
        text2: t<string>('Settings.MnemonicMsg'),
      });
    }
  };

  return (
    <View style={style.container}>
      <Loader loading={loading} />
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
      <Button
        title={t<string>('Settings.ExportWallet')}
        buttonType={ButtonType.Primary}
        onPress={compareMnemonic}
      />
    </View>
  );
};

export default ExportWallet;

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
