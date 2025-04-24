import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RecordAttribute from '../RecordAttribute';
import RecordFooter from '../RecordFooter';
import RecordHeader from '../RecordHeader';

describe('Record Component', () => {
  it('should render record attribute correctly', () => {
    const attribute = [{ name: 'JoieDon', value: 'JoieDon-Value' }];

    const { getByTestId } = render(
      <RecordAttribute attribute={attribute[0]} />,
    );
    const AttributeName = getByTestId('AttributeName');
    fireEvent.press(AttributeName);
    const AttributeValue = getByTestId('AttributeValue');
    fireEvent.press(AttributeValue);
  });
  it('should render record footer correctly', () => {
    const { getByTestId } = render(<RecordFooter />);
    const recordFooter = getByTestId('recordFooter');
    fireEvent.press(recordFooter);
  });
  it('should render record header correctly', () => {
    const { getByTestId } = render(<RecordHeader />);
    const recordHeader = getByTestId('recordHeader');
    fireEvent.press(recordHeader);
  });
});
