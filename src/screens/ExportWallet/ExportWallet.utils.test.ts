import * as Utils from './ExportWallet.utils';

jest.mock('react-native-argon2', () => 'ExportWallet.utils');

describe('ExportWallet.utils', () => {
  describe('authenticateuser', () => {
    it.each([
      {
        args: [
          'mocker calzone unfounded registry vacant lushly ooze catcher',
          'mocker calzone unfounded registry vacant lushly ooze catcher',
        ],
        expected: true,
      },
      {
        args: [
          'mocker calzone unfounded registry vacant lushly ooze catcher',
          'mocker calzone unfounded registry vacant lushly ',
        ],
        expected: false,
      },
    ])('should return a true if the mnemonic matches', initialValue => {
      const result = Utils.authenticateUser(initialValue.args);
      expect(result).toEqual(initialValue.expected);
    });
  });
});
