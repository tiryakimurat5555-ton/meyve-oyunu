// Seviye akışını Chromium'da dener: liste, seviye kartı, oynayıp bitirme, ilerleme kaydı, özel parçalar ve birleşimler.
// Kullanım: bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/seviye-dene.cjs /tmp/meyve-web /tmp/meyve-ekran
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const W = path.resolve(process.argv[2] || '/tmp/meyve-web');
const O = process.argv[3] || '/tmp/meyve-ekran';
fs.mkdirSync(O, { recursive: true });

(async () => {
  const M = await import(path.resolve(__dirname, '../../oyun/mantik.js'));
  const b = await chromium.launch();
  const hatalar = [];
  const ac = async (hazirlik) => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const s = await c.newPage();
    s.on('pageerror', (e) => hatalar.push('PE ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
    s.on('console', (m) => m.type() === 'error' && hatalar.push('CE ' + m.text().slice(0, 300)));
    if (hazirlik) await s.addInitScript(hazirlik.f, hazirlik.a);
    await s.goto('file://' + W + '/index.html');
    await s.waitForTimeout(800);
    return s;
  };
  const tik = async (s, bas) => {
    const l = s.locator(`[aria-label^="${bas}"]`).first();
    if (!(await l.count())) return console.log('YOK:', bas), false;
    await l.click({ force: true });
    await s.waitForTimeout(300);
    return true;
  };
  const etiketler = async (s) => s.$$eval('[aria-label]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((x) => !/satır \d+\. sütun/.test(x)));

  // ---- 1) Liste ve seviye 1'i bitirme (oyun bilgisayar tarafından, ipucu hamlesiyle) ----
  const s = await ac({ f: () => { globalThis.__denemeTahta = { yalnizKanca: true }; }, a: null });
  await s.screenshot({ path: `${O}/s1-liste.png` });
  console.log('LİSTE:', (await etiketler(s)).slice(0, 8).join(' | '));
  await tik(s, 'Oyna');
  await s.screenshot({ path: `${O}/s2-giris.png` });
  console.log('GİRİŞ:', (await etiketler(s)).join(' | '));
  await tik(s, 'Başla');
  await s.waitForTimeout(400);
  await s.screenshot({ path: `${O}/s3-oyun.png` });
  console.log('OYUN:', (await etiketler(s)).join(' | '));
  for (let i = 0; i < 40; i++) {
    const d = await s.evaluate(() => globalThis.__denemeOyun && globalThis.__denemeOyun.durum());
    if (!d) break;
    if (await s.locator('[aria-label="Sonraki seviye"], [aria-label="Tekrar dene"]').count()) break;
    if (d.mesgul) { await s.waitForTimeout(150); continue; }
    const h = M.hamleBul(d.t, d.oz);
    if (!h) { await s.waitForTimeout(200); continue; }
    await s.evaluate((h) => globalThis.__denemeOyun.hamleYap(h[0], h[1]), h);
    await s.waitForTimeout(250);
  }
  await s.waitForTimeout(2500);
  await s.screenshot({ path: `${O}/s4-sonuc.png` });
  console.log('SONUÇ:', (await etiketler(s)).join(' | '));
  console.log('KAYIT:', await s.evaluate(() => localStorage.getItem('meyve-ilerleme-v1')));
  console.log('DUYURU:', (await s.evaluate(() => window.__duyurular.slice(-3))).join(' // '));
  await tik(s, 'Seviyeler');
  console.log('LİSTE2:', (await etiketler(s)).slice(0, 6).join(' | '));

  // ---- 2) Özel parçalar ve birleşimler (seviye 9, hazır tahta) ----
  M.turSayisiAyarla(6);
  const tur = M.yeniTahta();
  const oz = tur.map((r) => r.map(() => null));
  tur[3][3] = M.GOKKUSAGI; oz[3][3] = 'gokkusagi'; oz[3][4] = 'satir';
  oz[5][2] = 'bomba'; oz[5][3] = 'bomba';
  oz[1][1] = 'sutun'; oz[1][2] = 'satir';
  oz[7][6] = 'satir';
  const v = await ac({
    f: (a) => {
      globalThis.__denemeTahta = a.tahta;
      { const d = new Date(); localStorage.setItem('meyve-ilerleme-v1', JSON.stringify({ acik: 10, yildiz: { 1: 3, 2: 2 }, enIyi: {}, gunluk: { son: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), seri: 1 } })); }
      window.__voiceover = true;
    },
    a: { tahta: { tur, oz } },
  });
  await v.screenshot({ path: `${O}/s5-liste-acik.png` });
  await tik(v, 'Seviye 9');
  await tik(v, 'Başla');
  await v.waitForTimeout(400);
  await v.screenshot({ path: `${O}/s6-ozeller.png` });
  const hucre = await v.$$eval('[aria-label*=". sütun"]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((x) => /Gökkuşağı|temizler|bomba/.test(x)));
  console.log('ÖZEL ETİKETLER:', hucre.join(' | '));
  const dene = async (ad, a, bb) => {
    const once = await v.evaluate(() => globalThis.__denemeOyun.durum());
    await v.evaluate(([a, b]) => globalThis.__denemeOyun.hamleYap(a, b), [a, bb]);
    for (let i = 0; i < 40; i++) {
      await v.waitForTimeout(150);
      const d = await v.evaluate(() => globalThis.__denemeOyun.durum());
      if (!d.mesgul) break;
    }
    const d = await v.evaluate(() => globalThis.__denemeOyun.durum());
    const ozSay = d.oz.flat().filter(Boolean).length;
    console.log(`${ad}: puan ${once.puan}→${d.puan}, hamle ${once.hamle}→${d.hamle}, kalan özel ${ozSay}, boş hücre ${d.t.flat().filter((x) => x < 0).length}`);
  };
  await dene('Çizgili+çizgili (artı)', [1, 1], [1, 2]);
  await dene('Bomba+bomba', [5, 2], [5, 3]);
  // gökkuşağı yeri değişmiş olabilir: bul
  let d = await v.evaluate(() => globalThis.__denemeOyun.durum());
  let g = null;
  d.oz.forEach((r, i) => r.forEach((o, j) => o === 'gokkusagi' && (g = [i, j])));
  if (g) await dene('Gökkuşağı+komşu', g, g[1] < 7 ? [g[0], g[1] + 1] : [g[0], g[1] - 1]);
  else console.log('gökkuşağı önceki patlamalarda tetiklendi');
  console.log('VO DUYURU:', (await v.evaluate(() => window.__duyurular.slice(-4))).join(' // '));
  await v.screenshot({ path: `${O}/s7-sonra.png` });

  console.log(hatalar.length ? 'HATALAR:\n' + hatalar.slice(0, 10).join('\n') : 'Sayfa hatası yok');
  await b.close();
})();
