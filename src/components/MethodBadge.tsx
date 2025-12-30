import { cn } from '@/lib/utils';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-method-get/15 text-method-get border-method-get/30',
    POST: 'bg-method-post/15 text-method-post border-method-post/30',
    PUT: 'bg-method-put/15 text-method-put border-method-put/30',
    PATCH: 'bg-method-patch/15 text-method-patch border-method-patch/30',
    DELETE: 'bg-method-delete/15 text-method-delete border-method-delete/30',
  };

  const colorClass = methodColors[method] || 'bg-muted text-muted-foreground border-border';

  return (
    <span className={cn(
      "inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-semibold rounded border uppercase tracking-wide min-w-[60px]",
      colorClass,
      className
    )}>
      {method}
    </span>
  );
}
