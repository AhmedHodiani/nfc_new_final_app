import { ARABIC_TEXTS } from '@/src/localization';
import React from 'react';
import { Text, View } from 'react-native';

interface StatusBadgeProps {
  status: 'onboard' | 'offboard';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusConfig = {
    onboard: {
      text: ARABIC_TEXTS.ONBOARD,
      backgroundColor: '#10B981', // success green
      color: '#FFFFFF',
    },
    offboard: {
      text: ARABIC_TEXTS.OFFBOARD,
      backgroundColor: '#EF4444', // error red
      color: '#FFFFFF',
    },
  };

  const sizeConfig = {
    sm: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontSize: 12,
      borderRadius: 4,
    },
    md: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 14,
      borderRadius: 6,
    },
    lg: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 16,
      borderRadius: 8,
    },
  };

  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  const containerStyle = {
    backgroundColor: config.backgroundColor,
    borderRadius: sizeStyle.borderRadius,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    paddingVertical: sizeStyle.paddingVertical,
    alignSelf: 'flex-start' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  };

  const textStyle = {
    color: config.color,
    fontSize: sizeStyle.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  };

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{config.text}</Text>
    </View>
  );
};

export default StatusBadge;