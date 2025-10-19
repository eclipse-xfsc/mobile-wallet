import { decodeSdJwt, getClaims } from '@sd-jwt/decode'
import { digest } from '@sd-jwt/crypto-nodejs' // oder @sd-jwt/crypto-browser

export const extractCredentialData = async (cred: any): Promise<any | null> => {
  try {
    let payload: any

    // 🔹 SD-JWT
    if (cred?.compactSdJwtVc) {
      const decoded = await decodeSdJwt(cred.compactSdJwtVc, digest)
      const claims = await getClaims(decoded.jwt.payload, decoded.disclosures, digest)
      payload = claims
    }
    // 🔹 W3C-VC
    else if (cred?.payload) {
      payload =
        typeof cred.payload === 'string'
          ? JSON.parse(cred.payload)
          : cred.payload
    } else {
      payload = cred
    }

    // 🔧 Normalisierung
    const normalized = {
      ...payload,
      type: Array.isArray(payload?.type)
        ? payload.type
        : payload?.type
        ? [payload.type]
        : payload?.vct
        ? [payload.vct]
        : ['UnknownCredentialType'],
    }

    return normalized
  } catch (e) {
    console.error('❌ Fehler beim Dekodieren des Credentials:', e)
    return null
  }
}
