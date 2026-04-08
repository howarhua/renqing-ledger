export interface Banquet {
  id: string;
  name: string;
  date: string;
  location: string;
  type: BanquetType;
  frozen?: boolean;
  createdAt: string;
}

export type BanquetType = '婚礼' | '满月宴' | '乔迁宴' | '寿宴' | '升学宴' | '其他';

export const BANQUET_TYPES: BanquetType[] = ['寿宴', '婚礼', '满月宴', '乔迁宴', '升学宴', '其他'];

export interface GiftRecord {
  id: string;
  banquetId: string;
  guestName: string;
  amount: number;
  gifts: string[];
  note: string;
  createdAt: string;
}


export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'table' | 'card';
