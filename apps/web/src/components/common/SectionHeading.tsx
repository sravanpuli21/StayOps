interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#222222' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
