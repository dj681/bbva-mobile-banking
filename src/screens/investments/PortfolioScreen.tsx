import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPortfolio } from '@/store/slices/investmentsSlice';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { InvestmentItem } from '@/components/banking/InvestmentItem';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import type { InvestmentsStackParamList, Investment, PortfolioSummary } from '@/types';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

const { width: screenWidth } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<InvestmentsStackParamList, 'Portfolio'>;
type Period = '1S' | '1M' | '3M' | '6M' | '1A';

const PERIODS: Period[] = ['1S', '1M', '3M', '6M', '1A'];

const CHART_CONFIG: Record<Period, { labels: string[]; data: number[] }> = {
  '1S': {
    labels: ['L', 'M', 'J', 'V', 'S', 'D'],
    data: [23100, 23450, 23800, 24100, 24450, 24680],
  },
  '1M': {
    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'Auj'],
    data: [22000, 22500, 22200, 23100, 23800, 24680],
  },
  '3M': {
    labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'],
    data: [20500, 21200, 20800, 22100, 23200, 24680],
  },
  '6M': {
    labels: ['Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Mar'],
    data: [19800, 20200, 20500, 20100, 22800, 24680],
  },
  '1A': {
    labels: ['Avr', 'Juin', 'Août', 'Oct', 'Déc', 'Mar'],
    data: [18000, 18800, 20000, 20500, 21000, 24680],
  },
};

const ALLOCATIONS = [
  { label: 'Acciones', percentage: 60, color: '#003366' },
  { label: 'ETF', percentage: 25, color: '#00A8E8' },
  { label: 'Bonos', percentage: 15, color: '#4CAF50' },
];

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.header,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.headerText,
    },
    refreshBtn: {
      padding: 4,
    },
    listContent: {
      paddingBottom: 32,
    },
    // Summary card
    summaryCard: {
      margin: 16,
      borderRadius: 16,
      backgroundColor: colors.primary,
      padding: 20,
      overflow: 'hidden',
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: '500',
    },
    totalValue: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    gainLossRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    gainLossBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      gap: 4,
    },
    gainLossText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    summaryDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginBottom: 12,
    },
    summaryRowGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryGridItem: {
      flex: 1,
    },
    summaryGridLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.65)',
      marginBottom: 2,
    },
    summaryGridValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    // Chart section
    chartSection: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 3,
      marginBottom: 12,
    },
    periodTab: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
      borderRadius: 8,
    },
    periodTabActive: {
      backgroundColor: colors.primary,
    },
    periodTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    periodTabTextActive: {
      color: '#FFFFFF',
    },
    // Asset allocation
    allocationSection: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    allocationRow: {
      marginBottom: 12,
    },
    allocationRowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    allocationLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    allocationPercent: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    allocationBarBg: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      overflow: 'hidden',
    },
    allocationBarFill: {
      height: 8,
      borderRadius: 4,
    },
    // Holdings
    holdingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    holdingsCard: {
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    itemDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 16,
    },
    // Plans d'épargne
    savingsSection: {
      margin: 16,
      marginTop: 8,
    },
    lastUpdated: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 8,
    },
  });

