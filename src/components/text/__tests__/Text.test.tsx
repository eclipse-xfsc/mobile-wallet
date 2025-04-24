import React from 'react';
import { render } from '@testing-library/react-native';
import HighlightTextBox from '../HighlightTextBox';
import InfoTextBox from '../InfoTextBox';
import Text from '../Text';
import Title from '../Title';

describe('Text Component', () => {
  it('should render highlight text correctly', () => {
    const { getByLabelText } = render(
      <HighlightTextBox>HighlightTextBox</HighlightTextBox>,
    );
    expect(getByLabelText('HighlightTextBox')).toBeTruthy();
  });

  it('should render info text correctly', () => {
    const { getByLabelText } = render(<InfoTextBox>InfoTextBox</InfoTextBox>);
    expect(getByLabelText('InfoTextBox')).toBeTruthy();
  });

  it('should render text correctly', () => {
    const { getByLabelText } = render(<Text>Text</Text>);
    expect(getByLabelText('Text')).toBeTruthy();
  });

  it('should render title correctly', () => {
    const { getByLabelText } = render(<Title>Title</Title>);
    expect(getByLabelText('Title')).toBeTruthy();
  });
});
