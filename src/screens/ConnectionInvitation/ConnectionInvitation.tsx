import { Agent } from '@credo-ts/core';
import { useAgent } from '@credo-ts/react-hooks';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ConnectionPending from '../../assets/img/connection-pending.svg';
import { Loader } from '../../components';
import Button, { ButtonType } from '../../components/button/Button';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { ScanStackParams, Screens, TabStacks } from '../../types/navigators';

interface ConnectionProps {
  navigation: StackNavigationProp<
    ScanStackParams,
    Screens.ConnectionInvitation
  >;
  route: RouteProp<ScanStackParams, Screens.ConnectionInvitation>;
}

const acceptConnection = async (connectionRecordId: string, agent: Agent) => {
  const connectionRecord =
    await agent.connections.returnWhenIsConnected(connectionRecordId);
  return connectionRecord;
};

const ConnectionInvitation: React.FC<ConnectionProps> = ({
  navigation,
  route,
}) => {
  const { agent } = useAgent();
  const [loading, setLoading] = useState(false);

  const handleAcceptPress = async (): Promise<void> => {
    const { connectionRecordId } = route.params;
    setLoading(true);

    const connectionRecord = await acceptConnection(connectionRecordId, agent);

    if (!connectionRecord?.id) {
      throw new Error(t<string>('Scan.ConnectionNotFound'));
    }
    setLoading(false);
    navigation.navigate(TabStacks.ConnectionStack);
  };

  const handleDeclinePress = () => {
    navigation.navigate(TabStacks.HomeStack);
  };

  return (
    <View style={[styles.container]}>
      <Loader loading={loading} />
      <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>
        {t<string>('ConnectionInvitation.ConsentMessage')}
      </Text>
      <View style={styles.spacer} />
      <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>
        {t<string>('ConnectionInvitation.VerifyMessage')}
      </Text>
      <ConnectionPending style={{ marginVertical: 20, alignSelf: 'center' }} />
      <View style={styles.spacer} />
      <View style={styles.topSpacer}>
        <Button
          title={t<string>('Global.Accept')}
          onPress={handleAcceptPress}
          buttonType={ButtonType.Primary}
        />
      </View>
      <View style={styles.topSpacer}>
        <Button
          title={t<string>('Global.Decline')}
          buttonType={ButtonType.Ghost}
          onPress={handleDeclinePress}
        />
      </View>
    </View>
  );
};

export default ConnectionInvitation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
    justifyContent: 'center',
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    alignSelf: 'center',
  },
  spacer: {
    height: 40,
    width: 50,
  },
  topSpacer: {
    paddingTop: 10,
  },
});
