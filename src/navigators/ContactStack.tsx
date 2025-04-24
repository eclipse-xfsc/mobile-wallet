import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ListContacts from '../screens/ListContacts';
import { ContactStackParams, Screens } from '../types/navigators';
import ContactDetails from '../screens/ContactDetails';

import defaultStackOptions from './defaultStackOptions';
import { ColorPallet } from '../theme/theme';


const Stack = createStackNavigator<ContactStackParams>();

const ContactStack: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.ListContacts}
        component={ListContacts}
        options={() => ({
          title: t<string>('ScreenTitles.ListContacts'),
          headerTintColor: ColorPallet.baseColors.white,
          headerShown: true,
          headerLeft: () => false,
          rightLeft: () => false,
        })}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={() => ({
          title: t<string>('ScreenTitles.ContactDetails'),
        })}
      />
    </Stack.Navigator>
  );
};

export default ContactStack;
