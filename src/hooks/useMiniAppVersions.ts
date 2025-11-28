import { useState, useEffect, useCallback } from 'react';
import { MiniAppVersion, VersionsResponse } from '../types/miniApp';
import { API_CONFIG } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export const useMiniAppVersions = (miniappId: number) => {
  const [versions, setVersions] = useState<MiniAppVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authToken } = useAuth();

  const fetchVersions = useCallback(async () => {
    if (!miniappId) return;
    
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Flic-Token'] = authToken;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/miniapps/${miniappId}/versions`,
        {
          method: 'GET',
          headers,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch mini app versions: ${response.status} ${errorText}`);
      }

      const data: VersionsResponse = await response.json();
      
      if (data.status === 'success') {
        setVersions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch mini app versions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [miniappId, authToken]);

  useEffect(() => {
    if (miniappId) {
      fetchVersions();
    } else {
      // Reset state when miniappId is invalid
      setVersions([]);
      setError(null);
      setLoading(false);
    }
  }, [miniappId, fetchVersions]);

  return {
    versions,
    loading,
    error,
    refresh: fetchVersions,
  };
};

