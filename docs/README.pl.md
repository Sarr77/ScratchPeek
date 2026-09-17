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

Kliknięcie odczytuje aktualny stan z Hyprlanda, także po restarcie wtyczki.
W konfiguracji Lua operacja jawnie pokazuje lub chowa scratchpad na wybranym
monitorze. Powtórne wywołanie podczas tej samej operacji nie odwraca jej wyniku.
Wtyczka sprawdza potwierdzenie; zmiana workspace’u, odłączenie monitora lub błąd
odczytu przerywają operację. Nie ponawia automatycznie przełączania.

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

Prawy przycisk na wskaźniku → **Wygląd / Appearance**. Panel zaczyna się od
palety, suwaka odcienia i pola HEX (`#RGB` / `#RRGGBB`). Pod nimi jest domyślnie
zwinięta sekcja **Presety kolorów / Color presets** z dodatkowymi opcjami:

- **Dopasowany (domyślny)**: różowy `#EF98F5` w Tokyo Night, akcent motywu
  w pozostałych. Wyjątek dotyczy identyfikatora `tokyo-night`.
- **Akcent Omarchy**: zawsze dokładny akcent motywu, np. niebieski `#7AA2F7`
  w Tokyo Night.
- **Własny**: wybrany kolor z palety, HEX-a lub presetu.

**Przywróć zapisany kolor** pod polem HEX przywraca podgląd ostatnio zapisanego
koloru dla bieżącego motywu. Przycisk pokazuje jego HEX i odtwarza także tryb
oraz zakres koloru. Zachowuje edycję presetów, styl dymka i skalę. Działa też
po wpisaniu niepoprawnego HEX-a; nie zapisuje ani nie zamyka edytora.

**Tylko [motyw]** zapamiętuje kolor osobno dla tego motywu. Pozostałe motywy
bez własnego ustawienia używają trybu Dopasowany. **Wszystkie motywy** stosuje
wybrany tryb wszędzie, zachowując osobne ustawienia na później. Powrót do
**Tylko [motyw]** ponownie je uaktywnia. To domyślny zakres nowej instalacji.

**Zapisz kolor** dodaje własny preset (maksymalnie 24). Po wybraniu próbki
**Edytuj preset** pozwala zmienić nazwę, zapisać aktualny kolor palety lub
usunąć preset. Nazwy są unikalne i mają do 40 znaków. Usunięcie presetu nie
zmienia wybranego koloru. Wbudowany **Róż ScratchPeek** jest zawsze dostępny.

Podgląd działa na wszystkich monitorach. **Zastosuj** zapisuje również edycję
presetów; **Anuluj**, Escape lub zamknięcie panelu cofają całość podglądu.
Podczas aktualizacji dotychczasowy ręczny kolor zachowuje zakres globalny,
a wcześniejszy wybór koloru motywu nadal używa jego dokładnego akcentu.
Tryb Dopasowany można wybrać w rozwiniętej sekcji presetów.

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

## Przenoszenie okien

Kliknij ScratchPeek prawym przyciskiem myszy:

- **Dodaj okno do scratchpada…** — wyszukaj okno po aplikacji, tytule lub workspace i wybierz
  je, aby przenieść je do scratchpada. Ponowne kliknięcie **Dodaj okno do scratchpada…**,
  Escape lub kliknięcie poza listą zamyka wybór.
- **Ctrl + klik Dodaj okno do scratchpada…** od razu dodaje aktywne okno aplikacji.
  Jeśli panel przejął fokus, używa okna aktywnego tuż przed jego otwarciem, o ile
  nadal znajduje się na widocznym zwykłym workspace. Nie wybiera zastępczego okna.
- **↗ Wyciągnij** obok okna — wybierz docelowy workspace i kliknij **Przenieś**.
  Lista zawiera istniejące workspace’y (także nazwane) oraz puste **1–10**.
  Przy istniejących miejscach pokazuje monitor. Domyślnie wybiera zwykły
  workspace monitora, na którym otwierasz panel.
- **Ctrl + klik Wyciągnij** przenosi okno od razu na aktywny zwykły workspace
  monitora z panelem.
- Przenoszenie nie przełącza widoku. Aby zobaczyć wyciągnięte okno, przejdź
  na wybrany workspace. **Pokaż tutaj / Schowaj** nadal steruje całym scratchpadem.

Podpowiedź po najechaniu na ikonę lub nazwę okna wyjaśnia, że kliknięcie
przenosi fokus na to okno lub zakładkę. Osobny przycisk **Wyciągnij** otwiera
wybór workspace’u.

Przycisk **?** na dole włącza lub wyłącza podpowiedzi. Początkowo znikają
automatycznie po 100 wyświetleniach; licznik jest wspólny dla monitorów i trwały.
Ręczne włączenie działa bez limitu. Przy włączonych podpowiedziach dymek paska
mówi wprost o pokazywaniu/chowaniu **scratchpada**; przy wyłączonych używa
krótszego opisu. Opis samego przycisku **?** pozostaje zawsze dostępny.

Przenoszona jest tylko wybrana zakładka. Przed ruchem Hyprland sprawdza aktualną
przynależność okna i oddziela je od grupy w jednym poleceniu. Zablokowana grupa
pozostaje bez zmian. Zamknięte okno lub odmowa przeniesienia wyświetla błąd.
Tab i strzałki pozwalają wybrać działanie; lewo/prawo przełącza pomiędzy
ustawieniem fokusu a wyciąganiem okna. Enter uruchamia wybór, Escape wraca.

Przenoszenie wymaga Hyprland 0.56+ z konfiguracją Lua, jak w obecnym Omarchy.
Na starszej konfiguracji przyciski przenoszenia są ukryte; wskaźnik nadal działa.
