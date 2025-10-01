import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CredentialDetails from '../screens/CredentialDetails';
import TOTPView from '../screens/TOTP';
import { CredentialStackParams, PresentationStackParams, ScanStackParams, Screens } from '../types/navigators';

import defaultStackOptions from './defaultStackOptions';

const Stack = createStackNavigator<PresentationStackParams>();

const OtpStack: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.OTPGenerator}
        component={TOTPView}
        options={() => ({
          title: t<string>('ScreenTitles.OTPTokens'),
        })}
      />
    </Stack.Navigator>
  );
};

export default OtpStack;
