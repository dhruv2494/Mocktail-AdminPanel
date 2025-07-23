import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  // Use useRef to store the latest apiCall function to avoid dependency issues
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCallRef.current();
      console.log('useApi received response:', response);
      console.log('useApi setting data to:', response.data);
      setState({
        data: response.data,
        loading: false,
        error: null
      });
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage
      });
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw error;
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    refresh
  };
}

// Specialized hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<ApiResponse<T[]>>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState<T[]>([]);

  const { data, loading, error, execute } = useApi(
    () => apiCall(params),
    {
      immediate: false,
      onSuccess: (newData) => {
        if (params.page === 1) {
          setAllData(newData);
        } else {
          setAllData(prev => [...prev, ...newData]);
        }
      }
    }
  );

  const loadMore = useCallback(() => {
    setParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const refresh = useCallback(() => {
    setParams(prev => ({ ...prev, page: 1 }));
    setAllData([]);
  }, []);

  const updateParams = useCallback((newParams: Partial<typeof params>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
    setAllData([]);
  }, []);

  useEffect(() => {
    execute();
  }, [params, execute]);

  return {
    data: allData,
    loading,
    error,
    params,
    loadMore,
    refresh,
    updateParams
  };
}