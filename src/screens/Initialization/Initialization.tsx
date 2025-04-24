import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import Images from '../../assets';
import { IconButton, InfoCard } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { OnboardingStackParams, Screens } from '../../types/navigators';

type InitializationProps = StackScreenProps<
  OnboardingStackParams,
  Screens.Initialization
>;

const Initialization: React.FC<InitializationProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const onSubmit = async () => {
    navigation.navigate(Screens.CreateWallet);
  };

  const onImportWallet = () => {
    navigation.navigate(Screens.ImportWallet);
  };

  const onBack = () => {
    navigation.goBack();
  };
  return (
    <View style={[style.container]} testID="Initialization-id">
      <View style={[style.textContainer]}>
        <Text style={TextTheme.normal}>
          {t<string>('Initialization.CompleteInitialization')}
        </Text>
      </View>
      <View style={[style.flexColumnContainer]}>
        <View style={[style.flexRowContainer]}>
          <View style={[style.imgContainer]}>
            <Image source={Images.importIcon} style={style.pinImg} />
          </View>
          <View style={[style.btnContainer]}>
            <Button
              title={t<string>('Initialization.ImportWalletBtn')}
              buttonType={ButtonType.Primary}
              onPress={onImportWallet}
            />
          </View>
        </View>
        <View style={[style.flexRowContainer]}>
          <View style={[style.imgContainer]}>
            <Image source={Images.initializeIcon} style={style.pinImg} />
          </View>
          <View style={[style.btnContainer]}>
            <Button
              title={t<string>('Initialization.InitializationBtn')}
              buttonType={ButtonType.Primary}
              onPress={onSubmit}
            />
          </View>
        </View>
      </View>
      <View style={style.info}>
        <InfoCard showBottomIcon={false} showTopIcon>
          {t<string>('Initialization.InitializationInfo')}
        </InfoCard>
      </View>
      <IconButton isRight={false} isDisabled={false} onPress={onBack} />
    </View>
  );
};

export default Initialization;

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
    justifyContent: 'space-between',
    flex: 1,
  },
  btnContainer: {
    flex: 0.8,
  },
  info: {
    marginTop: 20,
  },
  label: {
    ...TextTheme.label,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pinImg: {
    height: 40,
    width: 50,
    padding: 5,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  textContainer: {
    flex: 0.1,
    alignItems: 'center',
  },
  flexColumnContainer: {
    flexDirection: 'column',
    flex: 0.5,
  },
  flexRowContainer: {
    flex: 1,
    flexDirection: 'row',
    margin: 20,
  },
  imgContainer: {
    flex: 0.2,
  },
});
