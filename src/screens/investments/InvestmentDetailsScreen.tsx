import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchInvestmentDetails, fetchPriceHistory, setSelectedInvestment } from '@/store/slices/investmentsSlice';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import type { InvestmentsStackParamList, Investment, AssetType } from '@/types';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

const { width: screenWidth } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<InvestmentsStackParamList, 'InvestmentDetails'>;
type RouteType = RouteProp<InvestmentsStackParamList, 'InvestmentDetails'>;
type Period = '1J' | '1S' | '1M' | '3M' | '1A';

const PERIODS: Period[] = ['1J', '1S', '1M', '3M', '1A'];

// Fallback mock investments keyed by id
const MOCK_INVESTMENTS: Record<string, Investment> = {
  '1': {
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
    sector: 'Luxe & Biens de consommation',
    isin: 'FR0000121014',
    allocation: 15.8,
  },
  '2': {
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
    sector: 'Secteur Financier',
    isin: 'FR0000131104',
    allocation: 4.7,
  },
  '3': {
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
  '4': {
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
    sector: 'Aéronautique & Défense',
    isin: 'NL0000235190',
    allocation: 6.2,
  },
  '5': {
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
    sector: 'Obligations Souveraines',
    isin: 'FR0013380607',
    allocation: 5.9,
  },
};

const MOCK_INFO: Record<string, { market: string; dividend: string }> = {
  '1': { market: 'Euronext Paris', dividend: '3,2 %' },
  '2': { market: 'Euronext Paris', dividend: '6,1 %' },
  '3': { market: 'Euronext Paris', dividend: '0,0 %' },
  '4': { market: 'Euronext Paris', dividend: '1,8 %' },
  '5': { market: 'Euronext Paris', dividend: '3,5 %' },
};

const CHART_CONFIG: Record<Period, { labels: string[]; data: number[] }> = {
  '1J': {
    labels: ['09h', '11h', '13h', '15h', '17h', '18h'],
    data: [775, 778, 774, 781, 779, 780.5],
  },
  '1S': {
    labels: ['L', 'M', 'J', 'V', 'S', 'D'],
    data: [760, 768, 772, 775, 778, 780.5],
  },
  '1M': {
    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'Auj'],
    data: [735, 748, 742, 762, 772, 780.5],
  },
  '3M': {
    labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'],
    data: [690, 710, 698, 730, 762, 780.5],
  },
  '1A': {
    labels: ['Avr', 'Juin', 'Août', 'Oct', 'Déc', 'Mar'],
    data: [580, 610, 640, 690, 735, 780.5],
  },
};

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: 'Action',
  etf: 'ETF',
  bond: 'Obligation',
  fund: 'Fonds',
  savings_plan: "Plan d'épargne",
  crypto: 'Crypto',
};

const ASSET_TYPE_VARIANT: Record<AssetType, 'info' | 'success' | 'default' | 'warning' | 'error'> = {
  stock: 'info',
  etf: 'success',
  bond: 'default',
  fund: 'warning',
  savings_plan: 'success',
  crypto: 'error',
};

interface StatRowProps {
  label: string;
  value: string;
  valueColor?: string;
  styles: ReturnType<typeof makeStyles>;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, valueColor, styles }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>
      {value}
    </Text>
  </View>
);

