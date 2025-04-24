import { ConnectionRecord, DidExchangeState } from '@credo-ts/core';
import { useConnections } from '@credo-ts/react-hooks';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { ContactListItem, Text } from '../../components';
import SearchBar from '../../components/inputs/SearchBar';
import { ColorPallet } from '../../theme/theme';
import { searchConnectionList } from './ListContacts.utils';

const useSearchableConnections = () => {
  const { records, loading } = useConnections();

  const [searchText, setSearchText] = useState('');

  // we list only established connections for now
  // TODO: review business behavior for this screen
  const connectionList = useMemo(() => {
    const list = searchConnectionList(records, searchText);
    return list.filter((c) => c.state === DidExchangeState.Completed);
  }, [records, searchText]);

  return { connectionList, loading, setSearchText, searchText };
};

const ListContacts: React.FC = () => {
  const { connectionList, setSearchText, searchText } =
    useSearchableConnections();
  const { t } = useTranslation();

  const [clicked, setClicked] = useState(false);

  return (
    <View style={styles.container}>
      <SearchBar
        searchPhrase={searchText}
        setSearchPhrase={setSearchText}
        clicked={clicked}
        setClicked={setClicked}
      />
      <FlatList
        data={connectionList}
        renderItem={({ item }) => (
          <ContactListItem key={item.id} contact={item} />
        )}
        keyExtractor={(item: ConnectionRecord) => item.id}
        style={{ backgroundColor: ColorPallet.grayscale.white }}
        contentContainerStyle={{ paddingBottom: 65 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', margin: 100 }}>
            {t<string>('Global.ZeroRecords')}
          </Text>
        }
      />
    </View>
  );
};

export default ListContacts;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
  },
});
