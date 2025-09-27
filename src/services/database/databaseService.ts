// Database Service - SQLite yönetimi
import * as SQLite from 'expo-sqlite';
import type { DatabaseQueryParams } from '@/models';

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
  async query(sql: string, params: DatabaseQueryParams[] = []): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return await this.db.runAsync(sql, params);
    } catch (error) {
      console.error('❌ Query failed:', error);
      throw error;
    }
  }

  // Veri getir
  async getAll<T = unknown>(sql: string, params: DatabaseQueryParams[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      return await this.db.getAllAsync<T>(sql, params);
    } catch (error) {
      console.error('❌ Get all failed:', error);
      throw error;
    }
  }

  // Tek veri getir
  async getFirst<T = unknown>(sql: string, params: DatabaseQueryParams[] = []): Promise<T | null> {
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

  // Tablo var mı kontrol et
  async tableExists(tableName: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?",
        [tableName]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('❌ Check table exists failed:', error);
      return false;
    }
  }

  // Tabloyu sil
  async dropTable(tableName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`✅ Table ${tableName} dropped successfully`);
    } catch (error) {
      console.error(`❌ Drop table ${tableName} failed:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
 
