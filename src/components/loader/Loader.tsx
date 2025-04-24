import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, Modal, StyleSheet } from 'react-native';
import Images from '../../assets';
import { ColorPallet } from '../../theme/theme';

type Props = {
  loading: boolean;
};

const Loader: React.FC<Props> = ({ loading }) => {
  const spinValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Modal
      visible={loading}
      transparent
      style={styles.container}
      testID="loader"
    >
      <Animated.View style={styles.activityIndicatorWrapper}>
        <Animated.Image
          style={{
            flex: 1,
            alignSelf: 'center',
            height: 70,
            width: 70,
            transform: [{ rotate: spin }],
          }}
          resizeMode="contain"
          source={Images.loaderIcon}
        />
      </Animated.View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicatorWrapper: {
    backgroundColor: `${ColorPallet.baseColors.black}20`,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
