/** Renders a label/value row only when the value exists (no empty sections). */
export const MetaRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value || !value.trim()) return null;
  return (
    <div className="py-2 border-b border-sand-200 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-forest-600">{label}</dt>
      <dd className="text-sm text-forest-800 whitespace-pre-line">{value}</dd>
    </div>
  );
};

export default MetaRow;
