import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import ScreenNavigatorButtons from '../ScreenNavigatorButtons';

describe('ScreenNavigatorButtons Component', () => {
  it('should render ScreenNavigatorButtons correctly and respond on press', () => {
    const onLeftPressMock = jest.fn();
    const onRightPressMock = jest.fn();

    const { getByTestId } = render(
      <ScreenNavigatorButtons
        onLeftPress={onLeftPressMock}
        onRightPress={onRightPressMock}
      />,
    );
    const screenNavigatorButtons = getByTestId('ScreenNavigatorButtons');
    fireEvent(
      screenNavigatorButtons.children[0] as ReactTestInstance,
      'onPress',
    );
    fireEvent.press(screenNavigatorButtons);
    expect(onLeftPressMock).toHaveBeenCalled();

    fireEvent(
      screenNavigatorButtons.children[1] as ReactTestInstance,
      'onPress',
    );
    fireEvent.press(screenNavigatorButtons);
    expect(onRightPressMock).toHaveBeenCalled();
  });
});
