import { useMemo } from 'react'

import { getCredentialForDisplay } from '../display'
import { useSdJwtVcRecords, useW3cCredentialRecords } from '../providers'

export const useCredentialsForDisplay = () => {
  const { w3cCredentialRecords, isLoading: isLoadingW3c } = useW3cCredentialRecords()
  const { sdJwtVcRecords, isLoading: isLoadingSdJwt } = useSdJwtVcRecords()

  const credentials = useMemo(() => {
    // Hole Originaldaten mit Tags
    const enrichedW3c = w3cCredentialRecords.map((record) => {
      const base = getCredentialForDisplay(record)
      return {
        ...base,
        id: record.id,
        tags: record.getTags(), // 🔥 tags erhalten!
        createdAt: record.createdAt,
      }
    })

    const enrichedSdJwt = sdJwtVcRecords.map((record) => {
      const base = getCredentialForDisplay(record)
      return {
        ...base,
        id: record.id,
        tags: record.getTags(), // 🔥 tags erhalten!
        createdAt: record.createdAt,
      }
    })

    // Sortierung nach Zeit (neueste zuerst)
    return [...enrichedW3c, ...enrichedSdJwt].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }, [w3cCredentialRecords, sdJwtVcRecords])

  return {
    credentials,
    isLoading: isLoadingW3c || isLoadingSdJwt,
  }
}