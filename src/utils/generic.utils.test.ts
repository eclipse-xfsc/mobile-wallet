import * as Utils from './generic';

describe('ChangePin.utils', () => {
  describe('saveValueInKeychain', () => {
    it('should check value is saved in the keychain', async () => {
      // Mocked function to saveValueInKeychain
      jest.spyOn(Utils, 'saveValueInKeychain');

      await Utils.saveValueInKeychain(
        'guid',
        'kevin@gmail.com',
        'guid description',
      );

      expect(Utils.saveValueInKeychain).toHaveBeenCalledWith(
        'guid',
        'kevin@gmail.com',
        'guid description',
      );
    });
  });
});
