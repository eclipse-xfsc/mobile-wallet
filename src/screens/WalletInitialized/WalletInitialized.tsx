import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OnboardingStackParams, Screens } from '../../types/navigators';
import { IconButton } from '../../components';
import { ColorPallet, TextTheme } from '../../theme/theme';
import Images from '../../assets';

type WalletInitializedProps = StackScreenProps<
  OnboardingStackParams,
  Screens.WalletInitialized
>;

const WalletInitialized: React.FC<WalletInitializedProps> = ({ route }) => {
  const { setAuthenticated } = route.params;
  const { t } = useTranslation();

  const onBack = async () => {
    setAuthenticated(true);
  };

  return (
    <View style={[style.container]}>
      <View style={[style.subcontainer]}>
        <Text style={TextTheme.normal}>
          {t<string>('Registration.WalletInitialized')}
        </Text>
        <Image
          source={Images.walletInitializedIcon}
          style={style.biometricIconImg}
          resizeMode="contain"
        />
      </View>
      <View style={[style.btnContainer]}>
        <IconButton isRight onPress={onBack} />
      </View>
    </View>
  );
};

export default WalletInitialized;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    flex: 1,
    marginTop: 20,
  },
  biometricIconImg: {
    height: 200,
    width: '70%',
    alignSelf: 'center',
    margin: 20,
  },
  subcontainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  btnContainer: {
    alignItems: 'flex-end',
    margin: 20,
  },
});
