import { StackNavigationOptions } from '@react-navigation/stack';
import { ColorPallet } from '../theme/theme';

const defaultStackOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: ColorPallet.brand.primary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: ColorPallet.grayscale.white,
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
};

export default defaultStackOptions;
