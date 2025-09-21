import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { NFCScanner } from '@/src/components/nfc/NFCScanner';
import { ActionButton } from '@/src/components/ui/ActionButton';
import { Card } from '@/src/components/ui/Card';
import { OverlayLoading } from '@/src/components/ui/LoadingSpinner';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import useNFC from '@/src/hooks/useNFC';
import { usePilgrimByNfc, useUpdatePilgrimStatus } from '@/src/hooks/usePilgrims';
import { ARABIC_TEXTS, toArabicNumbers } from '@/src/localization';
import useAppStore from '@/src/store';


export default function ScannerScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'onboard' | 'offboard' }>();
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);
  const [showPilgrimDetails, setShowPilgrimDetails] = useState(false);

  // Hooks
  const { 
    isScanning, 
    startScanning, 
    stopScanning, 
    lastScanResult,
    error: nfcError,
    clearError
  } = useNFC();

  const { 
    data: scannedPilgrim, 
    isLoading: pilgrimLoading,
    error: pilgrimError 
  } = usePilgrimByNfc(scannedCardId || '');

  const updatePilgrimStatus = useUpdatePilgrimStatus();
  
  // Store
  const { 
    sessionStats, 
    updateSessionStats,
    endSession 
  } = useAppStore();

  // Handlers
  const handleStartScan = async () => {
    clearError();
    setScannedCardId(null);
    setShowPilgrimDetails(false);
    await startScanning();
  };

  const handleStopScan = async () => {
    await stopScanning();
  };

  // Handle scan results
  useEffect(() => {
    if (lastScanResult) {
      if (lastScanResult.success && lastScanResult.cardId) {
        setScannedCardId(lastScanResult.cardId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        updateSessionStats({
          failedScans: sessionStats.failedScans + 1,
          totalScanned: sessionStats.totalScanned + 1,
        });
      }
    }
  }, [lastScanResult]);

  const handleConfirmStatusChange = async () => {
    if (!scannedPilgrim || !mode) return;

    try {
      // Check if status change is valid
      if (mode === 'onboard' && scannedPilgrim.status === 'onboard') {
        Alert.alert('خطأ', ARABIC_TEXTS.ERROR_ALREADY_ONBOARD);
        return;
      }
      
      if (mode === 'offboard' && scannedPilgrim.status === 'offboard') {
        Alert.alert('خطأ', ARABIC_TEXTS.ERROR_ALREADY_OFFBOARD);
        return;
      }

      // Update pilgrim status
      await updatePilgrimStatus.mutateAsync({
        id: scannedPilgrim.id,
        status: mode,
      });

      // Update session stats
      updateSessionStats({
        successfulScans: sessionStats.successfulScans + 1,
        totalScanned: sessionStats.totalScanned + 1,
        ...(mode === 'onboard' && { onboardCount: sessionStats.onboardCount + 1 }),
        ...(mode === 'offboard' && { offboardCount: sessionStats.offboardCount + 1 }),
      });

      // Success feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Show success message
      const successMessage = mode === 'onboard' 
        ? ARABIC_TEXTS.SUCCESS_ONBOARD 
        : ARABIC_TEXTS.SUCCESS_OFFBOARD;
      
      Alert.alert('نجح', successMessage, [
        {
          text: ARABIC_TEXTS.SCAN_ANOTHER,
          onPress: () => {
            setScannedCardId(null);
            setShowPilgrimDetails(false);
          }
        },
        {
          text: ARABIC_TEXTS.CLOSE,
          onPress: () => {
            endSession();
            router.back();
          }
        }
      ]);

    } catch (error: any) {
      console.error('Error updating pilgrim status:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('خطأ', error.message || 'فشل في تحديث حالة الحاج');
      
      updateSessionStats({
        failedScans: sessionStats.failedScans + 1,
        totalScanned: sessionStats.totalScanned + 1,
      });
    }
  };

  const handleCancel = () => {
    endSession();
    router.back();
  };

  // Effect to handle pilgrim found/not found
  useEffect(() => {
    if (scannedCardId && !pilgrimLoading) {
      if (scannedPilgrim) {
        setShowPilgrimDetails(true);
      } else {
        // Pilgrim not found
        Alert.alert('خطأ', ARABIC_TEXTS.ERROR_PILGRIM_NOT_FOUND, [
          {
            text: ARABIC_TEXTS.RETRY,
            onPress: () => {
              setScannedCardId(null);
            }
          },
          {
            text: ARABIC_TEXTS.CANCEL,
            onPress: handleCancel
          }
        ]);
        
        updateSessionStats({
          failedScans: sessionStats.failedScans + 1,
          totalScanned: sessionStats.totalScanned + 1,
        });
      }
    }
  }, [scannedCardId, scannedPilgrim, pilgrimLoading]);

  if (!mode) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>وضع المسح غير محدد</Text>
        <ActionButton title="العودة" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Session Stats Header */}
      <Card style={styles.statsHeader}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {toArabicNumbers(sessionStats.totalScanned.toString())}
            </Text>
            <Text style={styles.statLabel}>إجمالي المسح</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {toArabicNumbers(sessionStats.successfulScans.toString())}
            </Text>
            <Text style={styles.statLabel}>ناجح</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {toArabicNumbers(sessionStats.failedScans.toString())}
            </Text>
            <Text style={styles.statLabel}>فاشل</Text>
          </View>
        </View>
      </Card>

      {/* NFC Scanner */}
      <View style={styles.scannerContainer}>
        <NFCScanner
          isScanning={isScanning}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
          scanMode={mode}
          lastScanResult={lastScanResult || undefined}
        />
      </View>

      {/* Pilgrim Details Modal */}
      {showPilgrimDetails && scannedPilgrim && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Card style={styles.pilgrimCard}>
              <View style={styles.pilgrimHeader}>
                <Text style={styles.pilgrimName}>{scannedPilgrim.full_name}</Text>
                <StatusBadge status={scannedPilgrim.status} size="lg" />
              </View>
              
              <View style={styles.pilgrimDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم جواز السفر:</Text>
                  <Text style={styles.detailValue}>
                    {toArabicNumbers(scannedPilgrim.passport_number)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم المقعد:</Text>
                  <Text style={styles.detailValue}>
                    {toArabicNumbers(scannedPilgrim.seat_number.toString())}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الجنسية:</Text>
                  <Text style={styles.detailValue}>{scannedPilgrim.nationality}</Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <ActionButton
                  title={mode === 'onboard' ? 'تأكيد الصعود' : 'تأكيد النزول'}
                  onPress={handleConfirmStatusChange}
                  variant={mode === 'onboard' ? 'success' : 'danger'}
                  fullWidth
                  loading={updatePilgrimStatus.isPending}
                />
                
                <ActionButton
                  title="إلغاء"
                  onPress={() => {
                    setScannedCardId(null);
                    setShowPilgrimDetails(false);
                  }}
                  variant="secondary"
                  fullWidth
                />
              </View>
            </Card>
          </View>
        </View>
      )}

      {/* Loading Overlay */}
      {pilgrimLoading && <OverlayLoading text="جاري البحث عن الحاج..." />}

      {/* Error Display */}
      {(nfcError || pilgrimError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            {nfcError || pilgrimError?.message || 'حدث خطأ'}
          </Text>
        </View>
      )}

      {/* Cancel Button */}
      <View style={styles.cancelContainer}>
        <ActionButton
          title="إنهاء الجلسة"
          onPress={handleCancel}
          variant="secondary"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statsHeader: {
    margin: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: '#2D5D31',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: '#6B7280',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  scannerContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Cairo_500Medium',
    color: '#EF4444',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: '#DC2626',
    writingDirection: 'rtl',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
  },
  pilgrimCard: {
    padding: 24,
  },
  pilgrimHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  pilgrimName: {
    fontSize: 22,
    fontFamily: 'Cairo_700Bold',
    color: '#1F2937',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  pilgrimDetails: {
    gap: 12,
    marginBottom: 24,
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
  modalActions: {
    gap: 12,
  },
  cancelContainer: {
    padding: 20,
    paddingTop: 10,
  },
});