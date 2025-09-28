// Onboarding Tour Screen - Kullanıcıya uygulamayı tanıtır
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useTheme } from '@/contexts';
import { useLocale } from '@/hooks';
import { Button } from '@/components';

// const { width, height } = Dimensions.get('window');

interface OnboardingTourScreenProps {
  onComplete: () => void;
}

const OnboardingTourScreen: React.FC<OnboardingTourScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  const pages = [
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.iconText}>💰</Text>
        </View>
      ),
      title: t('screens.onboarding.welcome.title'),
      subtitle: t('screens.onboarding.welcome.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
          <Text style={styles.iconText}>📊</Text>
        </View>
      ),
      title: t('screens.onboarding.home.title'),
      subtitle: t('screens.onboarding.home.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
          <Text style={styles.iconText}>💸</Text>
        </View>
      ),
      title: t('screens.onboarding.payments.title'),
      subtitle: t('screens.onboarding.payments.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.info }]}>
          <Text style={styles.iconText}>💵</Text>
        </View>
      ),
      title: t('screens.onboarding.incomes.title'),
      subtitle: t('screens.onboarding.incomes.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.iconText}>📈</Text>
        </View>
      ),
      title: t('screens.onboarding.reports.title'),
      subtitle: t('screens.onboarding.reports.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.info }]}>
          <Text style={styles.iconText}>🏷️</Text>
        </View>
      ),
      title: t('screens.onboarding.categories.title'),
      subtitle: t('screens.onboarding.categories.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
      ),
      title: t('screens.onboarding.notifications.title'),
      subtitle: t('screens.onboarding.notifications.subtitle'),
    },
    {
      backgroundColor: colors.background,
      image: (
        <View style={[styles.iconContainer, { backgroundColor: colors.info }]}>
          <Text style={styles.iconText}>⚙️</Text>
        </View>
      ),
      title: t('screens.onboarding.settings.title'),
      subtitle: t('screens.onboarding.settings.subtitle'),
    },
  ];

  const handleDone = async () => {
    // Tour tamamlandı flag'ini set et
    try {
      const { storageService } = await import('@/services');
      await storageService.set('onboarding_completed', true);
      console.log('Onboarding tour completed');
    } catch (error) {
      console.error('Failed to save onboarding completion', error);
    }
    onComplete();
  };

  const handleSkip = async () => {
    // Tour atlandı flag'ini set et
    try {
      const { storageService } = await import('@/services');
      await storageService.set('onboarding_completed', true);
      console.log('Onboarding tour skipped');
    } catch (error) {
      console.error('Failed to save onboarding skip', error);
    }
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Onboarding
        pages={pages}
        onDone={handleDone}
        onSkip={handleSkip}
        showSkip={true}
        showNext={true}
        showDone={true}
        bottomBarHighlight={false}
        bottomBarHeight={80}
        titleStyles={{ ...styles.title, color: colors.text }}
        subTitleStyles={{ ...styles.subtitle, color: colors.textSecondary }}
        skipLabel={t('screens.onboarding.buttons.skip')}
        nextLabel={t('screens.onboarding.buttons.next')}
        doneLabel={t('screens.onboarding.buttons.done')}
        skipButtonComponent={({ onPress }: { onPress: () => void }) => (
          <Button
            title={t('screens.onboarding.buttons.skip')}
            onPress={onPress}
            variant="outline"
            style={styles.skipButton}
          />
        )}
        nextButtonComponent={({ onPress }: { onPress: () => void }) => (
          <Button
            title={t('screens.onboarding.buttons.next')}
            onPress={onPress}
            variant="primary"
            style={styles.nextButton}
          />
        )}
        doneButtonComponent={({ onPress }: { onPress: () => void }) => (
          <Button
            title={t('screens.onboarding.buttons.done')}
            onPress={onPress}
            variant="primary"
            style={styles.doneButton}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  skipButton: {
    marginRight: 20,
  },
  nextButton: {
    marginLeft: 20,
  },
  doneButton: {
    marginLeft: 20,
  },
});

export default OnboardingTourScreen;
