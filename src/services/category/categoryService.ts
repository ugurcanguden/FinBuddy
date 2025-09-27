// Category Service - Kategori yönetimi
import { databaseService } from '../database';
import { CATEGORY_SCRIPTS } from '@/constants/scripts';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/models';

class CategoryService {
  // Veritabanını başlat ve varsayılan kategorileri ekle
  async initialize(): Promise<void> {
    try {
      // Idempotent kurulum: tabloyu oluştur (varsa dokunma) ve varsayılanları ekle (OR IGNORE)
      await databaseService.transaction(async () => {
        await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);
        await databaseService.query(CATEGORY_SCRIPTS.INSERT_DEFAULT_CATEGORIES);
      });
      
      // Category service initialized successfully
    } catch (error) {
      // Category service initialization failed
      throw error;
    }
  }

  // Yeni kategori oluştur
  async create(data: CreateCategoryData): Promise<Category> {
    try {
      const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Creating category

      await databaseService.query(CATEGORY_SCRIPTS.INSERT, [
        id,
        data.name_key ?? null, // name_key = null (kullanıcı kategorisi için)
        data.custom_name ?? null,
        data.icon,
        data.color,
        data.type,
        0 // is_default = false (kullanıcı kategorisi)
      ]);

      const category = await this.getById(id);
      if (!category) {
        throw new Error('Kategori oluşturulduktan sonra bulunamadı');
      }

      return category;
    } catch (error) {
      // Category creation failed
      throw error;
    }
  }

  // Kategori güncelle
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      // Varsayılan kategorilerin düzenlenmesine izin verme (UI saklıyor olsa bile servis seviyesinde koru)
      const existing = await this.getById(id);
      if (existing?.is_default) {
        throw new Error('Varsayılan kategoriler düzenlenemez');
      }

      await databaseService.query(CATEGORY_SCRIPTS.UPDATE, [
        null, // name_key = null (kullanıcı kategorisi için)
        data.custom_name ?? null,
        data.icon || '',
        data.color || '',
        data.type ?? 'expense', // Varsayılan olarak expense
        id
      ]);

      const category = await this.getById(id);
      if (!category) {
        throw new Error('Kategori güncellendikten sonra bulunamadı');
      }

      return category;
    } catch (error) {
      // Category update failed
      throw error;
    }
  }

  // Kategori sil (soft delete)
  async delete(id: string): Promise<void> {
    try {
      // Varsayılan kategori silinemez (servis koruması)
      const existing = await this.getById(id);
      if (existing?.is_default) {
        throw new Error('Varsayılan kategoriler silinemez');
      }

      await databaseService.query(CATEGORY_SCRIPTS.DELETE, [id]);
      // Category deleted successfully
    } catch (error) {
      // Category deletion failed
      throw error;
    }
  }

  // ID ile kategori getir
  async getById(id: string): Promise<Category | null> {
    try {
      return await databaseService.getFirst<Category>(
        CATEGORY_SCRIPTS.GET_BY_ID, 
        [id]
      );
    } catch (error) {
      // Get category by ID failed
      throw error;
    }
  }

  // Tüm kategorileri getir
  async getAll(): Promise<Category[]> {
    try {
      let categories = await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_ALL);
      // Getting all categories
        return categories;
      } catch (error) {
      // Get all categories failed
      throw error;
    }
  }

  // Type'a göre kategorileri getir
  async getByType(type: 'expense' | 'income' | 'receivable'): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_BY_TYPE, [type]);
    } catch (error) {
      // Get categories by type failed
      throw error;
    }
  }

  // Varsayılan kategorileri getir
  async getDefault(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_DEFAULT);
    } catch (error) {
      // Get default categories failed
      throw error;
    }
  }

  // Kullanıcı kategorilerini getir
  async getCustom(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_CUSTOM);
    } catch (error) {
      // Get custom categories failed
      throw error;
    }
  }

  // Kategori ara
  async search(query: string): Promise<Category[]> {
    try {
      const searchTerm = `%${query}%`;
      return await databaseService.getAll<Category>(
        CATEGORY_SCRIPTS.SEARCH, 
        [searchTerm, searchTerm]
      );
    } catch (error) {
      // Category search failed
      throw error;
    }
  }

  // Kategori sayısını getir
  async getCount(): Promise<number> {
    try {
      const result = await databaseService.getFirst<{ count: number }>(
        CATEGORY_SCRIPTS.COUNT
      );
      return result?.count || 0;
    } catch (error) {
      // Get category count failed
      throw error;
    }
  }

  // Kategori var mı kontrol et
  async exists(id: string): Promise<boolean> {
    try {
      const result = await databaseService.getFirst<{ count: number }>(
        CATEGORY_SCRIPTS.EXISTS, 
        [id]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      // Check category exists failed
      throw error;
    }
  }

  // Kategori adını al (çeviri key'i veya custom name)
  getDisplayName(category: Category, t: (key: string) => string): string {
    if (category.custom_name) {
      return category.custom_name;
    }
    
    if (category.name_key) {
      return t(category.name_key);
    }
    
    return 'Bilinmeyen Kategori';
  }
}

// Singleton instance
export const categoryService = new CategoryService();
