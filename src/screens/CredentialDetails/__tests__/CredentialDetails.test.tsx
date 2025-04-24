import React from 'react';
import {
  CredentialMetadataKeys,
  CredentialExchangeRecord,
  CredentialState,
  CredentialPreviewAttribute,
} from '@credo-ts/core';
import { useNavigation } from '@react-navigation/core';
import { create } from 'react-test-renderer';
import CredentialDetails from '../CredentialDetails';
import { Screens } from '../../../types/navigators';

const credentialRecord = new CredentialExchangeRecord({
  connectionId: '28790bfe-1345-4c64-b21a-7d98982b3894',
  threadId: 'threadId',
  state: CredentialState.Done,
  credentialAttributes: [
    new CredentialPreviewAttribute({
      name: 'age',
      value: '25',
    }),
  ],
  protocolVersion: 'v1',
});

credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
  credentialDefinitionId: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TA',
  schemaId: 'TL1EaPFCZ8Si5aUrqScBDt:2:testschema:1.0',
});

jest.mock('i18next', () => ({
  use: jest.fn(() => ({})),
  init: jest.fn(() => ({})),
  t: k => k,
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));
describe('CredentialDetails', () => {
  jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');

    return Object.setPrototypeOf(
      {
        Alert: {
          ...RN.Alert,
          alert: jest.fn(),
        },
      },
      RN,
    );
  });
  it('credential details render correctly', () => {
    const tree = create(
      <CredentialDetails
        route={{
          params: { credentialId: credentialRecord.id },
          key: '',
          name: Screens.CredentialDetails,
        }}
        navigation={useNavigation()}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
