import React from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { CredentialState } from '@credo-ts/core';
import { useCredentialByState } from '@credo-ts/react-hooks';
import { ColorPallet, TextTheme } from '../../theme/theme';
import useNotifications from '../../hooks/notifications';
import { HomeStackParams, Screens } from '../../types/navigators';
import InfoTextBox from '../../components/text/InfoTextBox';
import { NotificationListItem } from '../../components';
import { NotificationType } from '../../components/listItems/NotificationListItem';

const { width } = Dimensions.get('window');

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>;

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { notifications } = useNotifications();
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ];
  const emptyListComponent = () => (
    <View style={{ marginTop: 24, marginHorizontal: offset, width: width - 2 * offset }}>
      <InfoTextBox showIcon>
        <Text style={TextTheme.normal}>{t<string>('Home.NoNewUpdates')}</Text>
      </InfoTextBox>
    </View>
  );

  const displayMessage = (credentialCount: number) => {
    if (typeof credentialCount === 'undefined') {
      throw new Error(t<string>('Home.CredentialCountUndefinedError'));
    }

    let credentialMsg;

    if (credentialCount === 1) {
      credentialMsg = (
        <Text>
          {t<string>('Home.YouHave')}{' '}
          <Text style={{ fontWeight: 'bold' }}>{credentialCount}</Text>{' '}
          {t<string>('Home.Credential')} {t<string>('Home.InYourWallet')}
        </Text>
      );
    } else if (credentialCount > 1) {
      credentialMsg = (
        <Text>
          {t<string>('Home.YouHave')}{' '}
          <Text style={{ fontWeight: 'bold' }}>{credentialCount}</Text>{' '}
          {t<string>('Home.Credentials')} {t<string>('Home.InYourWallet')}
        </Text>
      );
    } else {
      credentialMsg = t<string>('Home.NoCredentials');
    }

    return (
      <View style={[styles.messageContainer]}>
        {credentialCount === 0 ? (
          <Text
            style={[
              TextTheme.headingTwo,
              { marginTop: offset, marginBottom: 35 },
            ]}
          >
            {t<string>('Home.Welcome')}
          </Text>
        ) : null}
        <Text
          style={[TextTheme.normal, { marginTop: offset, textAlign: 'center' }]}
        >
          {credentialMsg}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.rowContainer}>
        {notifications.length > 0 && (
          <Text style={[TextTheme.headingFour, styles.header]}>
            {t<string>('Home.Notifications')}
            {notifications.length ? ` (${notifications.length})` : ''}
          </Text>
        )}
        {notifications?.length > 1 ? (
          <TouchableOpacity
            style={styles.linkContainer}
            activeOpacity={1}
            onPress={() => navigation.navigate(Screens.Notifications)}
          >
            <Text style={styles.link}>{t<string>('Home.SeeAll')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={notifications.length > 0}
        snapToOffsets={[
          0,
          ...Array(notifications.length)
            .fill(0)
            .map(
              (n: number, i: number) =>
                i * (width - 2 * (offset - offsetPadding)),
            )
            .slice(1),
        ]}
        decelerationRate="fast"
        ListEmptyComponent={emptyListComponent()}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: width - 3.5 * offset,
              marginLeft: !index ? offset : offsetPadding,
              marginRight:
                index === notifications.length - 1 ? offset : offsetPadding,
            }}
          >
            {item.type === 'CredentialRecord' ? (
              <NotificationListItem
                key={item.id}
                notificationType={NotificationType.CredentialOffer}
                notification={item}
              />
            ) : (
              <NotificationListItem
                key={item.id}
                notificationType={NotificationType.ProofRequest}
                notification={item}
              />
            )}
          </View>
        )}
      />
      <View style={styles.container}>{displayMessage(credentials.length)}</View>
    </View>
  );
};

export default Home;

const offset = 25;
const offsetPadding = 5;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: offset,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: offset,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginHorizontal: 20,
  },
  header: {
    marginTop: offset,
    marginBottom: 20,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    marginTop: 10,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
});
