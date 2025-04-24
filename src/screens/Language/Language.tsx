import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaScrollView, SingleSelectBlock } from '../../components';
import { BlockSelection } from '../../components/inputs/SingleSelectBlock';

import { Locales, storeLanguage } from '../../localization';

const Language = () => {
  const { t, i18n } = useTranslation();

  // List of available languages into the localization directory
  const languages = [
    { id: Locales.en, value: t<string>('Language.English') },
    { id: Locales.fr, value: t<string>('Language.French') },
    { id: Locales.de, value: t<string>('Language.German') },
  ];

  /**
   * Find current set language
   */
  const storedLanguage = languages.find(l => l.id === i18n.language);

  /**
   * Once user select the particular language from the list,
   * store user preference into the AsyncStorage
   *
   * @param {BlockSelection} language
   */
  const handleLanguageChange = async (language: BlockSelection) => {
    i18n.changeLanguage(language.id as Locales);
    await storeLanguage(language.id);
  };

  return (
    <SafeAreaScrollView>
      <SingleSelectBlock
        initialSelect={storedLanguage}
        selection={languages}
        onSelect={handleLanguageChange}
      />
    </SafeAreaScrollView>
  );
};

export default Language;
