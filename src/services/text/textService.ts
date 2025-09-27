 
import { TEXT_SCRIPTS } from '@/constants/scripts/textScripts';
import { databaseService } from '../database';

export interface TextInterface {
  id: string;
  title: string;
  content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTextInterfaceData {
  title: string;
  content?: string;
}

export interface UpdateTextInterfaceData {
  title?: string;
  content?: string;
  is_active?: boolean;
}

class TextService {
  // Text ekleme
  async create(data: CreateTextInterfaceData): Promise<TextInterface> {
    const id = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await databaseService.query(TEXT_SCRIPTS.INSERT, [
      id,
      data.title,
      data.content || null,
      true
    ]);

    const text = await this.getById(id);
    if (!text) throw new Error('Text oluşturulamadı');
    
    return text;
  }

  // Text güncelleme
  async update(id: string, data: UpdateTextInterfaceData): Promise<TextInterface> {
    const existingText = await this.getById(id);
    if (!existingText) throw new Error('Text bulunamadı');

    await databaseService.query(TEXT_SCRIPTS.UPDATE, [
      (data.title ?? existingText.title) || '',
      (data.content ?? existingText.content) || '',
      (data.is_active ?? existingText.is_active) || true,
      id
    ]);

    const updatedText = await this.getById(id);
    if (!updatedText) throw new Error('Text güncellenemedi');
    
    return updatedText;
  }

  // Text silme (soft delete)
  async delete(id: string): Promise<void> {
    const text = await this.getById(id);
    if (!text) throw new Error('Text bulunamadı');

    await databaseService.query(TEXT_SCRIPTS.DELETE, [id]);
  }

  // Text getir (ID ile)
  async getById(id: string): Promise<TextInterface | null> {
    const result = await databaseService.getFirst<TextInterface>(TEXT_SCRIPTS.GET_BY_ID, [id]);
    return result;
  }

  // Tüm textleri getir
  async getAll(): Promise<TextInterface[]> {
    return await databaseService.getAll<TextInterface>(TEXT_SCRIPTS.GET_ALL);
  }

  // Text arama
  async search(query: string): Promise<TextInterface[]> {
    const searchQuery = `%${query}%`;
    return await databaseService.getAll<TextInterface>(TEXT_SCRIPTS.SEARCH, [searchQuery, searchQuery]);
  }

  // Text sayısı
  async getCount(): Promise<number> {
    const result = await databaseService.getFirst<{ count: number }>(TEXT_SCRIPTS.COUNT);
    return result?.count || 0;
  }
}

// Singleton instance
export const textService = new TextService();
export default textService;
