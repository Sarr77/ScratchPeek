// UTF-8 source dictionaries. No runtime downloads or global Qt translator changes.
var languages = [
  { code: "en", name: "English" }, { code: "pl", name: "Polski" },
  { code: "de", name: "Deutsch" }, { code: "fr", name: "Français" },
  { code: "es", name: "Español" }, { code: "pt-BR", name: "Português (Brasil)" },
  { code: "pt-PT", name: "Português (Portugal)" }, { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" }, { code: "sv", name: "Svenska" },
  { code: "da", name: "Dansk" }, { code: "nb", name: "Norsk bokmål" },
  { code: "fi", name: "Suomi" }, { code: "cs", name: "Čeština" },
  { code: "sk", name: "Slovenčina" }, { code: "uk", name: "Українська" },
  { code: "ru", name: "Русский" }, { code: "tr", name: "Türkçe" },
  { code: "ro", name: "Română" }, { code: "hu", name: "Magyar" },
  { code: "el", name: "Ελληνικά" }, { code: "ar", name: "العربية", rtl: true },
  { code: "hi", name: "हिन्दी" }, { code: "id", name: "Bahasa Indonesia" },
  { code: "vi", name: "Tiếng Việt" }, { code: "th", name: "ไทย" },
  { code: "ja", name: "日本語" }, { code: "ko", name: "한국어" },
  { code: "zh-CN", name: "简体中文" }, { code: "zh-TW", name: "繁體中文" }
];

function matchLocale(locale) {
  var tag = String(locale || "").trim().replace(/\..*$/, "").replace(/@.*$/, "").replace(/_/g, "-").toLowerCase();
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(tag)) return "";
  var parts = tag.split("-");
  var base = parts[0];
  if (base === "zh") {
    // An explicit script takes precedence over territory (e.g. zh-Hans-HK).
    if (parts.indexOf("hant") >= 0) return "zh-TW";
    if (parts.indexOf("hans") >= 0) return "zh-CN";
    return parts.some(function(p) { return p === "tw" || p === "hk" || p === "mo"; }) ? "zh-TW" : "zh-CN";
  }
  if (base === "pt") return parts.indexOf("br") >= 0 ? "pt-BR" : "pt-PT";
  if (base === "no") base = "nb";
  if (base === "in") base = "id";
  for (var i = 0; i < languages.length; i++) if (languages[i].code.toLowerCase() === base) return languages[i].code;
  return "";
}

function language(setting, preferred, fallbackLocale) {
  var explicit = setting && setting !== "auto" ? matchLocale(setting) : "";
  if (explicit) return explicit;
  var candidates = Array.isArray(preferred) ? preferred : String(preferred || "").split(":");
  for (var i = 0; i < candidates.length; i++) {
    // The POSIX locale explicitly requests the source language.
    if (/^(C|POSIX)([.@]|$)/i.test(candidates[i])) return "en";
    var matched = matchLocale(candidates[i]);
    if (matched) return matched;
  }
  return matchLocale(fallbackLocale) || "en";
}

function nativeName(code) {
  for (var i = 0; i < languages.length; i++) if (languages[i].code === code) return languages[i].name;
  return "English";
}

function isRtl(code) { return code === "ar"; }

function format(template, values) {
  return String(template).replace(/\{([a-zA-Z]+)\}/g, function(token, key) {
    return values && Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token;
  });
}

function words(code) {
  var translated = catalogs[code] || catalogs.en;
  var result = { scratchpad: "Scratchpad" };
  Object.keys(catalogs.en).forEach(function(key) { result[key] = translated[key] || catalogs.en[key]; });
  return result;
}

// Compact table for appearance controls; keys are shared by every locale.
// Kept separate so UI color terminology can be reviewed as one unit.
var appearanceKeys = ["appearance", "highlight", "restoreSavedColor", "apply", "cancel", "invalidHex", "tooltipStyle", "spacious", "compactTip", "preview", "saveStyleError"];

function options(code, detected) {
  var w = words(code);
  return [{ value: "auto", label: w.automatic + " · " + nativeName(detected), description: "auto" }].concat(
    languages.map(function(item) { return { value: item.code, label: item.name, description: item.code }; }));
}

