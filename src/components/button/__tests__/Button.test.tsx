import React from 'react';
import { render } from '@testing-library/react-native';
import Button, { ButtonType } from '../Button';

describe('Button Component', () => {
  it('should render primary button correctly', () => {
    const { getByLabelText } = render(
      <Button title="PrimaryButton" buttonType={ButtonType.Primary} />,
    );
    expect(getByLabelText('PrimaryButton')).toBeTruthy();
  });

  it('should render warning button correctly', () => {
    const { getByLabelText } = render(
      <Button title="WarningButton" buttonType={ButtonType.Warning} />,
    );
    expect(getByLabelText('WarningButton')).toBeTruthy();
  });

  it('should render ghost button correctly', () => {
    const { getByLabelText } = render(
      <Button title="GhostButton" buttonType={ButtonType.Ghost} />,
    );
    expect(getByLabelText('GhostButton')).toBeTruthy();
  });
});
