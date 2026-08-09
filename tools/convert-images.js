/**
 * One-off asset conversion: PNG/JPG -> WebP, plus a correctly sized social preview.
 *
 * The gallery screenshots and concept art were shipped as full-size PNGs totalling ~5.5 MB,
 * on a landing page whose entire job is a fast first impression. WebP at q82 is visually
 * indistinguishable for this material and cuts the payload by roughly 80%.
 *
 * Social crawlers are the one place WebP is still not universally safe, so og:image gets a
 * dedicated JPEG at 1200x630 - the size Open Graph actually wants, rather than a 720 KB
 * portrait PNG that every scraper had to downscale itself.
 *
 * Run from the repo root:  node tools/convert-images.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const QUALITY = 82;
const OG_SOURCE = 'mockup_1.png';
const OG_OUTPUT = 'og-image.jpg';

async function main() {
    // OG_OUTPUT is deliberately a JPEG and must survive re-runs.
    const files = fs
        .readdirSync(root)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f) && f !== OG_OUTPUT);
    if (files.length === 0) {
        console.log('No PNG/JPG left to convert - already done.');
    }

    let before = 0;
    let after = 0;

    for (const file of files) {
        const src = path.join(root, file);
        const out = path.join(root, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));

        const srcSize = fs.statSync(src).size;
        await sharp(src).webp({ quality: QUALITY }).toFile(out);
        const outSize = fs.statSync(out).size;

        before += srcSize;
        after += outSize;

        const saved = (100 - (outSize / srcSize) * 100).toFixed(0);
        console.log(
            `${file.padEnd(28)} ${kb(srcSize).padStart(8)} -> ${kb(outSize).padStart(8)}  (-${saved}%)`
        );

        fs.unlinkSync(src);
    }

    // Social preview, generated from the original before it is discarded above - so this must
    // run against the .webp we just produced if the PNG is already gone.
    const ogSource = fs.existsSync(path.join(root, OG_SOURCE))
        ? path.join(root, OG_SOURCE)
        : path.join(root, OG_SOURCE.replace(/\.png$/, '.webp'));

    if (fs.existsSync(ogSource)) {
        await sharp(ogSource)
            .resize(1200, 630, { fit: 'contain', background: '#0A0A0A' })
            .jpeg({ quality: 85 })
            .toFile(path.join(root, OG_OUTPUT));
        console.log(`\nGenerated ${OG_OUTPUT} (1200x630) for og:image.`);
    }

    if (before > 0) {
        console.log(`\nTotal: ${kb(before)} -> ${kb(after)}  (-${(100 - (after / before) * 100).toFixed(0)}%)`);
    }
}

function kb(bytes) {
    return `${Math.round(bytes / 1024)} KB`;
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
