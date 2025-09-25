// QuickActions Component - Hızlı eylem butonları bileşeni
import React, { useMemo, useRef, useEffect } from 'react';
import { ViewStyle, Animated, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts';
import Card from './Card';
import Text from './Text';
import View from './View';

export interface QuickAction {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color?: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: string | number;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  columns?: number;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  columns = 2,
  animated = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnims = useRef<Animated.Value[]>([]);
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Animasyon değerlerini başlat
  useEffect(() => {
    scaleAnims.current = actions.map(() => new Animated.Value(0));
  }, [actions.length]);

  // Animasyonları başlat
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(containerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.stagger(
          100,
          scaleAnims.current.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 300,
              friction: 8,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    } else {
      containerAnim.setValue(1);
      scaleAnims.current.forEach(anim => anim.setValue(1));
    }
  }, [animated, containerAnim]);

  const renderAction = (action: QuickAction, index: number) => {
    const actionColor = action.color || colors.primary;
    const isDisabled = action.disabled;

    return (
      <Animated.View
        key={action.id}
        style={[
          {
            flex: 1,
            margin: 4,
            transform: [
              {
                scale: scaleAnims.current[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }) || 1,
              },
            ],
            opacity: scaleAnims.current[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }) || 1,
          },
        ]}
      >
        <RNTouchableOpacity
          onPress={action.onPress}
          disabled={isDisabled}
          style={{
            opacity: isDisabled ? 0.5 : 1,
          }}
          activeOpacity={0.7}
        >
          <Card
            variant="elevated"
            padding="medium"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
              backgroundColor: isDisabled ? colors.border + '20' : actionColor + '10',
              borderWidth: 1,
              borderColor: isDisabled ? colors.border : actionColor + '30',
            }}
          >
            {/* Badge */}
            {action.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: colors.danger,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 6,
                }}
              >
                <Text variant="primary" size="small" weight="bold" style={{ color: 'white' }}>
                  {action.badge}
                </Text>
              </View>
            )}

            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: actionColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>{action.icon}</Text>
            </View>

            {/* Title */}
            <Text
              variant="primary"
              size="medium"
              weight="semibold"
              style={{
                textAlign: 'center',
                marginBottom: 4,
                color: isDisabled ? colors.textSecondary : actionColor,
              }}
            >
              {action.title}
            </Text>

            {/* Subtitle */}
            {action.subtitle && (
              <Text
                variant="secondary"
                size="small"
                style={{
                  textAlign: 'center',
                  color: isDisabled ? colors.textSecondary : colors.textSecondary,
                }}
              >
                {action.subtitle}
              </Text>
            )}
          </Card>
        </RNTouchableOpacity>
      </Animated.View>
    );
  };

  const gridStyle = useMemo(() => {
    return {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'space-between',
      gap: 8,
    };
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      <Card variant="elevated" padding="medium">
        <Text variant="primary" size="large" weight="bold" style={{ marginBottom: 16 }}>
          Hızlı İşlemler
        </Text>
        
        <View style={gridStyle}>
          {actions.map((action, index) => renderAction(action, index))}
        </View>
      </Card>
    </Animated.View>
  );
};

export default QuickActions;
