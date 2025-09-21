import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { ARABIC_TEXTS } from '../localization';
import { nfcService } from '../services/nfc';
import { AppError, NFCScanResult } from '../types';

interface UseNFCOptions {
  onScanSuccess?: (result: NFCScanResult) => void;
  onScanError?: (error: AppError) => void;
  autoStart?: boolean;
}

export const useNFC = (options: UseNFCOptions = {}) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanResult, setLastScanResult] = useState<NFCScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize NFC
  const initialize = useCallback(async () => {
    try {
      const supported = await nfcService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const initialized = await nfcService.initialize();
        if (initialized) {
          const enabled = await nfcService.isEnabled();
          setIsEnabled(enabled);
        }
      }

      return supported;
    } catch (err: any) {
      console.error('NFC initialization error:', err);
      setError(err.message || 'Failed to initialize NFC');
      return false;
    }
  }, []);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = ARABIC_TEXTS.ERROR_NFC_NOT_SUPPORTED;
      setError(errorMsg);
      options.onScanError?.('NFC_NOT_SUPPORTED');
      return;
    }

    if (!isEnabled) {
      const errorMsg = ARABIC_TEXTS.ERROR_NFC_DISABLED;
      setError(errorMsg);
      options.onScanError?.('NFC_DISABLED');
      
      // On Android, offer to open NFC settings
      if (Platform.OS === 'android') {
        Alert.alert(
          'NFC غير مفعل',
          'هل تريد فتح إعدادات NFC؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { 
              text: 'فتح الإعدادات', 
              onPress: () => nfcService.openNFCSettings() 
            },
          ]
        );
      }
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const result = await nfcService.startScanning();
      setLastScanResult(result);

      if (result.success) {
        // Success haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        options.onScanSuccess?.(result);
      } else {
        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errorMsg = mapErrorToArabic(result.error || 'UNKNOWN_ERROR');
        setError(errorMsg);
        options.onScanError?.(result.error as AppError || 'UNKNOWN_ERROR');
      }
    } catch (err: any) {
      console.error('NFC scanning error:', err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMsg = mapErrorToArabic(err.message || 'UNKNOWN_ERROR');
      setError(errorMsg);
      setLastScanResult({
        success: false,
        error: err.message || 'UNKNOWN_ERROR',
        timestamp: Date.now(),
      });
      options.onScanError?.(err.message as AppError || 'UNKNOWN_ERROR');
    } finally {
      setIsScanning(false);
    }
  }, [isSupported, isEnabled, options]);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    try {
      await nfcService.stopScanning();
      setIsScanning(false);
    } catch (err: any) {
      console.error('Error stopping NFC scan:', err);
    }
  }, []);

  // Check NFC status
  const checkStatus = useCallback(async () => {
    try {
      const [supported, enabled] = await Promise.all([
        nfcService.isSupported(),
        nfcService.isEnabled(),
      ]);

      setIsSupported(supported);
      setIsEnabled(enabled);

      return { supported, enabled };
    } catch (err: any) {
      console.error('Error checking NFC status:', err);
      return { supported: false, enabled: false };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear last scan result
  const clearLastScanResult = useCallback(() => {
    setLastScanResult(null);
  }, []);

  // Open NFC settings (Android only)
  const openSettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      await nfcService.openNFCSettings();
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Auto-start if requested and supported
    if (options.autoStart) {
      const autoStartTimeout = setTimeout(() => {
        if (isSupported && isEnabled) {
          startScanning();
        }
      }, 1000); // Small delay to ensure initialization

      return () => clearTimeout(autoStartTimeout);
    }
  }, [initialize, options.autoStart, isSupported, isEnabled, startScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nfcService.cleanup();
    };
  }, []);

  return {
    // State
    isSupported,
    isEnabled,
    isScanning,
    lastScanResult,
    error,

    // Actions
    initialize,
    startScanning,
    stopScanning,
    checkStatus,
    clearError,
    clearLastScanResult,
    openSettings,

    // Computed
    canScan: isSupported && isEnabled,
    needsPermission: isSupported && !isEnabled,
  };
};

// Helper function to map error codes to Arabic messages
const mapErrorToArabic = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'NFC_NOT_SUPPORTED': ARABIC_TEXTS.ERROR_NFC_NOT_SUPPORTED,
    'NFC_DISABLED': ARABIC_TEXTS.ERROR_NFC_DISABLED,
    'NFC_NOT_AVAILABLE_IN_EXPO_GO': ARABIC_TEXTS.ERROR_NFC_NOT_AVAILABLE_IN_EXPO_GO,
    'SCAN_TIMEOUT': ARABIC_TEXTS.ERROR_SCAN_TIMEOUT,
    'INVALID_CARD': ARABIC_TEXTS.ERROR_INVALID_CARD,
    'NETWORK_ERROR': ARABIC_TEXTS.ERROR_NETWORK,
    'SERVER_ERROR': ARABIC_TEXTS.ERROR_SERVER,
    'UNKNOWN_ERROR': ARABIC_TEXTS.ERROR_UNKNOWN,
  };

  return errorMap[errorCode] || ARABIC_TEXTS.ERROR_UNKNOWN;
};

export default useNFC;