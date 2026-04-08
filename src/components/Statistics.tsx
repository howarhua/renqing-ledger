import { GiftRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Banknote, TrendingUp, Gift } from 'lucide-react';

interface Props {
  records: GiftRecord[];
}

export default function Statistics({ records }: Props) {
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const avgAmount = records.length ? Math.round(totalAmount / records.length) : 0;
  const guestCount = records.length;

  const giftCounts: Record<string, number> = {};
  records.forEach(r => r.gifts.forEach(g => { giftCounts[g] = (giftCounts[g] || 0) + 1; }));
  const topGifts = Object.entries(giftCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topGuests = [...records].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '总礼金', value: `¥${totalAmount.toLocaleString()}`, icon: Banknote, color: 'text-gold' },
          { label: '来宾数', value: guestCount, icon: Users, color: 'text-primary' },
          { label: '平均礼金', value: `¥${avgAmount.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
          { label: '礼品种类', value: Object.keys(giftCounts).length, icon: Gift, color: 'text-secondary' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topGuests.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">🏆 礼金排行</h4>
              <div className="space-y-2">
                {topGuests.map((r, i) => (
                  <div key={r.id} className="flex justify-between items-center py-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium">{r.guestName}</span>
                    </span>
                    <span className="text-gold font-semibold">¥{r.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {topGifts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">🎁 礼品统计</h4>
              <div className="space-y-2">
                {topGifts.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center py-1">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{count} 份</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
