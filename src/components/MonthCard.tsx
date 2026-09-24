import React from 'react';
import { MonthData } from '../utils/calendarGenerator';
import { DayStatus, LeaveType } from '../types/calendar';
import { SKROTY_DNI } from '../utils/holidays';
import { ToolMode } from './LeaveStatsBar';

interface MonthCardProps {
  monthData: MonthData;
  isLocked: boolean;
  activeTool: ToolMode;
  onDayClick: (dateStr: string, currentStatus: DayStatus) => void;
}

export const MonthCard: React.FC<MonthCardProps> = ({
  monthData,
  isLocked,
  activeTool,
  onDayClick,
}) => {
  // Compute monthly stats
  let workdaysInMonth = 0;
  let leavesInMonth = 0;
  let holidaysInMonth = 0;

  monthData.weeks.forEach((week) => {
    week.forEach((day) => {
      if (day) {
        if (!day.isWeekend && !day.holiday) {
          workdaysInMonth++;
        }
        if (day.holiday) holidaysInMonth++;
        if (day.leaveType) leavesInMonth++;
      }
    });
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col hover:border-slate-300 transition-all duration-200">
      {/* Month Header (Merged row in VBA: MonthName & " " & rok) */}
      <div className="bg-slate-800 text-white px-3.5 py-2 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight">
          {monthData.monthName} <span className="font-mono text-slate-300 font-normal">{monthData.year}</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-300 font-medium">
          {leavesInMonth > 0 ? (
            <span className="text-amber-300 font-semibold">{leavesInMonth} dni urlopu</span>
          ) : (
            `${workdaysInMonth} dni rob.`
          )}
        </span>
      </div>

      {/* Weekday labels (Pn, Wt, Śr, Cz, Pt, So, Nd) */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-1 text-[11px] font-bold text-slate-600">
        {SKROTY_DNI.map((dayName, idx) => {
          const isWeekendCol = idx >= 5;
          return (
            <div
              key={dayName}
              className={`py-0.5 ${isWeekendCol ? 'text-rose-600' : 'text-slate-600'}`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Days grid */}
      <div className="p-1.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {monthData.weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1 text-center">
              {week.map((dayStatus, dIdx) => {
                if (!dayStatus) {
                  return (
                    <div
                      key={`empty-${dIdx}`}
                      className="h-8 rounded bg-transparent opacity-0 pointer-events-none"
                    />
                  );
                }

                const isHoliday = Boolean(dayStatus.holiday);
                const isWeekend = dayStatus.isWeekend;
                const leaveType = dayStatus.leaveType;

                // Color styling matching VBA RGB values:
                // Weekend: RGB(255, 220, 220)
                // Holiday: RGB(255, 180, 180)
                // Zaległy: RGB(255, 255, 150)
                // Bieżący: RGB(180, 220, 255)
                let cellClasses =
                  'relative h-8 rounded-md flex items-center justify-center font-mono text-xs select-none transition-all cursor-pointer';

                if (leaveType === 'zalegly') {
                  // VBA Yellow
                  cellClasses +=
                    ' bg-yellow-200 text-amber-950 font-bold border border-yellow-400 shadow-2xs hover:bg-yellow-300';
                } else if (leaveType === 'biezacy') {
                  // VBA Light Blue
                  cellClasses +=
                    ' bg-sky-200 text-sky-950 font-bold border border-sky-400 shadow-2xs hover:bg-sky-300';
                } else if (isHoliday) {
                  // Holiday Red
                  cellClasses +=
                    ' bg-rose-100 text-rose-900 border border-rose-300 font-bold hover:bg-rose-200';
                } else if (isWeekend) {
                  // Weekend Soft Pink
                  cellClasses +=
                    ' bg-rose-50/70 text-rose-700 hover:bg-rose-100/70 font-medium';
                } else {
                  // Regular Workday
                  cellClasses +=
                    ' bg-white text-slate-800 hover:bg-slate-100 border border-slate-100 font-medium';
                }

                if (isLocked) {
                  cellClasses += ' cursor-not-allowed opacity-90';
                }

                // Tooltip text
                let tooltip = `${dayStatus.date}`;
                if (dayStatus.holiday) {
                  tooltip += ` • Święto: ${dayStatus.holiday.name}`;
                }
                if (dayStatus.leaveType === 'zalegly') {
                  tooltip += ` • Urlop zaległy (UW ${monthData.year - 1})`;
                } else if (dayStatus.leaveType === 'biezacy') {
                  tooltip += ` • Urlop bieżący (UW ${monthData.year})`;
                }

                return (
                  <button
                    key={dayStatus.date}
                    type="button"
                    onClick={() => {
                      if (!isLocked) {
                        onDayClick(dayStatus.date, dayStatus);
                      }
                    }}
                    title={tooltip}
                    disabled={isLocked}
                    className={cellClasses}
                  >
                    <span>{dayStatus.day}</span>

                    {/* Small badge / dot indicator */}
                    {isHoliday && (
                      <span
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-600"
                        title={dayStatus.holiday?.name}
                      />
                    )}
                    {leaveType && (
                      <span
                        className={`absolute top-0.5 right-0.5 text-[8px] leading-none px-0.5 rounded font-extrabold ${
                          leaveType === 'zalegly'
                            ? 'text-amber-800'
                            : 'text-sky-800'
                        }`}
                      >
                        {leaveType === 'zalegly' ? 'Z' : 'B'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend footer for month */}
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{monthData.daysInMonth} dni w m-cu</span>
          {holidaysInMonth > 0 && (
            <span className="text-rose-600 font-medium">{holidaysInMonth} święta</span>
          )}
        </div>
      </div>
    </div>
  );
};