var catalogs = {
  en: {
    empty: "empty", hidden: "hidden", here: "visible here", active: "active here", elsewhere: "visible on {monitor}", unknown: "status unknown",
    windows: "Windows", grouped: "tab", unnamed: "Untitled window",
    emptyHelp: "Send a window with Super + Alt + S.\nSuper + S shows and hides the scratchpad.",
    shortcutNote: "Shortcuts refer to Omarchy’s default bindings.", customHelp: "Move a window to this special workspace in Hyprland.",
    clickHelp: "Click: show / hide here\nRight-click: window list and settings", show: "Show here", hide: "Hide", focus: "Select a window to switch to it.",
    unknownHelp: "Hyprland state is unavailable. Try again in a moment.", invalidHelp: "Invalid workspace name. Use letters, digits, a dot, _ or -.",
    countNote: "Each tab counts as a separate window.", author: "by Sarr",
    language: "Language", automatic: "Automatic", search: "Search languages…", noMatches: "No matches", detected: "System language: {language}",
    saveError: "Language could not be saved. Try again.", compact: "Compact label"
  },
  pl: {
    empty: "pusty", hidden: "ukryty", here: "widoczny tutaj", active: "aktywny tutaj", elsewhere: "widoczny na {monitor}", unknown: "stan nieznany",
    windows: "Okna", grouped: "zakładka", unnamed: "Okno bez tytułu",
    emptyHelp: "Przenieś okno skrótem Super + Alt + S.\nSuper + S pokazuje i chowa scratchpad.",
    shortcutNote: "Skróty dotyczą domyślnej konfiguracji Omarchy.", customHelp: "Przenieś okno do tego specjalnego pulpitu w Hyprlandzie.",
    clickHelp: "Kliknij: pokaż / schowaj tutaj\nPrawy przycisk: lista okien i ustawienia", show: "Pokaż tutaj", hide: "Schowaj", focus: "Wybierz okno, aby do niego przejść.",
    unknownHelp: "Nie można odczytać stanu Hyprlanda. Spróbuj ponownie za chwilę.", invalidHelp: "Nieprawidłowa nazwa pulpitu. Użyj liter, cyfr, kropki, _ lub -.",
    countNote: "Każda zakładka liczy się jako osobne okno.", author: "Autor: Sarr",
    language: "Język", automatic: "Automatycznie", search: "Szukaj języka…", noMatches: "Brak wyników", detected: "Język systemu: {language}",
    saveError: "Nie udało się zapisać języka. Spróbuj ponownie.", compact: "Krótka etykieta"
  },
  de: {
    empty: "leer", hidden: "verborgen", here: "hier sichtbar", active: "hier aktiv", elsewhere: "sichtbar auf {monitor}", unknown: "Status unbekannt",
    windows: "Fenster", grouped: "Tab", unnamed: "Fenster ohne Titel",
    emptyHelp: "Fenster mit Super + Alt + S verschieben.\nSuper + S zeigt und verbirgt den Scratchpad.",
    shortcutNote: "Die Kürzel gelten für die Standardkonfiguration von Omarchy.", customHelp: "Verschiebe ein Fenster auf diesen speziellen Arbeitsbereich in Hyprland.",
    clickHelp: "Klick: hier zeigen / verbergen\nRechtsklick: Fensterliste und Einstellungen", show: "Hier anzeigen", hide: "Verbergen", focus: "Wähle ein Fenster, um zu ihm zu wechseln.",
    unknownHelp: "Der Hyprland-Status ist nicht verfügbar. Versuche es gleich erneut.", invalidHelp: "Ungültiger Arbeitsbereichsname. Erlaubt sind Buchstaben, Ziffern, Punkt, _ und -.",
    countNote: "Jeder Tab zählt als eigenes Fenster.", author: "Von Sarr",
    language: "Sprache", automatic: "Automatisch", search: "Sprachen suchen…", noMatches: "Keine Treffer", detected: "Systemsprache: {language}",
    saveError: "Die Sprache konnte nicht gespeichert werden. Versuche es erneut.", compact: "Kompakte Beschriftung"
  },
  fr: {
    empty: "vide", hidden: "masqué", here: "visible ici", active: "actif ici", elsewhere: "visible sur {monitor}", unknown: "état inconnu",
    windows: "Fenêtres", grouped: "onglet", unnamed: "Fenêtre sans titre",
    emptyHelp: "Déplacez une fenêtre avec Super + Alt + S.\nSuper + S affiche et masque le scratchpad.",
    shortcutNote: "Ces raccourcis correspondent à la configuration par défaut d’Omarchy.", customHelp: "Déplacez une fenêtre vers cet espace de travail spécial dans Hyprland.",
    clickHelp: "Clic : afficher / masquer ici\nClic droit : liste des fenêtres et paramètres", show: "Afficher ici", hide: "Masquer", focus: "Sélectionnez une fenêtre pour y accéder.",
    unknownHelp: "L’état d’Hyprland est indisponible. Réessayez dans un instant.", invalidHelp: "Nom d’espace invalide. Utilisez des lettres, des chiffres, un point, _ ou -.",
    countNote: "Chaque onglet compte comme une fenêtre distincte.", author: "Par Sarr",
    language: "Langue", automatic: "Automatique", search: "Rechercher une langue…", noMatches: "Aucun résultat", detected: "Langue du système : {language}",
    saveError: "Impossible d’enregistrer la langue. Réessayez.", compact: "Libellé compact"
  },
  es: {
    empty: "vacío", hidden: "oculto", here: "visible aquí", active: "activo aquí", elsewhere: "visible en {monitor}", unknown: "estado desconocido",
    windows: "Ventanas", grouped: "pestaña", unnamed: "Ventana sin título",
    emptyHelp: "Mueve una ventana con Super + Alt + S.\nSuper + S muestra y oculta el scratchpad.",
    shortcutNote: "Los atajos corresponden a la configuración predeterminada de Omarchy.", customHelp: "Mueve una ventana a este espacio de trabajo especial en Hyprland.",
    clickHelp: "Clic: mostrar / ocultar aquí\nClic derecho: lista de ventanas y ajustes", show: "Mostrar aquí", hide: "Ocultar", focus: "Selecciona una ventana para cambiar a ella.",
    unknownHelp: "El estado de Hyprland no está disponible. Vuelve a intentarlo en un momento.", invalidHelp: "Nombre de espacio no válido. Usa letras, dígitos, un punto, _ o -.",
    countNote: "Cada pestaña cuenta como una ventana independiente.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Buscar idiomas…", noMatches: "Sin resultados", detected: "Idioma del sistema: {language}",
    saveError: "No se pudo guardar el idioma. Vuelve a intentarlo.", compact: "Etiqueta compacta"
  },
  "pt-BR": {
    empty: "vazio", hidden: "oculto", here: "visível aqui", active: "ativo aqui", elsewhere: "visível em {monitor}", unknown: "estado desconhecido",
    windows: "Janelas", grouped: "aba", unnamed: "Janela sem título",
    emptyHelp: "Mova uma janela com Super + Alt + S.\nSuper + S mostra e oculta o scratchpad.",
    shortcutNote: "Os atalhos correspondem à configuração padrão do Omarchy.", customHelp: "Mova uma janela para este espaço de trabalho especial no Hyprland.",
    clickHelp: "Clique: mostrar / ocultar aqui\nClique direito: lista de janelas e configurações", show: "Mostrar aqui", hide: "Ocultar", focus: "Selecione uma janela para alternar para ela.",
    unknownHelp: "O estado do Hyprland não está disponível. Tente novamente em instantes.", invalidHelp: "Nome de espaço inválido. Use letras, números, ponto, _ ou -.",
    countNote: "Cada aba conta como uma janela separada.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Buscar idiomas…", noMatches: "Nenhum resultado", detected: "Idioma do sistema: {language}",
    saveError: "Não foi possível salvar o idioma. Tente novamente.", compact: "Rótulo compacto"
  },
  "pt-PT": {
    empty: "vazio", hidden: "oculto", here: "visível aqui", active: "ativo aqui", elsewhere: "visível em {monitor}", unknown: "estado desconhecido",
    windows: "Janelas", grouped: "separador", unnamed: "Janela sem título",
    emptyHelp: "Mova uma janela com Super + Alt + S.\nSuper + S mostra e oculta o scratchpad.",
    shortcutNote: "Os atalhos correspondem à configuração predefinida do Omarchy.", customHelp: "Mova uma janela para este espaço de trabalho especial no Hyprland.",
    clickHelp: "Clique: mostrar / ocultar aqui\nClique direito: lista de janelas e definições", show: "Mostrar aqui", hide: "Ocultar", focus: "Selecione uma janela para mudar para ela.",
    unknownHelp: "O estado do Hyprland não está disponível. Tente novamente dentro de instantes.", invalidHelp: "Nome de espaço inválido. Utilize letras, algarismos, ponto, _ ou -.",
    countNote: "Cada separador conta como uma janela distinta.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Pesquisar idiomas…", noMatches: "Sem resultados", detected: "Idioma do sistema: {language}",
    saveError: "Não foi possível guardar o idioma. Tente novamente.", compact: "Etiqueta compacta"
  },
  it: {
    empty: "vuoto", hidden: "nascosto", here: "visibile qui", active: "attivo qui", elsewhere: "visibile su {monitor}", unknown: "stato sconosciuto",
    windows: "Finestre", grouped: "scheda", unnamed: "Finestra senza titolo",
    emptyHelp: "Sposta una finestra con Super + Alt + S.\nSuper + S mostra e nasconde lo scratchpad.",
    shortcutNote: "Le scorciatoie si riferiscono alla configurazione predefinita di Omarchy.", customHelp: "Sposta una finestra in questo spazio di lavoro speciale in Hyprland.",
    clickHelp: "Clic: mostra / nascondi qui\nClic destro: elenco finestre e impostazioni", show: "Mostra qui", hide: "Nascondi", focus: "Seleziona una finestra per passare a essa.",
    unknownHelp: "Lo stato di Hyprland non è disponibile. Riprova tra un momento.", invalidHelp: "Nome dello spazio non valido. Usa lettere, cifre, un punto, _ o -.",
    countNote: "Ogni scheda conta come una finestra separata.", author: "Di Sarr",
    language: "Lingua", automatic: "Automatica", search: "Cerca lingue…", noMatches: "Nessun risultato", detected: "Lingua del sistema: {language}",
    saveError: "Impossibile salvare la lingua. Riprova.", compact: "Etichetta compatta"
  },
  nl: {
    empty: "leeg", hidden: "verborgen", here: "hier zichtbaar", active: "hier actief", elsewhere: "zichtbaar op {monitor}", unknown: "status onbekend",
    windows: "Vensters", grouped: "tabblad", unnamed: "Venster zonder titel",
    emptyHelp: "Verplaats een venster met Super + Alt + S.\nSuper + S toont en verbergt het scratchpad.",
    shortcutNote: "De sneltoetsen gelden voor de standaardconfiguratie van Omarchy.", customHelp: "Verplaats een venster naar dit speciale werkblad in Hyprland.",
    clickHelp: "Klik: hier tonen / verbergen\nRechtsklik: vensterlijst en instellingen", show: "Hier tonen", hide: "Verbergen", focus: "Selecteer een venster om ernaartoe te gaan.",
    unknownHelp: "De Hyprland-status is niet beschikbaar. Probeer het zo opnieuw.", invalidHelp: "Ongeldige werkbladnaam. Gebruik letters, cijfers, een punt, _ of -.",
    countNote: "Elk tabblad telt als een apart venster.", author: "Door Sarr",
    language: "Taal", automatic: "Automatisch", search: "Talen zoeken…", noMatches: "Geen resultaten", detected: "Systeemtaal: {language}",
    saveError: "De taal kon niet worden opgeslagen. Probeer het opnieuw.", compact: "Compact label"
  },
  da: {
    empty: "tom", hidden: "skjult", here: "synlig her", active: "aktiv her", elsewhere: "synlig på {monitor}", unknown: "ukendt status",
    windows: "Vinduer", grouped: "fane", unnamed: "Vindue uden titel",
    emptyHelp: "Flyt et vindue med Super + Alt + S.\nSuper + S viser og skjuler scratchpad.",
    shortcutNote: "Genvejene gælder Omarchys standardopsætning.", customHelp: "Flyt et vindue til dette særlige arbejdsområde i Hyprland.",
    clickHelp: "Klik: vis / skjul her\nHøjreklik: vinduesliste og indstillinger", show: "Vis her", hide: "Skjul", focus: "Vælg et vindue for at skifte til det.",
    unknownHelp: "Hyprlands status er ikke tilgængelig. Prøv igen om lidt.", invalidHelp: "Ugyldigt navn på arbejdsområdet. Brug bogstaver, tal, punktum, _ eller -.",
    countNote: "Hver fane tæller som et særskilt vindue.", author: "Af Sarr",
    language: "Sprog", automatic: "Automatisk", search: "Søg efter sprog…", noMatches: "Ingen resultater", detected: "Systemsprog: {language}",
    saveError: "Sproget kunne ikke gemmes. Prøv igen.", compact: "Kompakt etiket"
  },
  nb: {
    empty: "tom", hidden: "skjult", here: "synlig her", active: "aktiv her", elsewhere: "synlig på {monitor}", unknown: "ukjent status",
    windows: "Vinduer", grouped: "fane", unnamed: "Vindu uten tittel",
    emptyHelp: "Flytt et vindu med Super + Alt + S.\nSuper + S viser og skjuler scratchpad.",
    shortcutNote: "Snarveiene gjelder standardoppsettet i Omarchy.", customHelp: "Flytt et vindu til dette spesielle arbeidsområdet i Hyprland.",
    clickHelp: "Klikk: vis / skjul her\nHøyreklikk: vindusliste og innstillinger", show: "Vis her", hide: "Skjul", focus: "Velg et vindu for å bytte til det.",
    unknownHelp: "Hyprland-statusen er ikke tilgjengelig. Prøv igjen om litt.", invalidHelp: "Ugyldig navn på arbeidsområdet. Bruk bokstaver, sifre, punktum, _ eller -.",
    countNote: "Hver fane telles som et eget vindu.", author: "Av Sarr",
    language: "Språk", automatic: "Automatisk", search: "Søk etter språk…", noMatches: "Ingen treff", detected: "Systemspråk: {language}",
    saveError: "Språket kunne ikke lagres. Prøv igjen.", compact: "Kompakt etikett"
  },
  fi: {
    empty: "tyhjä", hidden: "piilotettu", here: "näkyvissä tässä", active: "aktiivinen tässä", elsewhere: "näkyvissä näytöllä {monitor}", unknown: "tila tuntematon",
    windows: "Ikkunat", grouped: "välilehti", unnamed: "Nimetön ikkuna",
    emptyHelp: "Siirrä ikkuna näppäimillä Super + Alt + S.\nSuper + S näyttää ja piilottaa scratchpadin.",
    shortcutNote: "Pikanäppäimet koskevat Omarchyn oletusasetuksia.", customHelp: "Siirrä ikkuna tähän Hyprlandin erityistyötilaan.",
    clickHelp: "Napsautus: näytä / piilota tässä\nOikea napsautus: ikkunaluettelo ja asetukset", show: "Näytä tässä", hide: "Piilota", focus: "Siirry ikkunaan valitsemalla se.",
    unknownHelp: "Hyprlandin tilaa ei ole saatavilla. Yritä hetken kuluttua uudelleen.", invalidHelp: "Virheellinen työtilan nimi. Käytä kirjaimia, numeroita, pistettä, _ tai -.",
    countNote: "Jokainen välilehti lasketaan erilliseksi ikkunaksi.", author: "Tekijä: Sarr",
    language: "Kieli", automatic: "Automaattinen", search: "Etsi kieliä…", noMatches: "Ei tuloksia", detected: "Järjestelmän kieli: {language}",
    saveError: "Kielen tallennus epäonnistui. Yritä uudelleen.", compact: "Tiivis teksti"
  },
  cs: {
    empty: "prázdný", hidden: "skrytý", here: "viditelný zde", active: "aktivní zde", elsewhere: "viditelný na {monitor}", unknown: "neznámý stav",
    windows: "Okna", grouped: "karta", unnamed: "Okno bez názvu",
    emptyHelp: "Přesuňte okno pomocí Super + Alt + S.\nSuper + S zobrazí a skryje scratchpad.",
    shortcutNote: "Zkratky odpovídají výchozímu nastavení Omarchy.", customHelp: "Přesuňte okno na tuto speciální pracovní plochu v Hyprlandu.",
    clickHelp: "Kliknutí: zobrazit / skrýt zde\nPravé tlačítko: seznam oken a nastavení", show: "Zobrazit zde", hide: "Skrýt", focus: "Vyberte okno, na které chcete přejít.",
    unknownHelp: "Stav Hyprlandu není dostupný. Zkuste to za chvíli znovu.", invalidHelp: "Neplatný název plochy. Použijte písmena, číslice, tečku, _ nebo -.",
    countNote: "Každá karta se počítá jako samostatné okno.", author: "Autor: Sarr",
    language: "Jazyk", automatic: "Automaticky", search: "Hledat jazyky…", noMatches: "Žádné výsledky", detected: "Jazyk systému: {language}",
    saveError: "Jazyk se nepodařilo uložit. Zkuste to znovu.", compact: "Krátký popisek"
  },
  sk: {
    empty: "prázdny", hidden: "skrytý", here: "viditeľný tu", active: "aktívny tu", elsewhere: "viditeľný na {monitor}", unknown: "neznámy stav",
    windows: "Okná", grouped: "karta", unnamed: "Okno bez názvu",
    emptyHelp: "Presuňte okno pomocou Super + Alt + S.\nSuper + S zobrazí a skryje scratchpad.",
    shortcutNote: "Skratky zodpovedajú predvolenému nastaveniu Omarchy.", customHelp: "Presuňte okno na túto špeciálnu pracovnú plochu v Hyprlande.",
    clickHelp: "Kliknutie: zobraziť / skryť tu\nPravé tlačidlo: zoznam okien a nastavenia", show: "Zobraziť tu", hide: "Skryť", focus: "Vyberte okno, na ktoré chcete prejsť.",
    unknownHelp: "Stav Hyprlandu nie je dostupný. Skúste to o chvíľu znova.", invalidHelp: "Neplatný názov plochy. Použite písmená, číslice, bodku, _ alebo -.",
    countNote: "Každá karta sa počíta ako samostatné okno.", author: "Autor: Sarr",
    language: "Jazyk", automatic: "Automaticky", search: "Hľadať jazyky…", noMatches: "Žiadne výsledky", detected: "Jazyk systému: {language}",
    saveError: "Jazyk sa nepodarilo uložiť. Skúste to znova.", compact: "Krátky popis"
  },
  uk: {
    empty: "порожній", hidden: "прихований", here: "видимий тут", active: "активний тут", elsewhere: "видимий на {monitor}", unknown: "стан невідомий",
    windows: "Вікна", grouped: "вкладка", unnamed: "Вікно без назви",
    emptyHelp: "Перемістіть вікно за допомогою Super + Alt + S.\nSuper + S показує та приховує scratchpad.",
    shortcutNote: "Скорочення відповідають типовим налаштуванням Omarchy.", customHelp: "Перемістіть вікно на цей спеціальний робочий простір у Hyprland.",
    clickHelp: "Клацання: показати / приховати тут\nПрава кнопка: список вікон і налаштування", show: "Показати тут", hide: "Приховати", focus: "Виберіть вікно, щоб перейти до нього.",
    unknownHelp: "Стан Hyprland недоступний. Спробуйте ще раз за мить.", invalidHelp: "Неприпустима назва простору. Використовуйте літери, цифри, крапку, _ або -.",
    countNote: "Кожна вкладка рахується як окреме вікно.", author: "Автор: Sarr",
    language: "Мова", automatic: "Автоматично", search: "Пошук мов…", noMatches: "Немає результатів", detected: "Мова системи: {language}",
    saveError: "Не вдалося зберегти мову. Спробуйте ще раз.", compact: "Короткий підпис"
  },
  ru: {
    empty: "пустой", hidden: "скрыт", here: "виден здесь", active: "активен здесь", elsewhere: "виден на {monitor}", unknown: "состояние неизвестно",
    windows: "Окна", grouped: "вкладка", unnamed: "Окно без названия",
    emptyHelp: "Переместите окно с помощью Super + Alt + S.\nSuper + S показывает и скрывает scratchpad.",
    shortcutNote: "Сочетания клавиш соответствуют стандартным настройкам Omarchy.", customHelp: "Переместите окно на это специальное рабочее пространство в Hyprland.",
    clickHelp: "Щелчок: показать / скрыть здесь\nПравая кнопка: список окон и настройки", show: "Показать здесь", hide: "Скрыть", focus: "Выберите окно, чтобы перейти к нему.",
    unknownHelp: "Состояние Hyprland недоступно. Повторите попытку через мгновение.", invalidHelp: "Недопустимое имя пространства. Используйте буквы, цифры, точку, _ или -.",
    countNote: "Каждая вкладка считается отдельным окном.", author: "Автор: Sarr",
    language: "Язык", automatic: "Автоматически", search: "Поиск языков…", noMatches: "Нет результатов", detected: "Язык системы: {language}",
    saveError: "Не удалось сохранить язык. Попробуйте ещё раз.", compact: "Короткая подпись"
  },
  tr: {
    empty: "boş", hidden: "gizli", here: "burada görünür", active: "burada etkin", elsewhere: "{monitor} üzerinde görünür", unknown: "durum bilinmiyor",
    windows: "Pencereler", grouped: "sekme", unnamed: "Başlıksız pencere",
    emptyHelp: "Super + Alt + S ile bir pencere taşıyın.\nSuper + S, scratchpad’i gösterir ve gizler.",
    shortcutNote: "Kısayollar Omarchy’nin varsayılan ayarlarına aittir.", customHelp: "Hyprland’deki bu özel çalışma alanına bir pencere taşıyın.",
    clickHelp: "Tıklama: burada göster / gizle\nSağ tıklama: pencere listesi ve ayarlar", show: "Burada göster", hide: "Gizle", focus: "Geçiş yapmak için bir pencere seçin.",
    unknownHelp: "Hyprland durumu alınamıyor. Biraz sonra tekrar deneyin.", invalidHelp: "Geçersiz çalışma alanı adı. Harf, rakam, nokta, _ veya - kullanın.",
    countNote: "Her sekme ayrı bir pencere olarak sayılır.", author: "Geliştirici: Sarr",
    language: "Dil", automatic: "Otomatik", search: "Dil ara…", noMatches: "Sonuç bulunamadı", detected: "Sistem dili: {language}",
    saveError: "Dil kaydedilemedi. Tekrar deneyin.", compact: "Kısa etiket"
  },
  ro: {
    empty: "gol", hidden: "ascuns", here: "vizibil aici", active: "activ aici", elsewhere: "vizibil pe {monitor}", unknown: "stare necunoscută",
    windows: "Ferestre", grouped: "filă", unnamed: "Fereastră fără titlu",
    emptyHelp: "Mută o fereastră cu Super + Alt + S.\nSuper + S afișează și ascunde scratchpad-ul.",
    shortcutNote: "Scurtăturile corespund configurației implicite Omarchy.", customHelp: "Mută o fereastră în acest spațiu de lucru special din Hyprland.",
    clickHelp: "Clic: afișează / ascunde aici\nClic dreapta: lista ferestrelor și setări", show: "Afișează aici", hide: "Ascunde", focus: "Selectează o fereastră pentru a trece la ea.",
    unknownHelp: "Starea Hyprland nu este disponibilă. Încearcă din nou peste un moment.", invalidHelp: "Nume de spațiu nevalid. Folosește litere, cifre, punct, _ sau -.",
    countNote: "Fiecare filă este numărată ca fereastră separată.", author: "Autor: Sarr",
    language: "Limbă", automatic: "Automat", search: "Caută limbi…", noMatches: "Niciun rezultat", detected: "Limba sistemului: {language}",
    saveError: "Limba nu a putut fi salvată. Încearcă din nou.", compact: "Etichetă compactă"
  },
  hu: {
    empty: "üres", hidden: "rejtett", here: "itt látható", active: "itt aktív", elsewhere: "látható itt: {monitor}", unknown: "ismeretlen állapot",
    windows: "Ablakok", grouped: "lap", unnamed: "Névtelen ablak",
    emptyHelp: "Ablak áthelyezése: Super + Alt + S.\nA Super + S megjeleníti és elrejti a scratchpadet.",
    shortcutNote: "A gyorsbillentyűk az Omarchy alapbeállításaira vonatkoznak.", customHelp: "Helyezz át egy ablakot erre a speciális Hyprland-munkaterületre.",
    clickHelp: "Kattintás: megjelenítés / elrejtés itt\nJobb kattintás: ablaklista és beállítások", show: "Megjelenítés itt", hide: "Elrejtés", focus: "Válassz egy ablakot a váltáshoz.",
    unknownHelp: "A Hyprland állapota nem érhető el. Próbáld újra később.", invalidHelp: "Érvénytelen munkaterületnév. Használj betűket, számjegyeket, pontot, _ vagy - jelet.",
    countNote: "Minden lap külön ablaknak számít.", author: "Készítette: Sarr",
    language: "Nyelv", automatic: "Automatikus", search: "Nyelvek keresése…", noMatches: "Nincs találat", detected: "Rendszernyelv: {language}",
    saveError: "A nyelvet nem sikerült menteni. Próbáld újra.", compact: "Rövid felirat"
  },
  el: {
    empty: "κενό", hidden: "κρυφό", here: "ορατό εδώ", active: "ενεργό εδώ", elsewhere: "ορατό στην οθόνη {monitor}", unknown: "άγνωστη κατάσταση",
    windows: "Παράθυρα", grouped: "καρτέλα", unnamed: "Παράθυρο χωρίς τίτλο",
    emptyHelp: "Μετακινήστε ένα παράθυρο με Super + Alt + S.\nΤο Super + S εμφανίζει και κρύβει το scratchpad.",
    shortcutNote: "Οι συντομεύσεις αντιστοιχούν στις προεπιλογές του Omarchy.", customHelp: "Μετακινήστε ένα παράθυρο σε αυτόν τον ειδικό χώρο εργασίας του Hyprland.",
    clickHelp: "Κλικ: εμφάνιση / απόκρυψη εδώ\nΔεξί κλικ: λίστα παραθύρων και ρυθμίσεις", show: "Εμφάνιση εδώ", hide: "Απόκρυψη", focus: "Επιλέξτε ένα παράθυρο για μετάβαση σε αυτό.",
    unknownHelp: "Η κατάσταση του Hyprland δεν είναι διαθέσιμη. Δοκιμάστε ξανά σε λίγο.", invalidHelp: "Μη έγκυρο όνομα χώρου. Χρησιμοποιήστε γράμματα, ψηφία, τελεία, _ ή -.",
    countNote: "Κάθε καρτέλα μετρά ως ξεχωριστό παράθυρο.", author: "Από τον Sarr",
    language: "Γλώσσα", automatic: "Αυτόματα", search: "Αναζήτηση γλωσσών…", noMatches: "Κανένα αποτέλεσμα", detected: "Γλώσσα συστήματος: {language}",
    saveError: "Δεν ήταν δυνατή η αποθήκευση της γλώσσας. Δοκιμάστε ξανά.", compact: "Σύντομη ετικέτα"
  },
  ar: {
    empty: "فارغ", hidden: "مخفي", here: "ظاهر هنا", active: "نشط هنا", elsewhere: "ظاهر على {monitor}", unknown: "الحالة غير معروفة",
    windows: "النوافذ", grouped: "علامة تبويب", unnamed: "نافذة بلا عنوان",
    emptyHelp: "انقل نافذة باستخدام ⁦Super + Alt + S⁩.\nيُظهر ⁦Super + S⁩ مساحة Scratchpad ويخفيها.",
    shortcutNote: "تشير الاختصارات إلى إعدادات Omarchy الافتراضية.", customHelp: "انقل نافذة إلى مساحة العمل الخاصة هذه في Hyprland.",
    clickHelp: "نقر: إظهار / إخفاء هنا\nنقر بالزر الأيمن: قائمة النوافذ والإعدادات", show: "إظهار هنا", hide: "إخفاء", focus: "اختر نافذة للانتقال إليها.",
    unknownHelp: "حالة Hyprland غير متاحة. حاول مجددًا بعد قليل.", invalidHelp: "اسم مساحة العمل غير صالح. استخدم أحرفًا لاتينية أو أرقامًا أو نقطة أو ⁦_⁩ أو ⁦-⁩.",
    countNote: "تُحسب كل علامة تبويب كنافذة مستقلة.", author: "من تطوير Sarr",
    language: "اللغة", automatic: "تلقائي", search: "ابحث عن لغة…", noMatches: "لا توجد نتائج", detected: "لغة النظام: {language}",
    saveError: "تعذر حفظ اللغة. حاول مجددًا.", compact: "تسمية مختصرة"
  },
  hi: {
    empty: "खाली", hidden: "छिपा हुआ", here: "यहाँ दिखाई दे रहा है", active: "यहाँ सक्रिय", elsewhere: "{monitor} पर दिखाई दे रहा है", unknown: "स्थिति अज्ञात",
    windows: "विंडो", grouped: "टैब", unnamed: "बिना शीर्षक की विंडो",
    emptyHelp: "Super + Alt + S से विंडो भेजें।\nSuper + S से स्क्रैचपैड दिखाएँ या छिपाएँ।",
    shortcutNote: "ये शॉर्टकट Omarchy की डिफ़ॉल्ट सेटिंग के अनुसार हैं।", customHelp: "Hyprland के इस विशेष कार्यक्षेत्र में एक विंडो भेजें।",
    clickHelp: "क्लिक: यहाँ दिखाएँ / छिपाएँ\nदायाँ क्लिक: विंडो सूची और सेटिंग्स", show: "यहाँ दिखाएँ", hide: "छिपाएँ", focus: "किसी विंडो पर जाने के लिए उसे चुनें।",
    unknownHelp: "Hyprland की स्थिति उपलब्ध नहीं है। कुछ देर बाद फिर कोशिश करें।", invalidHelp: "कार्यक्षेत्र का नाम अमान्य है। लैटिन अक्षर, अंक, बिंदु, _ या - इस्तेमाल करें।",
    countNote: "हर टैब एक अलग विंडो के रूप में गिना जाता है।", author: "निर्माता: Sarr",
    language: "भाषा", automatic: "स्वचालित", search: "भाषाएँ खोजें…", noMatches: "कोई परिणाम नहीं", detected: "सिस्टम की भाषा: {language}",
    saveError: "भाषा सहेजी नहीं जा सकी। फिर कोशिश करें।", compact: "छोटा लेबल"
  },
  id: {
    empty: "kosong", hidden: "tersembunyi", here: "terlihat di sini", active: "aktif di sini", elsewhere: "terlihat di {monitor}", unknown: "status tidak diketahui",
    windows: "Jendela", grouped: "tab", unnamed: "Jendela tanpa judul",
    emptyHelp: "Pindahkan jendela dengan Super + Alt + S.\nSuper + S menampilkan dan menyembunyikan scratchpad.",
    shortcutNote: "Pintasan mengacu pada pengaturan bawaan Omarchy.", customHelp: "Pindahkan jendela ke ruang kerja khusus ini di Hyprland.",
    clickHelp: "Klik: tampilkan / sembunyikan di sini\nKlik kanan: daftar jendela dan pengaturan", show: "Tampilkan di sini", hide: "Sembunyikan", focus: "Pilih jendela untuk beralih ke sana.",
    unknownHelp: "Status Hyprland tidak tersedia. Coba lagi sebentar.", invalidHelp: "Nama ruang kerja tidak valid. Gunakan huruf, angka, titik, _ atau -.",
    countNote: "Setiap tab dihitung sebagai jendela terpisah.", author: "Oleh Sarr",
    language: "Bahasa", automatic: "Otomatis", search: "Cari bahasa…", noMatches: "Tidak ada hasil", detected: "Bahasa sistem: {language}",
    saveError: "Bahasa tidak dapat disimpan. Coba lagi.", compact: "Label ringkas"
  },
  vi: {
    empty: "trống", hidden: "đang ẩn", here: "hiển thị ở đây", active: "đang dùng ở đây", elsewhere: "hiển thị trên {monitor}", unknown: "không rõ trạng thái",
    windows: "Cửa sổ", grouped: "thẻ", unnamed: "Cửa sổ không có tiêu đề",
    emptyHelp: "Chuyển cửa sổ bằng Super + Alt + S.\nSuper + S hiện và ẩn scratchpad.",
    shortcutNote: "Các phím tắt theo cấu hình mặc định của Omarchy.", customHelp: "Chuyển cửa sổ vào không gian làm việc đặc biệt này trong Hyprland.",
    clickHelp: "Nhấp: hiện / ẩn ở đây\nNhấp phải: danh sách cửa sổ và cài đặt", show: "Hiện ở đây", hide: "Ẩn", focus: "Chọn cửa sổ để chuyển đến.",
    unknownHelp: "Không đọc được trạng thái Hyprland. Hãy thử lại sau giây lát.", invalidHelp: "Tên không gian không hợp lệ. Dùng chữ cái Latinh, chữ số, dấu chấm, _ hoặc -.",
    countNote: "Mỗi thẻ được tính là một cửa sổ riêng.", author: "Tác giả: Sarr",
    language: "Ngôn ngữ", automatic: "Tự động", search: "Tìm ngôn ngữ…", noMatches: "Không có kết quả", detected: "Ngôn ngữ hệ thống: {language}",
    saveError: "Không thể lưu ngôn ngữ. Hãy thử lại.", compact: "Nhãn ngắn gọn"
  },
  th: {
    empty: "ว่าง", hidden: "ซ่อนอยู่", here: "แสดงอยู่ที่นี่", active: "ใช้งานที่นี่", elsewhere: "แสดงอยู่บน {monitor}", unknown: "ไม่ทราบสถานะ",
    windows: "หน้าต่าง", grouped: "แท็บ", unnamed: "หน้าต่างไม่มีชื่อ",
    emptyHelp: "ย้ายหน้าต่างด้วย Super + Alt + S\nSuper + S ใช้แสดงและซ่อน scratchpad",
    shortcutNote: "ปุ่มลัดเหล่านี้อ้างอิงการตั้งค่าเริ่มต้นของ Omarchy", customHelp: "ย้ายหน้าต่างไปยังพื้นที่ทำงานพิเศษนี้ใน Hyprland",
    clickHelp: "คลิก: แสดง / ซ่อนที่นี่\nคลิกขวา: รายการหน้าต่างและการตั้งค่า", show: "แสดงที่นี่", hide: "ซ่อน", focus: "เลือกหน้าต่างเพื่อสลับไปยังหน้าต่างนั้น",
    unknownHelp: "ไม่สามารถอ่านสถานะ Hyprland ได้ โปรดลองอีกครั้งในอีกสักครู่", invalidHelp: "ชื่อพื้นที่ทำงานไม่ถูกต้อง ใช้ตัวอักษรละติน ตัวเลข จุด _ หรือ -",
    countNote: "แต่ละแท็บนับเป็นหน้าต่างแยกกัน", author: "โดย Sarr",
    language: "ภาษา", automatic: "อัตโนมัติ", search: "ค้นหาภาษา…", noMatches: "ไม่พบผลลัพธ์", detected: "ภาษาของระบบ: {language}",
    saveError: "ไม่สามารถบันทึกภาษาได้ โปรดลองอีกครั้ง", compact: "ป้ายแบบย่อ"
  },
  ja: {
    empty: "空", hidden: "非表示", here: "ここに表示中", active: "ここで操作中", elsewhere: "{monitor} に表示中", unknown: "状態不明",
    windows: "ウィンドウ", grouped: "タブ", unnamed: "無題のウィンドウ",
    emptyHelp: "Super + Alt + S でウィンドウを移動します。\nSuper + S でスクラッチパッドを表示・非表示にします。",
    shortcutNote: "ショートカットは Omarchy の標準設定に基づきます。", customHelp: "Hyprland のこの特別なワークスペースにウィンドウを移動してください。",
    clickHelp: "クリック：ここに表示／非表示\n右クリック：ウィンドウ一覧と設定", show: "ここに表示", hide: "非表示", focus: "ウィンドウを選ぶと、そのウィンドウに切り替わります。",
    unknownHelp: "Hyprland の状態を取得できません。しばらくしてから再試行してください。", invalidHelp: "ワークスペース名が無効です。半角英数字、ピリオド、_、- を使用してください。",
    countNote: "各タブは個別のウィンドウとして数えます。", author: "作者：Sarr",
    language: "言語", automatic: "自動", search: "言語を検索…", noMatches: "該当なし", detected: "システムの言語：{language}",
    saveError: "言語を保存できませんでした。再試行してください。", compact: "短いラベル"
  },
  ko: {
    empty: "비어 있음", hidden: "숨김", here: "여기에 표시 중", active: "여기서 사용 중", elsewhere: "{monitor}에 표시 중", unknown: "상태 알 수 없음",
    windows: "창", grouped: "탭", unnamed: "제목 없는 창",
    emptyHelp: "Super + Alt + S로 창을 이동합니다.\nSuper + S로 스크래치패드를 표시하거나 숨깁니다.",
    shortcutNote: "단축키는 Omarchy의 기본 설정을 기준으로 합니다.", customHelp: "Hyprland의 이 특수 작업 공간으로 창을 이동하세요.",
    clickHelp: "클릭: 여기에 표시 / 숨기기\n오른쪽 클릭: 창 목록 및 설정", show: "여기에 표시", hide: "숨기기", focus: "창을 선택하면 해당 창으로 전환합니다.",
    unknownHelp: "Hyprland 상태를 가져올 수 없습니다. 잠시 후 다시 시도하세요.", invalidHelp: "작업 공간 이름이 올바르지 않습니다. 영문자, 숫자, 마침표, _ 또는 -를 사용하세요.",
    countNote: "각 탭은 별도의 창으로 계산됩니다.", author: "제작: Sarr",
    language: "언어", automatic: "자동", search: "언어 검색…", noMatches: "결과 없음", detected: "시스템 언어: {language}",
    saveError: "언어를 저장할 수 없습니다. 다시 시도하세요.", compact: "짧은 레이블"
  },
  "zh-CN": {
    empty: "空", hidden: "已隐藏", here: "此处可见", active: "正在此处使用", elsewhere: "在 {monitor} 上可见", unknown: "状态未知",
    windows: "窗口", grouped: "标签页", unnamed: "无标题窗口",
    emptyHelp: "按 Super + Alt + S 移入窗口。\n按 Super + S 显示或隐藏暂存区。",
    shortcutNote: "这些快捷键基于 Omarchy 的默认设置。", customHelp: "将窗口移至 Hyprland 的此特殊工作区。",
    clickHelp: "单击：在此显示／隐藏\n右键单击：窗口列表和设置", show: "在此显示", hide: "隐藏", focus: "选择窗口以切换到该窗口。",
    unknownHelp: "无法读取 Hyprland 状态，请稍后重试。", invalidHelp: "工作区名称无效，请使用英文字母、数字、点、_ 或 -。",
    countNote: "每个标签页都计为一个独立窗口。", author: "作者：Sarr",
    language: "语言", automatic: "自动", search: "搜索语言…", noMatches: "无匹配结果", detected: "系统语言：{language}",
    saveError: "无法保存语言，请重试。", compact: "简短标签"
  },
  "zh-TW": {
    empty: "空", hidden: "已隱藏", here: "此處可見", active: "正在此處使用", elsewhere: "在 {monitor} 上可見", unknown: "狀態不明",
    windows: "視窗", grouped: "分頁", unnamed: "無標題視窗",
    emptyHelp: "按 Super + Alt + S 移入視窗。\n按 Super + S 顯示或隱藏暫存區。",
    shortcutNote: "這些快捷鍵依據 Omarchy 的預設設定。", customHelp: "將視窗移至 Hyprland 的此特殊工作區。",
    clickHelp: "按一下：在此顯示／隱藏\n按右鍵：視窗清單與設定", show: "在此顯示", hide: "隱藏", focus: "選取視窗以切換至該視窗。",
    unknownHelp: "無法讀取 Hyprland 狀態，請稍後再試。", invalidHelp: "工作區名稱無效，請使用英文字母、數字、點、_ 或 -。",
    countNote: "每個分頁都計為一個獨立視窗。", author: "作者：Sarr",
    language: "語言", automatic: "自動", search: "搜尋語言…", noMatches: "沒有符合的結果", detected: "系統語言：{language}",
    saveError: "無法儲存語言，請重試。", compact: "簡短標籤"
  },
  sv: {
    empty: "tom", hidden: "dold", here: "synlig här", active: "aktiv här", elsewhere: "synlig på {monitor}", unknown: "okänd status",
    windows: "Fönster", grouped: "flik", unnamed: "Fönster utan titel",
    emptyHelp: "Flytta ett fönster med Super + Alt + S.\nSuper + S visar och döljer scratchpad.",
    shortcutNote: "Genvägarna gäller Omarchys standardinställningar.", customHelp: "Flytta ett fönster till denna särskilda arbetsyta i Hyprland.",
    clickHelp: "Klick: visa / dölj här\nHögerklick: fönsterlista och inställningar", show: "Visa här", hide: "Dölj", focus: "Välj ett fönster för att växla till det.",
    unknownHelp: "Hyprlands status är inte tillgänglig. Försök igen om en stund.", invalidHelp: "Ogiltigt namn på arbetsytan. Använd bokstäver, siffror, punkt, _ eller -.",
    countNote: "Varje flik räknas som ett eget fönster.", author: "Av Sarr",
    language: "Språk", automatic: "Automatiskt", search: "Sök språk…", noMatches: "Inga träffar", detected: "Systemspråk: {language}",
    saveError: "Språket kunde inte sparas. Försök igen.", compact: "Kompakt etikett"
  }
};

