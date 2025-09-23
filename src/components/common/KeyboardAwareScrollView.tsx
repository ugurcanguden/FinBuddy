import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  Keyboard,
  KeyboardEvent,
  ScrollViewProps,
  Platform,
  TextInput,
  StyleSheet,
  findNodeHandle,
} from 'react-native';

import KeyboardAvoidingView from './KeyboardAvoidingView';
import { useTheme } from '@/contexts';

type Variant = 'default' | 'surface' | 'background' | 'transparent';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  variant?: Variant;
}

const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  contentContainerStyle,
  style,
  variant = 'transparent',
  ...rest
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const variantStyle = useMemo(() => {
    const base = { flex: 1 };
    const variants: Record<Variant, object> = {
      default: { backgroundColor: colors.background },
      background: { backgroundColor: colors.background },
      surface: { backgroundColor: colors.card },
      transparent: { backgroundColor: 'transparent' },
    };

    return { ...base, ...variants[variant] };
  }, [colors, variant]);

  const scrollToFocusedInput = useCallback(() => {
    const responder = scrollViewRef.current?.getScrollResponder?.();
    const focusedInput = TextInput.State.currentlyFocusedInput?.();

    const nodeHandle = focusedInput
      ? typeof focusedInput === 'number'
        ? focusedInput
        : findNodeHandle(focusedInput as unknown as number | React.Component<any, any> | null)
      : null;

    if (!responder || nodeHandle == null) {
      return;
    }

    responder.scrollResponderScrollNativeHandleToKeyboard?.(nodeHandle, 120, true);
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(scrollToFocusedInput);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideListener = Keyboard.addListener(hideEvent, handleKeyboardHide);
    const changeFrameListener = Keyboard.addListener('keyboardDidChangeFrame', () => {
      requestAnimationFrame(scrollToFocusedInput);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
      changeFrameListener.remove();
    };
  }, [scrollToFocusedInput]);

  const basePaddingBottom = useMemo(() => {
    const flattened = StyleSheet.flatten(contentContainerStyle) || {};
    return typeof flattened.paddingBottom === 'number' ? flattened.paddingBottom : 0;
  }, [contentContainerStyle]);

  const combinedContentStyle = useMemo(
    () => [contentContainerStyle, { paddingBottom: basePaddingBottom + keyboardHeight + (Platform.OS === 'ios' ? 24 : 16) }],
    [contentContainerStyle, basePaddingBottom, keyboardHeight]
  );

  useEffect(() => {
    if (keyboardHeight > 0) {
      requestAnimationFrame(scrollToFocusedInput);
    }
  }, [keyboardHeight, scrollToFocusedInput]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={[variantStyle, style]}
        contentContainerStyle={combinedContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAwareScrollView;
