import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// Import our components and hooks
import { PilgrimCard } from '@/src/components/pilgrim/PilgrimCard';
import { ActionButton } from '@/src/components/ui/ActionButton';
import { Card } from '@/src/components/ui/Card';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { usePilgrims, useRefreshPilgrims } from '@/src/hooks/usePilgrims';
import { ARABIC_TEXTS, toArabicNumbers } from '@/src/localization';
import { Pilgrim } from '@/src/types';

export default function PilgrimsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'onboard' | 'offboard'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { data: pilgrims, isLoading, error } = usePilgrims();
  const refreshPilgrims = useRefreshPilgrims();

  // Filter and search pilgrims
  const filteredPilgrims = useMemo(() => {
    if (!pilgrims) return [];

    let filtered = pilgrims;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pilgrim => pilgrim.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pilgrim => 
        pilgrim.full_name.toLowerCase().includes(query) ||
        pilgrim.passport_number.toLowerCase().includes(query) ||
        pilgrim.seat_number.toString().includes(query)
      );
    }

    // Sort by name
    return filtered.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ar'));
  }, [pilgrims, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!pilgrims) return { total: 0, onboard: 0, offboard: 0 };

    return {
      total: pilgrims.length,
      onboard: pilgrims.filter(p => p.status === 'onboard').length,
      offboard: pilgrims.filter(p => p.status === 'offboard').length,
    };
  }, [pilgrims]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPilgrims();
    } catch (error) {
      console.error('Error refreshing pilgrims:', error);
      Alert.alert('خطأ', 'فشل في تحديث البيانات');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePilgrimPress = (pilgrim: Pilgrim) => {
    router.push({ 
      pathname: '/modal', 
      params: { pilgrimId: pilgrim.id } 
    });
  };

  const renderFilterButton = (
    filter: 'all' | 'onboard' | 'offboard',
    label: string,
    count: number
  ) => (
    <ActionButton
      title={`${label} (${toArabicNumbers(count.toString())})`}
      onPress={() => setStatusFilter(filter)}
      variant={statusFilter === filter ? 'primary' : 'secondary'}
      size="sm"
    />
  );

  const renderPilgrimItem = ({ item }: { item: Pilgrim }) => (
    <PilgrimCard
      pilgrim={item}
      onPress={handlePilgrimPress}
      compact
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery.trim() || statusFilter !== 'all' 
          ? ARABIC_TEXTS.NO_PILGRIMS_FOUND
          : 'لا توجد بيانات حجاج'
        }
      </Text>
      <ActionButton
        title={ARABIC_TEXTS.REFRESH}
        onPress={handleRefresh}
        variant="primary"
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2D5D31' }]}>
            {toArabicNumbers(stats.total.toString())}
          </Text>
          <Text style={styles.statLabel}>إجمالي الحجاج</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {toArabicNumbers(stats.onboard.toString())}
          </Text>
          <Text style={styles.statLabel}>على متن الحافلة</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {toArabicNumbers(stats.offboard.toString())}
          </Text>
          <Text style={styles.statLabel}>خارج الحافلة</Text>
        </Card>
      </View>

      {/* Search Input */}
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder={ARABIC_TEXTS.SEARCH_PLACEHOLDER}
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
          placeholderTextColor="#6B7280"
        />
      </Card>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', ARABIC_TEXTS.FILTER_ALL, stats.total)}
        {renderFilterButton('onboard', ARABIC_TEXTS.FILTER_ONBOARD, stats.onboard)}
        {renderFilterButton('offboard', ARABIC_TEXTS.FILTER_OFFBOARD, stats.offboard)}
      </View>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {toArabicNumbers(filteredPilgrims.length.toString())} نتيجة
      </Text>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner text={ARABIC_TEXTS.LOADING} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error.message || 'حدث خطأ في تحميل البيانات'}
        </Text>
        <ActionButton
          title={ARABIC_TEXTS.RETRY}
          onPress={handleRefresh}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPilgrims}
        renderItem={renderPilgrimItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2D5D31']}
            tintColor="#2D5D31"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 20,
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
  searchCard: {
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    fontFamily: 'Cairo_400Regular',
    color: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    writingDirection: 'rtl',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Cairo_500Medium',
    color: '#6B7280',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Cairo_500Medium',
    color: '#6B7280',
    textAlign: 'center',
    writingDirection: 'rtl',
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
});
