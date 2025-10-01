import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MainStackParams, OtpStackParams, Screens } from '../../types/navigators';
import { OTPItem, useGetOtpList, useOtpGenerator } from './totpUtils';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

type OTPGeneratorProps = StackScreenProps<OtpStackParams, Screens.OTPGenerator>;

type TOTPItemProps = {
  item: OTPItem;
  removeOtpItem: (id: string) => void;
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  expiresIn: {
    marginBottom: 10,
    alignItems: 'center',
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
    backgroundColor: ColorPallet.baseColors.red,
    padding: 10,
    borderRadius: 5,
    flexGrow: 1,
    marginHorizontal: 5,
  },
  progress: {
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    ...TextTheme.normal,
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  otp: {
    fontSize: 26,
    fontWeight: '500',
    marginLeft: 16,   // Abstand zwischen Kreis und OTP
    textAlign: 'center',
    letterSpacing: 5,
  },
});

const TOTPItem: React.FC<TOTPItemProps> = ({ item, removeOtpItem }) => {
  const { label, otp, timeInfo } = useOtpGenerator(item);

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
  };

  return (
    <View style={itemStyles.serviceItem}>
      <Text style={itemStyles.serviceName}>{label}</Text>

      {/* OTP + Timer nebeneinander */}
      <View style={itemStyles.otpRow}>
        <AnimatedCircularProgress
          size={50}
          width={6}
          duration={1000}
          fill={timeInfo.progress}
          tintColor={ColorPallet.baseColors.lightBlue}
          backgroundColor="#eee"
        >
          {() => <Text>{timeInfo.remainingTime}s</Text>}
        </AnimatedCircularProgress>

        <Text style={itemStyles.otp}>{otp}</Text>
      </View>

      <View style={itemStyles.buttonsContainer}>
        <TouchableOpacity
          style={itemStyles.button}
          onPress={() => copyToClipboard(otp)}
        >
          <Text style={itemStyles.buttonText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={itemStyles.buttonDelete}
          onPress={() => removeOtpItem(label)}
        >
          <Text style={itemStyles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const TOTPView: React.FC<OTPGeneratorProps> = ({ route }) => {
  const { t } = useTranslation();
  const { url } = route.params ?? {};
  const { otpList, addOtpItem, removeOtpItem } = useGetOtpList();

  useEffect(() => {
    if (url) {
      addOtpItem(url);
    }
  }, [url]);

  return (
    <ScrollView style={itemStyles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {otpList.length > 0 ? (
        otpList.map((item, index) => (
          <TOTPItem key={index.toString()} item={item} removeOtpItem={removeOtpItem} />
        ))
      ) : (
        <View style={itemStyles.emptyContainer}>
          <Text style={itemStyles.emptyText}>{t('Otp.NoTokens')}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default TOTPView;
