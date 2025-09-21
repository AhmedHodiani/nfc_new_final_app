import { AppError, NFCScanResult } from '@/src/types';
import { Platform } from 'react-native';

// Conditional import for NFC Manager - handles Expo Go environment
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch (error) {
  console.warn('NFC Manager not available - likely running in Expo Go. NFC features will be disabled.');
}

class NFCService {
  private isInitialized = false;
  private scanTimeout = 5000; // 5 seconds timeout

  /**
   * Initialize NFC Manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if NFC Manager is available
      if (!NfcManager) {
        throw new Error('NFC_NOT_AVAILABLE_IN_EXPO_GO');
      }

      // Check if NFC is supported
      const supported = await NfcManager.isSupported();
      if (!supported) {
        throw new Error('NFC_NOT_SUPPORTED');
      }

      // Start NFC Manager
      await NfcManager.start();
      this.isInitialized = true;
      
      console.log('NFC Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize NFC Manager:', error);
      this.handleNFCError(error);
      return false;
    }
  }

  /**
   * Check if NFC is enabled on the device
   */
  async isEnabled(): Promise<boolean> {
    try {
      if (!NfcManager) {
        return false;
      }
      
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      return await NfcManager.isEnabled();
    } catch (error) {
      console.error('Error checking NFC status:', error);
      return false;
    }
  }

  /**
   * Check if NFC is supported by the device
   */
  async isSupported(): Promise<boolean> {
    try {
      if (!NfcManager) {
        return false;
      }
      return await NfcManager.isSupported();
    } catch (error) {
      console.error('Error checking NFC support:', error);
      return false;
    }
  }

  /**
   * Start scanning for NFC tags
   */
  async startScanning(): Promise<NFCScanResult> {
    try {
      if (!NfcManager) {
        throw new Error('NFC_NOT_AVAILABLE_IN_EXPO_GO');
      }

      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('NFC_NOT_SUPPORTED');
        }
      }

      const isEnabled = await this.isEnabled();
      if (!isEnabled) {
        throw new Error('NFC_DISABLED');
      }

      console.log('Starting NFC scan...');

      // Request NFC technology for both Android and iOS
      const techRequest = Platform.OS === 'android' 
        ? [NfcTech.Ndef, NfcTech.NfcA, NfcTech.NfcB, NfcTech.NfcF, NfcTech.NfcV]
        : [NfcTech.Ndef];

      // Start scanning with timeout
      const tag = await Promise.race([
        NfcManager.requestTechnology(techRequest),
        this.createScanTimeout(),
      ]);

      if (!tag) {
        throw new Error('SCAN_TIMEOUT');
      }

      // Get tag information
      const tagInfo = await NfcManager.getTag();
      console.log('NFC Tag detected:', tagInfo);

      // Extract card ID
      const cardId = await this.extractCardId(tagInfo);
      
      if (!cardId) {
        throw new Error('INVALID_CARD');
      }

      console.log('Extracted card ID:', cardId);

