import { PolishHoliday } from '../types/calendar';

/**
 * Algorytm wyznaczania daty Wielkanocy wg Meeusa/Jonesa/Butchera
 * Dokładna implementacja algorytmu z makra VBA:
 * 
 * a = Y Mod 19
 * b = Y \ 100
 * c = Y Mod 100
 * d = b \ 4
 * e = b Mod 4
 * f = (b + 8) \ 25
 * g = (b - f + 1) \ 3
 * h = (19 * a + b - d - g + 15) Mod 30
 * i = c \ 4
 * k = c Mod 4
 * L = (32 + 2 * e + 2 * i - h - k) Mod 7
 * m = (a + 11 * h + 22 * L) \ 451
 * month = (h + L - 7 * m + 114) \ 31
 * day = ((h + L - 7 * m + 114) Mod 31) + 1
 */
export function obliczWielkanoc(rok: number): Date {
  const a = rok % 19;
  const b = Math.floor(rok / 100);
  const c = rok % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31); // 3 = Marzec, 4 = Kwiecień
  const day = ((h + L - 7 * m + 114) % 31) + 1;

  // Miesiące w JS Date są 0-indeksowane
  return new Date(rok, month - 1, day);
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Zwraca mapę polskich świąt dla podanego roku na podstawie kodu VBA:
 * 
 * Święta stałe:
 * - 1 stycznia: Nowy Rok
 * - 6 stycznia: Święto Trzech Króli (Objawienie Pańskie)
 * - 1 maja: Święto Państwowe / Święto Pracy
 * - 3 maja: Święto Narodowe Trzeciego Maja
 * - 15 sierpnia: Wniebowzięcie NMP i Święto Wojska Polskiego
 * - 1 listopada: Wszystkich Świętych
 * - 11 listopada: Narodowe Święto Niepodległości
 * - 24 grudnia: Wigilia Bożego Narodzenia (zgodnie z podanym makrem)
 * - 25 grudnia: Pierwszy dzień Bożego Narodzenia
 * - 26 grudnia: Drugi dzień Bożego Narodzenia
 * 
 * Święta ruchome:
 * - Wielkanoc (Niedziela Wielkanocna)
 * - Poniedziałek Wielkanocny (Wielkanoc + 1 dzień)
 * - Zesłanie Ducha Świętego / Zielone Świątki (Wielkanoc + 49 dni)
 * - Boże Ciało (Wielkanoc + 60 dni)
 */
export function pobierzPolskieSwieta(rok: number): Map<string, PolishHoliday> {
  const swieta = new Map<string, PolishHoliday>();

  const dodajSwieto = (data: Date, nazwa: string, isMovable: boolean, notes?: string) => {
    const key = formatDateKey(data);
    swieta.set(key, {
      date: key,
      name: nazwa,
      isMovable,
      notes,
    });
  };

  // Święta stałe
  dodajSwieto(new Date(rok, 0, 1), 'Nowy Rok', false);
  dodajSwieto(new Date(rok, 0, 6), 'Święto Trzech Króli', false);
  dodajSwieto(new Date(rok, 4, 1), 'Święto Pracy', false);
  dodajSwieto(new Date(rok, 4, 3), 'Święto Narodowe Trzeciego Maja', false);
  dodajSwieto(new Date(rok, 7, 15), 'Wniebowzięcie NMP / Święto Wojska Polskiego', false);
  dodajSwieto(new Date(rok, 10, 1), 'Wszystkich Świętych', false);
  dodajSwieto(new Date(rok, 10, 11), 'Narodowe Święto Niepodległości', false);
  dodajSwieto(new Date(rok, 11, 24), 'Wigilia Bożego Narodzenia', false, 'Uwzględnione w makrze kalendarza');
  dodajSwieto(new Date(rok, 11, 25), 'Boże Narodzenie (I dzień)', false);
  dodajSwieto(new Date(rok, 11, 26), 'Boże Narodzenie (II dzień)', false);

  // Święta ruchome
  const easter = obliczWielkanoc(rok);
  dodajSwieto(easter, 'Niedziela Wielkanocna', true);
  dodajSwieto(addDays(easter, 1), 'Poniedziałek Wielkanocny', true);
  dodajSwieto(addDays(easter, 49), 'Zielone Świątki (Zesłanie Ducha Świętego)', true);
  dodajSwieto(addDays(easter, 60), 'Boże Ciało', true);

  return swieta;
}

export function formatujDatePL(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dniTygodnia = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
  const dayName = dniTygodnia[dt.getDay()];
  const dzien = String(d).padStart(2, '0');
  const miesiac = String(m).padStart(2, '0');
  return `${dzien}.${miesiac}.${y} (${dayName})`;
}

export const NAZWY_MIESIECY = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

export const SKROTY_DNI = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
