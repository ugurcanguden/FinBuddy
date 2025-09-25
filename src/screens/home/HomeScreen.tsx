// Home Screen - Ana sayfa (dashboard)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, ScrollView as RNScrollView, RefreshControl, Animated } from 'react-native';
import { useLocale } from '@/hooks';
import { Layout, PageHeader, View, Text, Card, TouchableOpacity, Dropdown, StatCard, WalletCard, BarChart } from '@/components';
import { useTheme, useCurrency } from '@/contexts';
import { paymentService } from '@/services';

const BAR_WIDTH = 44;
const BAR_SPACING = 16;

const HomeScreen: React.FC = () => {
  const { t } = useLocale();

  const { colors } = useTheme();
  const { currency } = useCurrency();
  const [summary, setSummary] = useState<{ expense: { total: number; paid: number; pending: number }; income: { total: number; paid: number; pending: number } } | null>(null);
  const [incomeSeries, setIncomeSeries] = useState<Array<{ ym: string; total: number }>>([]);
  const [expenseSeries, setExpenseSeries] = useState<Array<{ ym: string; total: number; paid: number }>>([]);
  const [upcomings, setUpcomings] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number }>>([]);
  const [overdueExpenses, setOverdueExpenses] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number }>>([]);
  const [overdueIncomes, setOverdueIncomes] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number }>>([]);
  const [listTab, setListTab] = useState<'upcoming' | 'overdue_expense' | 'overdue_income'>('upcoming');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
  const [cashFlow, setCashFlow] = useState<{ incomePaid: number; expensePaid: number }>({ incomePaid: 0, expensePaid: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const walletAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  const loadDashboard = useCallback(async (year: string, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [sum, inc, expenseBreakdown, upc, overdueExp, overdueInc, flow] = await Promise.all([
        paymentService.getDashboardSummary(),
        paymentService.getMonthlySeries('income', { year, limit: 12 }),
        paymentService.getMonthlyExpenseBreakdown({ year, limit: 12 }),
        paymentService.getUpcomingPayments(5, 30),
        paymentService.getOverduePayments('expense', 10),
        paymentService.getOverduePayments('income', 10),
        paymentService.getYearlyCashFlow(year),
      ]);
      setSummary(sum);
      setIncomeSeries(inc);
      setExpenseSeries(expenseBreakdown);
      setUpcomings(upc);
      setOverdueExpenses(overdueExp);
      setOverdueIncomes(overdueInc);
      setCashFlow(flow);
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const years = await paymentService.getAvailableYears();
      const fallbackYear = new Date().getFullYear();
      const numeric = years
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year));
      const minYear = numeric.length ? Math.min(...numeric) : fallbackYear;
      const maxYear = numeric.length ? Math.max(...numeric) : fallbackYear;
      const fullRange: string[] = [];
      for (let y = maxYear; y >= minYear; y -= 1) {
        fullRange.push(String(y));
      }
      const list = fullRange.length ? fullRange : [String(fallbackYear)];
      setAvailableYears(list);
      setSelectedYear((prev) => (list.includes(prev) ? prev : list[0]!));
    })();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    loadDashboard(selectedYear);
  }, [loadDashboard, selectedYear]);

  // Chart yüksekliği
  const chartHeight = 160;

  const latestIncome = incomeSeries.length ? incomeSeries[incomeSeries.length - 1]!.total : 0;
  // const previousIncome = incomeSeries.length > 1 ? incomeSeries[incomeSeries.length - 2]!.total : null; // BarChart içinde hesaplanıyor
  const latestExpense = expenseSeries.length ? expenseSeries[expenseSeries.length - 1]!.total : 0;
  // const previousExpense = expenseSeries.length > 1 ? expenseSeries[expenseSeries.length - 2]!.total : null; // BarChart içinde hesaplanıyor

  // const expenseYearTotal = useMemo(
  //   () => expenseSeries.reduce((sum, item) => sum + (item.total || 0), 0),
  //   [expenseSeries]
  // ); // BarChart içinde hesaplanıyor
  const expenseYearPaid = useMemo(
    () => expenseSeries.reduce((sum, item) => sum + (item.paid || 0), 0),
    [expenseSeries]
  );
  // const expenseYearOutstanding = Math.max(expenseYearTotal - expenseYearPaid, 0); // BarChart içinde hesaplanıyor
  const netCash = useMemo(
    () => cashFlow.incomePaid - cashFlow.expensePaid,
    [cashFlow]
  );
  const totalMagnitude = useMemo(
    () => Math.max(Math.abs(cashFlow.incomePaid) + Math.abs(cashFlow.expensePaid), 1),
    [cashFlow]
  );
  const netRatio = useMemo(() => Math.min(Math.abs(netCash) / totalMagnitude, 1), [netCash, totalMagnitude]);
  // const isNetPositive = netCash >= 0; // WalletCard içinde hesaplanıyor

  useEffect(() => {
    Animated.timing(walletAnim, {
      toValue: netRatio,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [walletAnim, netRatio]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(coinAnim, { toValue: -12, duration: 250, useNativeDriver: true }),
      Animated.spring(coinAnim, { toValue: 0, damping: 6, useNativeDriver: true }),
    ]).start();
  }, [coinAnim, netCash]);

  const formatCurrency = useCallback((value: number, fractionDigits = 0) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits,
      }).format(value);
    } catch {
      return `${value.toFixed(fractionDigits)} ${currency}`;
    }
  }, [currency]);

  // const formatCurrencyShort = useCallback((value: number) => {
  //   try {
  //     return new Intl.NumberFormat(undefined, {
  //       style: 'currency',
  //       currency,
  //       maximumFractionDigits: 1,
  //       notation: 'compact',
  //       compactDisplay: 'short',
  //     }).format(value);
  //   } catch {
  //     return formatCurrency(value, 0);
  //   }
  // }, [currency, formatCurrency]); // BarChart içinde hesaplanıyor

  // const calculateChange = useCallback((current: number, previous: number | null) => {
  //   if (previous === null || previous === 0) return null;
  //   const diff = ((current - previous) / Math.abs(previous)) * 100;
  //   return Number.isFinite(diff) ? diff : null;
  // }, []); // BarChart içinde hesaplanıyor

  const calculateOverdueDays = useCallback((dueDate: string) => {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  const calculateDaysUntil = useCallback((dueDate: string) => {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  // const incomeChange = calculateChange(latestIncome, previousIncome); // BarChart içinde hesaplanıyor
  // const expenseChange = calculateChange(latestExpense, previousExpense); // BarChart içinde hesaplanıyor

  // const incomeChangeVariant = incomeChange === null ? 'secondary' : incomeChange >= 0 ? 'success' : 'error'; // BarChart içinde hesaplanıyor
  // const expenseChangeVariant = expenseChange === null ? 'secondary' : expenseChange > 0 ? 'error' : 'success'; // BarChart içinde hesaplanıyor

  // BarChart verilerini hazırla - formatMonthLabel fonksiyonundan sonra taşınacak

  const formatMonthLabel = useCallback((ym: string) => {
    if (!ym || ym.length < 7) return ym;
    const [year, month] = ym.split('-');
    const yearNum = Number(year);
    const monthNum = Number(month) - 1;
    if (Number.isNaN(yearNum) || Number.isNaN(monthNum)) return ym;
    const date = new Date(yearNum, monthNum, 1);
    if (Number.isNaN(date.getTime())) return ym;
    try {
      return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date);
    } catch {
      return `${month}.${year}`;
    }
  }, []);

  // BarChart verilerini hazırla
  const incomeChartData = useMemo(() => {
    // Eğer veri yoksa test verisi ekle
    if (incomeSeries.length === 0) {
      return [
        { label: 'Oca', value: 15000, color: colors.primary },
        { label: 'Şub', value: 18000, color: colors.primary },
        { label: 'Mar', value: 12000, color: colors.primary },
        { label: 'Nis', value: 22000, color: colors.primary },
        { label: 'May', value: 19000, color: colors.primary },
        { label: 'Haz', value: 25000, color: colors.primary },
      ];
    }
    
    return incomeSeries.map(s => ({
      label: formatMonthLabel(s.ym),
      value: s.total,
      color: colors.primary,
    }));
  }, [incomeSeries, colors.primary, formatMonthLabel]);

  const expenseChartData = useMemo(() => {
    // Eğer veri yoksa test verisi ekle
    if (expenseSeries.length === 0) {
      return [
        { label: 'Oca', value: 12000, secondaryValue: 8000, color: colors.danger, secondaryColor: colors.success },
        { label: 'Şub', value: 15000, secondaryValue: 12000, color: colors.danger, secondaryColor: colors.success },
        { label: 'Mar', value: 18000, secondaryValue: 15000, color: colors.danger, secondaryColor: colors.success },
        { label: 'Nis', value: 14000, secondaryValue: 10000, color: colors.danger, secondaryColor: colors.success },
        { label: 'May', value: 16000, secondaryValue: 14000, color: colors.danger, secondaryColor: colors.success },
        { label: 'Haz', value: 20000, secondaryValue: 18000, color: colors.danger, secondaryColor: colors.success },
      ];
    }
    
    return expenseSeries.map(s => ({
      label: formatMonthLabel(s.ym),
      value: s.total,
      secondaryValue: s.paid,
      color: colors.danger,
      secondaryColor: colors.success,
    }));
  }, [expenseSeries, colors.danger, colors.success, formatMonthLabel]);

  const listTabs = useMemo(
    () => [
      { key: 'upcoming' as const, label: t('screens.home.upcoming_tab') || 'Yaklaşan Ödemeler' },
      { key: 'overdue_expense' as const, label: t('screens.home.overdue_expenses') || 'Ödemesi Geçenler' },
      { key: 'overdue_income' as const, label: t('screens.home.overdue_incomes') || 'Tahsilatı Gecikenler' },
    ],
    [t]
  );

  const listItems = useMemo(() => {
    switch (listTab) {
      case 'upcoming':
        return upcomings;
      case 'overdue_expense':
        return overdueExpenses;
      case 'overdue_income':
        return overdueIncomes;
      default:
        return [] as typeof upcomings;
    }
  }, [listTab, overdueExpenses, overdueIncomes, upcomings]);

  const statItems = useMemo(() => {
    if (!summary) return [];
    
    // Trend hesaplamaları (basit örnek - gerçek uygulamada daha karmaşık olabilir)
    const expenseTrend = summary.expense.paid > 0 ? 'up' : 'neutral';
    const incomeTrend = summary.income.total > 0 ? 'up' : 'neutral';
    const pendingTrend = summary.expense.pending > 0 ? 'down' : 'neutral';
    
    return [
      { 
        title: t('screens.reports.expense_total') || 'Gider Toplam', 
        value: formatCurrency(summary.expense.total),
        icon: '💸',
        variant: 'danger' as const,
        trend: expenseTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.expense.total > 0 ? 'Aktif' : 'Yok',
        subtitle: 'Bu ay toplam gider'
      },
      { 
        title: t('screens.reports.expense_paid') || 'Ödenen', 
        value: formatCurrency(summary.expense.paid),
        icon: '✅',
        variant: 'success' as const,
        trend: 'up',
        trendValue: summary.expense.paid > 0 ? 'Ödendi' : 'Bekliyor',
        subtitle: 'Tamamlanan ödemeler'
      },
      { 
        title: t('screens.reports.expense_pending') || 'Bekleyen', 
        value: formatCurrency(summary.expense.pending),
        icon: '⏳',
        variant: 'warning' as const,
        trend: pendingTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.expense.pending > 0 ? 'Bekliyor' : 'Yok',
        subtitle: 'Ödenmemiş tutarlar'
      },
      { 
        title: t('screens.reports.income_total') || 'Gelir Toplam', 
        value: formatCurrency(summary.income.total),
        icon: '💰',
        variant: 'primary' as const,
        trend: incomeTrend as 'up' | 'down' | 'neutral',
        trendValue: summary.income.total > 0 ? 'Geldi' : 'Bekliyor',
        subtitle: 'Bu ay toplam gelir'
      },
    ];
  }, [formatCurrency, summary, t]);

  const listMeta = useMemo(() => {
    switch (listTab) {
      case 'upcoming':
        return {
          icon: '💳',
          color: colors.primary,
          emptyText: t('screens.home.no_upcoming_payments') || t('common.messages.no_data') || 'Kayıt bulunamadı.',
          fallbackTitle: t('screens.home.payment') || t('common.labels.payment') || 'Ödeme',
          secondaryLabel: t('screens.home.due_date_label') || 'Son Tarih',
        };
      case 'overdue_expense':
        return {
          icon: '⚠️',
          color: colors.danger,
          emptyText: t('screens.home.no_overdue_expenses') || 'Geciken ödeme bulunmuyor.',
          fallbackTitle: t('screens.home.expense') || 'Gider',
          secondaryLabel: t('screens.home.overdue_date_label') || 'Son Tarih',
        };
      case 'overdue_income':
        return {
          icon: '💰',
          color: colors.primary,
          emptyText: t('screens.home.no_overdue_incomes') || 'Geciken tahsilat bulunmuyor.',
          fallbackTitle: t('screens.home.income') || 'Gelir',
          secondaryLabel: t('screens.home.overdue_date_label') || 'Son Tarih',
        };
      default:
        return {
          icon: '💳',
          color: colors.primary,
          emptyText: t('common.messages.no_data') || 'Veri yok',
          fallbackTitle: t('screens.home.payment') || t('common.labels.payment') || 'Ödeme',
          secondaryLabel: t('screens.home.due_date_label') || 'Son Tarih',
        };
    }
  }, [colors.danger, colors.primary, listTab, t]);

  return (
    <Layout
      headerComponent={<PageHeader title={t('screens.home.title') || 'Finansal Özet'} />}
    >
      <RNScrollView
        style={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(selectedYear, true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )}
      >
        <WalletCard
          title={t('screens.home.wallet_title') || 'Cüzdan'}
          balance={netCash}
          income={cashFlow.incomePaid}
          expense={cashFlow.expensePaid}
          currency={currency}
          animated={true}
          loading={refreshing}
          style={{ marginBottom: 16 }}
        />

        {/* Modern Stat Cards */}
        <View style={styles.grid}>
          {statItems.map((item, idx) => (
            <StatCard
              key={idx}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              trend={item.trend as 'up' | 'neutral' | 'down'}
              trendValue={item.trendValue}
              variant={item.variant}
              animated={true} 
              style={styles.statCard}
            />
          ))}
        </View>

        {/* Gelir ve Giderler */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            Gelir ve Giderler
          </Text>
          <View variant="transparent" style={styles.yearRow}>
            <Text variant="secondary" size="small" weight="medium">
              {t('screens.home.year_filter_label') || 'Yıl'}
            </Text>
            <Dropdown
              options={availableYears.map((year) => ({ value: year, label: year, nativeName: '', flag: '' }))}
              selectedValue={selectedYear}
              onSelect={(value) => setSelectedYear(value)}
              style={{ flex: 0, minWidth: 140 }}
              disabled={availableYears.length === 0}
            />
          </View>

          <BarChart
            title="Gelir"
            subtitle={`Son ay: ${formatCurrency(latestIncome)}`}
            data={incomeChartData}
            height={chartHeight}
            barWidth={BAR_WIDTH}
            barSpacing={BAR_SPACING}
            animated={true}
            showValues={true}
            showLabels={true}
            variant="gradient"
            style={styles.chartCard}
          />

          <BarChart
            title="Giderler"
            subtitle={`Son ay: ${formatCurrency(latestExpense)} | Ödenen: ${formatCurrency(expenseYearPaid)}`}
            data={expenseChartData}
            height={chartHeight}
            barWidth={BAR_WIDTH}
            barSpacing={BAR_SPACING}
            animated={true}
            showValues={true}
            showLabels={true}
            variant="stacked"
            style={styles.chartCard}
          />
        </View>

        {/* Ödeme Durumu */}
        <View style={styles.section}>
          <Text variant="primary" size="large" weight="bold" style={styles.sectionTitle}>
            {t('screens.home.activity_section_title') || 'Ödeme Durumu'}
          </Text>
          <View style={[styles.tabBar, { borderColor: colors.border }] as any}>
            {listTabs.map((tab) => {
              const active = listTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  variant="transparent"
                  onPress={() => setListTab(tab.key)}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: active ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    },
                  ] as any}
                >
                  <Text style={{ color: active ? colors.onPrimary : colors.text ,textAlign:'center'}}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ gap: 12 }}>
            {listItems.length === 0 ? (
              <Card padding="medium">
                <Text variant="secondary">{listMeta.emptyText}</Text>
              </Card>
            ) : (
              listItems.map((item) => {
                const overdueDays = calculateOverdueDays(item.due_date);
                const remainingDays = calculateDaysUntil(item.due_date);
                const extraInfo = listTab === 'upcoming'
                  ? (typeof remainingDays === 'number' && remainingDays > 0
                      ? `${t('screens.home.remaining_days') || 'Kalan'}: ${remainingDays} ${t('common.time.days') || 'gün'}`
                      : null)
                  : (typeof overdueDays === 'number' && overdueDays > 0
                      ? `${t('screens.home.overdue_days') || 'Gecikme'}: ${overdueDays} ${t('common.time.days') || 'gün'}`
                      : null);
                return (
                  <Card key={item.id} padding="medium">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${listMeta.color}20` as any,
                        }}
                      >
                        <Text style={{ color: listMeta.color }}>{listMeta.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="primary" weight="medium">{item.title || listMeta.fallbackTitle}</Text>
                        <Text variant="secondary" size="small">{`${listMeta.secondaryLabel}: ${item.due_date}`}</Text>
                        {extraInfo && (
                          <Text variant="secondary" size="small">{extraInfo}</Text>
                        )}
                      </View>
                      <Text variant="primary" weight="semibold">{formatCurrency(item.amount)}</Text>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>
      </RNScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statCard: { width: '47%' },
  section: { marginTop: 24, gap: 16 },
  sectionTitle: { marginBottom: 4 },
  chartCard: { gap: 12 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  tabBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 999, padding: 4, gap: 4 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  walletCard: { gap: 12 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletRow: { flexDirection: 'row', alignItems: 'center' },
  walletInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletBar: { height: 12, borderRadius: 8, backgroundColor: '#E5E7EB', overflow: 'hidden' },
});

export default HomeScreen;
