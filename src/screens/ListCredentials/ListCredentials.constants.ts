import { CredentialExchangeRecord } from '@credo-ts/core';

const MOCK_CREDENTIALS_LIST: CredentialExchangeRecord[] = [
  {
    _tags: {
      connectionId: '07089a4a-7aba-497b-b8bc-c2e1a0934865',
      state: 'request-sent',
      threadId: '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
    },
    connectionId: '07089a4a-7aba-497b-b8bc-c2e1a0934865',
    createdAt: '2022-05-05T10:36:52.936Z',
    credentialAttributes: [[Object], [Object], [Object]],
    credentialId: '7661764c-df37-4f9b-84f1-357d3c84d11b',
    credentialMessage: {
      '@id': '058c7dfe-93d2-4291-9787-212b3786cf63',
      '@type': 'https://didcomm.org/issue-credential/1.0/issue-credential',
      'credentials~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': [Object],
      '~service': undefined,
      '~thread': [Object],
      '~timing': undefined,
      '~transport': undefined,
    },
    id: 'c388b53c-4b04-4e54-ac40-f52e9834a8f7',
    metadata: {
      '_internal/indyCredential': [
        {
          credentialDefinitionId: 'LC5aqqDP6sB7Nyn3GHn4eC:3:CL:258409:UDDI',
          schemaId: 'LC5aqqDP6sB7Nyn3GHn4eC:2:identity:1.2',
        },
      ],
      '_internal/indyRequest': [Object],
    },
    offerMessage: {
      '@id': '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
      '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
      comment: 'Created',
      credential_preview: [Object],
      'offers~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    requestMessage: {
      '@id': '0123042f-d046-408c-8477-a3fdb25ddc58',
      '@type': 'https://didcomm.org/issue-credential/1.0/request-credential',
      'requests~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': [Object],
      '~timing': undefined,
      '~transport': undefined,
    },
    state: 'done',
    threadId: '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
  },
  {
    _tags: {
      connectionId: '07089a4a-7aba-497b-b8bc-c2e1a0934865',
      state: 'request-sent',
      threadId: '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
    },
    connectionId: '07089a4a-7aba-497b-b8bc-c2e1a0934865',
    createdAt: '2022-05-05T10:36:52.936Z',
    credentialAttributes: [[Object], [Object], [Object]],
    credentialId: '7661764c-df37-4f9b-84f1-357d3c84d11b',
    credentialMessage: {
      '@id': '058c7dfe-93d2-4291-9787-212b3786cf63',
      '@type': 'https://didcomm.org/issue-credential/1.0/issue-credential',
      'credentials~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': [Object],
      '~service': undefined,
      '~thread': [Object],
      '~timing': undefined,
      '~transport': undefined,
    },
    id: 'c388b53c-4b04-4e54-ac40-f52e9834a8f7',
    metadata: {
      '_internal/indyCredential': [
        {
          credentialDefinitionId: 'LC5aqqDP6sB7Nyn3GHn4eC:3:CL:258409:UDDI',
          schemaId: 'LC5aqqDP6sB7Nyn3GHn4eC:2:identity:1.2',
        },
      ],
      '_internal/indyRequest': [Object],
    },
    offerMessage: {
      '@id': '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
      '@type': 'https://didcomm.org/issue-credential/1.0/offer-credential',
      comment: 'Created',
      credential_preview: [Object],
      'offers~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': undefined,
      '~timing': undefined,
      '~transport': undefined,
    },
    requestMessage: {
      '@id': '0123042f-d046-408c-8477-a3fdb25ddc58',
      '@type': 'https://didcomm.org/issue-credential/1.0/request-credential',
      'requests~attach': [Array],
      '~attach': undefined,
      '~l10n': undefined,
      '~please_ack': undefined,
      '~service': undefined,
      '~thread': [Object],
      '~timing': undefined,
      '~transport': undefined,
    },
    state: 'done',
    threadId: '1b93fd9b-147b-47af-97b0-dd94bb5ed70e',
  },
];
export default MOCK_CREDENTIALS_LIST;
