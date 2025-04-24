import type { StackScreenProps } from '@react-navigation/stack';

import { useAgent, useCredentialById } from '@credo-ts/react-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Accordion from '../../components/accordion/Accordion';
import CredentialCard from '../../components/misc/CredentialCard';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { CredentialStackParams, Screens } from '../../types/navigators';
import { RecordHistory } from '../../types/record';
import { credentialDefinition } from '../../utils/helpers';
import { errorToast, warningToast } from '../../utils/toast';
import DetailedCredentialCard from '../../components/misc/DetailedCredentialCard';

type CredentialDetailsProps = StackScreenProps<
  CredentialStackParams,
  Screens.CredentialDetails
>;

const CredentialDetails: React.FC<CredentialDetailsProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { credentialId } = route.params;
  const credential = useCredentialById(credentialId);
  const { agent } = useAgent();
  const [history, setHistory] = useState<RecordHistory[]>([]);

  const getCredentialHistory = useCallback(async () => {
    try {
      const data = await agent.genericRecords.findAllByQuery({
        credentialRecordId: credential?.credentials[0].credentialRecordId,
      });

      // TODO: need debugging to figure out what these are

      // Add all credential records to the history
      data?.forEach((record) => history.push(...record.content.records));

      // Filter out the credential records which have property credentialLabel
      const filteredHistory = history.filter(
        (record) => record?.credentialLabel,
      );

      // Sort history by timestamp
      const sortedHistory = filteredHistory.sort(
        (x, y) =>
          new Date(y.timestamp).valueOf() - new Date(x.timestamp).valueOf(),
      );

      setHistory(sortedHistory);
    } catch (error) {
      errorToast(t<string>('credential.get.error'));
    }
  }, [agent, credential, t]);

  useEffect(() => {
    getCredentialHistory();
  }, [getCredentialHistory]);

  if (!route.params.credentialId) {
    warningToast(t<string>('CredentialOffer.CredentialNotFound'));
    navigation.goBack();
    return null;
  }
  if (!credential) {
    errorToast(t<string>('CredentialOffer.CredentialNotFound'));
    navigation.goBack();
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {credential.credentialAttributes ? (
        <DetailedCredentialCard credential={credential} style={styles.credentialCardView} />
      ): (
        <CredentialCard credential={credential} style={styles.credentialCardView} />
      )}
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Info" innerAccordion={false}>
          <View>
            <View style={styles.innerContainer}>
              <Text style={styles.attribute}>Credential </Text>
              <Text style={styles.attribute}>
                {credentialDefinition(credential)?.split(':')[4]}
              </Text>
            </View>
            <View style={styles.divider} />
            {credential?.credentialAttributes?.map((item) => {
              return (
                <View style={styles.innerContainer}>
                  <Text style={styles.attribute}>{item.name}</Text>
                  <Text style={styles.attribute}>{item.value}</Text>
                </View>
              );
            })}
          </View>
        </Accordion>
      </View>
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Activities" innerAccordion={false}>
          {history.map((item, index) => {
            return (
              <View key={index}>
                <Accordion
                  title={item.connectionLabel}
                  date={new Date(item.timestamp)}
                  status={item.status}
                  innerAccordion
                >
                  {Object.entries(item.attributes).map(([key, value]) => {
                    return (
                      <View key={key} style={styles.innerContainer}>
                        <Text style={styles.attribute}>{key}</Text>
                        <Text style={styles.attribute}>{value.toString()}</Text>
                      </View>
                    );
                  })}
                </Accordion>
                {history.length - 1 !== index && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </Accordion>
      </View>
    </ScrollView>
  );
};

export default CredentialDetails;

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorPallet.baseColors.white,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cardIos: {
    backgroundColor: ColorPallet.baseColors.white,
    shadowColor: ColorPallet.baseColors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  safeArea: {
    flex: 1,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  hidden: {
    height: 0,
  },
  list: {
    overflow: 'hidden',
  },
  sectionTitle: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.baseColors.black,
    marginLeft: '5%',
  },
  sectionSubTitle: {
    ...TextTheme.caption,
    color: ColorPallet.baseColors.black,
    marginLeft: '5%',
  },
  sectionDescription: {
    ...TextTheme.caption,
    color: ColorPallet.baseColors.black,
    height: 30,
    marginLeft: '5%',
  },
  divider: {
    borderBottomColor: ColorPallet.baseColors.lightGrey,
    borderBottomWidth: 1,
    width: '100%',
  },
  credentialCardView: {
    marginHorizontal: 15,
    marginTop: 16,
  },
  innerContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  attribute: {
    width: '50%',
    color: ColorPallet.baseColors.black,
  },
  scrollView: {
    paddingBottom: 30,
  },
});
