// Home Screen - Ana sayfa (dashboard)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, ScrollView as RNScrollView, RefreshControl, Animated, Alert } from 'react-native';
import { useLocale } from '@/hooks';
import { Layout, PageHeader } from '@/components';
import { useTheme, useNavigation } from '@/contexts';
import { paymentService, storageService, reportsService } from '@/services';
import { useCurrencyFormatter } from '@/utils';
import { 
  WalletSection, 
  StatsSection, 
  IncomeReportSection, 
  ExpenseReportSection, 
  PaymentStatusSection,
  FavoriteReportsSection
} from './components';

// const BAR_WIDTH = 44;
// const BAR_SPACING = 16;

const HomeScreen: React.FC = () => {
  const { t } = useLocale();
  const { navigateTo } = useNavigation();

  const { colors } = useTheme();
  const { format } = useCurrencyFormatter();
  const [summary, setSummary] = useState<{ expense: { total: number; paid: number; pending: number }; income: { total: number; paid: number; pending: number } } | null>(null);
  const [incomeSeries, setIncomeSeries] = useState<Array<{ ym: string; total: number; paid: number }>>([]);
  const [expenseSeries, setExpenseSeries] = useState<Array<{ ym: string; total: number; paid: number }>>([]);
  const [upcomings, setUpcomings] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>>([]);
  const [overdueExpenses, setOverdueExpenses] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>>([]);
  const [overdueIncomes, setOverdueIncomes] = useState<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number; type: string }>>([]);
  const [listTab, setListTab] = useState<'upcoming_expense' | 'upcoming_income' | 'overdue_expense' | 'overdue_income'>('upcoming_expense');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
  const [cashFlow, setCashFlow] = useState<{ incomePaid: number; expensePaid: number; netBalance: number }>({ incomePaid: 0, expensePaid: 0, netBalance: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteReports, setFavoriteReports] = useState<Array<{ id: string; name: string; config: any }>>([]);
  const walletAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  const loadDashboard = useCallback(async (year: string, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [sum, inc, expenseBreakdown, upc, overdueExp, overdueInc, flow, years] = await Promise.all([
        paymentService.getDashboardSummary(),
        paymentService.getMonthlySeries('income', { year, limit: 12 }),
        paymentService.getMonthlyExpenseBreakdown({ year, limit: 12 }),
        paymentService.getUpcomingPayments(5, 30),
        paymentService.getOverduePayments('expense', 10),
        paymentService.getOverduePayments('income', 10),
        paymentService.getYearlyCashFlow(year),
        paymentService.getAvailableYears(),
      ]);
      
      setSummary(sum);
      setIncomeSeries(inc);
      setExpenseSeries(expenseBreakdown);
      setUpcomings(upc);
      setOverdueExpenses(overdueExp);
      setOverdueIncomes(overdueInc);
      setCashFlow(flow);
      setAvailableYears(years);
      
      // Eğer seçili yıl mevcut değilse, en yeni yılı seç
      if (years.length > 0 && !years.includes(year)) {
        setSelectedYear(years[0]!);
      }
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  // Favori raporları yükle
  const loadFavoriteReports = useCallback(async () => {
    try {
      const favoriteIds = await storageService.getFavoriteReports();
      if (favoriteIds.length > 0) {
        const reports = await Promise.all(
          favoriteIds.map(id => reportsService.getReport(id))
        );
        const validReports = reports.filter(report => report !== null) as Array<{ id: string; name: string; config: any }>;
        setFavoriteReports(validReports);
      } else {
        setFavoriteReports([]);
      }
    } catch (error) {
      console.error('Failed to load favorite reports:', error);
      setFavoriteReports([]);
    }
  }, []);

  // Favori raporu kaldır
  const removeFavoriteReport = useCallback(async (reportId: string) => {
    try {
      await storageService.removeFavoriteReport(reportId);
      setFavoriteReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Failed to remove favorite report:', error);
      Alert.alert('Hata', 'Favori rapor kaldırılamadı');
    }
  }, []);

  // Rapor görüntüle

  const handlePaymentAction = useCallback(async (paymentId: string, type: 'expense' | 'income') => {
    try {
      const status = type === 'expense' ? 'paid' : 'received';
      await paymentService.updatePaymentStatus(paymentId, status);
      
      // Dashboard'ı yenile
      await loadDashboard(selectedYear);
      
      Alert.alert(
        t('screens.home.action_success') || 'Başarılı',
        type === 'expense' 
          ? (t('screens.home.payment_success') || 'Ödeme başarıyla işaretlendi!')
          : (t('screens.home.income_success') || 'Gelir başarıyla işaretlendi!')
      );
    } catch (error) {
      console.error('Payment action failed:', error);
      Alert.alert(
        t('screens.home.action_error') || 'Hata', 
        t('screens.home.action_error_message') || 'İşlem sırasında bir hata oluştu.'
      );
    }
  }, [loadDashboard, selectedYear]);


  useEffect(() => {
    if (!selectedYear) return;
    loadDashboard(selectedYear);
    loadFavoriteReports();
  }, [loadDashboard, selectedYear, loadFavoriteReports]);

  // Tour kontrolü - ana sayfa açıldığında
  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        const onboardingCompleted = await storageService.get<boolean>('onboarding_completed');
        if (!onboardingCompleted) {
          console.log('🎯 Tour not completed, showing tour from home screen');
          navigateTo('onboarding');
        }
      } catch (error) {
        console.error('Failed to check tour status:', error);
      }
    };

    checkTourStatus();
  }, [navigateTo]);


  // Chart yüksekliği
  // const chartHeight = 160;

  // const latestIncome = incomeSeries.length ? incomeSeries[incomeSeries.length - 1]!.total : 0;
  // const previousIncome = incomeSeries.length > 1 ? incomeSeries[incomeSeries.length - 2]!.total : null; // BarChart içinde hesaplanıyor
  // const latestExpense = expenseSeries.length ? expenseSeries[expenseSeries.length - 1]!.total : 0;
  // const previousExpense = expenseSeries.length > 1 ? expenseSeries[expenseSeries.length - 2]!.total : null; // BarChart içinde hesaplanıyor

  // const expenseYearTotal = useMemo(
  //   () => expenseSeries.reduce((sum, item) => sum + (item.total || 0), 0),
  //   [expenseSeries]
  // ); // BarChart içinde hesaplanıyor
  // const expenseYearPaid = useMemo(
  //   () => expenseSeries.reduce((sum, item) => sum + (item.paid || 0), 0),
  //   [expenseSeries]
  // );
  // const expenseYearOutstanding = Math.max(expenseYearTotal - expenseYearPaid, 0); // BarChart içinde hesaplanıyor
  const netCash = useMemo(
    () => {
      // Artık netBalance direkt olarak hesaplanıyor
      return cashFlow.netBalance || 0;
    },
    [cashFlow]
  );
  const totalMagnitude = useMemo(
    () => Math.max(Math.abs(cashFlow.incomePaid) + Math.abs(cashFlow.expensePaid), 1),
    [cashFlow]
  );
  const netRatio = useMemo(() => Math.min(Math.abs(netCash) / totalMagnitude, 1), [netCash, totalMagnitude]);
  // const isNetPositive = netCash >= 0; // WalletCard içinde hesaplanıyor

  useEffect(() => {
    // Animasyonu durdur ve sıfırla
    walletAnim.stopAnimation();
    walletAnim.setValue(0);
    
    Animated.timing(walletAnim, {
      toValue: netRatio,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [walletAnim, netRatio]);

  useEffect(() => {
    // Animasyonu durdur ve sıfırla
    coinAnim.stopAnimation();
    coinAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(coinAnim, { toValue: -12, duration: 250, useNativeDriver: false }),
      Animated.spring(coinAnim, { toValue: 0, damping: 6, useNativeDriver: false }),
    ]).start();
  }, [coinAnim, netCash]);

  const formatCurrency = useCallback((value: number) => {
    return format(value);
  }, [format]);

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
    
    // Dil karşılığı için ay isimleri
    const monthNames = [
      t('common.months.january') || 'Oca',
      t('common.months.february') || 'Şub',
      t('common.months.march') || 'Mar',
      t('common.months.april') || 'Nis',
      t('common.months.may') || 'May',
      t('common.months.june') || 'Haz',
      t('common.months.july') || 'Tem',
      t('common.months.august') || 'Ağu',
      t('common.months.september') || 'Eyl',
      t('common.months.october') || 'Eki',
      t('common.months.november') || 'Kas',
      t('common.months.december') || 'Ara',
    ];
    
    try {
      return `${monthNames[monthNum]} ${year}`;
    } catch {
      return `${month}.${year}`;
    }
  }, [t]);

  // LineChart verilerini hazırla - artık kullanılmıyor
  // const incomeChartData = useMemo(() => {
  //   // Verileri sırala ve formatla
  //   const sortedData = [...incomeSeries].sort((a, b) => a.ym.localeCompare(b.ym));
  //   const chartDataMap = new Map<string, { label: string; value: number; status: 'paid' | 'pending' | 'overdue' }>();
  //   
  //   sortedData.forEach(s => {
  //     const paid = s.paid || 0;
  //     const unpaid = s.total - paid;
  //     const isOverdue = new Date(s.ym + '-01') < new Date();
  //     const label = formatMonthLabel(s.ym);
  //     
  //     // Ödenen kısmı ekle
  //     if (paid > 0) {
  //       const key = `${s.ym}_paid`; // ym kullan, label değil
  //       if (chartDataMap.has(key)) {
  //         chartDataMap.get(key)!.value += paid;
  //       } else {
  //         chartDataMap.set(key, {
  //           label,
  //           value: paid,
  //           status: 'paid', // Ödenen - yeşil
  //         });
  //       }
  //     }
  //     
  //     // Ödenmemiş kısmı ekle
  //     if (unpaid > 0) {
  //       const status = isOverdue ? 'overdue' : 'pending';
  //       const key = `${s.ym}_${status}`; // ym kullan, label değil
  //       if (chartDataMap.has(key)) {
  //         chartDataMap.get(key)!.value += unpaid;
  //       } else {
  //         chartDataMap.set(key, {
  //           label,
  //           value: unpaid,
  //           status, // Geciken veya bekleyen
  //         });
  //       }
  //     }
  //   });
  //   
  //   return Array.from(chartDataMap.values());
  // }, [incomeSeries, formatMonthLabel]);

  // const expenseChartData = useMemo(() => {
  //   // Verileri sırala ve formatla
  //   const sortedData = [...expenseSeries].sort((a, b) => a.ym.localeCompare(b.ym));
  //   const chartDataMap = new Map<string, { label: string; value: number; status: 'paid' | 'pending' | 'overdue' }>();
  //   
  //   sortedData.forEach(s => {
  //     const paid = s.paid || 0;
  //     const unpaid = s.total - paid;
  //     const isOverdue = new Date(s.ym + '-01') < new Date();
  //     const label = formatMonthLabel(s.ym);
  //     
  //     // Ödenen kısmı ekle
  //     if (paid > 0) {
  //       const key = `${s.ym}_paid`; // ym kullan, label değil
  //       if (chartDataMap.has(key)) {
  //         chartDataMap.get(key)!.value += paid;
  //       } else {
  //         chartDataMap.set(key, {
  //           label,
  //           value: paid,
  //           status: 'paid', // Ödenen - yeşil
  //         });
  //       }
  //     }
  //     
  //     // Ödenmemiş kısmı ekle
  //     if (unpaid > 0) {
  //       const status = isOverdue ? 'overdue' : 'pending';
  //       const key = `${s.ym}_${status}`; // ym kullan, label değil
  //       if (chartDataMap.has(key)) {
  //         chartDataMap.get(key)!.value += unpaid;
  //       } else {
  //         chartDataMap.set(key, {
  //           label,
  //           value: unpaid,
  //           status, // Geciken veya bekleyen
  //         });
  //       }
  //     }
  //   });
  //   
  //   return Array.from(chartDataMap.values());
  // }, [expenseSeries, formatMonthLabel]);


  // Component'lere taşındı - artık burada yok

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
            colors={[colors.primary]} // Android için
            tintColor={colors.primary} // iOS için
          />
        )}
      >
        {/* Cüzdan Bölümü */}
        <WalletSection
          netCash={netCash}
          incomePaid={cashFlow.incomePaid}
          expensePaid={cashFlow.expensePaid}
          loading={refreshing}
        />

        {/* İstatistik Kartları */}
        <StatsSection
          summary={summary}
          formatCurrency={formatCurrency}
        />

        {/* Gelir Raporu */}
        <IncomeReportSection
          incomeSeries={incomeSeries}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          formatCurrency={formatCurrency}
          formatMonthLabel={formatMonthLabel}
        />

        {/* Gider Raporu */}
        <ExpenseReportSection
          expenseSeries={expenseSeries}
          formatCurrency={formatCurrency}
          formatMonthLabel={formatMonthLabel}
        />

        {/* Ödeme Durumu */}
        <PaymentStatusSection
          upcomings={upcomings}
          overdueExpenses={overdueExpenses}
          overdueIncomes={overdueIncomes}
          listTab={listTab}
          onTabChange={setListTab}
          onPaymentAction={handlePaymentAction}
          formatCurrency={formatCurrency}
          calculateOverdueDays={calculateOverdueDays}
          calculateDaysUntil={calculateDaysUntil}
        />

        {/* Favori Raporlar */}
          <FavoriteReportsSection
            reports={favoriteReports}
            onRemoveReport={removeFavoriteReport}
          />
      </RNScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default HomeScreen;
