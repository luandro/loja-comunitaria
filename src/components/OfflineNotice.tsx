import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useStore } from '@/hooks/use-store';

/** Sticky, low-noise banner shown only while the device has no connection. */
export const OfflineNotice = () => {
  const online = useOnlineStatus();
  const { t } = useStore();

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-forest-800 text-sand-50 px-4 py-2 text-sm flex items-center justify-center gap-2 text-center"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t('offline_notice')}</span>
    </div>
  );
};

export default OfflineNotice;
