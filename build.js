const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const srcDir = path.join(__dirname, 'src');
const outDir = __dirname;
const languages = ['en', 'es', 'fr', 'de', 'pl'];
const defaultLang = 'en';
const baseUrl = 'https://apkmasondev.github.io/scrolldebt-site/';

const metaTranslations = {
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
            
            if (metaTranslations[lang]) {
                $('title').text(metaTranslations[lang].title);
                $('meta[name="description"]').attr('content', metaTranslations[lang].desc);
                $('meta[property="og:title"]').attr('content', metaTranslations[lang].title);
                $('meta[property="og:description"]').attr('content', metaTranslations[lang].ogDesc);
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
