import { useNavigation } from '@react-navigation/core';
import React, { ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  useWindowDimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Camera,
  Code,
  CodeScannerFrame,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { ColorPallet } from '../../theme/theme';
import QrCodeScanError from '../../types/error';
import useKeyboard from '../../utils/keyboard';
import QRScannerClose from '../misc/QRScannerClose';
import QRScannerTorch from '../misc/QRScannerTorch';

interface Props {
  handleCodeScan: (data: string) => Promise<void>;
  textInputSubmit?: () => void;
  error?: QrCodeScanError | null;
  enableCameraOnError?: boolean;
  url?: string;
  onChangeText: (text: string) => void;
}

const CameraViewContainer: React.FC<{
  portrait: boolean;
  children?: ReactNode;
}> = ({ portrait, children }) => {
  return (
    <View
      style={{
        ...styles.cameraViewContainer,
        flexDirection: portrait ? 'column' : 'row',
      }}
    >
      {children}
    </View>
  );
};

const QRScanner: React.FC<Props> = ({
  handleCodeScan,
  error,
  enableCameraOnError,
  url,
  onChangeText,
  textInputSubmit,
}) => {
  const navigation = useNavigation();
  const [cameraActive, setCameraActive] = useState(true);
  const [torchActive, setTorchActive] = useState(false);
  const [invalidQrCodes] = useState(() => new Set<string>());

  const { keyboardHeight, isKeyBoardOpen } = useKeyboard();

  const { width, height } = useWindowDimensions();
  const portraitMode = height > width;
  const { t } = useTranslation();

  const [hasPermission, setHasPermission] = React.useState(false);
  const device = useCameraDevice('back');

  const onCodeScanned = useCallback(
    (codes: Code[], frame: CodeScannerFrame) => {
      const data = codes[0].value as string;

      if (invalidQrCodes.has(data)) {
        return;
      }
      if (error?.data === data) {
        invalidQrCodes.add(error.data);
        if (enableCameraOnError) {
          setCameraActive(true);
        }
      }
      if (cameraActive) {
        Vibration.vibrate();
        handleCodeScan(data);
        setCameraActive(false);
      }
    },
    [error, invalidQrCodes, handleCodeScan, enableCameraOnError, cameraActive],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: onCodeScanned,
  });

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (!hasPermission || device == null) {
    return null;
  }

  return (
    <Pressable
      onPress={() => Keyboard.dismiss()}
      style={styles.container}
      testID="QRScannerTest"
    >
      <Camera
        style={styles.container}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        torch={torchActive ? 'on' : 'off'}
        audio={false}
      />
      <CameraViewContainer portrait={portraitMode}>
        <View style={styles.actionsView}>
          <QRScannerTorch
            active={torchActive}
            onPress={() => setTorchActive(!torchActive)}
          />
          <QRScannerClose onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.scanTextView}>
          <Text style={styles.scanText}>
            {t<string>('QRScanner.ScanMessage')}
          </Text>
          <Text style={styles.scanText}>
            {t<string>('QRScanner.VerifyMessage')}
          </Text>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Icon style={styles.icon} name="cancel" size={30} />
            <Text>{error.message}</Text>
          </View>
        )}
        <View style={styles.viewFinderContainer}>
          <View style={styles.viewFinder} />
        </View>
      </CameraViewContainer>
      <View
        style={[
          styles.bottomView,
          {
            marginTop:
              Platform.OS === 'ios' && isKeyBoardOpen
                ? -keyboardHeight - 80
                : -80,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={Platform.OS === 'ios'}
          style={styles.rowTextInputView}
        >
          <TextInput
            style={styles.textInputStyle}
            placeholder="url"
            value={url}
            onChangeText={onChangeText}
            placeholderTextColor={ColorPallet.baseColors.black}
          />
          <TouchableOpacity
            onPress={textInputSubmit}
            style={styles.submitIconStyle}
          >
            <AntDesign
              name="right"
              color={ColorPallet.baseColors.black}
              size={Platform.OS === 'ios' ? height / 30 : height / 28}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Pressable>
  );
};

export default QRScanner;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    // backgroundColor: ColorPallet.baseColors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraViewContainer: {
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  viewFinder: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: ColorPallet.baseColors.white,
    backgroundColor: ColorPallet.baseColors.transparent,
  },
  viewFinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: ColorPallet.baseColors.white,
    padding: 4,
  },
  submitIconStyle: {
    alignSelf: 'center',
  },
  bottomView: {
    flex: 1,
    marginTop: -80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: ColorPallet.baseColors.white,
    width: '100%',
  },
  textInputStyle: {
    width: width - 100,
    paddingTop: 5,
    color: ColorPallet.baseColors.black,
    alignItems: 'center',
    fontSize: Platform.OS === 'ios' ? height / 50 : height / 45,
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? height / 19 : height / 18,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    alignSelf: 'center',
    marginVertical: 20,
  },
  rowTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    width: '100%',
    position: 'absolute',
    top: 10,
  },
  scanTextView: {
    flexDirection: 'column',
    padding: 20,
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    top: 78,
  },
  scanText: {
    fontSize: Platform.OS === 'ios' ? height / 40 : height / 35,
    textAlign: 'center',
  },
});
