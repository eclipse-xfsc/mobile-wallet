import Toast from 'react-native-toast-message';
import i18next from 'i18next';
import { ToastType } from '../components/toast/BaseToast';

export const successToast = (message: string, title?: string) => {
  Toast.show({
    type: ToastType.Success,
    text1: title ?? i18next.t<string>('Toasts.Success'),
    text2: message,
  });
};
export const warningToast = (message: string, title?: string) => {
  Toast.show({
    type: ToastType.Warn,
    text1: title ?? i18next.t<string>('Toasts.Warning'),
    text2: message,
  });
};
export const infoToast = (message: string, title?: string) => {
  Toast.show({
    type: ToastType.Info,
    text1: title ?? i18next.t<string>('Toasts.Info'),
    text2: message,
  });
};
export const errorToast = (message: string, title?: string) => {
  Toast.show({
    type: ToastType.Error,
    text1: title ?? i18next.t<string>('Toasts.Error'),
    text2: message,
  });
};
