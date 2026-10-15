import React, { useRef } from 'react';
import { Calendar, Printer, Plus, User, Save, FolderOpen, FileCode, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  currentYear: number;
  onChangeYear: (newYear: number) => void;
  employeeName: string;
  onUpdateEmployeeName: (newName: string) => void;
  onOpenBatchModal: () => void;
  onOpenHolidayModal: () => void;
  onExportExcel: () => void;
  onExportHtml: () => void;
  onPrint: () => void;
  onSaveFile: () => void;
  onOpenFile: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  onChangeYear,
  employeeName,
  onUpdateEmployeeName,
  onOpenBatchModal,
  onExportExcel,
  onExportHtml,
  onPrint,
  onSaveFile,
  onOpenFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Lewa strona: Tytuł, Wybór Roku oraz Nazwisko pracownika */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>

            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap hidden sm:inline">
              Plan urlopu
            </span>

            {/* Wybór roku */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg shadow-2xs shrink-0">
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

            <span className="text-slate-300 font-light text-base hidden md:inline">|</span>

            {/* Pole Imię i Nazwisko */}
            <div
              className="flex items-center gap-1.5 shrink-0"
              title="Wpisz imię i nazwisko pracownika (trafi do nagłówka wydruku PDF oraz pliku Excel)"
            >
              <User className="w-4 h-4 text-amber-500 shrink-0 hidden lg:block" />
              <input
                type="text"
                value={employeeName}
                onChange={(e) => onUpdateEmployeeName(e.target.value)}
                placeholder="Imię i Nazwisko"
                className="text-base sm:text-lg font-extrabold text-slate-900 placeholder:text-slate-400 border-b-2 border-dashed border-amber-400 hover:border-amber-500 focus:border-amber-600 focus:outline-none bg-transparent px-1 py-0.5 w-32 sm:w-44 lg:w-48 transition-colors"
              />
            </div>
          </div>

          {/* Prawa strona paska: Główne przyciski na jednej linii (obok nazwy pracownika) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Wyraźne przyciski zapisu i odczytu kopii JSON */}
            <button
              type="button"
              onClick={onSaveFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer ring-2 ring-blue-300 whitespace-nowrap"
              title="Zapisz plik kopii zapasowej JSON ze wszystkimi arkuszami i urlopami na dysk"
            >
              <Save className="w-4 h-4 shrink-0 text-white" />
              <span>Zapisz plik</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-950 bg-white hover:bg-blue-50 active:bg-blue-100 border-2 border-blue-400 rounded-lg shadow-2xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
              title="Otwórz plik kopii zapasowej JSON i wczytaj swoje dane"
            >
              <FolderOpen className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Otwórz plik</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Separator */}
            <div className="h-5 w-px bg-slate-200 hidden lg:block" />

            {/* Eksporty: Drukuj, Excel, HTML */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Wydrukuj kalendarz (A4 / PDF z imieniem pracownika w nagłówku)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Drukuj (PDF)</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Pobierz plik XLSX ze szatą graficzną i imieniem pracownika w nagłówku"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={onExportHtml}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Pobierz w 100% samodzielny plik HTML do uruchomienia offline na komputerze"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Eksport HTML</span>
              <span className="sm:hidden">HTML</span>
            </button>

            {/* Generuj kalendarz */}
            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow whitespace-nowrap shrink-0"
              title="Generuj nowy kalendarz lub serię arkuszy dla pracowników"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span className="whitespace-nowrap">Generuj kalendarz</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
