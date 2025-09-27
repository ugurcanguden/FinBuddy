# FinBuddy - API Dokümantasyonu

Bu doküman, FinBuddy uygulamasının servis katmanı API'lerini açıklar.

## 📁 Servis Katmanı

### DatabaseService
Veritabanı işlemleri için temel servis.

```typescript
class DatabaseService {
  // Veritabanını başlat
  async initialize(): Promise<void>
  
  // SQL sorgusu çalıştır
  async query(sql: string, params: DatabaseQueryParams[]): Promise<SQLiteRunResult>
  
  // Tüm kayıtları getir
  async getAll<T>(sql: string, params: DatabaseQueryParams[]): Promise<T[]>
  
  // İlk kaydı getir
  async getFirst<T>(sql: string, params: DatabaseQueryParams[]): Promise<T | null>
  
  // Transaction başlat
  async transaction<T>(callback: () => Promise<T>): Promise<T>
}
```

### CategoryService
Kategori yönetimi için servis.

```typescript
class CategoryService {
  // Servisi başlat
  async initialize(): Promise<void>
  
  // Tüm kategorileri getir
  async getAll(): Promise<Category[]>
  
  // Tip göre kategorileri getir
  async getByType(type: CategoryType): Promise<Category[]>
  
  // Kategori oluştur
  async create(data: CreateCategoryData): Promise<Category>
  
  // Kategori güncelle
  async update(id: string, data: UpdateCategoryData): Promise<Category>
  
  // Kategori sil
  async delete(id: string): Promise<void>
}
```

### PaymentService
Ödeme yönetimi için servis.

```typescript
class PaymentService {
  // Dashboard özeti
  async getDashboardSummary(ym?: string): Promise<DashboardSummary>
  
  // Aylık seri verisi
  async getMonthlySeries(type: 'expense' | 'income', options: MonthlySeriesOptions): Promise<MonthlyData[]>
  
  // Aylık gider dağılımı
  async getMonthlyExpenseBreakdown(options: MonthlySeriesOptions): Promise<MonthlyData[]>
  
  // Yaklaşan ödemeler
  async getUpcomingPayments(limit: number, daysAhead: number): Promise<UpcomingPayment[]>
  
  // Geciken ödemeler
  async getOverduePayments(type: 'expense' | 'income', limit: number): Promise<OverduePayment[]>
  
  // Yıllık nakit akışı
  async getYearlyCashFlow(year: string): Promise<CashFlow>
  
  // Mevcut yıllar
  async getAvailableYears(): Promise<string[]>
  
  // Kategori bazlı toplamlar
  async getTotalsByCategory(options: CategoryTotalsOptions): Promise<CategoryTotal[]>
  
  // Ödeme durumu güncelle
  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void>
  
  // Entry oluştur
  async createEntry(data: CreateEntryData): Promise<Entry>
  
  // Entry getir
  async getEntryById(entryId: string): Promise<Entry | null>
  
  // Entry'ler getir
  async getEntries(type?: EntryType): Promise<Entry[]>
  
  // Entry tipleri
  async getEntryTypes(): Promise<EntryType[]>
  
  // Payment'lar getir
  async getPaymentsByEntry(entryId: string): Promise<Payment[]>
}
```

### LocaleService
Çoklu dil desteği için servis.

```typescript
class LocaleService {
  // Servisi başlat
  async initialize(): Promise<void>
  
  // Dil değiştir
  async setLanguage(language: SupportedLanguage): Promise<void>
  
  // Mevcut dil
  getCurrentLanguage(): SupportedLanguage
  
  // Çeviri al
  t(key: string, params?: Record<string, string | number>): string
  
  // Desteklenen diller
  getSupportedLanguages(): LanguageOption[]
  
  // Dil adı
  getLanguageName(code: SupportedLanguage): string
}
```

### NotificationService
Bildirim yönetimi için servis.

```typescript
class NotificationService {
  // Servisi başlat
  static async initialize(): Promise<boolean>
  
  // İzin iste
  static async requestPermissions(): Promise<boolean>
  
  // Günlük bildirim planla
  static async scheduleDailyNotification(hour: number, minute: number, language: string): Promise<string | null>
  
  // Ödeme hatırlatıcıları planla
  static async schedulePaymentReminders(settings: PaymentRemindersSettings, language?: string): Promise<string[] | null>
  
  // Dil güncelle
  static async updateNotificationLanguage(language: string): Promise<boolean>
  
  // Test bildirimi gönder
  static async sendTestNotification(language?: string): Promise<string | null>
  
  // Tüm bildirimleri iptal et
  static async cancelAllNotifications(): Promise<void>
  
  // Planlanmış bildirimleri getir
  static async getScheduledNotifications(): Promise<NotificationRequest[]>
  
  // İzin kontrolü
  static async checkPermissions(): Promise<boolean>
}
```

### ReportsService
Rapor yönetimi için servis.