var appearanceCatalogs = {
  en: ["Appearance", "Highlight color", "Restore saved color", "Apply", "Cancel", "Enter a color as #RGB or #RRGGBB.", "Tooltip style", "Spacious", "Compact", "Live preview", "Could not save appearance. Try again."],
  pl: ["Wygląd", "Kolor podświetlenia", "Przywróć zapisany kolor", "Zastosuj", "Anuluj", "Wpisz kolor jako #RGB lub #RRGGBB.", "Styl podpowiedzi", "Przestronny", "Kompaktowy", "Podgląd na żywo", "Nie udało się zapisać wyglądu. Spróbuj ponownie."],
  de: ["Aussehen", "Hervorhebungsfarbe", "Gespeicherte Farbe wiederherstellen", "Anwenden", "Abbrechen", "Farbe als #RGB oder #RRGGBB eingeben.", "Tooltip-Stil", "Geräumig", "Kompakt", "Live-Vorschau", "Das Aussehen konnte nicht gespeichert werden. Erneut versuchen."],
  fr: ["Apparence", "Couleur de surbrillance", "Rétablir la couleur enregistrée", "Appliquer", "Annuler", "Saisissez une couleur au format #RGB ou #RRGGBB.", "Style de l’infobulle", "Aéré", "Compact", "Aperçu en direct", "Impossible d’enregistrer l’apparence. Réessayez."],
  es: ["Apariencia", "Color de resaltado", "Restaurar color guardado", "Aplicar", "Cancelar", "Introduce un color como #RGB o #RRGGBB.", "Estilo de la ayuda emergente", "Amplio", "Compacto", "Vista previa en vivo", "No se pudo guardar la apariencia. Inténtalo de nuevo."],
  "pt-BR": ["Aparência", "Cor de destaque", "Restaurar cor salva", "Aplicar", "Cancelar", "Digite uma cor como #RGB ou #RRGGBB.", "Estilo da dica", "Espaçoso", "Compacto", "Prévia ao vivo", "Não foi possível salvar a aparência. Tente novamente."],
  "pt-PT": ["Aparência", "Cor de destaque", "Restaurar cor guardada", "Aplicar", "Cancelar", "Introduza uma cor como #RGB ou #RRGGBB.", "Estilo da dica", "Espaçoso", "Compacto", "Pré-visualização em direto", "Não foi possível guardar a aparência. Tente novamente."],
  it: ["Aspetto", "Colore di evidenziazione", "Ripristina colore salvato", "Applica", "Annulla", "Inserisci un colore come #RGB o #RRGGBB.", "Stile del suggerimento", "Spazioso", "Compatto", "Anteprima in tempo reale", "Impossibile salvare l’aspetto. Riprova."],
  nl: ["Uiterlijk", "Markeringskleur", "Opgeslagen kleur herstellen", "Toepassen", "Annuleren", "Voer een kleur in als #RGB of #RRGGBB.", "Stijl van de tooltip", "Ruim", "Compact", "Livevoorbeeld", "Het uiterlijk kon niet worden opgeslagen. Probeer opnieuw."],
  sv: ["Utseende", "Markeringsfärg", "Återställ sparad färg", "Verkställ", "Avbryt", "Ange en färg som #RGB eller #RRGGBB.", "Verktygstipsens stil", "Rymlig", "Kompakt", "Direktförhandsvisning", "Utseendet kunde inte sparas. Försök igen."],
  da: ["Udseende", "Fremhævningsfarve", "Gendan gemt farve", "Anvend", "Annuller", "Angiv en farve som #RGB eller #RRGGBB.", "Værktøjstippets stil", "Rummelig", "Kompakt", "Livevisning", "Udseendet kunne ikke gemmes. Prøv igen."],
  nb: ["Utseende", "Uthevingsfarge", "Gjenopprett lagret farge", "Bruk", "Avbryt", "Skriv inn en farge som #RGB eller #RRGGBB.", "Stil for verktøytips", "Romslig", "Kompakt", "Direkte forhåndsvisning", "Utseendet kunne ikke lagres. Prøv igjen."],
  fi: ["Ulkoasu", "Korostusväri", "Palauta tallennettu väri", "Käytä", "Peruuta", "Anna väri muodossa #RGB tai #RRGGBB.", "Työkaluvihjeen tyyli", "Väljä", "Tiivis", "Reaaliaikainen esikatselu", "Ulkoasun tallennus epäonnistui. Yritä uudelleen."],
  cs: ["Vzhled", "Barva zvýraznění", "Obnovit uloženou barvu", "Použít", "Zrušit", "Zadejte barvu jako #RGB nebo #RRGGBB.", "Styl nápovědy", "Vzdušný", "Kompaktní", "Živý náhled", "Vzhled se nepodařilo uložit. Zkuste to znovu."],
  sk: ["Vzhľad", "Farba zvýraznenia", "Obnoviť uloženú farbu", "Použiť", "Zrušiť", "Zadajte farbu ako #RGB alebo #RRGGBB.", "Štýl pomocníka", "Vzdušný", "Kompaktný", "Živý náhľad", "Vzhľad sa nepodarilo uložiť. Skúste to znova."],
  uk: ["Вигляд", "Колір підсвічування", "Відновити збережений колір", "Застосувати", "Скасувати", "Введіть колір у форматі #RGB або #RRGGBB.", "Стиль підказки", "Просторий", "Компактний", "Попередній перегляд наживо", "Не вдалося зберегти вигляд. Спробуйте ще раз."],
  ru: ["Внешний вид", "Цвет подсветки", "Восстановить сохранённый цвет", "Применить", "Отмена", "Введите цвет в формате #RGB или #RRGGBB.", "Стиль подсказки", "Просторный", "Компактный", "Предпросмотр в реальном времени", "Не удалось сохранить внешний вид. Попробуйте ещё раз."],
  tr: ["Görünüm", "Vurgu rengi", "Kayıtlı rengi geri yükle", "Uygula", "İptal", "Rengi #RGB veya #RRGGBB olarak girin.", "İpucu stili", "Geniş", "Kompakt", "Canlı önizleme", "Görünüm kaydedilemedi. Tekrar deneyin."],
  ro: ["Aspect", "Culoare de evidențiere", "Restabilește culoarea salvată", "Aplică", "Anulează", "Introdu o culoare ca #RGB sau #RRGGBB.", "Stilul indiciului", "Spațios", "Compact", "Previzualizare în timp real", "Aspectul nu a putut fi salvat. Încearcă din nou."],
  hu: ["Megjelenés", "Kiemelés színe", "Mentett szín visszaállítása", "Alkalmaz", "Mégse", "A szín formátuma #RGB vagy #RRGGBB legyen.", "Buboréksúgó stílusa", "Szellős", "Tömör", "Élő előnézet", "A megjelenést nem sikerült menteni. Próbáld újra."],
  el: ["Εμφάνιση", "Χρώμα επισήμανσης", "Επαναφορά αποθηκευμένου χρώματος", "Εφαρμογή", "Ακύρωση", "Εισαγάγετε χρώμα ως #RGB ή #RRGGBB.", "Στυλ επεξήγησης", "Ευρύχωρο", "Συμπαγές", "Ζωντανή προεπισκόπηση", "Η εμφάνιση δεν αποθηκεύτηκε. Δοκιμάστε ξανά."],
  ar: ["المظهر", "لون التمييز", "استعادة اللون المحفوظ", "تطبيق", "إلغاء", "أدخل لونًا بصيغة ⁦#RGB⁩ أو ⁦#RRGGBB⁩.", "نمط التلميح", "واسع", "مضغوط", "معاينة مباشرة", "تعذر حفظ المظهر. حاول مجددًا."],
  hi: ["दिखावट", "हाइलाइट का रंग", "सहेजा गया रंग वापस लाएँ", "लागू करें", "रद्द करें", "रंग #RGB या #RRGGBB के रूप में दर्ज करें।", "टूलटिप शैली", "खुला", "संक्षिप्त", "लाइव पूर्वावलोकन", "दिखावट सहेजी नहीं जा सकी। फिर कोशिश करें।"],
  id: ["Tampilan", "Warna sorotan", "Pulihkan warna tersimpan", "Terapkan", "Batal", "Masukkan warna sebagai #RGB atau #RRGGBB.", "Gaya tooltip", "Lapang", "Ringkas", "Pratinjau langsung", "Tampilan tidak dapat disimpan. Coba lagi."],
  vi: ["Giao diện", "Màu tô sáng", "Khôi phục màu đã lưu", "Áp dụng", "Hủy", "Nhập màu theo dạng #RGB hoặc #RRGGBB.", "Kiểu chú giải", "Thoáng", "Gọn", "Xem trước trực tiếp", "Không thể lưu giao diện. Hãy thử lại."],
  th: ["รูปลักษณ์", "สีเน้น", "คืนค่าสีที่บันทึกไว้", "ใช้", "ยกเลิก", "ใส่สีในรูปแบบ #RGB หรือ #RRGGBB", "รูปแบบคำแนะนำ", "โปร่ง", "กะทัดรัด", "ตัวอย่างแบบทันที", "ไม่สามารถบันทึกรูปลักษณ์ได้ โปรดลองอีกครั้ง"],
  ja: ["外観", "強調色", "保存した色に戻す", "適用", "キャンセル", "#RGB または #RRGGBB 形式で色を入力してください。", "ツールチップのスタイル", "ゆったり", "コンパクト", "ライブプレビュー", "外観を保存できませんでした。再試行してください。"],
  ko: ["모양", "강조 색상", "저장된 색상 복원", "적용", "취소", "색상을 #RGB 또는 #RRGGBB 형식으로 입력하세요.", "도구 설명 스타일", "여유롭게", "간결하게", "실시간 미리보기", "모양을 저장할 수 없습니다. 다시 시도하세요."],
  "zh-CN": ["外观", "高亮颜色", "恢复已保存的颜色", "应用", "取消", "请输入 #RGB 或 #RRGGBB 格式的颜色。", "提示框样式", "宽松", "紧凑", "实时预览", "无法保存外观，请重试。"],
  "zh-TW": ["外觀", "醒目提示顏色", "還原已儲存的色彩", "套用", "取消", "請輸入 #RGB 或 #RRGGBB 格式的顏色。", "提示框樣式", "寬鬆", "緊湊", "即時預覽", "無法儲存外觀，請重試。"]
};
Object.keys(appearanceCatalogs).forEach(function(code) {
  appearanceKeys.forEach(function(key, index) { catalogs[code][key] = appearanceCatalogs[code][index]; });
});

