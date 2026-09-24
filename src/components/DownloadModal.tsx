import React, { useState } from 'react';
import { CalendarSheet } from '../types/calendar';
import { generateStandaloneHtmlFile } from '../utils/standaloneHtml';
import { exportCalendarToExcel } from '../utils/calendarGenerator';
import { downloadStyledExcel } from '../utils/excelStyledGenerator';
import {
  X,
  Download,
  FileCode,
  FileSpreadsheet,
  Terminal,
  Laptop,
  CheckCircle,
  Copy,
  FolderArchive,
  Save,
  Upload,
  Sparkles,
  GitBranch,
  Play,
  AlertCircle,
  ExternalLink,
  Monitor,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheets: CalendarSheet[];
  activeSheetId: string;
  onImportBackup: (importedSheets: CalendarSheet[]) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  sheets,
  activeSheetId,
  onImportBackup,
}) => {
  const [copiedType, setCopiedType] = useState<'dev' | 'preview' | 'git' | null>(null);
  const [activeTab, setActiveTab] = useState<'standalone' | 'excel' | 'backup' | 'source' | 'windows'>('standalone');
  const [backupStatus, setBackupStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleDownloadOfflineHtml = () => {
    const htmlContent = generateStandaloneHtmlFile(sheets);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planer_Urlopow_${sheets[0]?.year || 2026}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcelClassic = () => {
    exportCalendarToExcel(sheets, activeSheetId);
  };

  const handleDownloadExcelStyled = () => {
    downloadStyledExcel(sheets, activeSheetId);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sheets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Kopia_Urlopy_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupStatus({ message: 'Pobrano plik kopii zapasowej JSON!', isError: false });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onImportBackup(parsed);
            setBackupStatus({ message: `Pomyślnie wczytano ${parsed.length} arkuszy z pliku kopii!`, isError: false });
            setTimeout(() => {
              onClose();
            }, 1200);
          } else {
            setBackupStatus({ message: 'Nieprawidłowy format pliku JSON (brak listy arkuszy).', isError: true });
          }
        } catch (err) {
          setBackupStatus({ message: 'Błąd odczytu pliku JSON. Upewnij się, że plik jest poprawny.', isError: true });
        }
      };
    }
  };

  const copyToClipboard = (text: string, type: 'dev' | 'preview' | 'git') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Pobieranie i uruchamianie kalendarza
              </h3>
              <p className="text-xs text-slate-300">
                Uruchomienie z GitHuba, wersja lokalna offline oraz eksport danych
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap ${
              activeTab === 'standalone'
                ? 'bg-white text-slate-900 border-amber-500 border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            1. Samodzielny plik HTML
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap ${
              activeTab === 'excel'
                ? 'bg-white text-slate-900 border-emerald-500 border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            2. Arkusz Excel (.xlsx)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-slate-900 border-purple-500 border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            3. Kopia danych (.json)
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap ${
              activeTab === 'source'
                ? 'bg-white text-slate-900 border-sky-500 border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            4. Cały projekt (.ZIP / React 19)
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-t-2 whitespace-nowrap ${
              activeTab === 'windows'
                ? 'bg-white text-slate-900 border-blue-600 border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            5. Program Windows / Aplikacja Pulpitu
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'standalone' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3.5">
                <FileCode className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1.5">
                  <h4 className="font-bold text-sm text-slate-900">
                    Samodzielny plik HTML – gotowy do uruchomienia od zaraz
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    Pobierasz <strong>jeden plik <code>.html</code></strong> na swój komputer. Nie musisz instalować Node.js ani serwerów. Wystarczy kliknąć dwukrotnie, a otworzy się w przeglądarce.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li><strong>Karty / arkusze pracowników</strong>: dodawaj pracowników, przełączaj karty, duplikuj lub usuwaj arkusze</li>
                    <li><strong>Imię i nazwisko w nagłówku</strong>: duża czcionka w nagłówku ląduje automatycznie w wydruku PDF oraz pliku Excel</li>
                    <li><strong>Suwaki ON/OFF</strong>: przełączanie trybu zaznaczania urlopu zaległego lub bieżącego</li>
                    <li><strong>Zapis / Otwarcie kopii .json</strong>: łatwy eksport i import wszystkich pracowników z pliku</li>
                    <li><strong>Zapisz do Excela</strong>: pobieranie arkusza z pełną szatą graficzną i nazwiskiem pracownika</li>
                    <li><strong>Drukuj (PDF/A4)</strong>: nagłówek dokumentu zawiera imię i nazwisko pracownika</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleDownloadOfflineHtml}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Pobierz plik: Planer_Urlopow.html</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4.5 text-xs text-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span>Jak uruchamiać Planer Urlopów jako program pod Windows (bez pasków przeglądarki)?</span>
                </div>

                <p className="text-slate-700 leading-relaxed text-xs">
                  Aplikacja została w pełni wyposażona we własny manifest aplikacji <strong>(PWA)</strong>, dzięki czemu przeglądarka instaluje ją jako <strong>„Planer Urlopów”</strong> z własną ikoną i niezależnym oknem systemowym.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-2">
                    <h5 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      W Microsoft Edge (zalecane w Windows)
                    </h5>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-xs">
                      <li>Otwórz link aplikacji w <strong>Microsoft Edge</strong>.</li>
                      <li>Kliknij w ikonę <strong>„Dostępna aplikacja. Zainstaluj Planer Urlopów”</strong> na pasku adresu po prawej stronie (lub menu <code>...</code> ➔ <strong>Aplikacje</strong> ➔ <strong>Zainstaluj Planer Urlopów</strong>).</li>
                      <li>Kliknij <strong>Zainstaluj</strong>. Zaznacz opcję <em>„Przypnij do paska zadań”</em> i <em>„Utwórz skrót na pulpicie”</em>.</li>
                    </ol>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-2">
                    <h5 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      W Google Chrome
                    </h5>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-xs">
                      <li>Otwórz link aplikacji w <strong>Google Chrome</strong>.</li>
                      <li>Kliknij ikonę instalacji w pasku adresu (po prawej stronie, obok gwiazdki zakładek) lub menu <code>...</code> ➔ <strong>Zapisz i udostępnij</strong> ➔ <strong>Zainstaluj Planer Urlopów</strong>.</li>
                      <li>Program natychmiast otworzy się we własnym oknie programu Windows.</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-xs text-amber-950">
                  <span className="font-bold text-slate-900 block">
                    Alternatywa 100% offline (ze skrótem Windows do pliku HTML):
                  </span>
                  <p className="text-slate-700">
                    Pobierz plik <code>Planer_Urlopow.html</code> z zakładki 1, umieść go np. w <code>C:\Planer\Planer_Urlopow.html</code>, kliknij prawym przyciskiem myszy ➔ <strong>Wyślij do ➔ Pulpit (utwórz skrót)</strong>. We właściwościach skrótu w polu <em>Element docelowy</em> wpisz:
                  </p>
                  <code className="block bg-slate-900 text-amber-300 p-2 rounded font-mono text-[11px] select-all">
                    msedge.exe --app="file:///C:/Planer/Planer_Urlopow.html"
                  </code>
                  <p className="text-slate-500 text-[11px]">
                    Dzięki temu plik HTML zawsze otworzy się w czystym oknie programu okienkowego bez kart przeglądarki!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              {/* Direct ZIP download box */}
              <div className="bg-linear-to-r from-amber-500 to-amber-600 rounded-xl p-4.5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <FolderArchive className="w-5 h-5 text-amber-100" />
                    Pobierz kompletny projekt w 1 archiwum (.ZIP)
                  </h4>
                  <p className="text-xs text-amber-100 leading-relaxed max-w-xl">
                    Paczka zawiera 100% kodu źródłowego (React 19, TypeScript, Vite, Tailwind CSS), ikony, konfigurację PWA oraz gotowy plik uruchomieniowy <code>URUCHOM_POD_WINDOWS.bat</code>.
                  </p>
                </div>
                <a
                  href="/planer-urlopow-projekt.zip"
                  download="planer-urlopow-projekt.zip"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition-all hover:scale-105 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  Pobierz projekt (.ZIP)
                </a>
              </div>

              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs text-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <GitBranch className="w-4 h-4 text-sky-600" />
                  <span>Jak uruchomić ten pobrany projekt na innym komputerze z Windows?</span>
                </div>

                <div className="p-3 bg-white border border-sky-100 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 block text-xs">
                    Metoda 1: 1 kliknięciem (skrypt Windows BAT dołączony do paczki)
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-xs">
                    <li>Pobierz powyższy plik <code>planer-urlopow-projekt.zip</code> i wypakuj go do dowolnego folderu.</li>
                    <li>Upewnij się, że na komputerze jest zainstalowane środowisko <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-sky-600 underline font-bold">Node.js</a> (darmowe, instalator zajmuje 30 MB).</li>
                    <li>Kliknij dwukrotnie plik: <code className="bg-slate-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">URUCHOM_POD_WINDOWS.bat</code></li>
                    <li>Skrypt sam zainstaluje pakiety, uruchomi serwer i otworzy Planer Urlopów w Twojej przeglądarce Chrome/Edge!</li>
                  </ol>
                </div>

                <div className="p-3 bg-white border border-sky-100 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 block text-xs">
                    Metoda 2: Klasycznie w terminalu (Visual Studio Code / PowerShell)
                  </span>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between">
                    <div>
                      <div>npm install</div>
                      <div>npm run dev</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('npm install\nnpm run dev', 'dev')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                      title="Kopiuj polecenia dev"
                    >
                      {copiedType === 'dev' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Aplikacja wystartuje pod adresem <code>http://localhost:3000</code>. W Chrome możesz wtedy kliknąć menu ➔ <em>Zainstaluj Planer Urlopów</em>, by mieć ikonę na Pulpicie Windows!
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'excel' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1.5">
                  <h4 className="font-bold text-sm text-slate-900">
                    Eksport do programu Microsoft Excel
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    Możesz pobrać arkusz w wersji z pełną szatą graficzną (kolorowe nagłówki miesięcy, weekendy, święta, żółty zaległy i błękitny bieżący) lub w formacie klasycznym .XLSX:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Rok w nagłówku i dynamiczne pule UW</li>
                    <li>12 siatek miesięcy z oznaczeniem świąt i weekendów</li>
                    <li>Tabelaryczna ewidencja wykorzystanych dni urlopu (Lp. i Data)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadExcelClassic}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Klasyczny Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExcelStyled}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Kolorowy Excel (szata graficzna jak HTML)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 space-y-2">
                <h4 className="font-bold text-sm text-slate-900">Kopia zapasowa i przenoszenie danych</h4>
                <p className="text-slate-700 leading-relaxed">
                  Możesz pobrać wszystkie swoje utworzone arkusze pracowników, zaznaczone urlopy i limity jako plik <code>.json</code>, a następnie wczytać je na innym komputerze lub w innej przeglądarce.
                </p>
              </div>

              {backupStatus && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                    backupStatus.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  {backupStatus.isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span>{backupStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex items-center justify-center gap-2 p-3 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-800 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-purple-600" />
                  <span>Eksportuj kopię (.json)</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-3 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-800 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Wczytaj kopię z pliku</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Wszystkie opcje działają w 100% lokalnie w przeglądarce.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
