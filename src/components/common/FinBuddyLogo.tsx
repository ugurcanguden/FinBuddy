// FinBuddy Logo Component - Uygulama logosu
import React from 'react';
import { View, Text } from '@/components';
import { useTheme } from '@/contexts';

interface FinBuddyLogoProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const FinBuddyLogo: React.FC<FinBuddyLogoProps> = ({ 
  size = 140, 
  color, 
  backgroundColor 
}) => {
  const { colors } = useTheme();
  const logoColor = color || colors.primary;
  const logoBackgroundColor = backgroundColor || colors.background;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: logoBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
      }}
    >
      {/* Ana Logo İkonu */}
      <Text
        style={{
          fontSize: size * 0.5,
          fontFamily: 'MaterialSymbolsOutlined',
          color: logoColor,
        } as any}
      >
        account_balance_wallet
      </Text>
      
      {/* Alt Logo Detayı */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.15,
          right: size * 0.15,
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
          backgroundColor: logoColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: size * 0.1,
            fontFamily: 'MaterialSymbolsOutlined',
            color: logoBackgroundColor,
          } as any}
        >
          trending_up
        </Text>
      </View>
    </View>
  );
};

export default FinBuddyLogo;
