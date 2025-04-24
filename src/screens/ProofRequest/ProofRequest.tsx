import {
  AnonCredsProofFormatService,
  LegacyIndyProofFormatService,
  V1ProofProtocol,
} from '@credo-ts/anoncreds';
import {
  GetCredentialsForProofRequestReturn,
  ProofExchangeRecord,
  ProofState,
  V2ProofProtocol,
} from '@credo-ts/core';
import {
  useAgent,
  useConnectionById,
  useProofById,
} from '@credo-ts/react-hooks';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import ProofDeclined from '../../assets/img/proof-declined.svg';
import ProofPending from '../../assets/img/proof-pending.svg';
import ProofSuccess from '../../assets/img/proof-success.svg';
import Button, { ButtonType } from '../../components/button/Button';
import FlowDetailModal from '../../components/modals/FlowDetailModal';
import ProofRequestAttribute from '../../components/views/ProofRequestAttribute';
import { logCredentialPresentation } from '../../hooks/agentUtils';
import { useCreateAgent } from '../../hooks/useInitAgent';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { HomeStackParams, Screens, Stacks } from '../../types/navigators';
import { errorToast } from '../../utils/toast';
import { getRetrievedCredential } from './ProofRequest.utils';

type ProofRequestProps = StackScreenProps<
  HomeStackParams,
  Screens.ProofRequest
>;

/*
  creds -> proofFormats -> indy -> attributes -> 'KEY' ->
 */

type AgentType = Awaited<ReturnType<typeof useCreateAgent>>;

type GetCredentialsType = GetCredentialsForProofRequestReturn<
  (
    | V1ProofProtocol
    | V2ProofProtocol<
        (LegacyIndyProofFormatService | AnonCredsProofFormatService)[]
      >
  )[]
