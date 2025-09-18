import React, { useEffect, useRef } from 'react';
import { ScrollView, Keyboard, KeyboardEvent, ScrollViewProps } from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({ 
  children, 
  ...props 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
      // Klavye açıldığında scroll view'ı aşağı kaydır
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Klavye kapandığında scroll view'ı yukarı kaydır
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default KeyboardAwareScrollView;
