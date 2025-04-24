import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import IconButton from '../IconButton';

describe('IconButton', () => {
  it('should render correctly and respond when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<IconButton onPress={onPressMock} />);

    const iconButton = getByTestId('IconButton');
    fireEvent(iconButton, 'onPress');
    fireEvent.press(iconButton);
    expect(onPressMock).toHaveBeenCalled();
  });
});
