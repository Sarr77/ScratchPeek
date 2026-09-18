# Languages

Choose a language in the panel’s **Language** field. You can search by its
native name or code. The choice is saved and applies to every monitor.
Select **Automatic** to use the system language.

ScratchPeek has 30 interface translations:

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

App names, window titles and monitor names stay as supplied by the system.
Arabic uses a right-to-left layout, while the monitor diagram keeps its physical
arrangement. Non-Latin text depends on the installed fonts; ScratchPeek uses
Qt’s font fallback and does not install fonts.

## Automatic selection

ScratchPeek first checks Qt’s ordered UI-language preferences, then its locale
name. The first supported language wins. If none matches, it uses English.
An unsupported saved language code also falls back to automatic selection.
`C` and `POSIX` select English.

Qt reads the session locale when the shell starts. After changing the locale
environment, restart the shell. Choosing **Automatic** uses the current shell’s
Qt locale and does not save the detected language as a manual choice.
See [Qt’s UI-language preferences](https://doc.qt.io/qt-6/qml-qtqml-locale.html#uiLanguages-prop).

Regional codes are accepted, including `de_DE.UTF-8`. Most use their base
language, such as `es-MX` → `es`. The exceptions are:

- `pt-BR` uses Brazilian Portuguese; other Portuguese locales use `pt-PT`.
- `zh-Hant`, Taiwan, Hong Kong and Macao use Traditional Chinese. `zh-Hans`,
  mainland China and Singapore use Simplified Chinese. An explicit script
  takes priority over the region.
- `no` maps to `nb`, and `in` maps to `id`.

## Editing translations

Translations and language names are in [I18n.js](../I18n.js). When adding a
language, add its code and native name, then translate every English key.
Preserve the named placeholders in each string and key names such as `Super`
and `Alt`. Arabic strings use direction markers around Latin shortcuts and
monitor names to keep them in the correct order.

Run `node tests/model.test.cjs` from the repository root to check keys and
placeholders. Missing strings fall back to English at runtime. The word
**Language** stays beside the translated field label so users can find it
after an accidental language change.

Not all translations have been reviewed by native speakers. The tests check
completeness, not wording; corrections are welcome.
