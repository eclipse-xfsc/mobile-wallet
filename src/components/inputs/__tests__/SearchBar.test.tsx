import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('should render correctly and change searchPhrase when searched with textInput', () => {
    const onPressMock = jest.fn();

    const onEventMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar
        clicked={false}
        searchPhrase=""
        setSearchPhrase={onEventMock}
        setClicked={onPressMock}
      />,
    );

    const searchBar = getByPlaceholderText('Search');
    fireEvent(searchBar, 'onChangeText', 'searchText');
    expect(onEventMock).toHaveBeenCalledWith('searchText');
  });
});
