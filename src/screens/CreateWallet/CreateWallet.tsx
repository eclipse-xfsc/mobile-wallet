import Clipboard from '@react-native-clipboard/clipboard';
import { StackScreenProps } from '@react-navigation/stack';
import md5 from 'md5';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Share } from 'react-native';
import { Loader, ScreenNavigatorButtons } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { useCreateAgent } from '../../hooks/useInitAgent';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import { getMnemonicArrayFromWords } from '../../utils/generic';
import { setPasshprase } from '../../utils/keychain';
import { errorToast, successToast } from '../../utils/toast';
import { storeOnboardingCompleteStage } from './CreateWallet.utils';

type CreateWalletProps = StackScreenProps<
  OnboardingStackParams,
  Screens.CreateWallet
>;

const CreateWallet: React.FC<CreateWalletProps> = ({ navigation, route }) => {
  const [mnemonicText, setMnemonicText] = useState('');
  const { setAgent } = route.params;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const createMnemonic = useCallback(async () => {
    const mnemonicWordsList = getMnemonicArrayFromWords(8);
    const mnemonic = mnemonicWordsList.join(' ');

    setPasshprase(mnemonic).then(() => {
      setMnemonicText(mnemonic);
    });
  }, []);

  useEffect(() => {
    createMnemonic();
  }, [createMnemonic]);

  const copyMnemonic = async () => {
    Clipboard.setString(mnemonicText);
    successToast(t<string>('Global.Copied'));
  };

  const shareMnemonic = async () => {
    try {
      await Share.share({ message: mnemonicText });
    } catch (e: any) {
      errorToast(e?.message || t<string>('Global.ShareError'));
    }
  };

  const onBack = async () => {
    navigation.navigate(Screens.Terms);
  };

  const startAgent = async () => {
    try {
      const keyHash = md5(mnemonicText);
      const agent = await useCreateAgent({
        walletConfig: { key: keyHash },
      });
      await storeOnboardingCompleteStage();
      successToast(t<string>('PinCreate.WalletCreated'));
      navigation.navigate(Screens.SetupDelay);
      setAgent(agent);
    } catch (error: any) {
      setLoading(false);
      errorToast(error.message);
    }
  };

  const createWallet = async () => {
    setLoading(true);
    await startAgent();
    setLoading(false);
  };

  const isMnemonicReady = !!mnemonicText && mnemonicText.length > 0;

  return (
    <View style={style.container}>
      <Loader loading={loading} />
      <Text style={style.label}>{t<string>('Mnemonic.MnemonicTitle')}</Text>

      <View style={style.mnemonicBox}>
        <Text style={style.mnemonicText}>{mnemonicText}</Text>
        <Text style={style.mnemonicHint}>
          {t<string>('Registration.MnemonicMsg')}
        </Text>
      </View>

      <View style={style.buttonRow}>
        <View style={style.buttonColRight}>
          <Button
            title={t<string>('Global.Share')}
            buttonType={ButtonType.Primary} // kein Secondary nötig
            onPress={shareMnemonic}
          />
        </View>
      </View>

      <ScreenNavigatorButtons
        onLeftPress={onBack}
        onRightPress={createWallet}
        isRightDisabled={!isMnemonicReady}
      />
    </View>
  );
};

export default CreateWallet;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    flex: 1,
    margin: 20,
  },
  label: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  // modernes, dezentes "Card"-Layout fürs Mnemonic
  mnemonicBox: {
    backgroundColor: ColorPallet.baseColors.lightGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  mnemonicText: {
    ...TextTheme.normal,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: ColorPallet.grayscale.black,
    marginBottom: 8,
  },
  mnemonicHint: {
    ...TextTheme.normal,
    textAlign: 'center',
  },

  // zwei Buttons nebeneinander, ohne 'gap' (kompatibel)
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonColLeft: {
    flex: 1,
    marginRight: 8,
  },
  buttonColRight: {
    flex: 1,
    marginLeft: 8,
  },
});
