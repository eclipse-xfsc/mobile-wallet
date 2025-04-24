import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import QRScannerClose from '../QRScannerClose';

describe('QRScannerClose', () => {
  it('should render QRScannerClose and respond onPress', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<QRScannerClose onPress={onPressMock} />);

    const qrClose = getByTestId('closeButton');
    fireEvent.press(qrClose);
    expect(onPressMock).toHaveBeenCalled();
  });
});
