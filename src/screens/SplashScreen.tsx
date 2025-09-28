// Splash Screen - Uygulama başlangıç ekranı
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { View, Text } from '@/components';
import { useTheme } from '@/contexts';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animasyonu
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

      // 2 saniye sonra ana uygulamaya geç
      const timer = setTimeout(() => {
        pulseAnimation.stop();
        onAnimationComplete();
      }, 2000);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim, onAnimationComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Arka Plan Gradient Efekti */}
      <View style={[styles.backgroundGradient, { backgroundColor: colors.primary }]} />
      
      {/* Dekoratif Elementler */}
      <View style={[styles.decorativeCircle1, { backgroundColor: colors.primary }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: colors.primary }]} />
      <View style={[styles.decorativeCircle3, { backgroundColor: colors.primary }]} />
      
      {/* Logo ve İkon */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.logoCircle,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <Text style={[styles.logoText, { color: colors.background }] as any}>
            💰
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Uygulama Adı */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text
          variant="primary"
          size="xlarge"
          weight="bold"
          style={[styles.appName, { color: colors.text }] as any}
        >
          FinBuddy
        </Text>
      </Animated.View>

      {/* Alt Bilgi */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text
          variant="secondary"
          size="small"
          style={[styles.tagline, { color: colors.textSecondary }] as any}
        >
          Kişisel Finans Yönetimi
        </Text>
        <Text
          variant="secondary"
          size="small"
          style={[styles.version, { color: colors.textSecondary }] as any}
        >
          v1.0.0
        </Text>
      </Animated.View>

      {/* Yükleme İndikatörü */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={[styles.loadingBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                backgroundColor: colors.primary,
                transform: [
                  {
                    scaleX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                transformOrigin: 'left',
              },
            ]}
          />
        </View>
        <Text
          variant="secondary"
          size="small"
          style={[styles.loadingText, { color: colors.textSecondary }] as any}
        >
          Yükleniyor...
        </Text>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -80,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.08,
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 300,
    left: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.06,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  version: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 16,
    opacity: 0.9,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 140,
    width: width * 0.7,
    alignItems: 'center',
  },
  loadingBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 18,
    opacity: 0.9,
    fontWeight: '700',
  },
});

export default SplashScreen;
