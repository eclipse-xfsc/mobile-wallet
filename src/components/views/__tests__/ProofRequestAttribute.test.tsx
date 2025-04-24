import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SafeAreaScrollView from '../SafeAreaScrollView';
import ProofRequestAttribute from '../ProofRequestAttribute';

describe('ProofRequestAttribute Component', () => {
  it('should render proof request attribute correctly', () => {
    const proofRequest = [
      {
        key: 'JoieDon',
        credentials: [
          {
            isSelected: true,
            label: 'name',
            value: 'JoieDon',
          },
        ],
        names: ['JoieDon', 'JoieDon1'],
        values: ['JoieDon', 'JoieDon1'],
      },
      {
        key: 'kevin',
        credentials: [
          {
            isSelected: true,
            label: 'name',
            value: 'kevin',
          },
        ],
        names: ['kevin', 'kevin1'],
        values: ['kevinvalues', 'kevin1'],
      },
    ];
    const onSelectItemMock = jest.fn();
    const { getByTestId } = render(
      <ProofRequestAttribute
        proofRequest={proofRequest}
        onSelectItem={onSelectItemMock}
      />,
    );
    const proofRequestAttribute = getByTestId('proofRequestAttribute');
    fireEvent.press(proofRequestAttribute);
  });
  it('should render safeareaview correctly', () => {
    const { getByTestId } = render(
      <SafeAreaScrollView>safeareaview</SafeAreaScrollView>,
    );
    const safeareaview = getByTestId('safeareaview');
    fireEvent.press(safeareaview);
  });
});
