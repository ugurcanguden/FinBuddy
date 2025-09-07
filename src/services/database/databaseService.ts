// Database Service - SQLite yönetimi
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // Veritabanını başlat
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('finbuddy.db');
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Genel sorgu çalıştır
  async query(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return await this.db.runAsync(sql, params);
    } catch (error) {
      console.error('❌ Query failed:', error);
      throw error;
    }
  }

  // Veri getir
  async getAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return await this.db.getAllAsync<T>(sql, params);
    } catch (error) {
      console.error('❌ Get all failed:', error);
      throw error;
    }
  }

  // Tek veri getir
  async getFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getFirstAsync<T>(sql, params);
      return result || null;
    } catch (error) {
      console.error('❌ Get first failed:', error);
      throw error;
    }
  }

  // Transaction başlat
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.execAsync('BEGIN TRANSACTION');
      const result = await callback();
      await this.db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  // Veritabanını kapat
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('✅ Database closed');
    }
  }

  // Veritabanı durumunu kontrol et
  isInitialized(): boolean {
    return this.db !== null;
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
 
