import { WalletExportImportConfig } from '@credo-ts/core/build/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { t } from 'i18next';
import md5 from 'md5';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  PermissionsAndroid,
  StyleSheet,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { UserCredentials } from 'react-native-keychain';
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'rn-fetch-blob';
import { Loader, Text, TextInput } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { ToastType } from '../../components/toast/BaseToast';
import { LocalStorageKeys } from '../../constants';
import { useCreateAgent } from '../../hooks/useInitAgent';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import { getPassphrase, setPasshprase } from '../../utils/keychain';

type ImportWalletProps = StackScreenProps<
  OnboardingStackParams,
  Screens.ImportWallet
>;

const ImportWallet: React.FC<ImportWalletProps> = ({ navigation, route }) => {
  const { setAgent, setAuthenticated } = route.params;
  const [mnemonic, setMnemonic] = useState('');
  const [walletBackupFilePath, setwalletBackupFIlePath] = useState('');
  const [loading, setLoading] = useState(false);

  const storeOnboardingCompleteStage = async () => {
    await AsyncStorage.setItem(
      LocalStorageKeys.OnboardingCompleteStage,
      'true',
    );
  };

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigation.goBack();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [navigation]);

  const askPermission = async () => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ])
      .then((result) => {
        if (
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          pickBackupFile();
        }
      })
      .catch((error) => {
        Toast.show({
          type: ToastType.Error,
          text1: t<string>('Toasts.Warning'),
          text2: t<string>(error),
        });
      });
  };

  const pickBackupFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      });
      if (res.fileCopyUri) {
        RNFetchBlob.fs
          .stat(res.fileCopyUri)
          .then((stats) => {
            setwalletBackupFIlePath(stats.path);
            // output: /storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20200831-WA0019.jpg
          })
          .catch((err: any) => {
            Toast.show({
              type: ToastType.Error,
              text1: t<string>('Toasts.Warning'),
              text2: t<string>(err),
            });
          });
      }
      // const exportedFileContent = await RNFS.readFile(res.uri, 'base64')
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
      const keychainEntry = (await getPassphrase()) as UserCredentials;

      const importConfig: WalletExportImportConfig = {
        key: String(md5(mnemonic)),
        path: walletBackupFilePath,
      };

      const walletConfig = {
        key: String(md5(keychainEntry.password)),
      };

      try {
        const agent = await useCreateAgent({
          walletConfig,
          importConfig,
        });
        await storeOnboardingCompleteStage();

        await setPasshprase(mnemonic);
        setAuthenticated(true);
        setLoading(false);
        setAgent(agent);
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
            askPermission();
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
