import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },

  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  warning: (message: string, title?: string) => {
    Toast.show({
      type: 'info', // Using info type for warning as react-native-toast-message doesn't have warning by default
      text1: title || 'Warning',
      text2: message,
      position: 'top',
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 60,
    });
  },
}; 