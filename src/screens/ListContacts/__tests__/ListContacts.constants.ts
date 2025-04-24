import { ConnectionRecord } from '@credo-ts/core';

const MOCK_CONNECTION_LIST: ConnectionRecord[] = [
  {
    _tags: {
      did: 'SL2dA5wcdY8NEhkKwYeVNb',
      verkey: 'EofsWGeCGAdb3k5gepePiHvPXJkm59dQUwogP3FHHTZp',
      state: 'complete',
      role: 'invitee',
      theirDid: 'XBudZhfzGFFfcEuGyREGQy',
      invitationKey: '6PtQuy9St6hD2zJWnfxnN6aBnK3vfY7WU7WhhoZGAaz5',
      mediatorId: '68bbc5d0-7b1b-4b35-9c40-fd72ccd67f8e',
      theirKey: 'HTJdr7YPxKBb4AiapjwLG5asepcVyPJZPdcmixGqP8V3',
      threadId: '03d19628-e119-4763-9f38-0790545922c9',
    },
    metadata: {},
    id: '34da4abe-7578-464f-909c-ee19a3bdf7ac',
    createdAt: '2022-04-29T06:36:48.244Z',
    did: 'SL2dA5wcdY8NEhkKwYeVNb',
    didDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'SL2dA5wcdY8NEhkKwYeVNb#1',
          controller: 'SL2dA5wcdY8NEhkKwYeVNb',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'EofsWGeCGAdb3k5gepePiHvPXJkm59dQUwogP3FHHTZp',
        },
      ],
      service: [
        {
          id: 'SL2dA5wcdY8NEhkKwYeVNb#IndyAgentService',
          serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['EofsWGeCGAdb3k5gepePiHvPXJkm59dQUwogP3FHHTZp'],
          routingKeys: ['DGYY31KpABLT4ydNHw11rRneEL8a41X4s6xqre2cAEbn'],
        },
      ],
      authentication: [
        {
          publicKey: 'SL2dA5wcdY8NEhkKwYeVNb#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'SL2dA5wcdY8NEhkKwYeVNb',
    },
    verkey: 'EofsWGeCGAdb3k5gepePiHvPXJkm59dQUwogP3FHHTZp',
    theirLabel: 'ABC',
    state: 'complete',
    role: 'invitee',
    invitation: {
      '@type': 'https://didcomm.org/connections/1.0/invitation',
      '@id': '031d7c03-51d2-488f-b53f-659bccbf03b3',
      label: 'private beta',
      recipientKeys: ['6PtQuy9St6hD2zJWnfxnN6aBnK3vfY7WU7WhhoZGAaz5'],
      imageUrl: '',
      serviceEndpoint: 'https://ws.app',
    },
    imageUrl: '',
    multiUseInvitation: false,
    mediatorId: '68bbc5d0-7b1b-4b35-9c40-fd72ccd67f8e',
    theirDid: 'XBudZhfzGFFfcEuGyREGQy',
    theirDidDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'did:sov:XBudZhfzGFFfcEuGyREGQy#1',
          controller: 'did:sov:XBudZhfzGFFfcEuGyREGQy',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'HTJdr7YPxKBb4AiapjwLG5asepcVyPJZPdcmixGqP8V3',
        },
      ],
      service: [
        {
          id: 'did:sov:XBudZhfzGFFfcEuGyREGQy;indy',
          serviceEndpoint: 'https://ws.app',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['HTJdr7YPxKBb4AiapjwLG5asepcVyPJZPdcmixGqP8V3'],
        },
      ],
      authentication: [
        {
          publicKey: 'did:sov:XBudZhfzGFFfcEuGyREGQy#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'did:sov:XBudZhfzGFFfcEuGyREGQy',
    },
    threadId: '03d19628-e119-4763-9f38-0790545922c9',
  },
  {
    _tags: {
      verkey: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
      role: 'invitee',
      did: '249Jvb1uAvZr7rm2tfe3qm',
      invitationKey: 'E9VXJcZshiXqqLEwzGtmPJBRpm29xvbLaZnZKSSFNvA6',
      state: 'complete',
      threadId: '31ec4cde-832a-4d10-a581-b668c8f34ab0',
      theirDid: 'JgPvbKPJKxaGPEJYHGKaYo',
      theirKey: 'AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa',
    },
    metadata: {},
    id: '3f2ccf46-c39c-4afb-a65a-d39879d8324b',
    createdAt: '2022-04-29T06:35:20.846Z',
    did: '249Jvb1uAvZr7rm2tfe3qm',
    didDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '249Jvb1uAvZr7rm2tfe3qm#1',
          controller: '249Jvb1uAvZr7rm2tfe3qm',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
        },
      ],
      service: [
        {
          id: '249Jvb1uAvZr7rm2tfe3qm#IndyAgentService',
          serviceEndpoint: 'didcomm:transport/queue',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys'],
          routingKeys: [],
        },
      ],
      authentication: [
        {
          publicKey: '249Jvb1uAvZr7rm2tfe3qm#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: '249Jvb1uAvZr7rm2tfe3qm',
    },
    verkey: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
    theirLabel: 'connection 2',
    state: 'complete',
    role: 'invitee',
    invitation: {
      '@type': 'https://didcomm.org/connections/1.0/invitation',
      '@id': 'b19a36f7-f8bf-4286-88f9-838e22d24f41',
      recipientKeys: ['E9VXJcZshiXqqLEwzGtmPJBRpm29xvbLaZnZKSSFNvA6'],
      serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
      label: 'Indicio Public Mediator',
    },
    multiUseInvitation: false,
    theirDid: 'JgPvbKPJKxaGPEJYHGKaYo',
    theirDidDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo#1',
          controller: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa',
        },
      ],
      service: [
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo;indy',
          serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa'],
        },
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo;indy1',
          serviceEndpoint: 'ws://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa'],
        },
      ],
      authentication: [
        {
          publicKey: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo',
    },
    threadId: '31ec4cde-832a-4d10-a581-b668c8f34ab0',
  },
  {
    _tags: {
      role: 'invitee',
      theirDid: '3T3jC2s4BrG64BevAhjxCE',
      invitationKey: 'EaTyGxH6wEjcSmFMRNQqQaXGLMRvSav81RJpxKW92mNc',
      theirKey: '2LRPR6LjqRTzh1DCX6Qd4HbSi5KTLKwuYk8wmh3jdRJF',
      did: 'V6P8ZGxxwnMcyvDK7SJNzu',
      verkey: 'GK4xs2HUkDvDdqKL8BdLHr2N97HFiS7xs5aw3jfetWQV',
      state: 'complete',
      threadId: '1c607534-88f8-4002-a52f-b0d2ddcdb8c9',
      mediatorId: '68bbc5d0-7b1b-4b35-9c40-fd72ccd67f8e',
    },
    metadata: {},
    id: '23d13911-4ee4-4e76-8533-afb1443e425d',
    createdAt: '2022-04-29T06:37:49.618Z',
    did: 'V6P8ZGxxwnMcyvDK7SJNzu',
    didDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'V6P8ZGxxwnMcyvDK7SJNzu#1',
          controller: 'V6P8ZGxxwnMcyvDK7SJNzu',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'GK4xs2HUkDvDdqKL8BdLHr2N97HFiS7xs5aw3jfetWQV',
        },
      ],
      service: [
        {
          id: 'V6P8ZGxxwnMcyvDK7SJNzu#IndyAgentService',
          serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['GK4xs2HUkDvDdqKL8BdLHr2N97HFiS7xs5aw3jfetWQV'],
          routingKeys: ['DGYY31KpABLT4ydNHw11rRneEL8a41X4s6xqre2cAEbn'],
        },
      ],
      authentication: [
        {
          publicKey: 'V6P8ZGxxwnMcyvDK7SJNzu#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'V6P8ZGxxwnMcyvDK7SJNzu',
    },
    verkey: 'GK4xs2HUkDvDdqKL8BdLHr2N97HFiS7xs5aw3jfetWQV',
    theirLabel: 'connection 3',
    state: 'complete',
    role: 'invitee',
    invitation: {
      '@type': 'https://didcomm.org/connections/1.0/invitation',
      '@id': '2b83c729-3a67-44fb-a443-a65ba7a6e80e',
      label: 'CANdy-Dev BPA',
      recipientKeys: ['EaTyGxH6wEjcSmFMRNQqQaXGLMRvSav81RJpxKW92mNc'],
      serviceEndpoint: 'http://11.111.111.11:8030',
    },
    multiUseInvitation: false,
    mediatorId: '68bbc5d0-7b1b-4b35-9c40-fd72ccd67f8e',
    theirDid: '3T3jC2s4BrG64BevAhjxCE',
    theirDidDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'did:sov:3T3jC2s4BrG64BevAhjxCE#1',
          controller: 'did:sov:3T3jC2s4BrG64BevAhjxCE',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: '2LRPR6LjqRTzh1DCX6Qd4HbSi5KTLKwuYk8wmh3jdRJF',
        },
      ],
      service: [
        {
          id: 'did:sov:3T3jC2s4BrG64BevAhjxCE;indy',
          serviceEndpoint: 'http://11.11.111.11:8030',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['2LRPR6LjqRTzh1DCX6Qd4HbSi5KTLKwuYk8wmh3jdRJF'],
        },
      ],
      authentication: [
        {
          publicKey: 'did:sov:3T3jC2s4BrG64BevAhjxCE#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'did:sov:3T3jC2s4BrG64BevAhjxCE',
    },
    threadId: '1c607534-88f8-4002-a52f-b0d2ddcdb8c9',
  },
  {
    _tags: {
      verkey: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
      role: 'invitee',
      did: '249Jvb1uAvZr7rm2tfe3qm',
      invitationKey: 'E9VXJcZshiXqqLEwzGtmPJBRpm29xvbLaZnZKSSFNvA6',
      state: 'complete',
      threadId: '31ec4cde-832a-4d10-a581-b668c8f34ab0',
      theirDid: 'JgPvbKPJKxaGPEJYHGKaYo',
      theirKey: 'AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa',
    },
    metadata: {},
    id: '3f2ccf46-c39c-4afb-a65a-d39879d8324b',
    createdAt: '2022-04-29T06:35:20.846Z',
    did: '249Jvb1uAvZr7rm2tfe3qm',
    didDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: '249Jvb1uAvZr7rm2tfe3qm#1',
          controller: '249Jvb1uAvZr7rm2tfe3qm',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
        },
      ],
      service: [
        {
          id: '249Jvb1uAvZr7rm2tfe3qm#IndyAgentService',
          serviceEndpoint: 'didcomm:transport/queue',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys'],
          routingKeys: [],
        },
      ],
      authentication: [
        {
          publicKey: '249Jvb1uAvZr7rm2tfe3qm#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: '249Jvb1uAvZr7rm2tfe3qm',
    },
    verkey: 'aKrpYPFyqwmovwZahfJtT8K2Ai1Zz7ywH24uJjDNjys',
    theirLabel: 'Mediator',
    state: 'complete',
    role: 'invitee',
    invitation: {
      '@type': 'https://didcomm.org/connections/1.0/invitation',
      '@id': 'b19a36f7-f8bf-4286-88f9-838e22d24f41',
      recipientKeys: ['E9VXJcZshiXqqLEwzGtmPJBRpm29xvbLaZnZKSSFNvA6'],
      serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
      label: 'Mediator',
    },
    multiUseInvitation: false,
    theirDid: 'JgPvbKPJKxaGPEJYHGKaYo',
    theirDidDoc: {
      '@context': 'https://w3id.org/did/v1',
      publicKey: [
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo#1',
          controller: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo',
          type: 'Ed25519VerificationKey2018',
          publicKeyBase58: 'AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa',
        },
      ],
      service: [
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo;indy',
          serviceEndpoint: 'http://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa'],
        },
        {
          id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo;indy1',
          serviceEndpoint: 'ws://mediator3.test.indiciotech.io:3000',
          type: 'IndyAgent',
          priority: 0,
          recipientKeys: ['AdsmNZ1puUPmBoXSJD9vvpvF2UxTYpYT2vrkdViYuAFa'],
        },
      ],
      authentication: [
        {
          publicKey: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo#1',
          type: 'Ed25519SignatureAuthentication2018',
        },
      ],
      id: 'did:sov:JgPvbKPJKxaGPEJYHGKaYo',
    },
    threadId: '31ec4cde-832a-4d10-a581-b668c8f34ab0',
  },
];

export default MOCK_CONNECTION_LIST;
