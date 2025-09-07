// Text SQL Scripts
export const TEXT_SCRIPTS = {
  // Tablo oluşturma
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS texts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Text ekleme
  INSERT: `
    INSERT INTO texts (id, title, content, is_active)
    VALUES (?, ?, ?, ?);
  `,

  // Text güncelleme
  UPDATE: `
    UPDATE texts 
    SET title = ?, content = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
  `,

  // Text silme (soft delete)
  DELETE: `
    UPDATE texts 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
  `,

  // Text getir (ID ile)
  GET_BY_ID: `
    SELECT * FROM texts 
    WHERE id = ? AND is_active = 1;
  `,

  // Tüm textleri getir
  GET_ALL: `
    SELECT * FROM texts 
    WHERE is_active = 1 
    ORDER BY created_at DESC;
  `,

  // Text arama
  SEARCH: `
    SELECT * FROM texts 
    WHERE (title LIKE ? OR content LIKE ?) AND is_active = 1 
    ORDER BY created_at DESC;
  `,

  // Text sayısı
  COUNT: `
    SELECT COUNT(*) as count FROM texts 
    WHERE is_active = 1;
  `,
} as const;
