/**
 * Real-browser verification of the coupled interaction constraints.
 * Run: node e2e-verify.mjs   (dev server must be up at :5173)
 */
import { chromium } from "playwright";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const data = require("./mock-data/photos.json");

const BASE = process.env.BASE_URL || "http://localhost:5173";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

// ---------------------------------------------------------------- A. routes
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const path of ["/", "/work", `/work/${data.series[0].id}`, "/about", "/contact"]) {
    const res = await page.goto(BASE + path);
    check(`route ${path} renders`, (await page.locator("header, .site-header").count()) > 0 && res?.status() === 200);
  }
  await page.close();
}

// ---------------------------------------------------------------- B. filter persistence + lightbox scope
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/work`);

  // filter to Pastoral
  await page.getByRole("button", { name: "Pastoral", exact: true }).click();
  const pastoralCount = data.photos.filter((p) => p.category === "pastoral").length;
  let cards = page.locator(".photo-card");
  check("pastoral filter shows 4 cards", (await cards.count()) === pastoralCount, `got ${await cards.count()}`);

  // open the series page from the inline link, then come BACK
  await page.getByRole("link", { name: /高原牧歌/ }).first().click();
  await page.waitForURL(/\/work\/highland-pastoral/);
  check("series page reached", /highland-pastoral/.test(page.url()));
  await page.getByRole("link", { name: /Back to Work/ }).click();
  await page.waitForURL(/\/work$/);
  const stillActive = await page.getByRole("button", { name: "Pastoral", exact: true }).getAttribute("aria-pressed");
  check("filter persists after returning from series", stillActive === "true", `pressed=${stillActive}`);
  cards = page.locator(".photo-card");
  check("grid still shows the filtered group on return", (await cards.count()) === pastoralCount, `got ${await cards.count()}`);

  // open lightbox and walk with arrows: must stay within the 4 pastoral photos
  await cards.first().click();
  await page.waitForSelector(".lightbox");
  const counter = async () => (await page.locator(".lightbox-info .counter").innerText()).trim();
  check("lightbox starts at 1/4", (await counter()) === "1 / 4", await counter());
  const seen = [];
  for (let i = 0; i < 4; i++) {
    seen.push((await page.locator(".lightbox-info h3").innerText()).trim());
    await page.keyboard.press("ArrowRight");
  }
  const pastoralTitles = data.photos.filter((p) => p.category === "pastoral").map((p) => p.title);
  check("arrow cycle covers exactly the pastoral set, wraps", JSON.stringify(seen) === JSON.stringify(pastoralTitles), seen.join(" | "));
  // the title after a full lap equals the first again
  check("next after wrap returns to the first photo", (await page.locator(".lightbox-info h3").innerText()).trim() === pastoralTitles[0]);
  // prev direction
  await page.keyboard.press("ArrowLeft");
  check("arrow-left moves backward within the set", (await page.locator(".lightbox-info h3").innerText()).trim() === pastoralTitles[3]);
  await page.keyboard.press("Escape");
  check("escape closes the lightbox", (await page.locator(".lightbox").count()) === 0);

  // on the series page itself, lightbox scope is the series (4 photos), and
  // opening plate index 2 starts at 2/4
  await page.goto(`${BASE}/work/highland-pastoral`);
  const seriesCards = page.locator(".photo-card");
  await seriesCards.nth(1).click();
  await page.waitForSelector(".lightbox");
  // card nth(1) is the third frame (cover is the hero, not a card)
  check("series lightbox opens at correct index", (await page.locator(".lightbox-info .counter").innerText()).trim() === "3 / 4");
  const startTitles = data.series.find((s) => s.id === "highland-pastoral").photoIds.map((id) => data.photos.find((p) => p.id === id).title);
  let titles = [];
  for (let i = 0; i < 4; i++) {
    titles.push((await page.locator(".lightbox-info h3").innerText()).trim());
    await page.keyboard.press("ArrowRight");
  }
  const rotated = [...startTitles.slice(2), ...startTitles.slice(0, 2)];
  check("series lightbox loops only within the series", JSON.stringify(titles) === JSON.stringify(rotated), titles.join(" | "));
  await page.close();
}

// ---------------------------------------------------------------- C. CLS: aspect-ratio placeholders before load
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // block image bytes so we inspect the pre-load state
  await page.route("**/*.jpg", (route) => route.abort());
  await page.goto(`${BASE}/work`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Portrait", exact: true }).click();
  await page.waitForTimeout(300);
  const frames = await page.locator(".photo-card .img-frame").evaluateAll((nodes) =>
    nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), ratio: r.width / r.height, ar: getComputedStyle(n).aspectRatio };
    })
  );
  const portrait = data.photos.filter((p) => p.category === "portrait");
  const ok = frames.every((f, i) => f.h > 100 && Math.abs(f.ratio - portrait[i].width / portrait[i].height) < 0.02);
  check("placeholders hold real aspect ratios before images load", ok, frames.map((f) => f.ratio.toFixed(2)).join(", "));
  // measure layout shift when images DO load
  await page.unrouteAll();
  await page.close();

  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.addInitScript(() => {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__cls = (window.__cls || 0) + e.value)).observe({ type: "layout-shift", buffered: true });
  });
  await page2.goto(`${BASE}/work`, { waitUntil: "networkidle" });
  await page2.waitForTimeout(800);
  const cls = await page2.evaluate(() => window.__cls || 0);
  check("cumulative layout shift while loading is ~0", cls < 0.01, `cls=${cls}`);
  await page2.close();
}

// ---------------------------------------------------------------- D. single data source
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const s of data.series) {
    await page.goto(`${BASE}/work/${s.id}`);
    const headings = await page.locator(".narrative h2, .series-hero-inner h1").allInnerTexts();
    const expected = [s.title, ...s.photoIds.slice(1).map((id) => data.photos.find((p) => p.id === id).title)];
    const every = expected.every((t) => headings.map((h) => h.trim()).includes(t));
    check(`series ${s.id} renders data-driven titles in order`, every, headings.join(" | "));
    // captions present (pull quotes or narrative text)
    const bodyText = await page.locator("main").innerText();
    const firstCaption = data.photos.find((p) => p.id === s.photoIds[1]).caption;
    check(`series ${s.id} shows a caption from the shared data`, bodyText.includes(firstCaption));
  }
  await page.close();
}

// ---------------------------------------------------------------- E. mobile: single column + bottom info
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/work`);
  await page.waitForTimeout(300);
  const cardRects = await page.locator(".photo-card").evaluateAll((nodes) =>
    nodes.slice(0, 4).map((n) => n.getBoundingClientRect())
  );
  const singleColumn = cardRects.slice(1).every((r, i) => Math.abs(r.left - cardRects[i].left) < 2);
  check("mobile grid collapses to a single column", singleColumn);
  const mobileCaptionVisible = await page.locator(".photo-card .mobile-caption").first().isVisible();
  check("mobile caption sits below the image", mobileCaptionVisible);

  await page.locator(".photo-card").first().click();
  await page.waitForSelector(".lightbox");
  const infoBox = page.locator(".lightbox-info");
  const ib = await infoBox.boundingBox();
  const vp = page.viewportSize();
  check("lightbox info is a bottom bar on mobile", ib.y + ib.height > vp.height - 220 && ib.width > vp.width - 60, `y=${Math.round(ib.y)} w=${Math.round(ib.width)}`);
  // arrows still navigate the scoped set on mobile
  await page.keyboard.press("ArrowRight");
  const counter = (await page.locator(".lightbox-info .counter").innerText()).trim();
  check("mobile arrow navigation works", /2 \//.test(counter), counter);
  await page.close();
}

