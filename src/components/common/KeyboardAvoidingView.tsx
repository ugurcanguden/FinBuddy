import React from 'react';
import { KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, KeyboardAvoidingViewProps } from 'react-native';

interface CustomKeyboardAvoidingViewProps extends Omit<KeyboardAvoidingViewProps, 'behavior'> {
  behavior?: 'padding' | 'height' | 'position';
}

const KeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({ 
  children, 
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  ...props 
}) => {
  return (
    <RNKeyboardAvoidingView
      behavior={behavior}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      {...props}
    >
      {children}
    </RNKeyboardAvoidingView>
  );
};

export default KeyboardAvoidingView;
