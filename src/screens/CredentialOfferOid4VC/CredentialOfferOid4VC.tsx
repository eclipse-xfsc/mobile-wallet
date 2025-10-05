import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import RNFS from 'react-native-fs'
import ImageResizer from 'react-native-image-resizer'
import CredentialDeclined from '../../assets/img/credential-declined.svg'
import CredentialPending from '../../assets/img/credential-pending.svg'
import CredentialSuccess from '../../assets/img/credential-success.svg'
import Button, { ButtonType } from '../../components/button/Button'
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
  W3cCredentialRepository,
  SdJwtVcRepository,
  W3cCredentialRecord,
  SdJwtVcRecord,
} from '@credo-ts/core'
import {
  OpenId4VciCredentialFormatProfile,
  OpenId4VciResolvedCredentialOffer,
} from '@credo-ts/openid4vc'
import { useAppAgent } from '../../hooks/useInitAgent'
import CredentialCard from '../../components/misc/CredentialCard'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedOffer, setResolvedOffer] =
    useState<OpenId4VciResolvedCredentialOffer>()

  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  // ---------- Load Offer ----------
  useEffect(() => {
    void (async () => {
      try {
        const resolvedCredentialOffer =
          await agent.modules.openId4VcHolder.resolveCredentialOffer(url)
        setResolvedOffer(resolvedCredentialOffer)
      } catch (e: unknown) {
        console.error('Resolve error', e)
        setError(t<string>('CredentialOffer.CredentialNotAvailable'))
      } finally {
        setLoading(false)
      }
    })()
  }, [url, agent, t])

  // ---------- Accept ----------
  const handleAcceptPress = async () => {
      try {
        if (!resolvedOffer) throw new Error('No resolved offer')
        console.log('Hide Buttons and show Pending')
        setButtonsVisible(false)
        setPendingModalVisible(true)

        // Kleine Pause, um Modal anzuzeigen
        await new Promise((resolve) => setTimeout(resolve, 100))

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

        for (const credential of credentials) {
        // ---------- W3C ----------
        if (!('compact' in credential)) {
          const record: W3cCredentialRecord = await agent.w3cCredentials.storeCredential({ credential })
          const repository = agent.dependencyManager.resolve(W3cCredentialRepository)

          const offeredConfig =
            resolvedOffer.offeredCredentialConfigurations?.[credential.id]
          const displayConfig = offeredConfig?.display?.[0]
          const issuerDisplay =
            resolvedOffer.metadata?.credentialIssuerMetadata?.display?.[0]

          const displayData: any = {
            name: displayConfig?.name || credential.id,
            description: displayConfig?.description,
            issuer: {
              name:
                issuerDisplay?.name ||
                resolvedOffer.metadata?.issuer ||
                'Unknown',
              logo: issuerDisplay?.logo
                ? { uri: issuerDisplay.logo.uri || issuerDisplay.logo.url }
                : undefined,
            },
            background_image: displayConfig?.background_image
              ? {
                  uri:
                    displayConfig.background_image.uri ||
                    displayConfig.background_image.url,
                }
              : undefined,
            background_color: displayConfig?.background_color,
            text_color: displayConfig?.text_color,
          }

          // ---------- Lade Hintergrundbild & speichere lokal ----------
          let localUri = ''
          if (displayData.background_image?.uri) {
            try {
              const localPath = `${RNFS.DocumentDirectoryPath}/bg-${record.id}.jpg`
              await RNFS.downloadFile({
                fromUrl: displayData.background_image.uri,
                toFile: localPath,
              }).promise

              const resized = await ImageResizer.createResizedImage(
                `file://${localPath}`,
                1200,
                800,
                'JPEG',
                80
              )

              localUri = resized.uri
            } catch (err) {
              console.warn('⚠️ Background image download failed:', err)
            }
          }

          // ---------- Tags speichern ----------
          record.setTag('displayName', displayData.name || '')
          record.setTag('displayIssuer', displayData.issuer.name || '')
          record.setTag('displayDescription', displayData.description || '')
          record.setTag('backgroundImage', localUri || '')
          record.setTag('backgroundColor', displayData.background_color || '')
          record.setTag('textColor', displayData.text_color || '')

          // ---------- Record speichern ----------
          await repository.update(agent.context, record)
          continue
        }

        // ---------- SD-JWT ----------
        const record: SdJwtVcRecord = await agent.sdJwtVc.store(credential.compact)
        const repository = agent.dependencyManager.resolve(SdJwtVcRepository)
        
        const offeredConfig =
          resolvedOffer.offeredCredentialConfigurations?.[credential.id]
        const displayConfig = offeredConfig?.display?.[0]
        const issuerDisplay =
          resolvedOffer.metadata?.credentialIssuerMetadata?.display?.[0]

        const displayData: any = {
          name: displayConfig?.name || credential.id,
          description: displayConfig?.description,
          issuer: {
            name:
              issuerDisplay?.name ||
              resolvedOffer.metadata?.issuer ||
              'Unknown',
            logo: issuerDisplay?.logo
              ? { uri: issuerDisplay.logo.uri || issuerDisplay.logo.url }
              : undefined,
          },
          background_image: displayConfig?.background_image
            ? {
                uri:
                  displayConfig.background_image.uri ||
                  displayConfig.background_image.url,
              }
            : undefined,
          background_color: displayConfig?.background_color,
          text_color: displayConfig?.text_color,
        }

        // ---------- Lade Hintergrundbild & speichere lokal ----------
        let localUri = ''
        if (displayData.background_image?.uri) {
          try {
            const localPath = `${RNFS.DocumentDirectoryPath}/bg-${record.id}.jpg`
            await RNFS.downloadFile({
              fromUrl: displayData.background_image.uri,
              toFile: localPath,
            }).promise

            const resized = await ImageResizer.createResizedImage(
              `file://${localPath}`,
              1200,
              800,
              'JPEG',
              80
            )

            localUri = resized.uri
          } catch (err) {
            console.warn('⚠️ Background image download failed:', err)
          }
        }

        // ---------- Tags speichern ----------
        record.setTag('displayName', displayData.name || '')
        record.setTag('displayIssuer', displayData.issuer.name || '')
        record.setTag('displayDescription', displayData.description || '')
        record.setTag('backgroundImage', localUri || '')
        record.setTag('backgroundColor', displayData.background_color || '')
        record.setTag('textColor', displayData.text_color || '')

        // ---------- Record speichern ----------
        await repository.update(agent.context, record)
      }


        // ---------- UI / Navigation ----------
        setPendingModalVisible(false)
        setSuccessModalVisible(true)

        setTimeout(() => {
          setSuccessModalVisible(false)
          navigation.popToTop()
          navigation.getParent()?.navigate(TabStacks.CredentialStack, {
            screen: Screens.Credentials,
          })
        }, 1500)
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


  // ---------- Decline ----------
  const handleDeclinePress = () => setDeclinedModalVisible(true)

  // ---------- Render ----------
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text>{t<string>('Global.Loading')}...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <Button
          title="OK"
          onPress={() => navigation.pop()}
          buttonType={ButtonType.Primary}
        />
      </View>
    )
  }

  const CARD_MAX_HEIGHT = 260

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          <Text style={styles.title}>
            {resolvedOffer?.metadata.credentialIssuerMetadata.display?.[0]
              .name || t<string>('ContactDetails.AContact')}
          </Text>{' '}
          {t<string>('CredentialOffer.IsOfferingYouACredential')}
        </Text>
      </View>

      {/* Credential Cards */}
      {resolvedOffer?.offeredCredentials?.length ? (
        <FlatList
          data={resolvedOffer.offeredCredentials}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
          renderItem={({ item }) => {
            const config =
              resolvedOffer.metadata.credentialIssuerMetadata
                .credential_configurations_supported[item.id]
            const display = (config as any)?.display?.[0]
            const cardWidth = width * 0.9
            const cardHeight = Math.min(cardWidth * (9 / 16), CARD_MAX_HEIGHT)
            return (
              <View
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: width * 0.05,
                }}
              >
                <CredentialCard
                  credential={config?.vct || item.vct}
                  name={display?.name}
                  issuerName={
                    resolvedOffer?.metadata.credentialIssuerMetadata.display?.[0]
                      .name as string
                  }
                  description={display?.description}
                  backgroundColor={display?.background_color || '#fff'}
                  textColor={display?.text_color || '#000'}
                  backgroundImage={
                    display?.background_image
                      ? {
                          uri:
                            display.background_image.uri ||
                            display.background_image.url,
                        }
                      : display?.logo
                      ? { uri: display.logo.uri || display.logo.url }
                      : undefined
                  }
                  logo={
                    display?.logo
                      ? { uri: display.logo.uri || display.logo.url }
                      : undefined
                  }
                  style={{ borderRadius: 16, overflow: 'hidden' }}
                />
              </View>
            )
          }}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={{ color: 'gray' }}>
            {t<string>('CredentialOffer.NoCredentials')}
          </Text>
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

      {/* ---------- Modals ---------- */}
      {pendingModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <CredentialPending width={96} height={96} />
            <Text style={styles.modalText}>
              {t<string>('CredentialOffer.CredentialOnTheWay') ||
                'Credential is being processed...'}
            </Text>
          </View>
        </View>
      )}

      {successModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <CredentialSuccess width={96} height={96} />
            <Text style={styles.modalText}>
              {t<string>('CredentialOffer.CredentialAddedToYourWallet') ||
                'Credential added successfully!'}
            </Text>
          </View>
        </View>
      )}

      {declinedModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <CredentialDeclined width={96} height={96} />
            <Text style={styles.modalText}>
              {t<string>('CredentialOffer.CredentialDeclined') ||
                'Credential offer declined'}
            </Text>
            <View style={{ marginTop: 16 }}>
              <Button
                title="OK"
                onPress={() => {
                  setDeclinedModalVisible(false)
                  navigation.popToTop()
                }}
                buttonType={ButtonType.Primary}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default CredentialOfferOid4VC

// ---------- Styles ----------
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 320,
  },
  modalText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
})
