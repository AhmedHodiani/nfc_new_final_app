import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pocketbaseService } from '../services/pocketbase';
import { Pilgrim, SearchFilters } from '../types';

// Query keys
export const queryKeys = {
  pilgrims: ['pilgrims'] as const,
  pilgrim: (id: string) => ['pilgrims', id] as const,
  pilgrimByNfc: (nfcId: string) => ['pilgrims', 'nfc', nfcId] as const,
  pilgrimsSearch: (query: string) => ['pilgrims', 'search', query] as const,
  pilgrimsFilter: (filters: SearchFilters) => ['pilgrims', 'filter', filters] as const,
  pilgrimsStats: ['pilgrims', 'stats'] as const,
};

// Pilgrims queries
export const usePilgrims = () => {
  return useQuery({
    queryKey: queryKeys.pilgrims,
    queryFn: () => pocketbaseService.getAllPilgrims(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePilgrim = (id: string) => {
  return useQuery({
    queryKey: queryKeys.pilgrim(id),
    queryFn: () => pocketbaseService.getPilgrimById(id),
    enabled: !!id,
  });
};

export const usePilgrimByNfc = (nfcId: string) => {
  return useQuery({
    queryKey: queryKeys.pilgrimByNfc(nfcId),
    queryFn: () => pocketbaseService.getPilgrimByNfcId(nfcId),
    enabled: !!nfcId,
    staleTime: 0, // Always fetch fresh data for NFC scans
  });
};

export const useSearchPilgrims = (query: string) => {
  return useQuery({
    queryKey: queryKeys.pilgrimsSearch(query),
    queryFn: () => pocketbaseService.searchPilgrims(query),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePilgrimsStats = () => {
  return useQuery({
    queryKey: queryKeys.pilgrimsStats,
    queryFn: () => pocketbaseService.getPilgrimsStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Pilgrims mutations
export const useUpdatePilgrimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'onboard' | 'offboard' }) =>
      pocketbaseService.updatePilgrimStatus(id, status),
    onSuccess: (updatedPilgrim) => {
      // Update the individual pilgrim cache
      queryClient.setQueryData(
        queryKeys.pilgrim(updatedPilgrim.id),
        updatedPilgrim
      );

      // Update the pilgrims list cache
      queryClient.setQueryData(
        queryKeys.pilgrims,
        (oldPilgrims: Pilgrim[] | undefined) => {
          if (!oldPilgrims) return [updatedPilgrim];
          
          return oldPilgrims.map((pilgrim) =>
            pilgrim.id === updatedPilgrim.id ? updatedPilgrim : pilgrim
          );
        }
      );

      // Invalidate stats to get fresh counts
      queryClient.invalidateQueries({ queryKey: queryKeys.pilgrimsStats });

      // Invalidate search and filter queries
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'search'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'filter'],
        exact: false 
      });
    },
    onError: (error) => {
      console.error('Failed to update pilgrim status:', error);
    },
  });
};

export const useCreatePilgrim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pocketbaseService.createPilgrim,
    onSuccess: (newPilgrim) => {
      // Add to the pilgrims list cache
      queryClient.setQueryData(
        queryKeys.pilgrims,
        (oldPilgrims: Pilgrim[] | undefined) => {
          if (!oldPilgrims) return [newPilgrim];
          return [...oldPilgrims, newPilgrim];
        }
      );

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.pilgrimsStats });
    },
    onError: (error) => {
      console.error('Failed to create pilgrim:', error);
    },
  });
};

export const useUpdatePilgrim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pilgrim> }) =>
      pocketbaseService.updatePilgrim(id, data),
    onSuccess: (updatedPilgrim) => {
      // Update caches similar to status update
      queryClient.setQueryData(
        queryKeys.pilgrim(updatedPilgrim.id),
        updatedPilgrim
      );

      queryClient.setQueryData(
        queryKeys.pilgrims,
        (oldPilgrims: Pilgrim[] | undefined) => {
          if (!oldPilgrims) return [updatedPilgrim];
          
          return oldPilgrims.map((pilgrim) =>
            pilgrim.id === updatedPilgrim.id ? updatedPilgrim : pilgrim
          );
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'search'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'filter'],
        exact: false 
      });
    },
    onError: (error) => {
      console.error('Failed to update pilgrim:', error);
    },
  });
};

export const useDeletePilgrim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pocketbaseService.deletePilgrim(id),
    onSuccess: (_, deletedId) => {
      // Remove from pilgrims list cache
      queryClient.setQueryData(
        queryKeys.pilgrims,
        (oldPilgrims: Pilgrim[] | undefined) => {
          if (!oldPilgrims) return [];
          return oldPilgrims.filter((pilgrim) => pilgrim.id !== deletedId);
        }
      );

      // Remove individual pilgrim cache
      queryClient.removeQueries({ queryKey: queryKeys.pilgrim(deletedId) });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.pilgrimsStats });

      // Invalidate search and filter queries
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'search'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pilgrims', 'filter'],
        exact: false 
      });
    },
    onError: (error) => {
      console.error('Failed to delete pilgrim:', error);
    },
  });
};

// Utility hooks
export const useInvalidatePilgrims = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pilgrims });
    queryClient.invalidateQueries({ queryKey: queryKeys.pilgrimsStats });
  };
};

export const useRefreshPilgrims = () => {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.refetchQueries({ queryKey: queryKeys.pilgrims });
  };
};