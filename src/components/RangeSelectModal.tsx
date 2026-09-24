import React, { useState } from 'react';
import { CalendarSheet, LeaveType } from '../types/calendar';
import { pobierzPolskieSwieta } from '../utils/holidays';
import { X, CalendarRange, Check, AlertCircle } from 'lucide-react';

interface RangeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: CalendarSheet;
  onApplyRange: (dates: string[], type: LeaveType) => void;
}

export const RangeSelectModal: React.FC<RangeSelectModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onApplyRange,
}) => {
  const [startDate, setStartDate] = useState(`${sheet.year}-07-01`);
  const [endDate, setEndDate] = useState(`${sheet.year}-07-14`);
  const [leaveType, setLeaveType] = useState<LeaveType>('biezacy');
  const [skipNonWorkdays, setSkipNonWorkdays] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate matching days
  const holidays = pobierzPolskieSwieta(sheet.year);
  const selectedDates: string[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      const dayOfWeek = cur.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.has(key);

      if (skipNonWorkdays) {
        if (!isWeekend && !isHoliday) {
          selectedDates.push(key);
        }
      } else {
        selectedDates.push(key);
      }

      cur.setDate(cur.getDate() + 1);
    }
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      setErrorMessage('Wybrany zakres nie zawiera żadnych dni roboczych do zaznaczenia (być może wybrano same weekendy lub święta).');
      return;
    }
    setErrorMessage(null);
    onApplyRange(selectedDates, leaveType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold tracking-tight">Szybkie zaznaczanie urlopu</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data początkowa:
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data końcowa:
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategoria urlopu:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('zalegly')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  leaveType === 'zalegly'
                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500" />
                <span>Urlop zaległy ({sheet.year - 1})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('biezacy')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  leaveType === 'biezacy'
                    ? 'bg-sky-100 border-sky-400 text-sky-950 font-bold ring-2 ring-sky-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-500" />
                <span>Urlop bieżący ({sheet.year})</span>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={skipNonWorkdays}
              onChange={(e) => setSkipNonWorkdays(e.target.checked)}
              className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
            />
            <span>
              <strong>Tylko dni robocze</strong> (zgodnie z Kodeksem Pracy automatycznie pomija weekendy oraz święta państwowe)
            </span>
          </label>

          {/* Result summary banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between">
            <span className="text-slate-600">Dni do przypisania:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {selectedDates.length} dni roboczych
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              Zastosuj zakres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
