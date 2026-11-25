// Meyve oyununu Chromium'da dener: açılış, kaydırarak hamleler, VoiceOver kipi.
// Kullanım: bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/dene.cjs /tmp/meyve-web /tmp/meyve-ekran
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const W = path.resolve(process.argv[2] || '/tmp/meyve-web');
const O = process.argv[3] || '/tmp/meyve-ekran';
fs.mkdirSync(O, { recursive: true });

(async () => {
  const b = await chromium.launch();
  const hatalar = [];
  const sayfa = async (vo) => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const s = await c.newPage();
    s.on('pageerror', (e) => hatalar.push('PE ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
    s.on('console', (m) => m.type() === 'error' && hatalar.push('CE ' + m.text().slice(0, 300)));
    if (vo) await s.addInitScript(() => (window.__voiceover = true));
    await s.goto('file://' + W + '/index.html');
    await s.waitForTimeout(1500);
    return s;
  };

  // --- Görerek oynama ---
  const s = await sayfa(false);
  await s.screenshot({ path: `${O}/1-acilis.png` });
  const puanOku = async () => s.$eval('[aria-label^="Puan "]', (e) => e.getAttribute('aria-label'));
  const hamleOku = async () => s.$eval('[aria-label$="hamle kaldı"]', (e) => e.getAttribute('aria-label'));
  console.log('Açılış:', await puanOku(), '|', await hamleOku());

  // Tahtanın yeri: meyve resimlerinin kapsadığı alan
  const kutu = await s.$$eval('img', (im) => {
    const r = im.map((i) => i.getBoundingClientRect()).filter((r) => r.width > 10);
    return { x: Math.min(...r.map((q) => q.left)), y: Math.min(...r.map((q) => q.top)), w: Math.max(...r.map((q) => q.right)) - Math.min(...r.map((q) => q.left)) };
  });
  const H = kutu.w / 8;
  const tx = kutu.x - H * 0.05;
  const ty = kutu.y - H * 0.05;
  console.log('Tahta:', JSON.stringify(kutu), 'hücre', H.toFixed(1));
  const surukle = async (r, c, dr, dc) => {
    const x = tx + c * H + H / 2;
    const y = ty + r * H + H / 2;
    await s.mouse.move(x, y);
    await s.mouse.down();
    await s.mouse.move(x + dc * H * 0.6, y + dr * H * 0.6, { steps: 4 });
    await s.mouse.up();
    await s.waitForTimeout(120);
  };
  let basarili = 0;
  let deneme = 0;
  for (let r = 0; r < 8 && basarili < 6; r++) {
    for (let c = 0; c < 8 && basarili < 6; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr > 7 || c + dc > 7) continue;
        const once = await hamleOku();
        await surukle(r, c, dr, dc);
        deneme++;
        const sonra = await hamleOku();
        if (once !== sonra) {
          basarili++;
          console.log(`Hamle (${r},${c})→(${r + dr},${c + dc}):`, await puanOku(), '|', sonra);
          if (basarili === 1) await s.screenshot({ path: `${O}/2-ilk-hamle.png` });
        }
      }
    }
  }
  console.log('Denenen', deneme, 'başarılı', basarili);
  // Tek dokunuş seçimi
  await s.mouse.click(tx + H / 2, ty + H / 2);
  await s.waitForTimeout(150);
  await s.screenshot({ path: `${O}/3-secim.png` });

  // --- VoiceOver kipi ---
  const v = await sayfa(true);
  const etiketler = await v.$$eval('[data-dugme][aria-label]', (e) => e.map((x) => x.getAttribute('aria-label')));
  console.log('VO düğme sayısı:', etiketler.length, 'örnek:', etiketler.slice(0, 3).join(' | '), '…', etiketler.slice(-2).join(' | '));
  // Hamle bul: komşu iki hücreye dokun, hamle sayısı değişene dek
  const voHamle = async () => v.$eval('[aria-label$="hamle kaldı"]', (e) => e.getAttribute('aria-label'));
  let voOldu = false;
  for (let r = 0; r < 8 && !voOldu; r++)
    for (let c = 0; c < 7 && !voOldu; c++) {
      const once = await voHamle();
      await v.locator(`[aria-label$=", ${r + 1}. satır ${c + 1}. sütun"]`).first().click();
      await v.locator(`[aria-label$=", ${r + 1}. satır ${c + 2}. sütun"]`).first().click();
      await v.waitForTimeout(100);
      if ((await voHamle()) !== once) voOldu = true;
    }
  const duyurular = await v.evaluate(() => window.__duyurular.slice(-6));
  console.log('VO hamle oldu mu:', voOldu, '\nDuyurular:', duyurular.join(' // '));

  console.log(hatalar.length ? 'HATALAR:\n' + hatalar.slice(0, 8).join('\n') : 'Sayfa hatası yok');
  await b.close();
})();
