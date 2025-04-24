import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import DropDown from '../DropDown';

jest.mock('react-native-dropdown-picker', () => 'DropDown');

describe('DropDown', () => {
  it('should render DropDown correctly and respond on press', () => {
    const items = [
      { value: '1', label: 'item 1', testID: 'item1' },
      { value: '2', label: 'item 2', testID: 'item2' },
      { value: '3', label: 'item 3', testID: 'item3' },
    ];

    const onSelectItemMock = jest.fn();

    const { getByTestId } = render(
      <DropDown items={items} onSelectItem={onSelectItemMock} />,
    );
    const dropDown = getByTestId('dropdown');
    fireEvent(dropDown, 'onSelectItem');
    expect(onSelectItemMock).toHaveBeenCalled();
  });
});
