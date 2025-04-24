import {
  useAgent
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
import { HomeStackParams, MainStackParams, ScanStackParams, Screens, TabStacks } from '../../types/navigators';
import { DidKey, KeyDidCreateOptions, JwaSignatureAlgorithm, getJwkFromKey,W3cCredentialRecord,SdJwtVcRecord } from '@credo-ts/core'
import { OpenId4VciCredentialFormatProfile,OpenId4VciResolvedCredentialOffer, } from '@credo-ts/openid4vc'
import { err } from 'react-native-svg/lib/typescript/xml';

type CredentialOffer4VciProps = StackScreenProps<
  HomeStackParams,
  Screens.CredentialOfferOid4VC
>;

const CredentialOffer: React.FC<CredentialOffer4VciProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  if (!route?.params) {
    throw new Error(t<string>('CredentialOffer.CredentialOfferParamsError'));
  }
  const { url } = route.params;
  const { agent } = useAgent();
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false);

  const [resolvedOffer, setResolvedOffer] = useState<OpenId4VciResolvedCredentialOffer | undefined>()

  useEffect(() => {
    void (async () => {
      try {
        console.log(url)
        const resolvedCredentialOffer = await agent.modules.openId4VcHolder.resolveCredentialOffer(url)
        setResolvedOffer(resolvedCredentialOffer)
        console.log("DEBUG: Credential Offer was:")
        console.log(resolvedCredentialOffer)
      }
      catch (e:unknown) {
        console.log("Promise Error")
        console.log(e)
      }
    })()
  },[])

  //console.log("DEBUG: Credential Offer was:")
  //console.log(resolvedOffer)

  /*if (!credential) {
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
*/

  const handleAcceptPress = async () => {
    try {
      if (resolvedOffer != undefined) {
        throw new Error('Something went wrong')
      }

      setButtonsVisible(false);
      setPendingModalVisible(true);
    
      await agent.modules.openId4VcHolder.acceptCredentialOfferUsingPreAuthorizedCode(
        // First parameter is now the resolved credential offer
        resolvedOffer,
        {
          // has been renamed from proofOfPossessionVerificationMethodResolver to credentialBindingResolver
          credentialBindingResolver: async ({
            supportedDidMethods,
            keyType,
            supportsAllDidMethods,
            // supportsJwk now also passed
            supportsJwk,
            credentialFormat,
          }) => {
            // NOTE: example implementation. Adjust based on your needs
            // Return the binding to the credential that should be used. Either did or jwk is supported
    
            if (supportsAllDidMethods || supportedDidMethods?.includes('did:key')) {
              const didResult = await agent.dids.create<KeyDidCreateOptions>({
                method: 'key',
                options: {
                  keyType,
                },
              })
    
              if (didResult.didState.state !== 'finished') {
                throw new Error('DID creation failed.')
              }
    
              const didKey = DidKey.fromDid(didResult.didState.did)
    
              // you now need to return an object instead of VerificationMethod instance
              // and method 'did' or 'jwk'
              return {
                method: 'did',
                didUrl: `${didKey.did}#${didKey.key.fingerprint}`,
              }
            }
    
            // we also support plain jwk for sd-jwt only
            if (supportsJwk && credentialFormat === OpenId4VciCredentialFormatProfile.SdJwtVc) {
              const key = await agent.wallet.createKey({
                keyType,
              })
    
              // you now need to return an object instead of VerificationMethod instance
              // and method 'did' or 'jwk'
              return {
                method: 'jwk',
                jwk: getJwkFromKey(key),
              }
            }
    
            throw new Error('Unable to create a key binding')
          },
    
          verifyCredentialStatus: false,
          allowedProofOfPossessionSignatureAlgorithms: [JwaSignatureAlgorithm.EdDSA, JwaSignatureAlgorithm.ES256],
        }
      )

    console.log('Received credentials', JSON.stringify(credentials, null, 2))

    // Store the received credentials
    const records: Array<W3cCredentialRecord | SdJwtVcRecord> = []
    for (const credential of credentials) {
      if ('compact' in credential) {
        const record = await agent.modules.openId4VcHolder.sdJwtVc.store(credential.compact)
        records.push(record)
      } else {
        const record = await agent.modules.openId4VcHolder.w3cCredentials.storeCredential({
          credential,
        })
        records.push(record)
      }
    }

    } catch (error: unknown) {
      console.log(error)
      setButtonsVisible(true);
      setPendingModalVisible(false);
      Toast.show({
        type: ToastType.Error,
        text1: "OID Credential Error",
        text2: "credential could not be received",
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
              navigation.navigate(Screens.Home)
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
                  {resolvedOffer?.metadata.issuer ||
                    t<string>('ContactDetails.AContact')}
                </Title>{' '}
                {t<string>('CredentialOffer.IsOfferingYouACredential')}
                 {resolvedOffer?.offeredCredentials.toString()}
              </Text>
            </View>
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
