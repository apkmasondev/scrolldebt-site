const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const srcDir = path.join(__dirname, 'src');
const outDir = __dirname;
const languages = ['en', 'es', 'fr', 'de', 'pl'];
const defaultLang = 'en';
const baseUrl = 'https://apkmasondev.github.io/scrolldebt-site/';

const metaTranslations = {
    'index.html': {
        'en': {
            title: 'ScrollDebt - Reclaim Your Time',
            desc: 'ScrollDebt converts your mindless doomscrolling into brutal reality checks. Track wasted time, face sarcastic roasts, and reclaim your life. 100% offline, zero data collection.',
            ogDesc: 'ScrollDebt converts your mindless doomscrolling into brutal reality checks.'
        },
        'pl': {
            title: 'ScrollDebt - Odzyskaj Swój Czas',
            desc: 'ScrollDebt zamienia bezmyślne scrollowanie w brutalne zderzenie z rzeczywistością. Śledź zmarnowany czas, czytaj sarkastyczne komentarze i odzyskaj kontrolę nad życiem. W 100% offline, zero gromadzenia danych.',
            ogDesc: 'ScrollDebt zamienia bezmyślne scrollowanie w brutalne zderzenie z rzeczywistością.'
        },
        'es': {
            title: 'ScrollDebt - Recupera Tu Tiempo',
            desc: 'ScrollDebt convierte tu adicción a la pantalla en duros golpes de realidad. Registra el tiempo perdido, enfrenta comentarios sarcásticos y recupera tu vida. 100% offline, sin recopilar datos.',
            ogDesc: 'ScrollDebt convierte tu adicción a la pantalla en duros golpes de realidad.'
        },
        'fr': {
            title: 'ScrollDebt - Reprenez Votre Temps',
            desc: 'ScrollDebt transforme votre défilement compulsif en un rappel brutal à la réalité. Suivez le temps perdu, affrontez des remarques sarcastiques et reprenez votre vie en main. 100% hors ligne, aucune collecte de données.',
            ogDesc: 'ScrollDebt transforme votre défilement compulsif en un rappel brutal à la réalité.'
        },
        'de': {
            title: 'ScrollDebt - Hol Dir Deine Zeit Zurück',
            desc: 'ScrollDebt verwandelt dein endloses Scrollen in brutale Realitätschecks. Verfolge verschwendete Zeit, stelle dich sarkastischen Kommentaren und hol dir dein Leben zurück. 100% offline, keine Datenerfassung.',
            ogDesc: 'ScrollDebt verwandelt dein endloses Scrollen in brutale Realitätschecks.'
        }
    },
    'how-it-works.html': {
        'en': { title: 'How It Works - ScrollDebt' },
        'pl': { title: 'Jak to Działa - ScrollDebt' },
        'es': { title: 'Cómo Funciona - ScrollDebt' },
        'fr': { title: 'Comment ça Marche - ScrollDebt' },
        'de': { title: 'Wie es Funktioniert - ScrollDebt' }
    },
    'privacy.html': {
        'en': { title: 'Privacy Policy - ScrollDebt' },
        'pl': { title: 'Polityka Prywatności - ScrollDebt' },
        'es': { title: 'Política de Privacidad - ScrollDebt' },
        'fr': { title: 'Politique de Confidentialité - ScrollDebt' },
        'de': { title: 'Datenschutzerklärung - ScrollDebt' }
    },
    'changelog.html': {
        'en': { title: 'Changelog - ScrollDebt' },
        'pl': { title: 'Historia Wersji - ScrollDebt' },
        'es': { title: 'Registro de Cambios - ScrollDebt' },
        'fr': { title: 'Journal des Modifications - ScrollDebt' },
        'de': { title: 'Änderungsprotokoll - ScrollDebt' }
    }
};

