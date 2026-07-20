export const Progress = ({ value, color = "#7c6cff" }: { value: number; color?: string }) => (
  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, value)}%`, background: color }} /></div>
);
