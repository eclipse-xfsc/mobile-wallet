import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SettingListItem from '../SettingListItem';

describe('SettingListItem', () => {
  it('should render settings item correctly and respond on press', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SettingListItem title="Language" onPress={onPressMock} />,
    );

    const contactListItem = getByTestId('setting-list-item');
    fireEvent.press(contactListItem);
    expect(onPressMock).toHaveBeenCalled();
  });
});
