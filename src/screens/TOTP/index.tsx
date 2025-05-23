import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import {
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MainStackParams, Screens } from '../../types/navigators';
import { OTPItem, useGetOtpList, useOtpGenerator } from './totpUtils';

import { ColorPallet, TextTheme } from '../../theme/theme';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

type OTPGeneratorProps = StackScreenProps<
  MainStackParams,
  Screens.OTPGenerator
>;

type TOTPItemProps = {
  item: OTPItem;
  removeOtpItem: (item: string) => void;
};

const itemStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serviceItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    justifyContent: 'center',
    alignContent: 'center',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: ColorPallet.baseColors.black,
  },
  otp: {
    fontSize: 26,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 5,
    color: ColorPallet.baseColors.black,
  },
  expiresIn: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: ColorPallet.baseColors.lightBlue,
    padding: 10,
    borderRadius: 5,
    flexGrow: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  buttonDelete: {
    // red hex color= #dc3545
    backgroundColor: ColorPallet.baseColors.red,
    padding: 10,
    borderRadius: 5,
    flexGrow: 1,
    marginHorizontal: 5,
  },
  progress: {
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  noItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noItemsText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    textAlign: 'justify',
  },
});

const TOTPItem: React.FC<TOTPItemProps> = ({ item, removeOtpItem }) => {
  const { label, otp, timeInfo } = useOtpGenerator(item);

  const copyToClipboard = (otp: string) => {
    Clipboard.setString(otp);
  };
  return (
    <View key={label} style={itemStyles.serviceItem}>
      <Text style={itemStyles.serviceName}>{label}</Text>
      <Text style={itemStyles.otp}>{otp.otp}</Text>
      <View style={itemStyles.expiresIn}>
        <AnimatedCircularProgress
          size={50}
          width={8}
          duration={1000}
          fill={timeInfo.progress}
          tintColor="#ffffff"
          backgroundColor="#5892ef"
          padding={10}
          style={itemStyles.progress}
        >
          {() => <Text>{timeInfo.remainingTime}</Text>}
        </AnimatedCircularProgress>
      </View>
      <View style={itemStyles.buttonsContainer}>
        <TouchableOpacity
          style={itemStyles.button}
          onPress={() => copyToClipboard(otp.otp)}
        >
          <Text style={itemStyles.buttonText}>Copy OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={itemStyles.buttonDelete}
          onPress={() => removeOtpItem(label)}
        >
          <Text style={itemStyles.buttonText}>Delete Issuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TOTPView: React.FC<OTPGeneratorProps> = ({ route }) => {
  const { url } = route.params;

  const { addOtpItem, removeOtpItem } = useGetOtpList();
  const { t } = useTranslation();

  useEffect(() => {
    console.log("OTP Url shall be added: "+url)
    if (url) {
       addOtpItem(url);
    }
  }, [url]);


  const { otpList} = useGetOtpList();

  return (
    <ScrollView style={viewStyles.container}>
      {otpList.length > 0 ? (
        otpList.map((item, index) => (
          <TOTPItem
            key={index.toString()}
            item={item}
            removeOtpItem={removeOtpItem}
          />
        ))
      ) : (
        <View style={viewStyles.noItems}>
          <Text style={viewStyles.noItemsText}>
            {t<string>('OTPTokens.NoTokens')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default TOTPView;
