import React from 'react';
import { useNavigation } from '@react-navigation/core';
import { fireEvent, render } from '@testing-library/react-native';
import { DidExchangeState } from '@credo-ts/core';
import { Alert } from 'react-native';
import { Screens } from '../../../types/navigators';
import ContactDetails from '../ContactDetails';
import { useConnectionById } from '../../../../__mocks__/@credo-ts/react-hooks';
import { getMockConnection } from '../../../utils/testhelpers';

describe('ContactDetails', () => {
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
    useConnectionById.mockImplementation(() =>
      getMockConnection({
        id: 'tesid',
        theirLabel: 'test-label',
        did: 'SL2dA5wcdY8NEhkKwYeVNb',
        state: DidExchangeState.Completed,
        createdAt: new Date('2022-04-29T06:36:48.244Z'),
      }),
    );
    // Alert.alert = jest.genMockFunction();
    Alert.alert = jest.fn();
    const { getByText, getByTestId } = render(
      <ContactDetails
        route={{
          params: { connectionId: 'connectionRecord.id ' },
          key: '',
          name: Screens.ContactDetails,
        }}
        navigation={useNavigation()}
      />,
    );
    const name = getByText('test-label');
    const didText = getByText('SL2dA5wcdY8NEhkKwYeVNb');
    const stateText = getByText('completed');

    expect(name.props.children).toBe('test-label');
    expect(didText.props.children).toBe('SL2dA5wcdY8NEhkKwYeVNb');
    expect(stateText.props.children).toBe('completed');

    const contactListItem = getByTestId('delete-contact');
    fireEvent.press(contactListItem);
    expect(Alert.alert.mock.calls.length).toBe(1);
  });
});
