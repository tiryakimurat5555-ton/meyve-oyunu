// Özel parça testleri. Kullanım: bun araclar/ozel-testi.mjs
import * as M from '../oyun/mantik.js';
let hata = 0;
const dogru = (k, m) => { if (!k) { hata++; console.log('HATA:', m); } };
const bos = () => Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r * 2 + c * 3 + (r % 2)) % 4 + 0));
const ozBos = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const IZ = { cizgili: true, bomba: true, gokkusagi: true };
// Arka planı eşleşmesiz yap: 0..3 türleri satranç benzeri
function zemin() { const t = []; for (let r = 0; r < 8; r++) { t.push([]); for (let c = 0; c < 8; c++) t[r].push(((r % 2) * 2 + c) % 4 === 0 ? 1 : ((r + c) % 2 ? 2 : 3)); } return t; }
let t = zemin();
dogru(M.eslesmeleriBul(t).length === 0, 'zemin eşleşmesiz olmalı: ' + JSON.stringify(M.eslesmeleriBul(t)));

// 4'lü yatay -> satir
t = zemin(); for (let c = 1; c <= 4; c++) t[3][c] = 5;
let o = M.ozelOlusumlari(M.eslesmeleriBul(t), [[3, 2], [2, 2]], IZ);
dogru(o.length === 1 && o[0].ozel === 'satir' && o[0].hucre[0] === 3 && o[0].hucre[1] === 2, '4 yatay -> satir, takas yerinde: ' + JSON.stringify(o));
// 4'lü dikey -> sutun (zincirde, yer ortada)
t = zemin(); for (let r = 2; r <= 5; r++) t[r][6] = 5;
o = M.ozelOlusumlari(M.eslesmeleriBul(t), null, IZ);
dogru(o.length === 1 && o[0].ozel === 'sutun', '4 dikey -> sutun');
// 5'li -> gökkuşağı
t = zemin(); for (let c = 0; c <= 4; c++) t[6][c] = 5;
o = M.ozelOlusumlari(M.eslesmeleriBul(t), null, IZ);
dogru(o.length === 1 && o[0].ozel === 'gokkusagi' && o[0].tur === M.GOKKUSAGI, '5 düz -> gökkuşağı');
// izin yoksa 5'li -> çizgili
o = M.ozelOlusumlari(M.eslesmeleriBul(t), null, { cizgili: true });
dogru(o.length === 1 && o[0].ozel === 'satir', 'gökkuşağı izinsiz -> çizgili');
dogru(M.ozelOlusumlari(M.eslesmeleriBul(t), null, { cizgili: false }).length === 0, 'hiç izin yok -> yok');
// L -> bomba, köşede
t = zemin(); t[1][1] = 5; t[1][2] = 5; t[1][3] = 5; t[2][1] = 5; t[3][1] = 5;
o = M.ozelOlusumlari(M.eslesmeleriBul(t), null, IZ);
dogru(o.length === 1 && o[0].ozel === 'bomba' && o[0].hucre[0] === 1 && o[0].hucre[1] === 1 && o[0].hucreler.length === 5, 'L -> bomba köşede: ' + JSON.stringify(o));
// T -> bomba
t = zemin(); t[4][3] = 5; t[4][4] = 5; t[4][5] = 5; t[5][4] = 5; t[6][4] = 5;
o = M.ozelOlusumlari(M.eslesmeleriBul(t), null, IZ);
dogru(o.length === 1 && o[0].ozel === 'bomba', 'T -> bomba');
// 3'lü -> yok
t = zemin(); t[0][0] = 5; t[0][1] = 5; t[0][2] = 5;
dogru(M.ozelOlusumlari(M.eslesmeleriBul(t), null, IZ).length === 0, '3lü özel oluşturmaz');

// Etki alanları
t = zemin();
dogru(M.etkiAlani('satir', 2, 5, t).length === 8, 'satir 8');
dogru(M.etkiAlani('bomba', 0, 0, t).length === 4, 'köşe bomba 4');
dogru(M.etkiAlani('bomba', 4, 4, t).length === 9, 'bomba 9');
dogru(M.etkiAlani('bomba5', 4, 4, t).length === 25, 'bomba5 25');
dogru(M.etkiAlani('arti', 3, 3, t).length === 15, 'arti 15');
dogru(M.etkiAlani('arti3', 3, 3, t).length > 40, 'arti3');
const sayi2 = t.flat().filter((v) => v === 2).length;
dogru(M.etkiAlani('gokkusagi', 0, 0, t, 2).length === sayi2 + 1, 'gökkuşağı hedef renk');

