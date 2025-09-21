import { ARABIC_TEXTS } from '@/src/localization';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#2D5D31',
  text,
  overlay = false,
}) => {
  const containerStyle = {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
    ...(overlay && {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 1000,
    }),
  };

  const textStyle = {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
    fontWeight: '500' as const,
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={textStyle}>{text}</Text>}
    </View>
  );
};

// Preset loading components for common use cases
export const PilgrimsLoading: React.FC = () => (
  <LoadingSpinner text={ARABIC_TEXTS.LOADING} />
);

export const NFCScanning: React.FC = () => (
  <LoadingSpinner text={ARABIC_TEXTS.NFC_SCANNING} color="#F59E0B" />
);

export const OverlayLoading: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner text={text || ARABIC_TEXTS.LOADING} overlay />
);

export default LoadingSpinner;