/**
 * StorageService - Singleton service for localStorage operations
 * Provides error handling, quota management, and storage utilities
 */
export class StorageService {
  private static instance: StorageService;
  private static readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80% of quota

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Saves data to localStorage with quota handling
   * @param key - The storage key
   * @param value - The value to store
   * @throws Error if quota is exceeded or storage fails
   */
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);

      // Check if this will exceed quota
      this.checkQuota(serialized.length);

      localStorage.setItem(key, serialized);
    } catch (error) {
      // Handle QuotaExceededError specifically
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error(
          `Storage quota exceeded. Please export your data and clear old records. Current usage: ${this.getStorageSizeInMB()}MB`
        );
      }
      throw new Error(`Failed to save ${key} to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves data from localStorage
   * @param key - The storage key
   * @returns The parsed value or null if not found/invalid
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * Removes a key from localStorage
   * @param key - The storage key to remove
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Silent fail for remove operations
    }
  }

  /**
   * Clears all localStorage data
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      // Silent fail for clear operations
    }
  }

  /**
   * Gets the total size of localStorage in bytes
   * @returns Total storage size in bytes
   */
  getStorageSize(): number {
    let total = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          const value = localStorage[key];
          if (value) {
            total += value.length + key.length;
          }
        }
      }
    } catch (error) {
      // Return 0 if we can't calculate
    }
    return total;
  }

  /**
   * Gets the storage size in MB
   * @returns Storage size formatted as MB string
   */
  getStorageSizeInMB(): string {
    return (this.getStorageSize() / 1024 / 1024).toFixed(2);
  }

  /**
   * Checks if adding data would exceed quota
   * @param additionalSize - Size in bytes to be added
   * @throws Warning if approaching quota limit
   */
  private checkQuota(additionalSize: number): void {
    const currentSize = this.getStorageSize();
    const estimatedTotal = currentSize + additionalSize;
    const estimatedQuota = 5 * 1024 * 1024; // Assume 5MB quota (common minimum)

    if (estimatedTotal > estimatedQuota * StorageService.QUOTA_WARNING_THRESHOLD) {
      console.warn(
        `Warning: localStorage is at ${((estimatedTotal / estimatedQuota) * 100).toFixed(1)}% capacity. Consider exporting and clearing old data.`
      );
    }
  }

  /**
   * Exports all app data as JSON
   * @returns Object containing all app data
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    const appKeys = [
      'zero-invoice-customers',
      'zero-invoice-items',
      'zero-invoice-invoices',
      'zero-invoice-templates',
      'zero-invoice-darkmode',
    ];

    appKeys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Imports app data from JSON
   * @param data - The data object to import
   * @param overwrite - Whether to overwrite existing data
   */
  importData(data: Record<string, any>, overwrite: boolean = false): void {
    Object.entries(data).forEach(([key, value]) => {
      if (overwrite || !localStorage.getItem(key)) {
        this.set(key, value);
      }
    });
  }
}

export const storageService = StorageService.getInstance();
