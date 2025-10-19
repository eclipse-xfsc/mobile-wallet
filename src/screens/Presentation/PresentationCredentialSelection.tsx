import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ColorPallet } from '../../theme/theme'
import { ensureWallet } from '../../agent/agentSingleton'
import { Oid4vpRepository } from '../../storage/Oid4vpRepository'
import { Screens } from '../../types/navigators'
import { getAllCredentials } from '../../storage/getAllCredentials'
import { JSONPath } from 'jsonpath-plus'
import { extractCredentialData } from '../../utils/credentialExtraction'
import CredentialCard from '../../components/misc/CredentialCard'

interface RouteParams {
  presentationId: string
}

const PresentationCredentialSelection: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { presentationId } = route.params as RouteParams

  const [loading, setLoading] = useState(true)
  const [descriptors, setDescriptors] = useState<any[]>([])
  const [matchingCredentials, setMatchingCredentials] = useState<Record<string, any[]>>({})
  const [selected, setSelected] = useState<Record<string, any>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const agent = await ensureWallet()
        const repo = new Oid4vpRepository()
        const record = await repo.getById(presentationId, agent)
        if (!record) throw new Error('Record not found')

        const payload = record.resolvedRequest?.authorizationRequest?.payload ?? {}
        const definition = payload.presentation_definition ?? {}
        const inputDescriptors = definition.input_descriptors ?? []
        setDescriptors(inputDescriptors)

        // hole alle credentials aus wallet
        const creds = await getAllCredentials(agent)

        const grouped: Record<string, any[]> = {}
        const autoSelected: Record<string, any> = {}

        let index = 1
        for (const desc of inputDescriptors) {
          const constraints = desc.constraints?.fields ?? []
          const matching: any[] = []

          for (const cred of creds) {
            const credPayload = await extractCredentialData(cred)
            if (!credPayload) continue

            const allMatch = await Promise.all(
              constraints.map(async (field: any) => {
                const paths = field.path ?? []
                const results = await Promise.all(
                  paths.map(async (p: string) => {
                    try {
                      const res = JSONPath({ path: p, json: credPayload })
                      return Array.isArray(res) && res.length > 0
                    } catch {
                      return false
                    }
                  })
                )
                return results.some(Boolean)
              })
            )
            if (allMatch.every(Boolean)) matching.push(cred)
          }

          const groupKey = `Anfrage ${index}`
          grouped[groupKey] = matching

          // Wenn genau ein Credential → automatisch auswählen
          if (matching.length === 1) {
            autoSelected[groupKey] = matching[0]
          }

          index++
        }

        setMatchingCredentials(grouped)
        setSelected(autoSelected)
      } catch (e) {
        console.error('❌ Fehler beim Laden der Credentials:', e)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [presentationId])

  const handleSelect = (descId: string, cred: any) => {
    setSelected((prev) => {
      if (prev[descId]?.id === cred.id) {
        const newSel = { ...prev }
        delete newSel[descId]
        return newSel
      }
      return { ...prev, [descId]: cred }
    })
  }

  const handleNext = () => {
    console.log('selected', selected)
    navigation.navigate(Screens.Presentation as never, {
      presentationId,
      selectedCredentials: selected,
    } as never)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Suche passende Nachweise...</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Passende Nachweise auswählen</Text>

      {Object.entries(matchingCredentials).map(([groupKey, creds]) => {
        return (
          <View key={groupKey} style={styles.groupContainer}>
            {/* 🔹 Gruppentitel */}
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{groupKey}</Text>
              <Text style={styles.groupPurpose}>
                Wählen Sie den passenden Nachweis für diese Anfrage.
              </Text>
            </View>

            {creds.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.noCreds}>Keine passenden Nachweise gefunden.</Text>
              </View>
            )}

            {creds.map((cred: any) => {
              const isActive = selected[groupKey]?.id === cred.id
              const tags = cred._tags || {}
              const isSingle = creds.length === 1

              return (
                <View
                  key={cred.id}
                  style={[
                    styles.cardWrapper,
                    isActive && styles.cardActive,
                    isSingle && styles.cardDisabled,
                  ]}
                >
                  <CredentialCard
                    credential={cred}
                    name={
                      tags.displayName ||
                      cred.credential?.name ||
                      cred.type ||
                      'Unbekannter Nachweis'
                    }
                    issuerName={tags.displayIssuer || cred.issuer || 'Unbekannter Aussteller'}
                    description={tags.displayDescription || ''}
                    backgroundColor={tags.backgroundColor || '#f8f8f8'}
                    textColor={tags.textColor || '#000'}
                    backgroundImage={
                      tags.backgroundImage ? { uri: tags.backgroundImage } : undefined
                    }
                    logo={
                      tags.displayIssuerLogo
                        ? { uri: tags.displayIssuerLogo }
                        : undefined
                    }
                  />

                  {/* 🔹 Overlay über Karte */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => !isSingle && handleSelect(groupKey, cred)}
                    style={[
                      styles.overlay,
                      isActive && styles.overlayActive,
                      isSingle && styles.overlayDisabled,
                    ]}
                  >
                    {isActive && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {isSingle && (
                    <View style={styles.autoBadge}>
                      <Text style={styles.autoBadgeText}>Automatisch ausgewählt</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )
      })}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => navigation.navigate(Screens.PresentationList as never)}
        >
          <Text style={styles.buttonText}>Abbrechen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={handleNext}
          disabled={Object.keys(selected).length === 0}
        >
          <Text style={styles.buttonText}>Weiter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PresentationCredentialSelection

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: ColorPallet.grayscale.white },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPallet.grayscale.white,
  },
  loadingText: { marginTop: 10, color: ColorPallet.baseColors.lightGrey },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: ColorPallet.baseColors.black },
  groupContainer: {
    marginBottom: 28,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  groupHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  groupTitle: { fontSize: 18, fontWeight: '700', color: ColorPallet.baseColors.black },
  groupPurpose: { fontSize: 13, color: ColorPallet.baseColors.lightGrey, marginTop: 2 },
  emptyBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  cardWrapper: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardActive: { borderColor: ColorPallet.brand.primary },
  cardDisabled: { opacity: 0.8 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  overlayActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  overlayDisabled: {
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  autoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 3,
  },
  autoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  noCreds: { color: ColorPallet.baseColors.lightGrey, fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primary: { backgroundColor: ColorPallet.brand.primary },
  cancel: { backgroundColor: ColorPallet.grayscale.lightGrey },
  buttonText: { color: ColorPallet.grayscale.white, fontWeight: '600' },
})
