import React from 'react';
import type { ConnectionRecord } from '@credo-ts/core';
import { Pressable, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/core';
import { borderRadius, ContactTheme } from '../../theme/theme';
import { dateFormatOptions } from '../../constants';
import Text from '../text/Text';
import Title from '../text/Title';
import { ContactStackParams, Screens } from '../../types/navigators';

interface Props {
  contact: ConnectionRecord;
}

const ContactListItem: React.FC<Props> = ({ contact }) => {
  const navigation = useNavigation<StackNavigationProp<ContactStackParams>>();
  return (
    <Pressable
      testID="contact-list-item"
      onPress={() =>
        navigation.navigate(Screens.ContactDetails, {
          connectionId: contact.id,
        })
      }
      key={contact.id}
      style={styles.container}
    >
      <Title>{contact?.alias || contact?.theirLabel}</Title>
      <Text>DID : {contact.did}</Text>
      <Text>State : {contact.state}</Text>
      <Text style={styles.date}>
        {contact.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
      </Text>
    </Pressable>
  );
};

export default ContactListItem;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    borderRadius,
    backgroundColor: ContactTheme.background,
  },
  date: {
    textAlign: 'right',
  },
});
