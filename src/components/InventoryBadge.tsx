import { Clock, Gem, PackageX, AlertTriangle, Check } from 'lucide-react';
import { badgeToneClasses, type InventoryStatus } from '@/lib/inventory';

/**
 * Availability is never communicated by color alone: every badge carries a
 * word and a distinct icon.
 */
const toneIcon = {
  unique: Gem,
  warning: AlertTriangle,
  info: Clock,
  neutral: Check,
  soldout: PackageX,
} as const;

export const InventoryBadge = ({
  status,
  className = '',
}: {
  status: InventoryStatus;
  className?: string;
}) => {
  const Icon = toneIcon[status.badgeTone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badgeToneClasses[status.badgeTone]} ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {status.badge}
    </span>
  );
};

export default InventoryBadge;
