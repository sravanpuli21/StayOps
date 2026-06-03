'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

/**
 * Reusable display-picture / logo uploader. Persists a data-URL to localStorage
 * under the given key (frontend-only; real upload/storage is a backend task).
 * `editable` gates the change/remove controls by access level.
 */
interface Props {
  /** Unique storage key, e.g. 'company:hos' or 'hotel:GA989'. */
  storageKey: string;
  /** Fallback content when no image (e.g. initials or an icon). */
  fallback: React.ReactNode;
  /** Square shorthand. Use width/height for non-square (e.g. 1:2 company logo). */
  size?: number;
  width?: number;
  height?: number;
  rounded?: 'full' | 'xl';
  editable?: boolean;
  /** Background for the fallback tile. */
  fallbackBg?: string;
}

const PREFIX = 'stayops.dp.';

export function LogoUpload({
  storageKey, fallback, size = 56, width, height, rounded = 'xl', editable = true, fallbackBg = '#fff1f3',
}: Props) {
  const boxW = width ?? size;
  const boxH = height ?? size;
  const key = PREFIX + storageKey;
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSrc(window.localStorage.getItem(key));
  }, [key]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith('image/')) { setErr('Choose an image.'); return; }
    if (file.size > 2 * 1024 * 1024) { setErr('Image must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setSrc(url);
      try { window.localStorage.setItem(key, url); } catch { /* quota — in-memory only */ }
    };
    reader.readAsDataURL(file);
  };

  const remove = () => {
    setSrc(null);
    window.localStorage.removeItem(key);
  };

  const radius = rounded === 'full' ? '9999px' : '16px';

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative" style={{ width: boxW, height: boxH }}>
        <button
          type="button"
          onClick={() => editable && fileRef.current?.click()}
          className="group w-full h-full overflow-hidden flex items-center justify-center relative"
          style={{ borderRadius: radius, background: fallbackBg, cursor: editable ? 'pointer' : 'default' }}
          title={editable ? 'Change photo' : undefined}
        >
          {src
            ? <img src={src} alt="" className="w-full h-full object-cover" />
            : fallback}
          {editable && (
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <Camera className="w-5 h-5 text-white" />
            </span>
          )}
        </button>
        {editable && (
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        )}
      </div>
      {editable && src && (
        <button onClick={remove} className="inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#b91c1c' }}>
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      )}
      {err && <p className="text-[10px]" style={{ color: '#b91c1c' }}>{err}</p>}
    </div>
  );
}
