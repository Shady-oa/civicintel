import { LucideIcon } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div className="civic-card flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{animatedValue}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
