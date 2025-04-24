import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Image, ImageProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Buffer } from 'buffer';
import { useAgent } from '@credo-ts/react-hooks';
import useNotifications from '../hooks/notifications';
import { ColorPallet, TextTheme } from '../theme/theme';
import { Screens, TabStackParams, TabStacks } from '../types/navigators';
import SettingStack from './SettingStack';
import ContactStack from './ContactStack';
import CredentialStack from './CredentialStack';
import HomeStack from './HomeStack';
import Images from '../assets';
import { MainStackContext } from '../utils/helpers';

const MainTabNavigator = createBottomTabNavigator<TabStackParams>();

type TabBarIconProps = {
  focused: boolean;
  imageName: ImageProps['source'];
};

type TabBarLabelProps = {
  label: string;
};

const TabBarIcon = ({ imageName, focused }: TabBarIconProps) => {
  return (
    <View
      style={[
        styles.tabView,
        focused
          ? {
              borderWidth: 2,
              borderColor: ColorPallet.grayscale.white,
            }
          : {},
      ]}
    >
      <Image
        source={imageName}
        style={!focused ? styles.tabBarIcon : styles.tabBarIcon}
        resizeMode="contain"
      />
    </View>
  );
};

const TabBarLabel = ({ label }: TabBarLabelProps) => {
  return (
    <Text
      style={{
        ...TextTheme.label,
        fontWeight: 'normal',
        paddingBottom: 5,
        color: ColorPallet.grayscale.white,
      }}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
};

const ScannerIcon = () => {
  return (
    <View style={styles.scannerIconWrapper}>
      <Image
        source={Images.scanIcon}
        style={styles.scanIcon}
        resizeMode="contain"
      />
    </View>
  );
};

const TabStack: React.FC = () => {
  const navigation = useNavigation();
  const { total } = useNotifications();
  const { t } = useTranslation();
  const { agent } = useAgent();

  const { deepLinkUrl, resetDeepLinkUrl } = React.useContext(MainStackContext);
  useEffect(() => {
    if (!deepLinkUrl) {
      return;
    }
    (async () => {
      resetDeepLinkUrl();

      let message;
      const [, urlData] = deepLinkUrl.includes('?c_i')
        ? deepLinkUrl.split('?c_i=')
        : deepLinkUrl.split('?d_m=');
      message = JSON.parse(Buffer.from(urlData.trim(), 'base64').toString());

      if (message['~service']) {
        await agent?.receiveMessage(message);
        navigation.navigate(TabStacks.HomeStack);
      } else {
        navigation.navigate(Screens.ConnectionInvitation, { url: deepLinkUrl });
      }
    })();
  }, [deepLinkUrl, resetDeepLinkUrl, navigation, agent]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ColorPallet.brand.primary }}
    >
      <MainTabNavigator.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBarStyle,
          tabBarActiveTintColor: ColorPallet.baseColors.white,
          tabBarInactiveTintColor: ColorPallet.brand.primary,
          header: () => null,
          tabBarHideOnKeyboard: true,
          unmountOnBlur: true,
          tabBarShowLabel: true,
          tabBarLabelPosition: 'below-icon',
        }}
      >
        <MainTabNavigator.Screen
          name={TabStacks.HomeStack}
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} imageName={Images.homeIcon} />
            ),
            tabBarLabel: () => (
              <TabBarLabel label={t<string>('TabStack.Home')} />
            ),
            tabBarBadge: total > 0 ? total : undefined,
            tabBarBadgeStyle: {
              backgroundColor: ColorPallet.semantic.error,
            },
            tabBarIconStyle: {
              backgroundColor: ColorPallet.baseColors.white,
            },
            unmountOnBlur: true,
          }}
        />
        <MainTabNavigator.Screen
          name={TabStacks.ConnectionStack}
          component={ContactStack}
          options={{
            headerTitle: 'Connection',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                imageName={Images.connectionsIcon}
              />
            ),
            tabBarLabel: () => (
              <TabBarLabel label={t<string>('TabStack.Connections')} />
            ),
            unmountOnBlur: true,
          }}
        />
        <MainTabNavigator.Screen
          name={TabStacks.ScanStack}
          options={{
            tabBarIcon: () => <ScannerIcon />,
            tabBarLabel: () => (
              <TabBarLabel label={t<string>('TabStack.Scan')} />
            ),
            tabBarAccessibilityLabel: t<string>('TabStack.Scan'),
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate(Screens.Scan);
            },
          })}
        >
          {/* Just a placeholder, the the tab will navigate to a different stack */}
          {() => <View />}
        </MainTabNavigator.Screen>
        <MainTabNavigator.Screen
          name={TabStacks.CredentialStack}
          component={CredentialStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                imageName={Images.credentialsIcon}
              />
            ),
            tabBarLabel: () => (
              <TabBarLabel label={t<string>('TabStack.Credentials')} />
            ),
            unmountOnBlur: true,
          }}
        />
        <MainTabNavigator.Screen
          name={TabStacks.SettingsStack}
          component={SettingStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} imageName={Images.settingsIcon} />
            ),
            tabBarLabel: () => (
              <TabBarLabel label={t<string>('TabStack.Settings')} />
            ),
            unmountOnBlur: true,
          }}
        />
      </MainTabNavigator.Navigator>
    </SafeAreaView>
  );
};

export default TabStack;

const styles = StyleSheet.create({
  tabView: {
    height: 45,
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarStyle: {
    height: 80,
    backgroundColor: ColorPallet.brand.primary,
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  scannerIconWrapper: {
    height: 60,
    width: 60,
    backgroundColor: ColorPallet.baseColors.white,
    top: -10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarIcon: {
    height: 40,
    width: 40,
  },
  scanIcon: {
    height: 40,
    width: 40,
  },
});
