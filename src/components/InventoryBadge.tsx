import { badgeToneClasses, type InventoryStatus } from '@/lib/inventory';

export const InventoryBadge = ({
  status,
  className = '',
}: {
  status: InventoryStatus;
  className?: string;
}) => (
  <span
    className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeToneClasses[status.badgeTone]} ${className}`}
  >
    {status.badge}
  </span>
);

export default InventoryBadge;
