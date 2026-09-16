# ScratchPeek

**Zobacz, co masz w scratchpadzie i gdzie jest otwarty.** Autor: **Sarr**.

Wtyczka paska Omarchy pokazuje liczbę okien i stan scratchpada pod Super + S:
**pusty**, **ukryty**, **otwarty tutaj**, **aktywny tutaj** albo **otwarty na innym
monitorze**. Każda zakładka liczy się jako osobne okno.

- Lewy przycisk: pokaż lub schowaj scratchpad na tym monitorze.
- Najechanie myszą: lista aplikacji.
- Prawy lub środkowy przycisk: panel z listą okien i ich tytułami.
- Kliknięcie okna na liście: przejście do niego.
- Strzałki góra/dół lub Tab: przejście przez okna, przycisk i wybór języka;
  Enter: zatwierdzenie; Escape: zamknięcie.
- Ikony aplikacji, oznaczenia grup zakładek i schemat położenia monitorów.
- Akcent motywu wskazuje widoczność, mocniejsze tło oznacza fokus w scratchpadzie.

To scratchpad **okien**, a nie historia kopiowanych tekstów i obrazów.

## Instalacja

Wymagane jest Omarchy Quattro z paskiem `omarchy-shell`. Nie są potrzebne
dodatkowe pakiety. Instrukcja lokalnej instalacji i wymagania są w
[README](../README.md#install). Kod jest zapisany w obecnie prywatnym repozytorium
[Sarr77/ScratchPeek](https://github.com/Sarr77/ScratchPeek). Po jego upublicznieniu wystarczy:

```bash
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

## Skala

Prawy przycisk → **Skala / Scale**. Osobno powiększysz **panel i dymek** oraz
**napis na pasku**. Zakres to **80–200%**: suwak, przyciski ± lub wpisanie
procentu. Przycisk **100%** przywraca rozmiar wynikający z ustawień Omarchy.
Rosną tekst, ikony, przyciski, pola i rozwijane listy. Panel dopasowuje się do
ekranu i w razie potrzeby przewija. Cienki suwak w kolorze akcentu ma własny
odstęp przy krawędzi, poza treścią i przyciskami. Napis mieści się w istniejącej wysokości
paska; jeśli ogranicza ona rozmiar, zobaczysz faktycznie używany procent.

Podgląd działa na wszystkich monitorach. **Zastosuj** zapisuje wybór;
**Anuluj**, Escape lub zamknięcie panelu cofają podgląd. Kolory i własne
opisy pozostają zapisane niezależnie od skali.

## Wygląd

Prawy przycisk na wskaźniku → **Wygląd / Appearance**. Kolor podświetlenia
wybierzesz z palety, suwakiem odcienia lub polem HEX (`#RGB` / `#RRGGBB`).
Podgląd obejmuje wszystkie monitory i nie zapisuje zmian na dysku.
**Zastosuj** zapisuje wybór; **Anuluj**, Escape albo zamknięcie panelu cofają
niezatwierdzony podgląd. **Użyj koloru motywu** przywraca powiązanie z motywem
po zatwierdzeniu. Przy przycisku widoczny jest kod HEX tego akcentu. To
konkretna rola `accent` w motywie, a nie dominujący kolor tapety. Niepoprawny lub niepełny HEX blokuje zapis.

Dymek po najechaniu ma wariant **Przestronny** z ikonami i zaokrąglonymi rogami
oraz **Kompaktowy**. Tło pochodzi z motywu, a ramka i status z wybranego akcentu.
Podkreślenie obejmuje całą etykietę i używa jaśniejszego odcienia wybranego
akcentu (domieszka 22% bieli), także podczas podglądu. Dymek ma dodatkowe
4 px odstępu po lewej i prawej stronie.

## Opisy stanu

Prawy przycisk → **Etykiety i teksty / Labels and text**. Cztery warianty:

- **Krótki**: „otwarty tutaj”, „aktywny tutaj”, „ukryty” — dotychczasowy domyślny.
- **Z nazwą Scratchpad**: „Scratchpad: otwarty tutaj”, „Scratchpad: aktywny tutaj”.
- **Scratchpad ON / OFF**: ON oznacza widoczność, ACTIVE pracę w oknie,
  OFF ukrycie, EMPTY pusty scratchpad; na drugim monitorze dochodzi jego nazwa.
- **Własny**: osobny tekst dla sześciu stanów, także pustego i nieznanego.

Te same opisy pojawiają się na pasku, w panelu i dymku. W tekstach działają
`{monitor}`, `{count}` i `{workspace}`, np. „Moja szuflada: {count} okna”.
Puste pole korzysta z wariantu z nazwą Scratchpad. Limit to 100 znaków na pole.
Własne teksty pozostają zapisane przy zmianie wariantu lub języka i nie są
automatycznie tłumaczone. ON/OFF/ACTIVE/EMPTY mają celowo tę samą angielską
formę we wszystkich językach. Symbol i licznik pozostają na pasku; w trybie
kompaktowym i na pasku pionowym pełne opisy są dostępne w panelu i dymku.
Podgląd działa na obu monitorach. **Zastosuj** zapisuje; **Anuluj**, Escape
albo zamknięcie panelu cofają podgląd.

## Język

Kliknij wskaźnik prawym przyciskiem i wybierz **Język / Language** u dołu panelu.
Lista zawiera 30 wersji językowych; można szukać po nazwie własnej lub kodzie.
Wybór działa od razu na wszystkich monitorach i zostaje zapisany przez Omarchy.

**Automatycznie** to ustawienie domyślne, także przy pierwszym uruchomieniu.
Wtyczka sprawdza preferowane języki interfejsu Qt, następnie ustawienia regionalne.
Jeśli żaden język nie jest obsługiwany, używa angielskiego. Ręczny wybór ma
pierwszeństwo i nie jest resetowany po aktualizacji ani restarcie.
Zmiana języka całej sesji systemowej wymaga ponownego uruchomienia powłoki.

Lista języków i zasady wykrywania: [LANGUAGES.md](LANGUAGES.md).
Plan wyglądu i tłumaczeń: [PLAN.md](PLAN.md).

Polski można również ustawić we wpisie w `~/.config/omarchy/shell.json`:

```json
{ "id": "sarr.scratchpeek", "language": "pl", "workspace": "scratchpad", "compact": false }
```

Wtyczka korzysta z kolorów motywu, obsługuje pionowy pasek i wiele monitorów.
Nie zmienia skrótów klawiszowych, nie zamyka aplikacji i nie zapisuje tytułów
okien na dysku. Usunięcie: `omarchy plugin remove sarr.scratchpeek`.

Licencja MIT · © 2026 Sarr.
