import { useMemo } from 'react'
import { getCredentialForDisplay } from '../display'
import { useSdJwtVcRecords, useW3cCredentialRecords } from '../providers'

export const useCredentialsForDisplay = () => {
  const { w3cCredentialRecords, isLoading: isLoadingW3c } = useW3cCredentialRecords()
  const { sdJwtVcRecords, isLoading: isLoadingSdJwt } = useSdJwtVcRecords()

  const credentials = useMemo(() => {
    const mapRecord = (record: any) => {
      const base = getCredentialForDisplay(record)
      const tags = record.getTags?.() || {}

      // 🧩 Sicherstellen, dass alle Tags geladen und gültig sind
      return {
        ...base,
        id: record.id,
        tags,
        createdAt: record.createdAt,
      }
    }

    const enrichedW3c = w3cCredentialRecords.map(mapRecord)
    const enrichedSdJwt = sdJwtVcRecords.map(mapRecord)

    enrichedSdJwt.forEach((rec) => console.log(rec.id, rec.tags.backgroundImage))

    return [...enrichedW3c, ...enrichedSdJwt].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }, [w3cCredentialRecords, sdJwtVcRecords])

  return {
    credentials,
    isLoading: isLoadingW3c || isLoadingSdJwt,
  }
}
