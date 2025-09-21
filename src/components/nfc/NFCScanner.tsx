import { ARABIC_TEXTS } from '@/src/localization';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import { ActionButton } from '../ui/ActionButton';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface NFCScannerProps {
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  scanMode: 'onboard' | 'offboard' | 'idle';
  lastScanResult?: {
    success: boolean;
    cardId?: string;
    error?: string;
  };
}

// Get screen dimensions for responsive design
const { width: _screenWidth } = Dimensions.get('window');

export const NFCScanner: React.FC<NFCScannerProps> = ({
  isScanning,
  onStartScan,
  onStopScan,
  scanMode,
  lastScanResult,
}) => {
  const [rippleAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isScanning) {
      // Start ripple animation
      const rippleAnim = Animated.loop(
        Animated.timing(rippleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      
      // Start pulse animation
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      rippleAnim.start();
      pulseAnim.start();

      return () => {
        rippleAnim.stop();
        pulseAnim.stop();
      };
    } else {
      rippleAnimation.setValue(0);
      pulseAnimation.setValue(1);
    }
  }, [isScanning, rippleAnimation, pulseAnimation]);

  const getStatusText = () => {
    if (isScanning) {
      return ARABIC_TEXTS.NFC_SCANNING;
    }
    
    if (lastScanResult) {
      return lastScanResult.success ? ARABIC_TEXTS.NFC_SUCCESS : ARABIC_TEXTS.NFC_FAILED;
    }
    
    return ARABIC_TEXTS.NFC_READY;
  };

  const getStatusColor = () => {
    if (isScanning) return '#F59E0B'; // warning orange
    if (lastScanResult?.success) return '#10B981'; // success green
    if (lastScanResult?.error) return '#EF4444'; // error red
    return '#2D5D31'; // primary green
  };

  const getScanButtonText = () => {
    if (scanMode === 'onboard') return ARABIC_TEXTS.START_ONBOARD;
    if (scanMode === 'offboard') return ARABIC_TEXTS.START_OFFBOARD;
    return ARABIC_TEXTS.NFC_READY;
  };

  const renderNFCZone = () => {
    const rippleScale = rippleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    });

    const rippleOpacity = rippleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    });

    return (
      <View style={styles.nfcZoneContainer}>
        {isScanning && (
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
        )}
        
        <Animated.View
          style={[
            styles.nfcZone,
            {
              transform: [{ scale: pulseAnimation }],
              backgroundColor: getStatusColor(),
            },
          ]}
        >
          <View style={styles.nfcIcon}>
            <Text style={styles.nfcIconText}>NFC</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {scanMode !== 'idle' ? getScanButtonText() : ARABIC_TEXTS.NFC_READY}
        </Text>
        <Text style={styles.instruction}>
          {isScanning ? ARABIC_TEXTS.PLACE_CARD : ARABIC_TEXTS.INSTRUCTION_NFC}
        </Text>
      </View>

      {renderNFCZone()}

      <View style={styles.status}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {lastScanResult?.error && (
          <Text style={styles.errorText}>
            {lastScanResult.error}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {isScanning ? (
          <ActionButton
            title={ARABIC_TEXTS.CANCEL}
            onPress={onStopScan}
            variant="danger"
            fullWidth
          />
        ) : (
          <ActionButton
            title={scanMode === 'idle' ? ARABIC_TEXTS.NFC_READY : ARABIC_TEXTS.SCAN_ANOTHER}
            onPress={onStartScan}
            variant="primary"
            fullWidth
            disabled={scanMode === 'idle'}
          />
        )}
      </View>

      {isScanning && <LoadingSpinner size="small" color={getStatusColor()} />}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 30,
  },
  header: {
    alignItems: 'center' as const,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  instruction: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  nfcZoneContainer: {
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nfcZone: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  ripple: {
    position: 'absolute' as const,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2D5D31',
  },
  nfcIcon: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nfcIconText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  status: {
    alignItems: 'center' as const,
    gap: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  actions: {
    width: '100%' as const,
    maxWidth: 300,
  },
};

export default NFCScanner;