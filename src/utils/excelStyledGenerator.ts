import { CalendarSheet } from '../types/calendar';
import { NAZWY_MIESIECY, pobierzPolskieSwieta, SKROTY_DNI } from './holidays';

/**
 * Generates an Excel document (.xls) with full CSS styling matching the web interface.
 * Microsoft Excel, LibreOffice, and Google Sheets render all colors, backgrounds, and borders.
 */
export function generateStyledExcelHtml(sheets: CalendarSheet[], targetSheetId?: string): string {
  const sheetsToExport = targetSheetId
    ? sheets.filter((s) => s.id === targetSheetId)
    : sheets;

  const activeSheet = sheetsToExport[0] || sheets[0];
  const year = activeSheet?.year || 2026;
  const holidays = pobierzPolskieSwieta(year);

  // Build months data
  const zalegle = Object.entries(activeSheet.selectedDays)
    .filter(([_, type]) => type === 'zalegly')
    .map(([date]) => date)
    .sort();

  const biezace = Object.entries(activeSheet.selectedDays)
    .filter(([_, type]) => type === 'biezacy')
    .map(([date]) => date)
    .sort();

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${(activeSheet.employeeName || activeSheet.name).replace(/[:\\/?*[\]]/g, '_').substring(0, 31)}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; }
    table { border-collapse: collapse; table-layout: fixed; }
    td, th { padding: 4px 6px; vertical-align: middle; text-align: center; }
    
    .title-cell { font-size: 16pt; font-weight: bold; color: #0f172a; text-align: left; }
    .year-cell { font-size: 14pt; font-weight: bold; color: #b45309; text-align: center; }
    
    .card-zalegly { background-color: #fefce8; border: 2px solid #facc15; font-weight: bold; color: #713f12; }
    .card-biezacy { background-color: #f0f9ff; border: 2px solid #38bdf8; font-weight: bold; color: #0c4a6e; }
    
    .month-header { background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 11pt; text-align: center; }
    .weekday-header { background-color: #f8fafc; color: #475569; font-weight: bold; font-size: 9pt; border-bottom: 1px solid #cbd5e1; }
    .weekend-header { background-color: #fff1f2; color: #be123c; font-weight: bold; font-size: 9pt; border-bottom: 1px solid #cbd5e1; }
    
    .cell-regular { background-color: #ffffff; border: 1px solid #e2e8f0; color: #0f172a; font-size: 10pt; }
    .cell-weekend { background-color: #fff1f2; border: 1px solid #fecdd3; color: #be123c; font-size: 10pt; font-weight: bold; }
    .cell-holiday { background-color: #ffe4e6; border: 1px solid #fda4af; color: #881337; font-size: 10pt; font-weight: bold; }
    .cell-zalegly { background-color: #fef08a; border: 1px solid #facc15; color: #713f12; font-size: 10pt; font-weight: bold; }
    .cell-biezacy { background-color: #bae6fd; border: 1px solid #38bdf8; color: #0c4a6e; font-size: 10pt; font-weight: bold; }
    .cell-empty { background-color: #f8fafc; border: 1px solid #f1f5f9; }
    
    .table-header { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left; }
    .table-subhead { background-color: #f1f5f9; color: #334155; font-weight: bold; border-bottom: 2px solid #cbd5e1; }
    .table-cell { border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 10pt; }
  </style>
</head>
<body>
<table>
  <!-- Top Banner -->
  <tr>
    <td colspan="15" class="title-cell">Plan urlopu – ${activeSheet.employeeName || activeSheet.name}</td>
    <td colspan="4"></td>
    <td colspan="4" class="year-cell">Rok ${year}</td>
    <td colspan="10"></td>
  </tr>
  <tr><td colspan="35" style="height: 10px;"></td></tr>

  <!-- Stats cards row -->
  <tr>
    <td colspan="7" class="card-zalegly">
      UW ${year - 1} (Zaległy): ${zalegle.length} / ${activeSheet.quotaZalegly} DNI
    </td>
    <td colspan="2"></td>
    <td colspan="7" class="card-biezacy">
      UW ${year} (Bieżący): ${biezace.length} / ${activeSheet.quotaBiezacy} DNI
    </td>
    <td colspan="2"></td>
    <td colspan="6" style="background-color:#f1f5f9; font-weight:bold; border: 1px solid #cbd5e1;">
      Łącznie: ${zalegle.length + biezace.length} dni urlopu
    </td>
    <td colspan="11"></td>
  </tr>
  <tr><td colspan="35" style="height: 15px;"></td></tr>
`;

  // Layout 12 months in 3 rows of 4 columns
  for (let rowBlock = 0; rowBlock < 3; rowBlock++) {
    const startMonth = rowBlock * 4; // 0, 4, 8

    // Month headers
    html += `<tr>`;
    for (let col = 0; col < 4; col++) {
      const m = startMonth + col;
      html += `<td colspan="7" class="month-header">${NAZWY_MIESIECY[m]} ${year}</td>`;
      if (col < 3) html += `<td style="width: 15px;"></td>`;
    }
    // If first row, put header for Ewidencja wykorzystanych dni urlopu on the right side
    if (rowBlock === 0) {
      html += `<td style="width: 25px;"></td><td colspan="2" class="table-header">Ewidencja wykorzystanych dni urlopu (Zaległy)</td><td style="width: 15px;"></td><td colspan="2" class="table-header">Ewidencja wykorzystanych dni urlopu (Bieżący)</td>`;
    }
    html += `</tr>`;

    // Day of week headers (Pn - Nd)
    html += `<tr>`;
    for (let col = 0; col < 4; col++) {
      for (let d = 0; d < 7; d++) {
        const isWk = d >= 5;
        html += `<td class="${isWk ? 'weekend-header' : 'weekday-header'}">${SKROTY_DNI[d]}</td>`;
      }
      if (col < 3) html += `<td></td>`;
    }
    if (rowBlock === 0) {
      html += `<td></td><td class="table-subhead">Lp.</td><td class="table-subhead">Data zaległy</td><td></td><td class="table-subhead">Lp.</td><td class="table-subhead">Data bieżący</td>`;
    }
    html += `</tr>`;

    // 6 weeks of days
    for (let w = 0; w < 6; w++) {
      html += `<tr>`;
      for (let col = 0; col < 4; col++) {
        const m = startMonth + col;
        const firstDate = new Date(year, m, 1);
        const jsDay = firstDate.getDay();
        const offset = (jsDay + 6) % 7;
        const daysInMonth = new Date(year, m + 1, 0).getDate();

        for (let d = 0; d < 7; d++) {
          const dayNum = w * 7 + d - offset + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            html += `<td class="cell-empty"></td>`;
          } else {
            const dateKey = `${year}-${String(m + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dt = new Date(year, m, dayNum);
            const dOfWeek = dt.getDay();
            const isWeekend = dOfWeek === 0 || dOfWeek === 6;
            const holiday = holidays.get(dateKey);
            const leave = activeSheet.selectedDays[dateKey];

            if (leave === 'zalegly') {
              html += `<td class="cell-zalegly" title="Urlop zaległy">${dayNum}</td>`;
            } else if (leave === 'biezacy') {
              html += `<td class="cell-biezacy" title="Urlop bieżący">${dayNum}</td>`;
            } else if (holiday) {
              html += `<td class="cell-holiday" title="${holiday.name}">${dayNum}</td>`;
            } else if (isWeekend) {
              html += `<td class="cell-weekend">${dayNum}</td>`;
            } else {
              html += `<td class="cell-regular">${dayNum}</td>`;
            }
          }
        }
        if (col < 3) html += `<td></td>`;
      }

      // Side list rows
      const listIdx = rowBlock * 6 + w;
      const itemZ = zalegle[listIdx];
      const itemB = biezace[listIdx];

      if (rowBlock === 0 || listIdx < Math.max(zalegle.length, biezace.length)) {
        html += `<td></td>`;
        html += `<td class="table-cell" style="text-align:center;">${itemZ ? listIdx + 1 : ''}</td>`;
        html += `<td class="table-cell">${itemZ || ''}</td>`;
        html += `<td></td>`;
        html += `<td class="table-cell" style="text-align:center;">${itemB ? listIdx + 1 : ''}</td>`;
        html += `<td class="table-cell">${itemB || ''}</td>`;
      }

      html += `</tr>`;
    }

    // Spacer row
    html += `<tr><td colspan="35" style="height: 14px;"></td></tr>`;
  }

  // Any remaining list items beyond row 18
  const maxItems = Math.max(zalegle.length, biezace.length);
  for (let idx = 18; idx < maxItems; idx++) {
    const itemZ = zalegle[idx];
    const itemB = biezace[idx];
    html += `<tr><td colspan="32"></td>`;
    html += `<td class="table-cell" style="text-align:center;">${itemZ ? idx + 1 : ''}</td>`;
    html += `<td class="table-cell">${itemZ || ''}</td>`;
    html += `<td></td>`;
    html += `<td class="table-cell" style="text-align:center;">${itemB ? idx + 1 : ''}</td>`;
    html += `<td class="table-cell">${itemB || ''}</td>`;
    html += `</tr>`;
  }

  html += `
</table>
</body>
</html>`;

  return html;
}

export function downloadStyledExcel(sheets: CalendarSheet[], targetSheetId?: string) {
  const content = generateStyledExcelHtml(sheets, targetSheetId);
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const activeSheet = targetSheetId ? sheets.find((s) => s.id === targetSheetId) : sheets[0];
  const year = activeSheet?.year || 2026;
  const empSlug = (activeSheet?.employeeName || activeSheet?.name || 'Pracownik').replace(/[\s\\/*?[\]:]+/g, '_');
  a.download = `Planer_Urlopow_${empSlug}_${year}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
