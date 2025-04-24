import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CheckBoxRow from '../CheckBoxRow';

describe('CheckBoxRow', () => {
  it('should render correctly and respond when clicked on check box', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <CheckBoxRow
        title="CheckBoxRow"
        accessibilityLabel="CheckBoxRow"
        checked={false}
        onPress={onPressMock}
      />,
    );

    const checkbox = getByTestId('checkBoxRow');
    fireEvent(checkbox, 'onPress');
    fireEvent.press(checkbox);
    expect(onPressMock).toHaveBeenCalled();
  });
});
