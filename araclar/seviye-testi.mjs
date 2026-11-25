// Seviyeleri özel parçalar ve engellerle, basit "akıllı" bir botla oynatır (rastgele 6 hamleden hedefe en çok katkı yapanı seçer).
// Amaç: sonsuz döngü/çökme olmadığını, seviyelerin geçilebilirliğini ve yıldız eşiklerini görmek.
// Kullanım: bun araclar/seviye-testi.mjs                 (bütün seviyeler)
//           SEVIYE='{"no":9,"hamle":22}' bun araclar/seviye-testi.mjs   (tek seviye, değiştirilmiş)
//           ARALIK=11-30 bun araclar/seviye-testi.mjs     (aralık)
import * as M from '../oyun/mantik.js';
import { SEVIYELER, hedefTamam, yildizHesapla } from '../oyun/seviyeler.js';

// mulberry32: hızlı ve kaliteli rastgele üreteç (eski basit üreteç tekrarlı diziler verip sonuçları çarpıtıyordu)
let tohum = Number(process.env.TOHUM || 99) >>> 0;
const rnd = () => {
  tohum = (tohum + 0x6d2b79f5) >>> 0;
  let t = tohum;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const kilitOf = (engel) => engel.map((s) => s.map((e) => e != null));

function hamleler(t, oz, engel) {
  const k = kilitOf(engel);
  const l = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      for (const b of [[r, c + 1], [r + 1, c]]) {
        if (b[0] > 7 || b[1] > 7) continue;
        if (k[r][c] || k[b[0]][b[1]] || t[r][c] === M.KASA || t[b[0]][b[1]] === M.KASA) continue;
        if (M.birlesim(t, oz, [r, c], b) || M.eslesmeleriBul(M.takasla(t, [r, c], b)).length) l.push([[r, c], b]);
      }
  return l;
}

// Hamleyi uygular, zincirleri çözer (oyundaki bot ile aynı fonksiyon).
export const oyna = (t, oz, engel, a, b, izinli) => M.hamleSonucu(t, oz, engel, a, b, izinli, rnd);

const degisik = process.env.SEVIYE ? JSON.parse(process.env.SEVIYE) : null;
const aralik = process.env.ARALIK ? process.env.ARALIK.split('-').map(Number) : null;
let DENENECEK = degisik ? [{ ...SEVIYELER.find((s) => s.no === degisik.no), ...degisik }] : SEVIYELER;
if (aralik) DENENECEK = DENENECEK.filter((s) => s.no >= aralik[0] && s.no <= aralik[1]);
const DENEME = Number(process.env.DENEME || (degisik ? 80 : 40));
const ADAY = Number(process.env.BOT_ADAY || 30);

if (process.env.BUZ_KOMSU) M.buzKuraliAyarla(true);
let hata = 0;
for (const sv of DENENECEK) {
  M.turSayisiAyarla(sv.tur);
  // Düzen ile hedef sayıları tutarlı mı?
  if (sv.duzen) {
    const b = sv.duzen.join('').split('').filter((x) => x === 'b').length;
    const k = sv.duzen.join('').split('').filter((x) => x === 'k' || x === 'K').length;
    if ((sv.hedef.buz || 0) !== b || (sv.hedef.kasa || 0) !== k) {
      hata++;
      console.log(`HATA: seviye ${sv.no} düzen ${b} buz/${k} kasa, hedef ${sv.hedef.buz || 0}/${sv.hedef.kasa || 0}`);
    }
  }
  let gecen = 0;
  const puanlar = [];
  for (let d = 0; d < DENEME; d++) {
    let { t, oz, engel } = M.duzenliTahta(sv.duzen, rnd);
    let puan = 0;
    const top = { buz: 0, kasa: 0 };
    let hamle = sv.hamle;
    let bos = 0;
    while (hamle > 0 && !hedefTamam(sv, top, puan)) {
      const hl = hamleler(t, oz, engel);
      if (!hl.length) {
        // Karıştır: kilitli olmayan meyveleri yeniden dağıt
        if (++bos > 50) break;
        const k = M.karistir(t, rnd);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (engel[r][c] == null && !oz[r][c]) t[r][c] = k[r][c];
        continue;
      }
      // Bütün hamleleri dener (en çok 30); hedefe en çok katkı yapanı seçer. BOT_ADAY ile sınırlanabilir.
      let en = null;
      const adaylar = hl.length <= ADAY ? hl : Array.from({ length: ADAY }, () => hl[Math.floor(rnd() * hl.length)]);
      for (const h of adaylar) {
        const s = oyna(t, oz, engel, h[0], h[1], sv.ozel);
        const h2 = sv.hedef;
        let deger = s.puan / 100;
        if (h2.topla) deger += Object.keys(h2.topla).reduce((a, k) => a + (s.sayac.topla[k] || 0), 0) * 100;
        if (h2.buz) deger += s.sayac.buz * 150;
        if (h2.kasa) deger += s.sayac.kasa * 150;
        if (h2.puan) deger = s.puan;
        if (!en || deger > en.deger) en = { deger, s };
      }
      ({ t, oz, engel } = en.s);
      puan += en.s.puan;
      for (const k in en.s.sayac.topla) top[k] = (top[k] || 0) + en.s.sayac.topla[k];
      top.buz += en.s.sayac.buz;
      top.kasa += en.s.sayac.kasa;
      hamle--;
    }
    const ok = hedefTamam(sv, top, puan);
    if (ok) {
      gecen++;
      puanlar.push(puan + Math.min(15, hamle) * 220 + Math.max(0, hamle - 15) * 100);
    }
  }
  puanlar.sort((a, b) => a - b);
  const yuzde = (p) => (puanlar.length ? puanlar[Math.min(puanlar.length - 1, Math.floor(puanlar.length * p))] : 0);
  const yuvarla = (x) => Math.round(x / 250) * 250;
  const yildizlar = puanlar.map((p) => yildizHesapla(sv, p, true));
  const ort = yildizlar.length ? (yildizlar.reduce((a, b) => a + b, 0) / DENEME).toFixed(1) : '0';
  console.log(
    `Seviye ${sv.no}: bot ${gecen}/${DENEME} geçti (%${Math.round((gecen / DENEME) * 100)}), ortalama ${ort} yıldız` +
      (sv.no > 10 ? ` | öneri eşik: 2★ ${yuvarla(yuzde(0.4))}, 3★ ${yuvarla(yuzde(0.75))}` : '')
  );
}
console.log(hata ? `${hata} HATA` : 'SEVİYE SİMÜLASYONU HATASIZ');
