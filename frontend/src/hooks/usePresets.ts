import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_GIFTS = 'gift_presets';
const STORAGE_KEY_AMOUNTS = 'amount_presets';

const DEFAULT_GIFTS = ['火炮', '酒', '杂糖', '白糖', '烟花', '面'];
const DEFAULT_AMOUNTS = [100, 200, 300, 500, 600, 800, 1000, 1600, 2000];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // 忽略解析错误
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 忽略存储错误
  }
}

export function usePresets() {
  const [giftPresets, setGiftPresets] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEY_GIFTS, DEFAULT_GIFTS)
  );
  const [amountPresets, setAmountPresets] = useState<number[]>(() =>
    loadFromStorage(STORAGE_KEY_AMOUNTS, DEFAULT_AMOUNTS)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGiftPresets(loadFromStorage(STORAGE_KEY_GIFTS, DEFAULT_GIFTS));
    setAmountPresets(loadFromStorage(STORAGE_KEY_AMOUNTS, DEFAULT_AMOUNTS));
  }, []);

  const addGiftPreset = useCallback((g: string) => {
    if (giftPresets.includes(g)) return;
    const newPresets = [...giftPresets, g];
    setGiftPresets(newPresets);
    saveToStorage(STORAGE_KEY_GIFTS, newPresets);
  }, [giftPresets]);

  const removeGiftPreset = useCallback((g: string) => {
    const newPresets = giftPresets.filter(x => x !== g);
    setGiftPresets(newPresets);
    saveToStorage(STORAGE_KEY_GIFTS, newPresets);
  }, [giftPresets]);

  const addAmountPreset = useCallback((a: number) => {
    if (amountPresets.includes(a)) return;
    const newPresets = [...amountPresets, a].sort((x, y) => x - y);
    setAmountPresets(newPresets);
    saveToStorage(STORAGE_KEY_AMOUNTS, newPresets);
  }, [amountPresets]);

  const removeAmountPreset = useCallback((a: number) => {
    const newPresets = amountPresets.filter(x => x !== a);
    setAmountPresets(newPresets);
    saveToStorage(STORAGE_KEY_AMOUNTS, newPresets);
  }, [amountPresets]);

  const resetGiftPresets = useCallback(() => {
    setGiftPresets(DEFAULT_GIFTS);
    saveToStorage(STORAGE_KEY_GIFTS, DEFAULT_GIFTS);
  }, []);

  const resetAmountPresets = useCallback(() => {
    const sorted = [...DEFAULT_AMOUNTS].sort((a, b) => a - b);
    setAmountPresets(sorted);
    saveToStorage(STORAGE_KEY_AMOUNTS, sorted);
  }, []);

  return {
    giftPresets,
    amountPresets,
    loading,
    addGiftPreset,
    removeGiftPreset,
    addAmountPreset,
    removeAmountPreset,
    resetGiftPresets,
    resetAmountPresets,
  };
}
