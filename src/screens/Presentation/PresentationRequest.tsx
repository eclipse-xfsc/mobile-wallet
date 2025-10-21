import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { ColorPallet } from '../../theme/theme'
import { Oid4vpRepository, Oid4vpRecordContent } from '../../storage/Oid4vpRepository'
import { Screens } from '../../types/navigators'
import { ensureWallet } from '../../agent/agentSingleton'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { CheckCircle2, XCircle } from 'lucide-react-native'

// 👇 ermöglicht LayoutAnimation auf Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface RouteParams {
  presentationId: string
}

const PresentationRequest: React.FC = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { presentationId } = route.params as RouteParams

  const [record, setRecord] = useState<Oid4vpRecordContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [requirementsSatisfied, setRequirementsSatisfied] = useState<boolean | null>(null)

  useEffect(() => {
    const loadRecord = async () => {
      setLoading(true)
      try {
        const agent = await ensureWallet()
        const repo = new Oid4vpRepository()
        const rec = await repo.getById(presentationId, agent)
        setRecord(rec ?? null)

        const exchange = rec?.resolvedRequest?.presentationExchange
        if (exchange?.requirements?.length) {
          const allOk =
            exchange.areRequirementsSatisfied &&
            exchange.requirements.every((r: any) => r.isRequirementSatisfied !== false)
          setRequirementsSatisfied(allOk)
        } else {
          setRequirementsSatisfied(true)
        }
      } catch (e) {
        console.error('❌ Fehler beim Laden des Records:', e)
      } finally {
        setLoading(false)
      }
    }

    void loadRecord()
  }, [presentationId])

  // 🔄 Ladezustand
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Lade Anfrage...</Text>
      </View>
    )
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Anfrage nicht gefunden.</Text>
        <TouchableOpacity
          style={[styles.button, styles.primary, { width: 180 }]}
          onPress={() => navigation.navigate(Screens.PresentationList as never)}
        >
          <Text style={styles.buttonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (record.status === 'expired') {
    return (
      <View style={styles.center}>
        <View style={styles.expiredBox}>
          <Text style={styles.expiredIcon}>⏰</Text>
          <Text style={styles.expiredTitle}>Anfrage abgelaufen</Text>
          <Text style={styles.expiredText}>
            Diese Verifikationsanfrage ist nicht mehr gültig.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.primary, { marginTop: 20, width: 180 }]}
            onPress={() => navigation.navigate(Screens.PresentationList as never)}
          >
            <Text style={styles.buttonText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const payload =
    record.resolvedRequest?.authorizationRequest?.payload ??
    record.resolvedRequest ??
    {}

  const presentationDef = payload.presentation_definition ?? {}
  const inputDescriptors = presentationDef.input_descriptors ?? []
  const exchange = record.resolvedRequest?.presentationExchange
  const verifierName = record.clientName || 'Unbekannter Anfrager'
  const presentationPurpose =
    presentationDef.purpose ||
    record.presentationPurpose ||
    'Kein spezifischer Zweck angegeben'

  const handleNext = () => {
    if (!requirementsSatisfied) {
      Toast.show({
        type: 'error',
        text1: 'Anfrage kann nicht erfüllt werden',
        text2: 'Es fehlen erforderliche Nachweise oder Bedingungen.',
      })
      return
    }

    navigation.navigate(Screens.PresentationCredentialSelection as never, {
      presentationId: record.id,
    } as never)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Anfrage zur Verifikation</Text>

      <View style={styles.card}>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>{verifierName}</Text> fragt von Ihnen folgende Nachweise an
        </Text>

        <Text style={[styles.infoText, { marginTop: 4 }]}>
          <Text style={styles.bold}>Zweck:</Text> {presentationPurpose}
        </Text>

        {/* ✅ Statusanzeige */}
        {requirementsSatisfied !== null && (
          <View
            style={[
              styles.statusBox,
              requirementsSatisfied ? styles.statusOk : styles.statusFail,
            ]}
          >
            {requirementsSatisfied ? (
              <>
                <CheckCircle2 size={22} color="#1e8e3e" style={{ marginRight: 6 }} />
                <Text style={styles.statusTextOk}>Anfrage erfüllbar</Text>
              </>
            ) : (
              <>
                <XCircle size={22} color="#d93025" style={{ marginRight: 6 }} />
                <Text style={styles.statusTextFail}>Anfrage nicht erfüllbar</Text>
              </>
            )}
          </View>
        )}

        <View style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>Angeforderte Nachweise:</Text>
          {inputDescriptors.length > 0 ? (
            inputDescriptors.map((desc: any, idx: number) => (
              <View key={idx} style={styles.credItem}>
                <Text style={styles.credName}>• {desc.name || 'Unbenannter Nachweis'}</Text>
                {desc.purpose && <Text style={styles.credPurpose}>({desc.purpose})</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.credName}>Keine spezifischen Nachweise angegeben.</Text>
          )}
        </View>

        {requirementsSatisfied === false && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Diese Anfrage kann nicht vollständig erfüllt werden.
            </Text>
            {exchange?.requirements?.map((r: any, idx: number) => {
              if (r.isRequirementSatisfied) return null
              return (
                <Text key={idx} style={styles.warningDetail}>
                  – {r.submissionEntry?.[0]?.name || 'Unbekannte Anforderung'} ist nicht erfüllbar.
                </Text>
              )
            })}
          </View>
        )}

        <Text style={[styles.infoText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Gültig bis:</Text>{' '}
          {record.expiresAt
            ? new Date(record.expiresAt).toLocaleString()
            : 'Kein Ablaufdatum'}
        </Text>
      </View>

      {/* JSON Details */}
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setDetailsVisible(!detailsVisible)
        }}
      >
        <Text style={styles.toggleText}>
          {detailsVisible ? 'Details ausblenden' : 'Details anzeigen'}
        </Text>
        {detailsVisible ? (
          <ChevronUp size={18} color={ColorPallet.baseColors.black} />
        ) : (
          <ChevronDown size={18} color={ColorPallet.baseColors.black} />
        )}
      </TouchableOpacity>

      {detailsVisible && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Request Details (JSON)</Text>
          <ScrollView horizontal>
            <Text style={styles.jsonText}>{JSON.stringify(payload, null, 2)}</Text>
          </ScrollView>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => navigation.navigate(Screens.PresentationList as never)}
        >
          <Text style={styles.buttonText}>Zurück</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            requirementsSatisfied ? styles.primary : styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!requirementsSatisfied}
        >
          <Text style={styles.buttonText}>
            {requirementsSatisfied ? 'Weiter' : 'Nicht erfüllbar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PresentationRequest

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: ColorPallet.grayscale.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#777' },
  errorText: { color: 'red', fontSize: 16, marginBottom: 20 },
  expiredBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    width: '85%',
  },
  expiredIcon: { fontSize: 40, marginBottom: 10 },
  expiredTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  expiredText: { textAlign: 'center', color: '#666', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  card: { backgroundColor: '#fafafa', padding: 16, borderRadius: 10, marginBottom: 20 },
  infoText: { fontSize: 15, color: '#000', lineHeight: 22 },
  bold: { fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  credItem: { flexDirection: 'column', marginVertical: 4 },
  credName: { fontSize: 15 },
  credPurpose: { fontSize: 13, color: '#777', marginLeft: 6 },
  // ✅ Statusanzeige
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusOk: { backgroundColor: '#e7f7ec' },
  statusFail: { backgroundColor: '#fdeaea' },
  statusTextOk: { color: '#1e8e3e', fontWeight: '600', fontSize: 15 },
  statusTextFail: { color: '#d93025', fontWeight: '600', fontSize: 15 },
  warningBox: { marginTop: 10, backgroundColor: '#fff2e6', borderRadius: 8, padding: 10 },
  warningText: { color: '#c65a00', fontWeight: '600' },
  warningDetail: { color: '#c65a00', marginLeft: 8, fontSize: 13 },
  toggle: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  toggleText: { color: ColorPallet.brand.primary, fontWeight: '600' },
  detailsBox: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10, marginBottom: 20 },
  detailsLabel: { fontWeight: '600', marginBottom: 5 },
  jsonText: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#555',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primary: { backgroundColor: ColorPallet.brand.primary },
  cancel: { backgroundColor: '#ccc' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600' },
})