>;

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  if (!route?.params) {
    throw new Error(t<string>('ProofRequest.ProofRequestParamsError'));
  }

  const { proofId } = route.params;
  const { agent } = useAgent<AgentType>();
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false);

  const [retrievedCredentials, setRetrievedCredentials] =
    useState<GetCredentialsType>();

  const proof = useProofById(proofId);
  const connection = useConnectionById(
    proof?.connectionId ? proof.connectionId : '',
  );

  if (!agent) {
    throw new Error(t<string>('CredentialOffer.FetchAFJError'));
  }

  if (!proof) {
    throw new Error(t<string>('ProofRequest.FetchProofError'));
  }

  useEffect(() => {
    const updateRetrievedCredentials = async (proof: ProofExchangeRecord) => {
      const creds = await getRetrievedCredential(agent, proof);
      if (!creds) {
        throw new Error(
          t<string>('ProofRequest.RequestedCredentialsCouldNotBeFound'),
        );
      }
      setRetrievedCredentials(creds);
    };

    updateRetrievedCredentials(proof).catch(() => {
      errorToast(
        t<string>('ProofRequest.ProofUpdateErrorTitle'),
        t<string>('ProofRequest.ProofUpdateErrorMessage'),
      );
    });
  }, [agent.proofs, proof, t]);

  useEffect(() => {
    if (proof.state === ProofState.Done) {
      if (pendingModalVisible) {
        setPendingModalVisible(false);
      }
      setSuccessModalVisible(true);
    }
  }, [pendingModalVisible, proof]);

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      setDeclinedModalVisible(true);
    }
  }, [proof]);

  const anyRevoked = useMemo(() => {
    const attrs = (
      retrievedCredentials?.proofFormats.anoncreds ||
      retrievedCredentials?.proofFormats.indy
    )?.attributes;
    if (attrs) {
      Object.keys(attrs).reduce(
        (revocationStatus, attr) =>
          revocationStatus &&
          attrs[attr].reduce(
            (isRevoked, cred) => isRevoked && !cred.revoked,
            false,
          ),
        false,
      );
    }

    return false;
  }, [retrievedCredentials]);

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false);
      setPendingModalVisible(true);

      const credentials = await agent.proofs.selectCredentialsForRequest({
        proofRecordId: proof.id,
      });

      if (!credentials) {
        throw new Error(
          t<string>('ProofRequest.RequestedCredentialsCouldNotBeFound'),
        );
      }

      await agent.proofs.acceptRequest({
        proofRecordId: proof.id,
        proofFormats: credentials.proofFormats,
      });

      await logCredentialPresentation(agent, credentials, connection);

      setPendingModalVisible(false);
      setSuccessModalVisible(true);
    } catch (e: unknown) {
      setButtonsVisible(true);
      setPendingModalVisible(false);
      errorToast(
        t<string>('ProofRequest.ProofAcceptErrorTitle'),
        t<string>('ProofRequest.ProofAcceptErrorMessage'),
      );
    }
  };

  const handleDeclinePress = async () => {
    Alert.alert(
      t<string>('ProofRequest.RejectThisProof'),
      t<string>('Global.ThisDecisionCannotBeChanged'),
      [
        { text: t<string>('Global.Cancel'), style: 'cancel' },
        {
          text: t<string>('Global.Confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setButtonsVisible(false);
              await agent.proofs.declineRequest({
                proofRecordId: proof.id,
              });
            } catch (e: unknown) {
              errorToast(
                t<string>('ProofRequest.ProofRejectErrorTitle'),
                t<string>('ProofRequest.ProofRejectErrorMessage'),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {
          <>
            <Text
              style={TextTheme.normal}
              accessibilityLabel={t<string>('ProofRequest.Title', {
                connection: connection?.theirLabel ?? 'Verifier',
              })}
            >
              <Trans
                i18nKey="ProofRequest.Title"
                values={{
                  connection: connection?.theirLabel ?? 'Verifier',
                }}
                components={{
                  b: <Text style={{ fontWeight: 'bold' }} />,
                }}
                t={t}
              />
            </Text>

            {retrievedCredentials && (
              <View style={{ zIndex: 1 }}>
                <ProofRequestAttribute
                  credentials={retrievedCredentials}
                  onSelectItem={() => {}}
                />
              </View>
            )}
          </>
        }

        <View style={{ marginBottom: 30 }}>
          {!anyRevoked ? (
            <View style={styles.footerButton}>
              <Button
                title={t<string>('Global.Share')}
                buttonType={ButtonType.Primary}
                onPress={handleAcceptPress}
                disabled={!buttonsVisible}
              />
            </View>
          ) : null}
          <View style={styles.footerButton}>
            <Button
              title={t<string>('Global.Decline')}
              buttonType={anyRevoked ? ButtonType.Primary : ButtonType.Ghost}
              onPress={handleDeclinePress}
              disabled={!buttonsVisible}
            />
          </View>
        </View>
        {pendingModalVisible && (
          <FlowDetailModal
            title={t<string>('ProofRequest.SendingTheInformationSecurely')}
            visible={pendingModalVisible}
            doneHidden
          >
            <ProofPending style={{ marginVertical: 20 }} />
          </FlowDetailModal>
        )}

        {successModalVisible && (
          <FlowDetailModal
            title={t<string>('ProofRequest.InformationSentSuccessfully')}
            visible={successModalVisible}
            onDone={() => {
              setSuccessModalVisible(false);
              navigation.pop();
              navigation
                .getParent()
                ?.navigate(Stacks.TabStack, { screen: Screens.Home });
            }}
          >
            <ProofSuccess style={{ marginVertical: 20 }} />
          </FlowDetailModal>
        )}
        {declinedModalVisible && (
          <FlowDetailModal
            title={t<string>('ProofRequest.ProofRejected')}
            visible={declinedModalVisible}
            onDone={() => {
              setDeclinedModalVisible(false);
              navigation.pop();
              navigation
                .getParent()
                ?.navigate(Stacks.TabStack, { screen: Screens.Home });
            }}
          >
            <ProofDeclined style={{ marginVertical: 20 }} />
          </FlowDetailModal>
        )}
      </ScrollView>
    </View>
  );
};

export default ProofRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerTextContainer: {
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  footerButton: {
    paddingTop: 10,
  },
  link: {
    ...TextTheme.normal,
    minHeight: TextTheme.normal.fontSize,
    color: ColorPallet.brand.link,
    paddingVertical: 2,
  },
  valueContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
  missingInformationTitle: {
    ...TextTheme.headingFour,
    color: ColorPallet.notification.errorText,
    marginVertical: 10,
  },
});
