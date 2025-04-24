import {
  useAgent,
  useConnectionById,
  useCredentialByState,
  useProofByState,
} from '@credo-ts/react-hooks';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';

import { Agent, CredentialState, ProofState } from '@credo-ts/core';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Label } from '../../components';
import Accordion from '../../components/accordion/Accordion';
import { dateFormatOptions } from '../../constants';
import { CredentialRecord } from '../../hooks/agentUtils';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { ContactStackParams, Screens } from '../../types/navigators';
import { errorToast, successToast } from '../../utils/toast';

type ContactDetailsProps = StackScreenProps<
  ContactStackParams,
  Screens.ContactDetails
>;

const ContactDetails: React.FC<ContactDetailsProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { agent: agentUndefined } = useAgent();
  const agent = agentUndefined as Agent;
  const connection = useConnectionById(route.params.connectionId);
  const credentialOffers = useCredentialByState(CredentialState.OfferReceived);

  const proofs = useProofByState(ProofState.RequestReceived);
  const [history, setHistory] = useState<CredentialRecord[]>([]);
  useEffect(() => {
    navigation.setOptions({
      title: connection?.alias ?? connection?.theirLabel,
    });
  }, [connection, navigation]);

  credentialOffers.map((cred) => cred);

  const getConnectionHistory = useCallback(async () => {
    // Get proof records for a specific connection
    const connectionHistory = await agent.genericRecords.findAllByQuery({
      connectionId: connection?.id,
    });

    // Set empty array if no data is returned
    const credentialRecords: CredentialRecord[] =
      connectionHistory.length > 0
        ? (connectionHistory[0].content.records as CredentialRecord[])
        : [];

    // Combine credential and proof records into one array and filter with connection label
    const history = credentialRecords.filter(
      (record) => record.connectionLabel === connection?.theirLabel,
    );

    // Sort history by timestamp
    const sortedHistory = history.sort(
      (x, y) =>
        new Date(y.timestamp).valueOf() - new Date(x.timestamp).valueOf(),
    );
    if (sortedHistory) {
      setHistory(sortedHistory);
    }
  }, [agent.genericRecords, connection]);

  useEffect(() => {
    getConnectionHistory();
  }, [getConnectionHistory]);

  const showDeleteConnectionAlert = () => {
    Alert.alert(
      t<string>('ContactDetails.DeleteConnection'),
      t<string>('ContactDetails.DeleteConnectionAlert'),
      [
        {
          text: t<string>('Global.Cancel'),
          style: 'cancel',
        },
        { text: t<string>('Global.Okay'), onPress: deleteConnection },
      ],
    );
  };

  const deleteConnection = async () => {
    try {
      if (connection) {
        // Delete the connection by id
        for await (const offer of credentialOffers) {
          if (offer?.connectionId === connection?.id) {
            await agent.credentials.declineOffer(offer.id);
          }
        }

        for await (const proof of proofs) {
          if (proof?.connectionId === connection?.id) {
            await agent.proofs.declineRequest({ proofRecordId: proof.id });
          }
        }

        await agent.connections.deleteById(connection?.id);
        successToast(t<string>('ContactDetails.DeleteConnectionSuccess'));
        navigation.navigate(Screens.ListContacts);
      }
    } catch (error) {
      errorToast(t<string>('ContactDetails.DeleteConnectionFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Label title="Name" subtitle={connection?.theirLabel} />
      <Label title="Id" subtitle={connection?.id} />
      <Label title="Did" subtitle={connection?.did} />
      <Label
        title="Created"
        subtitle={connection?.createdAt.toLocaleDateString(
          'en-CA',
          dateFormatOptions,
        )}
      />
      <Label title="Connection State" subtitle={connection?.state} />
      {!connection?.theirLabel?.toUpperCase().includes('MEDIATOR') && (
        <TouchableOpacity
          testID="delete-contact"
          onPress={showDeleteConnectionAlert}
        >
          <Text
            style={[
              styles.footerText,
              styles.link,
              { color: ColorPallet.semantic.error },
            ]}
          >
            {t<string>('ContactDetails.DeleteConnection')}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={history}
        contentContainerStyle={styles.cardContainer}
        renderItem={({ item }) => (
          <View key={item.timestamp.toString()}>
            <Accordion
              title={item.connectionLabel}
              date={new Date(item.timestamp)}
              status={item.status}
              innerAccordion
              key={item.timestamp.toString()}
            >
              {Object.entries(item.attributes).map(([key, value]) => {
                return (
                  <View style={styles.attributeContainer}>
                    <Text style={styles.attribute}>{key}</Text>
                    <Text style={styles.attribute}>{value.toString()}</Text>
                  </View>
                );
              })}
            </Accordion>
            <View style={styles.divider} />
          </View>
        )}
        keyExtractor={(item) => item.timestamp.toString()}
      />
    </View>
  );
};

export default ContactDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  footerText: {
    ...TextTheme.normal,
    padding: 10,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
  cardContainer: {
    padding: 10,
    paddingBottom: 35,
  },
  divider: {
    borderBottomColor: ColorPallet.baseColors.lightGrey,
    borderBottomWidth: 1,
    width: '100%',
  },
  attribute: {
    width: '50%',
    color: ColorPallet.baseColors.black,
  },
  attributeContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
});