var labelKeys = ["labels", "labelStyle", "shortLabels", "explicitLabels", "customLabels", "labelHelp", "labelSaveError"];
var labelCatalogs = {
  en: ["Labels and text", "Description style", "Short", "With Scratchpad", "Custom", "Same descriptions in the bar, panel and tooltip. Blank fields use the Scratchpad preset. Variables: {monitor}, {count}, {workspace}.", "Could not save labels. Try again."],
  pl: ["Etykiety i teksty", "Styl opisów", "Krótki", "Z nazwą Scratchpad", "Własny", "Te same opisy na pasku, w panelu i dymku. Puste pola używają wariantu z nazwą Scratchpad. Zmienne: {monitor}, {count}, {workspace}.", "Nie udało się zapisać opisów. Spróbuj ponownie."],
  de: ["Beschriftungen und Texte", "Beschreibungsstil", "Kurz", "Mit Scratchpad", "Benutzerdefiniert", "Gleiche Texte in Leiste, Panel und Tooltip. Leere Felder verwenden die Scratchpad-Vorlage. Variablen: {monitor}, {count}, {workspace}.", "Beschriftungen konnten nicht gespeichert werden. Erneut versuchen."],
  fr: ["Libellés et textes", "Style des descriptions", "Court", "Avec Scratchpad", "Personnalisé", "Mêmes textes dans la barre, le panneau et l’infobulle. Les champs vides utilisent le modèle Scratchpad. Variables : {monitor}, {count}, {workspace}.", "Impossible d’enregistrer les libellés. Réessayez."],
  es: ["Etiquetas y textos", "Estilo de descripción", "Breve", "Con Scratchpad", "Personalizado", "Los mismos textos en la barra, el panel y la ayuda emergente. Los campos vacíos usan el modelo Scratchpad. Variables: {monitor}, {count}, {workspace}.", "No se pudieron guardar las etiquetas. Inténtalo de nuevo."],
  "pt-BR": ["Rótulos e textos", "Estilo das descrições", "Curto", "Com Scratchpad", "Personalizado", "Os mesmos textos na barra, no painel e na dica. Campos vazios usam o modelo Scratchpad. Variáveis: {monitor}, {count}, {workspace}.", "Não foi possível salvar os rótulos. Tente novamente."],
  "pt-PT": ["Etiquetas e textos", "Estilo das descrições", "Curto", "Com Scratchpad", "Personalizado", "Os mesmos textos na barra, no painel e na dica. Os campos vazios usam o modelo Scratchpad. Variáveis: {monitor}, {count}, {workspace}.", "Não foi possível guardar as etiquetas. Tente novamente."],
  it: ["Etichette e testi", "Stile delle descrizioni", "Breve", "Con Scratchpad", "Personalizzato", "Gli stessi testi nella barra, nel pannello e nel suggerimento. I campi vuoti usano il modello Scratchpad. Variabili: {monitor}, {count}, {workspace}.", "Impossibile salvare le etichette. Riprova."],
  nl: ["Labels en teksten", "Beschrijvingsstijl", "Kort", "Met Scratchpad", "Aangepast", "Dezelfde teksten in balk, paneel en tooltip. Lege velden gebruiken het Scratchpad-sjabloon. Variabelen: {monitor}, {count}, {workspace}.", "Labels konden niet worden opgeslagen. Probeer opnieuw."],
  sv: ["Etiketter och texter", "Beskrivningsstil", "Kort", "Med Scratchpad", "Egen", "Samma texter i fältet, panelen och verktygstipset. Tomma fält använder Scratchpad-mallen. Variabler: {monitor}, {count}, {workspace}.", "Etiketterna kunde inte sparas. Försök igen."],
  da: ["Etiketter og tekster", "Beskrivelsesstil", "Kort", "Med Scratchpad", "Egen", "Samme tekster i bjælken, panelet og værktøjstippet. Tomme felter bruger Scratchpad-skabelonen. Variabler: {monitor}, {count}, {workspace}.", "Etiketterne kunne ikke gemmes. Prøv igen."],
  nb: ["Etiketter og tekster", "Beskrivelsesstil", "Kort", "Med Scratchpad", "Egendefinert", "Samme tekster i linjen, panelet og verktøytipset. Tomme felt bruker Scratchpad-malen. Variabler: {monitor}, {count}, {workspace}.", "Etikettene kunne ikke lagres. Prøv igjen."],
  fi: ["Nimikkeet ja tekstit", "Kuvausten tyyli", "Lyhyt", "Scratchpad-nimellä", "Oma", "Samat tekstit palkissa, paneelissa ja työkaluvihjeessä. Tyhjät kentät käyttävät Scratchpad-mallia. Muuttujat: {monitor}, {count}, {workspace}.", "Nimikkeiden tallennus epäonnistui. Yritä uudelleen."],
  cs: ["Popisky a texty", "Styl popisů", "Krátký", "S názvem Scratchpad", "Vlastní", "Stejné texty na liště, v panelu a nápovědě. Prázdná pole používají šablonu Scratchpad. Proměnné: {monitor}, {count}, {workspace}.", "Popisky se nepodařilo uložit. Zkuste to znovu."],
  sk: ["Popisy a texty", "Štýl popisov", "Krátky", "S názvom Scratchpad", "Vlastný", "Rovnaké texty na lište, v paneli a pomocníkovi. Prázdne polia používajú šablónu Scratchpad. Premenné: {monitor}, {count}, {workspace}.", "Popisy sa nepodarilo uložiť. Skúste to znova."],
  uk: ["Підписи й тексти", "Стиль описів", "Короткий", "З назвою Scratchpad", "Власний", "Однакові тексти на смузі, у панелі та підказці. Порожні поля використовують шаблон Scratchpad. Змінні: {monitor}, {count}, {workspace}.", "Не вдалося зберегти підписи. Спробуйте ще раз."],
  ru: ["Подписи и тексты", "Стиль описаний", "Краткий", "С названием Scratchpad", "Свой", "Одинаковые тексты в строке, панели и подсказке. Пустые поля используют шаблон Scratchpad. Переменные: {monitor}, {count}, {workspace}.", "Не удалось сохранить подписи. Попробуйте ещё раз."],
  tr: ["Etiketler ve metinler", "Açıklama stili", "Kısa", "Scratchpad adıyla", "Özel", "Çubuk, panel ve ipucunda aynı metinler gösterilir. Boş alanlar Scratchpad şablonunu kullanır. Değişkenler: {monitor}, {count}, {workspace}.", "Etiketler kaydedilemedi. Tekrar deneyin."],
  ro: ["Etichete și texte", "Stilul descrierilor", "Scurt", "Cu Scratchpad", "Personalizat", "Aceleași texte în bară, panou și indiciu. Câmpurile goale folosesc șablonul Scratchpad. Variabile: {monitor}, {count}, {workspace}.", "Etichetele nu au putut fi salvate. Încearcă din nou."],
  hu: ["Címkék és szövegek", "Leírások stílusa", "Rövid", "Scratchpad névvel", "Egyéni", "Azonos szövegek a sávban, a panelen és a buboréksúgóban. Az üres mezők a Scratchpad-sablont használják. Változók: {monitor}, {count}, {workspace}.", "A címkéket nem sikerült menteni. Próbáld újra."],
  el: ["Ετικέτες και κείμενα", "Στυλ περιγραφών", "Σύντομο", "Με το όνομα Scratchpad", "Προσαρμοσμένο", "Ίδια κείμενα στη γραμμή, στον πίνακα και στην επεξήγηση. Τα κενά πεδία χρησιμοποιούν το πρότυπο Scratchpad. Μεταβλητές: {monitor}, {count}, {workspace}.", "Οι ετικέτες δεν αποθηκεύτηκαν. Δοκιμάστε ξανά."],
  ar: ["التسميات والنصوص", "نمط الوصف", "مختصر", "مع اسم Scratchpad", "مخصص", "النصوص نفسها في الشريط واللوحة والتلميح. تستخدم الحقول الفارغة قالب Scratchpad. المتغيرات: {monitor}، {count}، {workspace}.", "تعذر حفظ التسميات. حاول مجددًا."],
  hi: ["लेबल और पाठ", "विवरण की शैली", "संक्षिप्त", "Scratchpad नाम के साथ", "अपना", "बार, पैनल और टूलटिप में एक जैसे विवरण। खाली फ़ील्ड Scratchpad प्रारूप इस्तेमाल करते हैं। चर: {monitor}, {count}, {workspace}।", "लेबल सहेजे नहीं जा सके। फिर कोशिश करें।"],
  id: ["Label dan teks", "Gaya deskripsi", "Singkat", "Dengan Scratchpad", "Kustom", "Teks yang sama di bilah, panel, dan tooltip. Kolom kosong memakai templat Scratchpad. Variabel: {monitor}, {count}, {workspace}.", "Label tidak dapat disimpan. Coba lagi."],
  vi: ["Nhãn và văn bản", "Kiểu mô tả", "Ngắn gọn", "Có tên Scratchpad", "Tùy chỉnh", "Cùng mô tả trên thanh, bảng và chú giải. Ô trống dùng mẫu Scratchpad. Biến: {monitor}, {count}, {workspace}.", "Không thể lưu nhãn. Hãy thử lại."],
  th: ["ป้ายและข้อความ", "รูปแบบคำอธิบาย", "แบบสั้น", "พร้อมชื่อ Scratchpad", "กำหนดเอง", "ใช้ข้อความเดียวกันในแถบ แผง และคำแนะนำ ช่องว่างจะใช้รูปแบบ Scratchpad ตัวแปร: {monitor}, {count}, {workspace}", "ไม่สามารถบันทึกป้ายได้ โปรดลองอีกครั้ง"],
  ja: ["ラベルとテキスト", "説明のスタイル", "短い", "Scratchpad名付き", "カスタム", "バー、パネル、ツールチップに同じ説明を表示します。空欄ではScratchpad形式を使います。変数：{monitor}、{count}、{workspace}。", "ラベルを保存できませんでした。再試行してください。"],
  ko: ["레이블과 텍스트", "설명 스타일", "짧게", "Scratchpad 이름 포함", "사용자 지정", "막대, 패널, 도구 설명에 같은 내용을 표시합니다. 빈 필드는 Scratchpad 형식을 사용합니다. 변수: {monitor}, {count}, {workspace}.", "레이블을 저장할 수 없습니다. 다시 시도하세요."],
  "zh-CN": ["标签与文本", "描述样式", "简短", "包含 Scratchpad 名称", "自定义", "栏、面板和提示框使用相同描述。空白字段使用 Scratchpad 预设。变量：{monitor}、{count}、{workspace}。", "无法保存标签，请重试。"],
  "zh-TW": ["標籤與文字", "描述樣式", "簡短", "包含 Scratchpad 名稱", "自訂", "列、面板和提示框使用相同描述。空白欄位使用 Scratchpad 預設。變數：{monitor}、{count}、{workspace}。", "無法儲存標籤，請重試。"]
};
Object.keys(labelCatalogs).forEach(function(code) {
  labelKeys.forEach(function(key, index) { catalogs[code][key] = labelCatalogs[code][index]; });
});

var scalingKeys = ["scaling", "panelScale", "barScale", "scaleHelp", "invalidScale", "barScaleLimit"];
var scalingCatalogs = {
  en: ["Scale", "Panel and tooltip", "Bar text", "80–200%. At 100%, sizes follow the system. Preview is live; Apply saves your choice.", "Enter a percentage from 80 to 200.", "The current bar height limits text to {percent}%."],
  pl: ["Skala", "Panel i dymek", "Napis na pasku", "80–200%. Przy 100% rozmiary wynikają z ustawień systemu. Podgląd działa na żywo; Zastosuj zapisuje wybór.", "Wpisz procent od 80 do 200.", "Obecna wysokość paska ogranicza rozmiar napisu do {percent}%."],
  de: ["Skalierung", "Panel und Tooltip", "Text in der Leiste", "80–200 %. Bei 100 % gelten die Systemgrößen. Die Vorschau ist live; Anwenden speichert die Auswahl.", "Geben Sie einen Prozentwert von 80 bis 200 ein.", "Die aktuelle Leistenhöhe begrenzt den Text auf {percent} %."],
  fr: ["Échelle", "Panneau et infobulle", "Texte de la barre", "80–200 %. À 100 %, les tailles suivent le système. Aperçu en direct ; Appliquer enregistre votre choix.", "Saisissez un pourcentage de 80 à 200.", "La hauteur actuelle de la barre limite le texte à {percent} %."],
  es: ["Escala", "Panel y ayuda emergente", "Texto de la barra", "80–200 %. Al 100 %, los tamaños siguen al sistema. Vista previa en vivo; Aplicar guarda tu elección.", "Introduce un porcentaje entre 80 y 200.", "La altura actual de la barra limita el texto al {percent} %."],
  "pt-BR": ["Escala", "Painel e dica", "Texto da barra", "80–200%. Em 100%, os tamanhos seguem o sistema. A prévia é ao vivo; Aplicar salva sua escolha.", "Digite uma porcentagem de 80 a 200.", "A altura atual da barra limita o texto a {percent}%."],
  "pt-PT": ["Escala", "Painel e dica", "Texto da barra", "80–200%. A 100%, os tamanhos seguem o sistema. A pré-visualização é em direto; Aplicar guarda a escolha.", "Introduza uma percentagem de 80 a 200.", "A altura atual da barra limita o texto a {percent}%."],
  it: ["Scala", "Pannello e suggerimento", "Testo della barra", "80–200%. Al 100%, le dimensioni seguono il sistema. Anteprima in tempo reale; Applica salva la scelta.", "Inserisci una percentuale da 80 a 200.", "L’altezza attuale della barra limita il testo al {percent}%."],
  nl: ["Schaal", "Paneel en tooltip", "Tekst in de balk", "80–200%. Bij 100% volgen de afmetingen het systeem. Livevoorbeeld; Toepassen slaat je keuze op.", "Voer een percentage van 80 tot 200 in.", "De huidige balkhoogte beperkt de tekst tot {percent}%."],
  sv: ["Skala", "Panel och verktygstips", "Text i fältet", "80–200 %. Vid 100 % följer storlekarna systemet. Direktförhandsvisning; Verkställ sparar ditt val.", "Ange en procentsats från 80 till 200.", "Fältets nuvarande höjd begränsar texten till {percent} %."],
  da: ["Skalering", "Panel og værktøjstip", "Tekst i bjælken", "80–200 %. Ved 100 % følger størrelserne systemet. Livevisning; Anvend gemmer dit valg.", "Angiv en procentværdi fra 80 til 200.", "Bjælkens nuværende højde begrænser teksten til {percent} %."],
  nb: ["Skalering", "Panel og verktøytips", "Tekst i linjen", "80–200 %. Ved 100 % følger størrelsene systemet. Direkte forhåndsvisning; Bruk lagrer valget.", "Skriv inn en prosentverdi fra 80 til 200.", "Linjens nåværende høyde begrenser teksten til {percent} %."],
  fi: ["Skaalaus", "Paneeli ja työkaluvihje", "Palkin teksti", "80–200 %. Kun arvo on 100 %, koot seuraavat järjestelmää. Reaaliaikainen esikatselu; Käytä tallentaa valinnan.", "Anna prosenttiluku väliltä 80–200.", "Palkin nykyinen korkeus rajoittaa tekstin kokoon {percent} %."],
  cs: ["Měřítko", "Panel a nápověda", "Text na liště", "80–200 %. Při 100 % odpovídají velikosti systému. Náhled je živý; Použít uloží volbu.", "Zadejte procento od 80 do 200.", "Současná výška lišty omezuje text na {percent} %."],
  sk: ["Mierka", "Panel a pomocník", "Text na lište", "80–200 %. Pri 100 % zodpovedajú veľkosti systému. Náhľad je živý; Použiť uloží voľbu.", "Zadajte percento od 80 do 200.", "Súčasná výška lišty obmedzuje text na {percent} %."],
  uk: ["Масштаб", "Панель і підказка", "Текст на смузі", "80–200%. За 100% розміри відповідають системним. Перегляд наживо; Застосувати зберігає вибір.", "Введіть відсоток від 80 до 200.", "Поточна висота смуги обмежує текст до {percent}%."],
  ru: ["Масштаб", "Панель и подсказка", "Текст в строке", "80–200%. При 100% размеры соответствуют системным. Предпросмотр в реальном времени; Применить сохраняет выбор.", "Введите процент от 80 до 200.", "Текущая высота строки ограничивает текст до {percent}%."],
  tr: ["Ölçek", "Panel ve ipucu", "Çubuk metni", "%80–200. %100’de boyutlar sistemi izler. Önizleme canlıdır; Uygula seçiminizi kaydeder.", "80 ile 200 arasında bir yüzde girin.", "Geçerli çubuk yüksekliği metni %{percent} ile sınırlar."],
  ro: ["Scalare", "Panou și indiciu", "Textul barei", "80–200%. La 100%, dimensiunile urmează sistemul. Previzualizare în timp real; Aplică salvează alegerea.", "Introdu un procent între 80 și 200.", "Înălțimea actuală a barei limitează textul la {percent}%."],
  hu: ["Méretezés", "Panel és buboréksúgó", "Sáv szövege", "80–200%. 100%-nál a méretek a rendszert követik. Élő előnézet; az Alkalmaz menti a választást.", "Adj meg egy százalékot 80 és 200 között.", "A sáv jelenlegi magassága {percent}%-ra korlátozza a szöveget."],
  el: ["Κλίμακα", "Πίνακας και επεξήγηση", "Κείμενο γραμμής", "80–200%. Στο 100%, τα μεγέθη ακολουθούν το σύστημα. Ζωντανή προεπισκόπηση· Εφαρμογή αποθηκεύει την επιλογή.", "Εισαγάγετε ποσοστό από 80 έως 200.", "Το τρέχον ύψος της γραμμής περιορίζει το κείμενο στο {percent}%."],
  ar: ["التحجيم", "اللوحة والتلميح", "نص الشريط", "80–200%. عند 100% تتبع الأحجام النظام. المعاينة مباشرة؛ يحفظ تطبيق اختيارك.", "أدخل نسبة من 80 إلى 200.", "ارتفاع الشريط الحالي يحد حجم النص إلى {percent}%."],
  hi: ["स्केल", "पैनल और टूलटिप", "बार का पाठ", "80–200%। 100% पर आकार सिस्टम के अनुसार होते हैं। लाइव पूर्वावलोकन; लागू करें से चुनाव सहेजें।", "80 से 200 के बीच प्रतिशत दर्ज करें।", "बार की मौजूदा ऊँचाई पाठ को {percent}% तक सीमित करती है।"],
  id: ["Skala", "Panel dan tooltip", "Teks bilah", "80–200%. Pada 100%, ukuran mengikuti sistem. Pratinjau langsung; Terapkan menyimpan pilihan.", "Masukkan persentase dari 80 hingga 200.", "Tinggi bilah saat ini membatasi teks hingga {percent}%."],
  vi: ["Tỷ lệ", "Bảng và chú giải", "Văn bản trên thanh", "80–200%. Ở 100%, kích thước theo hệ thống. Xem trước trực tiếp; Áp dụng lưu lựa chọn.", "Nhập phần trăm từ 80 đến 200.", "Chiều cao thanh hiện tại giới hạn văn bản ở {percent}%."],
  th: ["ขนาด", "แผงและคำแนะนำ", "ข้อความบนแถบ", "80–200% ที่ 100% ขนาดจะตามระบบ แสดงตัวอย่างทันที กดใช้เพื่อบันทึก", "ใส่เปอร์เซ็นต์ตั้งแต่ 80 ถึง 200", "ความสูงปัจจุบันของแถบจำกัดขนาดข้อความไว้ที่ {percent}%"],
  ja: ["拡大率", "パネルとツールチップ", "バーのテキスト", "80～200%。100%ではシステムのサイズに従います。変更はすぐにプレビューされ、適用で保存されます。", "80～200のパーセント値を入力してください。", "現在のバーの高さではテキストは{percent}%までです。"],
  ko: ["배율", "패널과 도구 설명", "막대 텍스트", "80–200%. 100%에서는 시스템 크기를 따릅니다. 실시간으로 미리 보며 적용을 누르면 저장합니다.", "80에서 200 사이의 백분율을 입력하세요.", "현재 막대 높이로 인해 텍스트가 {percent}%로 제한됩니다."],
  "zh-CN": ["缩放", "面板与提示框", "栏内文字", "80–200%。100% 时使用系统尺寸。实时预览；点击应用保存选择。", "请输入 80 到 200 之间的百分比。", "当前栏高度将文字限制为 {percent}%。"],
  "zh-TW": ["縮放", "面板與提示框", "列內文字", "80–200%。100% 時使用系統尺寸。即時預覽；點選套用儲存選擇。", "請輸入 80 到 200 之間的百分比。", "目前列高度將文字限制為 {percent}%。"]
};
Object.keys(scalingCatalogs).forEach(function(code) {
  scalingKeys.forEach(function(key, index) { catalogs[code][key] = scalingCatalogs[code][index]; });
});

