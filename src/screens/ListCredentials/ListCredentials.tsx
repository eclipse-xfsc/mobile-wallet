import {
  CredentialExchangeRecord,
  CredentialState,
} from '@credo-ts/core';
import { useCredentialsForDisplay } from '../../agent/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, FlatList, StyleSheet, Text, View } from 'react-native';
import SearchBar from '../../components/inputs/SearchBar';
import CredentialListItem from '../../components/listItems/CredentialListItem';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { useAgent, useCredentialById } from '@credo-ts/react-hooks';
import Accordion from '../../components/accordion/Accordion';
import CredentialCard from '../../components/misc/CredentialCard';
import { CredentialStackParams, Screens } from '../../types/navigators';
import { RecordHistory } from '../../types/record';
import { credentialDefinition } from '../../utils/helpers';
import { errorToast, warningToast } from '../../utils/toast';
import DetailedCredentialCard from '../../components/misc/DetailedCredentialCard';

const ListCredentials: React.FC = () => {
  const credentialStorage = useCredentialsForDisplay();

  const { t } = useTranslation();
  const [searchPhrase, setSearchPhrase] = useState('');
  const [clicked, setClicked] = useState(false);
  const [filteredData, setFilteredData] = useState(credentialStorage.credentials);

  const refreshFilteredData = useCallback(() => {
    console.log(filteredData)
    setFilteredData(filteredData);
  }, [filteredData]);
  // Should not ever set state during rendering, so do this in useEffect instead.
  useEffect(() => {
    if (filteredData.length < credentialStorage.credentials.length) {
      refreshFilteredData();
    }
  }, [filteredData, credentialStorage.credentials.length, refreshFilteredData]);

  const search = (text: string) => {
    const filteredData = credentialStorage.credentials.filter((item) => {
      const orgLabel = item.display.name;
      const textData = text.toUpperCase();
      return orgLabel.includes(textData);
    });

    setFilteredData(filteredData);
    setSearchPhrase(text);
  };

  const emptyListComponent = () => (
    <Text style={{ textAlign: 'center', marginTop: 100 }}>
      {t<string>('Global.ZeroRecords')}
    </Text>
  );

  console.log(filteredData)

  return (
    <View style={styles.container}>
      <SearchBar
        searchPhrase={searchPhrase}
        setSearchPhrase={(setSearchPhrase) => search(setSearchPhrase)}
        clicked={clicked}
        setClicked={setClicked}
      />
      <FlatList
        data={filteredData}
        renderItem={({ item }) => <CredentialCard 
            credential={item}
            issuerImage={item.display.issuer.logo}
            backgroundImage={item.display.backgroundImage}
            textColor={item.display.textColor}
            name={item.display.name}
            issuerName={item.display.issuer.name}
            subtitle={item.display.description}
            bgColor={item.display.backgroundColor}
         />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={emptyListComponent}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};


export default ListCredentials;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    marginVertical: 16,
  },
  card: {
    backgroundColor: ColorPallet.baseColors.white,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cardIos: {
    backgroundColor: ColorPallet.baseColors.white,
    shadowColor: ColorPallet.baseColors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  safeArea: {
    flex: 1,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  hidden: {
    height: 0,
  },
  list: {
    overflow: 'hidden',
  },
  sectionTitle: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.baseColors.black,
    marginLeft: '5%',
  },
  sectionSubTitle: {
    ...TextTheme.caption,
    color: ColorPallet.baseColors.black,
    marginLeft: '5%',
  },
  sectionDescription: {
    ...TextTheme.caption,
    color: ColorPallet.baseColors.black,
    height: 30,
    marginLeft: '5%',
  },
  divider: {
    borderBottomColor: ColorPallet.baseColors.lightGrey,
    borderBottomWidth: 1,
    width: '100%',
  },
  credentialCardView: {
    marginHorizontal: 15,
    marginTop: 16,
  },
  innerContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  attribute: {
    width: '50%',
    color: ColorPallet.baseColors.black,
  },
  scrollView: {
    paddingBottom: 30,
  },
});
