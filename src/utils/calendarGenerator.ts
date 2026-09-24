import * as XLSX from 'xlsx';
import { CalendarSheet, DayStatus, LeaveType } from '../types/calendar';
import { NAZWY_MIESIECY, pobierzPolskieSwieta, SKROTY_DNI } from './holidays';

export interface MonthData {
  monthIndex: number; // 0-11
  monthName: string;
  year: number;
  firstDayWeekday: number; // 0 for Monday, 6 for Sunday
  daysInMonth: number;
  weeks: (DayStatus | null)[][];
}

export function buildYearData(
  year: number,
  selectedDays: Record<string, LeaveType> = {}
): MonthData[] {
  const holidays = pobierzPolskieSwieta(year);
  const months: MonthData[] = [];

  for (let m = 0; m < 12; m++) {
    const firstDate = new Date(year, m, 1);
    // Sunday in JS is 0, so convert to Monday = 0 ... Sunday = 6
    const jsDay = firstDate.getDay();
    const firstDayWeekday = (jsDay + 6) % 7;

    // Number of days in month
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const weeks: (DayStatus | null)[][] = [];
    let currentWeek: (DayStatus | null)[] = new Array(firstDayWeekday).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dt = new Date(year, m, day);
      const dayOfWeekJs = dt.getDay(); // 0 is Sunday, 6 is Saturday
      const dayOfWeek = dayOfWeekJs === 0 ? 7 : dayOfWeekJs; // 1 (Pn) - 7 (Nd)
      const isWeekend = dayOfWeekJs === 0 || dayOfWeekJs === 6;
      const holiday = holidays.get(dateStr);
      const leaveType = selectedDays[dateStr];

      currentWeek.push({
        date: dateStr,
        day,
        month: m + 1,
        year,
        dayOfWeek,
        isWeekend,
        holiday,
        leaveType,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    months.push({
      monthIndex: m,
      monthName: NAZWY_MIESIECY[m],
      year,
      firstDayWeekday,
      daysInMonth,
      weeks,
    });
  }

  return months;
}

export interface LeaveStats {
  usedZalegly: number;
  remainingZalegly: number;
  usedBiezacy: number;
  remainingBiezacy: number;
  totalUsed: number;
  totalQuota: number;
  totalRemaining: number;
  totalWorkdaysInYear: number;
  longestStreakDays: number;
  longestStreakDates: string[];
}

export function computeLeaveStats(sheet: CalendarSheet): LeaveStats {
  const holidays = pobierzPolskieSwieta(sheet.year);
  let usedZalegly = 0;
  let usedBiezacy = 0;

  Object.entries(sheet.selectedDays).forEach(([dateStr, type]) => {
    // Only count if it falls into sheet.year
    if (dateStr.startsWith(String(sheet.year))) {
      if (type === 'zalegly') usedZalegly++;
      if (type === 'biezacy') usedBiezacy++;
    }
  });

  const remainingZalegly = sheet.quotaZalegly - usedZalegly;
  const remainingBiezacy = sheet.quotaBiezacy - usedBiezacy;
  const totalUsed = usedZalegly + usedBiezacy;
  const totalQuota = sheet.quotaZalegly + sheet.quotaBiezacy;
  const totalRemaining = remainingZalegly + remainingBiezacy;

  // Count workdays in year
  let totalWorkdaysInYear = 0;
  const startDate = new Date(sheet.year, 0, 1);
  const endDate = new Date(sheet.year, 11, 31);
  const cur = new Date(startDate);

  // For streak detection (consecutive off days including weekends, holidays, and leaves)
  const isOffDay = new Map<string, boolean>();

  while (cur <= endDate) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    const dayOfWeek = cur.getDay();
    const isWknd = dayOfWeek === 0 || dayOfWeek === 6;
    const isHol = holidays.has(key);
    const isLeave = Boolean(sheet.selectedDays[key]);

    if (!isWknd && !isHol) {
      totalWorkdaysInYear++;
    }

    if (isWknd || isHol || isLeave) {
      isOffDay.set(key, true);
    } else {
      isOffDay.set(key, false);
    }

    cur.setDate(cur.getDate() + 1);
  }

  // Calculate longest continuous rest streak that includes at least one vacation day
  let longestStreakDays = 0;
  let longestStreakDates: string[] = [];
  let currentStreak: string[] = [];
  let currentHasLeave = false;

  const cur2 = new Date(sheet.year, 0, 1);
  while (cur2 <= endDate) {
    const y = cur2.getFullYear();
    const m = String(cur2.getMonth() + 1).padStart(2, '0');
    const d = String(cur2.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    if (isOffDay.get(key)) {
      currentStreak.push(key);
      if (sheet.selectedDays[key]) {
        currentHasLeave = true;
      }
    } else {
      if (currentHasLeave && currentStreak.length > longestStreakDays) {
        longestStreakDays = currentStreak.length;
        longestStreakDates = [...currentStreak];
      }
      currentStreak = [];
      currentHasLeave = false;
    }
    cur2.setDate(cur2.getDate() + 1);
  }

  if (currentHasLeave && currentStreak.length > longestStreakDays) {
    longestStreakDays = currentStreak.length;
    longestStreakDates = [...currentStreak];
  }

  return {
    usedZalegly,
    remainingZalegly,
    usedBiezacy,
    remainingBiezacy,
    totalUsed,
    totalQuota,
    totalRemaining,
    totalWorkdaysInYear,
    longestStreakDays,
    longestStreakDates,
  };
}

/**
 * Generuje plik Excel .xlsx odwzorowujący strukturę z makra VBA
 */
export function exportCalendarToExcel(sheets: CalendarSheet[], targetSheetId?: string) {
  const wb = XLSX.utils.book_new();

  const sheetsToExport = targetSheetId
    ? sheets.filter((s) => s.id === targetSheetId)
    : sheets;

  sheetsToExport.forEach((sheet) => {
    const wsData: (string | number | null)[][] = [];

    // Initialize 60 rows with 45 empty columns
    for (let r = 0; r < 50; r++) {
      wsData.push(new Array(45).fill(''));
    }

    const year = sheet.year;
    const holidays = pobierzPolskieSwieta(year);

    // Header cells (VBA layout)
    wsData[0][1] = `Plan urlopu – ${sheet.employeeName || sheet.name}`;
    // ws.Range("Z1").Value = rok (Col index 25)
    wsData[0][25] = year;

    // Legend
    // ws.Range("B2") = RGB(255, 255, 150), C2 = "zaległy" (Col 1, 2)
    wsData[1][1] = '[ZALEGŁY]';
    wsData[1][2] = 'zaległy';

    // ws.Range("F2") = RGB(180, 220, 255), G2 = "bieżący" (Col 5, 6)
    wsData[1][5] = '[BIEŻĄCY]';
    wsData[1][6] = 'bieżący';

    // K2:N2 -> "UW " & (rok - 1) & " -" | 0 | "DNI" (Cols 10, 11, 12, 13)
    wsData[1][10] = `UW ${year - 1} -`;
    wsData[1][12] = sheet.quotaZalegly;
    wsData[1][13] = 'DNI';

    // T2:W2 -> "UW " & rok & " -" | 26 | "DNI" (Cols 19, 20, 21, 22)
    wsData[1][19] = `UW ${year} -`;
    wsData[1][21] = sheet.quotaBiezacy;
    wsData[1][22] = 'DNI';

    // 12 months blocks
    // baseRow = 6, baseCol = 2, blockW = 9, blockH = 9
    const baseRow = 5; // 0-indexed in JS (row 6 in Excel)
    const baseCol = 1; // 0-indexed in JS (col B in Excel)
    const blockW = 9;
    const blockH = 9;

    for (let m = 1; m <= 12; m++) {
      const colOffset = ((m - 1) % 4) * blockW;
      const rowOffset = Math.floor((m - 1) / 4) * blockH;

      // Month Title: MonthName & " " & rok
      wsData[baseRow + rowOffset - 1][baseCol + colOffset] = `${NAZWY_MIESIECY[m - 1]} ${year}`;

      // Days of week header: Pn, Wt, Śr, Cz, Pt, So, Nd
      for (let dIdx = 0; dIdx < 7; dIdx++) {
        wsData[baseRow + rowOffset][baseCol + colOffset + dIdx] = SKROTY_DNI[dIdx];
      }

      // Fill dates
      const firstDate = new Date(year, m - 1, 1);
      const jsDay = firstDate.getDay();
      const offset = (jsDay + 6) % 7; // Monday offset

      let d = 1;
      let r = baseRow + rowOffset + 1;
      let c = baseCol + colOffset + offset;

      const daysInMonth = new Date(year, m, 0).getDate();

      while (d <= daysInMonth) {
        const dateKey = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const leave = sheet.selectedDays[dateKey];
        let cellVal: string | number = d;

        if (leave === 'zalegly') {
          cellVal = `${d} [ZAL]`;
        } else if (leave === 'biezacy') {
          cellVal = `${d} [BIEŻ]`;
        }

        wsData[r][c] = cellVal;

        d++;
        c++;

        if (c > baseCol + colOffset + 6) {
          c = baseCol + colOffset;
          r++;
        }
      }
    }

    // Side lists: AK1 (Col 36) -> Lp. & Data zaległy, AM1 (Col 38) -> Lp. & Data bieżący
    const listColZ = 36;
    const listColB = 38;

    wsData[baseRow - 1][listColZ] = 'Lp.';
    wsData[baseRow - 1][listColZ + 1] = 'Data zaległy';

    wsData[baseRow - 1][listColB] = 'Lp.';
    wsData[baseRow - 1][listColB + 1] = 'Data bieżący';

    // Populate selected lists sorted chronologically
    const zalegleList = Object.entries(sheet.selectedDays)
      .filter(([_, type]) => type === 'zalegly')
      .map(([date]) => date)
      .sort();

    const biezaceList = Object.entries(sheet.selectedDays)
      .filter(([_, type]) => type === 'biezacy')
      .map(([date]) => date)
      .sort();

    zalegleList.forEach((dt, idx) => {
      const targetRow = baseRow + idx;
      if (!wsData[targetRow]) wsData[targetRow] = new Array(45).fill('');
      wsData[targetRow][listColZ] = idx + 1;
      wsData[targetRow][listColZ + 1] = dt;
    });

    biezaceList.forEach((dt, idx) => {
      const targetRow = baseRow + idx;
      if (!wsData[targetRow]) wsData[targetRow] = new Array(45).fill('');
      wsData[targetRow][listColB] = idx + 1;
      wsData[targetRow][listColB + 1] = dt;
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 3 }, // A
      { wch: 4 }, // B
      { wch: 4 }, // C
      { wch: 4 }, // D
      { wch: 4 }, // E
      { wch: 4 }, // F
      { wch: 4 }, // G
      { wch: 4 }, // H
      { wch: 4 }, // I
    ];

    const safeSheetName = (sheet.employeeName || sheet.name).replace(/[\\/*?[\]:]/g, '_').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName || `Pracownik_${year}`);
  });

  const fileName = `Planer_Urlopow_${sheetsToExport[0]?.year || 2026}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