interface InfoRowProps {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, styles }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.header,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 12,
    },
    backBtn: {
      padding: 4,
    },
    headerInfo: {
      flex: 1,
    },
    headerSymbol: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    headerName: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)',
      marginTop: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    // Price display
    priceSection: {
      padding: 20,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    currentPrice: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    changeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    changeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // Chart
    chartSection: {
      backgroundColor: colors.surface,
      marginBottom: 8,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 3,
      marginBottom: 8,
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
    // Stats card
    statsCard: {
      backgroundColor: colors.surface,
      marginBottom: 8,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    statLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    statValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    // Action buttons
    actionButtons: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    actionBtnFlex: {
      flex: 1,
    },
    // Additional info
    infoCard: {
      backgroundColor: colors.surface,
      padding: 16,
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    infoLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export const InvestmentDetailsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { investmentId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [activePeriod, setActivePeriod] = useState<Period>('1M');

  const investmentFromStore = useAppSelector((state) =>
    state.investments.investments.find((i) => i.id === investmentId),
  );

  const investment = investmentFromStore ?? MOCK_INVESTMENTS[investmentId];
  const extraInfo = MOCK_INFO[investmentId] ?? { market: 'Euronext Paris', dividend: '—' };
  const chartData = CHART_CONFIG[activePeriod];

  useEffect(() => {
    dispatch(setSelectedInvestment(investmentId));
    dispatch(fetchInvestmentDetails(investmentId));
    if (investment) {
      dispatch(fetchPriceHistory({ symbol: investment.symbol, period: '1M' }));
    }
    return () => {
      dispatch(setSelectedInvestment(null));
    };
  }, [dispatch, investmentId, investment?.symbol]);

  const handlePeriodChange = useCallback(
    (period: Period) => {
      setActivePeriod(period);
      if (investment) {
        const apiPeriod =
          period === '1J' ? '1D' : period === '1S' ? '1W' : period === '1M' ? '1M' : period === '3M' ? '3M' : '1Y';
        dispatch(fetchPriceHistory({ symbol: investment.symbol, period: apiPeriod }));
      }
    },
    [dispatch, investment],
  );

  const handleBuy = useCallback(() => {
    navigation.navigate('BuySell', { investmentId, action: 'buy' });
  }, [navigation, investmentId]);

  const handleSell = useCallback(() => {
    navigation.navigate('BuySell', { investmentId, action: 'sell' });
  }, [navigation, investmentId]);

  if (!investment) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerSymbol}>—</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Chargement…" />
        </View>
      </View>
    );
  }

  const isPositive = investment.gainLoss >= 0;
  const gainColor = isPositive ? '#4CAF50' : '#F44336';
  const dayChange = investment.currentPrice - investment.purchasePrice;
  const dayChangePercent = (dayChange / investment.purchasePrice) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerSymbol}>{investment.symbol}</Text>
            <Badge
              label={ASSET_TYPE_LABELS[investment.type]}
              variant={ASSET_TYPE_VARIANT[investment.type]}
              size="small"
            />
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {investment.name}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current price */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>{formatCurrency(investment.currentPrice)}</Text>
          <View style={styles.changeRow}>
            <View style={[styles.changeChip, { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' }]}>
              <Ionicons
                name={isPositive ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={gainColor}
              />
              <Text style={[styles.changeText, { color: gainColor }]}>
                {isPositive ? '+' : ''}
                {formatCurrency(dayChange)}
              </Text>
            </View>
            <Text style={[styles.changeText, { color: gainColor }]}>
              {isPositive ? '+' : ''}
              {dayChangePercent.toFixed(2)} %
            </Text>
          </View>
        </View>

        {/* Price chart */}
        <View style={styles.chartSection}>
          <View style={styles.periodSelector}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, activePeriod === p && styles.periodTabActive]}
                onPress={() => handlePeriodChange(p)}
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
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              backgroundColor: '#003366',
              backgroundGradientFrom: '#003366',
              backgroundGradientTo: '#00A8E8',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffffff' },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        {/* Key stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Mes Positions</Text>

          <StatRow
            label="Quantité détenue"
            value={`${investment.quantity} titres`}
            styles={styles}
          />
          <StatRow
            label="Prix moyen d'achat"
            value={formatCurrency(investment.purchasePrice)}
            styles={styles}
          />
          <StatRow
            label="Valeur actuelle"
            value={formatCurrency(investment.currentValue)}
            styles={styles}
          />
          <StatRow
            label="Plus/moins-value"
            value={`${isPositive ? '+' : ''}${formatCurrency(investment.gainLoss)}`}
            valueColor={gainColor}
            styles={styles}
          />
          <StatRow
            label="Performance totale"
            value={`${isPositive ? '+' : ''}${formatPercentage(investment.gainLossPercent)}`}
            valueColor={gainColor}
            styles={styles}
          />
          <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statLabel}>Variation du jour</Text>
            <Text style={[styles.statValue, { color: gainColor }]}>
              {isPositive ? '+' : ''}
              {formatCurrency(dayChange)} ({dayChangePercent.toFixed(2)} %)
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.actionBtnFlex}>
            <Button label="Acheter" variant="primary" fullWidth onPress={handleBuy} />
          </View>
          <View style={styles.actionBtnFlex}>
            <Button label="Vendre" variant="outline" fullWidth onPress={handleSell} />
          </View>
        </View>

        {/* Additional info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations</Text>
          {investment.isin && (
            <InfoRow label="ISIN" value={investment.isin} styles={styles} />
          )}
          <InfoRow label="Marché" value={extraInfo.market} styles={styles} />
          {investment.sector && (
            <InfoRow label="Secteur" value={investment.sector} styles={styles} />
          )}
          <InfoRow label="Dividende" value={extraInfo.dividend} styles={styles} />
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Allocation portefeuille</Text>
            <Text style={styles.infoValue}>
              {investment.allocation?.toFixed(1) ?? '—'} %
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InvestmentDetailsScreen;
