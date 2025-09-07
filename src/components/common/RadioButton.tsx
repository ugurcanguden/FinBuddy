// RadioButton Component - Tema destekli radyo butonu
import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { View, Text, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioButtonProps {
  options: RadioOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  orientation?: 'vertical' | 'horizontal';
}

const RadioButton: React.FC<RadioButtonProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
  style,
  orientation = 'vertical',
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.container,
      orientation === 'horizontal' && styles.horizontalContainer,
      style,
    ],
    [orientation, style]
  );

  const optionContainerBase: ViewStyle = useMemo(
    () => ({
      flexDirection: 'row',
      alignItems: 'flex-start',
      opacity: disabled ? 0.6 : 1,
    }),
    [disabled]
  );

  const radioCircleStyle: ViewStyle = useMemo(
    () => ({
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      marginRight: 12,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.border,
      backgroundColor: 'transparent',
    }),
    [colors.border]
  );

  const radioInnerStyle: ViewStyle = useMemo(
    () => ({
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    }),
    [colors.primary]
  );

  const renderOption = (option: RadioOption) => {
    const isSelected = selectedValue === option.value;
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          optionContainerBase,
          {
            marginBottom: orientation === 'vertical' ? 12 : 0,
            marginRight: orientation === 'horizontal' ? 16 : 0,
          },
        ]}
        onPress={() => !disabled && onSelect(option.value)}
        disabled={disabled}   
        activeOpacity={0.8}
      >
        <View style={styles.optionContent}>
          <View style={radioCircleStyle}>
            {isSelected && <View style={radioInnerStyle} />}
          </View>

          <View style={styles.textContainer}>
            <Text
              variant="primary"
              size="medium"
              weight={isSelected ? 'semibold' : 'normal'}
            >
              {option.label}
            </Text>
            {option.description ? (
              <Text variant="secondary" size="small">
                {option.description}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return <View style={containerStyle as any}>{options.map(renderOption)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
});

export default RadioButton;
