import { render } from '@testing-library/react-native';
import React from 'react';
import Initialization from '../initialization';

describe('Initialization', () => {
  it('should render correctly and respond when pressed', () => {
    const { getByTestId } = render(
      <Initialization navigation={undefined} route={undefined} />,
    );
  });
});
