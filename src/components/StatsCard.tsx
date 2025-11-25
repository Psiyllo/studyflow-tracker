import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'primary';
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  variant = 'default'
}: StatsCardProps) => {
  const variantClasses = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    primary: 'border-primary/30 bg-primary/5',
  };

  return (
    <Card className={`p-6 ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold tabular-nums">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${
          variant === 'success' ? 'bg-success/10 text-success' :
          variant === 'primary' ? 'bg-primary/10 text-primary' :
          'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
