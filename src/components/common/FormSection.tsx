import React, { useMemo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Card from './Card';
import Text from './Text';
import View from './View';
import { useTheme } from '@/contexts';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  testID?: string | undefined;
}

const spacingMap: Record<NonNullable<FormSectionProps['spacing']>, number> = {
  none: 0,
  small: 12,
  medium: 20,
  large: 28,
};

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  footer,
  spacing = 'medium',
  testID,
}) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    () => ({
      marginTop: spacingMap[spacing],
      borderColor: colors.border,
    }),
    [colors.border, spacing]
  );

  const sectionStyle = useMemo<ViewStyle>(() => StyleSheet.flatten([styles.section, containerStyle]), [containerStyle]);

  return (
    <Card testID={testID} variant="default" padding="large" style={sectionStyle}>
      {(title || description) && (
        <View style={styles.header}>
          {title && (
            <Text variant="primary" size="large" weight="semibold">
              {title}
            </Text>
          )}
          {description && (
            <Text variant="secondary" size="small" style={styles.description}>
              {description}
            </Text>
          )}
        </View>
      )}

      <View style={styles.content}>{children}</View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  description: {
    lineHeight: 18,
  },
  content: {
    gap: 12,
  },
  footer: {
    marginTop: 8,
    gap: 12,
  },
});

export default FormSection;
