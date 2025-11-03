'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    in_progress: {
      variant: 'secondary' as const,
      icon: RefreshCw,
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    completed: {
      variant: 'secondary' as const,
      icon: CheckCircle2,
      label: 'Completed',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
