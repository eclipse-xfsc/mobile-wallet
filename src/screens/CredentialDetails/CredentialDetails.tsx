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
  Switch,
  TouchableOpacity,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAgent } from '@credo-ts/react-hooks'
import { W3cCredentialRepository, SdJwtVcRepository } from '@credo-ts/core'
import { Buffer } from 'buffer'
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
  const { credentialId, isPresentationMode = false, enableDisclosure = false } = route.params
  const { agent } = useAgent()

  const [credential, setCredential] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [attributes, setAttributes] = useState<Record<string, any>>({})
  const [disclosures, setDisclosures] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState(true)

  // ---------- Lade Credential ----------
  useEffect(() => {
    const loadCredential = async () => {
      if (!agent || !credentialId) return

      try {
        console.log('🔍 Lade Credential:', credentialId)

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
          warningToast('Credential nicht gefunden')
          navigation.goBack()
          return
        }

        setCredential(record)
        const attrs = extractAttributes(record)
        setAttributes(attrs)

        // Disclosure switches default: all ON
        const defaults: Record<string, boolean> = {}
        Object.keys(attrs).forEach((k) => (defaults[k] = true))
        setDisclosures(defaults)
      } catch (e) {
        console.error('❌ Fehler beim Laden:', e)
        errorToast('Credential konnte nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    void loadCredential()
  }, [agent, credentialId, navigation])

  // ---------- Attribute extrahieren ----------
  const extractAttributes = (cred: any): Record<string, any> => {
    // 🧩 SD-JWT
    if ('compactSdJwtVc' in cred && typeof cred.compactSdJwtVc === 'string') {
      try {
        const [headerB64, payloadB64] = cred.compactSdJwtVc.split('.')
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))

        const attrs: Record<string, any> = {}

        if (payload.cnf?.kid) attrs['Key ID'] = payload.cnf.kid
        if (payload.vct) attrs['VC Type'] = payload.vct

        const disclosures = cred.compactSdJwtVc.split('~').slice(1)
        disclosures.forEach((d: string) => {
          try {
            const decoded = JSON.parse(Buffer.from(d, 'base64').toString('utf-8'))
            if (Array.isArray(decoded) && decoded.length >= 3) {
              const [, key, value] = decoded
              attrs[key] = value
            }
          } catch (err) {
            console.warn('⚠️ Disclosure decode failed:', err)
          }
        })
        return attrs
      } catch (err) {
        console.error('❌ Fehler beim Dekodieren von SD-JWT:', err)
        return {}
      }
    }

    // 🧩 W3C VC
    if (cred.credential?.credentialSubject) {
      return cred.credential.credentialSubject
    }

    return {}
  }

  // ---------- Delete ----------
  const handleDelete = useCallback(async () => {
    if (!agent || !credential) return

    Alert.alert('Löschen', 'Credential wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            const isSdJwt = 'compactSdJwtVc' in credential
            const repo = isSdJwt
              ? agent.dependencyManager.resolve(SdJwtVcRepository)
              : agent.dependencyManager.resolve(W3cCredentialRepository)

            await repo.delete(agent.context, credential)
            successToast('Credential gelöscht')
            navigation.goBack()
          } catch (err) {
            console.error('❌ Fehler beim Löschen:', err)
            errorToast('Fehler beim Löschen')
          }
        },
      },
    ])
  }, [agent, credential, navigation])

  // ---------- UI ----------
  if (loading || !credential) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Lade Credential...</Text>
      </View>
    )
  }

  const tags = credential.getTags?.() ?? {}
  const displayName = tags.displayName || 'Credential'
  const displayIssuer = tags.displayIssuer || 'Unknown'
  const description = tags.displayDescription || ''
  const backgroundColor = tags.backgroundColor || '#eee'
  const textColor = tags.textColor || '#000'
  const backgroundImage =
    tags.backgroundImage ? { uri: tags.backgroundImage } : undefined

  const isSdJwt = 'compactSdJwtVc' in credential
  const disclosureMode = isPresentationMode && isSdJwt && enableDisclosure

  const toggleDisclosure = (key: string) =>
    setDisclosures((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
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

      {/* INFO */}
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Attribute" innerAccordion={false} defaultExpanded>
          <View>
            {Object.keys(attributes).length === 0 ? (
              <Text style={styles.noActivitiesText}>Keine Attribute gefunden</Text>
            ) : (
              Object.entries(attributes).map(([key, value]) => (
                <View key={key} style={styles.attributeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attributeKey}>{key}</Text>
                    <Text style={styles.attributeValue}>
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </Text>
                  </View>

                  {disclosureMode && (
                    <Switch
                      value={disclosures[key]}
                      onValueChange={() => toggleDisclosure(key)}
                      trackColor={{ false: '#ccc', true: ColorPallet.brand.primary }}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        </Accordion>
      </View>

      {/* Disclosure Hinweis */}
      {disclosureMode && (
        <View style={styles.disclosureHint}>
          <Text style={styles.disclosureText}>
            Wählen Sie aus, welche Attribute für die Präsentation offengelegt werden sollen.
          </Text>
        </View>
      )}

      {/* Delete Button */}
      {!isPresentationMode && (
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Aus Wallet entfernen</Text>
        </Pressable>
      )}
    </ScrollView>
  )
}

export default CredentialDetails

// ---------- Styles ----------
const styles = StyleSheet.create({
  scrollView: { paddingBottom: 40 },
  credentialCardView: { marginHorizontal: 15, marginTop: 16 },
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
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  attributeKey: { fontWeight: '600', fontSize: 14, color: '#333' },
  attributeValue: { fontSize: 13, color: '#555' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: ColorPallet.baseColors.black },
  noActivitiesText: { color: ColorPallet.baseColors.lightGrey, textAlign: 'center' },
  deleteButton: {
    marginTop: 30,
    marginBottom: 50,
    backgroundColor: '#C62828',
    paddingVertical: 14,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  deleteText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  disclosureHint: {
    backgroundColor: '#eef6ff',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  disclosureText: { fontSize: 13, color: '#333', textAlign: 'center' },
})
