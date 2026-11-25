// Buz ve kasa: seviye 20'yi Chromium'da oynatır (bilgisayar hamle seçer), kilitli takası dener, ekran görüntüsü alır.
// Kullanım: bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/engel-dene.cjs /tmp/meyve-web /tmp/meyve-ekran
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const W = path.resolve(process.argv[2] || '/tmp/meyve-web');
const O = process.argv[3] || '/tmp/meyve-ekran';
fs.mkdirSync(O, { recursive: true });
(async () => {
  const M = await import(path.resolve(__dirname, '../../oyun/mantik.js'));
  const S = await import(path.resolve(__dirname, '../../oyun/seviyeler.js'));
  const sv = S.SEVIYELER.find((s) => s.no === Number(process.env.NO || 20));
  M.turSayisiAyarla(sv.tur);
  const tahta = M.duzenliTahta(sv.duzen);
  const b = await chromium.launch();
  const s = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const h = [];
  s.on('pageerror', (e) => h.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  await s.addInitScript((a) => {
    globalThis.__denemeTahta = a.tahta;
    localStorage.setItem('meyve-ilerleme-v1', JSON.stringify({ acik: 30, yildiz: {}, enIyi: {} }));
    if (a.vo) window.__voiceover = true;
  }, { tahta: { tur: tahta.t, oz: tahta.oz, engel: tahta.engel }, vo: !!process.env.VO });
  await s.goto('file://' + W + '/index.html');
  await s.waitForTimeout(700);
  await s.screenshot({ path: `${O}/e0-liste.png`, fullPage: true });
  await s.locator(`[aria-label^="Seviye ${sv.no}"]`).first().click({ force: true });
  await s.waitForTimeout(300);
  await s.screenshot({ path: `${O}/e1-giris.png` });
  await s.locator('[aria-label="Başla"]').click({ force: true });
  await s.waitForTimeout(500);
  await s.screenshot({ path: `${O}/e2-tahta.png` });
  const etiket = async () => s.$$eval('[aria-label]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((x) => /Hedef|hamle kaldı/.test(x)));
  console.log('BAŞ:', (await etiket()).join(' | '));
  if (process.env.VO) console.log('VO ÖRNEK:', (await s.$$eval('[aria-label*=". sütun"]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((x) => /Buzlu|asa/.test(x)).slice(0, 6))).join(' | '));
  // Kilitli takas denemesi
  let d = await s.evaluate(() => globalThis.__denemeOyun.durum());
  let buzH = null;
  d.engel.forEach((r, i) => r.forEach((e, j) => e === 'buz' && !buzH && (buzH = [i, j])));
  if (buzH) {
    await s.evaluate((a) => globalThis.__denemeOyun.hamleYap(a, [a[0], a[1] + 1 < 8 ? a[1] + 1 : a[1] - 1]), buzH);
    await s.waitForTimeout(400);
    const d2 = await s.evaluate(() => globalThis.__denemeOyun.durum());
    console.log('Buzlu takas reddedildi mi:', d2.hamle === d.hamle ? 'EVET' : 'HAYIR (hamle düştü!)');
  }
  for (let i = 0; i < 60; i++) {
    if (await s.locator('[aria-label="Sonraki seviye"], [aria-label="Tekrar dene"]').count()) break;
    d = await s.evaluate(() => globalThis.__denemeOyun.durum());
    if (d.mesgul) { await s.waitForTimeout(150); continue; }
    const kilit = d.engel.map((r) => r.map((e) => e != null));
    // En alttaki hamleyi seç (kasalar dipte)
    let hm = null;
    for (let r = 7; r >= 0 && !hm; r--)
      for (let c = 0; c < 8 && !hm; c++)
        for (const bb of [[r, c + 1], [r - 1, c]]) {
          if (hm || bb[0] < 0 || bb[1] > 7 || kilit[r][c] || kilit[bb[0]][bb[1]] || d.t[r][c] === M.KASA || d.t[bb[0]][bb[1]] === M.KASA) continue;
          if (M.birlesim(d.t, d.oz, [r, c], bb) || M.eslesmeleriBul(M.takasla(d.t, [r, c], bb)).length) hm = [[r, c], bb];
        }
    if (!hm) { await s.waitForTimeout(200); continue; }
    await s.evaluate((x) => globalThis.__denemeOyun.hamleYap(x[0], x[1]), hm);
    await s.waitForTimeout(200);
    if (i === 3) await s.screenshot({ path: `${O}/e3-ara.png` });
  }
  await s.waitForTimeout(2500);
  d = await s.evaluate(() => globalThis.__denemeOyun.durum());
  console.log('SON:', (await etiket()).join(' | '), '| toplanan', JSON.stringify(d.toplanan));
  console.log('SONUÇ KARTI:', (await s.$$eval('[aria-label]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((x) => /yıldız|Sonraki|Tekrar/.test(x)))).join(' | '));
  if (process.env.VO) console.log('DUYURU:', (await s.evaluate(() => window.__duyurular.slice(-3))).join(' // '));
  await s.screenshot({ path: `${O}/e4-son.png` });
  console.log(h.length ? 'HATALAR: ' + h.slice(0, 5).join('\n') : 'Sayfa hatası yok');
  await b.close();
})();
