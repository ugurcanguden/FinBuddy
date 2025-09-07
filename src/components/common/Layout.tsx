// Layout Component - Sayfa düzeni için ana component
import React from 'react';
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
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  headerComponent,
  footerComponent,
  style,
  contentStyle
}) => {
  const { colors } = useTheme();

  return (
    <SafeArea style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <StatusBar />
      
      {/* Header */}
      {showHeader && (
        <View 
          variant="surface" 
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {headerComponent}
        </View>
      )}

      {/* Body/Content */}
      <View 
        variant="transparent" 
        style={[
          { 
            flex: 1,
            backgroundColor: colors.background 
          }, 
          contentStyle
        ]}
      >
        {children}
      </View>

      {/* Footer */}
      {showFooter && (
        <View 
          variant="surface" 
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {footerComponent || <BottomTabBar />}
        </View>
      )}
    </SafeArea>
  );
};

export default Layout;
