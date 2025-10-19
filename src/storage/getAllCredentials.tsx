import { Agent } from '@credo-ts/core'

/**
 * Holt alle Credentials aus der Wallet — sowohl W3C als auch SD-JWT.
 * Gibt sie vereinheitlicht als ein Array zurück.
 */
export const getAllCredentials = async (agent: Agent) => {
  if (!agent) throw new Error('❌ Kein Agent übergeben')

  try {
    // 🧠 Hole W3C Credentials
    const w3cCredentials = await agent.w3cCredentials.getAllCredentialRecords()

    // 🧠 Hole SD-JWT Credentials
    const sdJwtCredentials = await agent.sdJwtVc.getAll()

    // 🧩 Kombiniere beide Arten
    const allCredentials = [
      ...w3cCredentials.map((c) => ({ ...c, type: 'w3c' })),
      ...sdJwtCredentials.map((c) => ({ ...c, type: 'sd-jwt' })),
    ]

    return allCredentials
  } catch (e) {
    console.error('❌ Fehler beim Laden der Credentials:', e)
    throw e
  }
}