// Theme-aware color choices and named swatches. Preset names are user text.
var colorKeys = ["colorMode", "colorAdaptive", "colorTheme", "colorScope", "colorThisTheme", "colorAllThemes", "colorAdaptiveHelp", "colorPresets", "scratchPink", "saveColor", "editPreset", "presetName", "updatePreset", "deletePreset", "presetNameError", "presetDraftHelp"];
var colorCatalogs = {
  en: ["Color mode", "Adapted (default)", "Omarchy accent", "Use for", "Only {theme}", "All themes", "Adapted: pink in Tokyo Night; the theme accent elsewhere.", "Color presets", "ScratchPeek pink", "Save color", "Edit preset", "Preset name", "Update preset", "Delete preset", "Use a unique name. Maximum 24 presets.", "Apply also saves presets. Cancel discards these edits."],
  pl: ["Tryb koloru", "Dopasowany (domyślny)", "Akcent Omarchy", "Używaj dla", "Tylko {theme}", "Wszystkie motywy", "Dopasowany: różowy w Tokyo Night; w pozostałych akcent motywu.", "Presety kolorów", "Róż ScratchPeek", "Zapisz kolor", "Edytuj preset", "Nazwa presetu", "Zaktualizuj", "Usuń preset", "Użyj unikalnej nazwy. Maksymalnie 24 presety.", "Zastosuj zapisuje również presety. Anuluj cofa ich edycję."],
  de: ["Farbmodus", "Angepasst (Standard)", "Omarchy-Akzent", "Verwenden für", "Nur {theme}", "Alle Designs", "Angepasst: Rosa in Tokyo Night, sonst die Akzentfarbe des Designs.", "Farbvorlagen", "ScratchPeek-Rosa", "Farbe speichern", "Vorlage bearbeiten", "Vorlagenname", "Aktualisieren", "Vorlage löschen", "Einen eindeutigen Namen verwenden. Höchstens 24 Vorlagen.", "Anwenden speichert auch Vorlagen. Abbrechen verwirft diese Änderungen."],
  fr: ["Mode de couleur", "Adapté (par défaut)", "Accent Omarchy", "Utiliser pour", "Uniquement {theme}", "Tous les thèmes", "Adapté : rose dans Tokyo Night, accent du thème ailleurs.", "Couleurs enregistrées", "Rose ScratchPeek", "Enregistrer", "Modifier", "Nom de la couleur", "Mettre à jour", "Supprimer", "Utilisez un nom unique. Maximum 24 couleurs.", "Appliquer enregistre aussi les couleurs. Annuler abandonne ces modifications."],
  es: ["Modo de color", "Adaptado (predeterminado)", "Acento de Omarchy", "Usar para", "Solo {theme}", "Todos los temas", "Adaptado: rosa en Tokyo Night; el acento del tema en los demás.", "Colores guardados", "Rosa ScratchPeek", "Guardar color", "Editar color", "Nombre del color", "Actualizar", "Eliminar color", "Usa un nombre único. Máximo 24 colores.", "Aplicar también guarda los colores. Cancelar descarta estos cambios."],
  "pt-BR": ["Modo de cor", "Adaptado (padrão)", "Destaque do Omarchy", "Usar em", "Somente {theme}", "Todos os temas", "Adaptado: rosa no Tokyo Night; a cor de destaque nos demais temas.", "Cores salvas", "Rosa ScratchPeek", "Salvar cor", "Editar cor", "Nome da cor", "Atualizar", "Excluir cor", "Use um nome único. Máximo de 24 cores.", "Aplicar também salva as cores. Cancelar descarta estas edições."],
  "pt-PT": ["Modo de cor", "Adaptado (predefinido)", "Destaque do Omarchy", "Usar em", "Apenas {theme}", "Todos os temas", "Adaptado: rosa no Tokyo Night; a cor de destaque nos restantes temas.", "Cores guardadas", "Rosa ScratchPeek", "Guardar cor", "Editar cor", "Nome da cor", "Atualizar", "Eliminar cor", "Use um nome único. Máximo de 24 cores.", "Aplicar também guarda as cores. Cancelar descarta estas alterações."],
  it: ["Modalità colore", "Adattato (predefinito)", "Accento Omarchy", "Usa per", "Solo {theme}", "Tutti i temi", "Adattato: rosa in Tokyo Night; il colore del tema negli altri.", "Colori salvati", "Rosa ScratchPeek", "Salva colore", "Modifica colore", "Nome del colore", "Aggiorna", "Elimina colore", "Usa un nome univoco. Massimo 24 colori.", "Applica salva anche i colori. Annulla scarta queste modifiche."],
  nl: ["Kleurmodus", "Aangepast (standaard)", "Omarchy-accent", "Gebruiken voor", "Alleen {theme}", "Alle thema’s", "Aangepast: roze in Tokyo Night; elders de accentkleur van het thema.", "Opgeslagen kleuren", "ScratchPeek-roze", "Kleur opslaan", "Kleur bewerken", "Kleurnaam", "Bijwerken", "Kleur verwijderen", "Gebruik een unieke naam. Maximaal 24 kleuren.", "Toepassen slaat ook kleuren op. Annuleren verwerpt deze wijzigingen."],
  sv: ["Färgläge", "Anpassat (standard)", "Omarchy-accent", "Använd för", "Endast {theme}", "Alla teman", "Anpassat: rosa i Tokyo Night; annars temats accentfärg.", "Sparade färger", "ScratchPeek-rosa", "Spara färg", "Redigera färg", "Färgnamn", "Uppdatera", "Ta bort färg", "Använd ett unikt namn. Högst 24 färger.", "Verkställ sparar även färger. Avbryt förkastar dessa ändringar."],
  da: ["Farvetilstand", "Tilpasset (standard)", "Omarchy-accent", "Brug til", "Kun {theme}", "Alle temaer", "Tilpasset: lyserød i Tokyo Night; ellers temaets accentfarve.", "Gemte farver", "ScratchPeek-lyserød", "Gem farve", "Rediger farve", "Farvenavn", "Opdater", "Slet farve", "Brug et entydigt navn. Højst 24 farver.", "Anvend gemmer også farver. Annuller kasserer disse ændringer."],
  nb: ["Fargemodus", "Tilpasset (standard)", "Omarchy-aksent", "Bruk for", "Bare {theme}", "Alle temaer", "Tilpasset: rosa i Tokyo Night; ellers temaets aksentfarge.", "Lagrede farger", "ScratchPeek-rosa", "Lagre farge", "Rediger farge", "Fargenavn", "Oppdater", "Slett farge", "Bruk et unikt navn. Høyst 24 farger.", "Bruk lagrer også farger. Avbryt forkaster disse endringene."],
  fi: ["Väritila", "Mukautettu (oletus)", "Omarchyn korostusväri", "Käytä", "Vain {theme}", "Kaikki teemat", "Mukautettu: vaaleanpunainen Tokyo Nightissa, muualla teeman korostusväri.", "Tallennetut värit", "ScratchPeek-vaaleanpunainen", "Tallenna väri", "Muokkaa väriä", "Värin nimi", "Päivitä", "Poista väri", "Käytä yksilöllistä nimeä. Enintään 24 väriä.", "Käytä tallentaa myös värit. Peruuta hylkää nämä muutokset."],
  cs: ["Režim barvy", "Přizpůsobený (výchozí)", "Akcent Omarchy", "Použít pro", "Pouze {theme}", "Všechny motivy", "Přizpůsobený: růžová v Tokyo Night, jinde akcent motivu.", "Uložené barvy", "Růžová ScratchPeek", "Uložit barvu", "Upravit barvu", "Název barvy", "Aktualizovat", "Smazat barvu", "Použijte jedinečný název. Nejvýše 24 barev.", "Použít uloží také barvy. Zrušit zahodí tyto změny."],
  sk: ["Režim farby", "Prispôsobený (predvolený)", "Akcent Omarchy", "Použiť pre", "Iba {theme}", "Všetky motívy", "Prispôsobený: ružová v Tokyo Night, inde akcent motívu.", "Uložené farby", "Ružová ScratchPeek", "Uložiť farbu", "Upraviť farbu", "Názov farby", "Aktualizovať", "Odstrániť farbu", "Použite jedinečný názov. Najviac 24 farieb.", "Použiť uloží aj farby. Zrušiť zahodí tieto zmeny."],
  uk: ["Режим кольору", "Адаптований (типовий)", "Акцент Omarchy", "Використовувати для", "Лише {theme}", "Усі теми", "Адаптований: рожевий у Tokyo Night, в інших темах — їхній акцент.", "Збережені кольори", "Рожевий ScratchPeek", "Зберегти колір", "Редагувати", "Назва кольору", "Оновити", "Видалити колір", "Використайте унікальну назву. Максимум 24 кольори.", "Застосувати також зберігає кольори. Скасувати відкидає ці зміни."],
  ru: ["Режим цвета", "Адаптированный (по умолчанию)", "Акцент Omarchy", "Использовать для", "Только {theme}", "Все темы", "Адаптированный: розовый в Tokyo Night, в остальных темах — их акцент.", "Сохранённые цвета", "Розовый ScratchPeek", "Сохранить цвет", "Редактировать", "Название цвета", "Обновить", "Удалить цвет", "Используйте уникальное название. Максимум 24 цвета.", "Применить также сохраняет цвета. Отмена отменяет эти изменения."],
  tr: ["Renk modu", "Uyarlanmış (varsayılan)", "Omarchy vurgu rengi", "Kullanım kapsamı", "Yalnızca {theme}", "Tüm temalar", "Uyarlanmış: Tokyo Night’ta pembe, diğerlerinde temanın vurgu rengi.", "Kayıtlı renkler", "ScratchPeek pembesi", "Rengi kaydet", "Rengi düzenle", "Renk adı", "Güncelle", "Rengi sil", "Benzersiz bir ad kullanın. En fazla 24 renk.", "Uygula renkleri de kaydeder. İptal bu düzenlemeleri geri alır."],
  ro: ["Mod de culoare", "Adaptat (implicit)", "Accent Omarchy", "Folosește pentru", "Doar {theme}", "Toate temele", "Adaptat: roz în Tokyo Night, accentul temei în celelalte.", "Culori salvate", "Roz ScratchPeek", "Salvează culoarea", "Editează culoarea", "Numele culorii", "Actualizează", "Șterge culoarea", "Folosește un nume unic. Maximum 24 de culori.", "Aplică salvează și culorile. Anulează renunță la aceste modificări."],
  hu: ["Színmód", "Igazított (alapértelmezett)", "Omarchy kiemelőszíne", "Használat", "Csak {theme}", "Minden téma", "Igazított: rózsaszín a Tokyo Nightban, máshol a téma kiemelőszíne.", "Mentett színek", "ScratchPeek rózsaszín", "Szín mentése", "Szín szerkesztése", "Szín neve", "Frissítés", "Szín törlése", "Használj egyedi nevet. Legfeljebb 24 szín.", "Az Alkalmaz a színeket is menti. A Mégse elveti ezeket a módosításokat."],
  el: ["Λειτουργία χρώματος", "Προσαρμοσμένο (προεπιλογή)", "Έμφαση Omarchy", "Χρήση για", "Μόνο {theme}", "Όλα τα θέματα", "Προσαρμοσμένο: ροζ στο Tokyo Night, χρώμα έμφασης στα υπόλοιπα.", "Αποθηκευμένα χρώματα", "Ροζ ScratchPeek", "Αποθήκευση", "Επεξεργασία", "Όνομα χρώματος", "Ενημέρωση", "Διαγραφή", "Χρησιμοποιήστε μοναδικό όνομα. Έως 24 χρώματα.", "Η Εφαρμογή αποθηκεύει και τα χρώματα. Η Ακύρωση απορρίπτει αυτές τις αλλαγές."],
  ar: ["وضع اللون", "متكيف (افتراضي)", "لون تمييز Omarchy", "الاستخدام في", "⁦{theme}⁩ فقط", "كل السمات", "متكيف: وردي في Tokyo Night، ولون تمييز السمة في غيرها.", "الألوان المحفوظة", "وردي ScratchPeek", "حفظ اللون", "تعديل اللون", "اسم اللون", "تحديث", "حذف اللون", "استخدم اسمًا فريدًا. الحد الأقصى 24 لونًا.", "تطبيق يحفظ الألوان أيضًا. إلغاء يتجاهل هذه التعديلات."],
  hi: ["रंग मोड", "अनुकूलित (डिफ़ॉल्ट)", "Omarchy का एक्सेंट", "किस पर लागू करें", "केवल {theme}", "सभी थीम", "अनुकूलित: Tokyo Night में गुलाबी, बाकी में थीम का एक्सेंट रंग।", "सहेजे गए रंग", "ScratchPeek गुलाबी", "रंग सहेजें", "रंग संपादित करें", "रंग का नाम", "अपडेट करें", "रंग हटाएँ", "अलग नाम चुनें। अधिकतम 24 रंग।", "लागू करें रंग भी सहेजता है। रद्द करें ये बदलाव हटा देता है।"],
  id: ["Mode warna", "Disesuaikan (bawaan)", "Aksen Omarchy", "Gunakan untuk", "Hanya {theme}", "Semua tema", "Disesuaikan: merah muda di Tokyo Night; aksen tema di tema lainnya.", "Warna tersimpan", "Merah muda ScratchPeek", "Simpan warna", "Edit warna", "Nama warna", "Perbarui", "Hapus warna", "Gunakan nama unik. Maksimal 24 warna.", "Terapkan juga menyimpan warna. Batal membuang perubahan ini."],
  vi: ["Chế độ màu", "Thích ứng (mặc định)", "Màu nhấn Omarchy", "Áp dụng cho", "Chỉ {theme}", "Mọi chủ đề", "Thích ứng: hồng trong Tokyo Night, màu nhấn của các chủ đề khác.", "Màu đã lưu", "Hồng ScratchPeek", "Lưu màu", "Sửa màu", "Tên màu", "Cập nhật", "Xóa màu", "Dùng tên riêng biệt. Tối đa 24 màu.", "Áp dụng cũng lưu các màu. Hủy bỏ những chỉnh sửa này."],
  th: ["โหมดสี", "ปรับตามธีม (ค่าเริ่มต้น)", "สีเน้น Omarchy", "ใช้กับ", "เฉพาะ {theme}", "ทุกธีม", "ปรับตามธีม: สีชมพูใน Tokyo Night และสีเน้นของธีมอื่น ๆ", "สีที่บันทึก", "ชมพู ScratchPeek", "บันทึกสี", "แก้ไขสี", "ชื่อสี", "อัปเดต", "ลบสี", "ใช้ชื่อที่ไม่ซ้ำกัน บันทึกได้สูงสุด 24 สี", "ใช้จะบันทึกสีด้วย ยกเลิกจะละทิ้งการแก้ไขเหล่านี้"],
  ja: ["カラーモード", "自動調整（標準）", "Omarchyのアクセント", "適用先", "{theme} のみ", "すべてのテーマ", "自動調整：Tokyo Nightではピンク、その他ではテーマのアクセント色。", "保存した色", "ScratchPeekピンク", "色を保存", "色を編集", "色の名前", "更新", "色を削除", "重複しない名前を使ってください。最大24色。", "適用で色の編集も保存します。キャンセルでこれらの編集を破棄します。"],
  ko: ["색상 모드", "자동 조정 (기본값)", "Omarchy 강조색", "적용 대상", "{theme}만", "모든 테마", "자동 조정: Tokyo Night에서는 분홍색, 다른 테마에서는 해당 강조색.", "저장된 색상", "ScratchPeek 분홍색", "색상 저장", "색상 편집", "색상 이름", "업데이트", "색상 삭제", "고유한 이름을 사용하세요. 최대 24개 색상.", "적용하면 색상 편집도 저장됩니다. 취소하면 이 편집 내용을 버립니다."],
  "zh-CN": ["颜色模式", "自动适配（默认）", "Omarchy 强调色", "应用范围", "仅 {theme}", "所有主题", "自动适配：Tokyo Night 使用粉色，其他主题使用其强调色。", "已保存的颜色", "ScratchPeek 粉色", "保存颜色", "编辑颜色", "颜色名称", "更新", "删除颜色", "请使用唯一名称。最多保存 24 种颜色。", "应用也会保存颜色编辑。取消会放弃这些修改。"],
  "zh-TW": ["色彩模式", "自動調整（預設）", "Omarchy 強調色", "套用範圍", "僅 {theme}", "所有主題", "自動調整：Tokyo Night 使用粉紅色，其他主題使用其強調色。", "已儲存的色彩", "ScratchPeek 粉紅色", "儲存色彩", "編輯色彩", "色彩名稱", "更新", "刪除色彩", "請使用唯一名稱。最多儲存 24 種色彩。", "套用也會儲存色彩編輯。取消會放棄這些修改。"]
};
Object.keys(colorCatalogs).forEach(function(code) {
  colorKeys.forEach(function(key, index) { catalogs[code][key] = colorCatalogs[code][index]; });
});

