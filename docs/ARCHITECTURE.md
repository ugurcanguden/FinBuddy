# Architecture

Bu doküman, uygulamanın katmanlarını, klasör yapılanmasını ve akışlarını açıklar.

## Katmanlar
- UI (Screens & Components): Ekranlar `screens/`, tekrar kullanılabilir bileşenler `components/`.
- Navigation: `navigation/` altında yönlendirme ve tipler.
- State Management: `store/` (Redux/Zustand/Recoil, ekip tercihinize göre).
- Data/Services: `services/` altında API, storage, adapterlar.
- Utilities/Theme/Types: Yardımcılar, tema token’ları ve paylaşılan tipler.

## Mevcut Dizin Yapısı
```
src/
  App.tsx
  components/
    AppNavigator.tsx
    common/
      Button.tsx, Card.tsx, Text.tsx, View.tsx
      BarChart.tsx, LineChart.tsx, GroupedColumnChart.tsx
      WalletCard.tsx, StatCard.tsx, QuickActions.tsx
      RecentTransactions.tsx, WeeklySummary.tsx
      ProgressBar.tsx, Badge.tsx, Layout.tsx
      PageHeader.tsx, BottomTabBar.tsx
      Dropdown.tsx, RadioButton.tsx, Switch.tsx
      DatePicker.tsx, TimePicker.tsx
      FormSection.tsx, KeyboardAwareScrollView.tsx
    forms/
      CategoryForm.tsx
    ReportPreviewModal.tsx
  screens/
    home/
      HomeScreen.tsx
      components/
        WalletSection.tsx, StatsSection.tsx
        IncomeReportSection.tsx, ExpenseReportSection.tsx
        PaymentStatusSection.tsx
    categories/
      CategoriesScreen.tsx, AddCategoryScreen.tsx, EditCategoryScreen.tsx
      components/
        CategoryListSection.tsx, CategoryCard.tsx, AddCategoryButton.tsx
    payments/
      PaymentsScreen.tsx, IncomesScreen.tsx, AddPaymentScreen.tsx
      AddEntryScreen.tsx, PaymentDetailsScreen.tsx, PaymentsHubScreen.tsx
      components/
        PaymentStatsSection.tsx, QuickActionsSection.tsx
        PaymentListSection.tsx, IncomeStatsSection.tsx
        IncomeQuickActionsSection.tsx, IncomeListSection.tsx
    reports/
      ReportsHubScreen.tsx, ReportBuilderScreen.tsx
      components/
        MonthlySummarySection.tsx, CategoryDistributionSection.tsx
        SavedReportsSection.tsx
    settings/
      SettingsScreen.tsx
    profile/
      ProfileScreen.tsx
    InitialSetupScreen.tsx
    OnboardingScreen.tsx
    UIDemoScreen.tsx
  contexts/
    NavigationContext.tsx, ThemeContext.tsx, CurrencyContext.tsx
  hooks/
    useCategories.ts, useLocale.ts, useStorage.ts
    usePaymentReminders.ts, useBiometric.ts
  services/
    database/
      databaseService.ts, migrationService.ts
    category/
      categoryService.ts
    payment/
      paymentService.ts
    locale/
      localeService.ts
    notifications/
      notificationService.ts
    reports/
      reportsService.ts
    text/
      textService.ts
    storage.ts
  models/
    Category.ts, Entry.ts, Payment.ts, Report.ts
    Settings.ts, Database.ts, Common.ts
    index.ts
  constants/
    colors.ts, storageKeys.ts, currencyOptions.ts, languageOptions.ts
    scripts/
      categoryScripts/, paymentScripts/, databaseScripts/
  locales/
    tr/, en/, de/, fr/, it/, es/
      common.json, navigation.json, screens/
  utils/
    environment.ts, format.ts
  types/
    index.tsx (deprecated - now using models/)
```

## Veri Akışı
1) UI etkileşimi (Screen/Component)
2) İş kuralları + state güncelleme (`store/` veya local state)
3) Gerekirse servis çağrısı (`services/api/...`)
4) Sonuç UI’a yansır

## Hatalar ve Yükleniyor Durumu
- API çağrıları için loading ve error state’lerini merkezi veya lokal yönetin.
- Kullanıcıya anlaşılır geri bildirim: Toast/Alert veya inline hata mesajı.

## Navigasyon İlkeleri
- Rotalar `navigation/` içinde tipiyle tanımlanır.
- Ekranlar, route params’larını props tipiyle açıkça alır.

## Modül Sınırları
- Ekrana özgü yardımcıları ekran klasöründe tutun.
- Genel yardımcıları `utils/` altında tutun.
- Servislerin UI’yı import etmesine izin vermeyin (tek yönlü bağımlılık).

