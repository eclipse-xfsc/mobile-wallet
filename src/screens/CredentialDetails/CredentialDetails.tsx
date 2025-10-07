import type { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState, useCallback } from 'react'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAgent } from '@credo-ts/react-hooks'
import { W3cCredentialRepository, SdJwtVcRepository } from '@credo-ts/core'
import { Buffer } from 'buffer';
import Accordion from '../../components/accordion/Accordion'
import CredentialCard from '../../components/misc/CredentialCard'
import { ColorPallet } from '../../theme/theme'
import { CredentialStackParams, Screens } from '../../types/navigators'
import { errorToast, successToast, warningToast } from '../../utils/toast'

type CredentialDetailsProps = StackScreenProps<
  CredentialStackParams,
  Screens.CredentialDetails
>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ route, navigation }) => {
  const { t } = useTranslation()
  const { credentialId } = route.params
  const { agent } = useAgent()

  const [credential, setCredential] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // ---------- Lade Credential ----------
  useEffect(() => {
    const loadCredential = async () => {
      if (!agent || !credentialId) return

      try {
        console.log('🔍 Lade Credential:', credentialId)

        // Versuch W3C zuerst
        let record = null
        const w3cRepo = agent.dependencyManager.resolve(W3cCredentialRepository)
        const sdjwtRepo = agent.dependencyManager.resolve(SdJwtVcRepository)

        try {
          record = await w3cRepo.findById(agent.context, credentialId)
          if (record) console.log('✅ Gefunden im W3C Repository')
        } catch {}

        if (!record) {
          try {
            record = await sdjwtRepo.findById(agent.context, credentialId)
            if (record) console.log('✅ Gefunden im SD-JWT Repository')
          } catch {}
        }

        if (!record) {
          warningToast(t<string>('CredentialOffer.CredentialNotFound'))
          navigation.goBack()
          return
        }

        console.log('📦 Credential Record:', record)
        console.log('🏷️ Tags:', record.getTags?.())
        setCredential(record)
      } catch (e) {
        console.error('❌ Fehler beim Laden der Credential:', e)
        errorToast('Credential konnte nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    void loadCredential()
  }, [agent, credentialId, navigation, t])

  // ---------- Delete Credential ----------
  const handleDelete = useCallback(async () => {
    if (!agent || !credential) return

    Alert.alert(
      t<string>('CredentialDetails.DeleteTitle') || 'Delete Credential',
      t<string>('CredentialDetails.DeleteConfirm') ||
        'Are you sure you want to delete this credential?',
      [
        {
          text: t<string>('Global.Cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t<string>('CredentialDetails.RemoveFromWallet') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const isSdJwt = 'compactSdJwtVc' in credential
              const repository = isSdJwt
                ? agent.dependencyManager.resolve(SdJwtVcRepository)
                : agent.dependencyManager.resolve(W3cCredentialRepository)

              await repository.delete(agent.context, credential)

              successToast(t<string>('CredentialDetails.Deleted'))
              navigation.goBack()
            } catch (err) {
              console.error('❌ Fehler beim Löschen:', err)
              errorToast(t<string>('CredentialDetails.DeleteError'))
            }
          },
        },
      ]
    )
  }, [agent, credential, navigation, t])

  // ---------- Ladeanzeige ----------
  if (loading || !credential) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Loading credential...</Text>
      </View>
    )
  }

  // ---------- Anzeige aus Tags ----------
  const tags = credential.getTags?.() ?? {}
  console.log('🏷️ Tags (via getTags):', tags)

  const displayName = tags.displayName || 'Credential'
  const displayIssuer = tags.displayIssuer || 'Unknown'
  const description = tags.displayDescription || ''
  const backgroundColor = tags.backgroundColor || '#eee'
  const textColor = tags.textColor || '#000'
  const backgroundImage =
    tags.backgroundImage ? { uri: tags.backgroundImage } : undefined

  console.log('🖼️ Background Image:', backgroundImage)

  // ---------- Render ----------
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/* ---------- Credential Card ---------- */}
      <View style={styles.credentialCardView}>
        <CredentialCard
          credential={credential}
          name={displayName}
          issuerName={displayIssuer}
          description={description}
          backgroundColor={backgroundColor}
          textColor={textColor}
          backgroundImage={backgroundImage}
          style={{ borderRadius: 20 }}
        />
      </View>

      {/* ---------- INFO ---------- */}
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Info" innerAccordion={false}>
          <View>
            <View style={styles.innerContainer}>
              <Text style={styles.attribute}>Credential ID</Text>
              <Text style={styles.attribute}>{credential.id}</Text>
            </View>
            <View style={styles.divider} />

            {/* Attribute anzeigen */}
            {(() => {
              // ✅ Für SD-JWT
              if ('compactSdJwtVc' in credential && typeof credential.compactSdJwtVc === 'string') {
                try {
                  const [headerB64, payloadB64, signature, ...disclosuresRaw] =
                    credential.compactSdJwtVc.split(/[.~]/g).filter(Boolean)

                  const payload = JSON.parse(
                    Buffer.from(payloadB64, 'base64').toString('utf-8')
                  )

                  const attributes: Record<string, any> = {}

                  // ✅ Extract "cnf.kid" → "Key Id"
                  if (payload.cnf?.kid) attributes['Key Id'] = payload.cnf.kid

                  // ✅ Extract "vct" → "VC Type"
                  if (payload.vct) attributes['VC Type'] = payload.vct

                  // ✅ Decode disclosures
                  const disclosures = credential.compactSdJwtVc.split('~').slice(1)
                  disclosures.forEach((disclosure) => {
                    try {
                      const decoded = JSON.parse(
                        Buffer.from(disclosure, 'base64').toString('utf-8')
                      )
                      if (Array.isArray(decoded) && decoded.length >= 3) {
                        const [, key, value] = decoded
                        attributes[key] = value
                      }
                    } catch (err) {
                      console.warn('⚠️ Disclosure decode failed:', err)
                    }
                  })

                  return Object.entries(attributes).length ? (
                    Object.entries(attributes).map(([key, value]) => (
                      <View key={key} style={styles.innerContainer}>
                        <Text style={styles.attribute}>{key}</Text>
                        <Text style={styles.attribute}>
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noActivitiesText}>No attributes found</Text>
                  )
                } catch (err) {
                  console.error('❌ Fehler beim Dekodieren von SD-JWT:', err)
                  return (
                    <Text style={styles.noActivitiesText}>Failed to decode SD-JWT</Text>
                  )
                }
              }

              // ✅ Für klassische W3C Credentials
              if (credential.credential?.credentialSubject) {
                return Object.entries(credential.credential.credentialSubject).map(
                  ([key, value]) => (
                    <View key={key} style={styles.innerContainer}>
                      <Text style={styles.attribute}>{key}</Text>
                      <Text style={styles.attribute}>
                        {typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </Text>
                    </View>
                  )
                )
              }

              return <Text style={styles.noActivitiesText}>No attributes found</Text>
            })()}
          </View>
        </Accordion>
      </View>

      {/* ---------- DELETE BUTTON ---------- */}
      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>
          {t<string>('CredentialDetails.RemoveFromWallet') || 'Delete Credential'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

export default CredentialDetails

// ---------- Styles ----------
const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 40,
  },
  credentialCardView: {
    marginHorizontal: 15,
    marginTop: 16,
  },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  attribute: {
    width: '50%',
    color: ColorPallet.baseColors.black,
  },
  divider: {
    borderBottomColor: ColorPallet.baseColors.lightGrey,
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPallet.grayscale.white,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: ColorPallet.baseColors.black,
  },
  noActivitiesText: {
    textAlign: 'center',
    color: ColorPallet.baseColors.lightGrey,
    marginVertical: 10,
  },
  deleteButton: {
    marginTop: 30,
    marginBottom: 50,
    backgroundColor: '#C62828',
    paddingVertical: 14,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  deleteText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
})
