import React from 'react';
import { MonthData } from '../utils/calendarGenerator';
import { DayStatus } from '../types/calendar';
import { MonthCard } from './MonthCard';
import { ToolMode } from './LeaveStatsBar';

interface YearGridProps {
  monthsData: MonthData[];
  isLocked: boolean;
  activeTool: ToolMode;
  onDayClick: (dateStr: string, currentStatus: DayStatus) => void;
}

export const YearGrid: React.FC<YearGridProps> = ({
  monthsData,
  isLocked,
  activeTool,
  onDayClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Visual Legend (Color mapping from VBA macro) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">Legenda kolorów:</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-yellow-200 border border-yellow-400 shadow-2xs" />
            <span className="text-slate-700 font-medium">Urlop zaległy (UW rok-1)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-200 border border-sky-400 shadow-2xs" />
            <span className="text-slate-700 font-medium">Urlop bieżący (UW rok)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-200 shadow-2xs" />
            <span className="text-slate-700 font-medium">Weekend (So, Nd)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300 shadow-2xs" />
            <span className="text-rose-900 font-semibold">Święto ustawowe</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono hidden md:block">
          Kliknij dzień roboczy, aby przypisać urlop
        </div>
      </div>

      {/* 12 Months Grid: 4 columns x 3 rows on desktop (VBA block structure) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monthsData.map((month) => (
          <MonthCard
            key={month.monthIndex}
            monthData={month}
            isLocked={isLocked}
            activeTool={activeTool}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
};
