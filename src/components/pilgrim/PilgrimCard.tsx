import React from 'react';
import { View, Text, Image } from 'react-native';
import { Pilgrim } from '../../types';
import { ARABIC_TEXTS, toArabicNumbers } from '../../localization';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface PilgrimCardProps {
  pilgrim: Pilgrim;
  onPress?: (pilgrim: Pilgrim) => void;
  compact?: boolean;
}

export const PilgrimCard: React.FC<PilgrimCardProps> = ({
  pilgrim,
  onPress,
  compact = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(pilgrim);
    }
  };

  const renderPhoto = () => {
    if (!pilgrim.photo) {
      // Default avatar placeholder
      return (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>
            {pilgrim.full_name.charAt(0)}
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: pilgrim.photo }}
        style={styles.photo}
        defaultSource={require('../../../assets/images/icon.png')}
      />
    );
  };

  const renderContent = () => {
    if (compact) {
      return (
        <View style={styles.compactContent}>
          {renderPhoto()}
          <View style={styles.compactInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {pilgrim.full_name}
            </Text>
            <View style={styles.compactDetails}>
              <Text style={styles.seatNumber}>
                {ARABIC_TEXTS.SEAT_NUMBER}: {toArabicNumbers(pilgrim.seat_number.toString())}
              </Text>
              <StatusBadge status={pilgrim.status} size="sm" />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.fullContent}>
        <View style={styles.header}>
          {renderPhoto()}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{pilgrim.full_name}</Text>
            <Text style={styles.passportNumber}>
              {ARABIC_TEXTS.PASSPORT_NUMBER}: {toArabicNumbers(pilgrim.passport_number)}
            </Text>
            <StatusBadge status={pilgrim.status} size="md" />
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{ARABIC_TEXTS.SEAT_NUMBER}:</Text>
            <Text style={styles.detailValue}>
              {toArabicNumbers(pilgrim.seat_number.toString())}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{ARABIC_TEXTS.PHONE_NUMBER}:</Text>
            <Text style={styles.detailValue}>
              {toArabicNumbers(pilgrim.phone)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{ARABIC_TEXTS.NATIONALITY}:</Text>
            <Text style={styles.detailValue}>{pilgrim.nationality}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Card onPress={handlePress} variant="default" padding="md">
      {renderContent()}
    </Card>
  );
};

const styles = {
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D5D31',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  photoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600' as const,
  },
  compactContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 4,
  },
  fullContent: {
    gap: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    writingDirection: 'rtl' as const,
  },
  passportNumber: {
    fontSize: 14,
    color: '#6B7280',
    writingDirection: 'rtl' as const,
  },
  seatNumber: {
    fontSize: 14,
    color: '#6B7280',
    writingDirection: 'rtl' as const,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
    writingDirection: 'rtl' as const,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400' as const,
    writingDirection: 'rtl' as const,
  },
};

export default PilgrimCard;