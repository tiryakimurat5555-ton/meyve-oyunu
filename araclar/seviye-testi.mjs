// Seviyeleri özel parçalar ve engellerle, basit "akıllı" bir botla oynatır (hamlelerden hedefe en çok katkı yapanı seçer).
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

// Hamleyi uygular, zincirleri çözer (oyundaki bot ile aynı fonksiyon).
export const oyna = (t, oz, engel, a, b, izinli, zemin) => M.hamleSonucu(t, oz, engel, a, b, izinli, rnd, zemin);

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
  M.seviyeKur(sv);
  // Düzen ile hedef sayıları tutarlı mı?
  if (sv.duzen) {
    const say = M.duzenSayilari(sv.duzen);
    for (const k of Object.keys(say)) {
      if ((sv.hedef[k] || 0) !== say[k]) {
        hata++;
        console.log(`HATA: seviye ${sv.no} düzende ${say[k]} ${k}, hedef ${sv.hedef[k] || 0}`);
      }
    }
    for (const k of M.DUZEN_HEDEF_ANAHTAR) {
      if (sv.hedef[k] && !say[k]) {
        hata++;
        console.log(`HATA: seviye ${sv.no} hedefte ${k} var, düzende yok`);
      }
    }
    for (let c = 0; c < 8; c++) {
      let a = 7;
      while (a >= 0 && sv.duzen[a][c] === 'x') a--;
      if (a >= 0 && M.INEN_DUZEN.includes(sv.duzen[a][c])) {
        hata++;
        console.log(`HATA: seviye ${sv.no} inen parça en alt sırada başlıyor (${c}. sütun)`);
      }
    }
  }
  // Sandık: hücreleri kumlu olmalı, sayısı hedefle aynı
  if (sv.sandiklar) {
    for (const sd of sv.sandiklar) for (const [r, c] of M.sandikHucreleri(sd)) if (!sv.duzen || sv.duzen[r][c] !== 'r') { hata++; console.log(`HATA: seviye ${sv.no} sandık hücresi kumsuz (${r},${c})`); }
    if ((sv.hedef.sandik || 0) !== sv.sandiklar.length) { hata++; console.log(`HATA: seviye ${sv.no} ${sv.sandiklar.length} sandık, hedef ${sv.hedef.sandik}`); }
  }
  // Anahtarın sütununda altında kafes olmamalı (kafesli meyve temizlenmez, anahtar takılı kalır)
  if (sv.duzen)
    for (let c = 0; c < 8; c++)
      for (let r = 0; r < 8; r++)
        if (sv.duzen[r][c] === 'a' && sv.duzen.slice(r + 1).some((s) => s[c] === 'c')) {
          hata++;
          console.log(`HATA: seviye ${sv.no} anahtarın (${c + 1}. sütun) altında kafes var`);
        }
  // Akış zincirleri her deliksiz hücreyi bir kez içermeli (kapılar döngü kurmamalı)
  {
    const d = M.duzenliTahta(sv.duzen, rnd);
    const zs = M.akisZincirleri(d.t);
    const say = zs.reduce((a, z) => a + z.length, 0);
    const delik = d.t.flat().filter((v) => v === M.DELIK || v === M.BALON || v === M.ISTIRIDYE || M.nesneMi(v) || v === M.VAGON).length;
    if (say !== 64 - delik) {
      hata++;
      console.log(`HATA: seviye ${sv.no} akış zincirleri ${say} hücre, olması gereken ${64 - delik} (kapı döngüsü?)`);
    }
  }
  let gecen = 0;
  const puanlar = [];
  const kayipNeden = {};
  for (let d = 0; d < DENEME; d++) {
    let durum = M.duzenliTahta(sv.duzen, rnd);
    M.seviyeKur(sv);
    let { t, oz, engel, zemin } = durum;
    let puan = 0;
    const top = M.kalanlariYaz(M.baslangicToplanan(sv, engel), engel, zemin);
    let hamle = sv.hamle;
    let yapilan = 0;
    let bos = 0;
    let kaybetti = false;
    while (hamle > 0 && !hedefTamam(sv, top, puan)) {
      // Oyuncu sisin altını göremez: bot kararını görünür tahtada verir
      const gercek = t;
      t = M.gorunurTahta(gercek, engel);
      let hl = M.tumHamleler(t, oz, engel);
      if (!hl.length && t !== gercek) {
        t = gercek;
        hl = M.tumHamleler(t, oz, engel);
      }
      if (!hl.length) {
        t = gercek;
        // Karıştır: yalnız renkli, engelsiz, özel olmayan meyveler karışır
        if (++bos > 50) break;
        const k = M.karistir(t, rnd);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (M.serbestMi(engel[r][c]) && !oz[r][c]) t[r][c] = k[r][c];
        continue;
      }
      const adaylar = hl.length <= ADAY ? hl : Array.from({ length: ADAY }, () => hl[Math.floor(rnd() * hl.length)]);
      const d0 = M.inenDerinligi(t);
      const sonuclar = [];
      let en = null;
      for (const h of adaylar) {
        const s = oyna(t, oz, engel, h[0], h[1], sv.ozel, zemin);
        const deger = M.hamleDegeri(s, sv.hedef, d0);
        sonuclar.push({ h, s, deger });
        if (!en || deger > en.deger) en = { deger, s, h };
      }
      // İnen parça (tohum, civciv, anahtar) seviyelerinde iki hamle ileri bakar
      if (M.inenHedefMi(sv.hedef) && !M.inenToplandi(en.s.sayac)) {
        sonuclar.sort((a, b) => b.deger - a.deger);
        let en2 = null;
        for (const x of sonuclar.slice(0, 6)) {
          const hl2 = M.tumHamleler(x.s.t, x.s.oz, x.s.engel).slice(0, 20);
          let iki = 0;
          const dd = M.inenDerinligi(x.s.t);
          for (const h2 of hl2) {
            const s2 = oyna(x.s.t, x.s.oz, x.s.engel, h2[0], h2[1], sv.ozel, x.s.zemin);
            iki = Math.max(iki, M.inenDegeri(s2, dd));
          }
          const tp = x.deger + iki * 0.8;
          if (!en2 || tp > en2.tp) en2 = { tp, s: x.s, h: x.h };
        }
        if (en2) en = en2;
      }
      if (t !== gercek) en.s = oyna(gercek, oz, engel, en.h[0], en.h[1], sv.ozel, zemin);
      ({ t, oz, engel, zemin } = en.s);
      puan += en.s.puan;
      M.sayacEkle(top, en.s.sayac);
      hamle--;
      yapilan++;
      // Hamle sonrası kurallar (sarmaşık/mantar yayılır, bant kayar, bukalemun renk değiştirir, saatler azalır)
      const k = M.hamleSonrasiKurallar({ t, oz, engel, zemin }, sv, { yapilan, kesilen: en.s.sayac, top, puan, hedefTamam, sonHamle: en.h }, rnd);
      ({ t, oz, engel, zemin } = k.durum);
      puan += k.puan;
      M.sayacEkle(top, k.sayac);
      M.kalanlariYaz(top, engel, zemin);
      if (k.kaybetti) {
        kaybetti = true;
        kayipNeden.saat = (kayipNeden.saat || 0) + 1;
        break;
      }
    }
    const ok = !kaybetti && hedefTamam(sv, top, puan);
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
      (sv.no > 10 ? ` | öneri eşik: 2★ ${yuvarla(yuzde(0.4))}, 3★ ${yuvarla(yuzde(0.75))}` : '') +
      (Object.keys(kayipNeden).length ? ` | saat kaybı ${kayipNeden.saat}` : '')
  );
}
M.seviyeKur(null);
console.log(hata ? `${hata} HATA` : 'SEVİYE SİMÜLASYONU HATASIZ');
