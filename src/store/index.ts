import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Pilgrim, AppState, SessionStats, SearchFilters } from '../types';
import { pocketbaseService } from '../services/pocketbase';
import { nfcService } from '../services/nfc';

interface AppStore extends AppState {
  // Pilgrim actions
  fetchPilgrims: () => Promise<void>;
  searchPilgrims: (query: string) => Promise<void>;
  filterPilgrims: (filters: SearchFilters) => Promise<void>;
  selectPilgrim: (pilgrim: Pilgrim | null) => void;
  updatePilgrimStatus: (pilgrimId: string, status: 'onboard' | 'offboard') => Promise<Pilgrim>;
  refreshPilgrims: () => Promise<void>;
  
  // NFC actions
  initializeNFC: () => Promise<boolean>;
  startScanning: (mode: 'onboard' | 'offboard') => Promise<void>;
  stopScanning: () => Promise<void>;
  processScan: (cardId: string) => Promise<void>;
  
  // Session actions
  startSession: (mode: 'onboard' | 'offboard') => void;
  endSession: () => void;
  resetSession: () => void;
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  
  // Utility actions
  reset: () => void;
  mapErrorMessage: (errorCode: string) => string;
}

const initialState: AppState = {
  pilgrims: [],
  isLoading: false,
  error: null,
  nfc: {
    isEnabled: false,
    isScanning: false,
    lastScanResult: undefined,
  },
  selectedPilgrim: null,
  scanningMode: 'idle',
  sessionStats: {
    totalScanned: 0,
    successfulScans: 0,
    failedScans: 0,
    onboardCount: 0,
    offboardCount: 0,
  },
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Pilgrim actions
        fetchPilgrims: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const pilgrims = await pocketbaseService.getAllPilgrims();
            set((state) => {
              state.pilgrims = pilgrims;
              state.isLoading = false;
            });
          } catch (error: any) {
            console.error('Error fetching pilgrims:', error);
            set((state) => {
              state.error = error.message || 'Failed to fetch pilgrims';
              state.isLoading = false;
            });
          }
        },

        searchPilgrims: async (query: string) => {
          if (!query.trim()) {
            get().fetchPilgrims();
            return;
          }

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const pilgrims = await pocketbaseService.searchPilgrims(query);
            set((state) => {
              state.pilgrims = pilgrims;
              state.isLoading = false;
            });
          } catch (error: any) {
            console.error('Error searching pilgrims:', error);
            set((state) => {
              state.error = error.message || 'Failed to search pilgrims';
              state.isLoading = false;
            });
          }
        },

        filterPilgrims: async (filters: SearchFilters) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            let pilgrims: Pilgrim[] = [];

            if (filters.query.trim()) {
              pilgrims = await pocketbaseService.searchPilgrims(filters.query);
            } else {
              pilgrims = await pocketbaseService.getPilgrimsByStatus(filters.status);
            }

            // Apply sorting
            pilgrims.sort((a, b) => {
              let comparison = 0;
              
              switch (filters.sortBy) {
                case 'name':
                  comparison = a.full_name.localeCompare(b.full_name, 'ar');
                  break;
                case 'seat':
                  comparison = a.seat_number - b.seat_number;
                  break;
                case 'status':
                  comparison = a.status.localeCompare(b.status);
                  break;
                case 'updated':
                  comparison = new Date(a.updated).getTime() - new Date(b.updated).getTime();
                  break;
              }

              return filters.sortOrder === 'desc' ? -comparison : comparison;
            });

            set((state) => {
              state.pilgrims = pilgrims;
              state.isLoading = false;
            });
          } catch (error: any) {
            console.error('Error filtering pilgrims:', error);
            set((state) => {
              state.error = error.message || 'Failed to filter pilgrims';
              state.isLoading = false;
            });
          }
        },

        selectPilgrim: (pilgrim: Pilgrim | null) => {
          set((state) => {
            state.selectedPilgrim = pilgrim;
          });
        },

        updatePilgrimStatus: async (pilgrimId: string, status: 'onboard' | 'offboard') => {
          try {
            const updatedPilgrim = await pocketbaseService.updatePilgrimStatus(pilgrimId, status);
            
            set((state) => {
              const index = state.pilgrims.findIndex((p: Pilgrim) => p.id === pilgrimId);
              if (index !== -1) {
                state.pilgrims[index] = updatedPilgrim;
              }
              
              // Update session stats
              if (status === 'onboard') {
                state.sessionStats.onboardCount++;
              } else {
                state.sessionStats.offboardCount++;
              }
              state.sessionStats.successfulScans++;
              state.sessionStats.totalScanned++;
            });

            return updatedPilgrim;
          } catch (error: any) {
            console.error('Error updating pilgrim status:', error);
            set((state) => {
              state.error = error.message || 'Failed to update pilgrim status';
              state.sessionStats.failedScans++;
              state.sessionStats.totalScanned++;
            });
            throw error;
          }
        },

        refreshPilgrims: async () => {
          await get().fetchPilgrims();
        },

        // NFC actions
        initializeNFC: async () => {
          try {
            const initialized = await nfcService.initialize();
            const isEnabled = await nfcService.isEnabled();
            
            set((state) => {
              state.nfc.isEnabled = isEnabled;
            });

            return initialized && isEnabled;
          } catch (error: any) {
            console.error('Error initializing NFC:', error);
            set((state) => {
              state.error = 'Failed to initialize NFC';
              state.nfc.isEnabled = false;
            });
            return false;
          }
        },

        startScanning: async (mode: 'onboard' | 'offboard') => {
          set((state) => {
            state.scanningMode = mode;
            state.nfc.isScanning = true;
            state.error = null;
          });

          try {
            const scanResult = await nfcService.startScanning();
            
            set((state) => {
              state.nfc.lastScanResult = scanResult;
              state.nfc.isScanning = false;
            });

            if (scanResult.success && scanResult.cardId) {
              await get().processScan(scanResult.cardId);
            } else {
              throw new Error(scanResult.error || 'Scan failed');
            }
          } catch (error: any) {
            console.error('Error during scanning:', error);
            set((state) => {
              state.nfc.isScanning = false;
              state.error = error.message || 'Scanning failed';
              state.sessionStats.failedScans++;
              state.sessionStats.totalScanned++;
            });
          }
        },

        stopScanning: async () => {
          await nfcService.stopScanning();
          set((state) => {
            state.nfc.isScanning = false;
            state.scanningMode = 'idle';
          });
        },

        processScan: async (cardId: string) => {
          try {
            // Find pilgrim by NFC card ID
            const pilgrim = await pocketbaseService.getPilgrimByNfcId(cardId);
            
            if (!pilgrim) {
              throw new Error('PILGRIM_NOT_FOUND');
            }

            const { scanningMode } = get();
            const newStatus = scanningMode as 'onboard' | 'offboard';

            // Validate status change
            if (newStatus === 'onboard' && pilgrim.status === 'onboard') {
              throw new Error('ALREADY_ONBOARD');
            }
            if (newStatus === 'offboard' && pilgrim.status === 'offboard') {
              throw new Error('ALREADY_OFFBOARD');
            }

            // Update pilgrim status
            await get().updatePilgrimStatus(pilgrim.id, newStatus);
            
            // Select pilgrim to show details
            set((state) => {
              state.selectedPilgrim = pilgrim;
            });

          } catch (error: any) {
            console.error('Error processing scan:', error);
            
            const errorMessage = get().mapErrorMessage(error.message);
            set((state) => {
              state.error = errorMessage;
              state.sessionStats.failedScans++;
              state.sessionStats.totalScanned++;
            });
            throw error;
          }
        },

        // Session actions
        startSession: (mode: 'onboard' | 'offboard') => {
          set((state) => {
            state.scanningMode = mode;
            state.sessionStats = {
              totalScanned: 0,
              successfulScans: 0,
              failedScans: 0,
              onboardCount: 0,
              offboardCount: 0,
              startTime: Date.now(),
            };
          });
        },

        endSession: () => {
          set((state) => {
            state.scanningMode = 'idle';
            state.sessionStats.endTime = Date.now();
            state.nfc.isScanning = false;
          });
        },

        resetSession: () => {
          set((state) => {
            state.sessionStats = {
              totalScanned: 0,
              successfulScans: 0,
              failedScans: 0,
              onboardCount: 0,
              offboardCount: 0,
            };
            state.scanningMode = 'idle';
            state.nfc.isScanning = false;
            state.selectedPilgrim = null;
          });
        },

        updateSessionStats: (stats: Partial<SessionStats>) => {
          set((state) => {
            Object.assign(state.sessionStats, stats);
          });
        },

        // Error handling
        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Loading states
        setLoading: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        // Utility actions
        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },

        // Helper method to map error messages
        mapErrorMessage: (errorCode: string): string => {
          const errorMap: Record<string, string> = {
            'PILGRIM_NOT_FOUND': 'لم يتم العثور على الحاج',
            'ALREADY_ONBOARD': 'الحاج على متن الحافلة بالفعل',
            'ALREADY_OFFBOARD': 'الحاج خارج الحافلة بالفعل',
            'NFC_NOT_SUPPORTED': 'الجهاز لا يدعم NFC',
            'NFC_DISABLED': 'NFC غير مفعل',
            'SCAN_TIMEOUT': 'انتهت مهلة المسح',
            'INVALID_CARD': 'رقاقة غير صالحة',
            'NETWORK_ERROR': 'خطأ في الاتصال بالشبكة',
            'SERVER_ERROR': 'خطأ في الخادم',
          };

          return errorMap[errorCode] || 'خطأ غير معروف';
        },
      })),
      {
        name: 'pilgrim-app-store',
        partialize: (state) => ({
          sessionStats: state.sessionStats,
          // Don't persist pilgrims data to ensure fresh data on app start
        }),
      }
    ),
    {
      name: 'pilgrim-app-store',
    }
  )
);

export default useAppStore;