import { DidExchangeState } from '@credo-ts/core';
import { useNavigation } from '@react-navigation/core';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ContactListItem from '../ContactListItem';

import { getMockConnection } from '../../../utils/testhelpers';

const connectionRecord = getMockConnection({
  id: 'testConnectionId',
  theirLabel: 'private beta',
  did: 'SL2dA5wcdY8NEhkKwYeVNb',
  state: DidExchangeState.Completed,
  createdAt: new Date('2022-04-29T06:36:48.244Z'),
});

describe('ContactListItem', () => {
  it('should render connection details correctly when connection record is passed as prop', () => {
    const navigation = useNavigation();
    const { getByTestId, getByText } = render(
      <ContactListItem contact={connectionRecord} />,
    );
    const label = getByText('private beta');
    const didText = getByText('DID : SL2dA5wcdY8NEhkKwYeVNb');
    const stateText = getByText('State : completed');
    expect(label.props.children).toBe(connectionRecord?.theirLabel);
    expect(didText.props.children[1]).toBe(connectionRecord?.did);
    expect(stateText.props.children[1]).toBe(connectionRecord.state);

    const contactListItem = getByTestId('contact-list-item');
    fireEvent.press(contactListItem);
    expect(navigation.navigate).toHaveBeenCalledWith('ConnectionDetails', {
      connectionId: 'testConnectionId',
    });
  });
});
