/**
 * useResearch Hook
 * React hook for research operations
 */

import { useState } from 'react';
import { researchApi } from '@/lib/api/research';
import type {
  ResearchRequest,
  ResearchStartResponse,
  ResearchStatusResponse,
  ResearchReportResponse,
} from '@/types/research';

export function useResearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startResearch = async (
    request: ResearchRequest
  ): Promise<ResearchStartResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await researchApi.startResearch(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start research';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelResearch = async (taskId: string): Promise<boolean> => {
    setError(null);

    try {
      await researchApi.cancelResearch(taskId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel research';
      setError(errorMessage);
      return false;
    }
  };

  const getStatus = async (taskId: string): Promise<ResearchStatusResponse | null> => {
    setError(null);

    try {
      const response = await researchApi.getStatus(taskId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get status';
      setError(errorMessage);
      return null;
    }
  };

  const getReport = async (taskId: string): Promise<ResearchReportResponse | null> => {
    setError(null);

    try {
      const response = await researchApi.getReport(taskId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get report';
      setError(errorMessage);
      return null;
    }
  };

  return {
    startResearch,
    cancelResearch,
    getStatus,
    getReport,
    isLoading,
    error,
  };
}
