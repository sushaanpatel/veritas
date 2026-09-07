/**
 * useHistory Hook
 * React hook for research history operations
 */

import { useState, useEffect, useCallback } from 'react';
import { historyApi } from '@/lib/api/history';
import type { HistoryItem } from '@/types/research';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await historyApi.getHistory(page, limit);
      setHistory(response.items);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const deleteItem = useCallback(
    async (taskId: string): Promise<boolean> => {
      setError(null);

      try {
        await historyApi.deleteTask(taskId);
        // Reload history after deletion
        await loadHistory();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
        setError(errorMessage);
        return false;
      }
    },
    [loadHistory]
  );

  const refresh = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    page,
    totalPages,
    total,
    limit,
    deleteItem,
    refresh,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
