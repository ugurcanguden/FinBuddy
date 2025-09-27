// Layout Component - Sayfa düzeni için ana component
import React, { useMemo } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, SafeArea, StatusBar, BottomTabBar } from '@/components';
import { useTheme } from '@/contexts';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  style?: any;
  contentStyle?: any;
  keyboardAvoidingView?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  headerComponent,
  footerComponent,
  style,
  contentStyle,
  keyboardAvoidingView = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const headerContainerStyle = useMemo(
    () => ({
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      //paddingTop: insets.top,
      //paddingBottom: 8,
      backgroundColor: colors.card,
    }),
    [colors.border, colors.card, insets.top],
  );

  const footerContainerStyle = useMemo(
    () => ({
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12),
      backgroundColor: colors.card,
    }),
    [colors.border, colors.card, insets.bottom],
  );

  const contentContainerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: showHeader ? 0 : Math.max(insets.top, 12),
      paddingBottom: showFooter ? 0 : Math.max(insets.bottom, 12),
    }),
    [colors.background, insets.bottom, insets.top, showFooter, showHeader],
  );

  const renderContent = () => (
    <>
      {/* Header */}
      {showHeader && (
        <View variant="surface" style={headerContainerStyle}>
          {headerComponent}
        </View>
      )}

      {/* Body/Content */}
      <View variant="transparent" style={[contentContainerStyle, contentStyle]}>
        {children}
      </View>

      {/* Footer */}
      {showFooter && (
        <View variant="surface" style={footerContainerStyle}>
          {footerComponent || <BottomTabBar />}
        </View>
      )}
    </>
  );

  return (
    <SafeArea edges={['left', 'right', 'bottom']} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <StatusBar />
      
      {keyboardAvoidingView ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </SafeArea>
  );
};

export default Layout;
