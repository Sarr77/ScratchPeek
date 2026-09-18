# ScratchPeek

ScratchPeek dodaje listę okien do scratchpada Omarchy, otwieranego zwykle przez
**Super + S**. Na pasku pokazuje liczbę okien i monitor, na którym scratchpad jest
otwarty. Z listy możesz przejść do okna, przenieść je na inny workspace albo
dodać kolejne do scratchpada. Zakładki w grupach okien Hyprlanda są widoczne
osobno.

[English](../README.md) · [Podgląd](../preview.png) ·
[Instrukcja (EN)](GUIDE.md) · [Historia zmian](../CHANGELOG.md)

## Instalacja

```sh
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

Wtyczka pojawi się po lewej stronie paska. Możesz ją przenieść w edytorze paska
Omarchy.

Wymagane jest Omarchy Quattro z paskiem Quickshell. Przenoszenie okien wymaga
Hyprlanda 0.56+ z konfiguracją Lua. Testowano na Omarchy 4.0.4 i Hyprlandzie
0.56.2. Nie trzeba instalować dodatkowych pakietów.

## Obsługa

Kliknij wskaźnik na pasku, żeby pokazać lub schować scratchpad na danym
monitorze. Prawy przycisk otwiera listę okien i ustawienia.

| W panelu | Działanie |
| --- | --- |
| Kliknięcie nazwy okna | Przejdź do tego okna lub zakładki |
| **Wyciągnij** | Wybierz workspace, na który przenieść okno |
| **Ctrl + klik Wyciągnij** | Przenieś na bieżący workspace tego monitora |
| **Dodaj okno do scratchpada…** | Wybierz okno do dodania |
| **Ctrl + klik Dodaj okno…** | Dodaj aktywne okno aplikacji |

Przeniesienie zakładki zostawia pozostałe okna z jej grupy na miejscu.
Schowanie scratchpada pozostawia jego okna w środku.

## Ustawienia

W panelu możesz zmienić język, kolory, presety, skalę i opisy.
Zmiany wyglądu widać podczas edycji. **Zastosuj** je zapisuje,
a **Anuluj** przywraca poprzednie ustawienia.

Przycisk **?** włącza i wyłącza podpowiedzi po najechaniu kursorem.
Początkowo są włączone i chowają się automatycznie po 100 wyświetleniach.
Możesz je włączyć ponownie w dowolnym momencie. Ustawienia i licznik podpowiedzi
są zachowywane po restarcie, aktualizacji i ponownej instalacji.

## Aktualizacje

Automatyczne aktualizacje są domyślnie włączone. Wtyczka sprawdza je raz dziennie,
gdy działa. Od wersji 0.11.1 aktualizacja musi pochodzić z niezmiennego wydania
GitHub, którego dokładny commit został zweryfikowany w katalogu Omarchy.
Błąd pobierania lub weryfikacji pozostawia zainstalowaną wersję bez zmian.

Mały przełącznik obok **?** pozwala wyłączyć aktualizacje po potwierdzeniu.
Kopie robocze podłączone linkiem, forki i lokalnie zmieniony kod nie są
aktualizowane automatycznie. Więcej w [opisie aktualizacji (EN)](UPDATES.md).

Aktualizacja ręczna — potrzebna też przy przejściu z 0.10.0, żeby uzyskać
automatyczne aktualizacje:

```sh
omarchy plugin update sarr.scratchpeek
```

## Usunięcie

```sh
omarchy plugin remove sarr.scratchpeek
```

Usunięcie wtyczki pozostawia okna i workspace’y na miejscu. Ustawienia zostają
w `~/.local/state/scratchpeek/preferences.json` lub pod
`$XDG_STATE_HOME/scratchpeek`, jeśli ta zmienna jest ustawiona. Jeśli chcesz
również zresetować preferencje, usuń ten plik po odinstalowaniu wtyczki.

## Dane i uprawnienia

ScratchPeek odczytuje lokalny stan okien i monitorów, informacje o motywie oraz
ikony aplikacji. Korzysta z `hyprctl` do odczytu stanu i wykonywania działań
na oknach. Nie zapisuje tytułów okien na dysku ani nie zmienia skrótów klawiszowych.

Automatyczne aktualizacje łączą się z GitHubem i katalogiem Omarchy przez
Pythona 3 i Gita. Terminy i wyniki aktualizacji są zapisywane lokalnie obok
preferencji. Nie ma telemetrii. Wtyczka działa wewnątrz powłoki Omarchy
z uprawnieniami użytkownika, bez dostępu administratora.

## Pomoc i rozwój

[Zgłoś błąd](https://github.com/Sarr77/ScratchPeek/issues) ·
[Praca nad kodem (EN)](DEVELOPMENT.md) · [Testy i ograniczenia (EN)](TESTING.md)

MIT · © 2026 [Sarr](https://github.com/Sarr77).
Dostosowane kontrolki Omarchy zachowują [swoją licencję MIT](../vendor/omarchy/LICENSE).
