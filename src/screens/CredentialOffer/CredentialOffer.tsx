import {
  CredentialFormat,
  CredentialState,
  GetCredentialFormatDataReturn,
} from '@credo-ts/core';
import {
  useAgent,
  useConnectionById,
  useCredentialById,
} from '@credo-ts/react-hooks';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CredentialDeclined from '../../assets/img/credential-declined.svg';
import CredentialPending from '../../assets/img/credential-pending.svg';
import CredentialSuccess from '../../assets/img/credential-success.svg';
import Button, { ButtonType } from '../../components/button/Button';
import CredentialCard from '../../components/misc/CredentialCard';
import FlowDetailModal from '../../components/modals/FlowDetailModal';
import Record from '../../components/record/Record';
import Title from '../../components/text/Title';
import { ToastType } from '../../components/toast/BaseToast';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { HomeStackParams, Screens, TabStacks } from '../../types/navigators';
import { credentialDefinition } from '../../utils/helpers';

type CredentialOfferProps = StackScreenProps<
  HomeStackParams,
  Screens.CredentialOffer
>;

const CredentialOffer: React.FC<CredentialOfferProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  if (!route?.params) {
    throw new Error(t<string>('CredentialOffer.CredentialOfferParamsError'));
  }
  const { credentialId } = route.params;
  const { agent } = useAgent();
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false);
  const [credentialRecord, setCredentialRecord] = useState<
    GetCredentialFormatDataReturn<CredentialFormat[]>
  >({});

  const credential = useCredentialById(credentialId);

  const connection = useConnectionById(credential?.connectionId);
  if (!agent) {
    throw new Error(t<string>('CredentialOffer.FetchAFJError'));
  }

  if (!credential) {
    throw new Error(t<string>('CredentialOffer.CredentialFetchError'));
  }

  const getCredentialData = useCallback(async () => {
    if (credential) {
      const credentialRecord = await agent.credentials.getFormatData(
        credential.id,
      );
      setCredentialRecord(credentialRecord);
    }
  }, [agent.credentials, credential]);

  useEffect(() => {
    getCredentialData();
  }, [getCredentialData]);

  useEffect(() => {
    if (credential.state === CredentialState.Declined) {
      setDeclinedModalVisible(true);
    }
  }, [credential]);

  // TODO: Fix this, don't think we need to use this API
  const saveCredentialInGenericRecords = useCallback(async () => {
    if (credential.state === CredentialState.Done) {
      const tags = {
        connectionId: connection?.id,
        credentialRecordId: credential.credentials[0].credentialRecordId,
        type: 'credential',
      };

      // GET credential attributes - only after having them accepted
      // TODO: look into this
      // const test = await agent.credentials.getFormatData(credential.credentials[0].credentialRecordId)

      const attributes: Record<string, string> = {};
      credential?.credentialAttributes?.forEach((attribute) => {
        attributes[attribute.name] = attribute.value;
      });
      const record = {
        status: 'issued',
        timestamp: new Date().getTime(),
        connectionLabel: connection?.theirLabel ?? 'Connection less credential',
        credentialLabel: credentialDefinition(credential)?.split(':')[4],
        attributes,
      };
      const content = { records: [record] };
      await agent.genericRecords.save({ content, tags });
    }
  }, [
    agent.genericRecords,
    connection?.id,
    connection?.theirLabel,
    credential,
  ]);

  useEffect(() => {
    if (
      credential.state === CredentialState.CredentialReceived ||
      credential.state === CredentialState.Done
    ) {
      if (pendingModalVisible) {
        setPendingModalVisible(false);
      }
      setSuccessModalVisible(true);
    }
    if (credential.state === CredentialState.Done) {
      saveCredentialInGenericRecords();
    }
  }, [credential.state, pendingModalVisible, saveCredentialInGenericRecords]);

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false);
      setPendingModalVisible(true);
      await agent.credentials.acceptOffer({
        credentialRecordId: credential.id,
      });
    } catch (error: unknown) {
      const credentialError = error as AriesFrameworkError;
      setButtonsVisible(true);
      setPendingModalVisible(false);
      Toast.show({
        type: ToastType.Error,
        text1: credentialError.name,
        text2: credentialError.message,
      });
    }
  };

  const handleDeclinePress = async () => {
    Alert.alert(
      t<string>('CredentialOffer.RejectThisCredential'),
      t<string>('Global.ThisDecisionCannotBeChanged'),
      [
        { text: t<string>('Global.Cancel'), style: 'cancel' },
        {
          text: t<string>('Global.Confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setButtonsVisible(false);
              await agent.credentials.declineOffer(credential.id);
            } catch (e: unknown) {
              Toast.show({
                type: ToastType.Error,
                text1: t<string>('CredentialOffer.RejectOfferTitle'),
                text2: t<string>('CredentialOffer.RejectOfferMessage'),
              });
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Record
        header={() => (
          <>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                <Title>
                  {connection?.theirLabel ||
                    t<string>('ContactDetails.AContact')}
                </Title>{' '}
                {t<string>('CredentialOffer.IsOfferingYouACredential')}
              </Text>
            </View>
            <CredentialCard
              credential={credential}
              style={{ marginHorizontal: 15, marginBottom: 16 }}
            />
          </>
        )}
        footer={() => (
          <View style={{ marginBottom: 30 }}>
            <View style={styles.footerButton}>
              <Button
                title={t<string>('Global.Accept')}
                onPress={handleAcceptPress}
                disabled={!buttonsVisible}
                buttonType={ButtonType.Primary}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t<string>('Global.Decline')}
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
                buttonType={ButtonType.Ghost}
              />
            </View>
          </View>
        )}
        attributes={credentialRecord?.offerAttributes}
      />
      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialOnTheWay')}
        doneTitle={t<string>('Global.Cancel')}
        visible={pendingModalVisible}
        onDone={() => {
          setPendingModalVisible(false);
        }}
      >
        <CredentialPending style={{ marginVertical: 20 }} />
      </FlowDetailModal>
      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialAddedToYourWallet')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false);
          navigation.pop();
          navigation.getParent()?.navigate(TabStacks.CredentialStack, {
            screen: Screens.Credentials,
          });
        }}
      >
        <CredentialSuccess style={{ marginVertical: 20 }} />
      </FlowDetailModal>
      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialDeclined')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false);
          navigation.pop();
          navigation.navigate(Screens.Home);
        }}
      >
        <CredentialDeclined style={{ marginVertical: 20 }} />
      </FlowDetailModal>
    </>
  );
};

export default CredentialOffer;

const styles = StyleSheet.create({
  headerTextContainer: {
    paddingHorizontal: 25,
    paddingVertical: 16,
    backgroundColor: ColorPallet.grayscale.white,
  },
  headerText: {
    backgroundColor: ColorPallet.grayscale.white,
    ...TextTheme.normal,
    flexShrink: 1,
  },
  footerButton: {
    paddingTop: 10,
    backgroundColor: ColorPallet.grayscale.white,
  },
});
