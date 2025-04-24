import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChangePin from '../screens/ChangePin';
import ExportWallet from '../screens/ExportWallet';
import Settings from '../screens/Settings';
import { Screens, SettingStackParams } from '../types/navigators';

import Language from '../screens/Language';
import LegalAndPrivacy from '../screens/LegalAndPrivacy';
import TOTPView from '../screens/TOTP';
import ViewMnemonic from '../screens/ViewMnemonic';
import { MainStackContext } from '../utils/helpers';
import defaultStackOptions from './defaultStackOptions';

const Stack = createStackNavigator<SettingStackParams>();

interface SettingStackProp {}

const SettingStack: React.FC<SettingStackProp> = () => {
  const { t } = useTranslation();
  const { setAuthenticated } = React.useContext(MainStackContext);
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Settings}
        options={() => ({
          title: t<string>('ScreenTitles.Settings'),
        })}
      >
        {(props) => <Settings {...props} setAuthenticated={setAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen
        name={Screens.Language}
        component={Language}
        options={() => ({
          title: t<string>('ScreenTitles.Language'),
        })}
      />
      <Stack.Screen
        name={Screens.ExportWallet}
        component={ExportWallet}
        options={() => ({
          title: t<string>('ScreenTitles.ExportWallet'),
        })}
      />
      <Stack.Screen
        name={Screens.ViewMnemonic}
        component={ViewMnemonic}
        options={() => ({
          title: t<string>('ScreenTitles.ViewMnemonic'),
        })}
      />
      <Stack.Screen
        name={Screens.OTPGenerator}
        component={TOTPView}
        options={() => ({
          title: t<string>('ScreenTitles.OTPTokens'),
        })}
      />
      <Stack.Screen
        name={Screens.ChangePin}
        component={ChangePin}
        options={{
          title: t<string>('ScreenTitles.ChangePin'),
        }}
      />
      <Stack.Screen
        name={Screens.LegalAndPrivacy}
        component={LegalAndPrivacy}
        options={{
          title: t<string>('ScreenTitles.LegalAndPrivacy'),
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingStack;
