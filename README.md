# Planer Urlopów i Kalendarz Świąt (React + TypeScript)

Nowoczesna aplikacja webowa do planowania i ewidencji urlopów wypoczynkowych (zaległych i bieżących) z automatycznym wyliczaniem polskich świąt ruchomych i stałych, obsługą wielu arkuszy pracowników, generowaniem kolorowych plików Excel (.xlsx) oraz trybem drukowania A4/PDF.

---

## 🚀 Jak uruchomić z poziomu GitHuba (Krok po kroku)

### Wymagania wstępne
- **Node.js** w wersji 18 lub nowszej ([pobierz z nodejs.org](https://nodejs.org))
- **Git** ([pobierz z git-scm.com](https://git-scm.com))

---

### Krok 1: Klonowanie repozytorium
Otwórz terminal (PowerShell, Git Bash lub terminal w VS Code) i wykonaj:

```bash
git clone https://github.com/TWOJA-NAZWA/NAZWA-REPOZYTORIUM.git
cd NAZWA-REPOZYTORIUM
```

---

### Krok 2: Instalacja zależności
Zainstaluj pakiety z `package.json`:

```bash
npm install
```
*(Możesz też użyć `pnpm install` lub `bun install`)*

---

### Krok 3: Uruchomienie w trybie deweloperskim (Dev)
Aby pracować z kodem na żywo (automatyczne przeładowywanie zmian):

```bash
npm run dev
```

Po uruchomieniu przejdź w przeglądarce pod adres:
👉 **`http://localhost:3000`** (lub port wskazany w terminalu)

---

### Krok 4: Uruchomienie podglądu produkcyjnego (Preview)
Aby przetestować zoptymalizowaną kompilację produkcyjną tak, jak działa na serwerze:

```bash
# 1. Zbuduj zoptymalizowaną wersję do folderu /dist
npm run build

# 2. Uruchom lokalny serwer podglądu Vite
npm run preview
```

Terminal wyświetli adres podglądu (np. `http://localhost:4173`).

---

## 🌐 Jak uruchomić publiczny Preview na GitHub Pages

Jeśli chcesz, aby każdy mógł kliknąć w link i zobaczyć działający kalendarz bezpośrednio z GitHuba:

### Sposób A: GitHub Actions (Automatyczny deploy)
1. W pliku `vite.config.ts` ustaw ścieżkę bazową dla swojego repozytorium:
   ```ts
   export default defineConfig({
     base: '/NAZWA-REPOZYTORIUM/',
     // ...
   });
   ```
2. Na GitHubie wejdź w zakładkę repozytorium **Settings** -> **Pages** -> **Build and deployment**.
3. Jako **Source** wybierz **GitHub Actions** i wskaż szablon **Static HTML** / **Vite**.

### Sposób B: Za pomocą pakietu `gh-pages`
```bash
npm install --save-dev gh-pages
```
W `package.json` dodaj skrypt:
```json
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}
```
Następnie uruchom:
```bash
npm run deploy
```

---

## ⚡ Błyskawiczny deploy na Vercel / Netlify
1. Zaloguj się na [vercel.com](https://vercel.com) lub [netlify.com](https://netlify.com) za pomocą swojego konta GitHub.
2. Kliknij **Add New Project** i wybierz to repozytorium.
3. Framework zostanie automatycznie wykryty jako **Vite**.
4. Kliknij **Deploy** – w kilka sekund otrzymasz publiczny adres URL działającego kalendarza.

---

## 🛠 Dostępne skrypty

| Polecenie | Działanie |
|-----------|-----------|
| `npm run dev` | Uruchamia lokalny serwer Vite na porcie 3000 |
| `npm run build` | Kompiluje aplikację TypeScript do produkcyjnego katalogu `dist/` |
| `npm run preview` | Uruchamia podgląd zbudowanej wersji produkcyjnej |
| `npm run lint` | Sprawdza poprawność typów TypeScript (`tsc --noEmit`) |
| `npm run clean` | Usuwa katalog `dist` |

---

## 📋 Główne funkcjonalności

- **Wielozakładkowość**: tworzenie, usuwanie, zmiana nazwy i duplikowanie arkuszy pracowników.
- **Bezpieczne usuwanie arkuszy**: czytelne okno potwierdzenia z podsumowaniem liczby dni (brak podatności na blokowanie dialogów `confirm()` w iframe).
- **Zarządzanie urlopem**: pule UW zaległego (żółty) i bieżącego (błękitny), automatyczne liczenie salda i najdłuższego ciągu wypoczynku.
- **Święta w Polsce**: automatyczne wyliczanie świąt stałych i ruchomych (Wielkanoc, Boże Ciało).
- **Eksport do Excela**: generowanie plików `.xlsx` z pełną szatą graficzną.
- **Wersja offline**: możliwość pobrania 1 samodzielnego pliku `.html` działającego bez Node.js.
