import React, { useState } from 'react';
import { X, Calendar, Layers, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (year: number, count: number, names: string[], quotaZalegly: number, quotaBiezacy: number) => void;
  defaultYear: number;
}

export const BatchGenerateModal: React.FC<BatchGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  defaultYear,
}) => {
  const [year, setYear] = useState(defaultYear);
  const [count, setCount] = useState(1);
  const [quotaZalegly, setQuotaZalegly] = useState(0);
  const [quotaBiezacy, setQuotaBiezacy] = useState(26);
  const [namingMode, setNamingMode] = useState<'standard' | 'custom'>('standard');
  const [customNamesText, setCustomNamesText] = useState('Jan Kowalski\nAnna Nowak\nPiotr Wiśniewski');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (year < 1900 || year > 2100) {
      setErrorMessage('Nieprawidłowy rok. Podaj rok z zakresu 1900 - 2100.');
      return;
    }
    setErrorMessage(null);

    let finalCount = count;
    let names: string[] = [];

    if (namingMode === 'custom') {
      names = customNamesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      finalCount = names.length > 0 ? names.length : 1;
    } else {
      finalCount = Math.max(1, count);
      names = Array.from({ length: finalCount }, (_, i) => `Kalendarz_${year}_${i + 1}`);
    }

    onGenerate(year, finalCount, names, quotaZalegly, quotaBiezacy);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Generuj Kalendarz (VBA)</h3>
              <p className="text-xs text-slate-300">
                Odpowiednik makra <code>Sub GenerujKalendarz()</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rok kalendarza
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-600 mt-1 block">Wybór roku (1900–2100)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Liczba kalendarzy / kopii
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={count}
                disabled={namingMode === 'custom'}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
              />
              <span className="text-[11px] text-slate-600 mt-1 block">
                {namingMode === 'custom' ? 'Wyznaczana z listy nazwisk' : 'Ile arkuszy wygenerować?'}
              </span>
            </div>
          </div>

          {/* Quotas Initial Settings */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Domyślne pule urlopowe dla nowych arkuszy
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-amber-900 font-semibold block mb-1">
                  UW {year - 1} (Zaległy):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quotaZalegly}
                    onChange={(e) => setQuotaZalegly(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 bg-white border border-amber-300 rounded-md font-mono text-sm font-bold"
                  />
                  <span className="text-xs font-mono text-slate-500">dni</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-sky-900 font-semibold block mb-1">
                  UW {year} (Bieżący):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quotaBiezacy}
                    onChange={(e) => setQuotaBiezacy(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 bg-white border border-sky-300 rounded-md font-mono text-sm font-bold"
                  />
                  <span className="text-xs font-mono text-slate-500">dni</span>
                </div>
              </div>
            </div>
          </div>

          {/* Naming Options */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="naming"
                  checked={namingMode === 'standard'}
                  onChange={() => setNamingMode('standard')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span>Wzorzec VBA (np. <code>Kalendarz_{year}_1</code>)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="naming"
                  checked={namingMode === 'custom'}
                  onChange={() => setNamingMode('custom')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span>Nazwiska pracowników</span>
              </label>
            </div>

            {namingMode === 'custom' && (
              <div>
                <textarea
                  rows={3}
                  value={customNamesText}
                  onChange={(e) => setCustomNamesText(e.target.value)}
                  placeholder="Wpisz nazwiska (jedno w wierszu)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-600">
                  Dla każdej linijki zostanie utworzony osobny arkusz.
                </span>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generuj arkusze</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