const altTranslations = {
    'pl': {
        "ScrollDebt App Mockup": "Makieta Aplikacji ScrollDebt",
        "Brutal Truth Alert Mockup": "Makieta Powiadomienia Brutalnej Prawdy",
        "Holy 7 Social Media Hourglass": "Klepsydra Świętej Siódemki",
        "ScrollDebt dark mode home screen displaying time limits": "Ekran główny w trybie ciemnym wyświetlający limity czasu",
        "Statistics view showing weekly doomscrolling trends": "Widok statystyk pokazujący tygodniowe trendy",
        "Wasted Potential analysis screen in dark mode": "Ekran analizy Zmarnowanego Potencjału w trybie ciemnym",
        "App tracking selection interface with red accents": "Interfejs wyboru śledzonych aplikacji z czerwonymi akcentami",
        "Tracking mode configuration with Sniper Mode options": "Konfiguracja trybu śledzenia z opcjami Trybu Snajpera",
        "Brutal Truth push notification interrupting doomscrolling": "Powiadomienie Brutalnej Prawdy przerywające doomscrolling",
        "ScrollDebt dashboard translated into Spanish": "Pulpit nawigacyjny ScrollDebt w języku hiszpańskim",
        "Spanish language statistics and weekly tracking report": "Statystyki i raport w języku hiszpańskim",
        "Settings screen displaying German localization": "Ekran ustawień z niemiecką lokalizacją",
        "Light mode dashboard with active tracking limit": "Jasny motyw z aktywnym limitem śledzenia",
        "Light mode interface for selecting tracked social apps": "Jasny interfejs wyboru aplikacji społecznościowych",
        "Light mode Wasted Potential screen": "Jasny ekran Zmarnowanego Potencjału",
        "Light mode Brutal Truth sarcastic messages screen": "Jasny ekran sarkastycznych wiadomości",
        "ScrollDebt Today screen displaying 14 hours wasted": "Ekran główny ScrollDebt pokazujący 14 zmarnowanych godzin",
        "ScrollDebt Today screen translated into German": "Ekran główny ScrollDebt przetłumaczony na język niemiecki"
    },
    'es': {
        "ScrollDebt App Mockup": "Maqueta de la App ScrollDebt",
        "Brutal Truth Alert Mockup": "Maqueta de Alerta Verdad Brutal",
        "Holy 7 Social Media Hourglass": "Reloj de Arena de los 7 Santos",
        "ScrollDebt dark mode home screen displaying time limits": "Pantalla principal mostrando límites de tiempo",
        "Statistics view showing weekly doomscrolling trends": "Vista de estadísticas mostrando tendencias",
        "Wasted Potential analysis screen in dark mode": "Pantalla de análisis de Potencial Desperdiciado",
        "App tracking selection interface with red accents": "Interfaz de selección con acentos rojos",
        "Tracking mode configuration with Sniper Mode options": "Configuración de seguimiento con Modo Francotirador",
        "Brutal Truth push notification interrupting doomscrolling": "Notificación interrumpiendo el doomscrolling",
        "ScrollDebt dashboard translated into Spanish": "Panel traducido al español",
        "Spanish language statistics and weekly tracking report": "Estadísticas e informe semanal en español",
        "Settings screen displaying German localization": "Pantalla de configuración en alemán",
        "Light mode dashboard with active tracking limit": "Panel en modo claro con límite activo",
        "Light mode interface for selecting tracked social apps": "Interfaz en modo claro para seleccionar aplicaciones",
        "Light mode Wasted Potential screen": "Pantalla de Potencial Desperdiciado en modo claro",
        "Light mode Brutal Truth sarcastic messages screen": "Pantalla de mensajes sarcásticos en modo claro",
        "ScrollDebt Today screen displaying 14 hours wasted": "Pantalla principal de ScrollDebt mostrando 14 horas desperdiciadas",
        "ScrollDebt Today screen translated into German": "Pantalla principal de ScrollDebt traducida al alemán"
    },
    'fr': {
        "ScrollDebt App Mockup": "Maquette de l'Application ScrollDebt",
        "Brutal Truth Alert Mockup": "Maquette de l'Alerte Vérité Brutale",
        "Holy 7 Social Media Hourglass": "Sablier des 7 Sacrés",
        "ScrollDebt dark mode home screen displaying time limits": "Écran d'accueil en mode sombre affichant les limites",
        "Statistics view showing weekly doomscrolling trends": "Statistiques montrant les tendances hebdomadaires",
        "Wasted Potential analysis screen in dark mode": "Écran d'analyse du Potentiel Gâché en mode sombre",
        "App tracking selection interface with red accents": "Interface de sélection avec des accents rouges",
        "Tracking mode configuration with Sniper Mode options": "Configuration de suivi avec Mode Sniper",
        "Brutal Truth push notification interrupting doomscrolling": "Notification interrompant le doomscrolling",
        "ScrollDebt dashboard translated into Spanish": "Tableau de bord traduit en espagnol",
        "Spanish language statistics and weekly tracking report": "Statistiques et rapport de suivi en espagnol",
        "Settings screen displaying German localization": "Écran des paramètres affichant la traduction allemande",
        "Light mode dashboard with active tracking limit": "Mode clair avec limite de suivi active",
        "Light mode interface for selecting tracked social apps": "Interface claire pour sélectionner les applications",
        "Light mode Wasted Potential screen": "Écran Potentiel Gâché en mode clair",
        "Light mode Brutal Truth sarcastic messages screen": "Écran de messages sarcastiques en mode clair",
        "ScrollDebt Today screen displaying 14 hours wasted": "Écran d'accueil ScrollDebt affichant 14 heures gaspillées",
        "ScrollDebt Today screen translated into German": "Écran d'accueil ScrollDebt traduit en allemand"
    },
    'de': {
        "ScrollDebt App Mockup": "ScrollDebt App-Modell",
        "Brutal Truth Alert Mockup": "Brutale Wahrheit Alarm-Modell",
        "Holy 7 Social Media Hourglass": "Sanduhr der Heiligen 7",
        "ScrollDebt dark mode home screen displaying time limits": "Startbildschirm im dunklen Modus mit Zeitlimits",
        "Statistics view showing weekly doomscrolling trends": "Statistikansicht mit wöchentlichen Trends",
        "Wasted Potential analysis screen in dark mode": "Bildschirm 'Verschwendetes Potenzial' im Dark Mode",
        "App tracking selection interface with red accents": "Auswahlschnittstelle mit roten Akzenten",
        "Tracking mode configuration with Sniper Mode options": "Konfiguration des Tracking-Modus mit Sniper-Optionen",
        "Brutal Truth push notification interrupting doomscrolling": "Benachrichtigung unterbricht das Scrollen",
        "ScrollDebt dashboard translated into Spanish": "Dashboard ins Spanische übersetzt",
        "Spanish language statistics and weekly tracking report": "Statistiken und Tracking-Bericht auf Spanisch",
        "Settings screen displaying German localization": "Einstellungsbildschirm mit deutscher Übersetzung",
        "Light mode dashboard with active tracking limit": "Heller Modus mit aktivem Tracking-Limit",
        "Light mode interface for selecting tracked social apps": "Helle Oberfläche zur Auswahl von Apps",
        "Light mode Wasted Potential screen": "Heller Bildschirm für verschwendetes Potenzial",
        "Light mode Brutal Truth sarcastic messages screen": "Heller Bildschirm für sarkastische Nachrichten",
        "ScrollDebt Today screen displaying 14 hours wasted": "ScrollDebt Startbildschirm mit 14 verschwendeten Stunden",
        "ScrollDebt Today screen translated into German": "ScrollDebt Startbildschirm ins Deutsche übersetzt"
    }
};

