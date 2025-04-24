import * as Utils from './CreateWallet.utils';
import { getMnemonicArrayFromWords } from '../../utils/generic';

describe('CreateWallet.utils', () => {
  describe('storeOnboardingCompleteStage', () => {
    it('should store a value for onboarding complete stage', async () => {
      jest.spyOn(Utils, 'storeOnboardingCompleteStage');

      await Utils.storeOnboardingCompleteStage();

      expect(Utils.storeOnboardingCompleteStage).toHaveBeenCalled();
    });
  });

  describe('getMnemonicFromWords', () => {
    it.each([
      [0, 0],
      [5, 5],
      [3, 3],
      [8, 8],
    ])(
      'should return string values from list of words with provided length of Words',
      (initialValues, finalLength) => {
        const result = getMnemonicArrayFromWords(initialValues);
        expect(result.length).toEqual(finalLength);
      },
    );
  });

  describe('createMD5HashFromString', () => {
    it.each([
      ['kevin@gmail.com1234566', '31a8cc6fdfd91bd25e777cd928cca890'],
      [
        'kevin.durant@gmail.comThisisateststring',
        '01b8b1108447e196002c12f27c2388b6',
      ],
    ])(
      'should return a hash value for the given string',
      (initialValue, expectedValue) => {
        const result = Utils.createMD5HashFromString(initialValue);
        expect(result).toEqual(expectedValue);
      },
    );
  });
});
