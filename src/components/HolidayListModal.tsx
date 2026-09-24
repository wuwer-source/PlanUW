import React from 'react';
import { pobierzPolskieSwieta, formatujDatePL, obliczWielkanoc } from '../utils/holidays';
import { X, Calendar, Flag, Sparkles } from 'lucide-react';

interface HolidayListModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
}

export const HolidayListModal: React.FC<HolidayListModalProps> = ({
  isOpen,
  onClose,
  year,
}) => {
  if (!isOpen) return null;

  const holidaysMap = pobierzPolskieSwieta(year);
  const holidays = Array.from(holidaysMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const easter = obliczWielkanoc(year);
  const easterStr = `${easter.getFullYear()}-${String(easter.getMonth() + 1).padStart(2, '0')}-${String(easter.getDate()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Flag className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Polskie Święta w roku {year}
              </h3>
              <p className="text-xs text-slate-300">
                Wyznaczone funkcjami <code>PolskieSwieta({year})</code> i <code>Wielkanoc({year})</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Info banner about easter */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Algorytm astronomiczny Wielkanocy (Meeus/Jones):</span>
              <p className="text-rose-900 mt-0.5 leading-relaxed">
                Niedziela Wielkanocna w roku {year} przypada na <strong>{formatujDatePL(easterStr)}</strong>. Święta ruchome (Poniedziałek Wielkanocny +1 d., Zielone Świątki +49 d., Boże Ciało +60 d.) zostały obliczone automatycznie.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {holidays.map((h, idx) => (
              <div
                key={h.date}
                className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400 w-5 text-right">
                    {idx + 1}.
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{h.name}</h4>
                    {h.notes && (
                      <p className="text-[11px] text-slate-500 italic">{h.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      h.isMovable
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {h.isMovable ? 'Ruchome' : 'Stałe'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                    {formatujDatePL(h.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
