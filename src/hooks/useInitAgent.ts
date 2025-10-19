// agent/modules.ts
import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@credo-ts/anoncreds'
import { OpenId4VcHolderModule } from '@credo-ts/openid4vc'
import { AskarModule } from '@credo-ts/askar'

import {
  ConnectionsModule,
  CredentialsModule,
  DidsModule,
  MediationRecipientModule,
  MediatorPickupStrategy,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
  AutoAcceptCredential,
  AutoAcceptProof,
  Agent,
  ConsoleLogger,
  LogLevel,
  HttpOutboundTransport,
  WsOutboundTransport,
  WalletConfig,
  WalletExportImportConfig,
} from '@credo-ts/core'
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
} from '@credo-ts/indy-vdr'
import { WebDidResolver, KeyDidResolver, JwkDidResolver } from '@credo-ts/core'

import { ariesAskar } from '@hyperledger/aries-askar-react-native'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { indyVdr } from '@hyperledger/indy-vdr-react-native'

import { indyVdrLedgers } from '../../configs/ledgers/indy'
import { features } from '../config/features'
import { getAppGuid, setAppGuid } from '../utils/keychain'
import { agentDependencies } from '@credo-ts/react-native'
import { useAgent } from '@credo-ts/react-hooks'
import uuid from 'react-native-uuid'
import { GenericRecordsModule } from '@credo-ts/core/build/modules/generic-records'

export const buildModules = () => {
  const modules: Record<string, any> = {}

  const legacyIndyCredentialFormat = new LegacyIndyCredentialFormatService()
  const legacyIndyProofFormat = new LegacyIndyProofFormatService()

  // --- OID4VC ---
  if (features.oid4vc?.holder) {
    modules.openId4VcHolder = new OpenId4VcHolderModule()
    modules.genericRecords= new GenericRecordsModule()
  }

  // --- Indy ---
  if (features.indy?.enabled) {
    if (features.indy.askar) {
      modules.askar = new AskarModule({ ariesAskar })
    }

    if (features.indy?.mediatorUrl) {
      modules.mediationRecipient = new MediationRecipientModule({
        mediatorInvitationUrl: features.indy.mediatorUrl,
        mediatorPickupStrategy: features.indy.mediatorPickupStrategy ?? MediatorPickupStrategy.Implicit,
      })
    }

    if (features.indy.indyVdr) {
      modules.indyVdr = new IndyVdrModule({
        indyVdr,
        networks: indyVdrLedgers,
      })
    }

    if (features.indy.anoncreds) {
      modules.anoncreds = new AnonCredsModule({
        anoncreds,
        registries: [new IndyVdrAnonCredsRegistry()],
      })

      modules.credentials = new CredentialsModule({
        credentialProtocols: [
          new V1CredentialProtocol({
            indyCredentialFormat: legacyIndyCredentialFormat,
          }),
          new V2CredentialProtocol({
            credentialFormats: [
              legacyIndyCredentialFormat,
              new AnonCredsCredentialFormatService(),
            ],
          }),
        ],
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      })

      modules.proofs = new ProofsModule({
        proofProtocols: [
          new V1ProofProtocol({ indyProofFormat: legacyIndyProofFormat }),
          new V2ProofProtocol({
            proofFormats: [
              new AnonCredsProofFormatService(),
              legacyIndyProofFormat,
            ],
          }),
        ],
        autoAcceptProofs: AutoAcceptProof.ContentApproved,
      })

      modules.dids = new DidsModule({
        resolvers: [
          new IndyVdrIndyDidResolver(),
          new WebDidResolver(),
          new KeyDidResolver(),
          new JwkDidResolver(),
        ],
      })

      modules.connections = new ConnectionsModule({
        autoAcceptConnections: true,
      })
    }
  }

  return modules as const
}

type InitAgentProps = {
  walletConfig: Omit<WalletConfig, 'id'>
  importConfig?: WalletExportImportConfig
}

const useInitAgentGuid = async () => {
  let guid = await getAppGuid()
  if (!guid) {
    const agentId = uuid.v4() as string
    await setAppGuid(agentId)
    return agentId
  }
  return guid.password
}

export const useCreateAgent = async ({ walletConfig, importConfig }: InitAgentProps) => {
  const label = await useInitAgentGuid()

  const fullWalletConfig = {
    ...walletConfig,
    id: label,
  }

  const modules = buildModules()

  const newAgent = new Agent({
    dependencies: agentDependencies,
    config: {
      walletConfig: fullWalletConfig,
      label,
      autoUpdateStorageOnStartup: true,
      logger: new ConsoleLogger(LogLevel.trace),
    },
    modules,
  })

  if (importConfig) {
    try {
      await newAgent.wallet.import(fullWalletConfig, importConfig)
      await newAgent.wallet.initialize(fullWalletConfig)
    } catch (error) {
      console.log('Failed to import wallet')
    }
  }

  newAgent.registerOutboundTransport(new WsOutboundTransport())
  newAgent.registerOutboundTransport(new HttpOutboundTransport())

  await newAgent.initialize()
  return newAgent
}

export type AgentType = Awaited<ReturnType<typeof useCreateAgent>>

export const useAppAgent = () => useAgent<AgentType>()