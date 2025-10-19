import { Agent } from '@credo-ts/core'
import { v4 as uuidv4 } from 'uuid'
import { ensureWallet } from '../agent/agentSingleton'

/**
 * 🧩 Interface für gespeicherte OID4VP-Records
 */
export interface Oid4vpRecordContent {
    id: string
    url: string
    createdAt: string
    status: 'active' | 'expired'
    expiresAt?: string
    clientName: string
    presentationName: string
    presentationPurpose: string
    resolvedRequest?: Record<string, unknown>
}

export class Oid4vpRepository {
    private TAG_TYPE = 'oid4vp'

    /**
     * 🧠 Prüft und aktualisiert Status aller abgelaufenen Records
     */
    private async checkAndExpireRecords(agent: Agent): Promise<void> {
        try {
            const all = await agent.genericRecords.getAll()
            const now = new Date()

            const expired = all.filter((r: any) => {
                const expiresAt = r.content?.expiresAt
                return (
                    (!expiresAt || new Date(expiresAt).getTime() < now.getTime()) &&
                    r.content?.status !== 'expired'
                )
            })

            for (const rec of expired) {
                console.log(`⚙️ Expiring record ${rec.id}`)
                try {
                    await agent.genericRecords.deleteById(rec.id)
                    await agent.genericRecords.save({
                        id: rec.id,
                        content: {
                            ...rec.content,
                            status: 'expired',
                        } as Record<string, unknown>,
                        tags: {
                            ...(rec.tags || {}),
                            status: 'expired',
                            type: this.TAG_TYPE,
                        },
                    })
                } catch (err) {
                    console.warn(`⚠️ Fehler beim Setzen auf expired (${rec.id}):`, err)
                }
            }

            if (expired.length > 0)
                console.log(`🕓 ${expired.length} Records auf "expired" gesetzt`)
        } catch (e) {
            console.error('❌ Fehler beim Aktualisieren abgelaufener Records:', e)
        }
    }

    /**
     * 💾 Speichert einen neuen OID4VP-Record
     */
    async save(agent: Agent | undefined, { url, request }: { url: string; request?: any }): Promise<string> {
        const safeAgent = agent ?? (await ensureWallet())
        if (!safeAgent.genericRecords)
            throw new Error('GenericRecordsModule ist nicht initialisiert')

        await this.checkAndExpireRecords(safeAgent)

        const id = uuidv4()
        const safeUrl = String(url || '').trim()
        if (!safeUrl.startsWith('openid4vp')) throw new Error(`❌ Ungültige URL: ${safeUrl}`)

        try {
            console.log(request)
            const authRequest = request?.authorizationRequest?.payload
            const rawExpiresAt = authRequest?.exp

            // Ablaufzeitpunkt berechnen
            let expiresAt: string | undefined
            if (typeof rawExpiresAt === 'number') {
                expiresAt = new Date(rawExpiresAt * 1000).toISOString()
            } else if (typeof rawExpiresAt === 'string') {
                const parsed = new Date(rawExpiresAt)
                expiresAt = isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
            }

            const clientName = authRequest?.client_metadata?.client_name ?? 'Unknown verifier'
            const presentationName = authRequest?.presentation_definition?.name ?? 'Unnamed presentation'
            const presentationPurpose = authRequest?.presentation_definition?.purpose ?? ''

           // const sanitizedRequest = request ? sanitizeRequest(request) : undefined
            const sanitizedRequest = JSON.stringify(request)
            const record = {
                id,
                content: {
                    id,
                    url: safeUrl,
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    expiresAt,
                    clientName,
                    presentationName,
                    presentationPurpose,
                    resolvedRequest: sanitizedRequest,
                } as Record<string, unknown>,
                tags: {
                    type: this.TAG_TYPE,
                    status: 'active',
                },
            }

            console.log('💾 Speichere Record:', record)
            await safeAgent.genericRecords.save(record)

            console.log('✅ OID4VP Record gespeichert:', { id, expiresAt, clientName })
            return id
        } catch (e) {
            console.error('❌ Fehler beim Speichern des GenericRecord:', e)
            throw e
        }
    }

    /**
     * 📋 Holt alle OID4VP-Records
     */
    async getAll(agent?: Agent): Promise<Oid4vpRecordContent[]> {
        const safeAgent = agent ?? (await ensureWallet())
        if (!safeAgent.genericRecords)
            throw new Error('GenericRecordsModule ist nicht initialisiert')

        await this.checkAndExpireRecords(safeAgent)

        const all = await safeAgent.genericRecords.getAll()
    
        return all
            .filter((r: any) => r._tags?.type === this.TAG_TYPE ||
                r.tags?.type === this.TAG_TYPE)
            .map((r: any): Oid4vpRecordContent => {
                const c = r.content || {}
                return {
                    id: r.id,
                    url: String(c.url || ''),
                    createdAt: String(c.createdAt || ''),
                    status: (c.status as 'active' | 'expired') ?? 'active',
                    expiresAt: c.expiresAt ? String(c.expiresAt) : undefined,
                    clientName: String(c.clientName || 'Unknown verifier'),
                    presentationName: String(c.presentationName || 'Unnamed presentation'),
                    presentationPurpose: String(c.presentationPurpose || ''),
                    resolvedRequest:  JSON.parse(c.resolvedRequest) as Record<string, unknown> | undefined,
                }
            })
    }

    /**
     * 🔍 Holt einen einzelnen Record per ID
     */
    async getById(id: string, agent?: Agent): Promise<Oid4vpRecordContent | undefined> {
        const safeAgent = agent ?? (await ensureWallet())
        if (!safeAgent.genericRecords)
            throw new Error('GenericRecordsModule ist nicht initialisiert')

        await this.checkAndExpireRecords(safeAgent)

        const record = await safeAgent.genericRecords.findById(id)
        if (!record) return undefined

        const c = record.content as Record<string, any>
        return {
            id: record.id,
            url: String(c.url || ''),
            createdAt: String(c.createdAt || ''),
            status: (c.status as 'active' | 'expired') ?? 'active',
            expiresAt: c.expiresAt ? String(c.expiresAt) : undefined,
            clientName: String(c.clientName || 'Unknown verifier'),
            presentationName: String(c.presentationName || 'Unnamed presentation'),
            presentationPurpose: String(c.presentationPurpose || ''),
            resolvedRequest: JSON.parse(c.resolvedRequest) as Record<string, unknown>,
        }
    }

    /**
     * 🗑️ Löscht einen Record
     */
    async deleteById(id: string, agent?: Agent): Promise<void> {
        const safeAgent = agent ?? (await ensureWallet())
        if (!safeAgent.genericRecords)
            throw new Error('GenericRecordsModule ist nicht initialisiert')

        try {
            await safeAgent.genericRecords.deleteById(id)
            console.log('🗑️ Record gelöscht:', id)
        } catch (e) {
            console.error('❌ Fehler beim Löschen des GenericRecord:', e)
        }
    }
}
