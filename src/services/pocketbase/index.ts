import { Pilgrim, PilgrimCreate, PilgrimUpdate, PocketBaseError } from '@/src/types';
import PocketBase from 'pocketbase';

// PocketBase client configuration
const POCKETBASE_URL = 'https://ahmedb.qb4.tech';
const COLLECTION_NAME = 'pilgrims';

class PocketBaseService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);
    // No authentication required as per requirements
  }

  /**
   * Get all pilgrims from the database
   */
  async getAllPilgrims(): Promise<Pilgrim[]> {
    try {
      const response = await this.pb.collection(COLLECTION_NAME).getFullList<Pilgrim>({
        sort: 'created',
      });
      return response;
    } catch (error) {
      console.error('Error fetching pilgrims:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get paginated pilgrims with optional filters
   */
  async getPilgrims(page = 1, perPage = 50, filter?: string): Promise<{
    items: Pilgrim[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      const response = await this.pb.collection(COLLECTION_NAME).getList<Pilgrim>(page, perPage, {
        sort: '-updated',
        filter: filter || '',
      });
      
      return {
        items: response.items,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
      };
    } catch (error) {
      console.error('Error fetching paginated pilgrims:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single pilgrim by ID
   */
  async getPilgrimById(id: string): Promise<Pilgrim> {
    try {
      const pilgrim = await this.pb.collection(COLLECTION_NAME).getOne<Pilgrim>(id);
      return pilgrim;
    } catch (error) {
      console.error('Error fetching pilgrim by ID:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Find pilgrim by NFC card ID
   */
  async getPilgrimByNfcId(nfcCardId: string): Promise<Pilgrim | null> {
    try {
      const response = await this.pb.collection(COLLECTION_NAME).getFirstListItem<Pilgrim>(
        `nfc_card_id="${nfcCardId}"`
      );
      return response;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching pilgrim by NFC ID:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search pilgrims by name or passport number
   */
  async searchPilgrims(query: string): Promise<Pilgrim[]> {
    try {
      const filter = `full_name ~ "${query}" || passport_number ~ "${query}"`;
      const response = await this.pb.collection(COLLECTION_NAME).getFullList<Pilgrim>({
        filter,
        sort: 'full_name',
      });
      return response;
    } catch (error) {
      console.error('Error searching pilgrims:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Filter pilgrims by status
   */
  async getPilgrimsByStatus(status: 'onboard' | 'offboard' | 'all'): Promise<Pilgrim[]> {
    try {
      const filter = status === 'all' ? '' : `status="${status}"`;
      const response = await this.pb.collection(COLLECTION_NAME).getFullList<Pilgrim>({
        filter,
        sort: 'seat_number',
      });
      return response;
    } catch (error) {
      console.error('Error filtering pilgrims by status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new pilgrim record
   */
  async createPilgrim(pilgrimData: PilgrimCreate): Promise<Pilgrim> {
    try {
      const pilgrim = await this.pb.collection(COLLECTION_NAME).create<Pilgrim>(pilgrimData);
      return pilgrim;
    } catch (error) {
      console.error('Error creating pilgrim:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update pilgrim status (main use case for NFC scanning)
   */
  async updatePilgrimStatus(id: string, status: 'onboard' | 'offboard'): Promise<Pilgrim> {
    try {
      const updateData: Partial<PilgrimUpdate> = {
        status,
      };
      
      const pilgrim = await this.pb.collection(COLLECTION_NAME).update<Pilgrim>(id, updateData);
      return pilgrim;
    } catch (error) {
      console.error('Error updating pilgrim status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update pilgrim information
   */
  async updatePilgrim(id: string, updateData: Partial<PilgrimUpdate>): Promise<Pilgrim> {
    try {
      const pilgrim = await this.pb.collection(COLLECTION_NAME).update<Pilgrim>(id, updateData);
      return pilgrim;
    } catch (error) {
      console.error('Error updating pilgrim:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a pilgrim record
   */
  async deletePilgrim(id: string): Promise<boolean> {
    try {
      await this.pb.collection(COLLECTION_NAME).delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting pilgrim:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pilgrims statistics
   */
  async getPilgrimsStats(): Promise<{
    total: number;
    onboard: number;
    offboard: number;
  }> {
    try {
      const [total, onboard, offboard] = await Promise.all([
        this.pb.collection(COLLECTION_NAME).getFullList({ fields: 'id' }),
        this.pb.collection(COLLECTION_NAME).getFullList({ 
          filter: 'status="onboard"',
          fields: 'id'
        }),
        this.pb.collection(COLLECTION_NAME).getFullList({ 
          filter: 'status="offboard"',
          fields: 'id'
        }),
      ]);

      return {
        total: total.length,
        onboard: onboard.length,
        offboard: offboard.length,
      };
    } catch (error) {
      console.error('Error fetching pilgrim stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to real-time updates for pilgrims collection
   */
  subscribeToPilgrims(callback: (data: { action: string; record: Pilgrim }) => void) {
    return this.pb.collection(COLLECTION_NAME).subscribe('*', callback);
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromPilgrims() {
    this.pb.collection(COLLECTION_NAME).unsubscribe();
  }

  /**
   * Check if PocketBase is connected
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch (error) {
      console.error('PocketBase connection check failed:', error);
      return false;
    }
  }

  /**
   * Handle and normalize errors from PocketBase
   */
  private handleError(error: any): PocketBaseError {
    if (error?.status) {
      return {
        code: error.status,
        message: error.message || 'An error occurred',
        data: error.data,
      };
    }

    // Network or other errors
    return {
      code: 0,
      message: error?.message || 'Network error occurred',
      data: error,
    };
  }

  /**
   * Check if error is a "not found" error
   */
  private isNotFoundError(error: any): boolean {
    return error?.status === 404;
  }

  /**
   * Get photo URL for a pilgrim
   */
  getPhotoUrl(pilgrim: Pilgrim, filename?: string): string {
    if (!filename && !pilgrim.photo) {
      return '';
    }
    
    const photoFile = filename || pilgrim.photo;
    return this.pb.files.getUrl(pilgrim, photoFile);
  }

  /**
   * Upload photo for a pilgrim
   */
  async uploadPilgrimPhoto(pilgrimId: string, photoFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const updatedPilgrim = await this.pb.collection(COLLECTION_NAME).update<Pilgrim>(
        pilgrimId, 
        formData
      );
      
      return this.getPhotoUrl(updatedPilgrim);
    } catch (error) {
      console.error('Error uploading pilgrim photo:', error);
      throw this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const pocketbaseService = new PocketBaseService();
export default pocketbaseService;