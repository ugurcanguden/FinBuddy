// useCategories Hook - Kategori yönetimi
import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/models';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  getCategoriesByType: (type: 'expense' | 'income' | 'receivable') => Promise<Category[]>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Promise<Category | null>;
  searchCategories: (query: string) => Promise<Category[]>;
  getDisplayName: (category: Category, t: (key: string) => string) => string;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Kategorileri yenile
  const refreshCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const allCategories = await categoryService.getAll();
      setCategories(allCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategoriler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('❌ Refresh categories failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Type'a göre kategorileri getir
  const getCategoriesByType = useCallback(async (type: 'expense' | 'income' | 'receivable'): Promise<Category[]> => {
    try {
      setError(null);
      return await categoryService.getByType(type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategoriler getirilirken hata oluştu';
      setError(errorMessage);
      console.error('❌ Get categories by type failed:', err);
      throw err;
    }
  }, []);

  // Yeni kategori oluştur
  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category> => {
    try {
      setError(null);
      
      const newCategory = await categoryService.create(data);
      
      // Kategorileri yenile
      await refreshCategories();
      
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori oluşturulurken hata oluştu';
      setError(errorMessage);
      console.error('❌ Create category failed:', err);
      throw err;
    }
  }, [refreshCategories]);

  // Kategori güncelle
  const updateCategory = useCallback(async (id: string, data: UpdateCategoryData): Promise<Category> => {
    try {
      setError(null);
      
      const updatedCategory = await categoryService.update(id, data);
      
      // Kategorileri yenile
      await refreshCategories();
      
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori güncellenirken hata oluştu';
      setError(errorMessage);
      console.error('❌ Update category failed:', err);
      throw err;
    }
  }, [refreshCategories]);

  // Kategori sil
  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await categoryService.delete(id);
      
      // Kategorileri yenile
      await refreshCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori silinirken hata oluştu';
      setError(errorMessage);
      console.error('❌ Delete category failed:', err);
      throw err;
    }
  }, [refreshCategories]);

  // ID ile kategori getir
  const getCategoryById = useCallback(async (id: string): Promise<Category | null> => {
    try {
      setError(null);
      return await categoryService.getById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori getirilirken hata oluştu';
      setError(errorMessage);
      console.error('❌ Get category by ID failed:', err);
      throw err;
    }
  }, []);

  // Kategori ara
  const searchCategories = useCallback(async (query: string): Promise<Category[]> => {
    try {
      setError(null);
      return await categoryService.search(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kategori arama sırasında hata oluştu';
      setError(errorMessage);
      console.error('❌ Search categories failed:', err);
      throw err;
    }
  }, []);

  // Kategori görüntüleme adını al
  const getDisplayName = useCallback((category: Category, t: (key: string) => string): string => {
    return categoryService.getDisplayName(category, t);
  }, []);

  // İlk yükleme
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories,
    getCategoriesByType,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    searchCategories,
    getDisplayName,
  };
};
