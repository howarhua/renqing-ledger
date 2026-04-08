import { useBanquets } from '@/hooks/useBanquets';
import BanquetCard from '@/components/BanquetCard';
import CreateBanquetDialog from '@/components/CreateBanquetDialog';
import { Scroll } from 'lucide-react';

export default function Index() {
  const { banquets, records, addBanquet, deleteBanquet, getRecords } = useBanquets();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Scroll className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">人情簿</h1>
              <p className="text-xs text-muted-foreground">礼金 · 礼品 · 人情往来</p>
            </div>
          </div>
          <CreateBanquetDialog onAdd={addBanquet} />
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        {banquets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">还没有宴会记录</h2>
            <p className="text-muted-foreground mb-6">点击右上角「新建宴会」开始记录人情往来</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banquets.map(b => (
              <BanquetCard key={b.id} banquet={b} records={getRecords(b.id)} onDelete={deleteBanquet} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
