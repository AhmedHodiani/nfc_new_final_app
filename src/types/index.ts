// Core data types for the NFC Pilgrim Management App

export interface Pilgrim {
  id: string;
  full_name: string;
  passport_number: string;
  nfc_card_id: string;
  seat_number: number;
  status: 'onboard' | 'offboard';
  phone: string;
  photo: string; // URL to photo file
  date_of_birth: string; // ISO date string
  sex: 'male' | 'female';
  nationality: string;
  created: string; // ISO date string
  updated: string; // ISO date string
}

export interface PilgrimCreate {
  full_name: string;
  passport_number: string;
  nfc_card_id: string;
  seat_number: number;
  status: 'onboard' | 'offboard';
  phone: string;
  photo?: File;
  date_of_birth: string;
  sex: 'male' | 'female';
  nationality: string;
}

export interface PilgrimUpdate {
  id: string;
  status?: 'onboard' | 'offboard';
  seat_number?: number;
  phone?: string;
  full_name?: string;
  passport_number?: string;
  nationality?: string;
}

// NFC related types
export interface NFCScanResult {
  success: boolean;
  cardId?: string;
  error?: string;
  timestamp: number;
}

export interface NFCManager {
  isEnabled: boolean;
  isScanning: boolean;
  lastScanResult?: NFCScanResult;
}

// App state types
export interface AppState {
  pilgrims: Pilgrim[];
  isLoading: boolean;
  error: string | null;
  nfc: NFCManager;
  selectedPilgrim: Pilgrim | null;
  scanningMode: 'idle' | 'onboard' | 'offboard';
  sessionStats: SessionStats;
}

export interface SessionStats {
  totalScanned: number;
  successfulScans: number;
  failedScans: number;
  onboardCount: number;
  offboardCount: number;
  startTime?: number;
  endTime?: number;
}

// UI Component types
export interface PilgrimCardProps {
  pilgrim: Pilgrim;
  onPress?: (pilgrim: Pilgrim) => void;
  showActions?: boolean;
}

export interface StatusBadgeProps {
  status: 'onboard' | 'offboard';
  size?: 'sm' | 'md' | 'lg';
}

export interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}

// API response types
export interface PocketBaseResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface PocketBaseError {
  code: number;
  message: string;
  data?: Record<string, any>;
}

// Search and filter types
export interface SearchFilters {
  query: string;
  status: 'all' | 'onboard' | 'offboard';
  sortBy: 'name' | 'seat' | 'status' | 'updated';
  sortOrder: 'asc' | 'desc';
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  PilgrimList: undefined;
  PilgrimDetail: { pilgrimId: string };
  Scanner: { mode: 'onboard' | 'offboard' };
  Settings: undefined;
};

// Screen props
export interface HomeScreenProps {
  onStartOnboard: () => void;
  onStartOffboard: () => void;
  onViewList: () => void;
  stats: SessionStats;
}

export interface ScannerScreenProps {
  mode: 'onboard' | 'offboard';
  onScanSuccess: (pilgrim: Pilgrim) => void;
  onScanError: (error: string) => void;
  onComplete: () => void;
}

export interface PilgrimListScreenProps {
  pilgrims: Pilgrim[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onPilgrimSelect: (pilgrim: Pilgrim) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
}

export interface RippleAnimation {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

// Error types
export type AppError = 
  | 'NETWORK_ERROR'
  | 'NFC_NOT_SUPPORTED'
  | 'NFC_DISABLED'
  | 'SCAN_TIMEOUT'
  | 'PILGRIM_NOT_FOUND'
  | 'ALREADY_ONBOARD'
  | 'ALREADY_OFFBOARD'
  | 'INVALID_CARD'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorState {
  type: AppError;
  message: string;
  timestamp: number;
  retryable: boolean;
}

// Constants
export const COLORS = {
  primary: {
    50: '#f0f9f1',
    500: '#2D5D31',
    600: '#1f4124',
  },
  secondary: {
    500: '#4A7C59',
  },
  accent: {
    gold: '#D4AF37',
    lightGold: '#F4E4BC',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    neutral: '#6B7280',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    modal: 'rgba(0,0,0,0.5)',
  },
} as const;

export const ANIMATION_DURATIONS = {
  fast: 200,
  medium: 300,
  slow: 500,
} as const;

export const NFC_SCAN_TIMEOUT = 5000;
export const API_TIMEOUT = 10000;