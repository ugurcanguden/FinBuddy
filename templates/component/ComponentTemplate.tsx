// Component Template - Tekrar kullanılabilir bileşen başlangıcı
import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '@/components';

export interface ComponentTemplateProps {
  title?: string;
}

const ComponentTemplate: React.FC<ComponentTemplateProps> = ({ title = 'Bileşen' }) => {
  return (
    <View style={styles.container}>
      <Text weight="semibold">{title}</Text>
      <Text variant="secondary">İçeriği buraya ekleyin.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default ComponentTemplate;