```typescript
class ReportsService {
  // Raporları listele
  async listReports(): Promise<ReportDef[]>
  
  // Rapor oluştur
  async createReport(name: string, config: ReportConfig): Promise<ReportDef>
  
  // Rapor güncelle
  async updateReport(id: string, name: string, config: ReportConfig): Promise<ReportDef>
  
  // Rapor sil
  async deleteReport(id: string): Promise<void>
  
  // Rapor getir
  async getReport(id: string): Promise<ReportDef | null>
}
```

## 📊 Veri Modelleri

### Category
```typescript
interface Category {
  id: string
  name_key: string
  custom_name?: string
  icon: string
  color: string
  type: CategoryType
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

type CategoryType = 'expense' | 'income' | 'receivable'
```

### Entry
```typescript
interface Entry {
  id: string
  category_id: string
  type: EntryType
  title?: string
  amount: number
  months: number
  start_date: string
  schedule_type: ScheduleType
  reminder_days_before?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type EntryType = 'expense' | 'income' | 'receivable'
type ScheduleType = 'once' | 'installment'
```

### Payment
```typescript
interface Payment {
  id: string
  entry_id: string
  due_date: string
  amount: number
  status: PaymentStatus
  paid_at?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type PaymentStatus = 'pending' | 'paid' | 'received'
```

### Report
```typescript
interface ReportDef {
  id: string
  name: string
  config: ReportConfig
  created_at: string
  updated_at: string
}

interface ReportConfig {
  fact: ReportFact
  dimension: ReportDimension
  measure: ReportMeasure
  filters?: Record<string, unknown>
  chart?: ReportChartType
}

type ReportFact = 'payments_all' | 'payments_expense' | 'payments_income' | 'payments' | 'entries'
type ReportDimension = 'month' | 'category' | 'status' | 'type'
type ReportMeasure = 'sum' | 'count' | 'avg'
type ReportChartType = 'table' | 'bar' | 'line' | 'pie'
```

## 🔧 Hook'lar

### useCategories
```typescript
interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  getCategoriesByType: (type: CategoryType) => Promise<Category[]>
  createCategory: (data: CreateCategoryData) => Promise<Category>
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  getDisplayName: (category: Category, t: (key: string) => string) => string
}
```

### useLocale
```typescript
interface UseLocaleReturn {
  currentLanguage: SupportedLanguage
  loading: boolean
  error: Error | null
  t: (key: string, params?: Record<string, string | number>) => string
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  getSupportedLanguages: () => LanguageOption[]
  getLanguageName: (code: SupportedLanguage) => string
}
```

### usePaymentReminders
```typescript
interface UsePaymentRemindersReturn {
  settings: PaymentRemindersSettings
  loading: boolean
  toggleReminders: (enabled: boolean) => Promise<PaymentRemindersSettings>
  updateTime: (time: string) => Promise<PaymentRemindersSettings>
  updateDays: (days: number[]) => Promise<PaymentRemindersSettings>
  updateSettings: (newSettings: Partial<PaymentRemindersSettings>) => Promise<PaymentRemindersSettings>
  resetSettings: () => Promise<PaymentRemindersSettings>
}
```

## 🗄️ Veritabanı Şeması

### Categories Tablosu
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_key TEXT,
  custom_name TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income', 'receivable')) NOT NULL,
  is_default BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Entries Tablosu
```sql
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income', 'receivable')) NOT NULL,
  title TEXT,
  amount REAL NOT NULL,
  months INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  schedule_type TEXT CHECK (schedule_type IN ('once', 'installment')) NOT NULL,
  reminder_days_before INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories (id)
);
```

### Payments Tablosu
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'received')) NOT NULL,
  paid_at TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (id)
);
```

## 🔄 Migration Sistemi

### Mevcut Versiyonlar
- v1: Category tablosu
- v2: Entry, Payment, Settings tabloları
- v3: Reports tablosu
- v4: Categories tablosuna type kolonu
- v5: Varsayılan gelir kategorileri

### Migration Çalıştırma
```typescript
// Migration servisi
await migrationService.migrateToLatest()
```

## 📝 Hata Yönetimi

### Servis Hataları
```typescript
try {
  const result = await paymentService.createEntry(data)
} catch (error) {
  console.error('Payment service error:', error)
  // Kullanıcıya hata mesajı göster
}
```

### Veritabanı Hataları
```typescript
try {
  await databaseService.query(sql, params)
} catch (error) {
  console.error('Database error:', error)
  // Hata loglama ve kullanıcı bildirimi
}
```

## 🚀 Performans Optimizasyonu

### Lazy Loading
```typescript
// Büyük veri setleri için
const categories = await categoryService.getByType('expense')
```

### Memoization
```typescript
// Hesaplamaları cache'le
const totalAmount = useMemo(() => {
  return payments.reduce((sum, payment) => sum + payment.amount, 0)
}, [payments])
```

### Transaction Kullanımı
```typescript
// Atomik işlemler
await databaseService.transaction(async () => {
  await paymentService.createEntry(entryData)
  await paymentService.createPayments(paymentData)
})
```
