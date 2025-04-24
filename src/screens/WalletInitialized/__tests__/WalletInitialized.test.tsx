import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { create } from 'react-test-renderer';
import WalletInitialized from '../WalletInitialized';

describe('Wallet Initialization', () => {
  it('should render correctly', () => {
    const setAuthenticatedMock = jest.fn();
    const tree = create(
      <WalletInitialized
        navigation={useNavigation()}
        route={{ params: { setAuthenticated: setAuthenticatedMock } }}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