export const PortfolioScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { investments, portfolio, isLoading } = useAppSelector(
    (state) => state.investments,
  );

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>('1M');
  const [refreshing, setRefreshing] = useState(false);

  const effectiveInvestments = investments;
  const effectivePortfolio: PortfolioSummary =
    portfolio ??
    {
      totalValue: 0,
      totalInvested: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      currency: 'EUR',
      lastUpdated: new Date().toISOString(),
    };

  const isPositive = effectivePortfolio.totalGainLoss >= 0;
  const gainColor = isPositive ? '#4CAF50' : '#F44336';

  const chartData = CHART_CONFIG[activePeriod];

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchPortfolio()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleInvestmentPress = useCallback(
    (investment: Investment) => {
      navigation.navigate('InvestmentDetails', { investmentId: investment.id });
    },
    [navigation],
  );

  const renderInvestmentItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Investment>) => (
      <View>
        <InvestmentItem investment={item} onPress={handleInvestmentPress} />
        {index < effectiveInvestments.length - 1 && <View style={styles.itemDivider} />}
      </View>
    ),
    [handleInvestmentPress, effectiveInvestments.length, styles],
  );

  const ListHeader = useMemo(
    () => (
      <>
        {/* Portfolio Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Valor total de la cartera</Text>
            <TouchableOpacity onPress={() => setBalanceVisible((v) => !v)}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.totalValue}>
            {balanceVisible ? formatCurrency(effectivePortfolio.totalValue) : '• • • • •'}
          </Text>

          <View style={styles.gainLossRow}>
            <View
              style={[
                styles.gainLossBadge,
                { backgroundColor: isPositive ? 'rgba(76,175,80,0.25)' : 'rgba(244,67,54,0.25)' },
              ]}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={gainColor}
              />
              <Text style={[styles.gainLossText, { color: gainColor }]}>
                {isPositive ? '+' : ''}
                {balanceVisible
                  ? formatCurrency(effectivePortfolio.totalGainLoss)
                  : '• • •'}
              </Text>
            </View>
            <Badge
              label={`${isPositive ? '+' : ''}${formatPercentage(effectivePortfolio.totalGainLossPercent)}`}
              variant={isPositive ? 'success' : 'error'}
              size="small"
            />
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRowGrid}>
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryGridLabel}>Invertido</Text>
              <Text style={styles.summaryGridValue}>
                {balanceVisible ? formatCurrency(effectivePortfolio.totalInvested) : '• • •'}
              </Text>
            </View>
            <View style={[styles.summaryGridItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.summaryGridLabel}>Inversiones</Text>
              <Text style={styles.summaryGridValue}>{effectiveInvestments.length}</Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Rentabilidad</Text>
          <View style={styles.periodSelector}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, activePeriod === p && styles.periodTabActive]}
                onPress={() => setActivePeriod(p)}
              >
                <Text
                  style={[
                    styles.periodTabText,
                    activePeriod === p && styles.periodTabTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{ data: chartData.data }],
            }}
            width={screenWidth - 64}
            height={180}
            chartConfig={{
              backgroundColor: '#003366',
              backgroundGradientFrom: '#003366',
              backgroundGradientTo: '#00A8E8',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffffff' },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        {/* Asset Allocation */}
        <View style={styles.allocationSection}>
          <Text style={styles.sectionTitle}>Asignación de activos</Text>
          {ALLOCATIONS.map((alloc) => (
            <View key={alloc.label} style={styles.allocationRow}>
              <View style={styles.allocationRowHeader}>
                <Text style={styles.allocationLabel}>{alloc.label}</Text>
                <Text style={styles.allocationPercent}>{alloc.percentage}%</Text>
              </View>
              <View style={styles.allocationBarBg}>
                <View
                  style={[
                    styles.allocationBarFill,
                    {
                      width: `${alloc.percentage}%`,
                      backgroundColor: alloc.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Holdings Header */}
        <View style={styles.holdingsHeader}>
          <Text style={styles.sectionTitle}>Mis Inversiones</Text>
          <Badge label={`${effectiveInvestments.length}`} variant="info" size="small" />
        </View>

        <View style={styles.holdingsCard}>
          {effectiveInvestments.length === 0 && (
            <EmptyState
              icon="bar-chart-outline"
              title="Sin inversiones"
              message="Todavía no tiene inversiones en su cartera."
            />
          )}
        </View>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      styles,
      balanceVisible,
      activePeriod,
      effectivePortfolio,
      effectiveInvestments,
      chartData,
      isPositive,
      gainColor,
    ],
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.savingsSection}>
        <Button
          label="Planes de Ahorro"
          variant="outline"
          fullWidth
          leftIcon={<Ionicons name="trending-up-outline" size={18} color={colors.primary} />}
          onPress={() => navigation.navigate('SavingsPlans')}
        />
        <Text style={styles.lastUpdated}>
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </View>
    ),
    [styles, colors, navigation],
  );

  if (isLoading && effectiveInvestments.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Cartera</Text>
        </View>
        <LoadingSpinner message="Cargando la cartera…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Cartera</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={effectiveInvestments}
        keyExtractor={(item) => item.id}
        renderItem={renderInvestmentItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PortfolioScreen;
