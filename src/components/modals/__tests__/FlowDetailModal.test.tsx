import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/core';
import FlowDetailModal from '../FlowDetailModal';

describe('Modal Component', () => {
  const navigation = useNavigation();
  it('should render notification modal start correctly', () => {
    const { getByTestId } = render(
      <FlowDetailModal visible title="Modal Open" />,
    );
    const notificationModal = getByTestId('notificationModal');
    const closeModal = getByTestId('closeModal');
    expect(notificationModal.props.visible).toBe(true);
    fireEvent.press(closeModal);
    expect(navigation.navigate).toHaveBeenCalledWith('Home');
  });
  it('should render notification modal close correctly', () => {
    const { getByTestId } = render(
      <FlowDetailModal visible={false} title="Modal Close" />,
    );
    const notificationModal = getByTestId('notificationModal');
    expect(notificationModal.props.visible).toBe(false);
  });
});
