// Database Entity Models
export type DatabaseQueryParams = string | number | boolean | null;

export interface DatabaseQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  lastInsertRowId?: number;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// SQLite specific types
export interface SQLiteResult {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item(index: number): unknown;
    _array: unknown[];
  };
}

// Database service interfaces
export interface DatabaseServiceInterface {
  initialize(): Promise<void>;
  query<T = unknown>(sql: string, params?: DatabaseQueryParams[]): Promise<DatabaseQueryResult<T>>;
  getAll<T = unknown>(sql: string, params?: DatabaseQueryParams[]): Promise<T[]>;
  getFirst<T = unknown>(sql: string, params?: DatabaseQueryParams[]): Promise<T | null>;
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
}

// Migration interfaces
export interface Migration {
  version: number;
  up(): Promise<void>;
  down(): Promise<void>;
}

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  success: boolean;
  error?: string;
}

// Schema version
export interface SchemaVersion {
  id: number;
  version: number;
}
