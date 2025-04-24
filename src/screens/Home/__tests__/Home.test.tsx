import { useNavigation } from '@react-navigation/core';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { FlatList } from 'react-native';
import { create } from 'react-test-renderer';
import { NotificationListItem } from '../../../components';
import Home from '../Home';

describe('displays a home screen', () => {
  jest.useFakeTimers();
  it('renders correctly', () => {
    const tree = create(<Home navigation={useNavigation()} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  /**
   * Scenario: Home Screen without any pending notification
   * Given wallet has successfully loaded
   * When the holder selects the "Home" button in the main navigation bar
   * Then the Home Screen is displayed
   */
  it('defaults to no notifications', async () => {
    const { findByText } = render(<Home navigation={useNavigation()} />);
    const notificationLabel = await findByText('Home.NoNewUpdates');

    expect(notificationLabel).toBeTruthy();
  });
});

describe('with a notifications module, when there are no notifications', () => {
  jest.useFakeTimers();
  it('notifications are empty', async () => {
    const tree = create(<Home navigation={useNavigation()} />);
    const { root } = tree;
    const flatListInstance = root.findByType(FlatList);

    await waitFor(() =>
      expect(flatListInstance.findAllByType(NotificationListItem)).toHaveLength(
        0,
      ),
    );
  });
});