// Ensure we don't accidentally delete important files, so we just build files
const htmlFiles = ['index.html', 'how-it-works.html', 'privacy.html', 'changelog.html'];

function build() {
    htmlFiles.forEach(file => {
        const srcPath = path.join(srcDir, file);
        if (!fs.existsSync(srcPath)) return;
        
        const html = fs.readFileSync(srcPath, 'utf8');

        languages.forEach(lang => {
            const $ = cheerio.load(html);

            // 1. Remove elements that belong to other languages
            $('[data-lang]').each((i, el) => {
                if ($(el).attr('data-lang') !== lang) {
                    $(el).remove();
                } else {
                    $(el).removeAttr('data-lang');
                }
            });

            // 2. Set HTML lang attribute
            $('html').attr('lang', lang);

            // 3. Add hreflang tags to head and update meta tags
            languages.forEach(l => {
                const prefix = l === defaultLang ? '' : `${l}/`;
                const href = `${baseUrl}${prefix}${file}`;
                $('head').append(`\n    <link rel="alternate" hreflang="${l}" href="${href}" />`);
            });
            // Add x-default
            $('head').append(`\n    <link rel="alternate" hreflang="x-default" href="${baseUrl}${file}" />`);

            // Update meta tags and og:url
            const currentPrefix = lang === defaultLang ? '' : `${lang}/`;
            $('meta[property="og:url"]').attr('content', `${baseUrl}${currentPrefix}${file}`);
            
            const fileMeta = metaTranslations[file];
            if (fileMeta && fileMeta[lang]) {
                const meta = fileMeta[lang];
                $('title').text(meta.title);
                $('meta[property="og:title"]').attr('content', meta.title);
                
                if (meta.desc) {
                    $('meta[name="description"]').attr('content', meta.desc);
                    $('meta[property="og:description"]').attr('content', meta.ogDesc);
                } else {
                    // if no custom desc (for subpages), we could leave it or clear it. Let's leave default or set empty
                    $('meta[name="description"]').attr('content', '');
                    $('meta[property="og:description"]').attr('content', '');
                }
            }

            // Translate image alt tags if translation exists
            if (lang !== 'en' && altTranslations[lang]) {
                $('img').each((i, el) => {
                    const originalAlt = $(el).attr('alt');
                    if (originalAlt && altTranslations[lang][originalAlt]) {
                        $(el).attr('alt', altTranslations[lang][originalAlt]);
                    }
                });
            }

            // 4. Update language switcher to be actual links
            const isSubdir = lang !== defaultLang;
            const upPrefix = isSubdir ? '../' : '';
            
            let switcherHtml = '';
            languages.forEach(l => {
                const targetPrefix = l === defaultLang ? upPrefix : (isSubdir ? `../${l}/` : `${l}/`);
                const activeClass = l === lang ? ' active' : '';
                switcherHtml += `\n            <a href="${targetPrefix}${file}" class="lang-btn${activeClass}">${l.toUpperCase()}</a>`;
            });
            $('.lang-switcher').html(switcherHtml);

            // 5. Update asset links if in subdirectory
            if (isSubdir) {
                // Prepend ../ to local CSS, images, JS
                $('link[rel="stylesheet"]').each((i, el) => {
                    const href = $(el).attr('href');
                    if (href && !href.startsWith('http')) $(el).attr('href', '../' + href);
                });
                $('img').each((i, el) => {
                    const src = $(el).attr('src');
                    if (src && !src.startsWith('http') && !src.startsWith('data:')) $(el).attr('src', '../' + src);
                });
                $('link[rel="icon"]').each((i, el) => {
                    const href = $(el).attr('href');
                    if (href && !href.startsWith('http')) $(el).attr('href', '../' + href);
                });
            }

            // Remove the JS that handles dynamic language switching
            $('script').each((i, el) => {
                const scriptContent = $(el).html();
                if (scriptContent.includes('setLang(') || scriptContent.includes('scrolldebt-lang')) {
                    // Replace with a simpler script just for gallery scroll and cookies
                    $(el).html(`
        window.addEventListener('DOMContentLoaded', () => {
            // Gallery Scroll Buttons
            const scroll = document.getElementById('galleryScroll');
            const btnPrev = document.querySelector('.gallery-btn.prev');
            const btnNext = document.querySelector('.gallery-btn.next');
            
            if (scroll && btnPrev && btnNext) {
                btnPrev.addEventListener('click', () => {
                    scroll.scrollBy({ left: -300, behavior: 'smooth' });
                });
                btnNext.addEventListener('click', () => {
                    scroll.scrollBy({ left: 300, behavior: 'smooth' });
                });
            }

            // Cookie Banner
            const banner = document.getElementById('cookie-banner');
            const btnAccept = document.getElementById('accept-cookies');
            if (banner && btnAccept) {
                if (localStorage.getItem('scrolldebt-cookie-accepted') === 'true') {
                    banner.style.display = 'none';
                }
                btnAccept.addEventListener('click', () => {
                    try {
                        localStorage.setItem('scrolldebt-cookie-accepted', 'true');
                    } catch(e) {}
                    banner.style.display = 'none';
                });
            }
        });
                    `);
                }
            });

            // 6. Write the output file
            const destDir = isSubdir ? path.join(outDir, lang) : outDir;
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            fs.writeFileSync(path.join(destDir, file), $.html());
            console.log(`Generated: ${path.join(destDir, file)}`);
        });
    });

    // Generate sitemap.xml
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
    htmlFiles.forEach(file => {
        languages.forEach(lang => {
            const prefix = lang === defaultLang ? '' : `${lang}/`;
            sitemap += `  <url>\n    <loc>${baseUrl}${prefix}${file}</loc>\n`;
            languages.forEach(l => {
                const altPrefix = l === defaultLang ? '' : `${l}/`;
                sitemap += `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}${altPrefix}${file}"/>\n`;
            });
            sitemap += `  </url>\n`;
        });
    });
    sitemap += `</urlset>`;
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
    console.log('Generated: sitemap.xml');
}

build();
