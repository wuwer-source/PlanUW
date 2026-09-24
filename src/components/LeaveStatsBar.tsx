import React from 'react';
import { CalendarSheet, LeaveType } from '../types/calendar';
import { computeLeaveStats } from '../utils/calendarGenerator';
import { Sparkles, CalendarRange, Eraser, RotateCcw, AlertCircle, Sun, Flame } from 'lucide-react';

export type ToolMode = 'auto' | 'zalegly' | 'biezacy' | 'eraser';

interface LeaveStatsBarProps {
  sheet: CalendarSheet;
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  onUpdateQuota: (quotaZalegly: number, quotaBiezacy: number) => void;
  onOpenRangeModal: () => void;
  onClearAllLeave: () => void;
}

export const LeaveStatsBar: React.FC<LeaveStatsBarProps> = ({
  sheet,
  activeTool,
  onSelectTool,
  onUpdateQuota,
  onOpenRangeModal,
  onClearAllLeave,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);
  const stats = computeLeaveStats(sheet);
  const isLocked = sheet.isLocked;

  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Banner if locked */}
        {isLocked && (
          <div className="flex items-center gap-2 bg-amber-50/90 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-lg text-xs font-medium no-print">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Arkusz jest zablokowany (odpowiednik <code>ws.Protect</code>). Aby oznaczać dni urlopu lub edytować limity, kliknij przycisk „Zablokowany” w zakładce arkusza.
            </span>
          </div>
        )}

        {/* Row 1: VBA Excel Header Blocks (UW rok-1 & UW rok) + Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Zaległy (VBA Yellow RGB(255, 255, 150)) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-yellow-300 border border-yellow-400 inline-block shadow-2xs" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  UW {sheet.year - 1} (Zaległy)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isLocked}
                  value={sheet.quotaZalegly}
                  onChange={(e) =>
                    onUpdateQuota(Math.max(0, Number(e.target.value) || 0), sheet.quotaBiezacy)
                  }
                  className="w-14 px-1.5 py-0.5 text-right font-mono font-bold text-sm bg-white border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:opacity-75"
                />
                <span className="text-xs font-semibold text-amber-900">DNI</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-600">
                Wykorzystano:{' '}
                <strong className="text-amber-900 tabular-nums">{stats.usedZalegly}</strong>
              </div>
              <div className="text-slate-600">
                Pozostało:{' '}
                <strong
                  className={`tabular-nums ${
                    stats.remainingZalegly < 0 ? 'text-rose-600 font-bold' : 'text-amber-950'
                  }`}
                >
                  {stats.remainingZalegly}
                </strong>
              </div>
            </div>
          </div>

          {/* Card 2: Bieżący (VBA Light Blue RGB(180, 220, 255)) */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-sky-300 border border-sky-400 inline-block shadow-2xs" />
                <span className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                  UW {sheet.year} (Bieżący)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isLocked}
                  value={sheet.quotaBiezacy}
                  onChange={(e) =>
                    onUpdateQuota(sheet.quotaZalegly, Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-14 px-1.5 py-0.5 text-right font-mono font-bold text-sm bg-white border border-sky-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none disabled:bg-slate-100 disabled:opacity-75"
                />
                <span className="text-xs font-semibold text-sky-900">DNI</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-sky-200/70 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-600">
                Wykorzystano:{' '}
                <strong className="text-sky-900 tabular-nums">{stats.usedBiezacy}</strong>
              </div>
              <div className="text-slate-600">
                Pozostało:{' '}
                <strong
                  className={`tabular-nums ${
                    stats.remainingBiezacy < 0 ? 'text-rose-600 font-bold' : 'text-sky-950'
                  }`}
                >
                  {stats.remainingBiezacy}
                </strong>
              </div>
            </div>
          </div>

          {/* Card 3: Podsumowanie łączne */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Łączny bilans urlopu
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {stats.totalUsed} / {stats.totalQuota} dni
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{
                    width: `${stats.totalQuota > 0 ? (stats.usedZalegly / stats.totalQuota) * 100 : 0}%`,
                  }}
                  title={`Zaległy: ${stats.usedZalegly} dni`}
                />
                <div
                  className="bg-sky-400 h-full transition-all duration-300"
                  style={{
                    width: `${stats.totalQuota > 0 ? (stats.usedBiezacy / stats.totalQuota) * 100 : 0}%`,
                  }}
                  title={`Bieżący: ${stats.usedBiezacy} dni`}
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-600">
              <span>Do wykorzystania:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {stats.totalRemaining} dni
              </span>
            </div>
          </div>

          {/* Card 4: Dni robocze & Najdłuższy wypoczynek */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Statystyka roku</span>
              <span className="font-mono text-slate-500">{stats.totalWorkdaysInYear} dni rob.</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-xs leading-tight">
                <span className="text-slate-500 block">Najdłuższy ciągły wypoczynek:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {stats.longestStreakDays > 0 ? `${stats.longestStreakDays} dni z rzędu` : 'Brak urlopu'}
                </span>
              </div>
            </div>

            <div className="mt-1 text-[11px] text-slate-500 truncate">
              {stats.longestStreakDays > 0 ? '(z weekendami i świętami)' : 'Zaznacz dni w kalendarzu'}
            </div>
          </div>
        </div>

        {/* Row 2: Paint Tools & Action buttons (hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Narzędzie:</span>

            {/* Auto Cycle */}
            <button
              onClick={() => onSelectTool('auto')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTool === 'auto'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Inteligentny cykl</span>
            </button>

            {/* Zaległy Tool */}
            <button
              onClick={() => onSelectTool('zalegly')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                activeTool === 'zalegly'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500" />
              <span>Oznacz jako Zaległy</span>
            </button>

            {/* Bieżący Tool */}
            <button
              onClick={() => onSelectTool('biezacy')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                activeTool === 'biezacy'
                  ? 'bg-sky-100 border-sky-400 text-sky-950 font-bold shadow-2xs ring-1 ring-sky-400'
                  : 'bg-sky-50/60 border-sky-200 text-sky-900 hover:bg-sky-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-500" />
              <span>Oznacz jako Bieżący</span>
            </button>

            {/* Eraser */}
            <button
              onClick={() => onSelectTool('eraser')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTool === 'eraser'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eraser className="w-3.5 h-3.5 text-rose-500" />
              <span>Gumka</span>
            </button>
          </div>

          {/* Quick range & clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRangeModal}
              disabled={isLocked}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
              <span>Zaznacz przedział dat...</span>
            </button>

            {stats.totalUsed > 0 && (
              isConfirmingClear ? (
                <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-xs animate-in fade-in duration-150">
                  <span className="text-rose-800 font-medium">Wyczyścić {stats.totalUsed} dni urlopu?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllLeave();
                      setIsConfirmingClear(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] cursor-pointer"
                  >
                    Tak, wyczyść
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded text-[11px] cursor-pointer"
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  disabled={isLocked}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Wyczyść urlop</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
