export type LeaveType = 'zalegly' | 'biezacy';

export interface PolishHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  isMovable: boolean;
  notes?: string;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  day: number;
  month: number; // 1-12
  year: number;
  dayOfWeek: number; // 1 (Pn) - 7 (Nd)
  isWeekend: boolean;
  holiday?: PolishHoliday;
  leaveType?: LeaveType;
}

export interface YearQuota {
  quotaZalegly: number; // UW (rok - 1)
  quotaBiezacy: number; // UW rok
}

export interface CalendarSheet {
  id: string;
  name: string; // e.g. "Kalendarz_2026_1" or "Jan Kowalski"
  employeeName: string;
  year: number;
  quotaZalegly: number; // UW (rok - 1) dla aktualnego roku
  quotaBiezacy: number; // UW rok dla aktualnego roku
  yearlyQuotas?: Record<number, YearQuota>; // indywidualne pule urlopowe dla każdego roku osobno
  selectedDays: Record<string, LeaveType>; // key: YYYY-MM-DD, val: 'zalegly' | 'biezacy'
  isLocked: boolean; // Protect sheet
  notes?: string;
  createdAt: number;
}
