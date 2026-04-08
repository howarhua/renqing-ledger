import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { GiftRecord, PRESET_GIFTS } from '@/types';
import { Plus } from 'lucide-react';

interface Props {
  banquetId: string;
  onAdd: (r: Omit<GiftRecord, 'id' | 'createdAt'>) => void;
}

export default function GiftRecordForm({ banquetId, onAdd }: Props) {
  const [guestName, setGuestName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [customGift, setCustomGift] = useState('');
  const [note, setNote] = useState('');

  const toggleGift = (g: string) => {
    setSelectedGifts(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const addCustomGift = () => {
    if (customGift.trim() && !selectedGifts.includes(customGift.trim())) {
      setSelectedGifts(prev => [...prev, customGift.trim()]);
      setCustomGift('');
    }
  };

  const handleSubmit = () => {
    if (!guestName.trim()) return;
    onAdd({
      banquetId,
      guestName: guestName.trim(),
      amount: Number(amount) || 0,
      gifts: selectedGifts,
      note: note.trim(),
    });
    setGuestName(''); setAmount(''); setSelectedGifts([]); setNote('');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" /> 快速录入
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base">来宾姓名 *</Label>
          <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="姓名" className="h-12 text-base mt-1" />
        </div>
        <div>
          <Label className="text-base">礼金金额</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="h-12 text-base mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-base mb-2 block">礼品</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_GIFTS.map(g => (
            <Badge
              key={g}
              variant={selectedGifts.includes(g) ? 'default' : 'outline'}
              className="cursor-pointer h-9 px-4 text-sm transition-colors"
              onClick={() => toggleGift(g)}
            >
              {g}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={customGift} onChange={e => setCustomGift(e.target.value)} placeholder="自定义礼品" className="h-10"
            onKeyDown={e => e.key === 'Enter' && addCustomGift()} />
          <Button variant="outline" size="sm" onClick={addCustomGift} className="h-10">添加</Button>
        </div>
        {selectedGifts.filter(g => !PRESET_GIFTS.includes(g)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedGifts.filter(g => !PRESET_GIFTS.includes(g)).map(g => (
              <Badge key={g} className="cursor-pointer" onClick={() => toggleGift(g)}>{g} ✕</Badge>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label className="text-base">备注</Label>
        <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="关系/说明" className="mt-1 text-base" rows={2} />
      </div>
      <Button onClick={handleSubmit} className="w-full h-12 text-lg" disabled={!guestName.trim()}>
        添加记录
      </Button>
    </div>
  );
}
