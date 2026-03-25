#!/usr/bin/env node
/**
 * Bloom Visual QA — Automated Page Screenshot Capture
 * Uses Playwright to screenshot every page in the built app.
 * Discovers routes dynamically from the file system.
 *
 * Usage: node scripts/screenshot-pages.js [--port 3000] [--output docs/screenshots]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const PORT = args.includes('--port') ? args[args.indexOf('--port') + 1] : '3000';
const OUTPUT_DIR = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'docs/screenshots';
const BASE_URL = `http://localhost:${PORT}`;

// Discover routes from the filesystem
function discoverRoutes(appDir) {
    const routes = [];

    function walk(dir, prefix) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
            if (entry.name === 'api') continue; // Skip API routes
            if (entry.name === 'layout.tsx' || entry.name === 'loading.tsx' || entry.name === 'error.tsx') continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Route groups like (auth) — don't add to URL path
                const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
                const nextPrefix = isGroup ? prefix : `${prefix}/${entry.name}`;
                walk(fullPath, nextPrefix);
            } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
                routes.push(prefix || '/');
            }
        }
    }

    walk(appDir, '');
    return [...new Set(routes)].sort();
}

async function screenshotPages() {
    const appDir = path.resolve(process.cwd(), 'web/app');
    const routes = discoverRoutes(appDir);

    console.log(`Found ${routes.length} routes to screenshot:`);
    routes.forEach(r => console.log(`  ${r}`));

    // Ensure output directory exists
    fs.mkdirSync(path.resolve(process.cwd(), OUTPUT_DIR), { recursive: true });

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        colorScheme: 'dark', // Match our dark theme
    });

    const results = [];

    for (const route of routes) {
        const page = await context.newPage();
        const safeName = route === '/' ? 'landing' : route.replace(/\//g, '-').replace(/^-/, '');
        const filename = `${safeName}.png`;
        const filepath = path.resolve(process.cwd(), OUTPUT_DIR, filename);

        try {
            console.log(`  Screenshotting ${route}...`);
            await page.goto(`${BASE_URL}${route}`, {
                waitUntil: 'networkidle',
                timeout: 15000,
            });

            // Scroll through the page to trigger scroll-reveal animations
            await page.evaluate(async () => {
                const delay = (ms) => new Promise(r => setTimeout(r, ms));
                const height = document.body.scrollHeight;
                const step = window.innerHeight * 0.7;
                for (let y = 0; y < height; y += step) {
                    window.scrollTo(0, y);
                    await delay(200);
                }
                // Scroll back to top for consistent capture
                window.scrollTo(0, 0);
            });

            // Wait for all scroll-triggered animations to settle
            await page.waitForTimeout(1500);

            // Full page screenshot
            await page.screenshot({
                path: filepath,
                fullPage: true,
            });

            // Also capture console errors
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });

            results.push({
                route,
                filename,
                status: 'ok',
                errors: errors.length > 0 ? errors : null,
            });

            console.log(`    ✅ ${filename}`);
        } catch (err) {
            console.log(`    ❌ ${route}: ${err.message}`);
            results.push({
                route,
                filename,
                status: 'error',
                error: err.message,
            });
        }

        await page.close();
    }

    await browser.close();

    // Write manifest
    const manifest = {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        screenshotDir: OUTPUT_DIR,
        pages: results,
    };

    fs.writeFileSync(
        path.resolve(process.cwd(), OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log(`\nDone: ${results.filter(r => r.status === 'ok').length}/${routes.length} pages captured`);
    console.log(`Screenshots: ${OUTPUT_DIR}/`);

    return results;
}

screenshotPages().catch(err => {
    console.error('Screenshot capture failed:', err);
    process.exit(1);
});
