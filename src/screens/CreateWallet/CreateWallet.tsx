import Clipboard from '@react-native-clipboard/clipboard';
import { StackScreenProps } from '@react-navigation/stack';
import md5 from 'md5';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { InfoCard, Loader, ScreenNavigatorButtons } from '../../components';
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
  }, [t]);

  useEffect(() => {
    createMnemonic();
  }, [createMnemonic]);

  const copyMnemonic = async () => {
    Clipboard.setString(mnemonicText);
  };

  const onBack = async () => {
    navigation.navigate(Screens.Terms);
  };

  const startAgent = async () => {
    try {
      const keyHash = md5(mnemonicText);
      const agent = await useCreateAgent({
        walletConfig: {
          key: keyHash,
        },
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

  return (
    <View style={style.container}>
      <Loader loading={loading} />
      <Text style={style.label}>{t<string>('Mnemonic.MnemonicTitle')}</Text>
      <View style={style.container}>
        <InfoCard showBottomIcon={false} showTopIcon mnemonicText>
          <Text style={style.headerText}>{`${mnemonicText}\n`}</Text>
          {t<string>('Registration.MnemonicMsg')}
        </InfoCard>
        <Button
          buttonStyle={style.btnContainer}
          title={t<string>('Global.Copy')}
          buttonType={ButtonType.Primary}
          onPress={copyMnemonic}
        />
      </View>
      <ScreenNavigatorButtons
        onLeftPress={onBack}
        onRightPress={createWallet}
        isRightDisabled={
          mnemonicText === undefined || mnemonicText.length === 0
        }
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
  },
  headerText: {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
    flexShrink: 1,
  },
  btnContainer: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
