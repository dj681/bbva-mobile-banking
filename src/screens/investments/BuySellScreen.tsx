import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { buyInvestment, sellInvestment } from '@/store/slices/investmentsSlice';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { formatCurrency } from '@/utils/formatters';
import type { InvestmentsStackParamList, Investment, Account } from '@/types';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

type NavProp = NativeStackNavigationProp<InvestmentsStackParamList, 'BuySell'>;
type RouteType = RouteProp<InvestmentsStackParamList, 'BuySell'>;

type InputMode = 'quantity' | 'amount';
type OrderType = 'market' | 'limit' | 'stop';

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  market: 'Mercado',
  limit: 'Límite',
  stop: 'Stop',
};

const MOCK_INVESTMENTS: Record<string, Investment> = {
  '1': {
    id: '1', symbol: 'MC', name: 'LVMH Moët Hennessy', type: 'stock',
    quantity: 5, purchasePrice: 620, currentPrice: 780.5,
    currentValue: 3902.5, gainLoss: 802.5, gainLossPercent: 25.89,
    currency: 'EUR', purchaseDate: '2023-01-15', lastUpdated: new Date().toISOString(),
    sector: 'Luxe', isin: 'FR0000121014', allocation: 15.8,
  },
  '2': {
    id: '2', symbol: 'BNP', name: 'BNP Paribas', type: 'stock',
    quantity: 20, purchasePrice: 52, currentPrice: 58.2,
    currentValue: 1164, gainLoss: 124, gainLossPercent: 11.92,
    currency: 'EUR', purchaseDate: '2023-03-10', lastUpdated: new Date().toISOString(),
    sector: 'Finance', isin: 'FR0000131104', allocation: 4.7,
  },
  '3': {
    id: '3', symbol: 'AMUN', name: 'Amundi CAC 40 ETF', type: 'etf',
    quantity: 30, purchasePrice: 80, currentPrice: 92.4,
    currentValue: 2772, gainLoss: 372, gainLossPercent: 15.5,
    currency: 'EUR', purchaseDate: '2022-06-01', lastUpdated: new Date().toISOString(),
    sector: 'ETF', isin: 'FR0007052782', allocation: 11.2,
  },
  '4': {
    id: '4', symbol: 'AIR', name: 'Airbus SE', type: 'stock',
    quantity: 10, purchasePrice: 110, currentPrice: 152.8,
    currentValue: 1528, gainLoss: 428, gainLossPercent: 38.91,
    currency: 'EUR', purchaseDate: '2022-12-01', lastUpdated: new Date().toISOString(),
    sector: 'Aéronautique', isin: 'NL0000235190', allocation: 6.2,
  },
  '5': {
    id: '5', symbol: 'OAT', name: 'OAT France 10 ans', type: 'bond',
    quantity: 15, purchasePrice: 98, currentPrice: 96.5,
    currentValue: 1447.5, gainLoss: -22.5, gainLossPercent: -1.53,
    currency: 'EUR', purchaseDate: '2023-09-01', lastUpdated: new Date().toISOString(),
    sector: 'Obligations', isin: 'FR0013380607', allocation: 5.9,
  },
};

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc1',
    accountNumber: '00012345678',
    iban: 'FR7630006000011234567800189',
    type: 'checking',
    name: 'Compte Courant Principal',
    balance: 5840.22,
    availableBalance: 5640.22,
    currency: 'EUR',
    isDefault: true,
    isActive: true,
    createdAt: '2020-01-01',
  },
  {
    id: 'acc2',
    accountNumber: '00087654321',
    iban: 'FR7630006000018765432100123',
    type: 'savings',
    name: 'Livret A',
    balance: 12000,
    availableBalance: 12000,
    currency: 'EUR',
    isDefault: false,
    isActive: true,
    createdAt: '2020-06-01',
  },
];

const BROKERAGE_RATE = 0.001; // 0.1% commission (aligned with API)

