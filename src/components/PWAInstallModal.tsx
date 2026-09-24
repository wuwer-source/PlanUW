import React, { useState } from 'react';
import { Download, Monitor, CheckCircle, HelpCircle, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Uruchamiaj jak program Windows</h3>
            <p className="text-xs text-slate-500">Planer Urlopów jako samodzielna aplikacja na Twoim komputerze</p>
          </div>
        </div>

        {installedSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Aplikacja została zainstalowana!</p>
              <p className="text-xs text-emerald-700">Skrót do Planera Urlopów pojawił się na Twoim Pulpicie / w Menu Start.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-slate-600 mb-6">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Zalety aplikacji okienkowej:
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-600 pl-4 list-disc">
                <li>Osobna ikona <strong>Planer Urlopów</strong> na Twoim Pulpicie Windows i pasku zadań</li>
                <li>Własne okno bez zbędnych pasków, kart i zakładek przeglądarki</li>
                <li>Błyskawiczne uruchamianie jak Notatnik czy Excel</li>
                <li>Działa w 100% z polskimi świętami, kartami pracowników i wydrukiem A4/PDF</li>
              </ul>
            </div>

            {isInstallable ? (
              <div className="space-y-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Download className="w-5 h-5" />
                  Zainstaluj Planer Urlopów na tym komputerze
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Przeglądarka wyświetli okienko potwierdzenia instalacji aplikacji.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Jak zainstalować w 2 kliknięciach:
                </div>
                <div className="text-slate-700 space-y-1 pl-1">
                  <p>
                    <strong>W Microsoft Edge:</strong> Kliknij menu <code>...</code> w prawym górnym rogu ➔ <strong>Aplikacje</strong> ➔ <strong>Zainstaluj Planer Urlopów</strong> (lub ikonę komputera w pasku adresu).
                  </p>
                  <p>
                    <strong>W Google Chrome:</strong> Kliknij menu <code>...</code> w prawym górnym rogu ➔ <strong>Zapisz i udostępnij</strong> ➔ <strong>Zainstaluj Planer Urlopów</strong> (lub ikonę pobierania na pasku adresu po prawej stronie).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
