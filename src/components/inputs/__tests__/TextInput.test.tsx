import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import TextInput from '../TextInput';

describe('TextInput', () => {
  it('should render correctly and change textInput values after input is added', () => {
    const onEventMock = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <TextInput
        label="textInput"
        placeholder="placeholder"
        onChangeText={onEventMock}
      />,
    );

    const text = getByTestId('label');
    expect(text.children[0]).toBe('textInput');
    const textInput = getByPlaceholderText('placeholder');
    fireEvent(textInput, 'onChangeText', 'text');
    expect(onEventMock).toHaveBeenCalledWith('text');
  });
});
