import { useState, useEffect, useCallback } from 'react';
import { Banquet, GiftRecord } from '@/types';
import { banquetApi, recordApi } from '@/lib/api';

// 类型映射：将 API 响应转为前端类型
function apiBanquetToBanquet(apiBanquet: { id: string; name: string; date: string; location: string; type: string; frozen: boolean; created_at: string }): Banquet {
  return {
    id: apiBanquet.id,
    name: apiBanquet.name,
    date: apiBanquet.date,
    location: apiBanquet.location,
    type: apiBanquet.type as Banquet['type'],
    frozen: apiBanquet.frozen,
    createdAt: apiBanquet.created_at,
  };
}

function apiRecordToRecord(apiRecord: { id: string; banquet_id: string; guest_name: string; amount: number; gifts: string[]; note: string; created_at: string }): GiftRecord {
  return {
    id: apiRecord.id,
    banquetId: apiRecord.banquet_id,
    guestName: apiRecord.guest_name,
    amount: apiRecord.amount,
    gifts: apiRecord.gifts,
    note: apiRecord.note,
    createdAt: apiRecord.created_at,
  };
}

export function useBanquets() {
  const [banquets, setBanquets] = useState<Banquet[]>([]);
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载所有数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBanquets = await banquetApi.list();
      setBanquets(apiBanquets.map(apiBanquetToBanquet));
      // 预加载所有宴会的记录
      const allRecords: GiftRecord[] = [];
      for (const b of apiBanquets) {
        try {
          const apiRecords = await recordApi.list(b.id);
          allRecords.push(...apiRecords.map(apiRecordToRecord));
        } catch {
          // 忽略单个宴会记录加载失败
        }
      }
      setRecords(allRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 宴会操作
  const addBanquet = useCallback(async (b: Omit<Banquet, 'id' | 'createdAt'>) => {
    try {
      const apiBanquet = await banquetApi.create({
        name: b.name,
        date: b.date,
        location: b.location,
        type: b.type,
      });
      const newBanquet = apiBanquetToBanquet(apiBanquet);
      setBanquets(prev => [newBanquet, ...prev]);
      return newBanquet;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建宴会失败');
      throw err;
    }
  }, []);

  const freezeBanquet = useCallback(async (id: string) => {
    try {
      const apiBanquet = await banquetApi.freeze(id);
      const updated = apiBanquetToBanquet(apiBanquet);
      setBanquets(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err) {
      setError(err instanceof Error ? err.message : '归档宴会失败');
      throw err;
    }
  }, []);

  const deleteBanquet = useCallback(async (id: string) => {
    try {
      await banquetApi.delete(id);
      setBanquets(prev => prev.filter(b => b.id !== id));
      setRecords(prev => prev.filter(r => r.banquetId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除宴会失败');
      throw err;
    }
  }, []);

  // 记录操作
  const addRecord = useCallback(async (r: Omit<GiftRecord, 'id' | 'createdAt'>) => {
    try {
      const apiRecord = await recordApi.create(r.banquetId, {
        guest_name: r.guestName,
        amount: r.amount,
        gifts: r.gifts,
        note: r.note,
      });
      const newRecord = apiRecordToRecord(apiRecord);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加记录失败');
      throw err;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      await recordApi.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除记录失败');
      throw err;
    }
  }, []);

  const updateRecord = useCallback(async (updated: GiftRecord) => {
    try {
      const apiRecord = await recordApi.update(updated.id, {
        guest_name: updated.guestName,
        amount: updated.amount,
        gifts: updated.gifts,
        note: updated.note,
      });
      const result = apiRecordToRecord(apiRecord);
      setRecords(prev => prev.map(r => r.id === updated.id ? result : r));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新记录失败');
      throw err;
    }
  }, []);

  const getRecords = useCallback((banquetId: string) => {
    return records.filter(r => r.banquetId === banquetId);
  }, [records]);

  const getBanquet = useCallback((id: string) => {
    return banquets.find(b => b.id === id);
  }, [banquets]);

  return {
    banquets,
    records,
    loading,
    error,
    addBanquet,
    deleteBanquet,
    freezeBanquet,
    addRecord,
    deleteRecord,
    updateRecord,
    getRecords,
    getBanquet,
    reload: loadData,
  };
}