// Window transfers and destination selection.
var transferKeys = ["addWindow", "extractWindow", "destinationWorkspace", "currentWorkspace", "workspaceLabel", "moveWindow", "movingWindow", "moveHint", "transferError"];
var transferCatalogs = {
  en: ["Add window to scratchpad…", "Take out of scratchpad…", "Destination workspace", "Current", "Workspace {workspace}", "Move", "Moving…", "Moves only this window, without switching workspaces.", "Could not move this window. It may have closed, moved or remained grouped. Try again."],
  pl: ["Dodaj okno do scratchpada…", "Wyciągnij ze scratchpada…", "Docelowy workspace", "Bieżący", "Workspace {workspace}", "Przenieś", "Przenoszenie…", "Przenosi tylko to okno, bez przełączania workspace’u.", "Nie udało się przenieść okna. Mogło zostać zamknięte, przeniesione lub pozostać w grupie. Spróbuj ponownie."],
  de: ["Fenster zum Scratchpad hinzufügen…", "Aus Scratchpad holen…", "Zielarbeitsfläche", "Aktuell", "Arbeitsfläche {workspace}", "Verschieben", "Verschieben…", "Verschiebt nur dieses Fenster, ohne die Arbeitsfläche zu wechseln.", "Fenster konnte nicht verschoben werden. Es wurde möglicherweise geschlossen, verschoben oder blieb gruppiert. Erneut versuchen."],
  fr: ["Ajouter une fenêtre au scratchpad…", "Sortir du scratchpad…", "Espace de travail cible", "Actuel", "Espace {workspace}", "Déplacer", "Déplacement…", "Déplace uniquement cette fenêtre, sans changer d’espace de travail.", "Impossible de déplacer la fenêtre. Elle a peut-être été fermée, déplacée ou est restée groupée. Réessayez."],
  es: ["Añadir ventana al scratchpad…", "Sacar del scratchpad…", "Espacio de destino", "Actual", "Espacio {workspace}", "Mover", "Moviendo…", "Mueve solo esta ventana, sin cambiar de espacio de trabajo.", "No se pudo mover la ventana. Puede haberse cerrado, movido o seguir agrupada. Inténtalo de nuevo."],
  "pt-BR": ["Adicionar janela ao scratchpad…", "Retirar do scratchpad…", "Área de trabalho de destino", "Atual", "Área {workspace}", "Mover", "Movendo…", "Move apenas esta janela, sem trocar de área de trabalho.", "Não foi possível mover a janela. Ela pode ter sido fechada, movida ou permanecido agrupada. Tente novamente."],
  "pt-PT": ["Adicionar janela ao scratchpad…", "Retirar do scratchpad…", "Área de trabalho de destino", "Atual", "Área {workspace}", "Mover", "A mover…", "Move apenas esta janela, sem mudar de área de trabalho.", "Não foi possível mover a janela. Pode ter sido fechada, movida ou permanecido agrupada. Tente novamente."],
  it: ["Aggiungi finestra allo scratchpad…", "Estrai dallo scratchpad…", "Spazio di lavoro di destinazione", "Attuale", "Spazio {workspace}", "Sposta", "Spostamento…", "Sposta solo questa finestra, senza cambiare spazio di lavoro.", "Impossibile spostare la finestra. Potrebbe essere chiusa, spostata o ancora raggruppata. Riprova."],
  nl: ["Venster aan scratchpad toevoegen…", "Uit scratchpad halen…", "Doelwerkruimte", "Huidig", "Werkruimte {workspace}", "Verplaatsen", "Verplaatsen…", "Verplaatst alleen dit venster, zonder van werkruimte te wisselen.", "Venster kon niet worden verplaatst. Het is mogelijk gesloten, verplaatst of nog gegroepeerd. Probeer opnieuw."],
  sv: ["Lägg till fönster i scratchpad…", "Ta ut ur scratchpad…", "Målarbetsyta", "Aktuell", "Arbetsyta {workspace}", "Flytta", "Flyttar…", "Flyttar bara detta fönster utan att byta arbetsyta.", "Kunde inte flytta fönstret. Det kan ha stängts, flyttats eller förblivit grupperat. Försök igen."],
  da: ["Tilføj vindue til scratchpad…", "Tag ud af scratchpad…", "Målarbejdsområde", "Aktuelt", "Arbejdsområde {workspace}", "Flyt", "Flytter…", "Flytter kun dette vindue uden at skifte arbejdsområde.", "Vinduet kunne ikke flyttes. Det kan være lukket, flyttet eller stadig grupperet. Prøv igen."],
  nb: ["Legg til vindu i scratchpad…", "Ta ut av scratchpad…", "Målarbeidsområde", "Gjeldende", "Arbeidsområde {workspace}", "Flytt", "Flytter…", "Flytter bare dette vinduet uten å bytte arbeidsområde.", "Kunne ikke flytte vinduet. Det kan være lukket, flyttet eller fortsatt gruppert. Prøv igjen."],
  fi: ["Lisää ikkuna scratchpadiin…", "Poista scratchpadista…", "Kohdetyötila", "Nykyinen", "Työtila {workspace}", "Siirrä", "Siirretään…", "Siirtää vain tämän ikkunan vaihtamatta työtilaa.", "Ikkunaa ei voitu siirtää. Se on ehkä suljettu, siirretty tai yhä ryhmässä. Yritä uudelleen."],
  cs: ["Přidat okno do scratchpadu…", "Vyjmout ze scratchpadu…", "Cílová plocha", "Aktuální", "Plocha {workspace}", "Přesunout", "Přesouvání…", "Přesune pouze toto okno bez přepnutí plochy.", "Okno nelze přesunout. Mohlo být zavřeno, přesunuto nebo zůstalo ve skupině. Zkuste to znovu."],
  sk: ["Pridať okno do scratchpadu…", "Vybrať zo scratchpadu…", "Cieľová plocha", "Aktuálna", "Plocha {workspace}", "Presunúť", "Presúvanie…", "Presunie iba toto okno bez prepnutia plochy.", "Okno sa nepodarilo presunúť. Mohlo byť zatvorené, presunuté alebo zostalo v skupine. Skúste znova."],
  uk: ["Додати вікно до scratchpad…", "Витягти зі scratchpad…", "Цільовий робочий простір", "Поточний", "Простір {workspace}", "Перемістити", "Переміщення…", "Переміщує лише це вікно, не перемикаючи робочий простір.", "Не вдалося перемістити вікно. Його могли закрити, перемістити або воно залишилося в групі. Спробуйте ще раз."],
  ru: ["Добавить окно в scratchpad…", "Извлечь из scratchpad…", "Целевое рабочее пространство", "Текущее", "Пространство {workspace}", "Переместить", "Перемещение…", "Перемещает только это окно без переключения рабочего пространства.", "Не удалось переместить окно. Оно могло закрыться, переместиться или остаться в группе. Попробуйте ещё раз."],
  tr: ["Scratchpad’e pencere ekle…", "Scratchpad’den çıkar…", "Hedef çalışma alanı", "Geçerli", "Çalışma alanı {workspace}", "Taşı", "Taşınıyor…", "Çalışma alanını değiştirmeden yalnızca bu pencereyi taşır.", "Pencere taşınamadı. Kapanmış, taşınmış veya grupta kalmış olabilir. Tekrar deneyin."],
  ro: ["Adaugă fereastră în scratchpad…", "Scoate din scratchpad…", "Spațiu de lucru destinație", "Curent", "Spațiul {workspace}", "Mută", "Se mută…", "Mută doar această fereastră, fără a schimba spațiul de lucru.", "Fereastra nu a putut fi mutată. Poate fi închisă, mutată sau încă grupată. Încearcă din nou."],
  hu: ["Ablak hozzáadása a scratchpadhez…", "Kivétel a scratchpadből…", "Célmunkaterület", "Jelenlegi", "Munkaterület: {workspace}", "Áthelyezés", "Áthelyezés…", "Csak ezt az ablakot helyezi át, munkaterületváltás nélkül.", "Az ablak nem helyezhető át. Lehet, hogy bezárták, áthelyezték, vagy csoportban maradt. Próbáld újra."],
  el: ["Προσθήκη παραθύρου στο scratchpad…", "Εξαγωγή από το scratchpad…", "Χώρος εργασίας προορισμού", "Τρέχων", "Χώρος {workspace}", "Μετακίνηση", "Μετακίνηση…", "Μετακινεί μόνο αυτό το παράθυρο, χωρίς αλλαγή χώρου εργασίας.", "Αδυναμία μετακίνησης. Το παράθυρο ίσως έκλεισε, μετακινήθηκε ή παρέμεινε σε ομάδα. Δοκιμάστε ξανά."],
  ar: ["إضافة نافذة إلى scratchpad…", "إخراج من scratchpad…", "مساحة العمل الوجهة", "الحالية", "مساحة العمل ⁦{workspace}⁩", "نقل", "جارٍ النقل…", "ينقل هذه النافذة فقط دون تبديل مساحة العمل.", "تعذر نقل النافذة. ربما أُغلقت أو نُقلت أو بقيت ضمن مجموعة. حاول مجددًا."],
  hi: ["Scratchpad में विंडो जोड़ें…", "Scratchpad से निकालें…", "लक्ष्य कार्यक्षेत्र", "वर्तमान", "कार्यक्षेत्र {workspace}", "ले जाएँ", "ले जा रहे हैं…", "कार्यक्षेत्र बदले बिना केवल इस विंडो को ले जाता है।", "विंडो को नहीं ले जा सके। वह बंद हो गई, स्थानांतरित हो गई या समूह में रह गई होगी। फिर प्रयास करें।"],
  id: ["Tambah jendela ke scratchpad…", "Keluarkan dari scratchpad…", "Ruang kerja tujuan", "Saat ini", "Ruang kerja {workspace}", "Pindahkan", "Memindahkan…", "Memindahkan hanya jendela ini tanpa beralih ruang kerja.", "Jendela tidak dapat dipindahkan. Mungkin sudah ditutup, dipindahkan, atau masih dalam grup. Coba lagi."],
  vi: ["Thêm cửa sổ vào scratchpad…", "Lấy ra khỏi scratchpad…", "Không gian làm việc đích", "Hiện tại", "Không gian {workspace}", "Di chuyển", "Đang chuyển…", "Chỉ di chuyển cửa sổ này, không đổi không gian làm việc.", "Không thể di chuyển cửa sổ. Có thể cửa sổ đã đóng, đã chuyển hoặc vẫn ở trong nhóm. Hãy thử lại."],
  th: ["เพิ่มหน้าต่างไปยัง scratchpad…", "นำออกจาก scratchpad…", "พื้นที่ทำงานปลายทาง", "ปัจจุบัน", "พื้นที่ทำงาน {workspace}", "ย้าย", "กำลังย้าย…", "ย้ายเฉพาะหน้าต่างนี้โดยไม่สลับพื้นที่ทำงาน", "ย้ายหน้าต่างไม่ได้ อาจถูกปิด ย้ายไปแล้ว หรือยังอยู่ในกลุ่ม โปรดลองอีกครั้ง"],
  ja: ["Scratchpadにウィンドウを追加…", "Scratchpadから取り出す…", "移動先のワークスペース", "現在", "ワークスペース {workspace}", "移動", "移動中…", "ワークスペースを切り替えず、このウィンドウだけを移動します。", "移動できませんでした。ウィンドウが閉じた、移動済み、またはグループ内のままの可能性があります。再試行してください。"],
  ko: ["Scratchpad에 창 추가…", "Scratchpad에서 꺼내기…", "대상 작업 공간", "현재", "작업 공간 {workspace}", "이동", "이동 중…", "작업 공간을 전환하지 않고 이 창만 이동합니다.", "창을 이동할 수 없습니다. 닫혔거나, 이미 이동했거나, 그룹에 남아 있을 수 있습니다. 다시 시도하세요."],
  "zh-CN": ["添加窗口到 Scratchpad…", "从 Scratchpad 移出…", "目标工作区", "当前", "工作区 {workspace}", "移动", "正在移动…", "仅移动此窗口，不切换工作区。", "无法移动窗口。它可能已关闭、已移动或仍在分组中。请重试。"],
  "zh-TW": ["新增視窗至 Scratchpad…", "從 Scratchpad 移出…", "目標工作區", "目前", "工作區 {workspace}", "移動", "正在移動…", "僅移動此視窗，不切換工作區。", "無法移動視窗。它可能已關閉、已移動或仍在群組中。請重試。"]
};
Object.keys(transferCatalogs).forEach(function(code) {
  transferKeys.forEach(function(key,index) { catalogs[code][key] = transferCatalogs[code][index]; });
});

var transferUiKeys = ["extractAction", "searchWindows", "searchWorkspaces"];
var transferUiCatalogs = {
  en: ["Move out", "Search windows…", "Search workspaces…"],
  pl: ["Wyciągnij", "Szukaj okien…", "Szukaj workspace’u…"],
  de: ["Herausholen", "Fenster suchen…", "Arbeitsflächen suchen…"],
  fr: ["Sortir", "Rechercher une fenêtre…", "Rechercher un espace…"],
  es: ["Sacar", "Buscar ventanas…", "Buscar espacios…"],
  "pt-BR": ["Retirar", "Pesquisar janelas…", "Pesquisar áreas de trabalho…"],
  "pt-PT": ["Retirar", "Pesquisar janelas…", "Pesquisar áreas de trabalho…"],
  it: ["Estrai", "Cerca finestre…", "Cerca spazi di lavoro…"],
  nl: ["Eruithalen", "Vensters zoeken…", "Werkruimten zoeken…"],
  sv: ["Ta ut", "Sök fönster…", "Sök arbetsytor…"],
  da: ["Tag ud", "Søg efter vinduer…", "Søg efter arbejdsområder…"],
  nb: ["Ta ut", "Søk etter vinduer…", "Søk etter arbeidsområder…"],
  fi: ["Siirrä pois", "Etsi ikkunoita…", "Etsi työtiloja…"],
  cs: ["Vyjmout", "Hledat okna…", "Hledat plochy…"],
  sk: ["Vybrať", "Hľadať okná…", "Hľadať plochy…"],
  uk: ["Витягти", "Пошук вікон…", "Пошук робочих просторів…"],
  ru: ["Извлечь", "Поиск окон…", "Поиск рабочих пространств…"],
  tr: ["Çıkar", "Pencere ara…", "Çalışma alanı ara…"],
  ro: ["Scoate", "Caută ferestre…", "Caută spații de lucru…"],
  hu: ["Kivétel", "Ablakok keresése…", "Munkaterületek keresése…"],
  el: ["Εξαγωγή", "Αναζήτηση παραθύρων…", "Αναζήτηση χώρων εργασίας…"],
  ar: ["إخراج", "البحث عن نوافذ…", "البحث عن مساحات العمل…"],
  hi: ["बाहर निकालें", "विंडो खोजें…", "कार्यक्षेत्र खोजें…"],
  id: ["Keluarkan", "Cari jendela…", "Cari ruang kerja…"],
  vi: ["Lấy ra", "Tìm cửa sổ…", "Tìm không gian làm việc…"],
  th: ["นำออก", "ค้นหาหน้าต่าง…", "ค้นหาพื้นที่ทำงาน…"],
  ja: ["取り出す", "ウィンドウを検索…", "ワークスペースを検索…"],
  ko: ["꺼내기", "창 검색…", "작업 공간 검색…"],
  "zh-CN": ["移出", "搜索窗口…", "搜索工作区…"],
  "zh-TW": ["移出", "搜尋視窗…", "搜尋工作區…"]
};
Object.keys(transferUiCatalogs).forEach(function(code) {
  transferUiKeys.forEach(function(key,index) { catalogs[code][key] = transferUiCatalogs[code][index]; });
});

var focusHintCatalogs = {
  "en": "Click to focus this window or tab",
  "pl": "Kliknij, aby przejść do tego okna lub zakładki",
  "de": "Klicken, um dieses Fenster oder diesen Tab zu fokussieren",
  "fr": "Cliquez pour activer cette fenêtre ou cet onglet",
  "es": "Haz clic para enfocar esta ventana o pestaña",
  "pt-BR": "Clique para focar esta janela ou aba",
  "pt-PT": "Clique para focar esta janela ou separador",
  "it": "Fai clic per attivare questa finestra o scheda",
  "nl": "Klik om dit venster of tabblad te activeren",
  "sv": "Klicka för att fokusera detta fönster eller denna flik",
  "da": "Klik for at fokusere dette vindue eller denne fane",
  "nb": "Klikk for å fokusere dette vinduet eller denne fanen",
  "fi": "Napsauta siirtyäksesi tähän ikkunaan tai välilehteen",
  "cs": "Kliknutím přejdete do tohoto okna nebo na tuto kartu",
  "sk": "Kliknutím prejdete do tohto okna alebo na túto kartu",
  "uk": "Натисніть, щоб перейти до цього вікна або вкладки",
  "ru": "Нажмите, чтобы перейти к этому окну или вкладке",
  "tr": "Bu pencereye veya sekmeye odaklanmak için tıklayın",
  "ro": "Clic pentru a activa această fereastră sau filă",
  "hu": "Kattints az ablak vagy lap aktiválásához",
  "el": "Κάντε κλικ για εστίαση σε αυτό το παράθυρο ή την καρτέλα",
  "ar": "انقر للتركيز على هذه النافذة أو علامة التبويب",
  "hi": "इस विंडो या टैब पर फ़ोकस करने के लिए क्लिक करें",
  "id": "Klik untuk memfokuskan jendela atau tab ini",
  "vi": "Nhấp để chuyển đến cửa sổ hoặc thẻ này",
  "th": "คลิกเพื่อโฟกัสหน้าต่างหรือแท็บนี้",
  "ja": "クリックしてこのウィンドウまたはタブにフォーカス",
  "ko": "클릭하여 이 창 또는 탭에 포커스",
  "zh-CN": "点击聚焦此窗口或标签页",
  "zh-TW": "點擊聚焦此視窗或分頁"
};
Object.keys(focusHintCatalogs).forEach(function(code) { catalogs[code].focusWindowHint = focusHintCatalogs[code]; });

// Visibility actions use one concise, monitor-specific sentence.
var visibilityHintKeys = ["hideScratchpadHint", "showScratchpadHint"];
var visibilityHintCatalogs = {
  en: ["Temporarily hide the scratchpad on this monitor.", "Show the scratchpad on this monitor."],
  pl: ["Tymczasowo schowaj scratchpad na tym monitorze.", "Pokaż scratchpad na tym monitorze."],
  de: ["Scratchpad auf diesem Monitor vorübergehend ausblenden.", "Zeige das Scratchpad auf diesem Monitor."],
  fr: ["Masquer temporairement le scratchpad sur cet écran.", "Afficher le scratchpad sur cet écran."],
  es: ["Ocultar temporalmente el scratchpad en este monitor.", "Mostrar el scratchpad en este monitor."],
  "pt-BR": ["Ocultar temporariamente o scratchpad neste monitor.", "Mostrar o scratchpad neste monitor."],
  "pt-PT": ["Ocultar temporariamente o scratchpad neste monitor.", "Mostrar o scratchpad neste monitor."],
  it: ["Nascondi temporaneamente lo scratchpad su questo monitor.", "Mostra lo scratchpad su questo monitor."],
  nl: ["Verberg het scratchpad tijdelijk op deze monitor.", "Toon het scratchpad op deze monitor."],
  sv: ["Dölj scratchpad tillfälligt på denna skärm.", "Visa scratchpad på denna skärm."],
  da: ["Skjul scratchpad midlertidigt på denne skærm.", "Vis scratchpad på denne skærm."],
  nb: ["Skjul scratchpad midlertidig på denne skjermen.", "Vis scratchpad på denne skjermen."],
  fi: ["Piilota scratchpad väliaikaisesti tällä näytöllä.", "Näytä scratchpad tällä näytöllä."],
  cs: ["Dočasně skrýt scratchpad na tomto monitoru.", "Zobrazit scratchpad na tomto monitoru."],
  sk: ["Dočasne skryť scratchpad na tomto monitore.", "Zobraziť scratchpad na tomto monitore."],
  uk: ["Тимчасово приховати scratchpad на цьому моніторі.", "Показати scratchpad на цьому моніторі."],
  ru: ["Временно скрыть scratchpad на этом мониторе.", "Показать scratchpad на этом мониторе."],
  tr: ["Scratchpad’i bu monitörde geçici olarak gizle.", "Scratchpad’i bu monitörde göster."],
  ro: ["Ascunde temporar scratchpad pe acest monitor.", "Arată scratchpad pe acest monitor."],
  hu: ["Scratchpad ideiglenes elrejtése ezen a monitoron.", "Scratchpad megjelenítése ezen a monitoron."],
  el: ["Προσωρινή απόκρυψη του scratchpad σε αυτή την οθόνη.", "Εμφάνιση του scratchpad σε αυτή την οθόνη."],
  ar: ["إخفاء scratchpad مؤقتًا على هذه الشاشة.", "إظهار scratchpad على هذه الشاشة."],
  hi: ["इस मॉनिटर पर scratchpad अस्थायी रूप से छिपाएँ।", "इस मॉनिटर पर scratchpad दिखाएँ।"],
  id: ["Sembunyikan scratchpad sementara di monitor ini.", "Tampilkan scratchpad di monitor ini."],
  vi: ["Tạm ẩn scratchpad trên màn hình này.", "Hiện scratchpad trên màn hình này."],
  th: ["ซ่อน scratchpad บนจอภาพนี้ชั่วคราว", "แสดง scratchpad บนจอภาพนี้"],
  ja: ["このモニターのScratchpadを一時的に非表示にします。", "このモニターにScratchpadを表示します。"],
  ko: ["이 모니터에서 Scratchpad를 일시적으로 숨깁니다.", "이 모니터에 Scratchpad를 표시합니다."],
  "zh-CN": ["在此显示器上暂时隐藏 Scratchpad。", "在此显示器上显示 Scratchpad。"],
  "zh-TW": ["在此螢幕上暫時隱藏 Scratchpad。", "在此螢幕上顯示 Scratchpad。"]
};
Object.keys(visibilityHintCatalogs).forEach(function(code) {
  visibilityHintKeys.forEach(function(key,index) { catalogs[code][key] = visibilityHintCatalogs[code][index]; });
});

