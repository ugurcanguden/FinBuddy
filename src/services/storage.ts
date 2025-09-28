// Storage Service - AsyncStorage wrapper
import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Generic storage methods
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw new Error(`Failed to save ${key}: ${error}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      throw new Error(`Failed to parse ${key}: ${error}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove ${key}: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new Error(`Failed to get all keys: ${error}`);
    }
  }

  async hasData(): Promise<boolean> {
    const keys = await this.getAllKeys();
    return keys.length > 0;
  }

  // Favori raporlar için metodlar
  async getFavoriteReports(): Promise<string[]> {
    const favorites = await this.get<string[]>('favorite_reports');
    return favorites || [];
  }

  async addFavoriteReport(reportId: string): Promise<void> {
    const favorites = await this.getFavoriteReports();
    if (!favorites.includes(reportId)) {
      favorites.push(reportId);
      await this.set('favorite_reports', favorites);
    }
  }

  async removeFavoriteReport(reportId: string): Promise<void> {
    const favorites = await this.getFavoriteReports();
    const updatedFavorites = favorites.filter(id => id !== reportId);
    await this.set('favorite_reports', updatedFavorites);
  }

  async isFavoriteReport(reportId: string): Promise<boolean> {
    const favorites = await this.getFavoriteReports();
    return favorites.includes(reportId);
  }
}

// Singleton instance
export const storageService = new StorageService();
export default storageService;