import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  ListRenderItemInfo,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPortfolio } from '@/store/slices/investmentsSlice';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { InvestmentsStackParamList, SavingsPlan } from '@/types';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

type NavProp = NativeStackNavigationProp<InvestmentsStackParamList, 'SavingsPlans'>;

const MOCK_SAVINGS_PLANS: SavingsPlan[] = [
  {
    id: 'sp1',
    name: 'Retraite Sereine',
    targetAmount: 100000,
    currentAmount: 32500,
    monthlyContribution: 400,
    startDate: '2021-01-01',
    targetDate: '2040-01-01',
    interestRate: 3.5,
    currency: 'EUR',
    progress: 32.5,
  },
  {
    id: 'sp2',
    name: 'Résidence Secondaire',
    targetAmount: 60000,
    currentAmount: 18750,
    monthlyContribution: 350,
    startDate: '2022-06-01',
    targetDate: '2030-06-01',
    interestRate: 2.8,
    currency: 'EUR',
    progress: 31.25,
  },
  {
    id: 'sp3',
    name: "Tour du Monde",
    targetAmount: 15000,
    currentAmount: 9600,
    monthlyContribution: 200,
    startDate: '2023-01-01',
    targetDate: '2026-01-01',
    interestRate: 2.0,
    currency: 'EUR',
    progress: 64,
  },
];

interface CreatePlanForm {
  name: string;
  targetAmount: string;
  monthlyContribution: string;
  targetDate: string;
}

const EMPTY_FORM: CreatePlanForm = {
  name: '',
  targetAmount: '',
  monthlyContribution: '',
  targetDate: '',
};

/**
 * Calculates projected completion date given current amount, monthly
 * contribution, target amount, and annual interest rate (%).
 */
function calculateProjectedDate(
  currentAmount: number,
  monthlyContribution: number,
  targetAmount: number,
  annualRate: number,
): string {
  if (monthlyContribution <= 0 || targetAmount <= currentAmount) {
    return '—';
  }
  const monthlyRate = annualRate / 100 / 12;
  let balance = currentAmount;
  let months = 0;
  while (balance < targetAmount && months < 600) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    months++;
  }
  if (months >= 600) return '> 50 ans';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

const PLAN_INTEREST_RATE = 3.0; // default interest rate for new plans

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
      color: '#FFFFFF',
    },
    listContent: {
      paddingBottom: 32,
    },
    // Summary
    summaryCard: {
      margin: 16,
      padding: 20,
      backgroundColor: colors.primary,
      borderRadius: 16,
      flexDirection: 'row',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginVertical: 4,
    },
    summaryLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    // Plan card
    planCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    planIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: `${colors.secondary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    planHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    planName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    planSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // Progress bar
    progressWrapper: {
      marginBottom: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    progressPercent: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    progressAmounts: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      backgroundColor: colors.secondary,
      borderRadius: 4,
    },
    // Plan details grid
    planDetailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    planDetailItem: {
      width: '50%',
      paddingVertical: 6,
    },
    planDetailLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    planDetailValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    planDetailValueAccent: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondary,
    },
    // Create button
    createSection: {
      margin: 16,
      marginTop: 8,
    },
    // Modal styles
    modalSectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 16,
      marginBottom: 8,
    },
    projectionCard: {
      marginTop: 16,
      padding: 14,
      backgroundColor: `${colors.primary}10`,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    projectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    projectionValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
    },
    projectionSubtext: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    interestRateNote: {
      marginTop: 8,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    interestRateText: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    inputSpacing: {
      marginTop: 12,
    },
    emptyWrapper: {
      paddingVertical: 40,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
    },
  });

interface PlanCardProps {
  plan: SavingsPlan;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, styles, colors }) => {
  const projected = calculateProjectedDate(
    plan.currentAmount,
    plan.monthlyContribution,
    plan.targetAmount,
    plan.interestRate,
  );
  const progressClamped = Math.min(100, Math.max(0, plan.progress));
  const isAlmostDone = progressClamped >= 75;

  return (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={styles.planHeaderLeft}>
          <View style={styles.planIconWrapper}>
            <Ionicons name="trending-up-outline" size={22} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName} numberOfLines={1}>
              {plan.name}
            </Text>
            <Text style={styles.planSubtitle}>Taux : {plan.interestRate} %/an</Text>
          </View>
        </View>
        <Badge
          label={isAlmostDone ? 'Bientôt atteint' : 'En cours'}
          variant={isAlmostDone ? 'success' : 'info'}
          size="small"
        />
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressPercent}>{progressClamped.toFixed(1)} %</Text>
          <Text style={styles.progressAmounts}>
            {formatCurrency(plan.currentAmount)} / {formatCurrency(plan.targetAmount)}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressClamped}%` as `${number}%` },
            ]}
          />
        </View>
      </View>

      {/* Details grid */}
      <View style={styles.planDetailsGrid}>
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Contribution mensuelle</Text>
          <Text style={styles.planDetailValueAccent}>
            {formatCurrency(plan.monthlyContribution)}
          </Text>
        </View>
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Date cible</Text>
          <Text style={styles.planDetailValue}>{formatDate(plan.targetDate)}</Text>
        </View>
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Montant actuel</Text>
          <Text style={styles.planDetailValue}>{formatCurrency(plan.currentAmount)}</Text>
        </View>
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Complétion estimée</Text>
          <Text style={styles.planDetailValue}>{projected}</Text>
        </View>
      </View>
    </View>
  );
};

