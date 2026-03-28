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

const MOCK_PORTFOLIO: PortfolioSummary = {
  totalValue: 24680.45,
  totalInvested: 20000,
  totalGainLoss: 4680.45,
  totalGainLossPercent: 23.4,
  currency: 'EUR',
  lastUpdated: new Date().toISOString(),
};

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: '1',
    symbol: 'MC',
    name: 'LVMH Moët Hennessy',
    type: 'stock',
    quantity: 5,
    purchasePrice: 620,
    currentPrice: 780.5,
    currentValue: 3902.5,
    gainLoss: 802.5,
    gainLossPercent: 25.89,
    currency: 'EUR',
    purchaseDate: '2023-01-15',
    lastUpdated: new Date().toISOString(),
    sector: 'Luxe',
    isin: 'FR0000121014',
    allocation: 15.8,
  },
  {
    id: '2',
    symbol: 'BNP',
    name: 'BNP Paribas',
    type: 'stock',
    quantity: 20,
    purchasePrice: 52,
    currentPrice: 58.2,
    currentValue: 1164,
    gainLoss: 124,
    gainLossPercent: 11.92,
    currency: 'EUR',
    purchaseDate: '2023-03-10',
    lastUpdated: new Date().toISOString(),
    sector: 'Finance',
    isin: 'FR0000131104',
    allocation: 4.7,
  },
  {
    id: '3',
    symbol: 'AMUN',
    name: 'Amundi CAC 40 ETF',
    type: 'etf',
    quantity: 30,
    purchasePrice: 80,
    currentPrice: 92.4,
    currentValue: 2772,
    gainLoss: 372,
    gainLossPercent: 15.5,
    currency: 'EUR',
    purchaseDate: '2022-06-01',
    lastUpdated: new Date().toISOString(),
    sector: 'ETF France',
    isin: 'FR0007052782',
    allocation: 11.2,
  },
  {
    id: '4',
    symbol: 'AIR',
    name: 'Airbus SE',
    type: 'stock',
    quantity: 10,
    purchasePrice: 110,
    currentPrice: 152.8,
    currentValue: 1528,
    gainLoss: 428,
    gainLossPercent: 38.91,
    currency: 'EUR',
    purchaseDate: '2022-12-01',
    lastUpdated: new Date().toISOString(),
    sector: 'Aéronautique',
    isin: 'NL0000235190',
    allocation: 6.2,
  },
  {
    id: '5',
    symbol: 'OAT',
    name: 'OAT France 10 ans',
    type: 'bond',
    quantity: 15,
    purchasePrice: 98,
    currentPrice: 96.5,
    currentValue: 1447.5,
    gainLoss: -22.5,
    gainLossPercent: -1.53,
    currency: 'EUR',
    purchaseDate: '2023-09-01',
    lastUpdated: new Date().toISOString(),
    sector: 'Obligations',
    isin: 'FR0013380607',
    allocation: 5.9,
  },
];

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
  { label: 'Actions', percentage: 60, color: '#003366' },
  { label: 'ETF', percentage: 25, color: '#00A8E8' },
  { label: 'Obligations', percentage: 15, color: '#4CAF50' },
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

  const effectiveInvestments = investments.length > 0 ? investments : MOCK_INVESTMENTS;
  const effectivePortfolio = portfolio ?? MOCK_PORTFOLIO;

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
            <Text style={styles.summaryLabel}>Valeur totale du portefeuille</Text>
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
              <Text style={styles.summaryGridLabel}>Investi</Text>
              <Text style={styles.summaryGridValue}>
                {balanceVisible ? formatCurrency(effectivePortfolio.totalInvested) : '• • •'}
              </Text>
            </View>
            <View style={[styles.summaryGridItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.summaryGridLabel}>Placements</Text>
              <Text style={styles.summaryGridValue}>{effectiveInvestments.length}</Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
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
          <Text style={styles.sectionTitle}>Allocation d'actifs</Text>
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
          <Text style={styles.sectionTitle}>Mes Placements</Text>
          <Badge label={`${effectiveInvestments.length}`} variant="info" size="small" />
        </View>

        <View style={styles.holdingsCard}>
          {effectiveInvestments.length === 0 && (
            <EmptyState
              icon="bar-chart-outline"
              title="Aucun placement"
              message="Vous n'avez pas encore de placements dans votre portefeuille."
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
          label="Plans d'Épargne"
          variant="outline"
          fullWidth
          leftIcon={<Ionicons name="trending-up-outline" size={18} color={colors.primary} />}
          onPress={() => navigation.navigate('SavingsPlans')}
        />
        <Text style={styles.lastUpdated}>
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
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
          <Text style={styles.headerTitle}>Mon Portefeuille</Text>
        </View>
        <LoadingSpinner message="Chargement du portefeuille…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Portefeuille</Text>
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
