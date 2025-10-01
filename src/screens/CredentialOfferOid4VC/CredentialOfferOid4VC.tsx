import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native'
import Toast from 'react-native-toast-message'
import CredentialDeclined from '../../assets/img/credential-declined.svg'
import CredentialPending from '../../assets/img/credential-pending.svg'
import CredentialSuccess from '../../assets/img/credential-success.svg'
import Button, { ButtonType } from '../../components/button/Button'
import FlowDetailModal from '../../components/modals/FlowDetailModal'
import { ToastType } from '../../components/toast/BaseToast'
import { ColorPallet, TextTheme } from '../../theme/theme'
import {
  CredentialStackParams,
  Screens,
  TabStacks,
} from '../../types/navigators'
import {
  DidKey,
  KeyDidCreateOptions,
  JwaSignatureAlgorithm,
  getJwkFromKey,
  W3cCredentialRecord,
  SdJwtVcRecord,
} from '@credo-ts/core'
import {
  OpenId4VciCredentialFormatProfile,
  OpenId4VciResolvedCredentialOffer,
} from '@credo-ts/openid4vc'
import { useAppAgent } from '../../hooks/useInitAgent'
import CredentialCard from '../../components/misc/CredentialCard'

const { width, height } = Dimensions.get('window')

type CredentialOffer4VciProps = StackScreenProps<
  CredentialStackParams,
  Screens.CredentialOfferOid4VC
>

const CredentialOfferOid4VC: React.FC<CredentialOffer4VciProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation()
  if (!route?.params) {
    throw new Error(t<string>('CredentialOffer.CredentialOfferParamsError'))
  }
  const { url } = route.params
  const { agent } = useAppAgent()

  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [resolvedOffer, setResolvedOffer] =
    useState<OpenId4VciResolvedCredentialOffer>()

  useEffect(() => {
    void (async () => {
      try {
        const resolvedCredentialOffer =
          await agent.modules.openId4VcHolder.resolveCredentialOffer(url)
        setResolvedOffer(resolvedCredentialOffer)
      } catch (e: unknown) {
        console.error('Resolve error', e)
        setError(t<string>('CredentialOffer.CredentialNotAvailable'))
      }
    })()
  }, [url, agent, t])

  const handleAcceptPress = async () => {
    try {
      if (!resolvedOffer) throw new Error('No resolved offer')

      setButtonsVisible(false)
      setPendingModalVisible(true)

      const credentials =
        await agent.modules.openId4VcHolder.acceptCredentialOfferUsingPreAuthorizedCode(
          resolvedOffer,
          {
            credentialBindingResolver: async ({
              supportedDidMethods,
              keyType,
              supportsAllDidMethods,
              supportsJwk,
              credentialFormat,
            }: {
              supportedDidMethods: string[]
              keyType: any
              supportsAllDidMethods: boolean
              supportsJwk: boolean
              credentialFormat: string
            }) => {
              if (
                supportsAllDidMethods ||
                supportedDidMethods?.includes('did:key')
              ) {
                const didResult = await agent.dids.create<KeyDidCreateOptions>({
                  method: 'key',
                  options: { keyType },
                })

                if (didResult.didState.state !== 'finished') {
                  throw new Error('DID creation failed.')
                }

                const didKey = DidKey.fromDid(didResult.didState.did)
                return {
                  method: 'did',
                  didUrl: `${didKey.did}#${didKey.key.fingerprint}`,
                }
              }

              if (
                supportsJwk &&
                credentialFormat === OpenId4VciCredentialFormatProfile.SdJwtVc
              ) {
                const key = await agent.wallet.createKey({ keyType })
                return { method: 'jwk', jwk: getJwkFromKey(key) }
              }

              throw new Error('Unable to create a key binding')
            },
            verifyCredentialStatus: false,
            allowedProofOfPossessionSignatureAlgorithms: [
              JwaSignatureAlgorithm.EdDSA,
              JwaSignatureAlgorithm.ES256,
            ],
          }
        )

      // Store the received credentials
      const records: Array<W3cCredentialRecord | SdJwtVcRecord> = []
      for (const credential of credentials) {
        if ('compact' in credential) {
          const record = await agent.sdJwtVc.store(credential.compact)
          records.push(record)
        } else {
          const record = await agent.w3cCredentials.storeCredential({
            credential,
          })
          records.push(record)
        }
      }

      setPendingModalVisible(false)
      setSuccessModalVisible(true)
    } catch (error: unknown) {
      console.error(error)
      setButtonsVisible(true)
      setPendingModalVisible(false)
      Toast.show({
        type: ToastType.Error,
        text1: 'OID Credential Error',
        text2: 'credential could not be received',
      })
    }
  }

  const handleDeclinePress = async () => {
    setDeclinedModalVisible(true)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          <Text style={styles.title}>
            {resolvedOffer?.metadata.issuer ||
              t<string>('ContactDetails.AContact')}
          </Text>{' '}
          {t<string>('CredentialOffer.IsOfferingYouACredential')}
        </Text>
      </View>

      {/* Content */}
      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>
            {error}
          </Text>
          <Button
            title="OK"
            onPress={() => navigation.pop()}
            buttonType={ButtonType.Primary}
          />
        </View>
      ) : (
        <>
          {/* Credential Cards */}
          {resolvedOffer && (
            <View style={{ height: height * 0.6 }}>
              <FlatList
                data={resolvedOffer.offeredCredentials}
                keyExtractor={(item, idx) => `${item.id}-${idx}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                renderItem={({ item }) => {
                  const config =
                    resolvedOffer.offeredCredentialConfigurations[item.id]
                  const display = (config as any)?.display?.[0]

                  return (
                    <View
                      style={{
                        width: width * 0.9,
                        height: height * 0.55,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CredentialCard
                        credential={config.vct}
                        name={display?.name}
                        issuerName={resolvedOffer.metadata.issuer}
                        title={display?.name || item.id}
                        backgroundColor={display?.background_color || '#fff'}
                        textColor={display?.text_color || '#000'}
                        logo={display?.logo?.uri}
                        style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
                      />
                    </View>
                  )
                }}
              />
            </View>
          )}

          {/* Footer Buttons */}
          <View style={{ padding: 20 }}>
            <Button
              title={t<string>('Global.Accept')}
              onPress={handleAcceptPress}
              disabled={!buttonsVisible}
              buttonType={ButtonType.Primary}
            />
            <View style={{ height: 10 }} />
            <Button
              title={t<string>('Global.Decline')}
              onPress={handleDeclinePress}
              disabled={!buttonsVisible}
              buttonType={ButtonType.Ghost}
            />
          </View>
        </>
      )}

      {/* Modals */}
      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialOnTheWay')}
        doneTitle={t<string>('Global.Cancel')}
        visible={pendingModalVisible}
        onDone={() => {}}
      >
        <CredentialPending style={{ marginVertical: 20 }} />
      </FlowDetailModal>

      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialAddedToYourWallet')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false)
          navigation.pop()
          navigation.getParent()?.navigate(TabStacks.CredentialStack, {
            screen: Screens.Credentials,
          })
        }}
      >
        <CredentialSuccess style={{ marginVertical: 20 }} />
      </FlowDetailModal>

      <FlowDetailModal
        title={t<string>('CredentialOffer.CredentialDeclined')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false)
          navigation.pop()
          navigation.navigate(Screens.Home)
        }}
      >
        <CredentialDeclined style={{ marginVertical: 20 }} />
      </FlowDetailModal>
    </View>
  )
}

export default CredentialOfferOid4VC

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
  title: {
    fontWeight: '600',
    fontSize: 18,
  },
})
