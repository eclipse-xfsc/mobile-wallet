import Icon from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View, Keyboard, Button, TextInput } from 'react-native';
import { useTranslation } from "react-i18next";
import { ColorPallet } from '../../theme/theme';

interface Props {
  clicked: boolean;
  searchPhrase: string;
  setSearchPhrase: (text: string) => void;
  setClicked: (value: boolean) => void;
}

const SearchBar: React.FC<Props> = ({
  clicked,
  searchPhrase,
  setSearchPhrase,
  setClicked,
}) => {
  const { t } = useTranslation();

  const showCancel = clicked && searchPhrase.length > 0;

  return (
    <View style={styles.container}>
      <View style={showCancel ? styles.searchBarClicked : styles.searchBar}>
        {/* search Icon */}
        <Icon
          name="search"
          color={ColorPallet.grayscale.darkGrey}
          size={20}
          style={styles.searchIcon}
        />
        {/* Input field */}
        <TextInput
          style={styles.input}
          returnKeyType="done"
          placeholder={t<string>('SearchBar.placeholder')}
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          placeholderTextColor={ColorPallet.grayscale.mediumGrey}
          onFocus={() => {
            setClicked(true);
          }}
        />
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
      {showCancel && (
        <View style={styles.buttonStyle}>
          <Button
            title={t<string>('Global.Cancel')}
            color={ColorPallet.brand.secondary}
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
              setSearchPhrase('');
            }}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '96%',
  },
  searchBar: {
    marginLeft: 15,
    marginRight: 15,
    height: 50,
    flexDirection: 'row',
    width: '96%',
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
    borderRadius: 10,
  },
  searchBarClicked: {
    marginLeft: 15,
    marginRight: 10,
    height: 50,
    flexDirection: 'row',
    width: '70%',
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
    borderRadius: 10,
  },
  searchIcon: {
    paddingLeft: 0.5,
    paddingTop: 0.5,
    marginTop: 15,
    marginLeft: 10,
  },
  input: {
    fontSize: 18,
    alignSelf: 'center',
    width: '90%',
    color: ColorPallet.baseColors.black,
  },
  buttonStyle: {
    alignSelf: 'center',
  },
});
