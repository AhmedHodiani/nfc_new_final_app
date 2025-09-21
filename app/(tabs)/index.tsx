import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

// Import our components and hooks
import { ActionButton } from '@/src/components/ui/ActionButton';
import { Card } from '@/src/components/ui/Card';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import useNFC from '@/src/hooks/useNFC';
import { usePilgrims, usePilgrimsStats } from '@/src/hooks/usePilgrims';
import { ARABIC_TEXTS, toArabicNumbers } from '@/src/localization';
import useAppStore from '@/src/store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  // Hooks
  const { data: pilgrims, isLoading: pilgrimsLoading, refetch: refetchPilgrims } = usePilgrims();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePilgrimsStats();
  const { isSupported: nfcSupported, isEnabled: nfcEnabled, checkStatus } = useNFC();
  
  // Store
  const { startSession, sessionStats } = useAppStore();

  // Handlers
  const handleStartOnboard = async () => {
    if (!nfcSupported) {
      Alert.alert('خطأ', ARABIC_TEXTS.ERROR_NFC_NOT_SUPPORTED);
      return;
    }

    if (!nfcEnabled) {
      Alert.alert('خطأ', ARABIC_TEXTS.ERROR_NFC_DISABLED);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession('onboard');
    router.push({ pathname: '/scanner', params: { mode: 'onboard' } });
  };

  const handleStartOffboard = async () => {
    if (!nfcSupported) {
      Alert.alert('خطأ', ARABIC_TEXTS.ERROR_NFC_NOT_SUPPORTED);
      return;
    }

    if (!nfcEnabled) {
      Alert.alert('خطأ', ARABIC_TEXTS.ERROR_NFC_DISABLED);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession('offboard');
    router.push({ pathname: '/scanner', params: { mode: 'offboard' } });
  };

  const handleViewPilgrims = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/explore');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPilgrims(),
        refetchStats(),
        checkStatus(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Stats cards data
  const statsData = [
    {
      label: ARABIC_TEXTS.TOTAL_SCANNED,
      value: toArabicNumbers((stats?.total || 0).toString()),
      color: '#2D5D31',
    },
    {
      label: ARABIC_TEXTS.ONBOARD_COUNT,
      value: toArabicNumbers((stats?.onboard || 0).toString()),
      color: '#10B981',
    },
    {
      label: ARABIC_TEXTS.OFFBOARD_COUNT,
      value: toArabicNumbers((stats?.offboard || 0).toString()),
      color: '#EF4444',
    },
  ];

  const currentSessionData = [
    {
      label: ARABIC_TEXTS.SUCCESSFUL_SCANS,
      value: toArabicNumbers(sessionStats.successfulScans.toString()),
      color: '#10B981',
    },
    {
      label: ARABIC_TEXTS.FAILED_SCANS,
      value: toArabicNumbers(sessionStats.failedScans.toString()),
      color: '#EF4444',
    },
  ];

  if (pilgrimsLoading || statsLoading) {
    return <LoadingSpinner text={ARABIC_TEXTS.LOADING} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2D5D31']}
          tintColor="#2D5D31"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>{ARABIC_TEXTS.APP_NAME}</Text>
        <Text style={styles.subtitle}>
          {nfcSupported 
            ? (nfcEnabled ? ARABIC_TEXTS.NFC_READY : ARABIC_TEXTS.ERROR_NFC_DISABLED)
            : ARABIC_TEXTS.ERROR_NFC_NOT_SUPPORTED
          }
        </Text>
      </View>

      {/* NFC Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: nfcSupported && nfcEnabled ? '#10B981' : '#EF4444' 
          }]} />
          <Text style={styles.statusText}>
            NFC {nfcSupported && nfcEnabled ? 'جاهز' : 'غير متاح'}
          </Text>
        </View>
      </Card>

      {/* Main Action Buttons */}
      <View style={styles.actionsContainer}>
        <ActionButton
          title={ARABIC_TEXTS.START_ONBOARD}
          onPress={handleStartOnboard}
          variant="success"
          size="lg"
          fullWidth
          disabled={!nfcSupported || !nfcEnabled}
        />
        
        <ActionButton
          title={ARABIC_TEXTS.START_OFFBOARD}
          onPress={handleStartOffboard}
          variant="danger"
          size="lg"
          fullWidth
          disabled={!nfcSupported || !nfcEnabled}
        />
        
        <ActionButton
          title={ARABIC_TEXTS.VIEW_PILGRIMS}
          onPress={handleViewPilgrims}
          variant="primary"
          size="md"
          fullWidth
        />
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>إحصائيات عامة</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Current Session Stats */}
      {(sessionStats.totalScanned > 0) && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>الجلسة الحالية</Text>
          <View style={styles.statsGrid}>
            {currentSessionData.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {pilgrims && pilgrims.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>آخر التحديثات</Text>
          <View style={styles.recentList}>
            {pilgrims
              .slice()
              .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
              .slice(0, 3)
              .map((pilgrim) => (
                <Card key={pilgrim.id} style={styles.recentItem}>
                  <View style={styles.recentContent}>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {pilgrim.full_name}
                      </Text>
                      <Text style={styles.recentSeat}>
                        مقعد {toArabicNumbers(pilgrim.seat_number.toString())}
                      </Text>
                    </View>
                    <StatusBadge status={pilgrim.status} size="sm" />
                  </View>
                </Card>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Cairo_700Bold',
    color: '#2D5D31',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Cairo_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  statusCard: {
    marginBottom: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Cairo_500Medium',
    color: '#1F2937',
    writingDirection: 'rtl',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cairo_600SemiBold',
    color: '#1F2937',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Cairo_700Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    padding: 12,
  },
  recentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontFamily: 'Cairo_500Medium',
    color: '#1F2937',
    writingDirection: 'rtl',
    marginBottom: 2,
  },
  recentSeat: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: '#6B7280',
    writingDirection: 'rtl',
  },
});
