/**
 * Storage Service for Techo Propio Module
 * Handles localStorage operations for drafts and preferences
 */

import { ApplicationFormData, ApplicationFilters } from '../types';
import { STORAGE_KEYS } from '../utils';

/**
 * Storage Service Class
 */
class StorageService {
  // ==================== DRAFT MANAGEMENT ====================

  /**
   * Save draft application to localStorage
   */
  saveDraft(data: ApplicationFormData, currentStep: number = 1): void {
    try {
      const draft = {
        data,
        currentStep,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.DRAFT_APPLICATION, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  /**
   * Load draft application from localStorage
   */
  loadDraft(): { data: ApplicationFormData; currentStep: number; savedAt: string } | null {
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.DRAFT_APPLICATION);
      if (draft) {
        return JSON.parse(draft);
      }
      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  clearDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_APPLICATION);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  /**
   * Check if draft exists
   */
  hasDraft(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DRAFT_APPLICATION) !== null;
  }

  // ==================== FILTER MANAGEMENT ====================

  /**
   * Save filters to localStorage
   */
  saveFilters(filters: ApplicationFilters): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  /**
   * Load filters from localStorage
   */
  loadFilters(): ApplicationFilters | null {
    try {
      const filters = localStorage.getItem(STORAGE_KEYS.SAVED_FILTERS);
      if (filters) {
        return JSON.parse(filters);
      }
      return null;
    } catch (error) {
      console.error('Error loading filters:', error);
      return null;
    }
  }

  /**
   * Clear filters from localStorage
   */
  clearFilters(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_FILTERS);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }

  // ==================== USER PREFERENCES ====================

  /**
   * Save user preferences
   */
  savePreferences(preferences: Record<string, any>): void {
    try {
      const current = this.loadPreferences() || {};
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  loadPreferences(): Record<string, any> | null {
    try {
      const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (preferences) {
        return JSON.parse(preferences);
      }
      return null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  }

  /**
   * Get specific preference
   */
  getPreference(key: string, defaultValue?: any): any {
    const preferences = this.loadPreferences();
    return preferences?.[key] ?? defaultValue;
  }

  /**
   * Set specific preference
   */
  setPreference(key: string, value: any): void {
    this.savePreferences({ [key]: value });
  }

  /**
   * Clear all preferences
   */
  clearPreferences(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all Techo Propio data from localStorage
   */
  clearAll(): void {
    this.clearDraft();
    this.clearFilters();
    this.clearPreferences();
  }

  /**
   * Get storage size (approximate)
   */
  getStorageSize(): number {
    try {
      let total = 0;
      for (const key in STORAGE_KEYS) {
        const item = localStorage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
        if (item) {
          total += item.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };
