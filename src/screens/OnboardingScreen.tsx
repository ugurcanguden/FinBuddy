// Onboarding Screen - İlk açılış tanıtım ekranı
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, View, Text, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';
import { notificationService } from '@/services';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const [requestingPermission, setRequestingPermission] = useState(false);

  const handleComplete = async () => {
    setRequestingPermission(true);
    
    try {
      // Bildirim izni iste
      const hasPermission = await notificationService.initialize();
      
      if (hasPermission) {
        console.log('✅ Notification permission granted');
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    } finally {
      setRequestingPermission(false);
      onComplete();
    }
  };

  return (
    <Layout showHeader={false} showFooter={false}>
      <View variant="background" style={[styles.container, { backgroundColor: colors.background }] as any}>
        <View style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: `${colors.primary}20` } as any]}>
            <Text style={[styles.heroBadgeIcon, { color: colors.primary }] as any}>💸</Text>
          </View>
          <Text variant="primary" size="xlarge" weight="bold" align="center" style={styles.title}>
            Finanslarını Kolayca Yönet
          </Text>
          <Text variant="secondary" align="center" style={styles.subtitle}>
            Gider, gelir ve taksitli ödemelerini planla; zamanı gelince hatırlatalım.
          </Text>
        </View>

        <TouchableOpacity
          variant="transparent"
          style={[styles.ctaButton, { backgroundColor: colors.primary }] as any}
          onPress={handleComplete}
          disabled={requestingPermission}
        >
          <Text weight="bold" style={{ color: colors.onPrimary }}>
            {requestingPermission ? 'İzin isteniyor...' : 'Devam et'}
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: 64,
    alignItems: 'center',
    gap: 16,
  },
  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeIcon: {
    fontSize: 40,
  },
  title: {
    marginTop: 8,
  },
  subtitle: {
    maxWidth: 320,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
});

export default OnboardingScreen;
