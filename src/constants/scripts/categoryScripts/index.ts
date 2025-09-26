// Category SQL Scripts
export const CATEGORY_SCRIPTS = {
  // Tablo oluşturma
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_key TEXT,
      custom_name TEXT,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('expense','income','receivable')),
      is_default BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Varsayılan kategorileri ekleme
  INSERT_DEFAULT_CATEGORIES: `
    INSERT OR IGNORE INTO categories (id, name_key, icon, color, type, is_default) VALUES
    -- Gider kategorileri (kırmızı tonları)
    ('cat_rent', 'screens.categories.default.rent', 'home', '#E74C3C', 'expense', 1),
    ('cat_bills', 'screens.categories.default.bills', 'receipt_long', '#C0392B', 'expense', 1),
    ('cat_education', 'screens.categories.default.education', 'school', '#8E44AD', 'expense', 1),
    ('cat_food', 'screens.categories.default.food', 'fastfood', '#E67E22', 'expense', 1),
    ('cat_transport', 'screens.categories.default.transport', 'directions_bus', '#3498DB', 'expense', 1),
    ('cat_health', 'screens.categories.default.health', 'favorite', '#E91E63', 'expense', 1),
    ('cat_entertainment', 'screens.categories.default.entertainment', 'movie', '#9B59B6', 'expense', 1),
    ('cat_shopping', 'screens.categories.default.shopping', 'shopping_cart', '#F39C12', 'expense', 1),
    ('cat_other', 'screens.categories.default.other', 'apps', '#95A5A6', 'expense', 1),
    -- Gelir kategorileri (yeşil tonları)
    ('cat_salary', 'screens.categories.default.salary', 'work', '#27AE60', 'income', 1),
    ('cat_freelance', 'screens.categories.default.freelance', 'laptop', '#2ECC71', 'income', 1),
    ('cat_investment', 'screens.categories.default.investment', 'trending_up', '#16A085', 'income', 1),
    ('cat_bonus', 'screens.categories.default.bonus', 'card_giftcard', '#1ABC9C', 'income', 1),
    ('cat_rental', 'screens.categories.default.rental', 'home_work', '#58D68D', 'income', 1),
    ('cat_business', 'screens.categories.default.business', 'business', '#48C9B0', 'income', 1),
    ('cat_other_income', 'screens.categories.default.other_income', 'attach_money', '#7DCEA0', 'income', 1);
  `,

  // Kategori ekleme
  INSERT: `
    INSERT INTO categories (id, name_key, custom_name, icon, color, type, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,

  // Kategori güncelleme
  UPDATE: `
    UPDATE categories 
    SET name_key = ?, custom_name = ?, icon = ?, color = ?, type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
  `,

  // Kategori silme (soft delete)
  DELETE: `
    UPDATE categories 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
  `,

  // Kategori getir (ID ile)
  GET_BY_ID: `
    SELECT * FROM categories 
    WHERE id = ? AND is_active = 1;
  `,

  // Tüm kategorileri getir
  GET_ALL: `
    SELECT * FROM categories 
    WHERE is_active = 1 
    ORDER BY is_default DESC, created_at ASC;
  `,

  // Type'a göre kategorileri getir
  GET_BY_TYPE: `
    SELECT * FROM categories 
    WHERE is_active = 1 AND type = ?
    ORDER BY is_default DESC, created_at ASC;
  `,

  // Varsayılan kategorileri getir
  GET_DEFAULT: `
    SELECT * FROM categories 
    WHERE is_default = 1 AND is_active = 1 
    ORDER BY created_at ASC;
  `,

  // Kullanıcı kategorilerini getir
  GET_CUSTOM: `
    SELECT * FROM categories 
    WHERE is_default = 0 AND is_active = 1 
    ORDER BY created_at DESC;
  `,

  // Kategori arama
  SEARCH: `
    SELECT * FROM categories 
    WHERE (name_key LIKE ? OR custom_name LIKE ?) AND is_active = 1 
    ORDER BY is_default DESC, created_at DESC;
  `,

  // Kategori sayısı
  COUNT: `
    SELECT COUNT(*) as count FROM categories 
    WHERE is_active = 1;
  `,

  // Kategori var mı kontrol et
  EXISTS: `
    SELECT COUNT(*) as count FROM categories 
    WHERE id = ? AND is_active = 1;
  `,
} as const;
