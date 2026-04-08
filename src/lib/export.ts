import { GiftRecord } from '@/types';

export function exportToCSV(records: GiftRecord[], banquetName: string) {
  const header = '来宾姓名,礼金金额,礼品,备注\n';
  const rows = records.map(r =>
    `${r.guestName},${r.amount},"${r.gifts.join('、')}","${r.note}"`
  ).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${banquetName}_人情记录.csv`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
