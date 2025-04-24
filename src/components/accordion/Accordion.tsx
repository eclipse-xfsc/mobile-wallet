import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  LayoutAnimation,
  StyleSheet,
  UIManager,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ColorPallet, TextTheme } from '../../theme/theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AccordionProps {
  title: string;
  innerAccordion: boolean;
  date?: Date;
  status?: string;
  children?: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  innerAccordion,
  date = new Date(),
  status = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(value => !value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const getFormattedDate = (date: Date) => {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
      .map(n => (n < 10 ? `0${n}` : `${n}`))
      .join('-');
  };

  return (
    <>
      <TouchableOpacity
        onPress={toggleOpen}
        style={styles.heading}
        activeOpacity={0.6}
      >
        {!innerAccordion ? (
          <>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Icon
              name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color="black"
            />
          </>
        ) : (
          <>
            <View style={styles.innerAccordionView}>
              <View>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionSubTitle}>{status}</Text>
              </View>
            </View>
            <View style={styles.sectionDateTime}>
              <View>
                <Text style={styles.sectionTitle}>
                  {getFormattedDate(date)}
                </Text>
                <Text style={styles.sectionSubTitle}>
                  {date.toLocaleTimeString()}
                </Text>
              </View>
              <Icon
                name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={18}
                color="black"
                style={styles.icon}
              />
            </View>
          </>
        )}
      </TouchableOpacity>
      <View style={[styles.list, !isOpen && styles.hidden]}>{children}</View>
    </>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorPallet.baseColors.white,
    borderRadius: 15,
    elevation: 10,
    padding: 10,
  },
  cardIos: {
    backgroundColor: ColorPallet.baseColors.white,
    shadowColor: ColorPallet.baseColors.white,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    borderRadius: 15,
    padding: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  innerAccordionView: {
    flexDirection: 'row',
  },
  icon: {
    alignSelf: 'center',
    marginLeft: 10,
  },
  circle: {
    backgroundColor: ColorPallet.brand.primary,
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
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
  sectionDateTime: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sectionTitle: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
  },
  sectionSubTitle: {
    ...TextTheme.caption,
    color: ColorPallet.baseColors.black,
  },
});
