// Oyun mantığı testi. Kullanım: bun araclar/mantik-testi.mjs
import * as M from '../oyun/mantik.js';

let hata = 0;
const dogru = (k, m) => {
  if (!k) {
    hata++;
    console.log('HATA:', m);
  }
};

// Sabit tohumlu rastgele
let tohum = 12345;
const rnd = () => ((tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648);

for (let i = 0; i < 300; i++) {
  const t = M.yeniTahta(rnd);
  dogru(M.eslesmeleriBul(t).length === 0, 'yeni tahtada eşleşme var');
  dogru(M.hamleBul(t), 'yeni tahtada hamle yok');
}

// Bilinen eşleşme
const t = [];
for (let r = 0; r < M.SATIR; r++) t.push(Array.from({ length: M.SUTUN }, (_, c) => (((r % 2) * 2 + c) % 4 === 0 ? 1 : (r + c) % 2 ? 2 : 3)));
t[2][1] = 5; t[2][2] = 5; t[2][3] = 5; // yatay 3
t[4][5] = 4; t[5][5] = 4; t[6][5] = 4; t[7][5] = 4; // dikey 4
const g = M.eslesmeleriBul(t);
dogru(g.some((x) => x.tur === 5 && x.yon === 'yatay' && x.hucreler.length === 3), 'yatay 3 bulunamadı');
dogru(g.some((x) => x.tur === 4 && x.yon === 'dikey' && x.hucreler.length === 4), 'dikey 4 bulunamadı');

// L şekli: ortak hücre bir kez silinmeli
const L = M.kopya(t);
L[0][0] = 0; L[0][1] = 0; L[0][2] = 0; L[1][0] = 0; L[2][0] = 0;
const s = M.silinecekler(M.eslesmeleriBul(L).filter((x) => x.tur === 0));
dogru(s.length === 5, 'L şekli 5 hücre olmalı, ' + s.length);

// Yerçekimi
const y = M.kopya(t);
y[7][0] = -1; y[6][0] = -1; y[3][0] = -1;
const sonuc = M.yercekimi(y, rnd);
dogru(sonuc.tahta.every((s) => s.every((v) => v >= 0)), 'yerçekimi sonrası boş kaldı');
dogru(sonuc.yeniler.filter((n) => n.yeni[1] === 0).length === 3, '0. sütuna 3 yeni gelmeli');
dogru(sonuc.tahta[7][0] === t[5][0], 'kayma yanlış');

// Karıştırma
for (let i = 0; i < 50; i++) {
  const k = M.karistir(M.yeniTahta(rnd), rnd);
  dogru(M.eslesmeleriBul(k).length === 0 && M.hamleBul(k), 'karıştırma geçersiz');
}

// Rastgele oyun simülasyonu: 2000 hamle, zincirleri çöz
let tahta = M.yeniTahta(rnd);
let enUzun = 0;
let karisma = 0;
for (let h = 0; h < 2000; h++) {
  const hm = M.hamleBul(tahta);
  if (!hm) { tahta = M.karistir(tahta, rnd); karisma++; continue; }
  tahta = M.takasla(tahta, hm[0], hm[1]);
  let zincir = 0;
  for (;;) {
    const gr = M.eslesmeleriBul(tahta);
    if (!gr.length) break;
    zincir++;
    for (const [r, c] of M.silinecekler(gr)) tahta[r][c] = -1;
    tahta = M.yercekimi(tahta, rnd).tahta;
    dogru(zincir < 50, 'sonsuz zincir');
    if (zincir >= 50) break;
  }
  enUzun = Math.max(enUzun, zincir);
}
console.log('simülasyon: en uzun zincir', enUzun, 'karıştırma', karisma);
console.log(hata ? `${hata} HATA` : 'TÜM TESTLER GEÇTİ');
process.exit(hata ? 1 : 0);
