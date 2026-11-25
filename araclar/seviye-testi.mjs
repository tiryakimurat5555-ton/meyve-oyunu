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
        if (k[r][c] || k[b[0]][b[1]] || M.kasaMi(t[r][c]) || M.kasaMi(t[b[0]][b[1]])) continue;
        if (M.birlesim(t, oz, [r, c], b) || M.eslesmeleriBul(M.takasla(t, [r, c], b)).length) l.push([[r, c], b]);
      }
  return l;
}

// Hamleyi uygular, zincirleri çözer (oyundaki bot ile aynı fonksiyon).
export const oyna = (t, oz, engel, a, b, izinli, zemin) => M.hamleSonucu(t, oz, engel, a, b, izinli, rnd, zemin);
const tohumDerin = (t) => t.reduce((a, s, r) => a + s.reduce((b, v) => b + (v === M.TOHUM ? r : 0), 0), 0);

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
    const kr = sv.duzen.join('').split('').reduce((a, x) => a + (x === 's' ? 1 : x === 'S' ? 2 : 0), 0);
    const th = sv.duzen.join('').split('').filter((x) => x === 't').length;
    const sm = sv.duzen.join('').split('').filter((x) => x === 'v').length;
    const fc = sv.duzen.join('').split('').filter((x) => x === 'f' || x === 'F').length;
    if ((sv.hedef.fici || 0) !== fc) {
      hata++;
      console.log(`HATA: seviye ${sv.no} düzen ${fc} fıçı, hedef ${sv.hedef.fici || 0}`);
    }
    if ((sv.hedef.sarmasik || 0) !== sm) {
      hata++;
      console.log(`HATA: seviye ${sv.no} düzen ${sm} sarmaşık, hedef ${sv.hedef.sarmasik || 0}`);
    }
    if ((sv.hedef.buz || 0) !== b || (sv.hedef.kasa || 0) !== k || (sv.hedef.kar || 0) !== kr || (sv.hedef.tohum || 0) !== th) {
      hata++;
      console.log(`HATA: seviye ${sv.no} düzen ${b} buz/${k} kasa/${kr} kar/${th} tohum, hedef ${sv.hedef.buz || 0}/${sv.hedef.kasa || 0}/${sv.hedef.kar || 0}/${sv.hedef.tohum || 0}`);
    }
    if (sv.duzen[7].includes('t')) {
      hata++;
      console.log(`HATA: seviye ${sv.no} tohum en alt sırada başlıyor`);
    }
  }
  let gecen = 0;
  const puanlar = [];
  for (let d = 0; d < DENEME; d++) {
    let { t, oz, engel, zemin } = M.duzenliTahta(sv.duzen, rnd);
    let puan = 0;
    const top = { buz: 0, kasa: 0, kar: 0, tohum: 0, fici: 0, sarmasikKalan: M.sarmasikSay(engel) };
    let hamle = sv.hamle;
    let bos = 0;
    while (hamle > 0 && !hedefTamam(sv, top, puan)) {
      const hl = hamleler(t, oz, engel);
      if (!hl.length) {
        // Karıştır: kilitli olmayan meyveleri yeniden dağıt
        if (++bos > 50) break;
        const k = M.karistir(t, rnd);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (engel[r][c] == null && !oz[r][c] && t[r][c] !== M.TOHUM && !M.kasaMi(t[r][c])) t[r][c] = k[r][c];
        continue;
      }
      // Bütün hamleleri dener (en çok 30); hedefe en çok katkı yapanı seçer. BOT_ADAY ile sınırlanabilir.
      let en = null;
      const adaylar = hl.length <= ADAY ? hl : Array.from({ length: ADAY }, () => hl[Math.floor(rnd() * hl.length)]);
      const d0 = sv.hedef.tohum ? tohumDerin(t) : 0;
      for (const h of adaylar) {
        const s = oyna(t, oz, engel, h[0], h[1], sv.ozel, zemin);
        const h2 = sv.hedef;
        let deger = s.puan / 100;
        if (h2.topla) deger += Object.keys(h2.topla).reduce((a, k) => a + (s.sayac.topla[k] || 0), 0) * 100;
        if (h2.buz) deger += s.sayac.buz * 150;
        if (h2.kasa) deger += s.sayac.kasa * 150;
        if (h2.kar) deger += s.sayac.kar * 150;
        if (h2.sarmasik) deger += s.sayac.sarmasik * 170;
        if (h2.fici) deger += s.sayac.fici * 200 + s.sayac.vurus * 60;
        if (h2.tohum) deger += s.sayac.tohum * 400 + (tohumDerin(s.t) - d0) * 60;
        if (h2.puan) deger = s.puan;
        if (!en || deger > en.deger) en = { deger, s };
      }
      // Tohum seviyelerinde oyuncu tohumun altını hazırlamak için iki hamle ileriyi düşünür:
      // en iyi 6 adayın her biri için ardından gelebilecek en iyi hamlenin tohum katkısı da eklenir.
      if (sv.hedef.tohum && !en.s.sayac.tohum) {
        const deg1 = [];
        for (const h of adaylar) {
          const s1 = oyna(t, oz, engel, h[0], h[1], sv.ozel, zemin);
          deg1.push({ s: s1, d: s1.sayac.tohum * 400 + (tohumDerin(s1.t) - d0) * 60 + s1.puan / 100 + (sv.hedef.kar ? s1.sayac.kar * 150 : 0) });
        }
        deg1.sort((a, b) => b.d - a.d);
        let en2 = null;
        for (const x of deg1.slice(0, 6)) {
          const hl2 = hamleler(x.s.t, x.s.oz, x.s.engel).slice(0, 20);
          let iki = 0;
          const dd = tohumDerin(x.s.t);
          for (const h2 of hl2) {
            const s2 = oyna(x.s.t, x.s.oz, x.s.engel, h2[0], h2[1], sv.ozel, x.s.zemin);
            iki = Math.max(iki, s2.sayac.tohum * 400 + (tohumDerin(s2.t) - dd) * 60);
          }
          const top = x.d + iki * 0.8;
          if (!en2 || top > en2.top) en2 = { top, s: x.s };
        }
        if (en2) en = en2;
      }
      ({ t, oz, engel, zemin } = en.s);
      puan += en.s.puan;
      for (const k in en.s.sayac.topla) top[k] = (top[k] || 0) + en.s.sayac.topla[k];
      top.buz += en.s.sayac.buz;
      top.kasa += en.s.sayac.kasa;
      top.kar += en.s.sayac.kar;
      top.tohum += en.s.sayac.tohum;
      top.fici += en.s.sayac.fici;
      // Hiç sarmaşık kesilmediyse sarmaşık yayılır
      if (sv.hedef.sarmasik && !en.s.sayac.sarmasik && !hedefTamam(sv, { ...top, sarmasikKalan: M.sarmasikSay(engel) }, puan)) {
        const y = M.sarmasikYay(t, oz, engel, rnd);
        if (y) engel = y.engel;
      }
      top.sarmasikKalan = M.sarmasikSay(engel);
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
