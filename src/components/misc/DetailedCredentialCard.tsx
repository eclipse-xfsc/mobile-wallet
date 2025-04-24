import { CredentialExchangeRecord } from '@credo-ts/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Title } from '..';

import { dateFormatOptions } from '../../constants';
import { ColorPallet, ContactTheme, TextTheme } from '../../theme/theme';
import AvatarView from './AvatarView';

interface CredentialCardProps {
  credential: CredentialExchangeRecord;
  style?: ViewStyle;
}

interface Metadata {
  title: string;
  textColor: string;
  backgroundColor: string;
  backgroundImage: string;
  avatarImage: string;
}

const DetailedCredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  style = {},
}) => {
  const { t } = useTranslation();
  const { id, credentialAttributes, createdAt } = credential;
  const [metadata, setMetadata] = useState<Metadata>({
    title: id,
    textColor: '',
    backgroundColor: '',
    backgroundImage: '',
    avatarImage: '',
  });

  useEffect(() => {
    if (credentialAttributes) {
      const attributesMap = new Map(
        credentialAttributes.map((attr) => [attr.name, attr.value]),
      );

      // Statically getting the metadata until we have a well_known call
      const title = attributesMap.get('title') ?? id;
      const textColor = attributesMap.get('textColor') ?? '';
      const backgroundColor = attributesMap.get('backgroundColor') ?? '';
      const backgroundImage = attributesMap.get('backgroundImage') ?? '';
      const avatarImage = attributesMap.get('avatarImage') ?? '';

      setMetadata({
        title,
        textColor,
        backgroundColor,
        backgroundImage,
        avatarImage,
      });
    }
  }, []);

  const containerStyle = {
    backgroundColor: metadata.backgroundColor || ContactTheme.background,
  };

  const textStyle = {
    ...TextTheme.caption,
    color: metadata.textColor || ColorPallet.brand.primary,
  };

  // Filtering statically until we have a well_known call
  const filteredAttributes = credentialAttributes!
    .filter(
      (attr) =>
        ![
          'title',
          'textColor',
          'backgroundColor',
          'backgroundImage',
          'avatarImage',
        ].includes(attr.name),
    )
    .slice(0, 5);

  const renderCard = () => {
    return (
      <>
        <View style={styles.row}>
          <AvatarView name={id} img={metadata.avatarImage} />
          <View style={styles.details}>
            <Title
              style={{ color: metadata.textColor || ColorPallet.brand.primary }}
            >
              {metadata.title ? metadata.title : id}
            </Title>
            <Text style={textStyle}>
              {t<string>('CredentialDetails.Issued')}:{' '}
              {createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
            </Text>
          </View>
        </View>
        <View style={styles.attributesContainer}>
          {filteredAttributes.map((attr) => (
            <View style={styles.row} key={attr.name}>
              <Text style={textStyle}>
                <Text style={{ fontWeight: 'bold' }}>{attr.name}: </Text>
                <Text numberOfLines={1}>{attr.value}</Text>
              </Text>
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, style, containerStyle]}>
      {metadata.backgroundImage ? (
        <ImageBackground
          source={{ uri: metadata.backgroundImage }}
          style={StyleSheet.absoluteFill}
        >
          {renderCard()}
        </ImageBackground>
      ) : (
        renderCard()
      )}
    </View>
  );
};

export default DetailedCredentialCard;

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    borderRadius: 15,
    padding: 10,
    overflow: 'hidden',
  },
  attributesContainer: {
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: { flexShrink: 1 },
});