// Zincirleme tetikleme: satir çizgisi bir bombaya değer
t = zemin(); let oz = ozBos(); oz[2][0] = 'satir'; oz[2][6] = 'bomba';
let g = M.genislet(t, oz, [[2, 0]]);
dogru(g.tetiklenen.length === 2, 'iki özel tetiklenmeli');
dogru(g.hucreler.some(([r, c]) => r === 3 && c === 7) && g.hucreler.some(([r, c]) => r === 1 && c === 5), 'bomba alanı dahil');
const tekil = new Set(g.hucreler.map(([r, c]) => r * 8 + c));
dogru(tekil.size === g.hucreler.length, 'tekrar eden hücre olmamalı');
// Korunan hücre silinmez
g = M.genislet(t, oz, [[2, 0], [2, 1]], [[2, 1]]);
dogru(!g.hucreler.some(([r, c]) => r === 2 && c === 1), 'korunan silinmemeli');

// Birleşimler
t = zemin(); oz = ozBos();
oz[3][3] = 'satir'; oz[3][4] = 'sutun';
dogru(M.birlesim(t, oz, [3, 3], [3, 4]).etki === 'arti', 'çizgili+çizgili arti');
oz[3][4] = 'bomba';
dogru(M.birlesim(t, oz, [3, 3], [3, 4]).etki === 'arti3', 'çizgili+bomba arti3');
oz[3][3] = 'bomba';
dogru(M.birlesim(t, oz, [3, 3], [3, 4]).etki === 'bomba5', 'bomba+bomba');
oz = ozBos(); t[3][3] = M.GOKKUSAGI; oz[3][3] = 'gokkusagi';
let b = M.birlesim(t, oz, [3, 3], [3, 4]);
dogru(b.etki === 'gokkusagi' && b.hedefTur === t[3][4] && b.donusum.length === 0, 'gökkuşağı+normal');
oz[3][4] = 'satir';
b = M.birlesim(t, oz, [3, 4], [3, 3]);
dogru(b.etki === 'gokkusagi' && b.donusum.length === t.flat().filter((v) => v === t[3][4]).length, 'gökkuşağı+çizgili dönüşüm ' + b.donusum.length);
oz[3][4] = 'gokkusagi';
dogru(M.birlesim(t, oz, [3, 3], [3, 4]).etki === 'hepsi', 'gökkuşağı+gökkuşağı');
oz = ozBos(); oz[0][0] = 'satir';
dogru(M.birlesim(t, oz, [0, 0], [0, 1]) === null, 'özel+normal birleşim değil');

// Gökkuşağı eşleşmez; hamle sayılır
t = zemin(); t[0][0] = M.GOKKUSAGI; t[0][1] = M.GOKKUSAGI; t[0][2] = M.GOKKUSAGI;
dogru(!M.eslesmeleriBul(t).some((x) => x.tur === M.GOKKUSAGI), 'gökkuşağı eşleşmemeli');
dogru(M.hamleBul(t), 'gökkuşağı varken hamle var');

// Özel parçayı 4'lü sıraya kaydırınca eskisi tetiklenir, yenisi başka hücreye konur
t = zemin(); oz = ozBos(); for (let c = 1; c <= 4; c++) t[5][c] = 0; oz[5][2] = 'sutun';
let ad = M.cozumAdimi(t, oz, { hamle: [[5, 2], [4, 2]], izinli: IZ });
dogru(ad.tetiklenen.some((x) => x.ozel === 'sutun') && ad.olusan.length === 1 && !(ad.olusan[0].hucre[1] === 2), 'eski özel tetiklenmeli, yeni başka yere: ' + JSON.stringify(ad.olusan.map((o) => o.hucre)));

// 5 tür ayarı
M.turSayisiAyarla(5);
for (let i = 0; i < 200; i++) dogru(M.rastgeleTur() < 5, '5 tür');
const yt = M.yeniTahta();
dogru(!yt.flat().includes(5), '5 türlü tahtada erik olmamalı');
M.turSayisiAyarla(6);

console.log(hata ? `${hata} HATA` : 'ÖZEL PARÇA TESTLERİ GEÇTİ');
process.exit(hata ? 1 : 0);
