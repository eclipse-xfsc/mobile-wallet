import { render } from '@testing-library/react-native';
import React from 'react';
import AvatarView from '../AvatarView';

describe('AvatarView', () => {
  it('should render avatarText with first character of the title', () => {
    const { getByText } = render(<AvatarView name="avatar" />);

    const avatarText = getByText('a');
    expect(avatarText.props.children).toBe('a');
  });
  it('should render avatarText with first character of the title with single character', () => {
    const { getByText } = render(<AvatarView name="K" />);

    const avatarText = getByText('K');
    expect(avatarText.props.children).toBe('K');
  });
});
