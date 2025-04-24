import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Title } from '..';
import { TextTheme } from '../../theme/theme';
import { hashToRGBA, hashCode } from '../../utils/helpers';

interface AvatarViewProps {
  name: string;
  img?: string;
}

const AvatarView: React.FC<AvatarViewProps> = ({ name, img }) => {
  return (
    <View style={[styles.avatar, { borderColor: hashToRGBA(hashCode(name)) }]}>
      {img ? (
        <ImageBackground
          source={{
            uri: img,
          }}
          style={styles.backgroundImage}
        >
        </ImageBackground>
      ) : (
        <Title style={styles.title}>
          {name.charAt(0)}
        </Title>
      )}
    </View>
  );
};

export default AvatarView;

const styles = StyleSheet.create({
  avatar: {
    width: TextTheme.headingTwo.fontSize * 2,
    height: TextTheme.headingTwo.fontSize * 2,
    margin: 12,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: TextTheme.headingTwo.fontSize,
    borderColor: TextTheme.headingTwo.color,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '105%',
    height: '105%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TextTheme.headingTwo,
    fontWeight: 'normal',
  },
});
