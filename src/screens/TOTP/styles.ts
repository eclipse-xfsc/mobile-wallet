import { StyleSheet } from 'react-native';
import { ColorPallet } from '../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    marginVertical: 16,
  },
  remainingTime: {
    alignSelf: 'center',
  },
  progressPanel: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  circles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    margin: 10,
  },
  item: {
    height: 15,
  },
});
