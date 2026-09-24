import React from 'react';
import { Calendar, Download, Printer, Plus, BookOpen, Laptop, User } from 'lucide-react';

interface HeaderProps {
  currentYear: number;
  onChangeYear: (newYear: number) => void;
  employeeName: string;
  onUpdateEmployeeName: (newName: string) => void;
  onOpenBatchModal: () => void;
  onOpenHolidayModal: () => void;
  onOpenDownloadModal: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  onChangeYear,
  employeeName,
  onUpdateEmployeeName,
  onOpenBatchModal,
  onOpenHolidayModal,
  onOpenDownloadModal,
  onExportExcel,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Zone 1: Wordmark "Plan urlopu", Year selector right next to it, & Employee Name Input */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                Plan urlopu
              </span>

              {/* Okienko wyboru roku z boku tytułu */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">Rok:</span>
                <select
                  value={currentYear}
                  onChange={(e) => onChangeYear(Number(e.target.value))}
                  className="bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  title="Wybierz rok kalendarzowy"
                >
                  {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <span className="hidden sm:inline text-slate-300 font-light text-lg">|</span>
              <div
                className="flex items-center gap-1.5 min-w-0"
                title="Wpisz imię i nazwisko pracownika (trafi do nagłówka wydruku PDF oraz pliku Excel)"
              >
                <User className="w-4 h-4 text-amber-500 shrink-0 hidden sm:block" />
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => onUpdateEmployeeName(e.target.value)}
                  placeholder="Imię i Nazwisko"
                  className="text-lg sm:text-xl font-extrabold text-slate-900 placeholder:text-slate-400 border-b-2 border-dashed border-amber-400 hover:border-amber-500 focus:border-amber-600 focus:outline-none bg-transparent px-1 py-0.5 w-40 sm:w-56 md:w-64 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation / Info tabs */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={onOpenHolidayModal}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>Święta w Polsce ({currentYear})</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 border border-amber-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Pobierz kalendarz na dysk komputera (plik HTML offline, Excel, kopia .json lub projekt)"
            >
              <Laptop className="w-4 h-4 text-slate-900" />
              <span className="hidden sm:inline">Pobierz na komputer</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Wydrukuj kalendarz (A4 / PDF z imieniem pracownika w nagłówku)"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Drukuj (PDF)</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
              title="Pobierz plik XLSX z imieniem pracownika w nagłówku"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow"
              title="Generuj nowy kalendarz lub serię arkuszy dla pracowników"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Generuj kalendarz</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
