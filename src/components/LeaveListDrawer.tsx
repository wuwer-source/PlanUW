import React from 'react';
import { CalendarSheet, LeaveType } from '../types/calendar';
import { formatujDatePL } from '../utils/holidays';
import { Trash2, Copy, FileText, ChevronRight, Check } from 'lucide-react';

interface LeaveListDrawerProps {
  sheet: CalendarSheet;
  isLocked: boolean;
  onRemoveDate: (dateStr: string) => void;
}

export const LeaveListDrawer: React.FC<LeaveListDrawerProps> = ({
  sheet,
  isLocked,
  onRemoveDate,
}) => {
  const [copiedType, setCopiedType] = React.useState<LeaveType | null>(null);

  const zalegle = Object.entries(sheet.selectedDays)
    .filter(([_, type]) => type === 'zalegly')
    .map(([date]) => date)
    .sort();

  const biezace = Object.entries(sheet.selectedDays)
    .filter(([_, type]) => type === 'biezacy')
    .map(([date]) => date)
    .sort();

  const copyList = (dates: string[], type: LeaveType) => {
    const text = dates.map((d, i) => `${i + 1}. ${formatujDatePL(d)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold tracking-tight">
            Ewidencja wykorzystanych dni urlopu
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-300">
          Łącznie: {zalegle.length + biezace.length} dni
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Table 1: Zaległy (Column AK1:AL) */}
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-yellow-300 border border-yellow-400" />
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Ewidencja: Urlop zaległy ({zalegle.length})
              </h4>
            </div>

            {zalegle.length > 0 && (
              <button
                onClick={() => copyList(zalegle, 'zalegly')}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
                title="Kopiuj listę dat do schowka"
              >
                {copiedType === 'zalegly' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Skopiowano</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopiuj</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto pr-1 space-y-1">
            {zalegle.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Brak przypisanych dni urlopu zaległego
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 font-semibold border-b border-slate-100">
                    <th className="py-1 text-left w-10 font-mono">Lp.</th>
                    <th className="py-1 text-left">Data zaległy</th>
                    <th className="py-1 text-right w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {zalegle.map((dateStr, idx) => (
                    <tr key={dateStr} className="hover:bg-amber-50/50 group">
                      <td className="py-1.5 font-mono text-slate-500">{idx + 1}.</td>
                      <td className="py-1.5 font-mono font-medium text-slate-800">
                        {formatujDatePL(dateStr)}
                      </td>
                      <td className="py-1.5 text-right no-print">
                        {!isLocked && (
                          <button
                            onClick={() => onRemoveDate(dateStr)}
                            title="Usuń ten dzień"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Table 2: Bieżący (Column AM1:AN) */}
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-sky-300 border border-sky-400" />
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                Ewidencja: Urlop bieżący ({biezace.length})
              </h4>
            </div>

            {biezace.length > 0 && (
              <button
                onClick={() => copyList(biezace, 'biezacy')}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
                title="Kopiuj listę dat do schowka"
              >
                {copiedType === 'biezacy' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Skopiowano</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopiuj</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto pr-1 space-y-1">
            {biezace.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Brak przypisanych dni urlopu bieżącego
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 font-semibold border-b border-slate-100">
                    <th className="py-1 text-left w-10 font-mono">Lp.</th>
                    <th className="py-1 text-left">Data bieżący</th>
                    <th className="py-1 text-right w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {biezace.map((dateStr, idx) => (
                    <tr key={dateStr} className="hover:bg-sky-50/50 group">
                      <td className="py-1.5 font-mono text-slate-500">{idx + 1}.</td>
                      <td className="py-1.5 font-mono font-medium text-slate-800">
                        {formatujDatePL(dateStr)}
                      </td>
                      <td className="py-1.5 text-right no-print">
                        {!isLocked && (
                          <button
                            onClick={() => onRemoveDate(dateStr)}
                            title="Usuń ten dzień"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