export const SavingsPlansScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const savingsPlansFromStore = useAppSelector((state) => state.investments.savingsPlans);
  const isLoading = useAppSelector((state) => state.investments.isLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form, setForm] = useState<CreatePlanForm>(EMPTY_FORM);
  const [localPlans, setLocalPlans] = useState<SavingsPlan[]>([]);

  const effectivePlans =
    savingsPlansFromStore.length > 0
      ? savingsPlansFromStore
      : localPlans.length > 0
      ? localPlans
      : MOCK_SAVINGS_PLANS;

  const totalMonthly = effectivePlans.reduce((sum, p) => sum + p.monthlyContribution, 0);
  const totalSaved = effectivePlans.reduce((sum, p) => sum + p.currentAmount, 0);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchPortfolio()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleOpenCreate = useCallback(() => {
    setForm(EMPTY_FORM);
    setCreateModalVisible(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  const handleCreatePlan = useCallback(() => {
    const target = parseFloat(form.targetAmount.replace(',', '.')) || 0;
    const contribution = parseFloat(form.monthlyContribution.replace(',', '.')) || 0;
    if (!form.name || target <= 0 || contribution <= 0) return;

    const newPlan: SavingsPlan = {
      id: `sp_${Date.now()}`,
      name: form.name.trim(),
      targetAmount: target,
      currentAmount: 0,
      monthlyContribution: contribution,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: form.targetDate || new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      interestRate: PLAN_INTEREST_RATE,
      currency: 'EUR',
      progress: 0,
    };

    setLocalPlans((prev) => [...prev, newPlan]);
    setForm(EMPTY_FORM);
    setCreateModalVisible(false);
  }, [form]);

  const projectedCompletion = useMemo(() => {
    const target = parseFloat(form.targetAmount.replace(',', '.')) || 0;
    const contribution = parseFloat(form.monthlyContribution.replace(',', '.')) || 0;
    if (target <= 0 || contribution <= 0) return null;
    return calculateProjectedDate(0, contribution, target, PLAN_INTEREST_RATE);
  }, [form.targetAmount, form.monthlyContribution]);

  const isFormValid =
    form.name.trim().length > 0 &&
    parseFloat(form.targetAmount) > 0 &&
    parseFloat(form.monthlyContribution) > 0;

  const renderPlanItem = useCallback(
    ({ item }: ListRenderItemInfo<SavingsPlan>) => (
      <PlanCard plan={item} styles={styles} colors={colors} />
    ),
    [styles, colors],
  );

  const ListHeader = useMemo(
    () => (
      <>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Épargne mensuelle totale</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalMonthly)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total épargné</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSaved)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mes plans ({effectivePlans.length})</Text>
      </>
    ),
    [styles, totalMonthly, totalSaved, effectivePlans.length],
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.createSection}>
        <Button
          label="Créer un plan"
          variant="primary"
          fullWidth
          leftIcon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
          onPress={handleOpenCreate}
        />
      </View>
    ),
    [styles, handleOpenCreate],
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyWrapper}>
        <EmptyState
          icon="trending-up-outline"
          title="Aucun plan d'épargne"
          message="Commencez à épargner pour réaliser vos projets en créant votre premier plan."
          actionButton={{
            label: 'Créer un plan',
            onPress: handleOpenCreate,
            variant: 'primary',
          }}
        />
      </View>
    ),
    [styles, handleOpenCreate],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans d'Épargne</Text>
        <TouchableOpacity onPress={handleOpenCreate}>
          <Ionicons name="add-outline" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={effectivePlans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Create Plan Modal */}
      <Modal
        visible={createModalVisible}
        onClose={handleCloseCreate}
        title="Nouveau plan d'épargne"
        size="large"
        animation="slide"
        dismissOnBackdrop
        confirmButton={{
          label: 'Créer le plan',
          onPress: handleCreatePlan,
          disabled: !isFormValid,
        }}
        cancelButton={{
          label: 'Annuler',
          onPress: handleCloseCreate,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Nom du plan"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="ex: Retraite, Maison, Voyage…"
            />

            <View style={styles.inputSpacing}>
              <Input
                label="Objectif (€)"
                value={form.targetAmount}
                onChangeText={(v) => setForm((f) => ({ ...f, targetAmount: v }))}
                keyboardType="decimal-pad"
                placeholder="ex: 50 000"
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Contribution mensuelle (€)"
                value={form.monthlyContribution}
                onChangeText={(v) => setForm((f) => ({ ...f, monthlyContribution: v }))}
                keyboardType="decimal-pad"
                placeholder="ex: 300"
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Date cible (JJ/MM/AAAA)"
                value={form.targetDate}
                onChangeText={(v) => setForm((f) => ({ ...f, targetDate: v }))}
                placeholder="ex: 01/01/2035"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Interest rate note */}
            <View style={styles.interestRateNote}>
              <Text style={styles.interestRateText}>
                Taux d'intérêt appliqué : {PLAN_INTEREST_RATE} % / an (capitalisation mensuelle)
              </Text>
            </View>

            {/* Projected completion */}
            {projectedCompletion && (
              <View style={styles.projectionCard}>
                <Text style={styles.projectionTitle}>Complétion estimée</Text>
                <Text style={styles.projectionValue}>{projectedCompletion}</Text>
                <Text style={styles.projectionSubtext}>
                  Basé sur {form.monthlyContribution} €/mois à {PLAN_INTEREST_RATE} %/an
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SavingsPlansScreen;
