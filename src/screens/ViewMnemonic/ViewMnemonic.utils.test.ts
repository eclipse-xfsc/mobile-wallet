import * as Utils from './ViewMnemonic.utils';

describe('ViewMnemonic.utils', () => {
  describe('authenticateuser', () => {
    it.each([
      { args: [123456, 123456], expected: true },
      { args: [111111, 111222], expected: false },
    ])('should return a true if the pin matches', initialValue => {
      const result = Utils.authenticateUser(initialValue.args);
      expect(result).toEqual(initialValue.expected);
    });
  });
});
