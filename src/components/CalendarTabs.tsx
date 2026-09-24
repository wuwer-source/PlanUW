import React, { useState } from 'react';
import { CalendarSheet } from '../types/calendar';
import { Plus, Lock, Unlock, Copy, Trash2, Edit2, Check, X } from 'lucide-react';
import { DeleteSheetModal } from './DeleteSheetModal';

interface CalendarTabsProps {
  sheets: CalendarSheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onDeleteSheet: (id: string) => void;
  onToggleLock: (id: string) => void;
  onChangeYear?: (id: string, newYear: number) => void;
}

export const CalendarTabs: React.FC<CalendarTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRenameSheet,
  onDuplicateSheet,
  onDeleteSheet,
  onToggleLock,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [sheetToDelete, setSheetToDelete] = useState<CalendarSheet | null>(null);

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  const startEditing = (sheet: CalendarSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sheet.id);
    setEditName(sheet.employeeName || sheet.name);
  };

  const saveEditing = (id: string) => {
    if (editName.trim()) {
      onRenameSheet(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleRequestDelete = (sheet: CalendarSheet, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSheetToDelete(sheet);
  };

  return (
    <>
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 lg:px-8 pt-3 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
            {/* Tabs row */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-1">
              {sheets.map((sheet) => {
                const isActive = sheet.id === activeSheetId;
                const isEditing = editingId === sheet.id;

                return (
                  <div
                    key={sheet.id}
                    onClick={() => onSelectSheet(sheet.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all cursor-pointer select-none whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-slate-900 border-t-2 border-t-amber-500 border-x border-slate-200 shadow-2xs font-semibold'
                        : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing(sheet.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="px-1.5 py-0.5 text-xs bg-white border border-amber-500 rounded outline-none w-32"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditing(sheet.id)}
                          className="text-emerald-600 hover:text-emerald-700 p-0.5"
                          title="Zapisz nazwę"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Anuluj"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          {sheet.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          ) : null}
                          <span className="font-semibold">{sheet.employeeName || sheet.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            ({sheet.year})
                          </span>
                        </span>

                        {/* Action buttons on tab */}
                        <div
                          className={`flex items-center gap-1 ml-1 transition-opacity ${
                            isActive
                              ? 'opacity-80 group-hover:opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => startEditing(sheet, e)}
                            title="Zmień imię i nazwisko pracownika"
                            className="p-1 hover:text-slate-900 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateSheet(sheet.id);
                            }}
                            title="Duplikuj arkusz pracownika"
                            className="p-1 hover:text-slate-900 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRequestDelete(sheet, e)}
                            title={
                              sheets.length <= 1
                                ? 'Nie można usunąć jedynego arkusza'
                                : `Usuń arkusz "${sheet.employeeName || sheet.name}"`
                            }
                            className={`p-1 rounded cursor-pointer ${
                              sheets.length <= 1
                                ? 'text-slate-300 hover:text-slate-400'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Quick add tab */}
              <button
                type="button"
                onClick={onAddSheet}
                title="Dodaj nowy arkusz dla kolejnego pracownika"
                className="px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nowy pracownik</span>
              </button>
            </div>

            {/* Active sheet controls: Lock toggle & Delete Sheet button */}
            {activeSheet && (
              <div className="flex flex-wrap items-center gap-2 py-1">
                {/* Lock toggle button */}
                <button
                  type="button"
                  onClick={() => onToggleLock(activeSheet.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer shadow-2xs ${
                    activeSheet.isLocked
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  title={
                    activeSheet.isLocked
                      ? 'Arkusz zablokowany (ochrona komórek). Kliknij, aby odblokować.'
                      : 'Zablokuj arkusz przed przypadkowymi zmianami.'
                  }
                >
                  {activeSheet.isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Zablokowany</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edycja dozwolona</span>
                    </>
                  )}
                </button>

                {/* Explicit "Usuń arkusz" button for active sheet */}
                <button
                  type="button"
                  onClick={() => handleRequestDelete(activeSheet)}
                  disabled={sheets.length <= 1}
                  title={
                    sheets.length <= 1
                      ? 'W skoroszycie musi pozostać co najmniej jeden arkusz pracownika'
                      : `Usuń arkusz pracownika "${activeSheet.employeeName || activeSheet.name}"`
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer shadow-2xs ${
                    sheets.length <= 1
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-300 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Usuń arkusz</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Sheet Confirmation Modal */}
      <DeleteSheetModal
        isOpen={sheetToDelete !== null}
        sheet={sheetToDelete}
        totalSheetsCount={sheets.length}
        onClose={() => setSheetToDelete(null)}
        onConfirmDelete={onDeleteSheet}
      />
    </>
  );
};
