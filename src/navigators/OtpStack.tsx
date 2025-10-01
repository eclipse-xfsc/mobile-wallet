import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TOTPView from '../screens/TOTP';
import { OtpStackParams, Screens } from '../types/navigators';

import defaultStackOptions from './defaultStackOptions';

const Stack = createStackNavigator<OtpStackParams>();

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
