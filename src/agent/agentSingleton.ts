import type { Agent } from '@credo-ts/core'

let globalAgent: Agent | undefined

export const setGlobalAgent = (agent: Agent) => {
  globalAgent = agent
}

export const getGlobalAgent = (): Agent => {
  if (!globalAgent) throw new Error('❌ Agent not set yet')
  return globalAgent
}

// Öffnet Wallet automatisch, wenn sie geschlossen ist
export const ensureWallet = async (): Promise<Agent> => {
  const agent = getGlobalAgent()

  if (!agent.wallet) throw new Error('❌ Agent has no wallet instance')
  const walletConfig = agent.wallet.walletConfig
  if (!walletConfig) throw new Error('❌ Missing wallet configuration')

  if (!agent.wallet.isInitialized) {
    console.warn('⚙️ Wallet closed — reopening...')
    await agent.wallet.open(walletConfig)
  }

  return agent
}
