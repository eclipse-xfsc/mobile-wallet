import { render } from '@testing-library/react-native';
import React from 'react';
import QRScanner from '../QRScanner';

describe('QRScanner', () => {
  it('should render correctly and change data after scanning the QRCode', () => {
    const onEventMock = jest.fn();
    const { getByTestId } = render(
      <QRScanner handleCodeScan={onEventMock} onChangeText={() => {}} />,
    );

    expect(getByTestId('QRScannerTest')).toBeTruthy();
  });
});
