import {
  V1CredentialPreview,
  CredentialExchangeRecord,
  CredentialState,
} from '@credo-ts/core';
import { useNavigation } from '@react-navigation/core';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CredentialListItem from '../CredentialListItem';

const credentialRecord = new CredentialExchangeRecord({
  connectionId: '34da4abe-7578-464f-909c-ee19a3bdf7ac',
  threadId: 'threadId',
  state: CredentialState.Done,
  credentialId: '30ba35ab-7823-4123-8bdf-7a112a366d3b',
  credentialAttributes: [
    new V1CredentialPreview({
      name: 'age',
      value: '25',
    }),
  ],
});

describe('CredentialListItem', () => {
  it('should render credential details correctly when credential record is passed as prop', () => {
    const navigation = useNavigation();
    const { getByTestId } = render(
      <CredentialListItem credential={credentialRecord} />,
    );

    const credentialListItem = getByTestId('credential-list-item');
    fireEvent.press(credentialListItem);
    expect(navigation.navigate).toHaveBeenCalledWith('Credential Details', {
      credentialId: credentialRecord.id,
    });
  });
});
