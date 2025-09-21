import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/src/components/ui/ActionButton';
import { Card } from '@/src/components/ui/Card';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { usePilgrim, useUpdatePilgrimStatus } from '@/src/hooks/usePilgrims';
import { ARABIC_TEXTS, toArabicNumbers } from '@/src/localization';

export default function PilgrimDetailsModal() {
  const { pilgrimId } = useLocalSearchParams<{ pilgrimId: string }>();
  
  // Hooks
  const { data: pilgrim, isLoading, error } = usePilgrim(pilgrimId || '');
  const updateStatus = useUpdatePilgrimStatus();

  // Handlers
  const handleStatusToggle = async () => {
    if (!pilgrim) return;

    const newStatus = pilgrim.status === 'onboard' ? 'offboard' : 'onboard';
    const actionText = newStatus === 'onboard' ? 'صعود' : 'نزول';
    
    Alert.alert(
      'تأكيد العملية',
      `هل تريد تأكيد ${actionText} ${pilgrim.full_name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            try {
              await updateStatus.mutateAsync({
                id: pilgrim.id,
                status: newStatus,
              });
              
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              const successMessage = newStatus === 'onboard' 
                ? ARABIC_TEXTS.SUCCESS_ONBOARD 
                : ARABIC_TEXTS.SUCCESS_OFFBOARD;
              
              Alert.alert('نجح', successMessage);
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('خطأ', error.message || 'فشل في تحديث الحالة');
            }
          }
        }
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingSpinner text={ARABIC_TEXTS.LOADING} />;
  }

  if (error || !pilgrim) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || 'لم يتم العثور على بيانات الحاج'}
        </Text>
        <ActionButton title="إغلاق" onPress={handleClose} />
      </View>
    );
  }

  const renderPhoto = () => {
    if (!pilgrim.photo) {
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
        defaultSource={require('@/assets/images/icon.png')}
      />
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return toArabicNumbers(date.toLocaleDateString('ar-SA'));
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with photo and basic info */}
      <Card style={styles.headerCard}>
        <View style={styles.photoContainer}>
          {renderPhoto()}
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.pilgrimName}>{pilgrim.full_name}</Text>
          <StatusBadge status={pilgrim.status} size="lg" />
        </View>
      </Card>

      {/* Personal Information */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>رقم جواز السفر:</Text>
            <Text style={styles.detailValue}>
              {toArabicNumbers(pilgrim.passport_number)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ الميلاد:</Text>
            <Text style={styles.detailValue}>
              {formatDate(pilgrim.date_of_birth)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الجنس:</Text>
            <Text style={styles.detailValue}>
              {pilgrim.sex === 'male' ? ARABIC_TEXTS.MALE : ARABIC_TEXTS.FEMALE}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الجنسية:</Text>
            <Text style={styles.detailValue}>{pilgrim.nationality}</Text>
          </View>
        </View>
      </Card>

      {/* Travel Information */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>معلومات السفر</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>رقم المقعد:</Text>
            <Text style={[styles.detailValue, styles.seatNumber]}>
              {toArabicNumbers(pilgrim.seat_number.toString())}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>رقم الرقاقة:</Text>
            <Text style={styles.detailValue}>
              {toArabicNumbers(pilgrim.nfc_card_id)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>رقم الهاتف:</Text>
            <Text style={styles.detailValue}>
              {toArabicNumbers(pilgrim.phone)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الحالة الحالية:</Text>
            <StatusBadge status={pilgrim.status} size="md" />
          </View>
        </View>
      </Card>

      {/* Timestamps */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>معلومات إضافية</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ الإنشاء:</Text>
            <Text style={styles.detailValue}>
              {formatDate(pilgrim.created)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>آخر تحديث:</Text>
            <Text style={styles.detailValue}>
              {formatDate(pilgrim.updated)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <ActionButton
          title={pilgrim.status === 'onboard' ? 'تسجيل النزول' : 'تسجيل الصعود'}
          onPress={handleStatusToggle}
          variant={pilgrim.status === 'onboard' ? 'danger' : 'success'}
          fullWidth
          loading={updateStatus.isPending}
        />
        
        <ActionButton
          title="إغلاق"
          onPress={handleClose}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Cairo_500Medium',
    color: '#EF4444',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  headerCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2D5D31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Cairo_700Bold',
  },
  headerInfo: {
    alignItems: 'center',
    gap: 12,
  },
  pilgrimName: {
    fontSize: 24,
    fontFamily: 'Cairo_700Bold',
    color: '#1F2937',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo_600SemiBold',
    color: '#1F2937',
    writingDirection: 'rtl',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2D5D31',
    paddingBottom: 8,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Cairo_500Medium',
    color: '#6B7280',
    writingDirection: 'rtl',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: '#1F2937',
    writingDirection: 'rtl',
  },
  seatNumber: {
    fontSize: 18,
    color: '#2D5D31',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 20,
  },
});
