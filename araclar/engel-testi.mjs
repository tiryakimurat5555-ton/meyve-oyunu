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

// ---------------- Kar ve tohum (4. ve 5. bölüm) ----------------
{
  M.turSayisiAyarla(6);
  // Kar: üstündeki meyve eşleşince bir kat erir; komşu eşleşme eritmez; iki katlı kar iki kez ister
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0; // alt sırada çilek üçlüsü
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  const zemin = t.map((s) => s.map(() => 0));
  zemin[7][0] = 1; zemin[7][1] = 2; zemin[6][0] = 1; // 6,0 komşu: erimemeli
  const ad = M.cozumAdimi(t, oz, { engel: en });
  const u = M.adimUygula(t, oz, en, ad, Math.random, zemin);
  dogru(u.zemin[7][0] === 0 && u.zemin[7][1] === 1 && u.zemin[6][0] === 1, 'kar erimesi: ' + JSON.stringify([u.zemin[7][0], u.zemin[7][1], u.zemin[6][0]]));
  dogru(u.sayac.kar === 2, 'kar sayacı 2 olmalı: ' + u.sayac.kar);
  dogru(zemin[7][0] === 1, 'zemin kopyalanmalı (asıl dizi değişmemeli)');
}
{
  // Tohum: eşleşmez, özel parça alanında patlamaz, alt sıraya inince toplanır
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[5][3] = M.TOHUM;
  t[6][3] = 1; t[6][2] = 1; t[6][4] = 1; // tohumun altında limon üçlüsü
  t[7][3] = 2; t[7][2] = 4; t[7][4] = 5;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  let ad = M.cozumAdimi(t, oz, { engel: en });
  dogru(!ad.hucreler.some(([r, c]) => r === 5 && c === 3), 'tohum silinmemeli');
  let u = M.adimUygula(t, oz, en, ad, () => 0.3);
  dogru(u.t[6][3] === M.TOHUM, 'tohum bir sıra düşmeli: ' + u.t[6][3]);
  // Satır temizleyen özel parça tohuma işlemez
  const t2 = M.kopya(u.t);
  const oz2 = t2.map((s) => s.map(() => null));
  ad = M.cozumAdimi(t2, oz2, { engel: en, ek: M.etkiAlani('satir', 6, 0, t2) });
  dogru(!ad.hucreler.some(([r, c]) => r === 6 && c === 3), 'çizgili tohumu silmemeli');
  // Alt sıradaki tohum toplanır
  const t3 = M.kopya(u.t);
  t3[7][3] = M.TOHUM; t3[6][3] = 0;
  ad = M.cozumAdimi(t3, oz2, { engel: en });
  dogru(ad.tohumlar.length === 1 && !M.adimBos(ad), 'alt sıradaki tohum toplanmalı');
  u = M.adimUygula(t3, oz2, en, ad, () => 0.3);
  dogru(u.sayac.tohum === 1 && u.t[7][3] !== M.TOHUM, 'tohum sayacı');
  // Tohum takas edilebilir (hamle sayılır)
  dogru(M.tumHamleler(t, oz, en).length > 0, 'hamle var');
  // Düzen: s/S/t
  const d = ['........', '...t....', '........', '........', '........', '..sSs...', '........', '........'];
  const x = M.duzenliTahta(d);
  dogru(x.t[1][3] === M.TOHUM && x.zemin[5][3] === 2 && x.zemin[5][2] === 1, 'düzen kar/tohum');
}
{
  // Sarmaşık: eşleşmeyle kesilir (meyve kalır), komşu eşleşme de keser; kesilmezse yayılır
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[7][1] = 'sarmasik'; en[6][2] = 'sarmasik'; en[3][3] = 'sarmasik';
  const ad = M.cozumAdimi(t, oz, { engel: en });
  const u = M.adimUygula(t, oz, en, ad, () => 0.3);
  dogru(u.sayac.sarmasik === 2, 'iki sarmaşık kesilmeli: ' + u.sayac.sarmasik);
  dogru(M.sarmasikSay(u.engel) === 1, 'bir sarmaşık kalmalı');
  const y = M.sarmasikYay(u.t, u.oz, u.engel, () => 0.1);
  dogru(y && M.sarmasikSay(y.engel) === 2 && Math.abs(y.hucre[0] - 3) + Math.abs(y.hucre[1] - 3) === 1, 'sarmaşık komşuya yayılmalı: ' + JSON.stringify(y && y.hucre));
  dogru(!M.tumHamleler(u.t, u.oz, y.engel).some(([a, b]) => (a[0] === y.hucre[0] && a[1] === y.hucre[1]) || (b[0] === y.hucre[0] && b[1] === y.hucre[1])), 'sarmaşıklı meyve takas edilemez');
  const x = M.duzenliTahta(['........', '...vv...', '........', '........', '........', '........', '........', '........']);
  dogru(x.engel[1][3] === 'sarmasik' && x.engel[1][4] === 'sarmasik', 'düzen v');
}
{
  // Fıçı: 3 vuruşta kırılır; ödüllü fıçıdan özel meyve çıkar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  t[6][0] = M.FICI; t[6][1] = M.FICI_ODUL;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[6][0] = 3; en[6][1] = 1;
  const ad = M.cozumAdimi(t, oz, { engel: en });
  dogru(ad.kasaVurus.length === 2, 'iki fıçı vurulmalı');
  const u = M.adimUygula(t, oz, en, ad, () => 0.4);
  dogru(u.sayac.fici === 1 && u.sayac.vurus === 2, 'ödüllü fıçı kırılmalı: ' + JSON.stringify(u.sayac));
  dogru(M.ficiMi(u.t[7][0]) && u.engel[7][0] === 2, 'fıçı düşüp 2 kat kalmalı');
  dogru(!!u.oz[7][1] && u.t[7][1] >= 0 && u.t[7][1] < 6, 'ödüllü fıçıdan özel meyve çıkmalı: ' + u.oz[7][1]);
  dogru(M.duzenliTahta(['........', '........', '........', '........', '........', '........', '..fF....', '........']).engel[6][2] === 3, 'düzen f/F');
}
{
  // Sis: komşu eşleşmeyle dağılır, meyve kalır; görünür tahtada sisli hücre bilinmez
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0; t[6][0] = 4;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[6][0] = 'sis';
  const ad = M.cozumAdimi(t, oz, { engel: en });
  const u = M.adimUygula(t, oz, en, ad, () => 0.4);
  dogru(u.sayac.sis === 1 && u.engel[7][0] === null, 'sis dağılmalı: ' + JSON.stringify(u.sayac));
  const g = M.gorunurTahta(t, en);
  dogru(g[6][0] >= 100 && g[5][0] === t[5][0], 'görünür tahtada sis gizli');
  dogru(M.duzenliTahta(['........', '........', '..g.....', '........', '........', '........', '........', '........']).engel[2][2] === 'sis', 'düzen g');
}
{
  // Delik: meyveler deliğin üstünden atlayarak düşer; delik yerinde kalır; özel parça deliği atlar
  const d = M.duzenliTahta(['........', '........', '........', '...x....', '........', '........', '........', 'x.......']);
  dogru(d.t[3][3] === M.DELIK && d.t[7][0] === M.DELIK, 'düzen x');
  const t = d.t.map((s) => s.slice());
  t[4][3] = -1; // deliğin altı boşaldı
  const y = M.yercekimi(t, () => 0.1);
  dogru(y.tahta[3][3] === M.DELIK, 'delik yerinde kalmalı');
  dogru(y.kaymalar.some((k) => k.eski[0] === 2 && k.yeni[0] === 4 && k.eski[1] === 3), '2. satırdaki meyve deliği atlayıp 4. satıra düşmeli: ' + JSON.stringify(y.kaymalar));
  const oz = t.map((s) => s.map(() => null));
  const g = M.genislet(d.t, oz.map((s, r) => s.map((_, c) => (r === 3 && c === 0 ? 'satir' : null))), [[3, 0]]);
  dogru(!g.hucreler.some(([r, c]) => r === 3 && c === 3), 'çizgili deliği atlamalı');
  dogru(M.enAltSatir(d.t, 0) === 6, 'en alt satır deliğin üstü');
  const k = M.karistir(d.t, () => 0.3);
  dogru(k[3][3] === M.DELIK && k[7][0] === M.DELIK, 'karıştırmada delik yerinde');
  dogru(!M.tumHamleler(d.t, oz, d.engel).some(([a, b]) => d.t[a[0]][a[1]] === M.DELIK || d.t[b[0]][b[1]] === M.DELIK), 'delikle takas yok');
}
{
  // Çiçek: eşleşmede yalnız kendi rengiyle, özel parçayla her renkle tozlanır
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  const z = t.map((s) => s.map(() => 0));
  z[7][0] = M.CICEK + 0; // çilek çiçeği
  z[7][1] = M.CICEK + 1; // limon çiçeği
  const ad = M.cozumAdimi(t, oz, { engel: en });
  const er = M.karEriyen(ad, en, z, t);
  dogru(er.length === 1 && er[0][1] === 0, 'yalnız çilek çiçeği tozlanmalı: ' + JSON.stringify(er));
  const u = M.adimUygula(t, oz, en, ad, () => 0.3, z);
  dogru(u.sayac.cicek === 1 && u.zemin[7][0] === 0 && u.zemin[7][1] === M.CICEK + 1, 'çiçek sayacı');
  const ad2 = M.cozumAdimi(t, oz, { engel: en, ek: [[7, 1]] });
  dogru(M.karEriyen({ ...ad2, gruplar: [] }, en, z, t).some(([r, c]) => c === 1), 'özel parça her rengi tozlamalı');
}
{
  // Bant: satır kayar, uçtan çıkan öbür uçtan girer; engel ve özel hal birlikte taşınır
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[3][7] = 'buz';
  oz[3][2] = 'bomba';
  const b = M.bantKaydir(t, oz, en, [{ satir: 3, yon: 1 }]);
  dogru(b.t[3][0] === t[3][7] && b.engel[3][0] === 'buz' && b.oz[3][3] === 'bomba' && b.t[3][1] === t[3][0], 'bant sağa kaydırmalı');
  const b2 = M.bantKaydir(t, oz, en, [{ satir: 3, yon: -1 }]);
  dogru(b2.t[3][7] === t[3][0] && b2.engel[3][6] === 'buz', 'bant sola kaydırmalı');
  // Saat: her hamlede azalır, sıfırda kaybedilir
  const e2 = t.map((s) => s.map(() => null));
  e2[0][0] = 'saat1';
  const k = M.hamleSonrasiKurallar({ t, oz, engel: e2, zemin: null }, { hedef: { saat: 1 } }, { top: {}, puan: 0, hedefTamam: () => false }, () => 0.5);
  dogru(k.kaybetti, 'saat sıfırda kaybettirmeli');
}
{
  // Akıntı kapısı: 0. sütunun en altı boşalınca o sütunun meyveleri 7. sütunun üstüne akar
  M.seviyeKur({ kapilar: [{ giris: [7, 0], cikis: [0, 7] }] });
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  const zs = M.akisZincirleri(t);
  dogru(zs.reduce((a, z) => a + z.length, 0) === 64, 'zincirler bütün hücreleri kapsamalı');
  const z7 = zs.find((z) => z[0][0] === 7 && z[0][1] === 7);
  dogru(z7 && z7.length === 16, '7. sütun zinciri 0. sütunla birleşmeli: ' + (z7 && z7.length));
  const t2 = t.map((s) => s.slice());
  t2[7][7] = -1;
  const y = M.yercekimi(t2, () => 0.2);
  dogru(y.kaymalar.some((k) => k.eski[0] === 7 && k.eski[1] === 0 && k.yeni[0] === 0 && k.yeni[1] === 7), '0. sütunun dibindeki meyve 7. sütunun üstüne akmalı');
  dogru(y.yeniler.length === 1 && y.yeniler[0].yeni[1] === 0, 'yeni meyve 0. sütunun üstünden gelmeli');
  M.seviyeKur(null);
}
{
  // Kafes: eşleşme kafesli meyveyi temizlemez; anahtar en alta inince kafesler açılır
  M.turSayisiAyarla(6);
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[7][1] = 'kafes';
  const ad = M.cozumAdimi(t, oz, { engel: en });
  dogru(!ad.hucreler.some(([r, c]) => r === 7 && c === 1), 'kafesli meyve temizlenmemeli');
  const t2 = t.map((s) => s.slice());
  t2[7][5] = M.ANAHTAR;
  const en2 = en.map((s) => s.slice());
  en2[2][2] = 'kafes';
  const ad2 = M.cozumAdimi(t2, oz, { engel: en2 });
  const u = M.adimUygula(t2, oz, en2, ad2, () => 0.3);
  dogru(u.sayac.anahtar === 1 && u.sayac.kafes >= 1 && !u.engel.flat().includes('kafes'), 'anahtar kafesleri açmalı: ' + JSON.stringify(u.sayac));
  // Bukalemun: renk değiştirir, takas edilebilir
  const en3 = t.map((s) => s.map(() => null));
  en3[0][0] = 'buk';
  const b = M.bukalemunDegistir(t, en3);
  dogru(b[0][0] === (t[0][0] + 1) % 6 && b[0][1] === t[0][1], 'bukalemun sonraki renge geçmeli');
  dogru(M.serbestMi('buk') && !M.serbestMi('kafes'), 'bukalemun serbest, kafes kilitli');
}
{
  // Balon: komşu eşleşmeyle yükselir, en üstte uçar, yerçekimi onu atlar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  t[6][1] = M.BALON;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  const ad = M.cozumAdimi(t, oz, { engel: en });
  dogru(ad.balonlar.length === 1, 'balon yükselmeli');
  const u = M.adimUygula(t, oz, en, ad, () => 0.3);
  dogru(u.t[5][1] === M.BALON && u.sayac.balonKalk === 1, 'balon bir kare yükselmeli: ' + u.t.map((s) => s[1]).join(','));
  const t2 = t.map((s) => s.slice());
  t2[6][1] = t[6][1] === M.BALON ? 4 : t[6][1];
  t2[0][4] = M.BALON;
  const ad2 = M.cozumAdimi(t2, oz, { engel: en, ek: [[0, 4]] });
  const u2 = M.adimUygula(t2, oz, en, ad2, () => 0.3);
  dogru(u2.sayac.balon === 1 && !u2.t.flat().includes(M.BALON), 'en üstteki balon uçmalı');
}
{
  // Bal: üstünde temizlenince silinir; yayılır
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  const z = t.map((s) => s.map(() => 0));
  z[7][1] = M.BAL;
  z[3][3] = M.BAL;
  const ad = M.cozumAdimi(t, oz, { engel: en });
  const u = M.adimUygula(t, oz, en, ad, () => 0.3, z);
  dogru(u.sayac.bal === 1 && u.zemin[7][1] === 0, 'bal silinmeli');
  const y = M.balYay(t, u.zemin, () => 0.1);
  dogru(y && y.zemin.flat().filter((v) => v === M.BAL).length === 2, 'bal yayılmalı');
  dogru(M.kalanlariYaz({}, en, u.zemin).balKalan === 1, 'bal kalan sayısı');
}
{
  // Kurbağa: komşu meyveyi yer, 5'te doyar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[3][3] = M.KURBAGA;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[3][3] = 'kurb4';
  const k = M.kurbagaBeslen(t, oz, en, () => 0.1);
  dogru(k.sayac.kurbaga === 1 && k.patlamalar.length === 1 && !k.t.flat().includes(M.KURBAGA), 'doyan kurbağa gitmeli');
  en[3][3] = 'kurb1';
  const k2 = M.kurbagaBeslen(t, oz, en, () => 0.1);
  dogru(k2.t.flat().filter((v) => v === M.KURBAGA).length === 1 && k2.engel.flat().includes('kurb2'), 'kurbağa zıplayıp yemeli');
  dogru(M.serbestMi('kurb3'), 'kurbağa takas edilebilir');
}
{
  // Fener: komşu eşleşme yakmaz, özel parça alanı (ek) yakar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  t[6][1] = M.FENER;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  dogru(M.cozumAdimi(t, oz, { engel: en }).fenerler.length === 0, 'komşu eşleşme feneri yakmamalı');
  const ad = M.cozumAdimi(t, oz, { engel: en, ek: [[6, 1]] });
  const u = M.adimUygula(t, oz, en, ad, () => 0.3);
  dogru(ad.fenerler.length === 1 && u.sayac.fener === 1, 'özel parça alanı feneri yakmalı');
}
{
  // Uzay: yerçekimi sola dönünce boşluk sağdan dolar, meyve sola kayar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  M.yonAyarla('sol');
  const t2 = t.map((s) => s.slice());
  t2[4][0] = -1;
  const y = M.yercekimi(t2, () => 0.2);
  dogru(y.kaymalar.some((k) => k.eski[0] === 4 && k.eski[1] === 1 && k.yeni[1] === 0), 'sola düşmeli');
  dogru(y.yeniler.length === 1 && y.yeniler[0].yeni[1] === 7 && y.yeniler[0].yeni[0] === 4, 'yeni meyve sağ kenardan gelmeli');
  M.yonAyarla('yukari');
  const t3 = t.map((s) => s.slice());
  t3[0][2] = -1;
  const y3 = M.yercekimi(t3, () => 0.2);
  dogru(y3.yeniler[0].yeni[0] === 7 && y3.kaymalar.some((k) => k.eski[0] === 1 && k.yeni[0] === 0), 'yukarı düşmeli');
  M.yonAyarla('asagi');
}
{
  // Kovan: kırılmaz, vurulunca arı çıkar; arı bir engele vurur
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  t[7][0] = 0; t[7][1] = 0; t[7][2] = 0;
  t[6][1] = M.KOVAN;
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  en[6][1] = 9;
  en[1][5] = 'buz';
  const z = M.zincirCoz(t, oz, en, null, { rnd: () => 0.3 });
  dogru(z.sayac.ari >= 1 && z.sayac.buz >= 1 && z.t.flat().includes(M.KOVAN), 'kovan kalmalı, arı buzu kırmalı: ' + JSON.stringify(z.sayac));
}
{
  // Domino: bir tanesine vurulunca bitişik aynı yöndekiler de devrilir, uçlar patlar
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  for (const c of [2, 3, 4]) {
    t[4][c] = M.DOMINO;
    en[4][c] = 'domy';
  }
  const ad = M.cozumAdimi(t, oz, { engel: en, ek: [[4, 2]] });
  dogru(ad.dominolar.length === 3, '3 domino devrilmeli: ' + ad.dominolar.length);
  dogru(ad.hucreler.some(([r, c]) => r === 4 && c === 1) && ad.hucreler.some(([r, c]) => r === 4 && c === 5), 'uçlar patlamalı');
}
{
  // Ayna: sol yarıdaki hamlenin aynası sağ yarıda eşleşme yapıyorsa döner, yapmıyorsa null
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  const sim = (x) => { for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) x[r][7 - c] = x[r][c]; };
  sim(t);
  const h = M.tumHamleler(t, oz, en).find(([a, b]) => a[1] < 4 && b[1] < 4);
  dogru(!!h, 'simetrik tahtada sol yarıda hamle olmalı');
  if (h) {
    const m = M.aynaHamlesi(h, t, oz, en);
    dogru(m && m[0][1] === 7 - h[0][1] && m[1][1] === 7 - h[1][1], 'ayna hamlesi bulunmalı: ' + JSON.stringify(m));
  }
  const t2 = t.map((s) => s.slice());
  for (let r = 0; r < 8; r++) for (let c = 4; c < 8; c++) t2[r][c] = M.KASA;
  if (h) dogru(M.aynaHamlesi(h, t2, oz, en) === null, 'sağ yarı kasa doluyken ayna olmamalı');
}
{
  // Kartopu: yanında eşleşme olunca büyür; en alta inince patlar ve alanı temizler
  const t = [];
  for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
  const oz = t.map((s) => s.map(() => null));
  const en = t.map((s) => s.map(() => null));
  t[3][4] = M.KARTOPU;
  en[3][4] = 'kt1';
  t[3][1] = 0; t[3][2] = 0; t[3][3] = 0;
  const ad = M.cozumAdimi(t, oz, { engel: en });
  dogru(ad.buyuyen.some(([r, c]) => r === 3 && c === 4), 'kartopu büyümeli');
  const u = M.adimUygula(t, oz, en, ad, () => 0.4);
  const yer = u.t.flat().indexOf(M.KARTOPU);
  dogru(yer >= 0 && u.engel[Math.floor(yer / 8)][yer % 8] === 'kt2', 'kartopu 2 boy olmalı: ' + (yer >= 0 && u.engel[Math.floor(yer / 8)][yer % 8]));
  const t2 = t.map((s) => s.slice());
  const en2 = en.map((s) => s.slice());
  t2[3][4] = 1; en2[3][4] = null; t2[3][1] = 1; t2[3][2] = 2; t2[3][3] = 4;
  t2[7][3] = M.KARTOPU; en2[7][3] = 'kt2';
  const z = M.zincirCoz(t2, oz, en2, null, { rnd: () => 0.3 });
  dogru(z.sayac.kartopu === 1 && (z.sayac.topla ? Object.values(z.sayac.topla).reduce((a, b) => a + b, 0) : 0) >= 6, 'kartopu en altta patlamalı: ' + JSON.stringify(z.sayac));
}
{
  // İstiridye: açıkken yanında eşleşme inci verir, kapalıyken vermez; hamleden sonra açılıp kapanır
  const yap = (durum) => {
    const t = [];
    for (let r = 0; r < 8; r++) t.push(Array.from({ length: 8 }, (_, c) => (r * 3 + c * 2 + (r % 2)) % 6));
    const oz = t.map((s) => s.map(() => null));
    const en = t.map((s) => s.map(() => null));
    t[4][4] = M.ISTIRIDYE;
    en[4][4] = durum;
    t[3][3] = 0; t[3][4] = 0; t[3][5] = 0;
    return M.zincirCoz(t, oz, en, null, { rnd: () => 0.3 });
  };
  dogru(yap('ist1').sayac.istiridye === 1, 'açık istiridye inci vermeli');
  dogru(!yap('ist0').sayac.istiridye, 'kapalı istiridye inci vermemeli');
  const z = yap('ist0');
  dogru(z.t.flat().includes(M.ISTIRIDYE), 'kapalı istiridye yerinde kalmalı');
  const e2 = M.istiridyeDegistir(z.engel);
  dogru(e2.flat().includes('ist1'), 'istiridye açılmalı');
}
console.log(hata ? `${hata} HATA` : 'ENGEL TESTLERİ GEÇTİ (kar, tohum sarmaşık, fıçı, sis, delik, çiçek, saat, bant, akıntı kapısı, kafes, bukalemun, balon, bal, kurbağa, fener, yerçekimi yönü, kovan, domino, ayna, kartopu ve istiridye dahil)');
process.exit(hata ? 1 : 0);
