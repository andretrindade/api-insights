import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export function StatsCard({ title, value, subtitle, icon: Icon, delay = 0 }: StatsCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold font-mono text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      {/* Subtle gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
