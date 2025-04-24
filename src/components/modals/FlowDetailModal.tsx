import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Button, { ButtonType } from '../button/Button';
import { ColorPallet, TextTheme } from '../../theme/theme';
import { HomeStackParams, Screens } from '../../types/navigators';

interface NotificationModalProps {
  title: string;
  doneTitle?: string;
  onDone?: () => void;
  onHome?: () => void;
  visible?: boolean;
  doneHidden?: boolean;
  homeHidden?: boolean;
  children?: ReactNode;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  title,
  doneTitle,
  onDone,
  onHome,
  visible,
  doneHidden = false,
  homeHidden = false,
  children,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>();
  const [modalVisible, setModalVisible] = useState<boolean>(true);

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible);
    }
  }, [visible]);

  const close = () => {
    setModalVisible(false);
  };

  const closeHome = () => {
    close();
    navigation.navigate(Screens.Home);
  };

  return (
    <Modal testID="notificationModal" visible={modalVisible} transparent>
      <View style={styles.container}>
        {homeHidden ? null : (
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onHome || closeHome}
              testID="closeModal"
            >
              <Icon
                name="home"
                size={24}
                color={ColorPallet.notification.infoText}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.childContainer}>
          <Text
            style={[
              TextTheme.headingThree,
              { fontWeight: 'normal', textAlign: 'center' },
            ]}
          >
            {title}
          </Text>
          {children}
        </View>
        {doneHidden ? null : (
          <View style={styles.buttonContainer}>
            <Button
              buttonType={ButtonType.Primary}
              title={doneTitle || t<string>('Global.Done')}
              onPress={onDone || close}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default NotificationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.grayscale.white,
  },
  childContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  buttonContainer: {
    marginBottom: 35,
    marginHorizontal: 20,
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 20,
    paddingVertical: 28,
  },
});
