# Languages

ScratchPeek 0.2.0 includes 30 interface catalogs. Product names, application
names, window titles and monitor identifiers are not translated by ScratchPeek.
Application names/icons come from installed desktop entries.

| Code | Native name | Language |
|---|---|---|
| en | English | English |
| pl | Polski | Polish |
| de | Deutsch | German |
| fr | Français | French |
| es | Español | Spanish |
| pt-BR | Português (Brasil) | Brazilian Portuguese |
| pt-PT | Português (Portugal) | European Portuguese |
| it | Italiano | Italian |
| nl | Nederlands | Dutch |
| sv | Svenska | Swedish |
| da | Dansk | Danish |
| nb | Norsk bokmål | Norwegian Bokmål |
| fi | Suomi | Finnish |
| cs | Čeština | Czech |
| sk | Slovenčina | Slovak |
| uk | Українська | Ukrainian |
| ru | Русский | Russian |
| tr | Türkçe | Turkish |
| ro | Română | Romanian |
| hu | Magyar | Hungarian |
| el | Ελληνικά | Greek |
| ar | العربية | Arabic (RTL) |
| hi | हिन्दी | Hindi |
| id | Bahasa Indonesia | Indonesian |
| vi | Tiếng Việt | Vietnamese |
| th | ไทย | Thai |
| ja | 日本語 | Japanese |
| ko | 한국어 | Korean |
| zh-CN | 简体中文 | Simplified Chinese |
| zh-TW | 繁體中文 | Traditional Chinese |

## Detection and persistence

1. A supported explicit `language` setting takes priority.
2. `auto`, a missing setting, or an unsupported setting checks `Qt.locale().uiLanguages`
   in preference order. Unsupported entries are skipped; `C`/`POSIX` selects English.
3. If no UI preference matches, use `Qt.locale().name`; otherwise use English.

This uses Qt's [ordered UI-language preferences](https://doc.qt.io/qt-6/qml-qtqml-locale.html#uiLanguages-prop),
not keyboard layout, location, window titles, or a network service. Qt determines
the system locale when the shell starts. Restart the shell after changing the
session's locale environment. Returning to **Automatic** recomputes the selection
from the current shell's Qt locale; detection is never saved as a manual override.

Codes accept hyphens/underscores, encodings (`de_DE.UTF-8`) and locale modifiers.
Regional languages such as `es-MX` use their base translation. `pt-BR` uses the
Brazilian catalog; other Portuguese locales use `pt-PT`. `zh-Hant` and Taiwan,
Hong Kong or Macao select Traditional Chinese; `zh-Hans`, mainland China and
Singapore select Simplified Chinese. An explicit script overrides territory.
The aliases `no` and `in` map to `nb` and `id` respectively.

The in-panel picker stores canonical codes through Omarchy's scoped
`updateEntryInline` API. It preserves the plugin's workspace, compact setting
and future fields. Other plugins are untouched. No first-start dialog is required.

## Translation maintenance

The UTF-8 catalogs live in `I18n.js`. Add language metadata with a native name,
then translate every English key. Preserve `{monitor}` and `{language}` placeholders;
their positions can change. Keep Omarchy's key names (`Super`, `Alt`, `S`) intact.
Arabic text isolates Latin shortcuts and monitor identifiers to preserve ordering.

Tests require every catalog to have every key and the same named placeholders.
At runtime missing future strings fall back to English. The `Language` recovery
label remains alongside the translated label so an accidental selection is easy
to undo. Languages use native names rather than country flags.

These initial translations were authored during development and have not all
been reviewed by native speakers. Linguistic review is part of the publication
plan; automated completeness checks are not linguistic certification.

Rendering non-Latin scripts depends on the fonts installed on the user's system.
ScratchPeek uses Qt font fallback and does not install fonts automatically.
