import { Agent } from '@credo-ts/core';
import { useAgent } from '@credo-ts/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBuildNumber, getVersion } from 'react-native-device-info';
import Keychain from 'react-native-keychain';
import { Loader, SettingListItem, Text } from '../components';
import { ColorPallet, TextTheme, borderRadius } from '../theme/theme';
import { Screens, SettingStackParams } from '../types/navigators';

type SettingsProps = StackScreenProps<SettingStackParams, Screens.Settings> & {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings: React.FC<SettingsProps> = ({
  navigation,
  setAuthenticated,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { agent: agentUndefined } = useAgent();
  const agent = agentUndefined as Agent;
  const logoff = () =>
    Alert.alert(t<string>('Settings.Logout'), t<string>('Settings.LogoutMsg'), [
      {
        text: t<string>('Global.Yes'),
        onPress: () => setAuthenticated(false),
      },
      { text: t<string>('Global.No') },
    ]);

  const clearData = async () => {
    try {
      setLoading(true);
      await agent.wallet.delete();
      await agent.shutdown();
      await AsyncStorage.clear();
      const services = await Keychain.getAllGenericPasswordServices();
      for (let i = 0; i < services.length; i++) {
        await Keychain.resetGenericPassword({
          service: services[i],
        });
      }
      setAuthenticated(false);
    } catch (e: any) {
      Alert.alert(e.message);
    }
    setLoading(false);
  };

  const removeAllData = () => {
    Alert.alert(
      t<string>('Settings.RemoveDataButton'),
      t<string>('Settings.RemoveDataMsg'),
      [
        {
          text: t<string>('Global.Yes'),
          onPress: clearData,
        },
        { text: t<string>('Global.No') },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Loader loading={loading} />
      <Text style={styles.groupHeader}>
        {t<string>('Settings.AppPreferences')}
      </Text>
      <SettingListItem
        title={t<string>('Settings.ChangePin')}
        onPress={() => navigation.navigate(Screens.ChangePin)}
      />
      <SettingListItem
        title={t<string>('Settings.Language')}
        onPress={() => navigation.navigate(Screens.Language)}
      />
      <SettingListItem
        title={t<string>('Settings.ViewMnemonic')}
        onPress={() => navigation.navigate(Screens.ViewMnemonic)}
      />
      <SettingListItem
        title={t<string>('Settings.ExportWallet')}
        onPress={() => navigation.navigate(Screens.ExportWallet)}
      />
      <SettingListItem
        title={t<string>('Settings.LoginToken')}
        onPress={() =>
          navigation.navigate(Screens.OTPGenerator, {
            url: undefined,
          })
        }
      />
      <SettingListItem
        title={t<string>('Settings.LegalAndPrivacy')}
        onPress={() => navigation.navigate(Screens.LegalAndPrivacy)}
      />
      <SettingListItem title={t<string>('Settings.Logout')} onPress={logoff} />
      <Text style={styles.groupHeader}>{t<string>('Settings.AboutApp')}</Text>
      <View style={styles.rowGroup}>
        <View style={styles.row}>
          <Text style={styles.bodyText}>{t<string>('Settings.Version')}</Text>
          <Text
            style={styles.bodyText}
          >{`${getVersion()}.${getBuildNumber()}`}</Text>
        </View>
      </View>
      <Text style={styles.removeDataTitle}>
        {t<string>('Settings.RemoveDataTitle')}
      </Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={removeAllData}>
        <Text style={styles.deleteBtnText}>
          {t<string>('Settings.RemoveDataButton')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  groupHeader: {
    ...TextTheme.normal,
    marginBottom: 8,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    color: ColorPallet.baseColors.black,
  },
  rowGroup: {
    borderRadius: borderRadius * 2,
    backgroundColor: ColorPallet.baseColors.lightBlue,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  removeDataTitle: {
    ...TextTheme.normal,
    marginBottom: 16,
    marginTop: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteBtn: {
    borderRadius: borderRadius,
    backgroundColor: ColorPallet.semantic.error,
    marginBottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  deleteBtnText: {
    ...TextTheme.normal,
    flexShrink: 1,
    color: ColorPallet.baseColors.white,
    fontWeight: 'bold',
  },
});
