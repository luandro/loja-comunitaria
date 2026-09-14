import { useStore } from '@/hooks/use-store';

/** Keyboard-only shortcut past the header, visible when focused. */
export const SkipLink = () => {
  const store = useStore();
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-3 focus:rounded-md focus:bg-forest-900 focus:text-sand-50"
    >
      {store.t('skip_to_content')}
    </a>
  );
};

export default SkipLink;
