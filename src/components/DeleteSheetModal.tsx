import React from 'react';
import { CalendarSheet } from '../types/calendar';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteSheetModalProps {
  isOpen: boolean;
  sheet: CalendarSheet | null;
  totalSheetsCount: number;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteSheetModal: React.FC<DeleteSheetModalProps> = ({
  isOpen,
  sheet,
  totalSheetsCount,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !sheet) return null;

  const leaveDaysCount = Object.keys(sheet.selectedDays || {}).length;
  const isOnlySheet = totalSheetsCount <= 1;

  const handleConfirm = () => {
    if (isOnlySheet) return;
    onConfirmDelete(sheet.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Usuwanie arkusza
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                Potwierdzenie usunięcia kalendarza
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isOnlySheet ? (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Nie można usunąć jedynego arkusza</p>
                <p className="mt-1 text-slate-600">
                  W skoroszycie musi znajdować się co najmniej jeden kalendarz. Jeśli chcesz usunąć ten arkusz, utwórz najpierw nowy za pomocą przycisku <strong>+ Nowy arkusz</strong>.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 leading-relaxed">
                Czy na pewno chcesz usunąć arkusz <strong className="text-slate-950 font-semibold font-mono">„{sheet.name}”</strong>?
              </p>

              {/* Sheet summary card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Pracownik:</span>
                  <span className="font-semibold text-slate-900">{sheet.employeeName || 'Nie podano'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rok kalendarza:</span>
                  <span className="font-semibold font-mono text-slate-900">{sheet.year}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Zaznaczone dni urlopu:</span>
                  <span className="font-semibold font-mono text-amber-700">{leaveDaysCount} dni</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-rose-700 bg-rose-50/70 border border-rose-200/80 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Wszystkie zaznaczone dni urlopu oraz ustawienia limitów w tym arkuszu zostaną bezpowrotnie usunięte.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isOnlySheet ? 'Rozumiem' : 'Anuluj'}
          </button>

          {!isOnlySheet && (
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Usuń arkusz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
