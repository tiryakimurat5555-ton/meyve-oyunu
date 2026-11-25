// Seviyeleri özel parçalarla, "akıllıca" (en çok hedef meyve toplayan hamleyi seçen) bir botla oynatır.
// Amaç: sonsuz döngü/çökme olmadığını ve seviyelerin kabaca geçilebilir olduğunu görmek. Kullanım: bun araclar/seviye-testi.mjs
import * as M from '../oyun/mantik.js';
import { SEVIYELER, hedefTamam, yildizHesapla } from '../oyun/seviyeler.js';

let tohum = 99;
const rnd = () => ((tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648);
const kop = (g) => g.map((s) => s.slice());

function hamleler(t, oz) {
  const l = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      for (const b of [[r, c + 1], [r + 1, c]]) {
        if (b[0] > 7 || b[1] > 7) continue;
        const bir = M.birlesim(t, oz, [r, c], b);
        if (bir || M.eslesmeleriBul(M.takasla(t, [r, c], b)).length) l.push([[r, c], b]);
      }
  return l;
}

// Hamleyi uygular, zincirleri çözer. Dönüş: { t, oz, puan, toplanan }
function oyna(t, oz, a, b, izinli) {
  let puan = 0;
  const toplanan = {};
  let bir = M.birlesim(t, oz, a, b);
  t = M.takasla(t, a, b);
  oz = M.takasla(oz, a, b);
  let ek = [];
  if (bir) {
    // takastan sonra merkezler yer değiştirdi
    const merkez = bir.merkez[0] === a[0] && bir.merkez[1] === a[1] ? b : a;
    for (const d of bir.donusum) oz[d.hucre[0]][d.hucre[1]] = d.ozel;
    oz[a[0]][a[1]] = null;
    oz[b[0]][b[1]] = null;
    ek = [...M.etkiAlani(bir.etki, merkez[0], merkez[1], t, bir.hedefTur), a, b];
  }
  let zincir = 0;
  for (;;) {
    const adim = M.cozumAdimi(t, oz, { hamle: zincir === 0 ? [a, b] : null, ek, izinli });
    ek = [];
    if (!adim.hucreler.length && !adim.olusan.length) break;
    zincir++;
    if (zincir > 60) throw new Error('sonsuz zincir');
    for (const g of adim.gruplar) puan += M.grupPuani(g.hucreler.length, zincir);
    // Özel parçanın temizlediği her meyve +20 (zincir çarpanıyla)
    const eslesen = new Set(M.silinecekler(adim.gruplar).map(([r, c]) => r * 8 + c));
    puan += adim.hucreler.filter(([r, c]) => !eslesen.has(r * 8 + c)).length * M.OZEL_HUCRE_PUANI * Math.max(1, zincir);
    for (const [r, c] of adim.hucreler) {
      if (t[r][c] >= 0 && t[r][c] < 6) toplanan[t[r][c]] = (toplanan[t[r][c]] || 0) + 1;
      t[r][c] = -1;
      oz[r][c] = null;
    }
    for (const o of adim.olusan) {
      t[o.hucre[0]][o.hucre[1]] = o.tur;
      oz[o.hucre[0]][o.hucre[1]] = o.ozel;
    }
    const y = M.yercekimi(t, rnd);
    const yoz = kop(oz);
    for (const k of y.kaymalar) yoz[k.eski[0]][k.eski[1]] = null;
    for (const k of y.kaymalar) yoz[k.yeni[0]][k.yeni[1]] = oz[k.eski[0]][k.eski[1]];
    for (const n of y.yeniler) yoz[n.yeni[0]][n.yeni[1]] = null;
    t = y.tahta;
    oz = yoz;
  }
  return { t, oz, puan, toplanan };
}

let hata = 0;
const ozelSay = { satir: 0, sutun: 0, bomba: 0, gokkusagi: 0 };
for (const sv of SEVIYELER) {
  M.turSayisiAyarla(sv.tur);
  let gecen = 0;
  let yildizToplam = 0;
  const DENEME = 40;
  for (let d = 0; d < DENEME; d++) {
    let t = M.yeniTahta(rnd);
    let oz = t.map((s) => s.map(() => null));
    let puan = 0;
    const top = {};
    let hamle = sv.hamle;
    while (hamle > 0 && !hedefTamam(sv, top, puan)) {
      const hl = hamleler(t, oz);
      if (!hl.length) { t = M.karistir(t, rnd); oz = t.map((s) => s.map(() => null)); continue; }
      // Bot: rastgele 6 hamleyi dener, en çok hedef/puan getireni seçer
      let en = null;
      for (let i = 0; i < 6; i++) {
        const h = hl[Math.floor(rnd() * hl.length)];
        const s = oyna(kop(t), kop(oz), h[0], h[1], sv.ozel);
        const deger = sv.hedef.puan ? s.puan : Object.keys(sv.hedef.topla).reduce((a, k) => a + (s.toplanan[k] || 0), 0) * 100 + s.puan / 100;
        if (!en || deger > en.deger) en = { deger, h, s };
      }
      t = en.s.t; oz = en.s.oz; puan += en.s.puan;
      for (const k in en.s.toplanan) top[k] = (top[k] || 0) + en.s.toplanan[k];
      for (const s of oz.flat()) if (s) ozelSay[s] !== undefined && ozelSay[s]++;
      hamle--;
    }
    const ok = hedefTamam(sv, top, puan);
    if (ok) gecen++;
    yildizToplam += yildizHesapla(sv, puan + hamle * 200, ok);
    if (!sv.ozel.cizgili && oz.flat().some(Boolean)) { hata++; console.log('HATA: izinsiz özel parça', sv.no); }
    if (sv.tur === 5 && t.flat().includes(5)) { hata++; console.log('HATA: 5 türlü seviyede erik', sv.no); }
  }
  console.log(`Seviye ${sv.no}: bot ${gecen}/${DENEME} geçti, ortalama ${(yildizToplam / DENEME).toFixed(1)} yıldız`);
}
console.log('Görülen özel parçalar (hamle başına sayım):', JSON.stringify(ozelSay));
console.log(hata ? `${hata} HATA` : 'SEVİYE SİMÜLASYONU HATASIZ');
