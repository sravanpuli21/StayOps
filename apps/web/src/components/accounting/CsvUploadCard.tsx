'use client';

import { useState } from 'react';
import { X, UploadCloud, Check } from 'lucide-react';

type Phase = 'idle' | 'parsing' | 'rules' | 'ai' | 'done';

interface Props {
  open: boolean;
  onClose: () => void;
  source: 'Bank' | 'Credit Card' | 'Payroll' | 'OTA';
  rowsPreviewCount: number;
}

export function CsvUploadCard({ open, onClose, source, rowsPreviewCount }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [fileName, setFileName] = useState<string | null>(null);

  if (!open) return null;

  const handleFile = (f?: File) => {
    if (!f) return;
    setFileName(f.name);
    setPhase('parsing');
    setTimeout(() => setPhase('rules'), 700);
    setTimeout(() => setPhase('ai'), 1400);
    setTimeout(() => setPhase('done'), 2000);
  };

  const reset = () => {
    setPhase('idle');
    setFileName(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-4" style={{ border: '1px solid #dddddd' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: '#222222' }}>Import {source} CSV</h3>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Drop a statement file. Rules and AI will categorize.</p>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="text-[#6a6a6a] hover:text-[#222222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'idle' && (
          <label
            className="rounded-2xl p-8 flex flex-col items-center text-center gap-2 cursor-pointer transition-colors hover:bg-[#f7f7f7]"
            style={{ border: '2px dashed #dddddd' }}
          >
            <UploadCloud className="w-8 h-8" style={{ color: '#6a6a6a' }} />
            <p className="text-sm font-medium" style={{ color: '#222222' }}>Drop CSV here, or click to browse</p>
            <p className="text-xs" style={{ color: '#929292' }}>Demo: any file works — content is ignored</p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}

        {phase !== 'idle' && phase !== 'done' && (
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ border: '1px solid #dddddd' }}>
            <p className="text-sm font-medium" style={{ color: '#222222' }}>Importing {fileName}…</p>
            <Step active={phase === 'parsing'} done={phase !== 'parsing'} label="Parsing CSV columns" />
            <Step active={phase === 'rules'} done={phase === 'ai'} label="Applying learned rules" />
            <Step active={phase === 'ai'} done={false} label="AI suggesting categories for unknowns" />
          </div>
        )}

        {phase === 'done' && (
          <div className="rounded-2xl p-6 flex flex-col gap-2" style={{ border: '1px solid #dddddd', background: '#f0fdf4' }}>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" style={{ color: '#15803d' }} />
              <p className="text-sm font-bold" style={{ color: '#15803d' }}>Imported successfully</p>
            </div>
            <p className="text-xs" style={{ color: '#3f3f3f' }}>
              {rowsPreviewCount} rows added · {Math.floor(rowsPreviewCount * 0.85)} matched a rule · {Math.ceil(rowsPreviewCount * 0.15)} need review
            </p>
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="self-start mt-2 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#222222', color: '#ffffff' }}
            >
              Review imports
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: done ? '#15803d' : active ? '#ff385c' : '#e5e7eb' }}
      >
        {done && <Check className="w-3 h-3 text-white" />}
      </div>
      <p className="text-xs" style={{ color: active ? '#222222' : done ? '#15803d' : '#929292', fontWeight: active ? 600 : 400 }}>
        {label}
      </p>
    </div>
  );
}
