import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ColorPallet } from '../../theme/theme'
import { Screens } from '../../types/navigators'
import { Oid4vpRepository, Oid4vpRecordContent } from '../../storage/Oid4vpRepository'
import { Trash2 } from 'lucide-react-native'

const PresentationList: React.FC = () => {
  const { t } = useTranslation()
  const { agent } = useAgent()
  const navigation = useNavigation()
  const [records, setRecords] = useState<Oid4vpRecordContent[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active')

  const repo = useMemo(() => new Oid4vpRepository(), [])

  // 🔄 Lade alle Records
  const loadRecords = useCallback(async () => {
    if (!agent) return
    setLoading(true)
    try {
      const all = await repo.getAll(agent)
      const now = new Date()
      // berechne Status (zur Sicherheit)
      const mapped = all.map((r) => {
        const expiresAt = r.expiresAt
        const isExpired = !expiresAt || new Date(expiresAt).getTime() < now.getTime()
        return {
          ...r,
          status: isExpired ? 'expired' : (r.status ?? 'active'),
        }
      })

      setRecords(mapped)
    } catch (e) {
      console.error('❌ Fehler beim Laden der Records:', e)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [repo, agent])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  // 🗑️ Record löschen
  const handleDelete = useCallback(
    async (id: string) => {
      Alert.alert('Löschen bestätigen', 'Willst du diesen Request wirklich löschen?', [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await repo.deleteById(id, agent)
              setRecords((prev) => prev.filter((r) => r.id !== id))
            } catch (e) {
              console.error('❌ Fehler beim Löschen:', e)
              Alert.alert('Fehler', 'Der Datensatz konnte nicht gelöscht werden.')
            }
          },
        },
      ])
    },
    [repo, agent]
  )

  // 🎯 Filterung je nach Tab
  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.status === activeTab)
  }, [records, activeTab])

  const renderItem = ({ item }: { item: Oid4vpRecordContent }) => {
    const expired = item.status === 'expired'

    return (
      <View style={[styles.card, expired && styles.cardExpired]}>
        <TouchableOpacity
          style={styles.cardContent}
          disabled={expired}
          onPress={() =>
            navigation.navigate(Screens.PresentationRequest as never, {presentationId: item.id } as never)
          }
        >
          <View style={styles.row}>
            <Text style={styles.title}>
              {item.clientName || 'Unknown Verifier'}
            </Text>
            <Text style={[styles.status, expired ? styles.expired : styles.active]}>
              {expired ? 'Expired' : 'Active'}
            </Text>
          </View>

          <Text style={styles.subtitle}>
            {item.presentationName || 'OID4VP Request'}
          </Text>

          {item.presentationPurpose ? (
            <Text style={styles.purposeText}>{item.presentationPurpose}</Text>
          ) : null}

          <Text style={styles.subtitle}>
            {item.expiresAt
              ? `Expires: ${new Date(item.expiresAt).toLocaleString()}`
              : 'No expiration'}
          </Text>
        </TouchableOpacity>

        {/* 🗑️ Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={20} color={ColorPallet.baseColors.lightGrey} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}
          >
            {t<string>('PresentationList.Active') || 'Active'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'expired' && styles.tabActive]}
          onPress={() => setActiveTab('expired')}
        >
          <Text
            style={[styles.tabText, activeTab === 'expired' && styles.tabTextActive]}
          >
            {t<string>('PresentationList.Expired') || 'Expired'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRecords}
            tintColor={ColorPallet.brand.primary}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'No active requests' : 'No expired requests'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

export default PresentationList

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ColorPallet.grayscale.white },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: ColorPallet.baseColors.black },
  subtitle: { marginTop: 4, color: ColorPallet.baseColors.lightGrey, fontSize: 13 },
  purposeText: {
    marginTop: 2,
    color: ColorPallet.baseColors.grey,
    fontSize: 13,
    fontStyle: 'italic',
  },
  status: { fontWeight: '600' },
  active: { color: 'green' },
  expired: { color: 'red' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPallet.baseColors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ColorPallet.grayscale.lightGrey,
  },
  cardContent: { flex: 1 },
  cardExpired: { opacity: 0.6 },

  deleteButton: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  center: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: ColorPallet.baseColors.lightGrey },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: ColorPallet.grayscale.lightGrey,
    padding: 6,
    borderRadius: 10,
    margin: 10,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: ColorPallet.brand.primary },
  tabText: { color: ColorPallet.baseColors.black, fontWeight: '500' },
  tabTextActive: { color: ColorPallet.baseColors.white },
})
