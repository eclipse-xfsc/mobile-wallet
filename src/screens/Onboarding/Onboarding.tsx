import {useFocusEffect} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  BackHandler,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import _Icon from 'react-native-vector-icons/MaterialIcons';
import Images from '../../assets';
import {ColorPallet, TextTheme} from '../../theme/theme';
import {OnboardingStackParams, Screens} from '../../types/navigators';
import {storeAppIntroCompleteStage} from './Onboarding.utils';

const Icon = _Icon as React.ElementType;

interface ISlide {
  key: number;
  title: string;
  text: string;
  image: ImageSourcePropType;
}

type OnboardingProps = StackScreenProps<
  OnboardingStackParams,
  Screens.Onboarding
>;

const Onboarding: React.FC<OnboardingProps> = ({navigation}) => {
  const {t} = useTranslation();

  const slides: ISlide[] = [
    {
      key: 1,
      title: t<string>('Onboarding.Slide1Title'),
      text: t<string>('Onboarding.Slide1Text'),
      image: Images.credentialListImage,
    },
    {
      key: 2,
      title: t<string>('Onboarding.Slide2Title'),
      text: t<string>('Onboarding.Slide2Text'),
      image: Images.scanToConnectImage,
    },
    {
      key: 3,
      title: t<string>('Onboarding.Slide3Title'),
      text: t<string>('Onboarding.Slide3Text'),
      image: Images.secureImage,
    },
  ];

  const renderItem = ({item}: {item: ISlide}) => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{item.title}</Text>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const keyExtractor = (item: ISlide) => item.title;

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon name="east" color={ColorPallet.grayscale.white} size={28} />
      </View>
    );
  };
  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="check"
          color={ColorPallet.grayscale.white}
          size={28}
          onPress={onDone}
        />
      </View>
    );
  };
  const renderSkipButton = () => {
    return (
      <View>
        <Text style={styles.textButton} onPress={onDone}>
          {t<string>('Global.Skip')}
        </Text>
      </View>
    );
  };
  const renderPrevButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon name="west" color={ColorPallet.grayscale.white} size={28} />
      </View>
    );
  };
  const onDone = async () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    await storeAppIntroCompleteStage();
    navigation.navigate(Screens.Terms);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <View style={{flex: 1}}>
      <AppIntroSlider
        activeDotStyle={{backgroundColor: ColorPallet.grayscale.darkGrey}}
        keyExtractor={keyExtractor}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        renderPrevButton={renderPrevButton}
        showPrevButton
        showSkipButton
        renderItem={renderItem}
        data={slides}
      />
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 10,
    flex: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 0.65,
    width: 300,
    height: 70,
    resizeMode: 'contain',
  },
  text: {
    ...TextTheme.normal,
    flexShrink: 1,
    textAlign: 'center',
  },
  title: {
    ...TextTheme.normal,
    flexShrink: 1,
    textAlign: 'center',
  },
  buttonCircle: {
    width: 44,
    height: 44,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    marginTop: 12,
    marginLeft: 5,
    ...TextTheme.normal,
  },
});
