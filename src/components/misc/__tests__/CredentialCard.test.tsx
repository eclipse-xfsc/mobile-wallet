import React from 'react';
import {
  CredentialMetadataKeys,
  V1CredentialPreview,
  CredentialExchangeRecord,
  CredentialState,
} from '@credo-ts/core';
import { Alert } from 'react-native';
import { render } from '@testing-library/react-native';
import CredentialCard from '../CredentialCard';
import { parsedSchema } from '../../../utils/helpers';

const credentialRecord = new CredentialExchangeRecord({
  connectionId: '28790bfe-1345-4c64-b21a-7d98982b3894',
  threadId: 'threadId',
  state: CredentialState.Done,
  credentialAttributes: [
    new V1CredentialPreview({
      name: 'age',
      value: '25',
    }),
  ],
});
credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
  credentialDefinitionId: 'Th7MpTaRZVRYnPiabds81Y:3:CL:17:TA',
  schemaId: 'TL1EaPFCZ8Si5aUrqScBDt:2:testschema:1.0',
});

describe('CredentialCard', () => {
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

  it('testing', () => {
    // Alert.alert = jest.genMockFunction();
    Alert.alert = jest.fn();
    const { getByText } = render(
      <CredentialCard credential={credentialRecord} />,
    );
    const name = getByText(parsedSchema(credentialRecord).name);

    expect(name.props.children).toBe(parsedSchema(credentialRecord).name);
  });
});
