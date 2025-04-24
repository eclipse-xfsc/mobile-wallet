import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ConnectionInvitation from '../screens/ConnectionInvitation';
import Home from '../screens/Home';
import ListContacts from '../screens/ListContacts';
import Scan from '../screens/Scan';
import { MainStackParams, Screens, Stacks } from '../types/navigators';
import TabStack from './TabStack';
import defaultStackOptions from './defaultStackOptions';

const Stack = createStackNavigator<MainStackParams>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ ...defaultStackOptions, headerShown: false }}
    >
      <Stack.Screen name={Stacks.TabStack} component={TabStack} />
      <Stack.Screen name={Screens.Home} component={Home} />
      <Stack.Screen
        name={Screens.Scan}
        options={{ presentation: 'modal' }}
        component={Scan}
      />

      {/* </Stack.Screen> */}
      <Stack.Screen
        name={Screens.ListContacts}
        component={ListContacts}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name={Screens.ConnectionInvitation}
        component={ConnectionInvitation}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
