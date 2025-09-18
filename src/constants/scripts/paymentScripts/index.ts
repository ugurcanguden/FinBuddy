// Entry/Payment SQL Scripts
export const PAYMENT_SCRIPTS = {
  CREATE_ENTRIES_TABLE: `
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('expense','income','receivable')),
      title TEXT,
      amount REAL NOT NULL,
      months INTEGER DEFAULT 0,
      start_date TEXT NOT NULL,
      schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once','installment')),
      reminder_days_before INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  CREATE_PAYMENTS_TABLE: `
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','received')),
      paid_at TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
} as const;

