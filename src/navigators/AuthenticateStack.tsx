import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthenticateStackParams, Screens } from '../types/navigators';
import PinEnter from '../screens/PinEnter';

import defaultStackOptions from './defaultStackOptions';

interface AuthenticateStackProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Stack = createStackNavigator<AuthenticateStackParams>();

const AuthenticateStack: React.FC<AuthenticateStackProps> = ({
  setAuthenticated,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackOptions,
        presentation: 'transparentModal',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={Screens.EnterPin}
        component={PinEnter}
        initialParams={{ setAuthenticated }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticateStack;
