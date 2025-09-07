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
}

// Singleton instance
export const storageService = new StorageService();
export default storageService;