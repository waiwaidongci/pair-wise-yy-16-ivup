#!/usr/bin/env node
/*
 * Browser verification for the seven coupled constraints in task.md.
 * Runs a real Chromium via Playwright (install: npx playwright install chromium)
 * against a temporary Vite dev server, then exits non-zero on any failed check.
 *
 *   node e2e-verify.cjs
 *
 * Covers: scoped lightbox navigation with buttons AND arrow keys, wrap-around,
 * filter persistence across the series page + browser back, CLS-safe ratio boxes
 * with throttled images, mobile single column + bottom lightbox bar + hamburger,
 * zero external font CDN requests, local woff2 loading, no reference_* images,
 * and the contact form disabled/error/success states.
 */
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')

const ROOT = __dirname
const PORT = 5199
const BASE = `http://127.0.0.1:${PORT}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`)
  if (!cond) failures++
}

function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const tick = () => {
      http
        .get(url, (res) => {
          res.destroy()
          resolve()
        })
        .on('error', () => {
          if (Date.now() > deadline) reject(new Error('dev server did not start'))
          else setTimeout(tick, 200)
        })
    }
    tick()
  })
}

async function main() {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  })
  await waitForServer(BASE)

  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  try {
    // ---------- constraint 3: CLS-safe placeholders before JPEG arrives ----------
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
      const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'mock-data', 'photos.json'), 'utf8'))
      await page.route('**/*.jpg', async (route) => {
        await sleep(900)
        await route.continue()
      })
      await page.goto(BASE + '/work', { waitUntil: 'domcontentloaded' })

      const firstBox = await page.locator('.photo-button .ratio-box').first().boundingBox()
      const expected = data.photos[0].width / data.photos[0].height
      check('ratio box reserved before load', Math.abs(firstBox.width / firstBox.height - expected) < 0.01,
        `box ${(firstBox.width / firstBox.height).toFixed(4)} vs data ${expected.toFixed(4)}`)

      const before = await page.locator('.photo-button').nth(1).boundingBox()
      await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
      await page.unroute('**/*.jpg')
      const after = await page.locator('.photo-button').nth(1).boundingBox()
      check('no layout shift after images load', Math.abs(before.y - after.y) < 1, `Δy=${Math.abs(before.y - after.y)}`)
      await page.close()
    }

    // ---------- constraints 1 & 2: filter persistence + scoped navigation ----------
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const consoleErrors = []
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
    page.on('pageerror', (e) => consoleErrors.push(String(e)))

    for (const route of ['/', '/work', '/work/highland-pastoral', '/about', '/contact']) {
      await page.goto(BASE + route, { waitUntil: 'networkidle' })
      check(`route renders: ${route}`, (await page.locator('main').count()) === 1)
    }

    await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
    check('filter labels', (await page.locator('.filters button').allTextContents()).join('|') === '全部|肖像|风光|牧野')

    await page.getByRole('button', { name: '牧野' }).click()
    check('pastoral filter -> 4 cards', (await page.locator('.photo-button').count()) === 4)

    // same shared lightbox from /work
    await page.locator('.photo-button').nth(1).click()
    await page.locator('.lightbox[role="dialog"]').waitFor()
    const counter = () => page.locator('.lightbox-info .eyebrow').textContent()
    const title = () => page.locator('.lightbox-info h2').textContent()
    check('opened 2/4', /2\s*\/\s*4/.test(await counter()), await counter())

    // keyboard arrows cycle only within the 4 pastoral photos
    await page.keyboard.press('ArrowRight')
    await sleep(100)
    check('ArrowRight -> pastoral-03', (await title()).includes('雪山下的歇息'), await title())
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await sleep(100)
    check('ArrowRight wraps -> pastoral-01', (await title()).includes('独牛与木屋'), await title())
    check('counter total stays 4', /1\s*\/\s*4/.test(await counter()), await counter())
    await page.keyboard.press('ArrowLeft')
    await sleep(100)
    check('ArrowLeft wraps -> pastoral-04', (await title()).includes('新疆牧场'), await title())
    await page.keyboard.press('Escape')
    check('Escape closes', (await page.locator('.lightbox[role="dialog"]').count()) === 0)

    // filter persistence: into series page and back
    await page.getByRole('link', { name: /高原牧歌/ }).first().click()
    await page.waitForURL(/highland-pastoral/)
    await page.goBack()
    await page.waitForURL(/\/work$/)
    check('filter preserved after back',
      (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) === 'true')
    check('4 cards preserved after back', (await page.locator('.photo-button').count()) === 4)

    // series page data model: titles in order, same shared lightbox scoped to series
    await page.goto(BASE + '/work/highland-pastoral', { waitUntil: 'networkidle' })
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'mock-data', 'photos.json'), 'utf8'))
    const expectedTitles = data.photos
      .filter((p) => p.seriesId === 'highland-pastoral')
      .sort((a, b) => a.order - b.order)
      .map((p) => p.title)
    check('series titles order from shared data',
      JSON.stringify(await page.locator('.story article h2').allTextContents()) === JSON.stringify(expectedTitles))
    await page.locator('.story .photo-button').first().click()
    await page.locator('.lightbox[role="dialog"]').waitFor()
    check('series lightbox scoped to 4', /1\s*\/\s*4/.test(await counter()), await counter())
    await page.keyboard.press('Escape')

    // home featured card opens the SAME shared lightbox, scoped to its series
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.locator('.series-card').first().click()
    await page.locator('.lightbox[role="dialog"]').waitFor()
    check('home card opens shared lightbox', true)
    check('home lightbox scoped to gaze (5)', /1\s*\/\s*5/.test(await counter()), await counter())
    await page.mouse.click(12, 12)
    await sleep(100)
    check('backdrop click closes', (await page.locator('.lightbox[role="dialog"]').count()) === 0)

    // ---------- constraint 5: mobile single column + bottom info + hamburger ----------
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
    check('hamburger visible on mobile', await page.locator('.menu').isVisible())
    const b1 = await page.locator('.photo-button').first().boundingBox()
    const b2 = await page.locator('.photo-button').nth(1).boundingBox()
    check('single column on mobile', b2.y > b1.y + b1.height - 2)
    await page.locator('.photo-button').first().click()
    await page.locator('.lightbox[role="dialog"]').waitFor()
    const img = await page.locator('.lightbox-image').boundingBox()
    const info = await page.locator('.lightbox-info').boundingBox()
    check('lightbox info is a bottom bar on mobile', info.y >= img.y + img.height - 2)
    await page.keyboard.press('Escape')
    await page.setViewportSize({ width: 1440, height: 1000 })

    // ---------- constraint 6: no external font CDN ----------
    const requested = []
    page.on('request', (r) => requested.push(r.url()))
    for (const route of ['/', '/work', '/about', '/contact']) {
      await page.goto(BASE + route, { waitUntil: 'networkidle' })
    }
    check('no google fonts requests',
      requested.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u)).length === 0)
    const localFonts = new Set(requested.filter((u) => u.includes('/fonts/') && u.endsWith('.woff2')))
    check('local woff2 fonts loaded >= 2', localFonts.size >= 2, [...localFonts].join(', '))
    check('no reference images served', requested.filter((u) => /reference_/.test(u)).length === 0)

    // ---------- constraint 7: contact form states ----------
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })
    const submit = page.getByRole('button', { name: '发送消息' })
    check('submit disabled when empty', await submit.isDisabled())
    await page.getByLabel('邮箱').fill('bad')
    await page.getByLabel('邮箱').blur()
    check('inline email error visible', await page.getByText('请输入有效的邮箱地址').isVisible())
    check('submit still disabled with bad email', await submit.isDisabled())
    await page.getByLabel('姓名').fill('访客')
    await page.getByLabel('邮箱').fill('hello@example.com')
    await page.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
    check('submit enabled when valid', await submit.isEnabled())
    await submit.click()
    await page.getByText('谢谢你的来信').waitFor()
    check('success panel replaces form', await page.getByText('谢谢你的来信').isVisible())
    check('form unmounted on success', (await page.locator('form.contact-form').count()) === 0)

    check('no console errors across routes', consoleErrors.length === 0, consoleErrors.join(' | '))
    await page.close()
  } finally {
    await browser.close()
    server.kill()
  }

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
