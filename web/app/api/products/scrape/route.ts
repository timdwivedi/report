import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import type { ScrapedProductData } from '@/lib/types/app';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Aggressively clean HTML to extract only product-relevant content.
 * Browser-captured outerHTML contains massive junk: cookie consent SDKs,
 * ad-blocker CSS rules, tracking scripts, Chrome extension injections, etc.
 */
function cleanHtml(html: string): string {
  let h = html;

  // 1. Remove entire tag blocks that never contain product data
  h = h.replace(/<script[\s\S]*?<\/script>/gi, '');
  h = h.replace(/<style[\s\S]*?<\/style>/gi, '');
  h = h.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  h = h.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  h = h.replace(/<header[\s\S]*?<\/header>/gi, '');
  h = h.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  h = h.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  h = h.replace(/<link[^>]*>/gi, '');

  // 1b. Strip hidden JSON data blocks (e.g. S&S #cItems with relative image paths — confuses AI)
  h = h.replace(/<div[^>]*id="[^"]*items[^"]*"[^>]*class="[^"]*hidden[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  h = h.replace(/<div[^>]*class="[^"]*hidden[^"]*"[^>]*id="[^"]*items[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 1c. Strip "comparable/related styles" sections (contain OTHER products' images)
  h = h.replace(/<div[^>]*id="[^"]*[Cc]omparable[^"]*"[^>]*>[\s\S]*$/gi, '');

  // 1d. Strip ASP.NET hidden fields (massive ViewState blobs)
  h = h.replace(/<input[^>]*type="hidden"[^>]*>/gi, '');

  // 2. Remove all style="" attributes (massive inline CSS from cookie banners etc.)
  h = h.replace(/\s+style="[^"]*"/gi, '');
  h = h.replace(/\s+style='[^']*'/gi, '');

  // 3. Remove data-* attributes (tracking, analytics)
  h = h.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');
  h = h.replace(/\s+data-[a-z-]+='[^']*'/gi, '');

  // 4. Remove class attributes (we don't need CSS classes for extraction)
  h = h.replace(/\s+class="[^"]*"/gi, '');
  h = h.replace(/\s+class='[^']*'/gi, '');

  // 5. Remove common cookie/tracking/overlay containers by ID patterns
  h = h.replace(/<div[^>]*id="onetrust[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  h = h.replace(/<div[^>]*id="ot-sdk[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 6. Remove empty tags and collapse whitespace
  h = h.replace(/<[a-z][^>]*>\s*<\/[a-z]+>/gi, '');
  h = h.replace(/\s{2,}/g, ' ');
  h = h.replace(/>\s+</g, '><');

  // 7. Cap at 80K chars (after aggressive cleaning, product data should be well within this)
  return h.substring(0, 80000);
}

/**
 * Pre-extract product image URLs from raw HTML before AI processing.
 * Only extracts from the MAIN product area — strips comparable/related sections first.
 * Returns deduplicated list of medium-resolution product images (max 8 hero shots).
 */
function extractImagesFromHtml(html: string): string[] {
  // Strip everything after comparable/related/companion product sections
  // These contain OTHER products' images that would pollute our extraction
  let h = html;
  h = h.replace(/<div[^>]*id="[^"]*[Cc]omparable[^"]*"[^>]*>[\s\S]*$/gi, '');
  h = h.replace(/<h2[^>]*>.*?(?:Comparable|Related|Companion|Similar|You May Also).*?<\/h2>[\s\S]*$/gi, '');
  h = h.replace(/<div[^>]*class="[^"]*(?:comparable|related|companion|similar|also-like)[^"]*"[^>]*>[\s\S]*$/gi, '');

  const images = new Set<string>();

  // Match absolute image URLs from <img src>, <a href>, and data-image attributes
  const patterns = [
    /src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    /href=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    /data-image=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(h)) !== null) {
      const url = match[1];
      // Skip tiny thumbnails (_fs = small), icons, logos, swatch images, UI elements
      if (url.includes('_fs.') || url.includes('/icons/') || url.includes('/logos/') ||
          url.includes('ColorSwatch') || url.includes('Empty.png') ||
          url.includes('slider-') || url.includes('search-') ||
          url.includes('Video-Btn') || url.includes('banner')) continue;
      images.add(url);
    }
  }

  // Deduplicate: if we have both _fm and _fl versions, keep _fm (good quality, smaller)
  const result = [...images];
  const fmUrls = new Set(result.filter(u => u.includes('_fm.')));
  const deduped = result.filter(u => {
    if (u.includes('_fl.')) {
      const fmVersion = u.replace('_fl.', '_fm.');
      if (fmUrls.has(fmVersion)) return false;
    }
    return true;
  });

  // Cap at 8 images — hero gallery only, not every angle/color variant
  return deduped.slice(0, 8);
}

/** Try to pull the page URL from canonical link or og:url in the HTML */
function extractUrlFromHtml(html: string): string {
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonical?.[1]) return canonical[1];

  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  if (ogUrl?.[1]) return ogUrl[1];

  return '';
}

function buildExtractionPrompt(url: string, html: string, preExtractedImages: string[]): string {
  const urlContext = url
    ? `The source URL is: ${url}\n\n`
    : '';

  const imageContext = preExtractedImages.length > 0
    ? `\nPre-extracted product images (verified absolute URLs — use these in the "images" array):\n${preExtractedImages.map(u => `  - ${u}`).join('\n')}\n`
    : '';

  return `You are a product data extraction engine for a promotional products / branded merchandise company.

Given the cleaned HTML of a supplier product page, extract ALL product information into structured JSON.

${urlContext}${imageContext}
IMPORTANT RULES:
- Extract ALL available colors with their names and hex codes (guess hex if not explicit)
- Extract ALL available sizes
- For images: ONLY use full absolute URLs starting with https://. If pre-extracted images are provided above, use those. Never use relative paths or partial URLs.
- For "description": rewrite the raw product description into clean, professional marketing copy (2-3 sentences)
- For "original_description": keep the raw/technical description as-is from the page
- Extract the supplier/brand name and SKU/style number
- If you find pricing (MSRP, retail, unit cost), include it as msrp
- For specs: extract material, weight, fit, construction details, compliance info, etc.

Return ONLY valid JSON matching this structure:
{
  "source_url": "${url || ''}",
  "product_name": "Full product name with brand",
  "description": "Clean marketing description (2-3 sentences)",
  "original_description": "Raw technical description from the page",
  "images": ["https://full-url-to-image-1.jpg"],
  "colors": [{"name": "Color Name", "hex": "#000000"}],
  "sizes": ["S", "M", "L", "XL"],
  "specs": {"Material": "...", "Weight": "...", "Fit": "..."},
  "supplier_name": "Brand or Supplier",
  "supplier_sku": "SKU or Style Number",
  "msrp": 0.00
}

If msrp is not found, omit it.

Here is the HTML:

${html}`;
}

async function extractWithGemini(prompt: string): Promise<ScrapedProductData> {
  console.log(`[scrape] Sending ${(prompt.length / 1024).toFixed(0)}KB prompt to Gemini`);

  const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('[scrape] Gemini API error:', errText.substring(0, 500));
    throw new Error('AI extraction failed');
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  const finishReason = geminiData?.candidates?.[0]?.finishReason;

  console.log(`[scrape] Gemini finish: ${finishReason}, response: ${rawText ? rawText.length : 0} chars`);

  if (!rawText) {
    const blockReason = geminiData?.promptFeedback?.blockReason;
    console.error('[scrape] Empty response. Block reason:', blockReason, 'Full:', JSON.stringify(geminiData).substring(0, 500));
    throw new Error(blockReason ? `AI blocked: ${blockReason}` : 'AI returned empty response');
  }

  // Strip markdown code fences if present
  const jsonStr = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const extracted: ScrapedProductData = JSON.parse(jsonStr);

    // Ensure arrays exist
    if (!Array.isArray(extracted.images)) extracted.images = [];
    if (!Array.isArray(extracted.colors)) extracted.colors = [];
    if (!Array.isArray(extracted.sizes)) extracted.sizes = [];
    if (!extracted.specs) extracted.specs = {};

    return extracted;
  } catch (parseErr) {
    console.error('[scrape] JSON parse failed. Raw response (first 500):', jsonStr.substring(0, 500));
    console.error('[scrape] Raw response (last 200):', jsonStr.substring(jsonStr.length - 200));
    throw parseErr;
  }
}

/**
 * POST /api/products/scrape
 *
 * Accepts: { html: "..." }  — pasted page source (primary flow)
 * Optional: { html: "...", url: "https://..." } — URL for reference/image resolution
 */
export async function POST(request: NextRequest) {
  let body: { url?: string; html?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { html: pastedHtml } = body;
  let { url } = body;

  if (!pastedHtml || typeof pastedHtml !== 'string' || pastedHtml.length < 100) {
    return jsonError('Paste the page source (HTML) to extract product data.', 400);
  }

  if (!GEMINI_API_KEY) {
    return jsonError('AI extraction not configured. Set GEMINI_API_KEY.', 500);
  }

  try {
    // Extract URL and images before cleaning (cleaning removes <link> and <img> tags' context)
    if (!url) {
      url = extractUrlFromHtml(pastedHtml);
    }
    const preExtractedImages = extractImagesFromHtml(pastedHtml);
    console.log(`[scrape] Pre-extracted ${preExtractedImages.length} product images from HTML`);

    const html = cleanHtml(pastedHtml);
    console.log(`[scrape] Raw: ${(pastedHtml.length / 1024).toFixed(0)}KB → Cleaned: ${(html.length / 1024).toFixed(0)}KB`);

    if (html.length < 200) {
      return jsonError('Page source is too short — try copying the full page source.', 422);
    }

    const prompt = buildExtractionPrompt(url || '', html, preExtractedImages);
    const extracted = await extractWithGemini(prompt);
    if (url) extracted.source_url = url;

    // If Gemini returned no images or only broken relative URLs, use pre-extracted ones
    const hasValidImages = extracted.images.some(img => img.startsWith('https://'));
    if (!hasValidImages && preExtractedImages.length > 0) {
      console.log(`[scrape] Gemini returned no valid images, using ${preExtractedImages.length} pre-extracted`);
      extracted.images = preExtractedImages;
    }

    // Resolve any remaining relative image URLs to absolute
    const baseUrl = extracted.source_url || url;
    if (baseUrl) {
      try {
        const origin = new URL(baseUrl).origin;
        extracted.images = extracted.images.map(imgUrl => {
          if (imgUrl.startsWith('//')) return `https:${imgUrl}`;
          if (imgUrl.startsWith('/')) return `${origin}${imgUrl}`;
          if (!imgUrl.startsWith('http')) return `${origin}/${imgUrl}`;
          return imgUrl;
        });
      } catch { /* URL parse failed, leave images as-is */ }
    }

    return jsonOk(extracted);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scrape] Live scrape failed:', message);

    if (message === 'AI extraction failed' || message.startsWith('AI blocked:') || message === 'AI returned empty response') {
      return jsonError(message + '. Try again.', 502);
    }

    if (message.includes('Unexpected token') || message.includes('JSON')) {
      return jsonError('AI returned malformed data. Try again.', 422);
    }

    return jsonError(`Scrape failed: ${message}`, 500);
  }
}
