import { CalendarSheet } from '../types/calendar';

/**
 * Generuje w 100% samodzielny, pojedynczy plik HTML, który:
 * - Posiada czysty nagłówek "Planer Urlopów" (bez "i Kalendarz Świąt" i bez "Offline")
 * - Posiada duże pole "Imię i Nazwisko" w nagłówku o identycznej wielkości czcionki co tytuł
 * - Obsługuje wiele kart/arkuszy pracowników z dodawaniem, przełączaniem, duplikowaniem i usuwaniem
 * - Po wydrukowaniu do PDF/A4 oraz eksporcie do Excela imię i nazwisko pracownika ląduje w nagłówku dokumentu
 * - Posiada suwaki ON/OFF w kartach UW Zaległy i UW Bieżący
 * - Generuje kolorowy arkusz Excela (.xls) z pełną szatą graficzną
 * - Obsługuje zapis i odczyt kopii zapasowej (.json)
 */
export function generateStandaloneHtmlFile(sheets: CalendarSheet[]): string {
  // Przygotuj początkową listę arkuszy
  const initialSheets = sheets && sheets.length > 0
    ? sheets.map((s) => ({
        id: s.id,
        name: s.name,
        employeeName: s.employeeName || s.name,
        year: s.year || 2026,
        quotaZalegly: s.quotaZalegly ?? 0,
        quotaBiezacy: s.quotaBiezacy ?? 26,
        selectedDays: s.selectedDays || {},
        activeMode: 'zalegly',
      }))
    : [
        {
          id: 'sheet_1',
          name: 'Pracownik 1',
          employeeName: 'Pracownik 1',
          year: 2026,
          quotaZalegly: 0,
          quotaBiezacy: 26,
          selectedDays: {},
          activeMode: 'zalegly',
        },
      ];

  const initialJson = JSON.stringify(initialSheets).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planer Urlopów</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --zalegly-bg: #fef08a;
      --zalegly-border: #facc15;
      --zalegly-text: #713f12;
      --biezacy-bg: #bae6fd;
      --biezacy-border: #38bdf8;
      --biezacy-text: #0c4a6e;
      --holiday-bg: #ffe4e6;
      --holiday-border: #fda4af;
      --holiday-text: #881337;
      --weekend-bg: #fff1f2;
      --weekend-text: #be123c;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 0;
    }
    header {
      background: #0f172a;
      color: #ffffff;
      padding: 0.85rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header-brand { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .header-brand h1 {
      font-size: 1.25rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }
    .brand-divider { color: #64748b; font-size: 1.25rem; font-weight: 300; }
    
    .employee-header-box {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .employee-header-input {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      background: transparent;
      border: none;
      border-bottom: 2px dashed #f59e0b;
      padding: 0.1rem 0.35rem;
      outline: none;
      min-width: 170px;
      max-width: 280px;
      transition: border-color 0.2s;
    }
    .employee-header-input:focus {
      border-bottom-style: solid;
      border-bottom-color: #fbbf24;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px 4px 0 0;
    }
    .employee-header-input::placeholder {
      color: #94a3b8;
      font-weight: 600;
    }

    .nav-actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    
    .btn {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 0.45rem 0.85rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
      user-select: none;
    }
    .btn:hover { background: #f1f5f9; transform: translateY(-1px); }
    .btn-dark { background: #334155; color: #ffffff; border-color: #475569; }
    .btn-dark:hover { background: #475569; }
    .btn-emerald { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
    .btn-emerald:hover { background: #d1fae5; }
    .btn-purple { background: #faf5ff; color: #6b21a8; border-color: #e9d5ff; }
    .btn-purple:hover { background: #f3e8ff; }
    .btn-amber { background: #fef08a; color: #713f12; border-color: #facc15; }
    .btn-amber:hover { background: #fde047; }
    .btn-danger { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .btn-danger:hover { background: #fecaca; }

    .container { max-width: 1440px; margin: 0 auto; padding: 1.25rem; }

    /* TABS BAR (KARTY / ARKUSZE PRACOWNIKÓW) */
    .tabs-bar {
      background: #e2e8f0;
      border-bottom: 2px solid #cbd5e1;
      padding: 0.4rem 1.5rem 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      overflow-x: auto;
    }
    .tabs-list {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      overflow-x: auto;
    }
    .tab-item {
      padding: 0.5rem 0.9rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #475569;
      background: #cbd5e1;
      border-radius: 0.5rem 0.5rem 0 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      white-space: nowrap;
      transition: all 0.15s ease;
      user-select: none;
    }
    .tab-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .tab-item.active {
      background: #ffffff;
      color: #0f172a;
      border-top: 3px solid #f59e0b;
      font-weight: 700;
      box-shadow: 0 -2px 5px rgba(0,0,0,0.03);
    }
    .tab-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: 0.3rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
      color: #64748b;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .tab-btn:hover {
      background: rgba(0,0,0,0.08);
      color: #0f172a;
    }
    .tab-btn.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Confirm Bar */
    #confirmBar {
      display: none;
      background: #fef2f2;
      border: 1px solid #f87171;
      border-radius: 0.75rem;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.25rem;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* STATS & SWITCHES */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .stat-card {
      background: #ffffff;
      border: 2px solid var(--border);
      border-radius: 0.85rem;
      padding: 1.1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      position: relative;
      transition: all 0.2s;
    }
    .stat-card.active-mode {
      border-color: #0f172a;
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.15);
    }
    .stat-card.zalegly { background: #fefce8; border-color: #fde047; }
    .stat-card.zalegly.active-mode { border-color: #ca8a04; box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.25); }
    .stat-card.biezacy { background: #f0f9ff; border-color: #7dd3fc; }
    .stat-card.biezacy.active-mode { border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.25); }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .stat-title { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-val { font-size: 1.6rem; font-weight: 800; font-family: ui-monospace, monospace; margin: 0.2rem 0; }
    .stat-desc { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }

    /* TOGGLE SWITCH ON / OFF */
    .toggle-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
      padding-top: 0.65rem;
      border-top: 1px dashed rgba(0,0,0,0.12);
    }
    .toggle-label {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .switch-box {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 24px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: .2s;
      border-radius: 24px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    input:checked + .slider { background-color: #0f172a; }
    .switch-zalegly input:checked + .slider { background-color: #ca8a04; }
    .switch-biezacy input:checked + .slider { background-color: #0284c7; }
    input:checked + .slider:before { transform: translateX(24px); }

    .badge-status {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 0.35rem;
      text-transform: uppercase;
    }
    .badge-on { background: #dcfce7; color: #15803d; }
    .badge-off { background: #f1f5f9; color: #94a3b8; }

    /* TOOLBAR & INSTRUCTIONS */
    .toolbar {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .legend { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; font-size: 0.78rem; font-weight: 600; }
    .legend-item { display: flex; align-items: center; gap: 0.35rem; }
    .color-box { width: 15px; height: 15px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.15); }

    /* 12 MONTHS GRID */
    .months-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .month-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .month-header {
      background: #1e293b;
      color: #ffffff;
      padding: 0.5rem 0.85rem;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      justify-content: space-between;
    }
    .days-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #f8fafc;
      border-bottom: 1px solid var(--border);
      text-align: center;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.35rem 0;
      color: #64748b;
    }
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
      padding: 0.4rem;
    }
    .day-cell {
      height: 33px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: transform 0.08s, background-color 0.15s;
      position: relative;
      border: 1px solid transparent;
    }
    .day-cell:hover { transform: scale(1.08); z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .day-cell.empty { pointer-events: none; opacity: 0; }
    .day-cell.regular { background: #ffffff; border-color: #f1f5f9; color: #1e293b; }
    .day-cell.weekend { background: var(--weekend-bg); color: var(--weekend-text); font-weight: 700; }
    .day-cell.holiday { background: var(--holiday-bg); color: var(--holiday-text); font-weight: 800; border-color: var(--holiday-border); }
    .day-cell.zalegly { background: var(--zalegly-bg); color: var(--zalegly-text); border-color: var(--zalegly-border); font-weight: 800; }
    .day-cell.biezacy { background: var(--biezacy-bg); color: var(--biezacy-text); border-color: var(--biezacy-border); font-weight: 800; }

    /* EWIDENCJA SECTION */
    .list-section {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 0.85rem;
      padding: 1.25rem;
      margin-top: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .list-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .list-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 768px) { .list-grid { grid-template-columns: 1fr; } }
    .list-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .list-table th, .list-table td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #f1f5f9; text-align: left; }
    .list-table th { background: #f8fafc; font-weight: 700; color: #475569; }
    .list-table tr:hover { background: #f8fafc; }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: #0f172a;
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.82rem;
      font-weight: 500;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
      display: none;
      z-index: 100;
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* PRINT STYLES - STRONA 1: KALENDARZ, STRONA 2: EWIDENCJA */
    .print-header { display: none; }

    @media print {
      header, .tabs-bar, .nav-actions, .toolbar, #confirmBar, #toast, .toggle-wrapper { display: none !important; }
      body { background: #ffffff !important; color: #000000 !important; font-size: 11pt !important; }
      .container { max-width: 100% !important; padding: 0 !important; }
      
      .print-header {
        display: block !important;
        text-align: center;
        padding-bottom: 0.5rem;
        margin-bottom: 0.75rem;
        border-bottom: 2px solid #000000;
      }
      .print-header h1 {
        font-size: 1.3rem !important;
        font-weight: 800 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }
      .print-header p {
        font-size: 0.85rem !important;
        font-family: ui-monospace, monospace !important;
        color: #334155 !important;
      }

      .stats-bar {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 0.5rem !important;
        page-break-inside: avoid;
        margin-bottom: 0.8rem !important;
      }
      .stat-card { border: 1px solid #cbd5e1 !important; padding: 0.6rem !important; box-shadow: none !important; }
      .stat-val { font-size: 1.2rem !important; }
      
      .months-grid {
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 6px !important;
        page-break-inside: avoid;
        page-break-after: always; /* Strona 1: Siatka kalendarza */
      }
      .month-header { background: #1e293b !important; color: #ffffff !important; padding: 0.25rem 0.5rem !important; font-size: 0.75rem !important; }
      .day-cell { height: 26px !important; font-size: 0.68rem !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      
      /* Strona 2: Ewidencja wykorzystanych dni urlopu */
      .list-section {
        display: block !important;
        page-break-before: always; /* Zawsze na 2. stronie wydruku */
        border: none !important;
        padding: 1rem 0 !important;
        box-shadow: none !important;
      }
      .list-title { font-size: 1.15rem !important; border-bottom: 2px solid #000000 !important; padding-bottom: 0.5rem !important; }
      .list-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
      .list-table th, .list-table td { border: 1px solid #cbd5e1 !important; padding: 0.35rem !important; }
      .list-table th { background: #f1f5f9 !important; color: #000000 !important; }
    }
  </style>
</head>
<body>

  <!-- Pasek górny (Header) -->
  <header>
    <div class="header-brand">
      <h1>📅 Plan urlopu</h1>
      <div style="display:flex; align-items:center; gap:0.35rem; margin-left:0.5rem; background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:8px;">
        <label style="font-size:0.8rem; font-weight:600; color:#e2e8f0;">Rok:</label>
        <input
          type="number"
          id="yearInput"
          value="2026"
          min="1900"
          max="2100"
          style="padding:0.25rem 0.4rem; border-radius:6px; border:1px solid #475569; width:70px; font-weight:bold; background:#1e293b; color:#fff;"
        />
      </div>
      <span class="brand-divider">|</span>
      
      <!-- Pole wpisania Imię i Nazwisko o tej samej dużej czcionce co Plan urlopu -->
      <div class="employee-header-box" title="Wpisz imię i nazwisko pracownika (trafi do nagłówka wydruku PDF oraz pliku Excel)">
        <input
          type="text"
          id="employeeNameInput"
          placeholder="Imię i Nazwisko"
          class="employee-header-input"
          oninput="zmienImieNazwisko(this.value)"
        />
      </div>
    </div>

    <div class="nav-actions">

      <!-- Zapisz do Excela (ze szatą graficzną i imieniem w nagłówku) -->
      <button class="btn btn-emerald" onclick="zapiszDoExcela()" title="Pobierz plik Excela z imieniem pracownika w nagłówku i szatą graficzną">
        📊 Zapisz do Excela
      </button>

      <!-- Zapisz kopię .json -->
      <button class="btn btn-purple" onclick="zapiszKopieJson()" title="Zapisz kopię zapasową wszystkich arkuszy jako plik .json">
        💾 Zapisz kopię (.json)
      </button>

      <!-- Otwórz kopię .json -->
      <label class="btn btn-purple" title="Wczytaj dane z wcześniej zapisanego pliku .json" style="margin:0;">
        📂 Otwórz kopię (.json)
        <input type="file" id="importJsonInput" accept=".json" style="display:none;" onchange="otworzKopieJson(event)">
      </label>

      <!-- Drukuj / PDF -->
      <button class="btn" onclick="drukujKalendarz()" title="Wydrukuj kalendarz (A4 / PDF) z imieniem pracownika w nagłówku">
        🖨️ Drukuj (PDF/A4)
      </button>

      <!-- Wyczyść kalendarz -->
      <button class="btn btn-danger" onclick="pokazPotwierdzenieCzyszczenia()" title="Wyczyść wszystkie zaznaczone dni urlopu aktywnego pracownika">
        🗑️ Wyczyść urlop
      </button>
    </div>
  </header>

  <!-- Pasek kart/arkuszy pracowników (Karty / Arkusze) -->
  <div class="tabs-bar" id="tabsBar">
    <div class="tabs-list" id="sheetsTabsList">
      <!-- Generowane dynamicznie w JS -->
    </div>
    <button class="btn btn-dark" onclick="dodajNowyArkusz()" title="Dodaj nowy arkusz dla kolejnego pracownika" style="white-space:nowrap; padding:0.35rem 0.75rem; font-size:0.78rem;">
      ➕ Nowy pracownik
    </button>
  </div>

  <div class="container">
    <!-- Nagłówek drukowany na papierze / PDF -->
    <div class="print-header">
      <h1 id="printDocTitle">PLANER URLOPÓW – PRACOWNIK 1 (ROK 2026)</h1>
      <p id="printDocSubtitle">UW 2025: 0 DNI | UW 2026: 26 DNI</p>
    </div>

    <!-- Pasek potwierdzenia akcji (czyszczenie / usuwanie) -->
    <div id="confirmBar">
      <div style="display:flex; align-items:center; gap:0.6rem; color:#991b1b; font-size:0.85rem; font-weight:600;">
        <span id="confirmMessage">⚠️ Czy na pewno chcesz wykonać tę operację?</span>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-danger" id="confirmActionBtn">Tak, wykonaj</button>
        <button class="btn" onclick="ukryjPotwierdzenie()">Anuluj</button>
      </div>
    </div>

    <!-- KARTY LIMITÓW Z SUWAKAMI ON/OFF -->
    <div class="stats-bar">
      <!-- Karta 1: Zaległy -->
      <div class="stat-card zalegly active-mode" id="cardZalegly">
        <div class="stat-header">
          <span class="stat-title" id="titleZalegly">UW 2025 (Zaległy)</span>
          <span style="font-size:0.75rem; font-weight:600;">
            Limit: <input type="number" id="quotaZalegly" value="0" min="0" max="100" style="width:45px; text-align:right; font-weight:bold; padding:2px;"> dni
          </span>
        </div>
        <div class="stat-val" id="valZalegly">0 / 0</div>
        <div class="stat-desc" id="descZalegly">Pozostało: 0 dni</div>

        <!-- Suwak ON/OFF dla urlopu zaległego -->
        <div class="toggle-wrapper">
          <span class="toggle-label">Tryb zaznaczania:</span>
          <div class="switch-box" onclick="przelaczTryb('zalegly')">
            <span class="badge-status badge-on" id="badgeZalegly">WŁĄCZONY</span>
            <label class="switch switch-zalegly" onclick="event.stopPropagation()">
              <input type="checkbox" id="switchZalegly" checked onchange="przelaczTryb('zalegly')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Karta 2: Bieżący -->
      <div class="stat-card biezacy" id="cardBiezacy">
        <div class="stat-header">
          <span class="stat-title" id="titleBiezacy">UW 2026 (Bieżący)</span>
          <span style="font-size:0.75rem; font-weight:600;">
            Limit: <input type="number" id="quotaBiezacy" value="26" min="0" max="100" style="width:45px; text-align:right; font-weight:bold; padding:2px;"> dni
          </span>
        </div>
        <div class="stat-val" id="valBiezacy">0 / 26</div>
        <div class="stat-desc" id="descBiezacy">Pozostało: 26 dni</div>

        <!-- Suwak ON/OFF dla urlopu bieżącego -->
        <div class="toggle-wrapper">
          <span class="toggle-label">Tryb zaznaczania:</span>
          <div class="switch-box" onclick="przelaczTryb('biezacy')">
            <span class="badge-status badge-off" id="badgeBiezacy">WYŁĄCZONY</span>
            <label class="switch switch-biezacy" onclick="event.stopPropagation()">
              <input type="checkbox" id="switchBiezacy" onchange="przelaczTryb('biezacy')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Karta 3: Łączny bilans -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">ŁĄCZNY BILANS URLOPU</span>
          <span style="font-size:0.75rem; color:#64748b;" id="totalQuotaLabel">Pula: 26 dni</span>
        </div>
        <div class="stat-val" id="valTotal">0 dni</div>
        <div class="stat-desc" id="descTotal">Pozostało łącznie: 26 dni</div>
        <div class="toggle-wrapper" style="justify-content:flex-start; color:#64748b; font-size:0.75rem;">
          <span>💡 Klikaj dni robocze, aby przypisać urlop bieżącego pracownika.</span>
        </div>
      </div>
    </div>

    <!-- Pasek narzędzi & Legenda -->
    <div class="toolbar">
      <div class="legend">
        <span style="font-weight:800; color:#0f172a;">Legenda:</span>
        <div class="legend-item"><span class="color-box" style="background:#fef08a; border-color:#facc15;"></span> Urlop zaległy</div>
        <div class="legend-item"><span class="color-box" style="background:#bae6fd; border-color:#38bdf8;"></span> Urlop bieżący</div>
        <div class="legend-item"><span class="color-box" style="background:#ffe4e6; border-color:#fda4af;"></span> Święto ustawowe</div>
        <div class="legend-item"><span class="color-box" style="background:#fff1f2; border-color:#fecdd3;"></span> Weekend</div>
      </div>
      <div style="font-size:0.78rem; font-weight:600;" id="activeModeInfo">
        Aktywny pędzel: <span style="background:#fef08a; padding:2px 8px; border-radius:4px; color:#713f12; border:1px solid #facc15;">Urlop zaległy</span>
      </div>
    </div>

    <!-- Siatka 12 miesięcy -->
    <div class="months-grid" id="calendarGrid"></div>

    <!-- EWIDENCJA WYKORZYSTANYCH DNI URLOPU (Drukuje się na 2. stronie) -->
    <div class="list-section" id="ewidencjaSection">
      <div class="list-title">
        <span>📋 Ewidencja wykorzystanych dni urlopu – <strong id="printListEmployeeName">Pracownik 1</strong></span>
        <span style="font-size:0.75rem; font-weight:normal; color:#64748b; margin-left:auto;" id="listTotalDays">Łącznie: 0 dni</span>
      </div>
      <div class="list-grid">
        <div>
          <h4 style="font-size:0.8rem; font-weight:700; color:#713f12; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span style="width:10px; height:10px; background:#fef08a; border:1px solid #facc15; border-radius:2px;"></span>
            Urlop zaległy (<span id="countZaleglyList">0</span>)
          </h4>
          <table class="list-table" id="tableZalegly">
            <thead><tr><th style="width:45px;">Lp.</th><th>Data zaległy</th><th style="width:40px;"></th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div>
          <h4 style="font-size:0.8rem; font-weight:700; color:#0c4a6e; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span style="width:10px; height:10px; background:#bae6fd; border:1px solid #38bdf8; border-radius:2px;"></span>
            Urlop bieżący (<span id="countBiezacyList">0</span>)
          </h4>
          <table class="list-table" id="tableBiezacy">
            <thead><tr><th style="width:45px;">Lp.</th><th>Data bieżący</th><th style="width:40px;"></th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div id="toast">Powiadomienie</div>

  <script>
    // Algorytm Meeusa/Jonesa wyznaczania Wielkanocy
    function obliczWielkanoc(Y) {
      var a = Y % 19;
      var b = Math.floor(Y / 100);
      var c = Y % 100;
      var d = Math.floor(b / 4);
      var e = b % 4;
      var f = Math.floor((b + 8) / 25);
      var g = Math.floor((b - f + 1) / 3);
      var h = (19 * a + b - d - g + 15) % 30;
      var i = Math.floor(c / 4);
      var k = c % 4;
      var L = (32 + 2 * e + 2 * i - h - k) % 7;
      var m = Math.floor((a + 11 * h + 22 * L) / 451);
      var month = Math.floor((h + L - 7 * m + 114) / 31);
      var day = ((h + L - 7 * m + 114) % 31) + 1;
      return new Date(Y, month - 1, day);
    }

    function addDays(date, days) {
      var d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    }

    function formatDateKey(d) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }

    function pobierzPolskieSwieta(rok) {
      var swieta = {};
      var dodaj = function(d, nazwa) { swieta[formatDateKey(d)] = nazwa; };

      // Święta stałe
      dodaj(new Date(rok, 0, 1), 'Nowy Rok');
      dodaj(new Date(rok, 0, 6), 'Święto Trzech Króli');
      dodaj(new Date(rok, 4, 1), 'Święto Pracy');
      dodaj(new Date(rok, 4, 3), 'Święto Narodowe Trzeciego Maja');
      dodaj(new Date(rok, 7, 15), 'Wniebowzięcie NMP');
      dodaj(new Date(rok, 10, 1), 'Wszystkich Świętych');
      dodaj(new Date(rok, 10, 11), 'Narodowe Święto Niepodległości');
      dodaj(new Date(rok, 11, 24), 'Wigilia Bożego Narodzenia');
      dodaj(new Date(rok, 11, 25), 'Boże Narodzenie (I)');
      dodaj(new Date(rok, 11, 26), 'Boże Narodzenie (II)');

      // Święta ruchome
      var easter = obliczWielkanoc(rok);
      dodaj(easter, 'Niedziela Wielkanocna');
      dodaj(addDays(easter, 1), 'Poniedziałek Wielkanocny');
      dodaj(addDays(easter, 49), 'Zielone Świątki');
      dodaj(addDays(easter, 60), 'Boże Ciało');

      return swieta;
    }

    var nazwyMiesiecy = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
    var skrotyDni = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];

    // Stan aplikacji z obsługą wielu arkuszy / kart pracowników
    var appState = {
      sheets: ${initialJson},
      activeSheetId: '${initialSheets[0]?.id || 'sheet_1'}'
    };

    // Wczytaj z localStorage jeśli istnieje
    try {
      var saved = localStorage.getItem('vba_calendar_offline_v3');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.sheets && Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
          appState.sheets = parsed.sheets;
          appState.activeSheetId = parsed.activeSheetId || parsed.sheets[0].id;
        } else if (parsed && typeof parsed === 'object') {
          var migrated = {
            id: 'sheet_1',
            name: parsed.employeeName || parsed.name || 'Pracownik 1',
            employeeName: parsed.employeeName || parsed.name || 'Pracownik 1',
            year: parsed.year || 2026,
            quotaZalegly: parsed.quotaZalegly || 0,
            quotaBiezacy: parsed.quotaBiezacy || 26,
            selectedDays: parsed.selectedDays || {},
            activeMode: parsed.activeMode || 'zalegly'
          };
          appState.sheets = [migrated];
          appState.activeSheetId = migrated.id;
        }
      }
    } catch(e) {}

    function getActiveSheet() {
      if (!appState.sheets || !Array.isArray(appState.sheets) || appState.sheets.length === 0) {
        appState.sheets = [{
          id: 'sheet_1',
          name: 'Pracownik 1',
          employeeName: 'Pracownik 1',
          year: 2026,
          quotaZalegly: 0,
          quotaBiezacy: 26,
          selectedDays: {},
          activeMode: 'zalegly'
        }];
        appState.activeSheetId = appState.sheets[0].id;
      }
      for (var i = 0; i < appState.sheets.length; i++) {
        if (appState.sheets[i].id === appState.activeSheetId) {
          return appState.sheets[i];
        }
      }
      appState.activeSheetId = appState.sheets[0].id;
      return appState.sheets[0];
    }

    function zapiszStan() {
      try {
        localStorage.setItem('vba_calendar_offline_v3', JSON.stringify(appState));
      } catch(e) {}
    }

    function pokazPowiadomienie(msg) {
      var toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(function() {
        toast.style.display = 'none';
      }, 3000);
    }

    // Aktualizacja imienia i nazwiska pracownika z poziomu dużego pola w nagłówku
    function zmienImieNazwisko(newVal) {
      var sheet = getActiveSheet();
      sheet.employeeName = newVal;
      if (newVal.trim()) {
        sheet.name = newVal.trim();
      }
      zapiszStan();
      renderTabs();
      aktualizujNaglowkiWydruku();
    }

    function aktualizujNaglowkiWydruku() {
      var sheet = getActiveSheet();
      var emp = sheet.employeeName || sheet.name || 'Pracownik';
      var y = sheet.year;
      document.getElementById('printDocTitle').textContent = 'PLANER URLOPÓW – ' + emp.toUpperCase() + ' (ROK ' + y + ')';
      document.getElementById('printDocSubtitle').textContent = 'UW ' + (y - 1) + ': ' + sheet.quotaZalegly + ' DNI | UW ' + y + ': ' + sheet.quotaBiezacy + ' DNI';
      document.getElementById('printListEmployeeName').textContent = emp;
      document.getElementById('yearInput').value = y;
    }

    // Renderowanie kart / arkuszy pracowników
    function renderTabs() {
      var container = document.getElementById('sheetsTabsList');
      container.innerHTML = '';

      appState.sheets.forEach(function(sheet) {
        var isActive = sheet.id === appState.activeSheetId;
        var tab = document.createElement('div');
        tab.className = 'tab-item' + (isActive ? ' active' : '');
        tab.onclick = function() { wybierzArkusz(sheet.id); };

        var nameSpan = document.createElement('span');
        nameSpan.textContent = (sheet.employeeName || sheet.name) + ' (' + sheet.year + ')';
        tab.appendChild(nameSpan);

        if (isActive) {
          var actions = document.createElement('span');
          actions.className = 'tab-actions';

          // Duplikuj
          var dupBtn = document.createElement('button');
          dupBtn.className = 'tab-btn';
          dupBtn.title = 'Duplikuj arkusz pracownika';
          dupBtn.innerHTML = '📋';
          dupBtn.onclick = function(e) {
            e.stopPropagation();
            duplikujArkusz(sheet.id);
          };
          actions.appendChild(dupBtn);

          // Usuń
          if (appState.sheets.length > 1) {
            var delBtn = document.createElement('button');
            delBtn.className = 'tab-btn danger';
            delBtn.title = 'Usuń ten arkusz pracownika';
            delBtn.innerHTML = '🗑️';
            delBtn.onclick = function(e) {
              e.stopPropagation();
              pokazPotwierdzenieUsuniecia(sheet.id);
            };
            actions.appendChild(delBtn);
          }

          tab.appendChild(actions);
        }

        container.appendChild(tab);
      });
    }

    function wybierzArkusz(id) {
      appState.activeSheetId = id;
      zapiszStan();
      renderTabs();
      zaladujDaneArkusza();
      renderCalendar();
    }

    function dodajNowyArkusz() {
      var current = getActiveSheet();
      var newNr = appState.sheets.length + 1;
      var empName = 'Pracownik ' + newNr;
      var newSheet = {
        id: 'sheet_' + Date.now(),
        name: empName,
        employeeName: empName,
        year: current.year,
        quotaZalegly: 0,
        quotaBiezacy: 26,
        selectedDays: {},
        activeMode: 'zalegly'
      };
      appState.sheets.push(newSheet);
      appState.activeSheetId = newSheet.id;
      zapiszStan();
      renderTabs();
      zaladujDaneArkusza();
      renderCalendar();
      pokazPowiadomienie('Dodano nowy arkusz dla: ' + empName);
    }

    function duplikujArkusz(id) {
      var source = getActiveSheet();
      var copyName = (source.employeeName || source.name) + ' (Kopia)';
      var duplicated = {
        id: 'sheet_' + Date.now(),
        name: copyName,
        employeeName: copyName,
        year: source.year,
        quotaZalegly: source.quotaZalegly,
        quotaBiezacy: source.quotaBiezacy,
        selectedDays: Object.assign({}, source.selectedDays),
        activeMode: source.activeMode || 'zalegly'
      };
      appState.sheets.push(duplicated);
      appState.activeSheetId = duplicated.id;
      zapiszStan();
      renderTabs();
      zaladujDaneArkusza();
      renderCalendar();
      pokazPowiadomienie('Zduplikowano arkusz pracownika');
    }

    function pokazPotwierdzenieUsuniecia(id) {
      if (appState.sheets.length <= 1) {
        alert('Nie można usunąć jedynego arkusza!');
        return;
      }
      var sheet = getActiveSheet();
      var bar = document.getElementById('confirmBar');
      var msg = document.getElementById('confirmMessage');
      var btn = document.getElementById('confirmActionBtn');

      msg.innerHTML = '⚠️ Czy na pewno chcesz usunąć arkusz pracownika: <strong>' + (sheet.employeeName || sheet.name) + '</strong>?';
      btn.textContent = 'Tak, usuń arkusz';
      btn.onclick = function() {
        wykonajUsuniecieArkusza(id);
      };
      bar.style.display = 'flex';
      bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function wykonajUsuniecieArkusza(id) {
      var newSheets = appState.sheets.filter(function(s) { return s.id !== id; });
      appState.sheets = newSheets;
      appState.activeSheetId = newSheets[0].id;
      ukryjPotwierdzenie();
      zapiszStan();
      renderTabs();
      zaladujDaneArkusza();
      renderCalendar();
      pokazPowiadomienie('Usunięto arkusz pracownika.');
    }

    function zaladujDaneArkusza() {
      var sheet = getActiveSheet();
      document.getElementById('employeeNameInput').value = sheet.employeeName || sheet.name || '';
      document.getElementById('yearInput').value = sheet.year;
      document.getElementById('quotaZalegly').value = sheet.quotaZalegly;
      document.getElementById('quotaBiezacy').value = sheet.quotaBiezacy;
      document.getElementById('titleZalegly').textContent = 'UW ' + (sheet.year - 1) + ' (Zaległy)';
      document.getElementById('titleBiezacy').textContent = 'UW ' + sheet.year + ' (Bieżący)';

      // Ustawienie przełączników
      var mode = sheet.activeMode || 'zalegly';
      ustawWidokTrybu(mode);
      aktualizujNaglowkiWydruku();
    }

    function ustawWidokTrybu(mode) {
      var sheet = getActiveSheet();
      sheet.activeMode = mode;
      
      var isZal = mode === 'zalegly';
      document.getElementById('switchZalegly').checked = isZal;
      document.getElementById('switchBiezacy').checked = !isZal;

      document.getElementById('badgeZalegly').textContent = isZal ? 'WŁĄCZONY' : 'WYŁĄCZONY';
      document.getElementById('badgeZalegly').className = 'badge-status ' + (isZal ? 'badge-on' : 'badge-off');

      document.getElementById('badgeBiezacy').textContent = !isZal ? 'WŁĄCZONY' : 'WYŁĄCZONY';
      document.getElementById('badgeBiezacy').className = 'badge-status ' + (!isZal ? 'badge-on' : 'badge-off');

      var cardZ = document.getElementById('cardZalegly');
      var cardB = document.getElementById('cardBiezacy');
      if (isZal) {
        cardZ.classList.add('active-mode');
        cardB.classList.remove('active-mode');
        document.getElementById('activeModeInfo').innerHTML = 'Aktywny pędzel: <span style="background:#fef08a; padding:2px 8px; border-radius:4px; color:#713f12; border:1px solid #facc15;">Urlop zaległy</span>';
      } else {
        cardB.classList.add('active-mode');
        cardZ.classList.remove('active-mode');
        document.getElementById('activeModeInfo').innerHTML = 'Aktywny pędzel: <span style="background:#bae6fd; padding:2px 8px; border-radius:4px; color:#0c4a6e; border:1px solid #38bdf8;">Urlop bieżący</span>';
      }
    }

    function przelaczTryb(nowyTryb) {
      var sheet = getActiveSheet();
      if (sheet.activeMode === nowyTryb) {
        sheet.activeMode = (nowyTryb === 'zalegly') ? 'biezacy' : 'zalegly';
      } else {
        sheet.activeMode = nowyTryb;
      }
      ustawWidokTrybu(sheet.activeMode);
      zapiszStan();
    }

    function pokazPotwierdzenieCzyszczenia() {
      var sheet = getActiveSheet();
      var bar = document.getElementById('confirmBar');
      var msg = document.getElementById('confirmMessage');
      var btn = document.getElementById('confirmActionBtn');

      msg.innerHTML = '⚠️ Czy na pewno chcesz wyczyścić wszystkie zaznaczone dni urlopu dla pracownika <strong>' + (sheet.employeeName || sheet.name) + '</strong> w roku ' + sheet.year + '?';
      btn.textContent = 'Tak, wyczyść urlop';
      btn.onclick = function() {
        wykonajWyczyszczenie();
      };
      bar.style.display = 'flex';
      bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function ukryjPotwierdzenie() {
      document.getElementById('confirmBar').style.display = 'none';
    }

    function wykonajWyczyszczenie() {
      var sheet = getActiveSheet();
      sheet.selectedDays = {};
      ukryjPotwierdzenie();
      zapiszStan();
      renderCalendar();
      pokazPowiadomienie('Wyczyszczono wszystkie dni urlopu dla: ' + (sheet.employeeName || sheet.name));
    }

    // Kliknięcie w dzień w kalendarzu
    function onDayClick(dateStr, isWeekend, isHoliday) {
      if (isWeekend || isHoliday) {
        pokazPowiadomienie('Dni weekendowe i święta są wolne od pracy.');
        return;
      }

      var sheet = getActiveSheet();
      var current = sheet.selectedDays[dateStr];
      var targetMode = sheet.activeMode || 'zalegly';

      if (current === targetMode) {
        delete sheet.selectedDays[dateStr];
      } else {
        sheet.selectedDays[dateStr] = targetMode;
      }

      zapiszStan();
      renderCalendar();
    }

    function usunDzienZListy(dateStr) {
      var sheet = getActiveSheet();
      if (sheet.selectedDays[dateStr]) {
        delete sheet.selectedDays[dateStr];
        zapiszStan();
        renderCalendar();
      }
    }

    // Renderowanie siatki kalendarza
    function renderCalendar() {
      var sheet = getActiveSheet();
      var container = document.getElementById('calendarGrid');
      container.innerHTML = '';

      var swieta = pobierzPolskieSwieta(sheet.year);
      var zalegle = [];
      var biezace = [];

      for (var m = 0; m < 12; m++) {
        var card = document.createElement('div');
        card.className = 'month-card';

        var head = document.createElement('div');
        head.className = 'month-header';
        head.innerHTML = '<span>' + nazwyMiesiecy[m] + '</span><span>' + sheet.year + '</span>';
        card.appendChild(head);

        var daysHead = document.createElement('div');
        daysHead.className = 'days-header';
        for (var d = 0; d < 7; d++) {
          var dh = document.createElement('div');
          dh.textContent = skrotyDni[d];
          if (d >= 5) dh.style.color = '#be123c';
          daysHead.appendChild(dh);
        }
        card.appendChild(daysHead);

        var grid = document.createElement('div');
        grid.className = 'days-grid';

        var firstDate = new Date(sheet.year, m, 1);
        var jsDay = firstDate.getDay();
        var offset = (jsDay + 6) % 7;
        var daysInMonth = new Date(sheet.year, m + 1, 0).getDate();

        for (var i = 0; i < offset; i++) {
          var empty = document.createElement('div');
          empty.className = 'day-cell empty';
          grid.appendChild(empty);
        }

        for (var day = 1; day <= daysInMonth; day++) {
          var dateKey = sheet.year + '-' + String(m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          var dt = new Date(sheet.year, m, day);
          var dayOfWeek = dt.getDay();
          var isWk = (dayOfWeek === 0 || dayOfWeek === 6);
          var holName = swieta[dateKey];
          var leaveType = sheet.selectedDays[dateKey];

          if (leaveType === 'zalegly') zalegle.push(dateKey);
          if (leaveType === 'biezacy') biezace.push(dateKey);

          var cell = document.createElement('div');
          cell.className = 'day-cell';
          cell.textContent = day;

          if (leaveType === 'zalegly') {
            cell.classList.add('zalegly');
            cell.title = dateKey + ': Urlop zaległy';
          } else if (leaveType === 'biezacy') {
            cell.classList.add('biezacy');
            cell.title = dateKey + ': Urlop bieżący';
          } else if (holName) {
            cell.classList.add('holiday');
            cell.title = dateKey + ': ' + holName;
          } else if (isWk) {
            cell.classList.add('weekend');
            cell.title = dateKey + ': Weekend';
          } else {
            cell.classList.add('regular');
            cell.title = dateKey;
          }

          (function(k, wk, hol) {
            cell.onclick = function() { onDayClick(k, wk, hol); };
          })(dateKey, isWk, Boolean(holName));

          grid.appendChild(cell);
        }

        card.appendChild(grid);
        container.appendChild(card);
      }

      aktualizujStatystyki(zalegle, biezace);
      renderListy(zalegle, biezace);
      aktualizujNaglowkiWydruku();
    }

    function aktualizujStatystyki(zalegle, biezace) {
      var sheet = getActiveSheet();
      var zCount = zalegle.length;
      var bCount = biezace.length;
      var total = zCount + bCount;
      var totalQuota = sheet.quotaZalegly + sheet.quotaBiezacy;

      document.getElementById('valZalegly').textContent = zCount + ' / ' + sheet.quotaZalegly;
      var remZ = sheet.quotaZalegly - zCount;
      document.getElementById('descZalegly').textContent = remZ >= 0 ? 'Pozostało: ' + remZ + ' dni' : 'Przekroczono o: ' + Math.abs(remZ) + ' dni!';
      document.getElementById('descZalegly').style.color = remZ < 0 ? '#b91c1c' : '';

      document.getElementById('valBiezacy').textContent = bCount + ' / ' + sheet.quotaBiezacy;
      var remB = sheet.quotaBiezacy - bCount;
      document.getElementById('descBiezacy').textContent = remB >= 0 ? 'Pozostało: ' + remB + ' dni' : 'Przekroczono o: ' + Math.abs(remB) + ' dni!';
      document.getElementById('descBiezacy').style.color = remB < 0 ? '#b91c1c' : '';

      document.getElementById('totalQuotaLabel').textContent = 'Pula: ' + totalQuota + ' dni';
      document.getElementById('valTotal').textContent = total + ' dni';
      var remTotal = totalQuota - total;
      document.getElementById('descTotal').textContent = remTotal >= 0 ? 'Pozostało łącznie: ' + remTotal + ' dni' : 'Przekroczono łącznie o ' + Math.abs(remTotal) + ' dni!';
      document.getElementById('descTotal').style.color = remTotal < 0 ? '#b91c1c' : '';
    }

    function renderListy(zalegle, biezace) {
      zalegle.sort();
      biezace.sort();

      document.getElementById('listTotalDays').textContent = 'Łącznie: ' + (zalegle.length + biezace.length) + ' dni';
      document.getElementById('countZaleglyList').textContent = zalegle.length;
      document.getElementById('countBiezacyList').textContent = biezace.length;

      var tbodyZ = document.querySelector('#tableZalegly tbody');
      tbodyZ.innerHTML = '';
      if (zalegle.length === 0) {
        tbodyZ.innerHTML = '<tr><td colspan="3" style="color:#94a3b8; text-align:center; padding:0.6rem;">Brak wykorzystanych dni</td></tr>';
      } else {
        zalegle.forEach(function(dStr, idx) {
          var tr = document.createElement('tr');
          var td1 = document.createElement('td');
          td1.style.fontWeight = 'bold';
          td1.style.color = '#64748b';
          td1.textContent = (idx + 1) + '.';
          var td2 = document.createElement('td');
          td2.style.fontFamily = 'monospace';
          td2.style.fontWeight = '600';
          td2.textContent = dStr;
          var td3 = document.createElement('td');
          td3.style.textAlign = 'right';
          var btn = document.createElement('button');
          btn.className = 'btn btn-danger';
          btn.style.cssText = 'padding:1px 6px; font-size:0.7rem; cursor:pointer;';
          btn.textContent = '×';
          btn.onclick = function() { usunDzienZListy(dStr); };
          td3.appendChild(btn);
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbodyZ.appendChild(tr);
        });
      }

      var tbodyB = document.querySelector('#tableBiezacy tbody');
      tbodyB.innerHTML = '';
      if (biezace.length === 0) {
        tbodyB.innerHTML = '<tr><td colspan="3" style="color:#94a3b8; text-align:center; padding:0.6rem;">Brak wykorzystanych dni</td></tr>';
      } else {
        biezace.forEach(function(dStr, idx) {
          var tr = document.createElement('tr');
          var td1 = document.createElement('td');
          td1.style.fontWeight = 'bold';
          td1.style.color = '#64748b';
          td1.textContent = (idx + 1) + '.';
          var td2 = document.createElement('td');
          td2.style.fontFamily = 'monospace';
          td2.style.fontWeight = '600';
          td2.textContent = dStr;
          var td3 = document.createElement('td');
          td3.style.textAlign = 'right';
          var btn = document.createElement('button');
          btn.className = 'btn btn-danger';
          btn.style.cssText = 'padding:1px 6px; font-size:0.7rem; cursor:pointer;';
          btn.textContent = '×';
          btn.onclick = function() { usunDzienZListy(dStr); };
          td3.appendChild(btn);
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbodyB.appendChild(tr);
        });
      }
    }

    // EKSPORT DO EXCELA (.XLS) ZE SZATĄ GRAFICZNĄ I IMIENIEM W NAGŁÓWKU
    function zapiszDoExcela() {
      var sheet = getActiveSheet();
      var year = sheet.year;
      var emp = sheet.employeeName || sheet.name || 'Pracownik';
      var swieta = pobierzPolskieSwieta(year);

      var zalegle = [];
      var biezace = [];
      Object.keys(sheet.selectedDays).forEach(function(k) {
        if (sheet.selectedDays[k] === 'zalegly') zalegle.push(k);
        if (sheet.selectedDays[k] === 'biezacy') biezace.push(k);
      });
      zalegle.sort();
      biezace.sort();

      var safeSheetName = emp.replace(/[:\\\\/?*[\\]]/g, '_').substring(0, 31);

      var xml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      xml += '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
      xml += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>' + safeSheetName + '</x:Name>';
      xml += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
      xml += '<style>';
      xml += 'body { font-family: Calibri, sans-serif; font-size: 11pt; color: #0f172a; }';
      xml += 'table { border-collapse: collapse; }';
      xml += 'td { padding: 4px 6px; vertical-align: middle; text-align: center; }';
      xml += '.t-main { font-size: 16pt; font-weight: bold; color: #0f172a; text-align: left; }';
      xml += '.t-rok { font-size: 14pt; font-weight: bold; color: #b45309; }';
      xml += '.card-z { background-color: #fefce8; border: 2px solid #facc15; font-weight: bold; color: #713f12; }';
      xml += '.card-b { background-color: #f0f9ff; border: 2px solid #38bdf8; font-weight: bold; color: #0c4a6e; }';
      xml += '.m-head { background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 11pt; }';
      xml += '.wk-head { background-color: #f8fafc; color: #475569; font-weight: bold; font-size: 9pt; border-bottom: 1px solid #cbd5e1; }';
      xml += '.we-head { background-color: #fff1f2; color: #be123c; font-weight: bold; font-size: 9pt; border-bottom: 1px solid #cbd5e1; }';
      xml += '.cell-reg { background-color: #ffffff; border: 1px solid #e2e8f0; color: #0f172a; }';
      xml += '.cell-we { background-color: #fff1f2; border: 1px solid #fecdd3; color: #be123c; font-weight: bold; }';
      xml += '.cell-hol { background-color: #ffe4e6; border: 1px solid #fda4af; color: #881337; font-weight: bold; }';
      xml += '.cell-zal { background-color: #fef08a; border: 1px solid #facc15; color: #713f12; font-weight: bold; }';
      xml += '.cell-bie { background-color: #bae6fd; border: 1px solid #38bdf8; color: #0c4a6e; font-weight: bold; }';
      xml += '.t-head { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left; }';
      xml += '.t-cell { border-bottom: 1px solid #e2e8f0; text-align: left; }';
      xml += '</style></head><body><table>';

      // Nagłówek z imieniem pracownika
      xml += '<tr>';
      xml += '<td colspan="15" class="t-main">Planer Urlopów – ' + emp + '</td>';
      xml += '<td colspan="4"></td>';
      xml += '<td colspan="4" class="t-rok">Rok ' + year + '</td>';
      xml += '<td colspan="10"></td>';
      xml += '</tr>';
      xml += '<tr><td colspan="35" style="height:10px;"></td></tr>';

      // Paski limitów
      xml += '<tr>';
      xml += '<td colspan="7" class="card-z">UW ' + (year - 1) + ' (Zaległy): ' + zalegle.length + ' / ' + sheet.quotaZalegly + ' DNI</td>';
      xml += '<td colspan="2"></td>';
      xml += '<td colspan="7" class="card-b">UW ' + year + ' (Bieżący): ' + biezace.length + ' / ' + sheet.quotaBiezacy + ' DNI</td>';
      xml += '<td colspan="2"></td>';
      xml += '<td colspan="6" style="background:#f1f5f9; font-weight:bold; border:1px solid #cbd5e1;">Łącznie: ' + (zalegle.length + biezace.length) + ' dni</td>';
      xml += '<td colspan="11"></td>';
      xml += '</tr>';
      xml += '<tr><td colspan="35" style="height:15px;"></td></tr>';

      // 12 miesięcy (3 bloki po 4 miesiące)
      for (var rowBlock = 0; rowBlock < 3; rowBlock++) {
        var startMonth = rowBlock * 4;

        // Nagłówki miesięcy
        xml += '<tr>';
        for (var col = 0; col < 4; col++) {
          var m = startMonth + col;
          xml += '<td colspan="7" class="m-head">' + nazwyMiesiecy[m] + ' ' + year + '</td>';
          if (col < 3) xml += '<td style="width:12px;"></td>';
        }
        if (rowBlock === 0) {
          xml += '<td style="width:20px;"></td><td colspan="2" class="t-head">Ewidencja wykorzystanych dni urlopu (Zaległy)</td><td style="width:12px;"></td><td colspan="2" class="t-head">Ewidencja wykorzystanych dni urlopu (Bieżący)</td>';
        }
        xml += '</tr>';

        // Dni tygodnia
        xml += '<tr>';
        for (var col = 0; col < 4; col++) {
          for (var d = 0; d < 7; d++) {
            xml += '<td class="' + (d >= 5 ? 'we-head' : 'wk-head') + '">' + skrotyDni[d] + '</td>';
          }
          if (col < 3) xml += '<td></td>';
        }
        if (rowBlock === 0) {
          xml += '<td></td><td style="font-weight:bold; border-bottom:2px solid #cbd5e1;">Lp.</td><td style="font-weight:bold; border-bottom:2px solid #cbd5e1;">Data zaległy</td><td></td><td style="font-weight:bold; border-bottom:2px solid #cbd5e1;">Lp.</td><td style="font-weight:bold; border-bottom:2px solid #cbd5e1;">Data bieżący</td>';
        }
        xml += '</tr>';

        // 6 tygodni
        for (var w = 0; w < 6; w++) {
          xml += '<tr>';
          for (var col = 0; col < 4; col++) {
            var m = startMonth + col;
            var firstDate = new Date(year, m, 1);
            var jsDay = firstDate.getDay();
            var offset = (jsDay + 6) % 7;
            var daysInMonth = new Date(year, m + 1, 0).getDate();

            for (var d = 0; d < 7; d++) {
              var dayNum = w * 7 + d - offset + 1;
              if (dayNum < 1 || dayNum > daysInMonth) {
                xml += '<td style="background:#f8fafc; border:1px solid #f1f5f9;"></td>';
              } else {
                var dKey = year + '-' + String(m + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
                var dt = new Date(year, m, dayNum);
                var dow = dt.getDay();
                var isWk = (dow === 0 || dow === 6);
                var hol = swieta[dKey];
                var lv = sheet.selectedDays[dKey];

                if (lv === 'zalegly') xml += '<td class="cell-zal">' + dayNum + '</td>';
                else if (lv === 'biezacy') xml += '<td class="cell-bie">' + dayNum + '</td>';
                else if (hol) xml += '<td class="cell-hol">' + dayNum + '</td>';
                else if (isWk) xml += '<td class="cell-we">' + dayNum + '</td>';
                else xml += '<td class="cell-reg">' + dayNum + '</td>';
              }
            }
            if (col < 3) xml += '<td></td>';
          }

          // Ewidencja obok
          var listIdx = rowBlock * 6 + w;
          var itemZ = zalegle[listIdx];
          var itemB = biezace[listIdx];
          xml += '<td></td>';
          xml += '<td class="t-cell" style="text-align:center;">' + (itemZ ? listIdx + 1 : '') + '</td>';
          xml += '<td class="t-cell">' + (itemZ || '') + '</td>';
          xml += '<td></td>';
          xml += '<td class="t-cell" style="text-align:center;">' + (itemB ? listIdx + 1 : '') + '</td>';
          xml += '<td class="t-cell">' + (itemB || '') + '</td>';

          xml += '</tr>';
        }
        xml += '<tr><td colspan="35" style="height:12px;"></td></tr>';
      }

      // Pozostałe pozycje listy
      var maxItems = Math.max(zalegle.length, biezace.length);
      for (var idx = 18; idx < maxItems; idx++) {
        xml += '<tr><td colspan="32"></td>';
        xml += '<td class="t-cell" style="text-align:center;">' + (zalegle[idx] ? idx + 1 : '') + '</td>';
        xml += '<td class="t-cell">' + (zalegle[idx] || '') + '</td>';
        xml += '<td></td>';
        xml += '<td class="t-cell" style="text-align:center;">' + (biezace[idx] ? idx + 1 : '') + '</td>';
        xml += '<td class="t-cell">' + (biezace[idx] || '') + '</td>';
        xml += '</tr>';
      }

      xml += '</table></body></html>';

      var blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var empSlug = emp.replace(/[\\s\\\\/*?[\\]:]+/g, '_');
      a.download = 'Planer_Urlopow_' + empSlug + '_' + year + '.xls';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      pokazPowiadomienie('Pobrano plik Excela z imieniem w nagłówku!');
    }

    // ZAPISZ KOPIĘ .JSON (ze wszystkimi kartami pracowników)
    function zapiszKopieJson() {
      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState.sheets, null, 2));
      var a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'Kopia_Planer_Urlopow_' + Date.now() + '.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
      pokazPowiadomienie('Zapisano kopię zapasową wszystkich arkuszy (.json)');
    }

    // OTWÓRZ KOPIĘ .JSON
    function otworzKopieJson(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var parsed = JSON.parse(evt.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            appState.sheets = parsed;
            appState.activeSheetId = parsed[0].id;
            zapiszStan();
            renderTabs();
            zaladujDaneArkusza();
            renderCalendar();
            pokazPowiadomienie('Pomyślnie wczytano ' + parsed.length + ' arkuszy pracowników!');
          } else if (parsed && typeof parsed === 'object') {
            // Pojedynczy arkusz
            var single = {
              id: 'sheet_' + Date.now(),
              name: parsed.employeeName || parsed.name || 'Pracownik 1',
              employeeName: parsed.employeeName || parsed.name || 'Pracownik 1',
              year: parsed.year || 2026,
              quotaZalegly: parsed.quotaZalegly || 0,
              quotaBiezacy: parsed.quotaBiezacy || 26,
              selectedDays: parsed.selectedDays || {},
              activeMode: parsed.activeMode || 'zalegly'
            };
            appState.sheets = [single];
            appState.activeSheetId = single.id;
            zapiszStan();
            renderTabs();
            zaladujDaneArkusza();
            renderCalendar();
            pokazPowiadomienie('Pomyślnie wczytano arkusz z pliku!');
          } else {
            alert('Plik nie zawiera poprawnych danych kalendarza.');
          }
        } catch(err) {
          alert('Błąd odczytu pliku JSON: ' + err.message);
        }
        e.target.value = '';
      };
      reader.readAsText(file, 'UTF-8');
    }

    // Zmiana roku
    document.getElementById('yearInput').onchange = function(e) {
      var sheet = getActiveSheet();
      sheet.year = parseInt(e.target.value) || 2026;
      zapiszStan();
      renderTabs();
      zaladujDaneArkusza();
      renderCalendar();
    };

    // Zmiana limitów
    document.getElementById('quotaZalegly').onchange = function(e) {
      var sheet = getActiveSheet();
      sheet.quotaZalegly = parseInt(e.target.value) || 0;
      zapiszStan();
      renderCalendar();
    };
    document.getElementById('quotaBiezacy').onchange = function(e) {
      var sheet = getActiveSheet();
      sheet.quotaBiezacy = parseInt(e.target.value) || 0;
      zapiszStan();
      renderCalendar();
    };

    function drukujKalendarz() {
      aktualizujNaglowkiWydruku();
      window.print();
    }

    // Udostępnienie funkcji dla zdarzeń inline
    window.zmienImieNazwisko = zmienImieNazwisko;
    window.dodajNowyArkusz = dodajNowyArkusz;
    window.wybierzArkusz = wybierzArkusz;
    window.duplikujArkusz = duplikujArkusz;
    window.pokazPotwierdzenieUsuniecia = pokazPotwierdzenieUsuniecia;
    window.wykonajUsuniecieArkusza = wykonajUsuniecieArkusza;
    window.przelaczTryb = przelaczTryb;
    window.pokazPotwierdzenieCzyszczenia = pokazPotwierdzenieCzyszczenia;
    window.ukryjPotwierdzenie = ukryjPotwierdzenie;
    window.wykonajWyczyszczenie = wykonajWyczyszczenie;
    window.onDayClick = onDayClick;
    window.usunDzienZListy = usunDzienZListy;
    window.zapiszDoExcela = zapiszDoExcela;
    window.zapiszKopieJson = zapiszKopieJson;
    window.otworzKopieJson = otworzKopieJson;
    window.drukujKalendarz = drukujKalendarz;

    // Inicjalizacja przy pierwszym załadowaniu
    renderTabs();
    zaladujDaneArkusza();
    renderCalendar();
  </script>
</body>
</html>`;
}
