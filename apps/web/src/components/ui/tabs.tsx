'use client';

interface TabDef { id: string; label: string; count?: number; }

export function Tabs({
  tabs, active, onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              background: isActive ? '#222222' : '#f7f7f7',
              color: isActive ? '#ffffff' : '#6a6a6a',
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 opacity-70">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
