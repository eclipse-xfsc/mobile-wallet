import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ColorPallet } from '../../theme/theme'
import Button, { ButtonType } from '../../components/button/Button'
import Toast from 'react-native-toast-message'
import { ToastType } from '../../components/toast/BaseToast'
import { StackScreenProps } from '@react-navigation/stack'
import { PresentationStackParams, Screens, TabStacks } from '../../types/navigators'
import { Oid4vpRepository } from '../../storage/Oid4vpRepository'
import { ensureWallet } from '../../agent/agentSingleton'
import CredentialCard from '../../components/misc/CredentialCard'
import { extractSdJwtDisclosures, DisclosureField } from '../../utils/sdjwt'

type Props = StackScreenProps<PresentationStackParams, Screens.Presentation>

const Presentation: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { presentationId, selectedCredentials } = route.params

  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<any>(null)
  const [hasSdJwt, setHasSdJwt] = useState(false)
  const [disclosures, setDisclosures] = useState<Record<string, string[]>>({})
  const [showSummary, setShowSummary] = useState(false)

  // --- Lade Request ---
  useEffect(() => {
    const loadRecord = async () => {
      try {
        const agent = await ensureWallet()
        const repo = new Oid4vpRepository()
        const rec = await repo.getById(presentationId, agent)
        if (!rec) {
          Alert.alert('Fehler', 'Präsentationsanfrage nicht gefunden.')
          navigation.goBack()
          return
        }

        const selectedValues = Object.values(selectedCredentials)
        const hasSd = selectedValues.some((cred: any) => 'compactSdJwtVc' in cred)
        setHasSdJwt(hasSd)

        setRecord(rec)
      } catch (e) {
        console.error('❌ Fehler beim Laden der Präsentationsanfrage:', e)
        Alert.alert('Fehler', 'Konnte Anfrage nicht laden.')
        navigation.goBack()
      } finally {
        setLoading(false)
      }
    }

    void loadRecord()
  }, [presentationId, navigation])

  const handleOpenCredential = (cred: any, descId: string) => {
    // Nur für SD-JWT sinnvoll
    const isSdJwt = !!cred?.compactSdJwtVc
    const fields: DisclosureField[] = isSdJwt
      ? extractSdJwtDisclosures(cred.compactSdJwtVc)
      : []

    // Wenn keine selektiven Felder → direkt zurück oder (optional) Info anzeigen
    const disclosureOptions: Record<string, DisclosureField[]> = {
      [descId]: fields, // pro Input Descriptor gruppieren
    }

    navigation.navigate(Screens.PresentationDisclosure as never, {
      presentationId,
      disclosureOptions,
    } as never)
  }

  // --- Zeige Zusammenfassung ---
  const handlePrepareSummary = () => {
    setShowSummary(true)
  }

  // --- Senden der Presentation ---
  const handleSend = async () => {
    try {
      const agent = await ensureWallet()
      if (!record?.resolvedRequest) throw new Error('Keine gültige Anfrage vorhanden.')

      const payload =
        record.resolvedRequest?.authorizationRequest?.payload ??
        record.resolvedRequest
      const presentationDefinition = payload.presentation_definition

      if (!presentationDefinition) {
        throw new Error('Keine Presentation Definition gefunden.')
      }

      // Erzeuge Submission nach DIF Spec
      const submission = {
        id: `submission-${Date.now()}`,
        definition_id: presentationDefinition.id,
        descriptor_map: Object.entries(selectedCredentials).map(
          ([descId, cred]: [string, any]) => ({
            id: descId,
            format: 'jwt_vc',
            path: `$[${descId}]`,
          })
        ),
      }

      console.log('📦 Sende Presentation Submission:', submission)

      await agent.modules.openId4VcHolder.acceptSiopAuthorizationRequest(
        record.resolvedRequest,
        {
          presentations: [
            {
              presentation_submission: submission,
              verifiableCredential: Object.values(selectedCredentials).map(
                (c: any) => c.rawCredential ?? c.credential ?? c
              ),
            },
          ],
        }
      )

      Toast.show({
        type: ToastType.Success,
        text1: 'Präsentation erfolgreich gesendet',
      })

      const repo = new Oid4vpRepository()
      const walletAgent = await ensureWallet()
      await repo.deleteById(record.id, walletAgent)

      setShowSummary(false)
      navigation.navigate(Screens.PresentationSuccess as never, {
        presentationId: record.id,
      } as never)
    } catch (e) {
      console.error('❌ Fehler beim Senden der Präsentation:', e)
      Toast.show({
        type: ToastType.Error,
        text1: 'Fehler beim Senden',
        text2: String(e),
      })
    }
  }

  // --- UI ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text>{t('Global.Loading') || 'Lade...'}</Text>
      </View>
    )
  }

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text>Keine gültige Präsentationsanfrage gefunden.</Text>
        <Button
          title="Zurück"
          onPress={() => navigation.goBack()}
          buttonType={ButtonType.Primary}
        />
      </View>
    )
  }

  const clientName =
    record.resolvedRequest?.authorizationRequest?.payload?.client_metadata
      ?.client_name || record.clientName

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Präsentation überprüfen</Text>
        <Text style={styles.subtitle}>
          An: {clientName || 'Unbekannter Verifier'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.infoTitle}>Ausgewählte Credentials</Text>

          {Object.entries(selectedCredentials).map(([descId, cred]: [string, any]) => {
            const tags = cred._tags || {}
            return (
              <View key={descId} style={styles.credContainer}>
                <CredentialCard
                  credential={cred}
                  name={tags.displayName || cred.credential?.name || 'Credential'}
                  issuerName={tags.displayIssuer || cred.issuer || 'Unbekannter Aussteller'}
                  description={tags.displayDescription || ''}
                  backgroundColor={tags.backgroundColor || '#f8f8f8'}
                  textColor={tags.textColor || '#000'}
                  backgroundImage={
                    tags.backgroundImage ? { uri: tags.backgroundImage } : undefined
                  }
                  logo={
                    tags.displayIssuerLogo ? { uri: tags.displayIssuerLogo } : undefined
                  }
                  onPress={() => handleOpenCredential(cred, descId)}
                />
                {hasSdJwt && 'compactSdJwtVc' in cred && (
                  <Text style={styles.attrHint}>
                    Tippen Sie auf die Karte, um Attribute auszuwählen.
                  </Text>
                )}
              </View>
            )
          })}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Präsentation senden"
            onPress={handlePrepareSummary}
            buttonType={ButtonType.Primary}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Abbrechen"
            onPress={() => navigation.goBack()}
            buttonType={ButtonType.Ghost}
          />
        </View>
      </ScrollView>

      {/* ---------- Zusammenfassung ---------- */}
      <Modal visible={showSummary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.summaryTitle}>Zusammenfassung</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {Object.entries(selectedCredentials).map(([descId, cred]: [string, any]) => {
                const tags = cred._tags || {}
                const attrs = disclosures[descId] || []
                return (
                  <View key={descId} style={styles.summaryItem}>
                    <Text style={styles.summaryName}>
                      {tags.displayName || 'Credential'}
                    </Text>
                    <Text style={styles.summaryIssuer}>
                      {tags.displayIssuer || 'Unbekannter Aussteller'}
                    </Text>
                    {'compactSdJwtVc' in cred && (
                      <View style={styles.attrList}>
                        {attrs.length > 0 ? (
                          attrs.map((a) => (
                            <Text key={a} style={styles.attrItem}>
                              • {a}
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.attrItemDim}>Keine Attribute ausgewählt</Text>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Senden bestätigen"
                onPress={handleSend}
                buttonType={ButtonType.Primary}
              />
              <View style={{ height: 8 }} />
              <Button
                title="Zurück"
                onPress={() => setShowSummary(false)}
                buttonType={ButtonType.Ghost}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Presentation

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ColorPallet.grayscale.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 16 },
  card: {
    backgroundColor: ColorPallet.grayscale.lightGrey,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: { fontWeight: '600', fontSize: 16, marginBottom: 8 },
  credContainer: { marginBottom: 16 },
  attrHint: { fontSize: 12, color: '#666', marginTop: 4 },
  buttonContainer: { marginTop: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '100%',
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryItem: { marginBottom: 16 },
  summaryName: { fontSize: 16, fontWeight: '600' },
  summaryIssuer: { fontSize: 13, color: '#777' },
  attrList: { marginTop: 6, marginLeft: 10 },
  attrItem: { fontSize: 13, color: '#333' },
  attrItemDim: { fontSize: 13, color: '#999' },
  modalButtons: { marginTop: 10 },
})
