# ScratchPeek

**Zobacz, co masz w scratchpadzie i gdzie jest otwarty.**

Mała wtyczka paska Omarchy. Autor: [Sarr](https://github.com/Sarr77).

![ScratchPeek — przykładowy widok wskaźnika i listy okien](../preview.png)

ScratchPeek pokazuje liczbę okien i stan: **pusty**, **ukryty**, **widoczny tutaj**,
**aktywny tutaj** lub **widoczny na innym monitorze**. Każda zakładka liczy się osobno.
To scratchpad **okien** pod Super + S, a nie historia skopiowanych tekstów.

## Instalacja

```sh
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

Wymagane jest Omarchy Quattro z natywnym paskiem Quickshell. Przenoszenie okien
wymaga Hyprland 0.56+ z konfiguracją Lua. Testowano na Omarchy 4.0.4 i Hyprland
0.56.2. Bez dodatkowych pakietów do działania.

## Najważniejsze gesty

| Działanie | Efekt |
| --- | --- |
| Kliknięcie wskaźnika | Pokaż lub schowaj scratchpad na tym monitorze |
| Prawy przycisk | Lista okien i ustawienia |
| Kliknięcie nazwy okna | Przejdź do tego okna lub zakładki |
| **Wyciągnij** | Wybierz docelowy workspace |
| **Ctrl + klik Wyciągnij** | Przenieś na bieżący workspace tego monitora |
| **Dodaj okno do scratchpada…** | Wybierz okno do dodania |
| **Ctrl + klik Dodaj okno…** | Od razu dodaj aktywne okno aplikacji |

Przenosi się tylko wybrane okno. Schowanie scratchpada zostawia wszystkie okna w środku.

## Dopasuj do siebie

W panelu wybierzesz język, kolor, presety, skalę i własne opisy. Zmiany mają
podgląd na żywo; **Zastosuj** zapisuje, a **Anuluj** przywraca poprzedni wybór.

**?** włącza i wyłącza podpowiedzi. Początkowo działają przez 100 wyświetleń;
licznik pokazuje, ile zostało. Zawsze możesz włączyć je ponownie.

Ustawienia i licznik podpowiedzi zapisują się automatycznie. Przetrwają restart,
aktualizację, wyłączenie wtyczki i ponowną instalację.

## Aktualizacje

Automatyczne aktualizacje są domyślnie włączone. Podczas działania wtyczka
sprawdza raz dziennie, czy na GitHubie jest nowe stabilne wydanie, i instaluje
je w tle. Mały przełącznik **Automatyczne aktualizacje** obok **?** w stopce
pozwala je wyłączyć po potwierdzeniu. Ponowne włączenie wymaga jednego kliknięcia.
Ustawienia pozostają zapisane. Błąd pobierania lub weryfikacji pozostawia
dotychczasową wersję; kolejna próba odbędzie się następnego dnia.

Dotyczy standardowej instalacji przez `omarchy plugin add`. Kopie robocze
podłączone linkiem, forki i lokalnie zmieniony kod są pomijane. Wersję 0.10.0
trzeba jednorazowo zaktualizować ręcznie, aby korzystać z tej funkcji w 0.11.0:

```sh
omarchy plugin update sarr.scratchpeek
```

## Usunięcie

```sh
omarchy plugin remove sarr.scratchpeek
```

Okna i workspace’y pozostają bez zmian. Ustawienia zostają na przyszłość
w `~/.local/state/scratchpeek/preferences.json` (lub pod `$XDG_STATE_HOME/scratchpeek`).
Jeśli chcesz je również usunąć, skasuj ten plik po odinstalowaniu wtyczki.

Bez telemetrii i uprawnień administratora. Wtyczka
odczytuje lokalny stan Hyprlanda i wykonuje wybrane przez Ciebie działania.
Tytuły okien nie są zapisywane na dysku. Automatyczne aktualizacje korzystają
z publicznego API GitHuba i repozytorium ScratchPeek; wymagają Pythona 3 i Gita.
Jak inne wtyczki Omarchy, ScratchPeek działa z uprawnieniami użytkownika.

[Pełna instrukcja (EN)](GUIDE.md) · [Zgłoś błąd](https://github.com/Sarr77/ScratchPeek/issues) ·
[Historia zmian](../CHANGELOG.md)

MIT · © 2026 Sarr.
