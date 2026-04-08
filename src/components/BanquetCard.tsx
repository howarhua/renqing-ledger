import { Banquet, GiftRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Banknote, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  banquet: Banquet;
  records: GiftRecord[];
  onDelete: (id: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  '婚礼': '💒',
  '满月宴': '👶',
  '乔迁宴': '🏠',
  '寿宴': '🎂',
  '升学宴': '🎓',
  '其他': '🎉',
};

export default function BanquetCard({ banquet, records, onDelete }: Props) {
  const navigate = useNavigate();
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/60 animate-fade-in group"
      onClick={() => navigate(`/banquet/${banquet.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_EMOJI[banquet.type] || '🎉'}</span>
            <h3 className="text-xl font-semibold text-foreground">{banquet.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={e => { e.stopPropagation(); onDelete(banquet.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {banquet.date}
          </div>
          {banquet.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {banquet.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">{records.length}</span>
            <span className="text-muted-foreground">位来宾</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Banknote className="w-4 h-4 text-gold" />
            <span className="font-medium text-gold">¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