var panelHelpKeys = ["panelHints", "hintsAutomatic", "hintsOn", "hintsOff", "quickExtractHint", "hintsAutomaticOne"];
var panelHelpCatalogs = {
  en: ["Panel hints", "Hints will automatically hide after {remaining} more hovers.\nClick to turn them off now.\nYou can always turn them on again", "Show panel hints on hover\nClick to turn off", "Show panel hints on hover\nClick to turn on", "Ctrl + click: to this workspace", "Hints will automatically hide after {remaining} more hover.\nClick to turn them off now.\nYou can always turn them on again"],
  pl: ["Podpowiedzi w panelu", "Podpowiedzi ukryją się automatycznie po kolejnych {remaining} wyświetleniach.\nKliknij, aby wyłączyć je teraz.\nZawsze możesz włączyć je ponownie", "Pokazuj podpowiedzi w panelu po najechaniu\nKliknij, aby wyłączyć", "Pokazuj podpowiedzi w panelu po najechaniu\nKliknij, aby włączyć", "Ctrl + klik: na ten obszar roboczy", "Podpowiedzi ukryją się automatycznie po jeszcze {remaining} wyświetleniu.\nKliknij, aby wyłączyć je teraz.\nZawsze możesz włączyć je ponownie"],
  de: ["Hinweise im Panel", "Hinweise werden nach weiteren {remaining} Anzeigen automatisch ausgeblendet.\nKlicken, um sie jetzt auszuschalten.\nDu kannst sie jederzeit wieder einschalten", "Panel-Hinweise beim Darüberfahren anzeigen\nZum Ausschalten klicken", "Panel-Hinweise beim Darüberfahren anzeigen\nZum Einschalten klicken", "Strg + Klick: auf diesen Arbeitsbereich", "Hinweise werden nach {remaining} weiteren Anzeige automatisch ausgeblendet.\nKlicken, um sie jetzt auszuschalten.\nDu kannst sie jederzeit wieder einschalten"],
  fr: ["Aide du panneau", "Les aides seront masquées automatiquement après {remaining} affichages.\nCliquez pour les désactiver maintenant.\nVous pouvez toujours les réactiver", "Afficher l’aide du panneau au survol\nCliquez pour désactiver", "Afficher l’aide du panneau au survol\nCliquez pour activer", "Ctrl + clic : vers cet espace de travail", "Les aides seront masquées automatiquement après {remaining} affichage.\nCliquez pour les désactiver maintenant.\nVous pouvez toujours les réactiver"],
  es: ["Ayuda del panel", "Las ayudas se ocultarán automáticamente tras {remaining} apariciones más.\nHaz clic para desactivarlas ahora.\nSiempre puedes volver a activarlas", "Mostrar ayuda del panel al pasar el cursor\nHaz clic para desactivar", "Mostrar ayuda del panel al pasar el cursor\nHaz clic para activar", "Ctrl + clic: a este espacio de trabajo", "Las ayudas se ocultarán automáticamente tras {remaining} aparición más.\nHaz clic para desactivarlas ahora.\nSiempre puedes volver a activarlas"],
  "pt-BR": ["Dicas do painel", "As dicas serão ocultadas automaticamente após mais {remaining} exibições.\nClique para desativá-las agora.\nVocê sempre pode ativá-las novamente", "Mostrar dicas do painel ao passar o cursor\nClique para desativar", "Mostrar dicas do painel ao passar o cursor\nClique para ativar", "Ctrl + clique: para esta área de trabalho", "As dicas serão ocultadas automaticamente após mais {remaining} exibição.\nClique para desativá-las agora.\nVocê sempre pode ativá-las novamente"],
  "pt-PT": ["Dicas do painel", "As dicas serão ocultadas automaticamente após mais {remaining} exibições.\nClique para as desativar agora.\nPode sempre voltar a ativá-las", "Mostrar dicas do painel ao passar o cursor\nClique para desativar", "Mostrar dicas do painel ao passar o cursor\nClique para ativar", "Ctrl + clique: para esta área de trabalho", "As dicas serão ocultadas automaticamente após mais {remaining} exibição.\nClique para as desativar agora.\nPode sempre voltar a ativá-las"],
  it: ["Suggerimenti del pannello", "I suggerimenti si nasconderanno automaticamente dopo altre {remaining} visualizzazioni.\nFai clic per disattivarli ora.\nPuoi sempre riattivarli", "Mostra suggerimenti al passaggio del cursore\nFai clic per disattivare", "Mostra suggerimenti al passaggio del cursore\nFai clic per attivare", "Ctrl + clic: in questo spazio di lavoro", "I suggerimenti si nasconderanno automaticamente dopo un’altra {remaining} visualizzazione.\nFai clic per disattivarli ora.\nPuoi sempre riattivarli"],
  nl: ["Paneeltips", "Tips worden na nog {remaining} weergaven automatisch verborgen.\nKlik om ze nu uit te schakelen.\nJe kunt ze altijd weer inschakelen", "Paneeltips tonen bij aanwijzen\nKlik om uit te schakelen", "Paneeltips tonen bij aanwijzen\nKlik om in te schakelen", "Ctrl + klik: naar deze werkruimte", "Tips worden na nog {remaining} weergave automatisch verborgen.\nKlik om ze nu uit te schakelen.\nJe kunt ze altijd weer inschakelen"],
  sv: ["Paneltips", "Tips döljs automatiskt efter ytterligare {remaining} visningar.\nKlicka för att stänga av dem nu.\nDu kan alltid slå på dem igen", "Visa paneltips när pekaren hålls över\nKlicka för att stänga av", "Visa paneltips när pekaren hålls över\nKlicka för att slå på", "Ctrl + klick: till denna arbetsyta", "Tips döljs automatiskt efter ytterligare {remaining} visning.\nKlicka för att stänga av dem nu.\nDu kan alltid slå på dem igen"],
  da: ["Paneltip", "Tip skjules automatisk efter yderligere {remaining} visninger.\nKlik for at slå dem fra nu.\nDu kan altid slå dem til igen", "Vis paneltip, når markøren holdes over\nKlik for at slå fra", "Vis paneltip, når markøren holdes over\nKlik for at slå til", "Ctrl + klik: til dette arbejdsområde", "Tip skjules automatisk efter yderligere {remaining} visning.\nKlik for at slå dem fra nu.\nDu kan altid slå dem til igen"],
  nb: ["Paneltips", "Tips skjules automatisk etter ytterligere {remaining} visninger.\nKlikk for å slå dem av nå.\nDu kan alltid slå dem på igjen", "Vis paneltips når pekeren holdes over\nKlikk for å slå av", "Vis paneltips når pekeren holdes over\nKlikk for å slå på", "Ctrl + klikk: til dette arbeidsområdet", "Tips skjules automatisk etter ytterligere {remaining} visning.\nKlikk for å slå dem av nå.\nDu kan alltid slå dem på igjen"],
  fi: ["Paneelin vihjeet", "Vihjeet piilotetaan automaattisesti vielä {remaining} näyttökerran jälkeen.\nPoista ne käytöstä nyt napsauttamalla.\nVoit aina ottaa ne uudelleen käyttöön", "Näytä paneelin vihjeet osoitettaessa\nPoista käytöstä napsauttamalla", "Näytä paneelin vihjeet osoitettaessa\nOta käyttöön napsauttamalla", "Ctrl + napsautus: tähän työtilaan", "Vihjeet piilotetaan automaattisesti vielä {remaining} näyttökerran jälkeen.\nPoista ne käytöstä nyt napsauttamalla.\nVoit aina ottaa ne uudelleen käyttöön"],
  cs: ["Nápovědy panelu", "Zbývající zobrazení nápověd do automatického skrytí: {remaining}.\nKliknutím je vypnete hned.\nVždy je můžete znovu zapnout", "Zobrazovat nápovědy panelu při najetí\nKliknutím vypnete", "Zobrazovat nápovědy panelu při najetí\nKliknutím zapnete", "Ctrl + kliknutí: na tuto plochu", "Zbývající zobrazení nápověd do automatického skrytí: {remaining}.\nKliknutím je vypnete hned.\nVždy je můžete znovu zapnout"],
  sk: ["Tipy panela", "Zostávajúce zobrazenia tipov do automatického skrytia: {remaining}.\nKliknutím ich vypnete teraz.\nVždy ich môžete znova zapnúť", "Zobrazovať tipy panela pri ukázaní\nKliknutím vypnete", "Zobrazovať tipy panela pri ukázaní\nKliknutím zapnete", "Ctrl + kliknutie: na túto plochu", "Zostávajúce zobrazenia tipov do automatického skrytia: {remaining}.\nKliknutím ich vypnete teraz.\nVždy ich môžete znova zapnúť"],
  uk: ["Підказки панелі", "Показів підказок до автоматичного приховування: {remaining}.\nНатисніть, щоб вимкнути їх зараз.\nВи завжди можете ввімкнути їх знову", "Показувати підказки панелі при наведенні\nНатисніть, щоб вимкнути", "Показувати підказки панелі при наведенні\nНатисніть, щоб увімкнути", "Ctrl + клацання: у цей робочий простір", "Показів підказок до автоматичного приховування: {remaining}.\nНатисніть, щоб вимкнути їх зараз.\nВи завжди можете ввімкнути їх знову"],
  ru: ["Подсказки панели", "Показов подсказок до автоматического скрытия: {remaining}.\nНажмите, чтобы выключить их сейчас.\nВы всегда можете включить их снова", "Показывать подсказки панели при наведении\nНажмите, чтобы выключить", "Показывать подсказки панели при наведении\nНажмите, чтобы включить", "Ctrl + щелчок: в это рабочее пространство", "Показов подсказок до автоматического скрытия: {remaining}.\nНажмите, чтобы выключить их сейчас.\nВы всегда можете включить их снова"],
  tr: ["Panel ipuçları", "İpuçları {remaining} gösterim daha sonra otomatik olarak gizlenecek.\nŞimdi kapatmak için tıklayın.\nİstediğiniz zaman tekrar açabilirsiniz", "İmleç üzerindeyken panel ipuçlarını göster\nKapatmak için tıklayın", "İmleç üzerindeyken panel ipuçlarını göster\nAçmak için tıklayın", "Ctrl + tıklama: bu çalışma alanına", "İpuçları {remaining} gösterim daha sonra otomatik olarak gizlenecek.\nŞimdi kapatmak için tıklayın.\nİstediğiniz zaman tekrar açabilirsiniz"],
  ro: ["Indicații în panou", "Indicațiile se vor ascunde automat după încă {remaining} afișări.\nClic pentru a le dezactiva acum.\nLe poți reactiva oricând", "Arată indicații în panou la trecerea cursorului\nClic pentru dezactivare", "Arată indicații în panou la trecerea cursorului\nClic pentru activare", "Ctrl + clic: în acest spațiu de lucru", "Indicațiile se vor ascunde automat după încă {remaining} afișare.\nClic pentru a le dezactiva acum.\nLe poți reactiva oricând"],
  hu: ["Panelsúgók", "A súgók további {remaining} megjelenítés után automatikusan eltűnnek.\nKattints az azonnali kikapcsoláshoz.\nBármikor újra bekapcsolhatod őket", "Panelsúgók megjelenítése rámutatáskor\nKattints a kikapcsoláshoz", "Panelsúgók megjelenítése rámutatáskor\nKattints a bekapcsoláshoz", "Ctrl + kattintás: erre a munkaterületre", "A súgók további {remaining} megjelenítés után automatikusan eltűnnek.\nKattints az azonnali kikapcsoláshoz.\nBármikor újra bekapcsolhatod őket"],
  el: ["Συμβουλές πίνακα", "Οι συμβουλές θα αποκρυφτούν αυτόματα μετά από {remaining} ακόμη προβολές.\nΚλικ για απενεργοποίηση τώρα.\nΜπορείτε πάντα να τις ενεργοποιήσετε ξανά", "Εμφάνιση συμβουλών πίνακα κατά την κατάδειξη\nΚλικ για απενεργοποίηση", "Εμφάνιση συμβουλών πίνακα κατά την κατάδειξη\nΚλικ για ενεργοποίηση", "Ctrl + κλικ: σε αυτόν τον χώρο εργασίας", "Οι συμβουλές θα αποκρυφτούν αυτόματα μετά από {remaining} ακόμη προβολή.\nΚλικ για απενεργοποίηση τώρα.\nΜπορείτε πάντα να τις ενεργοποιήσετε ξανά"],
  ar: ["تلميحات اللوحة", "مرات ظهور التلميحات المتبقية قبل الإخفاء التلقائي: {remaining}.\nانقر لإيقافها الآن.\nيمكنك دائمًا تفعيلها مجددًا", "إظهار تلميحات اللوحة عند تمرير المؤشر\nانقر للإيقاف", "إظهار تلميحات اللوحة عند تمرير المؤشر\nانقر للتفعيل", "Ctrl + نقر: إلى مساحة العمل هذه", "مرات ظهور التلميحات المتبقية قبل الإخفاء التلقائي: {remaining}.\nانقر لإيقافها الآن.\nيمكنك دائمًا تفعيلها مجددًا"],
  hi: ["पैनल के सुझाव", "सुझाव {remaining} बार और दिखने के बाद अपने आप छिप जाएँगे।\nअभी बंद करने के लिए क्लिक करें।\nआप इन्हें कभी भी फिर चालू कर सकते हैं", "होवर करने पर पैनल के सुझाव दिखाएँ\nबंद करने के लिए क्लिक करें", "होवर करने पर पैनल के सुझाव दिखाएँ\nचालू करने के लिए क्लिक करें", "Ctrl + क्लिक: इस कार्यक्षेत्र में", "सुझाव {remaining} बार और दिखने के बाद अपने आप छिप जाएँगे।\nअभी बंद करने के लिए क्लिक करें।\nआप इन्हें कभी भी फिर चालू कर सकते हैं"],
  id: ["Petunjuk panel", "Petunjuk akan disembunyikan otomatis setelah {remaining} tampilan lagi.\nKlik untuk menonaktifkannya sekarang.\nAnda selalu dapat mengaktifkannya lagi", "Tampilkan petunjuk panel saat kursor diarahkan\nKlik untuk menonaktifkan", "Tampilkan petunjuk panel saat kursor diarahkan\nKlik untuk mengaktifkan", "Ctrl + klik: ke ruang kerja ini", "Petunjuk akan disembunyikan otomatis setelah {remaining} tampilan lagi.\nKlik untuk menonaktifkannya sekarang.\nAnda selalu dapat mengaktifkannya lagi"],
  vi: ["Gợi ý trong bảng", "Gợi ý sẽ tự ẩn sau {remaining} lần hiển thị nữa.\nNhấp để tắt ngay.\nBạn luôn có thể bật lại", "Hiện gợi ý trong bảng khi di chuột lên\nNhấp để tắt", "Hiện gợi ý trong bảng khi di chuột lên\nNhấp để bật", "Ctrl + nhấp: đến không gian làm việc này", "Gợi ý sẽ tự ẩn sau {remaining} lần hiển thị nữa.\nNhấp để tắt ngay.\nBạn luôn có thể bật lại"],
  th: ["คำแนะนำในแผง", "คำแนะนำจะซ่อนอัตโนมัติหลังจากแสดงอีก {remaining} ครั้ง\nคลิกเพื่อปิดตอนนี้\nคุณสามารถเปิดอีกครั้งได้เสมอ", "แสดงคำแนะนำในแผงเมื่อวางเมาส์เหนือ\nคลิกเพื่อปิด", "แสดงคำแนะนำในแผงเมื่อวางเมาส์เหนือ\nคลิกเพื่อเปิด", "Ctrl + คลิก: ไปยังพื้นที่ทำงานนี้", "คำแนะนำจะซ่อนอัตโนมัติหลังจากแสดงอีก {remaining} ครั้ง\nคลิกเพื่อปิดตอนนี้\nคุณสามารถเปิดอีกครั้งได้เสมอ"],
  ja: ["パネルのヒント", "ヒントはあと{remaining}回表示されると自動で非表示になります。\nクリックで今すぐ無効にします。\nいつでも再び有効にできます", "ホバー時にパネルのヒントを表示\nクリックで無効にする", "ホバー時にパネルのヒントを表示\nクリックで有効にする", "Ctrl + クリック：このワークスペースへ", "ヒントはあと{remaining}回表示されると自動で非表示になります。\nクリックで今すぐ無効にします。\nいつでも再び有効にできます"],
  ko: ["패널 도움말", "도움말이 {remaining}회 더 표시된 후 자동으로 숨겨집니다.\n클릭하여 지금 끄세요.\n언제든 다시 켤 수 있습니다", "마우스를 올리면 패널 도움말 표시\n클릭하여 끄기", "마우스를 올리면 패널 도움말 표시\n클릭하여 켜기", "Ctrl + 클릭: 이 작업 공간으로", "도움말이 {remaining}회 더 표시된 후 자동으로 숨겨집니다.\n클릭하여 지금 끄세요.\n언제든 다시 켤 수 있습니다"],
  "zh-CN": ["面板提示", "提示再显示 {remaining} 次后将自动隐藏。\n点击立即关闭。\n你随时可以重新开启", "悬停时显示面板提示\n点击关闭", "悬停时显示面板提示\n点击开启", "Ctrl + 点击：移到此工作区", "提示再显示 {remaining} 次后将自动隐藏。\n点击立即关闭。\n你随时可以重新开启"],
  "zh-TW": ["面板提示", "提示再顯示 {remaining} 次後將自動隱藏。\n點擊立即關閉。\n你隨時可以重新開啟", "懸停時顯示面板提示\n點擊關閉", "懸停時顯示面板提示\n點擊開啟", "Ctrl + 點擊：移到此工作區", "提示再顯示 {remaining} 次後將自動隱藏。\n點擊立即關閉。\n你隨時可以重新開啟"]
};
Object.keys(panelHelpCatalogs).forEach(function(code) {
  panelHelpKeys.forEach(function(key,index) { catalogs[code][key] = panelHelpCatalogs[code][index]; });
});

var shortcutHintCatalogs = {
  "en": "{shortcut} · show / hide scratchpad",
  "pl": "{shortcut} · pokaż / schowaj scratchpad",
  "de": "{shortcut} · Scratchpad ein- / ausblenden",
  "fr": "{shortcut} · afficher / masquer le scratchpad",
  "es": "{shortcut} · mostrar / ocultar scratchpad",
  "pt-BR": "{shortcut} · mostrar / ocultar scratchpad",
  "pt-PT": "{shortcut} · mostrar / ocultar scratchpad",
  "it": "{shortcut} · mostra / nascondi scratchpad",
  "nl": "{shortcut} · scratchpad tonen / verbergen",
  "sv": "{shortcut} · visa / dölj scratchpad",
  "da": "{shortcut} · vis / skjul scratchpad",
  "nb": "{shortcut} · vis / skjul scratchpad",
  "fi": "{shortcut} · näytä / piilota scratchpad",
  "cs": "{shortcut} · zobrazit / skrýt scratchpad",
  "sk": "{shortcut} · zobraziť / skryť scratchpad",
  "uk": "{shortcut} · показати / приховати scratchpad",
  "ru": "{shortcut} · показать / скрыть scratchpad",
  "tr": "{shortcut} · scratchpad göster / gizle",
  "ro": "{shortcut} · arată / ascunde scratchpad",
  "hu": "{shortcut} · scratchpad megjelenítése / elrejtése",
  "el": "{shortcut} · εμφάνιση / απόκρυψη scratchpad",
  "ar": "{shortcut} · إظهار / إخفاء scratchpad",
  "hi": "{shortcut} · scratchpad दिखाएँ / छिपाएँ",
  "id": "{shortcut} · tampilkan / sembunyikan scratchpad",
  "vi": "{shortcut} · hiện / ẩn scratchpad",
  "th": "{shortcut} · แสดง / ซ่อน scratchpad",
  "ja": "{shortcut} · Scratchpadを表示 / 非表示",
  "ko": "{shortcut} · Scratchpad 표시 / 숨기기",
  "zh-CN": "{shortcut} · 显示 / 隐藏 Scratchpad",
  "zh-TW": "{shortcut} · 顯示 / 隱藏 Scratchpad"
};
Object.keys(shortcutHintCatalogs).forEach(function(code) { catalogs[code].shortcutHint = shortcutHintCatalogs[code]; });

var quickAddKeys = ["quickAddHint", "noFocusedWindow"];
var quickAddCatalogs = {
  en: ["Ctrl + click: add the focused window", "No focused window outside the scratchpad."],
  pl: ["Ctrl + klik: dodaj aktywne okno", "Brak aktywnego okna poza scratchpadem."],
  de: ["Strg + Klick: fokussiertes Fenster hinzufügen", "Kein fokussiertes Fenster außerhalb des Scratchpads."],
  fr: ["Ctrl + clic : ajouter la fenêtre active", "Aucune fenêtre active hors du scratchpad."],
  es: ["Ctrl + clic: añadir la ventana enfocada", "No hay ninguna ventana enfocada fuera del scratchpad."],
  "pt-BR": ["Ctrl + clique: adicionar a janela em foco", "Nenhuma janela em foco fora do scratchpad."],
  "pt-PT": ["Ctrl + clique: adicionar a janela em foco", "Nenhuma janela em foco fora do scratchpad."],
  it: ["Ctrl + clic: aggiungi la finestra attiva", "Nessuna finestra attiva fuori dallo scratchpad."],
  nl: ["Ctrl + klik: actief venster toevoegen", "Geen actief venster buiten het scratchpad."],
  sv: ["Ctrl + klick: lägg till fokuserat fönster", "Inget fokuserat fönster utanför scratchpad."],
  da: ["Ctrl + klik: tilføj det fokuserede vindue", "Intet fokuseret vindue uden for scratchpad."],
  nb: ["Ctrl + klikk: legg til fokusert vindu", "Ingen fokusert vindu utenfor scratchpad."],
  fi: ["Ctrl + napsautus: lisää aktiivinen ikkuna", "Ei aktiivista ikkunaa scratchpadin ulkopuolella."],
  cs: ["Ctrl + kliknutí: přidat aktivní okno", "Žádné aktivní okno mimo scratchpad."],
  sk: ["Ctrl + kliknutie: pridať aktívne okno", "Žiadne aktívne okno mimo scratchpadu."],
  uk: ["Ctrl + клацання: додати активне вікно", "Немає активного вікна поза scratchpad."],
  ru: ["Ctrl + щелчок: добавить активное окно", "Нет активного окна вне scratchpad."],
  tr: ["Ctrl + tıklama: odaklanan pencereyi ekle", "Scratchpad dışında odaklanmış pencere yok."],
  ro: ["Ctrl + clic: adaugă fereastra activă", "Nicio fereastră activă în afara scratchpad."],
  hu: ["Ctrl + kattintás: aktív ablak hozzáadása", "Nincs aktív ablak a scratchpaden kívül."],
  el: ["Ctrl + κλικ: προσθήκη ενεργού παραθύρου", "Δεν υπάρχει ενεργό παράθυρο εκτός scratchpad."],
  ar: ["Ctrl + نقر: إضافة النافذة النشطة", "لا توجد نافذة نشطة خارج scratchpad."],
  hi: ["Ctrl + क्लिक: फ़ोकस की गई विंडो जोड़ें", "Scratchpad के बाहर कोई फ़ोकस की गई विंडो नहीं है।"],
  id: ["Ctrl + klik: tambahkan jendela yang aktif", "Tidak ada jendela aktif di luar scratchpad."],
  vi: ["Ctrl + nhấp: thêm cửa sổ đang được chọn", "Không có cửa sổ đang được chọn ngoài scratchpad."],
  th: ["Ctrl + คลิก: เพิ่มหน้าต่างที่มีโฟกัส", "ไม่มีหน้าต่างที่มีโฟกัสนอก scratchpad"],
  ja: ["Ctrl + クリック：フォーカス中のウィンドウを追加", "Scratchpadの外にフォーカス中のウィンドウがありません。"],
  ko: ["Ctrl + 클릭: 포커스된 창 추가", "Scratchpad 밖에 포커스된 창이 없습니다."],
  "zh-CN": ["Ctrl + 点击：添加当前聚焦的窗口", "Scratchpad 外没有聚焦的窗口。"],
  "zh-TW": ["Ctrl + 點擊：新增目前聚焦的視窗", "Scratchpad 外沒有聚焦的視窗。"]
};
Object.keys(quickAddCatalogs).forEach(function(code) {
  quickAddKeys.forEach(function(key,index) { catalogs[code][key] = quickAddCatalogs[code][index]; });
});

