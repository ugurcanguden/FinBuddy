import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricResult {
  success: boolean;
  error?: string;
}

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);

  const checkBiometricAvailability = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      setIsAvailable(hasHardware);
      setIsEnrolled(isEnrolled);
      
      return { hasHardware, isEnrolled };
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return { hasHardware: false, isEnrolled: false };
    }
  }, []);

  const authenticate = useCallback(async (reason?: string): Promise<BiometricResult> => {
    try {
      // Önce kullanılabilirliği kontrol et
      const { hasHardware, isEnrolled } = await checkBiometricAvailability();
      
      if (!hasHardware) {
        return { success: false, error: 'Biometric authentication not available on this device' };
      }
      
      if (!isEnrolled) {
        return { success: false, error: 'No biometric data enrolled. Please set up fingerprint or face ID' };
      }

      // Biometric authentication başlat
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Please authenticate to continue',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error === 'user_cancel' 
            ? 'Authentication cancelled' 
            : 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }, [checkBiometricAvailability]);

  return {
    isAvailable,
    isEnrolled,
    checkBiometricAvailability,
    authenticate,
  };
};
