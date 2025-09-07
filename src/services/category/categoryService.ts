// Category Service - Kategori yönetimi
import { databaseService } from '../database';
import { CATEGORY_SCRIPTS } from '@/constants/scripts';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types';

class CategoryService {
  // Veritabanını başlat ve varsayılan kategorileri ekle
  async initialize(): Promise<void> {
    try {
      // Eski categories tablosu var mı kontrol et
      const tableExists = await databaseService.tableExists('categories');
      
      if (tableExists) {
        // Eski tabloyu sil ve yeniden oluştur
        console.log('🔄 Recreating categories table with new schema...');
        await databaseService.dropTable('categories');
      }
      
      // Kategori tablosunu oluştur
      await databaseService.query(CATEGORY_SCRIPTS.CREATE_TABLE);
      
      // Varsayılan kategorileri ekle
      await databaseService.query(CATEGORY_SCRIPTS.INSERT_DEFAULT_CATEGORIES);
      
      console.log('✅ Category service initialized successfully');
    } catch (error) {
      console.error('❌ Category service initialization failed:', error);
      throw error;
    }
  }

  // Yeni kategori oluştur
  async create(data: CreateCategoryData): Promise<Category> {
    try {
      const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await databaseService.query(CATEGORY_SCRIPTS.INSERT, [
        id,
        null, // name_key = null (kullanıcı kategorisi için)
        data.custom_name || null,
        data.icon,
        data.color,
        0 // is_default = false (kullanıcı kategorisi)
      ]);

      const category = await this.getById(id);
      if (!category) {
        throw new Error('Kategori oluşturulduktan sonra bulunamadı');
      }

      return category;
    } catch (error) {
      console.error('❌ Category creation failed:', error);
      throw error;
    }
  }

  // Kategori güncelle
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      await databaseService.query(CATEGORY_SCRIPTS.UPDATE, [
        null, // name_key = null (kullanıcı kategorisi için)
        data.custom_name || null,
        data.icon,
        data.color,
        id
      ]);

      const category = await this.getById(id);
      if (!category) {
        throw new Error('Kategori güncellendikten sonra bulunamadı');
      }

      return category;
    } catch (error) {
      console.error('❌ Category update failed:', error);
      throw error;
    }
  }

  // Kategori sil (soft delete)
  async delete(id: string): Promise<void> {
    try {
      await databaseService.query(CATEGORY_SCRIPTS.DELETE, [id]);
      console.log(`✅ Category ${id} deleted successfully`);
    } catch (error) {
      console.error('❌ Category deletion failed:', error);
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
      console.error('❌ Get category by ID failed:', error);
      throw error;
    }
  }

  // Tüm kategorileri getir
  async getAll(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_ALL);
    } catch (error) {
      console.error('❌ Get all categories failed:', error);
      throw error;
    }
  }

  // Varsayılan kategorileri getir
  async getDefault(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_DEFAULT);
    } catch (error) {
      console.error('❌ Get default categories failed:', error);
      throw error;
    }
  }

  // Kullanıcı kategorilerini getir
  async getCustom(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>(CATEGORY_SCRIPTS.GET_CUSTOM);
    } catch (error) {
      console.error('❌ Get custom categories failed:', error);
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
      console.error('❌ Category search failed:', error);
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
      console.error('❌ Get category count failed:', error);
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
      console.error('❌ Check category exists failed:', error);
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