// ---------------------------------------------------------------- F. fonts local only
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const extReqs = [];
  page.on("request", (r) => {
    const u = r.url();
    if (/fonts\.(googleapis|gstatic)\.com/.test(u)) extReqs.push(u);
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
  check("no external Google font requests", extReqs.length === 0, extReqs.join("; "));
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return Array.from(document.fonts).map((f) => ({ family: f.family, weight: f.weight, style: f.style, loaded: f.status }));
  });
  const hasPlayfair = fonts.some((f) => f.family.includes("Playfair"));
  const hasInter = fonts.some((f) => f.family.includes("Inter"));
  check("local Playfair + Inter fonts are registered", hasPlayfair && hasInter, JSON.stringify(fonts.map((f) => f.family)));
  await page.close();
}

// ---------------------------------------------------------------- G. contact form
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/contact`);
  const send = page.getByRole("button", { name: /send/i });
  check("submit disabled on empty form", (await send.isDisabled()) === true);

  await page.fill("#name", "  ");
  await page.fill("#email", "not-an-email");
  await page.fill("#message", "hi");
  await page.locator("#email").blur();
  await page.locator("#name").blur();
  await page.locator("#message").blur();
  check("inline error for blank name", (await page.locator("#name-error").count()) === 1);
  check("inline error for malformed email", (await page.locator("#email-error").count()) === 1);
  check("submit stays disabled while invalid", (await send.isDisabled()) === true);

  await page.fill("#name", "Tsering");
  await page.fill("#email", "tsering@example.com");
  check("submit enables once valid", (await send.isDisabled()) === false);
  await page.click("button.submit-btn");
  await page.waitForSelector(".form-success", { timeout: 5000 });
  const successText = await page.locator(".form-success").innerText();
  check("clear success screen after sending", /message sent/i.test(successText));
  await page.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
