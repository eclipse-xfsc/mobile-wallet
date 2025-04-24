import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CredentialDetails from '../screens/CredentialDetails';
import ListCredentials from '../screens/ListCredentials';
import { CredentialStackParams, Screens } from '../types/navigators';

import defaultStackOptions from './defaultStackOptions';

const Stack = createStackNavigator<CredentialStackParams>();

const CredentialStack: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ({
          title: t<string>('ScreenTitles.Credentials'),
        })}
      />
    </Stack.Navigator>
  );
};

export default CredentialStack;
