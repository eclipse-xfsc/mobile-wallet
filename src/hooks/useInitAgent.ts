import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from '@credo-ts/anoncreds';
import { OpenId4VcHolderModule } from '@credo-ts/openid4vc'
import { DidKey, KeyDidCreateOptions, JwaSignatureAlgorithm, getJwkFromKey } from '@credo-ts/core'
import { OpenId4VciCredentialFormatProfile } from '@credo-ts/openid4vc'
import { AskarModule } from '@credo-ts/askar';
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  ConnectionsModule,
  ConsoleLogger,
  CredentialsModule,
  DidsModule,
  HttpOutboundTransport,
  LogLevel,
  MediationRecipientModule,
  MediatorPickupStrategy,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
  WalletConfig,
  WalletExportImportConfig,
  WsOutboundTransport,
} from '@credo-ts/core';
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
} from '@credo-ts/indy-vdr';
import { agentDependencies } from '@credo-ts/react-native';
import { anoncreds } from '@hyperledger/anoncreds-react-native';
import { ariesAskar } from '@hyperledger/aries-askar-react-native';
import { indyVdr } from '@hyperledger/indy-vdr-react-native';
import uuid from 'react-native-uuid';

import { indyVdrLedgers } from '../../configs/ledgers/indy';
import { getAppGuid, setAppGuid } from '../utils/keychain';

type InitAgentProps = {
  walletConfig: Omit<WalletConfig, 'id'>;
  importConfig?: WalletExportImportConfig;
};

const useInitAgentGuid = async () => {
  let guid = await getAppGuid();
  if (!guid) {
    const agentId = uuid.v4() as string;

    await setAppGuid(agentId);
    return agentId;
  } else {
    return guid.password;
  }
};


export const useCreateAgent = async ({
  walletConfig,
  importConfig,
}: InitAgentProps) => {
  const label = await useInitAgentGuid();

  const legacyIndyCredentialFormat = new LegacyIndyCredentialFormatService();
  const legacyIndyProofFormat = new LegacyIndyProofFormatService();

  const fullWalletConfig = {
    ...walletConfig,
    id: label,
  };

  const newAgent = new Agent({
    dependencies: agentDependencies,
    config: {
      walletConfig: fullWalletConfig,
      label,
      autoUpdateStorageOnStartup: true,
      logger: new ConsoleLogger(LogLevel.trace),
    },
    modules: {
      askar: new AskarModule({
        ariesAskar,
      }),
      openId4VcHolder: new OpenId4VcHolderModule(),
      mediationRecipient: new MediationRecipientModule({
        // mediatorInvitationUrl: Config.MEDIATOR_URL,
        mediatorInvitationUrl:
          'https://mediator.dev.animo.id/invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIyMDc1MDM4YS05ZGU3LTRiODItYWUxYi1jNzBmNDg4MjYzYTciLCJsYWJlbCI6IkFuaW1vIE1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vbWVkaWF0b3IuZGV2LmFuaW1vLmlkIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtvSG9RTUphdU5VUE5OV1pQcEw3RGs1SzNtQ0NDMlBpNDJGY3FwR25iampMcSJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly9tZWRpYXRvci5kZXYuYW5pbW8uaWQiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa29Ib1FNSmF1TlVQTk5XWlBwTDdEazVLM21DQ0MyUGk0MkZjcXBHbmJqakxxIl0sInJvdXRpbmdLZXlzIjpbXX1dfQ',
        mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
      }),
      indyVdr: new IndyVdrModule({
        indyVdr,
        networks: indyVdrLedgers,
      }),
      connections: new ConnectionsModule({
        autoAcceptConnections: true,
      }),
      dids: new DidsModule({
        resolvers: [new IndyVdrIndyDidResolver()],
      }),
      anoncreds: new AnonCredsModule({
        anoncreds: anoncreds,
        registries: [new IndyVdrAnonCredsRegistry()],
      }),
      credentials: new CredentialsModule({
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
      }),
      proofs: new ProofsModule({
        proofProtocols: [
          new V1ProofProtocol({
            indyProofFormat: legacyIndyProofFormat,
          }),
          new V2ProofProtocol({
            proofFormats: [
              new AnonCredsProofFormatService(),
              legacyIndyProofFormat,
            ],
          }),
        ],
        autoAcceptProofs: AutoAcceptProof.ContentApproved,
      }),
    },
  });

  if (importConfig) {
    try {
      await newAgent.wallet.import(fullWalletConfig, importConfig);
      await newAgent.wallet.initialize(fullWalletConfig);
    } catch (error) {
      console.log('Failed to import wallet');
    }
  }

  const wsTransport = new WsOutboundTransport();
  const httpTransport = new HttpOutboundTransport();

  newAgent.registerOutboundTransport(wsTransport);
  newAgent.registerOutboundTransport(httpTransport);

  await newAgent.initialize();

  return newAgent;
};

export type AgentType = Awaited<ReturnType<typeof useCreateAgent>>;