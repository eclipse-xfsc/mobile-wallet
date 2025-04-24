import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SingleSelectBlock from '../SingleSelectBlock';

describe('SingleSelectBlock', () => {
  it('should render correctly and get selected value from array', () => {
    const mockData = [
      { id: '1', value: 'value1' },
      { id: '2', value: 'value2' },
      { id: '3', value: 'value3' },
    ];

    const onPressMock = jest.fn();

    const { getByText } = render(
      <SingleSelectBlock selection={mockData} onSelect={onPressMock} />,
    );

    const singleSelectBlockValue = getByText('value3');
    fireEvent.press(singleSelectBlockValue);
    expect(onPressMock).toHaveBeenCalledWith(mockData[2]);
  });
});
