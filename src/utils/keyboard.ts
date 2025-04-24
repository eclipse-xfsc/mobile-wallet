import { useState, useEffect } from 'react';
import { KeyboardEvent, Keyboard } from 'react-native';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyBoardOpen, setIsKeyBoardOpen] = useState(false);

  const onKeyboardDidShow = (e: KeyboardEvent) => {
    setIsKeyBoardOpen(true);
    setKeyboardHeight(e.endCoordinates.height);
  };

  const onKeyboardDidHide = () => {
    setIsKeyBoardOpen(false);
    setKeyboardHeight(0);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { keyboardHeight, isKeyBoardOpen };
};

export default useKeyboard;
