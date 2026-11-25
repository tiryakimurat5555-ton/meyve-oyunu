// Buz ve kasa testleri. Kullanım: bun araclar/engel-testi.mjs
import * as M from '../oyun/mantik.js';
let hata = 0;
const dogru = (k, m) => { if (!k) { hata++; console.log('HATA:', m); } };
function zemin() { const t = []; for (let r = 0; r < 8; r++) { t.push([]); for (let c = 0; c < 8; c++) t[r].push(((r % 2) * 2 + c) % 4 === 0 ? 1 : ((r + c) % 2 ? 2 : 3)); } return t; }
const bos = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const IZ = { cizgili: true, bomba: true, gokkusagi: true };

// Buzlu meyve eşleşmeye katılır; buz kırılır, meyve yerinde kalır
let t = zemin(); let oz = bos(); let en = bos();
t[7][1] = 5; t[7][2] = 5; t[7][3] = 5; en[7][2] = 'buz';
let ad = M.cozumAdimi(t, oz, { engel: en, izinli: IZ });
let u = M.adimUygula(t, oz, en, ad);
dogru(u.sayac.buz === 1 && u.sayac.topla[5] === 2, 'buz kırılmalı, 2 meyve toplanmalı: ' + JSON.stringify(u.sayac));
dogru(u.t[7][2] === 5 && u.engel[7][2] === null, 'buzlu meyve kalmalı, buz gitmeli');

// Buzlu hücre takas edilemez (hamleBul)
t = zemin(); en = bos();
const kilit = en.map((s) => s.map((e) => e != null));
const h = M.hamleBul(t, null, kilit);
// zemin hamlesiz olabilir; buz koyunca o hücreyle hamle olmamalı
t[0][0] = 5; t[0][1] = 5; t[1][2] = 5; // (1,2)->(0,2) ile 3'lü
let k2 = bos(); k2[1][2] = true;
const hb = M.hamleBul(t, null, k2);
dogru(!hb || !hb.some(([r, c]) => r === 1 && c === 2), 'buzlu hücreyle hamle önerilmemeli: ' + JSON.stringify(hb));

// Kasa: komşu eşleşme vurur; tek kat kırılır, iki kat çatlar
t = zemin(); oz = bos(); en = bos();
t[6][1] = 5; t[6][2] = 5; t[6][3] = 5;
t[7][2] = M.KASA; en[7][2] = 1;
t[5][3] = M.KASA; en[5][3] = 2;
ad = M.cozumAdimi(t, oz, { engel: en, izinli: IZ });
dogru(ad.kasaVurus.length === 2, 'iki kasa vurulmalı: ' + JSON.stringify(ad.kasaVurus));
u = M.adimUygula(t, oz, en, ad);
dogru(u.sayac.kasa === 1, 'tek katlı kasa kırılmalı');
// iki katlı kasa yerçekimiyle düşmüş olabilir: kasa hâlâ tahtada ve 1 katta olmalı
const kalan = []; u.t.forEach((s, r) => s.forEach((v, c) => v === M.KASA && kalan.push(u.engel[r][c])));
dogru(kalan.length === 1 && kalan[0] === 1, 'iki katlı kasa 1 kata inmeli: ' + JSON.stringify(kalan));

// Kasa düşer: altı boşalınca aşağı iner
t = zemin(); oz = bos(); en = bos();
t[4][0] = M.KASA; en[4][0] = 2;
t[5][0] = 5; t[6][0] = 5; t[7][0] = 5;
ad = M.cozumAdimi(t, oz, { engel: en, izinli: IZ });
u = M.adimUygula(t, oz, en, ad);
dogru(u.t[7][0] === M.KASA && u.engel[7][0] === 1, 'iki katlı kasa vurulup en alta düşmeli: ' + u.t.map((s) => s[0]).join(','));

// Özel parça alanı kasayı ve buzu vurur
t = zemin(); oz = bos(); en = bos();
oz[2][0] = 'satir'; t[2][5] = M.KASA; en[2][5] = 2; en[2][3] = 'buz';
ad = M.cozumAdimi(t, oz, { engel: en, ek: [[2, 0]], izinli: IZ });
u = M.adimUygula(t, oz, en, ad);
dogru(u.sayac.buz === 1, 'çizgi buzu kırmalı');
dogru(ad.kasaVurus.some(([r, c]) => r === 2 && c === 5), 'çizgi kasayı vurmalı');

// Kasa eşleşmez, gökkuşağı hedefi olmaz
t = zemin(); t[0][0] = M.KASA; t[0][1] = M.KASA; t[0][2] = M.KASA;
dogru(!M.eslesmeleriBul(t).some((g) => g.tur === M.KASA), 'kasalar eşleşmemeli');

// Düzenli tahta
const d = ['........', '........', '........', '..bbbb..', '..bbbb..', '........', '..KKkk..', 'kkkkkkkk'];
for (let i = 0; i < 30; i++) {
  const x = M.duzenliTahta(d);
  dogru(x.engel.flat().filter((e) => e === 'buz').length === 8, 'düzen 8 buz');
  dogru(x.t.flat().filter((v) => v === M.KASA).length === 12, 'düzen 12 kasa');
  dogru(!M.eslesmeleriBul(x.t).length, 'düzen eşleşmesiz');
}
console.log(hata ? `${hata} HATA` : 'ENGEL TESTLERİ GEÇTİ');
process.exit(hata ? 1 : 0);
