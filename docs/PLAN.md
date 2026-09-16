# ScratchPeek 0.2 — wygląd i języki

Autor: Sarr. Uzgodniony zakres, 2026-09-16.

## Języki

30 wersji: angielski (`en`), polski (`pl`), niemiecki (`de`), francuski (`fr`),
hiszpański (`es`), portugalski brazylijski (`pt-BR`), portugalski europejski
(`pt-PT`), włoski (`it`), niderlandzki (`nl`), szwedzki (`sv`), duński (`da`),
norweski Bokmål (`nb`), fiński (`fi`), czeski (`cs`), słowacki (`sk`),
ukraiński (`uk`), rosyjski (`ru`), turecki (`tr`), rumuński (`ro`), węgierski
(`hu`), grecki (`el`), arabski (`ar`), hindi (`hi`), indonezyjski (`id`),
wietnamski (`vi`), tajski (`th`), japoński (`ja`), koreański (`ko`), chiński
uproszczony (`zh-CN`) i tradycyjny (`zh-TW`).

Dobór obejmuje duże społeczności językowe oraz szeroki zestaw języków
europejskich. Dwa warianty portugalskiego i dwa chińskiego mają osobne słowniki.
To zakres produktu, nie ranking liczby użytkowników Omarchy.

## Kolejność wdrożenia

- [x] Pełne słowniki wszystkich komunikatów interfejsu.
- [x] Automatyczne wykrywanie preferowanych języków interfejsu Qt przy pierwszym
  uruchomieniu i każdym starcie w trybie `auto`; angielski jako fallback.
- [x] Obsługa kodów regionalnych, skryptów chińskich, list preferencji i aliasów.
- [x] Wyszukiwany wybór języka w panelu, nazwy własne języków, bez flag państw.
- [x] Zapamiętywanie ręcznego wyboru przez Omarchy; powrót do `auto`; zachowanie
  istniejących ustawień i spójność na wszystkich monitorach.
- [x] Układ od prawej do lewej dla arabskiego, bez odwracania fizycznego układu monitorów.
- [x] Akcent bieżącego motywu, osobne wyróżnienie widoczności i fokusu.
- [x] Czytelna etykieta, ikony i nazwy aplikacji, subtelne oznaczenia grup zakładek.
- [x] Schemat monitorów wskazujący miejsce otwarcia scratchpada.
- [x] Autor w stopce, dyskretne przejścia respektujące ustawienia animacji hosta.
- [x] Testy wykrywania języka, kompletności słowników, grup i geometrii monitorów.
- [x] Sprawdzenie w działającym Quickshell, dokumentacja i paczka wydania.

## Uzupełnienie 0.3 — wygląd i kolor

- [x] Podkreślenie na szerokość całej etykiety.
- [x] Paleta koloru, suwak odcienia i pole HEX z walidacją.
- [x] Podgląd na żywo na wszystkich monitorach, bez zapisu przed zatwierdzeniem.
- [x] Zastosuj, Anuluj i powrót do koloru motywu.
- [x] Osobny dymek podpowiedzi: wariant przestronny i kompaktowy.
- [x] Tłumaczenia nowych ustawień we wszystkich 30 katalogach.

## Uzupełnienie 0.4 — opisy i spójny akcent

- [x] Podkreślenie jaśniejsze od wybranego akcentu, zmieniane na żywo.
- [x] Warianty krótki, z nazwą Scratchpad, ON/OFF i własny.
- [x] Sześć własnych opisów i zmienne monitor/licznik/workspace.
- [x] Wspólne opisy paska, panelu i dymka; zapis oraz cofanie podglądu.
- [x] Zachowanie własnych tekstów przy zmianie wariantu i języka.
- [x] Dodatkowe 4 px marginesu poziomego w dymku.
- [x] Nowe ustawienia przetłumaczone na 30 języków.
- [x] Testy stanu, własnych tekstów i zapisu po restarcie powłoki.

## Uzupełnienie 0.5 — skala i źródło koloru

- [x] Osobna skala panelu/dymka i napisu paska, 80–200%.
- [x] Suwaki, wpisywanie procentów, przyciski ± i powrót do 100%.
- [x] Wspólny podgląd na monitorach, zapis oraz cofnięcie bez zmiany kolorów.
- [x] Skalowanie kontrolek, ikon i list razem z tekstem.
- [x] Dopasowanie panelu do ekranu oraz napisu do wysokości paska.
- [x] Kod HEX przy przywracaniu akcentu motywu.
- [x] Cienkie suwaki w kolorze akcentu, we własnym marginesie.
- [x] Rozwijane listy dopasowane do miejsca nad/pod polem przy dużej skali.
- [x] Tłumaczenia nowych kontrolek w 30 językach.

## Uzupełnienie 0.6 — kolory motywów i presety

- [x] Dopasowany różowy dla Tokyo Night i akcenty pozostałych motywów.
- [x] Tryby Dopasowany, Akcent Omarchy i Własny.
- [x] Ustawienia dla jednego motywu lub wszystkich, z zachowaniem osobnych wyborów.
- [x] Własne presety: nazwa, kolor, edycja, usunięcie i wspólny podgląd.
- [x] Zachowanie wcześniejszych ręcznych wyborów podczas aktualizacji.
- [x] Paleta na początku; nowe opcje w domyślnie zwiniętej sekcji pod nią.
- [x] Tłumaczenia wszystkich nowych kontrolek na 30 języków.
- [x] Testy logiki i prawdziwego edytora QML z ustawieniami w pamięci.

## Dalsza weryfikacja przed publikacją

Przegląd tłumaczeń przez rodzimych użytkowników języków. Testy automatyczne
potwierdzają kompletność słowników i podstawienia parametrów, nie jakość
językową. Publiczny katalog i repozytorium pozostają oddzielnym krokiem.