var detailedClickCatalogs = {
  en: "Click: show / hide scratchpad here",
  pl: "Kliknij: pokaż / schowaj scratchpad tutaj",
  de: "Klick: Scratchpad hier ein- / ausblenden",
  fr: "Clic : afficher / masquer le scratchpad ici",
  es: "Clic: mostrar / ocultar scratchpad aquí",
  "pt-BR": "Clique: mostrar / ocultar scratchpad aqui",
  "pt-PT": "Clique: mostrar / ocultar scratchpad aqui",
  it: "Clic: mostra / nascondi scratchpad qui",
  nl: "Klik: scratchpad hier tonen / verbergen",
  sv: "Klicka: visa / dölj scratchpad här",
  da: "Klik: vis / skjul scratchpad her",
  nb: "Klikk: vis / skjul scratchpad her",
  fi: "Napsauta: näytä / piilota scratchpad tässä",
  cs: "Kliknutí: zobrazit / skrýt scratchpad zde",
  sk: "Kliknutie: zobraziť / skryť scratchpad tu",
  uk: "Клацання: показати / приховати scratchpad тут",
  ru: "Щелчок: показать / скрыть scratchpad здесь",
  tr: "Tıkla: scratchpad’i burada göster / gizle",
  ro: "Clic: arată / ascunde scratchpad aici",
  hu: "Kattintás: scratchpad megjelenítése / elrejtése itt",
  el: "Κλικ: εμφάνιση / απόκρυψη scratchpad εδώ",
  ar: "نقر: إظهار / إخفاء scratchpad هنا",
  hi: "क्लिक: यहाँ scratchpad दिखाएँ / छिपाएँ",
  id: "Klik: tampilkan / sembunyikan scratchpad di sini",
  vi: "Nhấp: hiện / ẩn scratchpad ở đây",
  th: "คลิก: แสดง / ซ่อน scratchpad ที่นี่",
  ja: "クリック：ここにScratchpadを表示 / 非表示",
  ko: "클릭: 여기에 Scratchpad 표시 / 숨기기",
  "zh-CN": "点击：在此显示 / 隐藏 Scratchpad",
  "zh-TW": "點擊：在此顯示 / 隱藏 Scratchpad"
};
Object.keys(detailedClickCatalogs).forEach(function(code) {
  catalogs[code].clickHelpDetailed = detailedClickCatalogs[code] + "\n" + catalogs[code].clickHelp.split("\n").slice(1).join("\n");
});

var visibilityErrors = {
  "en": "Could not confirm the scratchpad state. Please try again.",
  "pl": "Nie udało się potwierdzić stanu scratchpada. Spróbuj ponownie.",
  "de": "Der Scratchpad-Zustand konnte nicht bestätigt werden. Bitte erneut versuchen.",
  "fr": "Impossible de confirmer l’état du scratchpad. Réessayez.",
  "es": "No se pudo confirmar el estado del scratchpad. Inténtalo de nuevo.",
  "pt-BR": "Não foi possível confirmar o estado do scratchpad. Tente novamente.",
  "pt-PT": "Não foi possível confirmar o estado do scratchpad. Tente novamente.",
  "it": "Impossibile confermare lo stato dello scratchpad. Riprova.",
  "nl": "De status van het scratchpad kon niet worden bevestigd. Probeer opnieuw.",
  "sv": "Kunde inte bekräfta scratchpads status. Försök igen.",
  "da": "Kunne ikke bekræfte scratchpads tilstand. Prøv igen.",
  "nb": "Kunne ikke bekrefte tilstanden til scratchpad. Prøv igjen.",
  "fi": "Scratchpadin tilaa ei voitu vahvistaa. Yritä uudelleen.",
  "cs": "Stav scratchpadu se nepodařilo ověřit. Zkuste to znovu.",
  "sk": "Stav scratchpadu sa nepodarilo overiť. Skúste to znova.",
  "uk": "Не вдалося підтвердити стан scratchpad. Спробуйте ще раз.",
  "ru": "Не удалось подтвердить состояние scratchpad. Попробуйте ещё раз.",
  "hu": "Nem sikerült megerősíteni a scratchpad állapotát. Próbáld újra.",
  "tr": "Scratchpad durumu doğrulanamadı. Lütfen tekrar deneyin.",
  "ro": "Starea scratchpad nu a putut fi confirmată. Încearcă din nou.",
  "el": "Δεν ήταν δυνατή η επιβεβαίωση της κατάστασης του scratchpad. Δοκιμάστε ξανά.",
  "ar": "تعذّر تأكيد حالة scratchpad. يُرجى المحاولة مجددًا.",
  "hi": "Scratchpad की स्थिति की पुष्टि नहीं हो सकी। कृपया फिर कोशिश करें।",
  "id": "Status scratchpad tidak dapat dikonfirmasi. Coba lagi.",
  "vi": "Không thể xác nhận trạng thái scratchpad. Vui lòng thử lại.",
  "ja": "Scratchpadの状態を確認できませんでした。もう一度お試しください。",
  "ko": "Scratchpad 상태를 확인할 수 없습니다. 다시 시도하세요.",
  "th": "ยืนยันสถานะ scratchpad ไม่ได้ โปรดลองอีกครั้ง",
  "zh-CN": "无法确认 Scratchpad 的状态。请重试。",
  "zh-TW": "無法確認 Scratchpad 的狀態。請重試。"
};
Object.keys(visibilityErrors).forEach(function(code) { catalogs[code].visibilityError = visibilityErrors[code]; });

var settingsErrors = {
  "en": "Saved settings could not be read or written.",
  "pl": "Nie udało się odczytać lub zapisać ustawień.",
  "de": "Gespeicherte Einstellungen konnten nicht gelesen oder geschrieben werden.",
  "fr": "Impossible de lire ou d’écrire les paramètres enregistrés.",
  "es": "No se pudieron leer o guardar los ajustes.",
  "pt-BR": "Não foi possível ler ou salvar as configurações.",
  "pt-PT": "Não foi possível ler ou guardar as definições.",
  "it": "Impossibile leggere o salvare le impostazioni.",
  "nl": "Instellingen konden niet worden gelezen of opgeslagen.",
  "sv": "Kunde inte läsa eller spara inställningarna.",
  "da": "Kunne ikke læse eller gemme indstillingerne.",
  "nb": "Kunne ikke lese eller lagre innstillingene.",
  "fi": "Asetuksia ei voitu lukea tai tallentaa.",
  "cs": "Nastavení se nepodařilo načíst nebo uložit.",
  "sk": "Nastavenia sa nepodarilo načítať alebo uložiť.",
  "uk": "Не вдалося прочитати або записати налаштування.",
  "ru": "Не удалось прочитать или сохранить настройки.",
  "tr": "Ayarlar okunamadı veya kaydedilemedi.",
  "ro": "Setările nu au putut fi citite sau salvate.",
  "hu": "Nem sikerült beolvasni vagy menteni a beállításokat.",
  "el": "Δεν ήταν δυνατή η ανάγνωση ή αποθήκευση των ρυθμίσεων.",
  "ar": "تعذّرت قراءة الإعدادات المحفوظة أو كتابتها.",
  "hi": "सेटिंग पढ़ी या सहेजी नहीं जा सकीं।",
  "id": "Pengaturan tidak dapat dibaca atau disimpan.",
  "vi": "Không thể đọc hoặc lưu cài đặt.",
  "th": "อ่านหรือบันทึกการตั้งค่าไม่ได้",
  "ja": "設定を読み込み、または保存できませんでした。",
  "ko": "설정을 읽거나 저장할 수 없습니다.",
  "zh-CN": "无法读取或保存设置。",
  "zh-TW": "無法讀取或儲存設定。"
};
Object.keys(settingsErrors).forEach(function(code) { catalogs[code].settingsError = settingsErrors[code]; });

// Daily release updates, shared by the panel and optional hover hints.
var updateWords = {
  "en": [
    "Automatic updates",
    "Check once a day to install stable releases."
  ],
  "pl": [
    "Automatyczne aktualizacje",
    "Sprawdzaj raz dziennie i instaluj stabilne wydania."
  ],
  "de": [
    "Automatische Updates",
    "Einmal täglich prüfen und stabile Versionen installieren."
  ],
  "fr": [
    "Mises à jour automatiques",
    "Vérifier chaque jour et installer les versions stables."
  ],
  "es": [
    "Actualizaciones automáticas",
    "Buscar una vez al día e instalar versiones estables."
  ],
  "pt-BR": [
    "Atualizações automáticas",
    "Verificar uma vez por dia e instalar versões estáveis."
  ],
  "pt-PT": [
    "Atualizações automáticas",
    "Verificar uma vez por dia e instalar versões estáveis."
  ],
  "it": [
    "Aggiornamenti automatici",
    "Controlla una volta al giorno e installa le versioni stabili."
  ],
  "nl": [
    "Automatische updates",
    "Controleer dagelijks en installeer stabiele versies."
  ],
  "sv": [
    "Automatiska uppdateringar",
    "Sök en gång om dagen och installera stabila versioner."
  ],
  "da": [
    "Automatiske opdateringer",
    "Søg én gang om dagen, og installér stabile versioner."
  ],
  "nb": [
    "Automatiske oppdateringer",
    "Sjekk én gang om dagen og installer stabile versjoner."
  ],
  "fi": [
    "Automaattiset päivitykset",
    "Tarkista kerran päivässä ja asenna vakaat julkaisut."
  ],
  "cs": [
    "Automatické aktualizace",
    "Kontrolovat jednou denně a instalovat stabilní verze."
  ],
  "sk": [
    "Automatické aktualizácie",
    "Kontrolovať raz denne a inštalovať stabilné verzie."
  ],
  "uk": [
    "Автоматичні оновлення",
    "Перевіряти раз на день і встановлювати стабільні версії."
  ],
  "ru": [
    "Автоматические обновления",
    "Проверять раз в день и устанавливать стабильные версии."
  ],
  "tr": [
    "Otomatik güncellemeler",
    "Günde bir kez kontrol et ve kararlı sürümleri yükle."
  ],
  "ro": [
    "Actualizări automate",
    "Verifică o dată pe zi și instalează versiunile stabile."
  ],
  "hu": [
    "Automatikus frissítések",
    "Napi egyszeri ellenőrzés és stabil kiadások telepítése."
  ],
  "el": [
    "Αυτόματες ενημερώσεις",
    "Έλεγχος μία φορά την ημέρα και εγκατάσταση σταθερών εκδόσεων."
  ],
  "ar": [
    "التحديثات التلقائية",
    "التحقق مرة يوميًا وتثبيت الإصدارات المستقرة."
  ],
  "hi": [
    "अपने आप अपडेट",
    "दिन में एक बार जाँचें और स्थिर संस्करण इंस्टॉल करें।"
  ],
  "id": [
    "Pembaruan otomatis",
    "Periksa sekali sehari dan pasang rilis stabil."
  ],
  "vi": [
    "Cập nhật tự động",
    "Kiểm tra mỗi ngày một lần và cài đặt bản phát hành ổn định."
  ],
  "th": [
    "อัปเดตอัตโนมัติ",
    "ตรวจสอบวันละครั้งและติดตั้งรุ่นเสถียร"
  ],
  "ja": [
    "自動更新",
    "1日1回確認し、安定版をインストールします。"
  ],
  "ko": [
    "자동 업데이트",
    "하루에 한 번 확인하고 안정 버전을 설치합니다."
  ],
  "zh-CN": [
    "自动更新",
    "每天检查一次并安装稳定版本。"
  ],
  "zh-TW": [
    "自動更新",
    "每天檢查一次並安裝穩定版本。"
  ]
};
Object.keys(updateWords).forEach(function(code) {
  catalogs[code].autoUpdates = updateWords[code][0];
  catalogs[code].autoUpdatesHint = updateWords[code][1];
});

var updateErrors = {
  "en": "Update failed. We’ll try again tomorrow.",
  "pl": "Aktualizacja się nie udała. Spróbujemy ponownie jutro.",
  "de": "Update fehlgeschlagen. Morgen versuchen wir es erneut.",
  "fr": "La mise à jour a échoué. Nouvel essai demain.",
  "es": "La actualización falló. Volveremos a intentarlo mañana.",
  "pt-BR": "A atualização falhou. Tentaremos novamente amanhã.",
  "pt-PT": "A atualização falhou. Tentaremos novamente amanhã.",
  "it": "Aggiornamento non riuscito. Riproveremo domani.",
  "nl": "De update is mislukt. Morgen proberen we het opnieuw.",
  "sv": "Uppdateringen misslyckades. Vi försöker igen i morgon.",
  "da": "Opdateringen mislykkedes. Vi prøver igen i morgen.",
  "nb": "Oppdateringen mislyktes. Vi prøver igjen i morgen.",
  "fi": "Päivitys epäonnistui. Yritämme uudelleen huomenna.",
  "cs": "Aktualizace se nezdařila. Zkusíme to znovu zítra.",
  "sk": "Aktualizácia zlyhala. Skúsime to znova zajtra.",
  "uk": "Оновлення не вдалося. Спробуємо знову завтра.",
  "ru": "Не удалось обновить. Попробуем снова завтра.",
  "tr": "Güncelleme başarısız oldu. Yarın tekrar deneyeceğiz.",
  "ro": "Actualizarea a eșuat. Vom încerca din nou mâine.",
  "hu": "A frissítés sikertelen. Holnap újra megpróbáljuk.",
  "el": "Η ενημέρωση απέτυχε. Θα προσπαθήσουμε ξανά αύριο.",
  "ar": "تعذّر التحديث. سنحاول مجددًا غدًا.",
  "hi": "अपडेट नहीं हो सका। कल फिर कोशिश करेंगे।",
  "id": "Pembaruan gagal. Kami akan mencoba lagi besok.",
  "vi": "Cập nhật thất bại. Sẽ thử lại vào ngày mai.",
  "th": "อัปเดตไม่สำเร็จ จะลองอีกครั้งพรุ่งนี้",
  "ja": "更新できませんでした。明日もう一度試します。",
  "ko": "업데이트하지 못했습니다. 내일 다시 시도합니다.",
  "zh-CN": "更新失败。明天会重试。",
  "zh-TW": "更新失敗。明天會重試。"
};
Object.keys(updateErrors).forEach(function(code) { catalogs[code].updateFailed = updateErrors[code]; });

var updateConfirmationWords = {
  "en": [
    "Turn off automatic updates?",
    "Don't turn this off if you value a stable system",
    "Turn off"
  ],
  "pl": [
    "Wyłączyć automatyczne aktualizacje?",
    "Nie wyłączaj tej opcji, jeśli zależy Ci na stabilnym systemie",
    "Wyłącz"
  ],
  "de": [
    "Automatische Updates ausschalten?",
    "Schalte dies nicht aus, wenn dir ein stabiles System wichtig ist",
    "Ausschalten"
  ],
  "fr": [
    "Désactiver les mises à jour automatiques ?",
    "Ne désactivez pas cette option si vous tenez à la stabilité de votre système",
    "Désactiver"
  ],
  "es": [
    "¿Desactivar las actualizaciones automáticas?",
    "No desactives esta opción si valoras la estabilidad del sistema",
    "Desactivar"
  ],
  "pt-BR": [
    "Desativar as atualizações automáticas?",
    "Não desative esta opção se você valoriza um sistema estável",
    "Desativar"
  ],
  "pt-PT": [
    "Desativar as atualizações automáticas?",
    "Não desative esta opção se valoriza um sistema estável",
    "Desativar"
  ],
  "it": [
    "Disattivare gli aggiornamenti automatici?",
    "Non disattivare questa opzione se desideri un sistema stabile",
    "Disattiva"
  ],
  "nl": [
    "Automatische updates uitschakelen?",
    "Schakel dit niet uit als je een stabiel systeem belangrijk vindt",
    "Uitschakelen"
  ],
  "sv": [
    "Stänga av automatiska uppdateringar?",
    "Stäng inte av detta om du värdesätter ett stabilt system",
    "Stäng av"
  ],
  "da": [
    "Slå automatiske opdateringer fra?",
    "Slå ikke dette fra, hvis du værdsætter et stabilt system",
    "Slå fra"
  ],
  "nb": [
    "Slå av automatiske oppdateringer?",
    "Ikke slå av dette hvis du verdsetter et stabilt system",
    "Slå av"
  ],
  "fi": [
    "Poistetaanko automaattiset päivitykset käytöstä?",
    "Älä poista tätä käytöstä, jos arvostat vakaata järjestelmää",
    "Poista käytöstä"
  ],
  "cs": [
    "Vypnout automatické aktualizace?",
    "Tuto možnost nevypínejte, pokud vám záleží na stabilním systému",
    "Vypnout"
  ],
  "sk": [
    "Vypnúť automatické aktualizácie?",
    "Túto možnosť nevypínajte, ak vám záleží na stabilnom systéme",
    "Vypnúť"
  ],
  "uk": [
    "Вимкнути автоматичні оновлення?",
    "Не вимикайте цю опцію, якщо цінуєте стабільність системи",
    "Вимкнути"
  ],
  "ru": [
    "Отключить автоматические обновления?",
    "Не отключайте эту опцию, если цените стабильность системы",
    "Отключить"
  ],
  "tr": [
    "Otomatik güncellemeler kapatılsın mı?",
    "Kararlı bir sisteme önem veriyorsanız bunu kapatmayın",
    "Kapat"
  ],
  "ro": [
    "Dezactivați actualizările automate?",
    "Nu dezactivați această opțiune dacă apreciați un sistem stabil",
    "Dezactivează"
  ],
  "hu": [
    "Kikapcsolja az automatikus frissítéseket?",
    "Ne kapcsolja ki ezt, ha fontos Önnek a stabil rendszer",
    "Kikapcsolás"
  ],
  "el": [
    "Απενεργοποίηση αυτόματων ενημερώσεων;",
    "Μην το απενεργοποιήσετε αν εκτιμάτε τη σταθερότητα του συστήματος",
    "Απενεργοποίηση"
  ],
  "ar": [
    "هل تريد إيقاف التحديثات التلقائية؟",
    "لا توقف هذا الخيار إذا كنت تهتم باستقرار النظام",
    "إيقاف"
  ],
  "hi": [
    "अपने आप अपडेट बंद करें?",
    "अगर आप एक स्थिर सिस्टम चाहते हैं, तो इसे बंद न करें",
    "बंद करें"
  ],
  "id": [
    "Matikan pembaruan otomatis?",
    "Jangan matikan opsi ini jika Anda mengutamakan sistem yang stabil",
    "Matikan"
  ],
  "vi": [
    "Tắt cập nhật tự động?",
    "Đừng tắt tùy chọn này nếu bạn coi trọng một hệ thống ổn định",
    "Tắt"
  ],
  "th": [
    "ปิดการอัปเดตอัตโนมัติหรือไม่",
    "อย่าปิดตัวเลือกนี้หากคุณให้ความสำคัญกับความเสถียรของระบบ",
    "ปิด"
  ],
  "ja": [
    "自動更新をオフにしますか？",
    "システムの安定性を重視するなら、オフにしないでください",
    "オフにする"
  ],
  "ko": [
    "자동 업데이트를 끄시겠습니까?",
    "안정적인 시스템을 원한다면 이 옵션을 끄지 마세요",
    "끄기"
  ],
  "zh-CN": [
    "关闭自动更新？",
    "如果你重视系统稳定性，请勿关闭此选项",
    "关闭"
  ],
  "zh-TW": [
    "關閉自動更新？",
    "如果你重視系統穩定性，請勿關閉此選項",
    "關閉"
  ]
};
Object.keys(updateConfirmationWords).forEach(function(code) {
  catalogs[code].updatesOffQuestion = updateConfirmationWords[code][0];
  catalogs[code].updatesOffWarning = updateConfirmationWords[code][1];
  catalogs[code].turnOffUpdates = updateConfirmationWords[code][2];
});
