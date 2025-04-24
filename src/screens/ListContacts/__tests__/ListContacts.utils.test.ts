import MOCK_CONNECTION_LIST from './ListContacts.constants';
import * as Utils from '../ListContacts.utils';

describe('ListContacts.utils', () => {
  describe('searchConnectionList', () => {
    it.each([
      [MOCK_CONNECTION_LIST, 'abc', [MOCK_CONNECTION_LIST[0]]],
      [MOCK_CONNECTION_LIST, 'Mediator', [MOCK_CONNECTION_LIST[3]]],
    ])(
      'should return a filtered list of connections',
      (connections, searchText, expected) => {
        const result = Utils.searchConnectionList(connections, searchText);
        expect(result).toEqual(expected);
      },
    );
  });
});
