# Data Model (Draft)

Temel varlıklar ve ilişkiler (SQLite şeması için taslak).

## Entities
- Category
  - id TEXT PK
  - name_key TEXT (nullable, varsayılanlar için)
  - custom_name TEXT (nullable, kullanıcı kategorisi)
  - icon TEXT, color TEXT
  - type TEXT CHECK ('expense'|'income'|'receivable') NOT NULL
  - is_default BOOLEAN, is_active BOOLEAN
  - created_at, updated_at

- Entry (genel kayıt: gider/gelir/alacak)
  - id TEXT PK
  - category_id TEXT FK -> Category(id)
  - type TEXT CHECK ('expense'|'income'|'receivable')
  - title TEXT (opsiyonel), amount REAL, currency TEXT (opsiyonel)
  - schedule_type TEXT CHECK ('once'|'installment')
  - start_date DATE, end_date DATE (nullable)
  - total_installments INTEGER (nullable), installment_amount REAL (nullable)
  - reminder_days_before INTEGER DEFAULT 1  // entry bazında override; yoksa Settings’teki varsayılan kullanılır
  - is_active BOOLEAN DEFAULT 1
  - created_at, updated_at

- Payment (oluşturulmuş ödemeler/taksitler)
  - id TEXT PK
  - entry_id TEXT FK -> Entry(id)
  - due_date DATE
  - amount REAL
  - status TEXT CHECK ('pending'|'paid'|'received')
  - paid_at DATE (nullable)
  - created_at, updated_at

- Settings
  - id INTEGER PK CHECK (id=1)
  - notifications_enabled BOOLEAN DEFAULT 1
  - default_reminder_days_before INTEGER DEFAULT 1

## Akış Notları
- Entry kaydı taksitli ise Payment'lar ileriye dönük olarak oluşturulur (örn. 10 ay).
- Hatırlatmalar due_date - reminder_days_before gününde planlanır; entry'de yoksa Settings.default_reminder_days_before kullanılır.
- Status: expense→paid, receivable→received; income tek seferlik paid/received.
- **Kategori Tipi**: Her kategori ya sadece gider (expense) ya da sadece gelir (income) için kullanılabilir.
- **Kategori Filtreleme**: UI'da kategoriler entry type'a göre filtrelenir.

## Migration Planı
- v1: Category (mevcut)
- v2: Entry, Payment, Settings tabloları + seed Settings(1)
- v3: Reports tablosu
- v4: Categories tablosuna type kolonu eklendi
- v5: Varsayılan gelir kategorileri eklendi
