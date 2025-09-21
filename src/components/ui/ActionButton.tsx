import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  // Base styles
  const baseStyle = {
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  // Variant styles
  const variantStyles = {
    primary: { backgroundColor: '#2D5D31' },
    secondary: { backgroundColor: '#4A7C59' },
    success: { backgroundColor: '#10B981' },
    danger: { backgroundColor: '#EF4444' },
    warning: { backgroundColor: '#F59E0B' },
  };

  // Size styles
  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 8 },
    md: { paddingHorizontal: 16, paddingVertical: 12 },
    lg: { paddingHorizontal: 24, paddingVertical: 16 },
  };

  // Text size styles
  const textSizeStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  const buttonStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(fullWidth && { width: '100%' as const }),
    opacity: disabled || loading ? 0.5 : 1,
  };

  const textStyle = {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
    ...textSizeStyles[size],
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={textStyle}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ActionButton;