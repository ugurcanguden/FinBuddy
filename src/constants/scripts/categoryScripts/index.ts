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
      is_default BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Varsayılan kategorileri ekleme
  INSERT_DEFAULT_CATEGORIES: `
    INSERT OR IGNORE INTO categories (id, name_key, icon, color, is_default) VALUES
    ('cat_rent', 'screens.categories.default.rent', 'home', '#29382f', 1),
    ('cat_bills', 'screens.categories.default.bills', 'receipt_long', '#29382f', 1),
    ('cat_education', 'screens.categories.default.education', 'school', '#29382f', 1),
    ('cat_food', 'screens.categories.default.food', 'fastfood', '#29382f', 1),
    ('cat_transport', 'screens.categories.default.transport', 'directions_bus', '#29382f', 1),
    ('cat_health', 'screens.categories.default.health', 'favorite', '#29382f', 1),
    ('cat_entertainment', 'screens.categories.default.entertainment', 'movie', '#29382f', 1),
    ('cat_other', 'screens.categories.default.other', 'apps', '#29382f', 1);
  `,

  // Kategori ekleme
  INSERT: `
    INSERT INTO categories (id, name_key, custom_name, icon, color, is_default)
    VALUES (?, ?, ?, ?, ?, ?);
  `,

  // Kategori güncelleme
  UPDATE: `
    UPDATE categories 
    SET name_key = ?, custom_name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP
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
