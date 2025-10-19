// utils/sdjwt.ts
import { Buffer } from 'buffer'

export type DisclosureField = {
  path: string
  purpose?: string
  value?: any
  disclose: boolean
}

/** base64url → UTF-8 String */
const b64urlToString = (input: string) => {
  const pad = input.length % 4 ? '===='.slice(input.length % 4) : ''
  const b64 = (input.replace(/-/g, '+').replace(/_/g, '/') + pad)
  return Buffer.from(b64, 'base64').toString('utf-8')
}

/**
 * Liest selektive Felder (Disclosures) aus einem compact SD-JWT VC.
 * Jeder Disclosure ist base64url-kodiert und dekodiert zu [salt, key, value].
 */
export const extractSdJwtDisclosures = (compactSdJwtVc: string): DisclosureField[] => {
  if (!compactSdJwtVc || typeof compactSdJwtVc !== 'string') return []

  // SD-JWT: <JWS>~<disc1>~<disc2>~...
  const parts = compactSdJwtVc.split('~')
  if (parts.length <= 1) return []

  const disclosures = parts.slice(1).filter(Boolean)
  const fields: DisclosureField[] = []

  for (const disc of disclosures) {
    try {
      const json = JSON.parse(b64urlToString(disc))
      // Erwartetes Format: [salt, key, value]
      if (Array.isArray(json) && json.length >= 3) {
        const [, key, value] = json
        // Wir kennen i.d.R. die exakte verschachtelte Pfadstruktur nicht mehr,
        // daher Path als Top-Level-Claim-Namen.
        fields.push({
          path: `$.${String(key)}`,
          value,
          disclose: true, // Standard: ON
        })
      }
    } catch (e) {
      // Disclosure kann z.B. kein gültiges JSON sein → ignoriere
      // (optional: console.warn)
    }
  }

  return fields
}
