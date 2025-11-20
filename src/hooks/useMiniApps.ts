import { useState, useEffect, useCallback } from 'react';
import { MiniApp, MiniAppsResponse } from '../types/miniApp';
import { API_CONFIG } from '../constants/api';

export const useMiniApps = () => {
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async (pageNum: number) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/miniapps?page=${pageNum}&page_size=${API_CONFIG.PAGE_SIZE}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch mini apps');
      }

      const data: MiniAppsResponse = await response.json();
      
      if (data.status === 'success') {
        setApps(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length === API_CONFIG.PAGE_SIZE);
      } else {
        throw new Error(data.message || 'Failed to fetch mini apps');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchApps(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchApps(nextPage);
    }
  }, [page, loading, hasMore, fetchApps]);

  const refresh = useCallback(() => {
    setPage(1);
    setApps([]);
    setHasMore(true);
    fetchApps(1);
  }, [fetchApps]);

  return {
    apps,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};
