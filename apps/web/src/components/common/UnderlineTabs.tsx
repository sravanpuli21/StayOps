'use client';

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function UnderlineTabs({ tabs, active, onChange, className }: Props) {
  return (
    <div
      className={`flex items-center gap-6 ${className ?? ''}`}
      style={{ borderBottom: '1px solid #dddddd' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className="relative flex items-center gap-2 pb-3 pt-1 text-sm transition-colors"
            style={{
              color: isActive ? '#222222' : '#6a6a6a',
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  background: isActive ? 'rgba(255,56,92,0.1)' : '#f7f7f7',
                  color: isActive ? '#ff385c' : '#6a6a6a',
                }}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                className="absolute left-0 right-0 -bottom-px"
                style={{
                  height: 2,
                  background: '#ff385c',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
