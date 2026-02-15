// Custom Hooks for Seller Dashboard

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReturnItem, AnalyticsData, ReturnStatusType, StatusChangeEvent, ConditionStatusType } from '@/types';
import { ReturnService, ReturnEventSystem } from '@/services/returnService';

// Hook for fetching and managing returns list
export function useReturns(initialStatus?: ReturnStatusType) {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReturnStatusType | 'all'>(initialStatus || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await ReturnService.getReturns({
      status: filter === 'all' ? undefined : filter,
      search: searchQuery || undefined,
    });
    
    if (result.success && result.data) {
      setReturns(result.data.returns);
    } else {
      setError(result.error || 'Failed to fetch returns');
    }
    
    setLoading(false);
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = ReturnEventSystem.subscribe('status:changed', (event: StatusChangeEvent) => {
      setReturns(prev => prev.map(ret => {
        if (ret.return_id === event.return_id) {
          return { ...ret, status: event.new_status, updated_at: event.timestamp };
        }
        return ret;
      }));
    });

    return unsubscribe;
  }, []);

  const filteredReturns = returns.filter(ret => {
    if (filter !== 'all' && ret.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ret.return_id.toLowerCase().includes(query) ||
        ret.product_name.toLowerCase().includes(query) ||
        ret.order_id.toLowerCase().includes(query) ||
        ret.dropoff_store_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return {
    returns: filteredReturns,
    allReturns: returns,
    loading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refresh: fetchReturns,
  };
}

// Hook for single return operations
export function useReturn(returnId: string) {
  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchReturn = useCallback(async () => {
    setLoading(true);
    const result = await ReturnService.getReturn(returnId);
    if (result.success && result.data) {
      setReturnItem(result.data);
    }
    setLoading(false);
  }, [returnId]);

  useEffect(() => {
    fetchReturn();
  }, [fetchReturn]);

  // Subscribe to real-time updates for this return
  useEffect(() => {
    const unsubscribe = ReturnEventSystem.subscribeToReturn(returnId, (event: StatusChangeEvent) => {
      setReturnItem(prev => prev ? { ...prev, status: event.new_status, updated_at: event.timestamp } : null);
    });

    return unsubscribe;
  }, [returnId]);

  const updateStatus = async (action: string, ...args: unknown[]) => {
    setUpdating(true);
    let result;
    
    switch (action) {
      case 'mark_received':
        result = await ReturnService.markAsReceived(returnId);
        break;
      case 'mark_verified':
        result = await ReturnService.markAsVerified(returnId, args[0] as ConditionStatusType);
        break;
      case 'approve_refund':
        result = await ReturnService.approveRefund(returnId);
        break;
      case 'reject_refund':
        result = await ReturnService.rejectRefund(returnId, args[0] as string);
        break;
      case 'flag_fraud':
        result = await ReturnService.flagFraud(returnId, args[0] as string);
        break;
      default:
        result = { success: false, error: 'Unknown action', timestamp: new Date().toISOString() };
    }

    if (result.success && result.data) {
      setReturnItem(result.data);
    }
    
    setUpdating(false);
    return result;
  };

  return {
    returnItem,
    loading,
    updating,
    refresh: fetchReturn,
    updateStatus,
  };
}

// Hook for analytics data
export function useAnalytics(refreshInterval = 30000) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalytics = useCallback(async () => {
    const result = await ReturnService.getAnalytics();
    if (result.success && result.data) {
      setAnalytics(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    intervalRef.current = setInterval(fetchAnalytics, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAnalytics, refreshInterval]);

  return { analytics, loading, refresh: fetchAnalytics };
}

// Hook for auto-refresh
export function useAutoRefresh(callback: () => void, interval = 10000) {
  useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval]);
}
