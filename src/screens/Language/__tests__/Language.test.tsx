import React from 'react';
import { create } from 'react-test-renderer';
import Language from '../Language';

jest.mock('react-native-localize', () => ({
  findBestAvailableLanguage: () => ({
    languageTag: 'en-US',
    isRTL: false,
  }),
}));

jest.mock('i18next', () => ({
  use: () => {
    return {
      init: jest.fn(),
    };
  },
  init: jest.fn(),
  t: k => k,
  language: 'en',
}));

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(jest.fn()),
      },
    };
  },
}));

describe('Language', () => {
  it('should render correctly', () => {
    const tree = create(<Language />);

    expect(tree).toMatchSnapshot();
  });
});
