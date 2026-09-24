/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CalendarSheet, DayStatus, LeaveType } from './types/calendar';
import { buildYearData, exportCalendarToExcel } from './utils/calendarGenerator';
import { downloadStyledExcel } from './utils/excelStyledGenerator';
import { Header } from './components/Header';
import { CalendarTabs } from './components/CalendarTabs';
import { LeaveStatsBar, ToolMode } from './components/LeaveStatsBar';
import { YearGrid } from './components/YearGrid';
import { LeaveListDrawer } from './components/LeaveListDrawer';
import { BatchGenerateModal } from './components/BatchGenerateModal';
import { RangeSelectModal } from './components/RangeSelectModal';
import { HolidayListModal } from './components/HolidayListModal';
import { DownloadModal } from './components/DownloadModal';
import { CheckCircle2, AlertTriangle, Info, Printer } from 'lucide-react';

const STORAGE_KEY = 'vba_calendar_sheets_v1';

export default function App() {
  const currentSystemYear = new Date().getFullYear(); // e.g. 2026

  // Initialize sheets from localStorage or initial sheet
  const [sheets, setSheets] = useState<CalendarSheet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading sheets:', e);
    }

    return [
      {
        id: 'sheet_1',
        name: `Kalendarz_${currentSystemYear}_1`,
        employeeName: 'Pracownik 1',
        year: currentSystemYear,
        quotaZalegly: 0,
        quotaBiezacy: 26,
        selectedDays: {},
        isLocked: false,
        createdAt: Date.now(),
      },
    ];
  });

  const [activeSheetId, setActiveSheetId] = useState<string>(() => sheets[0]?.id || 'sheet_1');
  const [activeTool, setActiveTool] = useState<ToolMode>('auto');
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [sheets]);

  // Keep activeSheetId valid
  useEffect(() => {
    if (!sheets.some((s) => s.id === activeSheetId) && sheets.length > 0) {
      setActiveSheetId(sheets[0].id);
    }
  }, [sheets, activeSheetId]);

  const showNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  // Helper to update current active sheet
  const updateCurrentSheet = (updater: (prev: CalendarSheet) => CalendarSheet) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheet.id ? updater(s) : s))
    );
  };

  const handleUpdateEmployeeName = (newName: string) => {
    updateCurrentSheet((prev) => ({
      ...prev,
      employeeName: newName,
      name: newName.trim() ? newName.trim() : prev.name,
    }));
  };

  // Day Click handling
  const handleDayClick = (dateStr: string, currentStatus: DayStatus) => {
    if (activeSheet.isLocked) {
      showNotification('Arkusz jest zablokowany przed edycją.', 'warning');
      return;
    }

    if (currentStatus.isWeekend || currentStatus.holiday) {
      const reason = currentStatus.holiday
        ? `Święto: ${currentStatus.holiday.name}`
        : 'Weekend (dzień wolny)';
      showNotification(`Nie można przypisać urlopu: ${reason}. Urlop przysługuje na dni robocze.`, 'info');
      return;
    }

    updateCurrentSheet((prev) => {
      const nextDays = { ...prev.selectedDays };
      const currentLeave = nextDays[dateStr];

      if (activeTool === 'eraser') {
        delete nextDays[dateStr];
      } else if (activeTool === 'zalegly') {
        if (currentLeave === 'zalegly') {
          delete nextDays[dateStr];
        } else {
          nextDays[dateStr] = 'zalegly';
        }
      } else if (activeTool === 'biezacy') {
        if (currentLeave === 'biezacy') {
          delete nextDays[dateStr];
        } else {
          nextDays[dateStr] = 'biezacy';
        }
      } else {
        // 'auto' cycle: None -> zalegly -> biezacy -> None
        if (!currentLeave) {
          nextDays[dateStr] = 'zalegly';
        } else if (currentLeave === 'zalegly') {
          nextDays[dateStr] = 'biezacy';
        } else {
          delete nextDays[dateStr];
        }
      }

      return {
        ...prev,
        selectedDays: nextDays,
      };
    });
  };

  // Quota update
  const handleUpdateQuota = (quotaZalegly: number, quotaBiezacy: number) => {
    updateCurrentSheet((prev) => ({
      ...prev,
      quotaZalegly,
      quotaBiezacy,
    }));
  };

  // Lock toggle
  const handleToggleLock = (id: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isLocked: !s.isLocked } : s))
    );
    const target = sheets.find((s) => s.id === id);
    if (target) {
      const newState = !target.isLocked;
      showNotification(
        newState ? `Zablokowano arkusz "${target.name}".` : `Odblokowano edycję w "${target.name}".`,
        'info'
      );
    }
  };

  // VBA AktywujEdycjeDlaWszystkich()
  const handleUnlockAll = () => {
    setSheets((prev) => prev.map((s) => ({ ...s, isLocked: false })));
    showNotification(
      `Edycja została aktywowana dla ${sheets.length} arkuszy (makro: AktywujEdycjeDlaWszystkich).`,
      'success'
    );
  };

  // Add sheet
  const handleAddSheet = () => {
    const newNr = sheets.length + 1;
    const empName = `Pracownik ${newNr}`;
    const newSheet: CalendarSheet = {
      id: `sheet_${Date.now()}`,
      name: empName,
      employeeName: empName,
      year: activeSheet.year,
      quotaZalegly: 0,
      quotaBiezacy: 26,
      selectedDays: {},
      isLocked: false,
      createdAt: Date.now(),
    };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
    showNotification(`Utworzono nowy arkusz: "${newSheet.name}".`, 'success');
  };

  // Duplicate sheet
  const handleDuplicateSheet = (id: string) => {
    const target = sheets.find((s) => s.id === id);
    if (!target) return;
    const copyName = `${target.employeeName || target.name} (Kopia)`;
    const newSheet: CalendarSheet = {
      ...target,
      id: `sheet_${Date.now()}`,
      name: copyName,
      employeeName: copyName,
      createdAt: Date.now(),
    };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
    showNotification(`Zduplikowano arkusz "${target.employeeName || target.name}".`, 'info');
  };

  // Rename sheet
  const handleRenameSheet = (id: string, newName: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName, employeeName: newName } : s))
    );
  };

  // Delete sheet
  const handleDeleteSheet = (id: string) => {
    if (sheets.length <= 1) {
      showNotification('Nie można usunąć jedynego arkusza w skoroszycie.', 'warning');
      return;
    }
    const target = sheets.find((s) => s.id === id);
    const targetIndex = sheets.findIndex((s) => s.id === id);
    const remaining = sheets.filter((s) => s.id !== id);

    setSheets(remaining);

    // If deleting currently active sheet, switch smoothly to adjacent sheet
    if (activeSheetId === id && remaining.length > 0) {
      const nextIndex = Math.max(0, Math.min(targetIndex - 1, remaining.length - 1));
      setActiveSheetId(remaining[nextIndex].id);
    }

    showNotification(
      `Pomyślnie usunięto arkusz "${target?.name || id}".`,
      'info'
    );
  };

  // Change Year
  const handleChangeYear = (id: string, newYear: number) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, year: newYear } : s))
    );
  };

  // Clear all leave
  const handleClearAllLeave = () => {
    updateCurrentSheet((prev) => ({
      ...prev,
      selectedDays: {},
    }));
    showNotification('Wyczyszczono wszystkie dni urlopu w arkuszu.', 'info');
  };

  // Remove specific date
  const handleRemoveDate = (dateStr: string) => {
    if (activeSheet.isLocked) return;
    updateCurrentSheet((prev) => {
      const nextDays = { ...prev.selectedDays };
      delete nextDays[dateStr];
      return {
        ...prev,
        selectedDays: nextDays,
      };
    });
  };

  // Apply Range from Modal
  const handleApplyRange = (dates: string[], type: LeaveType) => {
    updateCurrentSheet((prev) => {
      const nextDays = { ...prev.selectedDays };
      dates.forEach((d) => {
        nextDays[d] = type;
      });
      return {
        ...prev,
        selectedDays: nextDays,
      };
    });
    showNotification(
      `Przypisano ${dates.length} dni jako urlop ${type === 'zalegly' ? 'zaległy' : 'bieżący'}.`,
      'success'
    );
  };

  // Batch generate (VBA Sub GenerujKalendarz)
  const handleBatchGenerate = (
    year: number,
    count: number,
    names: string[],
    quotaZalegly: number,
    quotaBiezacy: number
  ) => {
    const newSheets: CalendarSheet[] = names.map((name, idx) => ({
      id: `sheet_${Date.now()}_${idx}`,
      name,
      employeeName: name,
      year,
      quotaZalegly,
      quotaBiezacy,
      selectedDays: {},
      isLocked: false,
      createdAt: Date.now() + idx,
    }));

    setSheets((prev) => [...prev, ...newSheets]);
    if (newSheets.length > 0) {
      setActiveSheetId(newSheets[0].id);
    }
    showNotification(
      `Wygenerowano ${newSheets.length} kalendarzy dla roku ${year} (makro: GenerujKalendarz).`,
      'success'
    );
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      downloadStyledExcel(sheets, activeSheet.id);
      showNotification('Pobrano plik Excela ze szatą graficzną!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Błąd podczas generowania pliku Excel.', 'warning');
    }
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Build calendar month data
  const monthsData = buildYearData(activeSheet.year, activeSheet.selectedDays);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        currentYear={activeSheet.year}
        onChangeYear={(newYear) => handleChangeYear(activeSheet.id, newYear)}
        employeeName={activeSheet.employeeName || activeSheet.name}
        onUpdateEmployeeName={handleUpdateEmployeeName}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenHolidayModal={() => setIsHolidayModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
      />

      {/* Tabs navigation for sheets */}
      <CalendarTabs
        sheets={sheets}
        activeSheetId={activeSheet.id}
        onSelectSheet={setActiveSheetId}
        onAddSheet={handleAddSheet}
        onRenameSheet={handleRenameSheet}
        onDuplicateSheet={handleDuplicateSheet}
        onDeleteSheet={handleDeleteSheet}
        onToggleLock={handleToggleLock}
        onChangeYear={handleChangeYear}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Leave stats bar & tools */}
      <LeaveStatsBar
        sheet={activeSheet}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onUpdateQuota={handleUpdateQuota}
        onOpenRangeModal={() => setIsRangeModalOpen(true)}
        onClearAllLeave={handleClearAllLeave}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Print Header (Only visible on paper print) */}
        <div className="hidden print-only text-center pb-4 border-b border-black">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Plan urlopu – {activeSheet.employeeName || activeSheet.name} (Rok {activeSheet.year})
          </h1>
          <p className="text-xs font-mono mt-1">
            UW {activeSheet.year - 1}: {activeSheet.quotaZalegly} dni | UW {activeSheet.year}: {activeSheet.quotaBiezacy} dni
          </p>
        </div>

        {/* 12 Months Grid */}
        <YearGrid
          monthsData={monthsData}
          isLocked={activeSheet.isLocked}
          activeTool={activeTool}
          onDayClick={handleDayClick}
        />

        {/* Side table columns (AK1:AL & AM1:AN from VBA) */}
        <LeaveListDrawer
          sheet={activeSheet}
          isLocked={activeSheet.isLocked}
          onRemoveDate={handleRemoveDate}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Plan urlopu</span>
            <span>·</span>
            <span>Planowanie i ewidencja urlopów wypoczynkowych</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Algorytm Meeusa/Jonesa</span>
            <span>·</span>
            <span>14 świąt ustawowych w Polsce</span>
            <span>·</span>
            <span>Gotowy do druku A4</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BatchGenerateModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onGenerate={handleBatchGenerate}
        defaultYear={activeSheet.year}
      />

      <RangeSelectModal
        isOpen={isRangeModalOpen}
        onClose={() => setIsRangeModalOpen(false)}
        sheet={activeSheet}
        onApplyRange={handleApplyRange}
      />

      <HolidayListModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        year={activeSheet.year}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        sheets={sheets}
        activeSheetId={activeSheet.id}
        onImportBackup={(importedSheets) => {
          setSheets(importedSheets);
          if (importedSheets[0]) setActiveSheetId(importedSheets[0].id);
          showNotification('Pomyślnie zaimportowano arkusze z pliku kopii!', 'success');
        }}
      />
    </div>
  );
}
