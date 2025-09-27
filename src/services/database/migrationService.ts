// Migration Service - Basit şema versiyonlama ve geçişler
import { databaseService } from './databaseService';
import { DATABASE_SCRIPTS } from '@/constants/scripts/databaseScripts';
import { PAYMENT_SCRIPTS } from '@/constants/scripts/paymentScripts';
import { CATEGORY_SCRIPTS } from '@/constants/scripts/categoryScripts';

// const CURRENT_SCHEMA_VERSION = 5; // Geçerli şema sürümü

class MigrationService {
  async getCurrentVersion(): Promise<number> {
    await databaseService.query(DATABASE_SCRIPTS.CREATE_SCHEMA_VERSION_TABLE);
    const row = await databaseService.getFirst<{ version: number }>(
      DATABASE_SCRIPTS.GET_SCHEMA_VERSION
    );
    return row?.version ?? 0;
  }

  async setVersion(version: number): Promise<void> {
    await databaseService.query(DATABASE_SCRIPTS.UPSERT_SCHEMA_VERSION, [version]);
  }

  // Sürüm 1 geçişi: kategori tablosunu oluştur
  private async migrateToV1(): Promise<void> {
    await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);
  }

  // V2: categories.id kolonunu TEXT yap (eski yanlış şema olasılığına karşı)
  private async migrateToV2(): Promise<void> {
    // Eğer tablo yoksa sadece oluştur (V1 zaten oluşturur)
    const hasTable = await databaseService.tableExists('categories');
    if (!hasTable) {
      await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);
      return;
    }

    // PRAGMA ile kolon tipini kontrol et
    type PragmaRow = { cid: number; name: string; type: string };
    const columns = await databaseService.getAll<PragmaRow>("PRAGMA table_info(categories)");
    const idCol = columns.find((c) => c.name.toLowerCase() === 'id');
    const idType = (idCol?.type || '').toUpperCase();

    if (idType === 'TEXT') {
      // Zaten doğru
      return;
    }

    // Eski tabloyu yeniden adlandır, yeni tabloyu oluştur ve verileri taşı
    await databaseService.query('ALTER TABLE categories RENAME TO categories_old');
    await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);

      // Eski verileri al
      type OldRow = {
        name_key: string | null;
        custom_name: string | null;
        icon: string;
        color: string;
        is_default: number | boolean;
        is_active: number | boolean;
        created_at: string | null;
        updated_at: string | null;
      };
      const rows = await databaseService.getAll<OldRow>(
        'SELECT name_key, custom_name, icon, color, is_default, is_active, created_at, updated_at FROM categories_old'
      );

      let i = 0;
      for (const r of rows) {
        const newId = `cat_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
        await databaseService.query(
          'INSERT INTO categories (id, name_key, custom_name, icon, color, is_default, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newId,
            r.name_key,
            r.custom_name,
            r.icon,
            r.color,
            r.is_default ? 1 : 0,
            r.is_active ? 1 : 0,
            r.created_at ?? null,
            r.updated_at ?? null,
          ]
        );
        i += 1;
      }

    // Eski tabloyu temizle
    await databaseService.query('DROP TABLE IF EXISTS categories_old');
  }

  // V3: entries, payments, settings tabloları
  private async migrateToV3(): Promise<void> {
    await databaseService.query(PAYMENT_SCRIPTS.CREATE_ENTRIES_TABLE);
    await databaseService.query(PAYMENT_SCRIPTS.CREATE_PAYMENTS_TABLE);
    await databaseService.query(DATABASE_SCRIPTS.CREATE_SETTINGS_TABLE);
    await databaseService.query(DATABASE_SCRIPTS.UPSERT_DEFAULT_SETTINGS);
  }

  // V4: reports tablosu
  private async migrateToV4(): Promise<void> {
    await databaseService.query(DATABASE_SCRIPTS.CREATE_REPORTS_TABLE);
  }

  // V5: categories tablosuna type kolonu ekle
  private async migrateToV5(): Promise<void> {
    // Önce type kolonunun var olup olmadığını kontrol et
    const hasTable = await databaseService.tableExists('categories');
    if (!hasTable) {
      // Tablo yoksa yeni şemayla oluştur
      await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);
      await databaseService.query(CATEGORY_SCRIPTS.INSERT_DEFAULT_CATEGORIES);
      return;
    }

    // Type kolonunun var olup olmadığını kontrol et
    type PragmaRow = { cid: number; name: string; type: string };
    const columns = await databaseService.getAll<PragmaRow>("PRAGMA table_info(categories)");
    const typeCol = columns.find((c) => c.name.toLowerCase() === 'type');

    if (typeCol) {
      // Type kolonu zaten var, sadece varsayılan kategorileri güncelle
      await databaseService.query(CATEGORY_SCRIPTS.INSERT_DEFAULT_CATEGORIES);
      return;
    }

    // Type kolonu yok, tabloyu yeniden oluştur
    // Önce mevcut kategorileri yedekle
    await databaseService.query('ALTER TABLE categories RENAME TO categories_old');
    await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);

    // Eski verileri al ve type='expense' olarak ekle (sadece custom kategoriler)
    type OldRow = {
      id: string;
      name_key: string | null;
      custom_name: string | null;
      icon: string;
      color: string;
      is_default: number | boolean;
      is_active: number | boolean;
      created_at: string | null;
      updated_at: string | null;
    };
    const rows = await databaseService.getAll<OldRow>(
      'SELECT id, name_key, custom_name, icon, color, is_default, is_active, created_at, updated_at FROM categories_old WHERE is_default = 0'
    );

    // Sadece custom kategorileri ekle
    for (const r of rows) {
      await databaseService.query(
        'INSERT INTO categories (id, name_key, custom_name, icon, color, type, is_default, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          r.id,
          r.name_key,
          r.custom_name,
          r.icon,
          r.color,
          'expense', // Mevcut custom kategorileri expense olarak işaretle
          r.is_default ? 1 : 0,
          r.is_active ? 1 : 0,
          r.created_at ?? null,
          r.updated_at ?? null,
        ]
      );
    }

    // Yeni varsayılan kategorileri ekle (hem expense hem income)
    await databaseService.query(CATEGORY_SCRIPTS.INSERT_DEFAULT_CATEGORIES);

    // Eski tabloyu temizle
    await databaseService.query('DROP TABLE IF EXISTS categories_old');
  }

  async migrateToLatest(): Promise<void> {
    await databaseService.transaction(async () => {
      const current = await this.getCurrentVersion();

      // V0 -> V1
      if (current < 1) {
        await this.migrateToV1();
        await this.setVersion(1);
      }

      // V1 -> V2 (categories.id TEXT düzeltmesi)
      if (current < 2) {
        await this.migrateToV2();
        await this.setVersion(2);
      }

      // V2 -> V3
      if (current < 3) {
        await this.migrateToV3();
        await this.setVersion(3);
      }

      if (current < 4) {
        await this.migrateToV4();
        await this.setVersion(4);
      }

      if (current < 5) {
        await this.migrateToV5();
        await this.setVersion(5);
      }

      // Gelecek sürümler: if (current < 6) { ... setVersion(6); }
    });
  }

  async resetAppData(): Promise<void> {
    await databaseService.transaction(async () => {
      await databaseService.dropTable('payments');
      await databaseService.dropTable('entries');
      await databaseService.dropTable('reports');
      await databaseService.dropTable('settings');
      await databaseService.dropTable('categories');
      await databaseService.dropTable('schema_version');
    });

    await this.migrateToLatest();
  }
}

export const migrationService = new MigrationService();
