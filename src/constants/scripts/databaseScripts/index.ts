// Database (Schema) SQL Scripts
export const DATABASE_SCRIPTS = {
  CREATE_SCHEMA_VERSION_TABLE: `
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL
    );
  `,

  GET_SCHEMA_VERSION: `
    SELECT version FROM schema_version WHERE id = 1;
  `,

  UPSERT_SCHEMA_VERSION: `
    INSERT INTO schema_version(id, version) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET version = excluded.version;
  `,
  CREATE_SETTINGS_TABLE: `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      notifications_enabled BOOLEAN DEFAULT 1,
      default_reminder_days_before INTEGER DEFAULT 1
    );
  `,
  UPSERT_DEFAULT_SETTINGS: `
    INSERT INTO settings (id, notifications_enabled, default_reminder_days_before)
    VALUES (1, 1, 1)
    ON CONFLICT(id) DO UPDATE SET
      notifications_enabled=excluded.notifications_enabled,
      default_reminder_days_before=excluded.default_reminder_days_before;
  `,
  CREATE_REPORTS_TABLE: `
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
} as const;
