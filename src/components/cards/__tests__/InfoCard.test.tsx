import { render } from '@testing-library/react-native';
import React from 'react';
import InfoCard from '../InfoCard';

describe('InfoCard', () => {
  it('should render correctly', () => {
    const { getByText } = render(<InfoCard showBottomIcon>Testing</InfoCard>);

    const infoCard = getByText('Testing');
    expect(infoCard).toBeTruthy();
  });
});