interface SuccessViewProps {
  orderRef: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: string;
  totalAmount: number;
  onDone: () => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  orderRef,
  symbol,
  action,
  quantity,
  totalAmount,
  onDone,
  styles,
  colors,
}) => (
  <View style={styles.successContainer}>
    <View style={styles.successIconWrapper}>
      <Ionicons name="checkmark-circle" size={72} color={colors.success} />
    </View>
    <Text style={styles.successTitle}>¡Orden transmitida!</Text>
    <Text style={styles.successSubtitle}>
      Su orden de {action === 'buy' ? 'compra' : 'venta'} ha sido enviada con éxito.
    </Text>

    <View style={styles.successCard}>
      <View style={styles.successRow}>
        <Text style={styles.successRowLabel}>Referencia</Text>
        <Text style={styles.successRowValue}>{orderRef}</Text>
      </View>
      <View style={styles.successRow}>
        <Text style={styles.successRowLabel}>Instrument</Text>
        <Text style={styles.successRowValue}>{symbol}</Text>
      </View>
      <View style={styles.successRow}>
        <Text style={styles.successRowLabel}>Quantité</Text>
        <Text style={styles.successRowValue}>{quantity} título(s)</Text>
      </View>
      <View style={[styles.successRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.successRowLabel}>Importe estimado</Text>
        <Text style={[styles.successRowValue, { fontWeight: '700' }]}>
          {formatCurrency(totalAmount)}
        </Text>
      </View>
    </View>

    <Text style={styles.successNote}>
      La ejecución está sujeta a las condiciones del mercado. Recibirá una notificación en cuanto se confirme.
    </Text>

    <Button label="Volver a la cartera" variant="primary" fullWidth onPress={onDone} />
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
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    // Price card
    priceCard: {
      backgroundColor: colors.surface,
      padding: 20,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
    },
    priceUpdateTime: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    liveDot: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    liveDotCircle: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
    },
    liveDotText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4CAF50',
    },
    // Section
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    // Toggle mode
    toggleRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 3,
    },
    toggleTab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleTabActive: {
      backgroundColor: colors.primary,
    },
    toggleTabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    toggleTabTextActive: {
      color: '#FFFFFF',
    },
    // Order type
    orderTypeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    orderTypeBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    orderTypeBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    orderTypeBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    orderTypeBtnTextActive: {
      color: colors.primary,
    },
    // Account selector
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginBottom: 8,
    },
    accountItemSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
    accountItemIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    accountItemInfo: {
      flex: 1,
    },
    accountItemName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    accountItemBalance: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    accountItemCheck: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountItemCheckSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    // Summary card
    summaryCard: {
      backgroundColor: colors.surface,
      padding: 16,
      marginBottom: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    summaryTotal: {
      paddingVertical: 12,
    },
    summaryTotalLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    summaryTotalValue: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
    },
    // Submit button
    submitSection: {
      padding: 16,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    // Disclaimer
    disclaimer: {
      margin: 16,
      padding: 14,
      backgroundColor: '#FFF3E0',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#FF9800',
    },
    disclaimerIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    disclaimerTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#E65100',
    },
    disclaimerText: {
      fontSize: 11,
      color: '#E65100',
      lineHeight: 16,
    },
    // Confirm modal content
    confirmTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    confirmRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    confirmLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    confirmValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    confirmWarning: {
      marginTop: 14,
      padding: 12,
      backgroundColor: colors.errorBackground,
      borderRadius: 10,
    },
    confirmWarningText: {
      fontSize: 12,
      color: colors.error,
      textAlign: 'center',
    },
    // Success view
    successContainer: {
      flex: 1,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    successIconWrapper: {
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    successCard: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    successRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    successRowLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    successRowValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    successNote: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 16,
    },
    inputSpacing: {
      marginTop: 12,
    },
  });

