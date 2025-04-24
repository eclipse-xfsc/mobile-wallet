import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CredentialOffer from '../screens/CredentialOffer';
import Home from '../screens/Home';
import ListNotifications from '../screens/ListNotifications';
import ProofRequest from '../screens/ProofRequest';
import { HomeStackParams, Screens } from '../types/navigators';
import defaultStackOptions from './defaultStackOptions';
import CredentialOfferOid4VC from '../screens/CredentialOfferOid4VC';

const Stack = createStackNavigator<HomeStackParams>();

const HomeStack: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t<string>('ScreenTitles.Home'),
        })}
      />
      <Stack.Screen
        name={Screens.Notifications}
        component={ListNotifications}
        options={() => ({
          title: t<string>('ScreenTitles.Notifications'),
        })}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={() => ({
          title: t<string>('ScreenTitles.CredentialOffer'),
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={() => ({
          title: t<string>('ScreenTitles.ProofRequest'),
        })}
      />
       <Stack.Screen
        name={Screens.CredentialOfferOid4VC}
        component={CredentialOfferOid4VC}
        options={() => ({
          title: t<string>('ScreenTitles.CredentialOffer'),
        })}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
