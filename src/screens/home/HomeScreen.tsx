// Home Screen - Ana sayfa (dashboard)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View as RNView, ScrollView as RNScrollView, RefreshControl, Animated } from 'react-native';
import { useLocale } from '@/hooks';
import { Layout, PageHeader, View, Text, Card, TouchableOpacity, Dropdown } from '@/components';
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

  // Basit ölçekleme: bar yüksekliğini konteyner yüksekliğine oranla ayarla
  const chartHeight = 160;
  const barMax = chartHeight - 10;
  const incomeMax = useMemo(() => Math.max(0, ...incomeSeries.map(s => s.total)), [incomeSeries]);
  const expenseMax = useMemo(() => Math.max(0, ...expenseSeries.map(s => s.total)), [expenseSeries]);
  const scale = (v: number, max: number) => {
    if (!max || max <= 0) return 6; // min bar
    return Math.max(6, Math.round((v / max) * barMax));
  };

  const latestIncome = incomeSeries.length ? incomeSeries[incomeSeries.length - 1]!.total : 0;
  const previousIncome = incomeSeries.length > 1 ? incomeSeries[incomeSeries.length - 2]!.total : null;
  const latestExpense = expenseSeries.length ? expenseSeries[expenseSeries.length - 1]!.total : 0;
  const previousExpense = expenseSeries.length > 1 ? expenseSeries[expenseSeries.length - 2]!.total : null;

  const expenseYearTotal = useMemo(
    () => expenseSeries.reduce((sum, item) => sum + (item.total || 0), 0),
    [expenseSeries]
  );
  const expenseYearPaid = useMemo(
    () => expenseSeries.reduce((sum, item) => sum + (item.paid || 0), 0),
    [expenseSeries]
  );
  const expenseYearOutstanding = Math.max(expenseYearTotal - expenseYearPaid, 0);
  const netCash = useMemo(
    () => cashFlow.incomePaid - cashFlow.expensePaid,
    [cashFlow]
  );
  const totalMagnitude = useMemo(
    () => Math.max(Math.abs(cashFlow.incomePaid) + Math.abs(cashFlow.expensePaid), 1),
    [cashFlow]
  );
  const netRatio = useMemo(() => Math.min(Math.abs(netCash) / totalMagnitude, 1), [netCash, totalMagnitude]);
  const isNetPositive = netCash >= 0;

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

  const formatCurrencyShort = useCallback((value: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 1,
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch {
      return formatCurrency(value, 0);
    }
  }, [currency, formatCurrency]);

  const calculateChange = useCallback((current: number, previous: number | null) => {
    if (previous === null || previous === 0) return null;
    const diff = ((current - previous) / Math.abs(previous)) * 100;
    return Number.isFinite(diff) ? diff : null;
  }, []);

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

  const incomeChange = calculateChange(latestIncome, previousIncome);
  const expenseChange = calculateChange(latestExpense, previousExpense);

  const incomeChangeVariant = incomeChange === null ? 'secondary' : incomeChange >= 0 ? 'success' : 'error';
  const expenseChangeVariant = expenseChange === null ? 'secondary' : expenseChange > 0 ? 'error' : 'success';

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

  const incomeChartWidth = useMemo(
    () => Math.max(incomeSeries.length * (BAR_WIDTH + BAR_SPACING), 0),
    [incomeSeries.length]
  );

  const expenseChartWidth = useMemo(
    () => Math.max(expenseSeries.length * (BAR_WIDTH + BAR_SPACING), 0),
    [expenseSeries.length]
  );

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
    if (!summary) return [] as Array<{ label: string; value: string }>;
    return [
      { label: t('screens.reports.expense_total') || 'Gider Toplam', value: formatCurrency(summary.expense.total) },
      { label: t('screens.reports.expense_paid') || 'Ödenen', value: formatCurrency(summary.expense.paid) },
      { label: t('screens.reports.expense_pending') || 'Bekleyen', value: formatCurrency(summary.expense.pending) },
      { label: t('screens.reports.income_total') || 'Gelir Toplam', value: formatCurrency(summary.income.total) },
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
        <Card padding="medium" style={[styles.walletCard, { marginBottom: 16 }] as any}> 
          <View style={styles.walletHeader}>
            <Text variant="primary" size="medium" weight="bold">
              {t('screens.home.wallet_title') || 'Cüzdan'}
            </Text>
            <Text variant={isNetPositive ? 'success' : 'error'} size="medium" weight="bold">
              {formatCurrency(netCash)}
            </Text>
          </View>
          <View style={styles.walletRow}>
            <Animated.View
              style={{
                transform: [
                  { scale: walletAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
                ],
              }}
            >
              <Text style={{ fontSize: 42 }}>{isNetPositive ? '👜' : '💸'}</Text>
            </Animated.View>
            <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
              <View style={styles.walletInfoRow}>
                <Text variant="secondary" size="small">{t('screens.home.wallet_income') || 'Gelen'}</Text>
                <Text variant="primary" weight="semibold">{formatCurrency(cashFlow.incomePaid)}</Text>
              </View>
              <View style={styles.walletInfoRow}>
                <Text variant="secondary" size="small">{t('screens.home.wallet_expense') || 'Giden'}</Text>
                <Text variant="primary" weight="semibold">{formatCurrency(cashFlow.expensePaid)}</Text>
              </View>
              <View style={styles.walletBar}>
                <Animated.View
                  style={{
                    height: '100%',
                    width: walletAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: isNetPositive ? colors.success : colors.danger,
                    borderRadius: 8,
                  }}
                />
              </View>
            </View>
            <Animated.View
              style={{
                marginLeft: 12,
                transform: [{ translateY: coinAnim }],
              }}
            >
              <Text style={{ fontSize: 28 }}>{isNetPositive ? '🪙' : '💔'}</Text>
            </Animated.View>
          </View>
          <Text variant="secondary" size="small" style={{ marginTop: 8 }}>
            {(t('screens.home.wallet_caption') || 'Gelirlerden ödenenleri çıkarınca kalan tutar.')} 
          </Text>
        </Card>

        {/* Stat Cards */}
        <View style={styles.grid}>
          {statItems.map((item, idx) => (
            <Card key={idx} padding="medium" style={styles.statCard}>
              <Text variant="secondary" size="small" weight="medium">{item.label}</Text>
              <Text variant="primary" size="xlarge" weight="bold">{item.value}</Text>
            </Card>
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

          <Card padding="medium" style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text variant="secondary" size="medium" weight="medium">Gelir</Text>
                <Text variant="primary" size="xlarge" weight="bold">{formatCurrency(latestIncome)}</Text>
              </View>
              <Text variant={incomeChangeVariant} size="small" weight="medium">
                {incomeChange === null ? '—' : `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`}
              </Text>
            </View>
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{ paddingHorizontal: BAR_SPACING / 2 }}
            >
              <RNView>
                <RNView style={[styles.barsRow, { height: chartHeight, width: incomeChartWidth }]}> 
                  {incomeSeries.map((s) => (
                    <RNView
                      key={s.ym}
                      style={{
                        width: BAR_WIDTH,
                        marginHorizontal: BAR_SPACING / 2,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <RNView
                        style={{
                          height: scale(s.total, incomeMax),
                          backgroundColor: colors.primary,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      />
                    </RNView>
                  ))}
                </RNView>
                <RNView style={[styles.labelsRow, { width: incomeChartWidth, justifyContent: 'flex-start' }]}> 
                  {incomeSeries.map((s) => (
                    <RNView
                      key={`label-${s.ym}`}
                      style={{
                        width: BAR_WIDTH,
                        marginHorizontal: BAR_SPACING / 2,
                        alignItems: 'center',
                      }}
                    >
                      <Text variant="secondary" size="small" weight="bold">
                        {formatMonthLabel(s.ym)}
                      </Text>
                      <Text
                        variant="secondary"
                        size="small"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {formatCurrencyShort(s.total)}
                      </Text>
                    </RNView>
                  ))}
                </RNView>
              </RNView>
            </RNScrollView>
          </Card>

          <Card padding="medium" style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text variant="secondary" size="medium" weight="medium">Giderler</Text>
                <Text variant="primary" size="xlarge" weight="bold">{formatCurrency(latestExpense)}</Text>
                <Text variant="secondary" size="small">
                  {(t('screens.home.expense_paid_label') || 'Ödenen') + ': ' + formatCurrency(expenseYearPaid)}
                </Text>
                <Text variant="secondary" size="small">
                  {(t('screens.home.expense_outstanding_label') || 'Kalan') + ': ' + formatCurrency(expenseYearOutstanding)}
                </Text>
              </View>
              <Text variant={expenseChangeVariant} size="small" weight="medium">
                {expenseChange === null ? '—' : `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`}
              </Text>
            </View>
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{ paddingHorizontal: BAR_SPACING / 2 }}
            >
              <RNView>
                <RNView style={[styles.barsRow, { height: chartHeight, width: expenseChartWidth }]}> 
                  {expenseSeries.map((s, index) => {
                    const totalHeight = scale(s.total, expenseMax);
                    const paidHeight = Math.min(scale(s.paid, expenseMax), totalHeight);
                    return (
                      <RNView
                        key={s.ym || index}
                        style={{
                          width: BAR_WIDTH,
                          marginHorizontal: BAR_SPACING / 2,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <RNView
                          style={{
                            position: 'relative',
                            height: totalHeight,
                            backgroundColor: colors.danger,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            overflow: 'hidden',
                          }}
                        >
                          <RNView
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              height: paidHeight,
                              backgroundColor: colors.success,
                              borderTopLeftRadius: 12,
                              borderTopRightRadius: 12,
                            }}
                          />
                        </RNView>
                      </RNView>
                    );
                  })}
                </RNView>
                <RNView style={[styles.labelsRow, { width: expenseChartWidth, justifyContent: 'flex-start' }]}> 
                  {expenseSeries.map((s, index) => (
                    <RNView
                      key={`expense-label-${s.ym || index}`}
                      style={{
                        width: BAR_WIDTH,
                        marginHorizontal: BAR_SPACING / 2,
                        alignItems: 'center',
                      }}
                    >
                      <Text variant="secondary" size="small" weight="bold">
                        {formatMonthLabel(s.ym)}
                      </Text>
                      <Text
                        variant="secondary"
                        size="small"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {(t('screens.home.expense_total_short') || 'Toplam') + ': ' + formatCurrencyShort(s.total)}
                      </Text>
                      <Text
                        variant="secondary"
                        size="small"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {(t('screens.home.expense_paid_short') || 'Ödenen') + ': ' + formatCurrencyShort(s.paid)}
                      </Text>
                    </RNView>
                  ))}
                </RNView>
              </RNView>
            </RNScrollView>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <RNView style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text variant="secondary" size="small">{t('screens.home.expense_total_legend') || 'Toplam Gider'}</Text>
              </View>
              <View style={styles.legendItem}>
                <RNView style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text variant="secondary" size="small">{t('screens.home.expense_paid_legend') || 'Ödenen'}</Text>
              </View>
            </View>
            <View style={styles.labelsRow}>
              {expenseSeries.map((s) => (
                <Text key={s.ym} variant="secondary" size="small" weight="bold">{s.ym.slice(5)}</Text>
              ))}
            </View>
          </Card>
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
