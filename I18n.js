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
    empty: "empty", hidden: "hidden", here: "open here", active: "active here", elsewhere: "open on {monitor}", unknown: "status unknown",
    windows: "Windows", grouped: "tab", unnamed: "Untitled window",
    emptyHelp: "Send a window with Super + Alt + S.\nSuper + S shows and hides the scratchpad.",
    shortcutNote: "Shortcuts refer to Omarchy’s default bindings.", customHelp: "Move a window to this special workspace in Hyprland.",
    clickHelp: "Click: show / hide here\nRight-click: window list", show: "Show here", hide: "Hide", focus: "Select a window to switch to it.",
    unknownHelp: "Hyprland state is unavailable. Try again in a moment.", invalidHelp: "Invalid workspace name. Use letters, digits, a dot, _ or -.",
    countNote: "Each tab counts as a separate window.", author: "By Sarr",
    language: "Language", automatic: "Automatic", search: "Search languages…", noMatches: "No matches", detected: "System language: {language}",
    saveError: "Language could not be saved. Try again.", compact: "Compact label"
  },
  pl: {
    empty: "pusty", hidden: "ukryty", here: "otwarty tutaj", active: "aktywny tutaj", elsewhere: "otwarty na {monitor}", unknown: "stan nieznany",
    windows: "Okna", grouped: "zakładka", unnamed: "Okno bez tytułu",
    emptyHelp: "Przenieś okno skrótem Super + Alt + S.\nSuper + S pokazuje i chowa scratchpad.",
    shortcutNote: "Skróty dotyczą domyślnej konfiguracji Omarchy.", customHelp: "Przenieś okno do tego specjalnego pulpitu w Hyprlandzie.",
    clickHelp: "Kliknij: pokaż / schowaj tutaj\nPrawy przycisk: lista okien", show: "Pokaż tutaj", hide: "Schowaj", focus: "Wybierz okno, aby do niego przejść.",
    unknownHelp: "Nie można odczytać stanu Hyprlanda. Spróbuj ponownie za chwilę.", invalidHelp: "Nieprawidłowa nazwa pulpitu. Użyj liter, cyfr, kropki, _ lub -.",
    countNote: "Każda zakładka liczy się jako osobne okno.", author: "Autor: Sarr",
    language: "Język", automatic: "Automatycznie", search: "Szukaj języka…", noMatches: "Brak wyników", detected: "Język systemu: {language}",
    saveError: "Nie udało się zapisać języka. Spróbuj ponownie.", compact: "Krótka etykieta"
  },
  de: {
    empty: "leer", hidden: "verborgen", here: "hier geöffnet", active: "hier aktiv", elsewhere: "geöffnet auf {monitor}", unknown: "Status unbekannt",
    windows: "Fenster", grouped: "Tab", unnamed: "Fenster ohne Titel",
    emptyHelp: "Fenster mit Super + Alt + S verschieben.\nSuper + S zeigt und verbirgt den Scratchpad.",
    shortcutNote: "Die Kürzel gelten für die Standardkonfiguration von Omarchy.", customHelp: "Verschiebe ein Fenster auf diesen speziellen Arbeitsbereich in Hyprland.",
    clickHelp: "Klick: hier zeigen / verbergen\nRechtsklick: Fensterliste", show: "Hier anzeigen", hide: "Verbergen", focus: "Wähle ein Fenster, um zu ihm zu wechseln.",
    unknownHelp: "Der Hyprland-Status ist nicht verfügbar. Versuche es gleich erneut.", invalidHelp: "Ungültiger Arbeitsbereichsname. Erlaubt sind Buchstaben, Ziffern, Punkt, _ und -.",
    countNote: "Jeder Tab zählt als eigenes Fenster.", author: "Von Sarr",
    language: "Sprache", automatic: "Automatisch", search: "Sprachen suchen…", noMatches: "Keine Treffer", detected: "Systemsprache: {language}",
    saveError: "Die Sprache konnte nicht gespeichert werden. Versuche es erneut.", compact: "Kompakte Beschriftung"
  },
  fr: {
    empty: "vide", hidden: "masqué", here: "ouvert ici", active: "actif ici", elsewhere: "ouvert sur {monitor}", unknown: "état inconnu",
    windows: "Fenêtres", grouped: "onglet", unnamed: "Fenêtre sans titre",
    emptyHelp: "Déplacez une fenêtre avec Super + Alt + S.\nSuper + S affiche et masque le scratchpad.",
    shortcutNote: "Ces raccourcis correspondent à la configuration par défaut d’Omarchy.", customHelp: "Déplacez une fenêtre vers cet espace de travail spécial dans Hyprland.",
    clickHelp: "Clic : afficher / masquer ici\nClic droit : liste des fenêtres", show: "Afficher ici", hide: "Masquer", focus: "Sélectionnez une fenêtre pour y accéder.",
    unknownHelp: "L’état d’Hyprland est indisponible. Réessayez dans un instant.", invalidHelp: "Nom d’espace invalide. Utilisez des lettres, des chiffres, un point, _ ou -.",
    countNote: "Chaque onglet compte comme une fenêtre distincte.", author: "Par Sarr",
    language: "Langue", automatic: "Automatique", search: "Rechercher une langue…", noMatches: "Aucun résultat", detected: "Langue du système : {language}",
    saveError: "Impossible d’enregistrer la langue. Réessayez.", compact: "Libellé compact"
  },
  es: {
    empty: "vacío", hidden: "oculto", here: "abierto aquí", active: "activo aquí", elsewhere: "abierto en {monitor}", unknown: "estado desconocido",
    windows: "Ventanas", grouped: "pestaña", unnamed: "Ventana sin título",
    emptyHelp: "Mueve una ventana con Super + Alt + S.\nSuper + S muestra y oculta el scratchpad.",
    shortcutNote: "Los atajos corresponden a la configuración predeterminada de Omarchy.", customHelp: "Mueve una ventana a este espacio de trabajo especial en Hyprland.",
    clickHelp: "Clic: mostrar / ocultar aquí\nClic derecho: lista de ventanas", show: "Mostrar aquí", hide: "Ocultar", focus: "Selecciona una ventana para cambiar a ella.",
    unknownHelp: "El estado de Hyprland no está disponible. Vuelve a intentarlo en un momento.", invalidHelp: "Nombre de espacio no válido. Usa letras, dígitos, un punto, _ o -.",
    countNote: "Cada pestaña cuenta como una ventana independiente.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Buscar idiomas…", noMatches: "Sin resultados", detected: "Idioma del sistema: {language}",
    saveError: "No se pudo guardar el idioma. Vuelve a intentarlo.", compact: "Etiqueta compacta"
  },
  "pt-BR": {
    empty: "vazio", hidden: "oculto", here: "aberto aqui", active: "ativo aqui", elsewhere: "aberto em {monitor}", unknown: "estado desconhecido",
    windows: "Janelas", grouped: "aba", unnamed: "Janela sem título",
    emptyHelp: "Mova uma janela com Super + Alt + S.\nSuper + S mostra e oculta o scratchpad.",
    shortcutNote: "Os atalhos correspondem à configuração padrão do Omarchy.", customHelp: "Mova uma janela para este espaço de trabalho especial no Hyprland.",
    clickHelp: "Clique: mostrar / ocultar aqui\nClique direito: lista de janelas", show: "Mostrar aqui", hide: "Ocultar", focus: "Selecione uma janela para alternar para ela.",
    unknownHelp: "O estado do Hyprland não está disponível. Tente novamente em instantes.", invalidHelp: "Nome de espaço inválido. Use letras, números, ponto, _ ou -.",
    countNote: "Cada aba conta como uma janela separada.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Buscar idiomas…", noMatches: "Nenhum resultado", detected: "Idioma do sistema: {language}",
    saveError: "Não foi possível salvar o idioma. Tente novamente.", compact: "Rótulo compacto"
  },
  "pt-PT": {
    empty: "vazio", hidden: "oculto", here: "aberto aqui", active: "ativo aqui", elsewhere: "aberto em {monitor}", unknown: "estado desconhecido",
    windows: "Janelas", grouped: "separador", unnamed: "Janela sem título",
    emptyHelp: "Mova uma janela com Super + Alt + S.\nSuper + S mostra e oculta o scratchpad.",
    shortcutNote: "Os atalhos correspondem à configuração predefinida do Omarchy.", customHelp: "Mova uma janela para este espaço de trabalho especial no Hyprland.",
    clickHelp: "Clique: mostrar / ocultar aqui\nClique direito: lista de janelas", show: "Mostrar aqui", hide: "Ocultar", focus: "Selecione uma janela para mudar para ela.",
    unknownHelp: "O estado do Hyprland não está disponível. Tente novamente dentro de instantes.", invalidHelp: "Nome de espaço inválido. Utilize letras, algarismos, ponto, _ ou -.",
    countNote: "Cada separador conta como uma janela distinta.", author: "Por Sarr",
    language: "Idioma", automatic: "Automático", search: "Pesquisar idiomas…", noMatches: "Sem resultados", detected: "Idioma do sistema: {language}",
    saveError: "Não foi possível guardar o idioma. Tente novamente.", compact: "Etiqueta compacta"
  },
  it: {
    empty: "vuoto", hidden: "nascosto", here: "aperto qui", active: "attivo qui", elsewhere: "aperto su {monitor}", unknown: "stato sconosciuto",
    windows: "Finestre", grouped: "scheda", unnamed: "Finestra senza titolo",
    emptyHelp: "Sposta una finestra con Super + Alt + S.\nSuper + S mostra e nasconde lo scratchpad.",
    shortcutNote: "Le scorciatoie si riferiscono alla configurazione predefinita di Omarchy.", customHelp: "Sposta una finestra in questo spazio di lavoro speciale in Hyprland.",
    clickHelp: "Clic: mostra / nascondi qui\nClic destro: elenco finestre", show: "Mostra qui", hide: "Nascondi", focus: "Seleziona una finestra per passare a essa.",
    unknownHelp: "Lo stato di Hyprland non è disponibile. Riprova tra un momento.", invalidHelp: "Nome dello spazio non valido. Usa lettere, cifre, un punto, _ o -.",
    countNote: "Ogni scheda conta come una finestra separata.", author: "Di Sarr",
    language: "Lingua", automatic: "Automatica", search: "Cerca lingue…", noMatches: "Nessun risultato", detected: "Lingua del sistema: {language}",
    saveError: "Impossibile salvare la lingua. Riprova.", compact: "Etichetta compatta"
  },
  nl: {
    empty: "leeg", hidden: "verborgen", here: "hier geopend", active: "hier actief", elsewhere: "geopend op {monitor}", unknown: "status onbekend",
    windows: "Vensters", grouped: "tabblad", unnamed: "Venster zonder titel",
    emptyHelp: "Verplaats een venster met Super + Alt + S.\nSuper + S toont en verbergt het scratchpad.",
    shortcutNote: "De sneltoetsen gelden voor de standaardconfiguratie van Omarchy.", customHelp: "Verplaats een venster naar dit speciale werkblad in Hyprland.",
    clickHelp: "Klik: hier tonen / verbergen\nRechtsklik: vensterlijst", show: "Hier tonen", hide: "Verbergen", focus: "Selecteer een venster om ernaartoe te gaan.",
    unknownHelp: "De Hyprland-status is niet beschikbaar. Probeer het zo opnieuw.", invalidHelp: "Ongeldige werkbladnaam. Gebruik letters, cijfers, een punt, _ of -.",
    countNote: "Elk tabblad telt als een apart venster.", author: "Door Sarr",
    language: "Taal", automatic: "Automatisch", search: "Talen zoeken…", noMatches: "Geen resultaten", detected: "Systeemtaal: {language}",
    saveError: "De taal kon niet worden opgeslagen. Probeer het opnieuw.", compact: "Compact label"
  },
  da: {
    empty: "tom", hidden: "skjult", here: "åben her", active: "aktiv her", elsewhere: "åben på {monitor}", unknown: "ukendt status",
    windows: "Vinduer", grouped: "fane", unnamed: "Vindue uden titel",
    emptyHelp: "Flyt et vindue med Super + Alt + S.\nSuper + S viser og skjuler scratchpad.",
    shortcutNote: "Genvejene gælder Omarchys standardopsætning.", customHelp: "Flyt et vindue til dette særlige arbejdsområde i Hyprland.",
    clickHelp: "Klik: vis / skjul her\nHøjreklik: vinduesliste", show: "Vis her", hide: "Skjul", focus: "Vælg et vindue for at skifte til det.",
    unknownHelp: "Hyprlands status er ikke tilgængelig. Prøv igen om lidt.", invalidHelp: "Ugyldigt navn på arbejdsområdet. Brug bogstaver, tal, punktum, _ eller -.",
    countNote: "Hver fane tæller som et særskilt vindue.", author: "Af Sarr",
    language: "Sprog", automatic: "Automatisk", search: "Søg efter sprog…", noMatches: "Ingen resultater", detected: "Systemsprog: {language}",
    saveError: "Sproget kunne ikke gemmes. Prøv igen.", compact: "Kompakt etiket"
  },
  nb: {
    empty: "tom", hidden: "skjult", here: "åpen her", active: "aktiv her", elsewhere: "åpen på {monitor}", unknown: "ukjent status",
    windows: "Vinduer", grouped: "fane", unnamed: "Vindu uten tittel",
    emptyHelp: "Flytt et vindu med Super + Alt + S.\nSuper + S viser og skjuler scratchpad.",
    shortcutNote: "Snarveiene gjelder standardoppsettet i Omarchy.", customHelp: "Flytt et vindu til dette spesielle arbeidsområdet i Hyprland.",
    clickHelp: "Klikk: vis / skjul her\nHøyreklikk: vindusliste", show: "Vis her", hide: "Skjul", focus: "Velg et vindu for å bytte til det.",
    unknownHelp: "Hyprland-statusen er ikke tilgjengelig. Prøv igjen om litt.", invalidHelp: "Ugyldig navn på arbeidsområdet. Bruk bokstaver, sifre, punktum, _ eller -.",
    countNote: "Hver fane telles som et eget vindu.", author: "Av Sarr",
    language: "Språk", automatic: "Automatisk", search: "Søk etter språk…", noMatches: "Ingen treff", detected: "Systemspråk: {language}",
    saveError: "Språket kunne ikke lagres. Prøv igjen.", compact: "Kompakt etikett"
  },
  fi: {
    empty: "tyhjä", hidden: "piilotettu", here: "avoinna tässä", active: "aktiivinen tässä", elsewhere: "avoinna näytöllä {monitor}", unknown: "tila tuntematon",
    windows: "Ikkunat", grouped: "välilehti", unnamed: "Nimetön ikkuna",
    emptyHelp: "Siirrä ikkuna näppäimillä Super + Alt + S.\nSuper + S näyttää ja piilottaa scratchpadin.",
    shortcutNote: "Pikanäppäimet koskevat Omarchyn oletusasetuksia.", customHelp: "Siirrä ikkuna tähän Hyprlandin erityistyötilaan.",
    clickHelp: "Napsautus: näytä / piilota tässä\nOikea napsautus: ikkunaluettelo", show: "Näytä tässä", hide: "Piilota", focus: "Siirry ikkunaan valitsemalla se.",
    unknownHelp: "Hyprlandin tilaa ei ole saatavilla. Yritä hetken kuluttua uudelleen.", invalidHelp: "Virheellinen työtilan nimi. Käytä kirjaimia, numeroita, pistettä, _ tai -.",
    countNote: "Jokainen välilehti lasketaan erilliseksi ikkunaksi.", author: "Tekijä: Sarr",
    language: "Kieli", automatic: "Automaattinen", search: "Etsi kieliä…", noMatches: "Ei tuloksia", detected: "Järjestelmän kieli: {language}",
    saveError: "Kielen tallennus epäonnistui. Yritä uudelleen.", compact: "Tiivis teksti"
  },
  cs: {
    empty: "prázdný", hidden: "skrytý", here: "otevřený zde", active: "aktivní zde", elsewhere: "otevřený na {monitor}", unknown: "neznámý stav",
    windows: "Okna", grouped: "karta", unnamed: "Okno bez názvu",
    emptyHelp: "Přesuňte okno pomocí Super + Alt + S.\nSuper + S zobrazí a skryje scratchpad.",
    shortcutNote: "Zkratky odpovídají výchozímu nastavení Omarchy.", customHelp: "Přesuňte okno na tuto speciální pracovní plochu v Hyprlandu.",
    clickHelp: "Kliknutí: zobrazit / skrýt zde\nPravé tlačítko: seznam oken", show: "Zobrazit zde", hide: "Skrýt", focus: "Vyberte okno, na které chcete přejít.",
    unknownHelp: "Stav Hyprlandu není dostupný. Zkuste to za chvíli znovu.", invalidHelp: "Neplatný název plochy. Použijte písmena, číslice, tečku, _ nebo -.",
    countNote: "Každá karta se počítá jako samostatné okno.", author: "Autor: Sarr",
    language: "Jazyk", automatic: "Automaticky", search: "Hledat jazyky…", noMatches: "Žádné výsledky", detected: "Jazyk systému: {language}",
    saveError: "Jazyk se nepodařilo uložit. Zkuste to znovu.", compact: "Krátký popisek"
  },
  sk: {
    empty: "prázdny", hidden: "skrytý", here: "otvorený tu", active: "aktívny tu", elsewhere: "otvorený na {monitor}", unknown: "neznámy stav",
    windows: "Okná", grouped: "karta", unnamed: "Okno bez názvu",
    emptyHelp: "Presuňte okno pomocou Super + Alt + S.\nSuper + S zobrazí a skryje scratchpad.",
    shortcutNote: "Skratky zodpovedajú predvolenému nastaveniu Omarchy.", customHelp: "Presuňte okno na túto špeciálnu pracovnú plochu v Hyprlande.",
    clickHelp: "Kliknutie: zobraziť / skryť tu\nPravé tlačidlo: zoznam okien", show: "Zobraziť tu", hide: "Skryť", focus: "Vyberte okno, na ktoré chcete prejsť.",
    unknownHelp: "Stav Hyprlandu nie je dostupný. Skúste to o chvíľu znova.", invalidHelp: "Neplatný názov plochy. Použite písmená, číslice, bodku, _ alebo -.",
    countNote: "Každá karta sa počíta ako samostatné okno.", author: "Autor: Sarr",
    language: "Jazyk", automatic: "Automaticky", search: "Hľadať jazyky…", noMatches: "Žiadne výsledky", detected: "Jazyk systému: {language}",
    saveError: "Jazyk sa nepodarilo uložiť. Skúste to znova.", compact: "Krátky popis"
  },
  uk: {
    empty: "порожній", hidden: "прихований", here: "відкритий тут", active: "активний тут", elsewhere: "відкритий на {monitor}", unknown: "стан невідомий",
    windows: "Вікна", grouped: "вкладка", unnamed: "Вікно без назви",
    emptyHelp: "Перемістіть вікно за допомогою Super + Alt + S.\nSuper + S показує та приховує scratchpad.",
    shortcutNote: "Скорочення відповідають типовим налаштуванням Omarchy.", customHelp: "Перемістіть вікно на цей спеціальний робочий простір у Hyprland.",
    clickHelp: "Клацання: показати / приховати тут\nПрава кнопка: список вікон", show: "Показати тут", hide: "Приховати", focus: "Виберіть вікно, щоб перейти до нього.",
    unknownHelp: "Стан Hyprland недоступний. Спробуйте ще раз за мить.", invalidHelp: "Неприпустима назва простору. Використовуйте літери, цифри, крапку, _ або -.",
    countNote: "Кожна вкладка рахується як окреме вікно.", author: "Автор: Sarr",
    language: "Мова", automatic: "Автоматично", search: "Пошук мов…", noMatches: "Немає результатів", detected: "Мова системи: {language}",
    saveError: "Не вдалося зберегти мову. Спробуйте ще раз.", compact: "Короткий підпис"
  },
  ru: {
    empty: "пустой", hidden: "скрыт", here: "открыт здесь", active: "активен здесь", elsewhere: "открыт на {monitor}", unknown: "состояние неизвестно",
    windows: "Окна", grouped: "вкладка", unnamed: "Окно без названия",
    emptyHelp: "Переместите окно с помощью Super + Alt + S.\nSuper + S показывает и скрывает scratchpad.",
    shortcutNote: "Сочетания клавиш соответствуют стандартным настройкам Omarchy.", customHelp: "Переместите окно на это специальное рабочее пространство в Hyprland.",
    clickHelp: "Щелчок: показать / скрыть здесь\nПравая кнопка: список окон", show: "Показать здесь", hide: "Скрыть", focus: "Выберите окно, чтобы перейти к нему.",
    unknownHelp: "Состояние Hyprland недоступно. Повторите попытку через мгновение.", invalidHelp: "Недопустимое имя пространства. Используйте буквы, цифры, точку, _ или -.",
    countNote: "Каждая вкладка считается отдельным окном.", author: "Автор: Sarr",
    language: "Язык", automatic: "Автоматически", search: "Поиск языков…", noMatches: "Нет результатов", detected: "Язык системы: {language}",
    saveError: "Не удалось сохранить язык. Попробуйте ещё раз.", compact: "Короткая подпись"
  },
  tr: {
    empty: "boş", hidden: "gizli", here: "burada açık", active: "burada etkin", elsewhere: "{monitor} üzerinde açık", unknown: "durum bilinmiyor",
    windows: "Pencereler", grouped: "sekme", unnamed: "Başlıksız pencere",
    emptyHelp: "Super + Alt + S ile bir pencere taşıyın.\nSuper + S, scratchpad’i gösterir ve gizler.",
    shortcutNote: "Kısayollar Omarchy’nin varsayılan ayarlarına aittir.", customHelp: "Hyprland’deki bu özel çalışma alanına bir pencere taşıyın.",
    clickHelp: "Tıklama: burada göster / gizle\nSağ tıklama: pencere listesi", show: "Burada göster", hide: "Gizle", focus: "Geçiş yapmak için bir pencere seçin.",
    unknownHelp: "Hyprland durumu alınamıyor. Biraz sonra tekrar deneyin.", invalidHelp: "Geçersiz çalışma alanı adı. Harf, rakam, nokta, _ veya - kullanın.",
    countNote: "Her sekme ayrı bir pencere olarak sayılır.", author: "Geliştirici: Sarr",
    language: "Dil", automatic: "Otomatik", search: "Dil ara…", noMatches: "Sonuç bulunamadı", detected: "Sistem dili: {language}",
    saveError: "Dil kaydedilemedi. Tekrar deneyin.", compact: "Kısa etiket"
  },
  ro: {
    empty: "gol", hidden: "ascuns", here: "deschis aici", active: "activ aici", elsewhere: "deschis pe {monitor}", unknown: "stare necunoscută",
    windows: "Ferestre", grouped: "filă", unnamed: "Fereastră fără titlu",
    emptyHelp: "Mută o fereastră cu Super + Alt + S.\nSuper + S afișează și ascunde scratchpad-ul.",
    shortcutNote: "Scurtăturile corespund configurației implicite Omarchy.", customHelp: "Mută o fereastră în acest spațiu de lucru special din Hyprland.",
    clickHelp: "Clic: afișează / ascunde aici\nClic dreapta: lista ferestrelor", show: "Afișează aici", hide: "Ascunde", focus: "Selectează o fereastră pentru a trece la ea.",
    unknownHelp: "Starea Hyprland nu este disponibilă. Încearcă din nou peste un moment.", invalidHelp: "Nume de spațiu nevalid. Folosește litere, cifre, punct, _ sau -.",
    countNote: "Fiecare filă este numărată ca fereastră separată.", author: "Autor: Sarr",
    language: "Limbă", automatic: "Automat", search: "Caută limbi…", noMatches: "Niciun rezultat", detected: "Limba sistemului: {language}",
    saveError: "Limba nu a putut fi salvată. Încearcă din nou.", compact: "Etichetă compactă"
  },
  hu: {
    empty: "üres", hidden: "rejtett", here: "itt nyitva", active: "itt aktív", elsewhere: "megnyitva: {monitor}", unknown: "ismeretlen állapot",
    windows: "Ablakok", grouped: "lap", unnamed: "Névtelen ablak",
    emptyHelp: "Ablak áthelyezése: Super + Alt + S.\nA Super + S megjeleníti és elrejti a scratchpadet.",
    shortcutNote: "A gyorsbillentyűk az Omarchy alapbeállításaira vonatkoznak.", customHelp: "Helyezz át egy ablakot erre a speciális Hyprland-munkaterületre.",
    clickHelp: "Kattintás: megjelenítés / elrejtés itt\nJobb kattintás: ablaklista", show: "Megjelenítés itt", hide: "Elrejtés", focus: "Válassz egy ablakot a váltáshoz.",
    unknownHelp: "A Hyprland állapota nem érhető el. Próbáld újra később.", invalidHelp: "Érvénytelen munkaterületnév. Használj betűket, számjegyeket, pontot, _ vagy - jelet.",
    countNote: "Minden lap külön ablaknak számít.", author: "Készítette: Sarr",
    language: "Nyelv", automatic: "Automatikus", search: "Nyelvek keresése…", noMatches: "Nincs találat", detected: "Rendszernyelv: {language}",
    saveError: "A nyelvet nem sikerült menteni. Próbáld újra.", compact: "Rövid felirat"
  },
  el: {
    empty: "κενό", hidden: "κρυφό", here: "ανοιχτό εδώ", active: "ενεργό εδώ", elsewhere: "ανοιχτό στην {monitor}", unknown: "άγνωστη κατάσταση",
    windows: "Παράθυρα", grouped: "καρτέλα", unnamed: "Παράθυρο χωρίς τίτλο",
    emptyHelp: "Μετακινήστε ένα παράθυρο με Super + Alt + S.\nΤο Super + S εμφανίζει και κρύβει το scratchpad.",
    shortcutNote: "Οι συντομεύσεις αντιστοιχούν στις προεπιλογές του Omarchy.", customHelp: "Μετακινήστε ένα παράθυρο σε αυτόν τον ειδικό χώρο εργασίας του Hyprland.",
    clickHelp: "Κλικ: εμφάνιση / απόκρυψη εδώ\nΔεξί κλικ: λίστα παραθύρων", show: "Εμφάνιση εδώ", hide: "Απόκρυψη", focus: "Επιλέξτε ένα παράθυρο για μετάβαση σε αυτό.",
    unknownHelp: "Η κατάσταση του Hyprland δεν είναι διαθέσιμη. Δοκιμάστε ξανά σε λίγο.", invalidHelp: "Μη έγκυρο όνομα χώρου. Χρησιμοποιήστε γράμματα, ψηφία, τελεία, _ ή -.",
    countNote: "Κάθε καρτέλα μετρά ως ξεχωριστό παράθυρο.", author: "Από τον Sarr",
    language: "Γλώσσα", automatic: "Αυτόματα", search: "Αναζήτηση γλωσσών…", noMatches: "Κανένα αποτέλεσμα", detected: "Γλώσσα συστήματος: {language}",
    saveError: "Δεν ήταν δυνατή η αποθήκευση της γλώσσας. Δοκιμάστε ξανά.", compact: "Σύντομη ετικέτα"
  },
  ar: {
    empty: "فارغ", hidden: "مخفي", here: "مفتوح هنا", active: "نشط هنا", elsewhere: "مفتوح على {monitor}", unknown: "الحالة غير معروفة",
    windows: "النوافذ", grouped: "علامة تبويب", unnamed: "نافذة بلا عنوان",
    emptyHelp: "انقل نافذة باستخدام ⁦Super + Alt + S⁩.\nيُظهر ⁦Super + S⁩ مساحة Scratchpad ويخفيها.",
    shortcutNote: "تشير الاختصارات إلى إعدادات Omarchy الافتراضية.", customHelp: "انقل نافذة إلى مساحة العمل الخاصة هذه في Hyprland.",
    clickHelp: "نقر: إظهار / إخفاء هنا\nنقر بالزر الأيمن: قائمة النوافذ", show: "إظهار هنا", hide: "إخفاء", focus: "اختر نافذة للانتقال إليها.",
    unknownHelp: "حالة Hyprland غير متاحة. حاول مجددًا بعد قليل.", invalidHelp: "اسم مساحة العمل غير صالح. استخدم أحرفًا لاتينية أو أرقامًا أو نقطة أو ⁦_⁩ أو ⁦-⁩.",
    countNote: "تُحسب كل علامة تبويب كنافذة مستقلة.", author: "من تطوير Sarr",
    language: "اللغة", automatic: "تلقائي", search: "ابحث عن لغة…", noMatches: "لا توجد نتائج", detected: "لغة النظام: {language}",
    saveError: "تعذر حفظ اللغة. حاول مجددًا.", compact: "تسمية مختصرة"
  },
  hi: {
    empty: "खाली", hidden: "छिपा हुआ", here: "यहाँ खुला", active: "यहाँ सक्रिय", elsewhere: "{monitor} पर खुला", unknown: "स्थिति अज्ञात",
    windows: "विंडो", grouped: "टैब", unnamed: "बिना शीर्षक की विंडो",
    emptyHelp: "Super + Alt + S से विंडो भेजें।\nSuper + S से स्क्रैचपैड दिखाएँ या छिपाएँ।",
    shortcutNote: "ये शॉर्टकट Omarchy की डिफ़ॉल्ट सेटिंग के अनुसार हैं।", customHelp: "Hyprland के इस विशेष कार्यक्षेत्र में एक विंडो भेजें।",
    clickHelp: "क्लिक: यहाँ दिखाएँ / छिपाएँ\nदायाँ क्लिक: विंडो सूची", show: "यहाँ दिखाएँ", hide: "छिपाएँ", focus: "किसी विंडो पर जाने के लिए उसे चुनें।",
    unknownHelp: "Hyprland की स्थिति उपलब्ध नहीं है। कुछ देर बाद फिर कोशिश करें।", invalidHelp: "कार्यक्षेत्र का नाम अमान्य है। लैटिन अक्षर, अंक, बिंदु, _ या - इस्तेमाल करें।",
    countNote: "हर टैब एक अलग विंडो के रूप में गिना जाता है।", author: "निर्माता: Sarr",
    language: "भाषा", automatic: "स्वचालित", search: "भाषाएँ खोजें…", noMatches: "कोई परिणाम नहीं", detected: "सिस्टम की भाषा: {language}",
    saveError: "भाषा सहेजी नहीं जा सकी। फिर कोशिश करें।", compact: "छोटा लेबल"
  },
  id: {
    empty: "kosong", hidden: "tersembunyi", here: "terbuka di sini", active: "aktif di sini", elsewhere: "terbuka di {monitor}", unknown: "status tidak diketahui",
    windows: "Jendela", grouped: "tab", unnamed: "Jendela tanpa judul",
    emptyHelp: "Pindahkan jendela dengan Super + Alt + S.\nSuper + S menampilkan dan menyembunyikan scratchpad.",
    shortcutNote: "Pintasan mengacu pada pengaturan bawaan Omarchy.", customHelp: "Pindahkan jendela ke ruang kerja khusus ini di Hyprland.",
    clickHelp: "Klik: tampilkan / sembunyikan di sini\nKlik kanan: daftar jendela", show: "Tampilkan di sini", hide: "Sembunyikan", focus: "Pilih jendela untuk beralih ke sana.",
    unknownHelp: "Status Hyprland tidak tersedia. Coba lagi sebentar.", invalidHelp: "Nama ruang kerja tidak valid. Gunakan huruf, angka, titik, _ atau -.",
    countNote: "Setiap tab dihitung sebagai jendela terpisah.", author: "Oleh Sarr",
    language: "Bahasa", automatic: "Otomatis", search: "Cari bahasa…", noMatches: "Tidak ada hasil", detected: "Bahasa sistem: {language}",
    saveError: "Bahasa tidak dapat disimpan. Coba lagi.", compact: "Label ringkas"
  },
  vi: {
    empty: "trống", hidden: "đang ẩn", here: "mở ở đây", active: "đang dùng ở đây", elsewhere: "mở trên {monitor}", unknown: "không rõ trạng thái",
    windows: "Cửa sổ", grouped: "thẻ", unnamed: "Cửa sổ không có tiêu đề",
    emptyHelp: "Chuyển cửa sổ bằng Super + Alt + S.\nSuper + S hiện và ẩn scratchpad.",
    shortcutNote: "Các phím tắt theo cấu hình mặc định của Omarchy.", customHelp: "Chuyển cửa sổ vào không gian làm việc đặc biệt này trong Hyprland.",
    clickHelp: "Nhấp: hiện / ẩn ở đây\nNhấp phải: danh sách cửa sổ", show: "Hiện ở đây", hide: "Ẩn", focus: "Chọn cửa sổ để chuyển đến.",
    unknownHelp: "Không đọc được trạng thái Hyprland. Hãy thử lại sau giây lát.", invalidHelp: "Tên không gian không hợp lệ. Dùng chữ cái Latinh, chữ số, dấu chấm, _ hoặc -.",
    countNote: "Mỗi thẻ được tính là một cửa sổ riêng.", author: "Tác giả: Sarr",
    language: "Ngôn ngữ", automatic: "Tự động", search: "Tìm ngôn ngữ…", noMatches: "Không có kết quả", detected: "Ngôn ngữ hệ thống: {language}",
    saveError: "Không thể lưu ngôn ngữ. Hãy thử lại.", compact: "Nhãn ngắn gọn"
  },
  th: {
    empty: "ว่าง", hidden: "ซ่อนอยู่", here: "เปิดที่นี่", active: "ใช้งานที่นี่", elsewhere: "เปิดบน {monitor}", unknown: "ไม่ทราบสถานะ",
    windows: "หน้าต่าง", grouped: "แท็บ", unnamed: "หน้าต่างไม่มีชื่อ",
    emptyHelp: "ย้ายหน้าต่างด้วย Super + Alt + S\nSuper + S ใช้แสดงและซ่อน scratchpad",
    shortcutNote: "ปุ่มลัดเหล่านี้อ้างอิงการตั้งค่าเริ่มต้นของ Omarchy", customHelp: "ย้ายหน้าต่างไปยังพื้นที่ทำงานพิเศษนี้ใน Hyprland",
    clickHelp: "คลิก: แสดง / ซ่อนที่นี่\nคลิกขวา: รายการหน้าต่าง", show: "แสดงที่นี่", hide: "ซ่อน", focus: "เลือกหน้าต่างเพื่อสลับไปยังหน้าต่างนั้น",
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
    clickHelp: "クリック：ここに表示／非表示\n右クリック：ウィンドウ一覧", show: "ここに表示", hide: "非表示", focus: "ウィンドウを選ぶと、そのウィンドウに切り替わります。",
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
    clickHelp: "클릭: 여기에 표시 / 숨기기\n오른쪽 클릭: 창 목록", show: "여기에 표시", hide: "숨기기", focus: "창을 선택하면 해당 창으로 전환합니다.",
    unknownHelp: "Hyprland 상태를 가져올 수 없습니다. 잠시 후 다시 시도하세요.", invalidHelp: "작업 공간 이름이 올바르지 않습니다. 영문자, 숫자, 마침표, _ 또는 -를 사용하세요.",
    countNote: "각 탭은 별도의 창으로 계산됩니다.", author: "제작: Sarr",
    language: "언어", automatic: "자동", search: "언어 검색…", noMatches: "결과 없음", detected: "시스템 언어: {language}",
    saveError: "언어를 저장할 수 없습니다. 다시 시도하세요.", compact: "짧은 레이블"
  },
  "zh-CN": {
    empty: "空", hidden: "已隐藏", here: "在此显示", active: "正在此处使用", elsewhere: "在 {monitor} 显示", unknown: "状态未知",
    windows: "窗口", grouped: "标签页", unnamed: "无标题窗口",
    emptyHelp: "按 Super + Alt + S 移入窗口。\n按 Super + S 显示或隐藏暂存区。",
    shortcutNote: "这些快捷键基于 Omarchy 的默认设置。", customHelp: "将窗口移至 Hyprland 的此特殊工作区。",
    clickHelp: "单击：在此显示／隐藏\n右键单击：窗口列表", show: "在此显示", hide: "隐藏", focus: "选择窗口以切换到该窗口。",
    unknownHelp: "无法读取 Hyprland 状态，请稍后重试。", invalidHelp: "工作区名称无效，请使用英文字母、数字、点、_ 或 -。",
    countNote: "每个标签页都计为一个独立窗口。", author: "作者：Sarr",
    language: "语言", automatic: "自动", search: "搜索语言…", noMatches: "无匹配结果", detected: "系统语言：{language}",
    saveError: "无法保存语言，请重试。", compact: "简短标签"
  },
  "zh-TW": {
    empty: "空", hidden: "已隱藏", here: "在此顯示", active: "正在此處使用", elsewhere: "在 {monitor} 顯示", unknown: "狀態不明",
    windows: "視窗", grouped: "分頁", unnamed: "無標題視窗",
    emptyHelp: "按 Super + Alt + S 移入視窗。\n按 Super + S 顯示或隱藏暫存區。",
    shortcutNote: "這些快捷鍵依據 Omarchy 的預設設定。", customHelp: "將視窗移至 Hyprland 的此特殊工作區。",
    clickHelp: "按一下：在此顯示／隱藏\n按右鍵：視窗清單", show: "在此顯示", hide: "隱藏", focus: "選取視窗以切換至該視窗。",
    unknownHelp: "無法讀取 Hyprland 狀態，請稍後再試。", invalidHelp: "工作區名稱無效，請使用英文字母、數字、點、_ 或 -。",
    countNote: "每個分頁都計為一個獨立視窗。", author: "作者：Sarr",
    language: "語言", automatic: "自動", search: "搜尋語言…", noMatches: "沒有符合的結果", detected: "系統語言：{language}",
    saveError: "無法儲存語言，請重試。", compact: "簡短標籤"
  },
  sv: {
    empty: "tom", hidden: "dold", here: "öppen här", active: "aktiv här", elsewhere: "öppen på {monitor}", unknown: "okänd status",
    windows: "Fönster", grouped: "flik", unnamed: "Fönster utan titel",
    emptyHelp: "Flytta ett fönster med Super + Alt + S.\nSuper + S visar och döljer scratchpad.",
    shortcutNote: "Genvägarna gäller Omarchys standardinställningar.", customHelp: "Flytta ett fönster till denna särskilda arbetsyta i Hyprland.",
    clickHelp: "Klick: visa / dölj här\nHögerklick: fönsterlista", show: "Visa här", hide: "Dölj", focus: "Välj ett fönster för att växla till det.",
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