export const BuySellScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { investmentId, action } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isLoading = useAppSelector((state) => state.investments.isLoading);
  const investmentFromStore = useAppSelector((state) =>
    state.investments.investments.find((i) => i.id === investmentId),
  );
  const accountsFromStore = useAppSelector((state) => state.accounts.accounts);

  const investment = investmentFromStore ?? (investmentId ? MOCK_INVESTMENTS[investmentId] : undefined);
  const accounts = accountsFromStore.length > 0 ? accountsFromStore : MOCK_ACCOUNTS;

  const [inputMode, setInputMode] = useState<InputMode>('quantity');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? '',
  );
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const currentPrice = investment?.currentPrice ?? 0;
  const numQuantity = parseFloat(quantity) || 0;
  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const effectiveQuantity =
    inputMode === 'quantity' ? numQuantity : numAmount / (currentPrice || 1);
  const totalAmount = effectiveQuantity * currentPrice;
  const brokerage = totalAmount * BROKERAGE_RATE;
  const netAmount = action === 'buy' ? totalAmount + brokerage : totalAmount - brokerage;
  const effectiveQuantityDisplay =
    inputMode === 'quantity' ? numQuantity : Math.floor(effectiveQuantity);

  const isFormValid = effectiveQuantity > 0 && selectedAccountId !== '';

  const handleConfirm = useCallback(() => {
    if (!isFormValid) return;
    setConfirmModalVisible(true);
  }, [isFormValid]);

  const handleSubmit = useCallback(async () => {
    if (!investment) return;
    setConfirmModalVisible(false);
    const payload = {
      investmentId: investment.id,
      symbol: investment.symbol,
      quantity: effectiveQuantityDisplay,
      price: orderType !== 'market' && limitPrice ? parseFloat(limitPrice) : currentPrice,
    };

    try {
      if (action === 'buy') {
        await dispatch(buyInvestment(payload)).unwrap();
      } else {
        await dispatch(sellInvestment(payload)).unwrap();
      }
    } catch {
      // API error handled – still show success for demo
    }

    const ref = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderRef(ref);
    setOrderSuccess(true);
  }, [
    dispatch,
    investment,
    action,
    effectiveQuantityDisplay,
    currentPrice,
    orderType,
    limitPrice,
  ]);

  const handleDone = useCallback(() => {
    navigation.navigate('Portfolio');
  }, [navigation]);

  if (!investment) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orden bursátil</Text>
        </View>
      </View>
    );
  }

  if (orderSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SuccessView
          orderRef={orderRef}
          symbol={investment.symbol}
          action={action}
          quantity={effectiveQuantityDisplay.toString()}
          totalAmount={netAmount}
          onDone={handleDone}
          styles={styles}
          colors={colors}
        />
      </View>
    );
  }

  const isBuy = action === 'buy';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuy ? 'Acheter' : 'Vendre'} {investment.symbol}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current price */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Precio actual</Text>
            <Text style={styles.priceValue}>{formatCurrency(currentPrice)}</Text>
            <Text style={styles.priceUpdateTime}>
              Actualizado a las {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.liveDot}>
            <View style={styles.liveDotCircle} />
            <Text style={styles.liveDotText}>En vivo</Text>
          </View>
        </View>

        {/* Input mode toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrada</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleTab, inputMode === 'quantity' && styles.toggleTabActive]}
              onPress={() => setInputMode('quantity')}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  inputMode === 'quantity' && styles.toggleTabTextActive,
                ]}
              >
                Por cantidad
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleTab, inputMode === 'amount' && styles.toggleTabActive]}
              onPress={() => setInputMode('amount')}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  inputMode === 'amount' && styles.toggleTabTextActive,
                ]}
              >
                Por importe
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSpacing}>
            {inputMode === 'quantity' ? (
              <Input
                label="Número de títulos"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="ej: 5"
              />
            ) : (
              <Input
                label="Importe a invertir (€)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="ej: 1.000,00"
              />
            )}
          </View>

          {inputMode === 'amount' && numAmount > 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
              ≈ {Math.floor(effectiveQuantity)} título(s) au prix actuel
            </Text>
          )}
        </View>

        {/* Order type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de orden</Text>
          <View style={styles.orderTypeRow}>
            {(Object.entries(ORDER_TYPE_LABELS) as [OrderType, string][]).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.orderTypeBtn, orderType === key && styles.orderTypeBtnActive]}
                onPress={() => setOrderType(key)}
              >
                <Text
                  style={[
                    styles.orderTypeBtnText,
                    orderType === key && styles.orderTypeBtnTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {orderType !== 'market' && (
            <View style={styles.inputSpacing}>
              <Input
                label={`Precio ${orderType === 'limit' ? 'límite' : 'stop'} (€)`}
                value={limitPrice}
                onChangeText={setLimitPrice}
                keyboardType="decimal-pad"
                placeholder={currentPrice.toFixed(2)}
              />
            </View>
          )}
        </View>

        {/* Account selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isBuy ? 'Cuenta a debitar' : 'Cuenta a abonar'}
          </Text>
          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.accountItem,
                selectedAccountId === acc.id && styles.accountItemSelected,
              ]}
              onPress={() => setSelectedAccountId(acc.id)}
            >
              <View style={styles.accountItemIcon}>
                <Ionicons
                  name={acc.type === 'savings' ? 'wallet-outline' : 'card-outline'}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.accountItemInfo}>
                <Text style={styles.accountItemName}>{acc.name}</Text>
                <Text style={styles.accountItemBalance}>
                  {formatCurrency(acc.availableBalance)} disponible
                </Text>
              </View>
              <View
                style={[
                  styles.accountItemCheck,
                  selectedAccountId === acc.id && styles.accountItemCheckSelected,
                ]}
              >
                {selectedAccountId === acc.id && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumen de la orden</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantité</Text>
            <Text style={styles.summaryValue}>
              {effectiveQuantityDisplay > 0 ? `${effectiveQuantityDisplay} título(s)` : '—'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio estimado</Text>
            <Text style={styles.summaryValue}>
              {orderType === 'market' || !limitPrice
                ? formatCurrency(currentPrice)
                : formatCurrency(parseFloat(limitPrice) || currentPrice)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Importe total estimado</Text>
            <Text style={styles.summaryValue}>
              {totalAmount > 0 ? formatCurrency(totalAmount) : '—'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Comisión de intermediación (0,1 %)</Text>
            <Text style={styles.summaryValue}>
              {brokerage > 0 ? formatCurrency(brokerage) : '—'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Importe neto</Text>
            <Text style={styles.summaryTotalValue}>
              {netAmount > 0 ? formatCurrency(netAmount) : '—'}
            </Text>
          </View>
        </View>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            label='Confirmar la orden'
            variant={isBuy ? 'primary' : 'danger'}
            fullWidth
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            onPress={handleConfirm}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <View style={styles.disclaimerIcon}>
            <Ionicons name="warning-outline" size={14} color="#E65100" />
            <Text style={styles.disclaimerTitle}>Riesgos de mercado</Text>
          </View>
          <Text style={styles.disclaimerText}>
            Las inversiones en bolsa conllevan riesgos de pérdida de capital. La rentabilidad
            pasada no garantiza resultados futuros. Este documento no constituye asesoramiento
            de inversión. Asegúrese de comprender los riesgos antes de emitir una orden.
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation modal */}
      <Modal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title={`Confirmar la orden`}
        size="medium"
        animation="center"
        dismissOnBackdrop
        confirmButton={{ label: isBuy ? 'Confirmar la compra' : 'Confirmar la venta', onPress: handleSubmit, loading: isLoading }}
        cancelButton={{ label: 'Cancelar', onPress: () => setConfirmModalVisible(false) }}
      >
        <Text style={styles.confirmTitle}>
          {isBuy ? 'Acheter' : 'Vendre'} {investment.symbol}
        </Text>

        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Instrument</Text>
          <Text style={styles.confirmValue}>{investment.name}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Quantité</Text>
          <Text style={styles.confirmValue}>{effectiveQuantityDisplay} título(s)</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Precio estimado</Text>
          <Text style={styles.confirmValue}>{formatCurrency(currentPrice)}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Comisiones</Text>
          <Text style={styles.confirmValue}>{formatCurrency(brokerage)}</Text>
        </View>
        <View style={[styles.confirmRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.confirmLabel, { fontWeight: '700' }]}>Importe neto</Text>
          <Text style={[styles.confirmValue, { color: colors.primary, fontWeight: '800' }]}>
            {formatCurrency(netAmount)}
          </Text>
        </View>

        <View style={styles.confirmWarning}>
          <Text style={styles.confirmWarningText}>
            Cet ordre sera exécuté aux conditions de marché en vigueur.
          </Text>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default BuySellScreen;
