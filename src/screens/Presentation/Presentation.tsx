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
import { PresentationStackParams, Screens } from '../../types/navigators'
import { Oid4vpRepository } from '../../storage/Oid4vpRepository'
import { ensureWallet } from '../../agent/agentSingleton'
import CredentialCard from '../../components/misc/CredentialCard'
import { extractSdJwtDisclosures, DisclosureField } from '../../utils/sdjwt'

type Props = StackScreenProps<PresentationStackParams, Screens.Presentation>

const Presentation: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { presentationId, selectedCredentials } = route.params // enthält nur ID-Listen

  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<any>(null)
  const [resolvedCreds, setResolvedCreds] = useState<any[]>([]) // ✅ Hier speichern wir die echten Credential-Objekte
  const [hasSdJwt, setHasSdJwt] = useState(false)
  const [disclosures, setDisclosures] = useState<Record<string, string[]>>({})
  const [showSummary, setShowSummary] = useState(false)

  // --- Lade Record und mappe ausgewählte Credential-IDs zu Objekten ---
  useEffect(() => {
    const loadRecord = async () => {
      try {
        const agent = await ensureWallet()
        const repo = new Oid4vpRepository()
        const rec = await repo.getById(presentationId, agent)
        if (!rec) {
          Alert.alert(t<string>('Global.Failure'), t<string>('Presentation.NoRecord'))
          navigation.goBack()
          return
        }

        // ✅ Alle Requirements & Credentials holen
        const allReqs =
          rec.resolvedRequest?.presentationExchange?.credentialsForRequest?.requirements ?? []

        const allCreds: any[] = []
        allReqs.forEach((req: any) => {
          req.submissionEntry?.forEach((entry: any) => {
            const creds = entry.verifiableCredentials || []
            creds.forEach((vc: any) => {
              const credRecord = vc.credentialRecord || vc.record
              if (credRecord) allCreds.push(credRecord)
            })
          })
        })

        // ✅ IDs aus selectedCredentials in echte Objekte auflösen
        const selectedIds = Object.values(selectedCredentials).flat()
        const resolved = allCreds.filter((c) => selectedIds.includes(c.id))

        setResolvedCreds(resolved)
        setRecord(rec)
        setHasSdJwt(resolved.some((c) => 'compactSdJwtVc' in c))
      } catch (e) {
        console.error('❌'+t<string>('Presentation.LoadError'), e)
        Alert.alert(t<string>('Global.Failure'), t<string>('Presentation.CouldNotLoadRequest'))
        navigation.goBack()
      } finally {
        setLoading(false)
      }
    }

    void loadRecord()
  }, [presentationId, navigation, selectedCredentials])

  const handleOpenCredential = (cred: any) => {
    const isSdJwt = !!cred?.compactSdJwtVc
    const fields: DisclosureField[] = isSdJwt ? extractSdJwtDisclosures(cred.compactSdJwtVc) : []

    navigation.navigate(Screens.PresentationDisclosure as never, {
      credentialId: cred.id,
      disclosureOptions: { [cred.id]: fields },
      onConfirm: (selected: DisclosureField[]) => {
        setDisclosures((prev) => ({
          ...prev,
          [cred.id]: selected.filter((f) => f.disclose).map((f) => f.path),
        }))
      },
    } as never)
  }

  const handlePrepareSummary = () => setShowSummary(true)

  const handleSend = async () => {
    try {
      const agent = await ensureWallet()
      const url = record?.url
      if (!url) throw new Error('❌'+t<string>('Presentation.NoOid4VPUrlFound'))

      let request: any
      try {
        // 🔍 Versuche Request aufzulösen
        request = await agent.modules.openId4VcHolder.resolveSiopAuthorizationRequest(url)
        if (!request) throw new Error(t<string>('Presentation.RequestEmpty'))
      } catch (err: any) {
        // ✅ Fehler abfangen, wenn z. B. Endpoint 404 oder invalid
        const errMsg = String(err?.message || err)
        console.warn('⚠️ '+t<string>('Presentation.ErrorResolveRequest'), errMsg)

        if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('gone')) {
          Alert.alert(
            t<string>('Presentation.RequestExpired'),
            t<string>('Presentation.RequestError'),
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          )
          return
        }

        throw err // 🔁 sonst normaler Fehlerfluss
      }

      // ✅ Ablaufprüfung (exp in Payload)
      const exp = request.authorizationRequest?.payload?.exp
      if (exp) {
        const expDate = new Date(exp * 1000)
        if (new Date() > expDate) {
          Alert.alert(
            t<string>('Presentation.RequestExpired'),
            t<string>('Presentation.RequestError'),
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          )
          return
        }
      }

      // ✅ Präsentationsdefinition prüfen
      const presentationDefinition =
        request.authorizationRequest?.payload?.presentation_definition
      if (!presentationDefinition)
        throw new Error('❌'+ t<string>('Presentation.NoPresentationDefinitionFound'))

      // ✅ Credentials vorbereiten
      const credentialsMap: Record<string, any> = {}
      Object.entries(selectedCredentials).forEach(([descId, ids]: [string, string[]]) => {
        credentialsMap[descId] = resolvedCreds.filter((c) => ids.includes(c.id))
      })

      const totalCredCount = Object.values(credentialsMap).flat().length
      if (totalCredCount === 0) {
        Alert.alert(t<string>('Presentation.NoCredentials'), t<string>('Presentation.NoCredentialsFound'))
        return
      }

      // ✅ Präsentation senden
      const authorizationResponse =
        await agent.modules.openId4VcHolder.acceptSiopAuthorizationRequest({
          authorizationRequest: request.authorizationRequest,
          presentationExchange: { credentials: credentialsMap },
        })

      console.log('✅ Authorization Response gesendet', authorizationResponse)

      Toast.show({
        type: ToastType.Success,
        text1: t<string>('Presentation.PresentationSendSuccessfully'),
      })

      // 🧹 Record löschen
      const repo = new Oid4vpRepository()
      const walletAgent = await ensureWallet()
      await repo.deleteById(record.id, walletAgent)

      setShowSummary(false)
      navigation.navigate(Screens.PresentationSuccess as never, {
        presentationId: record.id,
      } as never)
    } catch (e) {
      console.error('❌'+t<string>('Presentation.ErrorSendingCredentials'))
      Toast.show({
        type: ToastType.Error,
        text1: t<string>('Presentation.ErrorSendingCredentials'),
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
        <Text>{t('Presentation.NoValidPresentationFound')}</Text>
        <Button title={t('Global.Back')} onPress={() => navigation.goBack()} buttonType={ButtonType.Primary} />
      </View>
    )
  }

  const clientName =
    record.resolvedRequest?.authorizationRequest?.payload?.client_metadata?.client_name ||
    record.clientName

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={styles.title}>{t('Presentation.CheckPresentation')}</Text>
        <Text style={styles.subtitle}>An: {clientName || 'Unbekannter Verifier'}</Text>

        <View style={styles.card}>
          <Text style={styles.infoTitle}>{t('Presentation.SelectedCredentials')}</Text>

          {resolvedCreds.map((cred) => {
            const tags = cred._tags || {}
            return (
              <View key={cred.id} style={styles.credContainer}>
                <CredentialCard
                  credential={cred}
                  name={tags.displayName || cred.credential?.name || 'Credential'}
                  issuerName={tags.displayIssuer || cred.issuer || 'Unbekannter Aussteller'}
                  description={tags.displayDescription || ''}
                  backgroundColor={tags.backgroundColor || '#f8f8f8'}
                  textColor={tags.textColor || '#000'}
                  backgroundImage={tags.backgroundImage ? { uri: tags.backgroundImage } : undefined}
                  logo={tags.displayIssuerLogo ? { uri: tags.displayIssuerLogo } : undefined}
                //onPress={() => handleOpenCredential(cred)}
                />
                {/* {hasSdJwt && 'compactSdJwtVc' in cred && (
                  <Text style={styles.attrHint}>
                    Tippen Sie auf die Karte, um Attribute auszuwählen.
                  </Text>
                )} */}
              </View>
            )
          })}
        </View>

        <View style={styles.buttonContainer}>
          <Button title={t('Presentation.ConfirmSend')} onPress={handlePrepareSummary} buttonType={ButtonType.Primary} />
          <View style={{ height: 10 }} />
          <Button title={t('Global.Cancel')} onPress={() => navigation.goBack()} buttonType={ButtonType.Ghost} />
        </View>
      </ScrollView>

      {/* ---------- Zusammenfassung ---------- */}
      <Modal visible={showSummary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.summaryTitle}>{t('Global.Summary')}</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {resolvedCreds.map((cred) => {
                const tags = cred._tags || {}
                const attrs = disclosures[cred.id] || []
                return (
                  <View key={cred.id} style={styles.summaryItem}>
                    <Text style={styles.summaryName}>{tags.displayName || 'Credential'}</Text>
                    <Text style={styles.summaryIssuer}>{tags.displayIssuer || 'Unbekannter Aussteller'}</Text>
                    {'compactSdJwtVc' in cred && (
                      <View style={styles.attrList}>
                        {attrs.length > 0 ? (
                          attrs.map((a) => (
                            <Text key={a} style={styles.attrItem}>• {a}</Text>
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
              <Button title={t('Presentation.ConfirmSend')} onPress={handleSend} buttonType={ButtonType.Primary} />
              <View style={{ height: 8 }} />
              <Button title={t('Global.Back')} onPress={() => setShowSummary(false)} buttonType={ButtonType.Ghost} />
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
  container: { flex: 1, backgroundColor: ColorPallet.grayscale.white, paddingTop: -50 },
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
  modalContent: { backgroundColor: '#fff', borderRadius: 14, padding: 20, width: '100%' },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryItem: { marginBottom: 16 },
  summaryName: { fontSize: 16, fontWeight: '600' },
  summaryIssuer: { fontSize: 13, color: '#777' },
  attrList: { marginTop: 6, marginLeft: 10 },
  attrItem: { fontSize: 13, color: '#333' },
  attrItemDim: { fontSize: 13, color: '#999' },
  modalButtons: { marginTop: 10 },
})