      return {
        success: true,
        cardId,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('NFC scan error:', error);
      return {
        success: false,
        error: this.mapErrorToMessage(error),
        timestamp: Date.now(),
      };
    } finally {
      // Clean up
      await this.stopScanning();
    }
  }

  /**
   * Stop NFC scanning
   */
  async stopScanning(): Promise<void> {
    try {
      if (!NfcManager) {
        console.warn('NFC Manager not available - cannot stop scanning');
        return;
      }
      await NfcManager.cancelTechnologyRequest();
      console.log('NFC scanning stopped');
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  }

  /**
   * Read NDEF data from NFC tag
   */
  async readNdefData(): Promise<string | null> {
    try {
      const tag = await NfcManager.getTag();
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        if (record.payload) {
          // Convert payload to string
          const text = String.fromCharCode.apply(null, Array.from(record.payload));
          return text;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading NDEF data:', error);
      return null;
    }
  }

  /**
   * Write NDEF data to NFC tag (for future use)
   */
  async writeNdefData(text: string): Promise<boolean> {
    try {
      const bytes = Ndef.encodeMessage([Ndef.textRecord(text)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      return true;
    } catch (error) {
      console.error('Error writing NDEF data:', error);
      return false;
    }
  }

  /**
   * Extract card ID from NFC tag data
   */
  private async extractCardId(tagInfo: any): Promise<string | null> {
    try {
      // Try different methods to extract card ID based on the tag type
      
      // Method 1: Use tag ID directly
      if (tagInfo?.id) {
        return this.bytesToHex(tagInfo.id);
      }

      // Method 2: Use UID if available
      if (tagInfo?.uid) {
        return this.bytesToHex(tagInfo.uid);
      }

      // Method 3: Use serial number
      if (tagInfo?.serialNumber) {
        return tagInfo.serialNumber;
      }

      // Method 4: Try to read from NDEF data
      const ndefData = await this.readNdefData();
      if (ndefData) {
        return ndefData;
      }

      // Method 5: Use any available identifier
      if (tagInfo?.maxSize || tagInfo?.type) {
        // Generate ID from available properties
        const identifier = `${tagInfo.type || 'unknown'}_${tagInfo.maxSize || Date.now()}`;
        return identifier;
      }

      return null;
    } catch (error) {
      console.error('Error extracting card ID:', error);
      return null;
    }
  }

  /**
   * Convert byte array to hex string
   */
  private bytesToHex(bytes: number[]): string {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  /**
   * Create a timeout promise for scanning
   */
  private createScanTimeout(): Promise<null> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('SCAN_TIMEOUT'));
      }, this.scanTimeout);
    });
  }

  /**
   * Map error to user-friendly message
   */
  private mapErrorToMessage(error: any): AppError {
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('NFC_NOT_SUPPORTED')) return 'NFC_NOT_SUPPORTED';
    if (errorMessage.includes('NFC_DISABLED')) return 'NFC_DISABLED';
    if (errorMessage.includes('SCAN_TIMEOUT')) return 'SCAN_TIMEOUT';
    if (errorMessage.includes('INVALID_CARD')) return 'INVALID_CARD';
    if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) return 'SCAN_TIMEOUT';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Handle NFC errors
   */
  private handleNFCError(error: any): void {
    const errorType = this.mapErrorToMessage(error);
    console.error(`NFC Error [${errorType}]:`, error);
    
    // Could emit events or trigger callbacks here
    // this.eventEmitter.emit('nfcError', { type: errorType, error });
  }

  /**
   * Get NFC settings intent for Android
   */
  async openNFCSettings(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await NfcManager.goToNfcSetting();
      }
    } catch (error) {
      console.error('Error opening NFC settings:', error);
    }
  }

  /**
   * Set scan timeout
   */
  setScanTimeout(timeout: number): void {
    this.scanTimeout = timeout;
  }

  /**
   * Get current scan timeout
   */
  getScanTimeout(): number {
    return this.scanTimeout;
  }

  /**
   * Clean up NFC resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopScanning();
      if (this.isInitialized) {
        // Note: NfcManager doesn't have a stop method in newer versions
        // await NfcManager.stop();
        this.isInitialized = false;
      }
      console.log('NFC service cleaned up');
    } catch (error) {
      console.error('Error cleaning up NFC service:', error);
    }
  }

  /**
   * Register tag discovered listener (Android only)
   */
  async registerTagEvent(_callback?: (tag: any) => void): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await NfcManager.registerTagEvent({
          invalidateAfterFirstRead: true,
          alertMessage: "ضع الرقاقة بالقرب من الجهاز",
          readerModeDelay: 1000
        });
      }
    } catch (error) {
      console.error('Error registering tag event:', error);
    }
  }

  /**
   * Unregister tag discovered listener
   */
  async unregisterTagEvent(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await NfcManager.unregisterTagEvent();
      }
    } catch (error) {
      console.error('Error unregistering tag event:', error);
    }
  }
}

// Create and export singleton instance
export const nfcService = new NFCService();
export default nfcService;