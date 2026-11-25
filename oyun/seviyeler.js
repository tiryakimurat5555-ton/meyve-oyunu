// Seviyeler. Murat 25 Kasım 2026'da ilk 10 seviyeyi onayladı; aynı gün 7, 9 ve 10 kolaylaştırıldı
// (ilke: uzun soluklu oyun, ilk seviyelerde oyuncu zorlanmaz; bot ilk 10 seviyeyi en az ~%88 geçmeli).
// meyve numaraları: 0 çilek, 1 limon, 2 üzüm, 3 portakal, 4 elma, 5 erik
// hedef: { topla: { tur: adet }, buz: n, kasa: n } ya da { puan: n }; yildiz: [2 yıldız, 3 yıldız] puan eşikleri
// duzen: 8 satır; '.' boş, 'b' buzlu meyve, 'k' kasa, 'K' iki katlı kasa, 's' kar, 'S' iki katlı kar, 't' tohum, 'v' sarmaşık
// (hedefteki buz/kasa/kar katı/tohum sayısı düzendekiyle aynı olmalı)
// ozel: hangi özel parçalar oluşabilir; yeni: bu seviyede tanıtılan özel parça
export const SEVIYELER = [
  { no: 1, hamle: 20, tur: 5, hedef: { topla: { 0: 10 } }, yildiz: [1500, 2500], ozel: {} },
  { no: 2, hamle: 20, tur: 5, hedef: { topla: { 1: 12, 4: 12 } }, yildiz: [2000, 3000], ozel: {} },
  { no: 3, hamle: 18, tur: 5, hedef: { puan: 1500 }, yildiz: [2200, 3200], ozel: {} },
  { no: 4, hamle: 20, tur: 6, hedef: { topla: { 2: 15 } }, yildiz: [2500, 3800], ozel: { cizgili: true }, yeni: 'cizgili' },
  { no: 5, hamle: 22, tur: 6, hedef: { topla: { 3: 20, 5: 20 } }, yildiz: [3000, 4500], ozel: { cizgili: true }, yeni: 'guc' },
  { no: 6, hamle: 20, tur: 6, hedef: { puan: 3000 }, yildiz: [4000, 5500], ozel: { cizgili: true, bomba: true }, yeni: 'bomba' },
  { no: 7, hamle: 20, tur: 6, hedef: { topla: { 0: 25 } }, yildiz: [3000, 4500], ozel: { cizgili: true, bomba: true } },
  { no: 8, hamle: 22, tur: 6, hedef: { topla: { 1: 15, 2: 15, 4: 15 } }, yildiz: [3500, 5000], ozel: { cizgili: true, bomba: true } },
  { no: 9, hamle: 22, tur: 6, hedef: { puan: 3500 }, yildiz: [4500, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, yeni: 'gokkusagi' },
  // ---- 11-30: Murat 25 Kasım 2026'da taslağı onayladı (buz 11'de, kasa 16'da, iki katlı kasa 23'te tanıtılır);
  // bot ölçümünden sonra 16, 18, 20, 23, 27, 29, 30 kolaylaştırıldı ve buz komşu eşleşmeyle kırılır hale geldi (onaylandı);
  // sağlam rastgele üreteçle yeniden ölçünce 16 (34), 23 (34), 24 (26), 27 (38) hamleye çıkarıldı. Yıldızlar bottan.
  // Yıldız eşikleri bot ölçümüyle belirlenir (2★ ≈ botların %40'ı, 3★ ≈ %75'i).
  { no: 10, hamle: 28, tur: 6, hedef: { topla: { 5: 30, 3: 30 } }, yildiz: [5000, 7000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 11, hamle: 22, tur: 6, hedef: { buz: 8 }, yildiz: [4250, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '..bbbb..', '..bbbb..', '........', '........', '........'], yeni: 'buz' },
  { no: 12, hamle: 22, tur: 6, hedef: { topla: { 1: 20, 2: 15 } }, yildiz: [5000, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 13, hamle: 20, tur: 6, hedef: { buz: 12 }, yildiz: [4250, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '..bbbb..', '..bbbb..', '..bbbb..'] },
  { no: 14, hamle: 24, tur: 6, hedef: { puan: 4000 }, yildiz: [6250, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 15, hamle: 22, tur: 6, hedef: { buz: 15, topla: { 0: 15 } }, yildiz: [4750, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.bbbbb..', '........', '.bbbbb..', '........', '.bbbbb..', '........'] },
  { no: 16, hamle: 34, tur: 6, hedef: { kasa: 8 }, yildiz: [6750, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '........', 'kkkkkkkk'], yeni: 'kasa' },
  { no: 17, hamle: 22, tur: 6, hedef: { topla: { 4: 25 } }, yildiz: [5000, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 18, hamle: 32, tur: 6, hedef: { kasa: 12 }, yildiz: [6250, 7500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '.kkkkkk.', '.kkkkkk.'] },
  { no: 19, hamle: 24, tur: 6, hedef: { buz: 16 }, yildiz: [4750, 5250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..bbbb..', '..bbbb..', '..bbbb..', '..bbbb..', '........', '........'] },
  { no: 20, hamle: 36, tur: 6, hedef: { kasa: 10, buz: 10 }, yildiz: [7000, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.bbbbb..', '..bbbbb.', '........', '........', '...kk...', 'kkkkkkkk'] },
  { no: 21, hamle: 22, tur: 6, hedef: { topla: { 3: 30 } }, yildiz: [5250, 6500], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 22, hamle: 24, tur: 6, hedef: { buz: 14, topla: { 5: 20 } }, yildiz: [5250, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '.bbbbbbb', 'bbbbbbb.', '........', '........', '........'] },
  { no: 23, hamle: 34, tur: 6, hedef: { kasa: 6 }, yildiz: [7250, 8500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '..KKKK..', '...KK...'], yeni: 'kasa2' },
  { no: 24, hamle: 26, tur: 6, hedef: { puan: 6000 }, yildiz: [7750, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 25, hamle: 26, tur: 6, hedef: { buz: 20 }, yildiz: [5000, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..bbbb..', '..bbbb..', '..bbbb..', '..bbbb..', '..bbbb..', '........', '........'] },
  { no: 26, hamle: 22, tur: 6, hedef: { topla: { 2: 25, 1: 25 } }, yildiz: [5500, 6750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 27, hamle: 38, tur: 6, hedef: { kasa: 10 }, yildiz: [7750, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '...kk...', 'kkKKKKkk'] },
  { no: 28, hamle: 26, tur: 6, hedef: { buz: 18, kasa: 10 }, yildiz: [5500, 6750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.bbbbbb.', '.bbbbbb.', '.bbbbbb.', '........', '........', '..kkkk..', '.kkkkkk.'] },
  { no: 29, hamle: 28, tur: 6, hedef: { puan: 7000 }, yildiz: [8750, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 30, hamle: 34, tur: 6, hedef: { buz: 24, kasa: 12 }, yildiz: [6750, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.bbbbbb.', '.bbbbbb.', '.bbbbbb.', '.bbbbbb.', '........', '..kKKk..', 'kkkkkkkk'] },
  // ---- 4. bölüm: Kış Bahçesi (kar) ve 5. bölüm: Çiçek Bahçesi (tohum) ----
  { no: 31, hamle: 20, tur: 6, hedef: { kar: 8 }, yildiz: [4250, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '..ssss..', '..ssss..', '........', '........', '........'], yeni: 'kar' },
  { no: 32, hamle: 24, tur: 6, hedef: { kar: 16 }, yildiz: [5000, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..ssss..', '..ssss..', '..ssss..', '..ssss..', '........', '........'] },
  { no: 33, hamle: 25, tur: 6, hedef: { kar: 12, topla: { 4: 20 } }, yildiz: [5500, 6750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', 'ssssssss', '..ssss..', '........'] },
  { no: 34, hamle: 25, tur: 6, hedef: { puan: 6000 }, yildiz: [7750, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 35, hamle: 26, tur: 6, hedef: { kar: 24 }, yildiz: [5500, 6500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..ssss..', '.sSSSSs.', '.sSSSSs.', '........', '........', '........'], yeni: 'kar2' },
  { no: 36, hamle: 32, tur: 6, hedef: { kar: 16, buz: 8 }, yildiz: [7000, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'ssssssss', '........', '..bbbb..', '..bbbb..', '........', 'ssssssss', '........'] },
  { no: 37, hamle: 43, tur: 6, hedef: { kar: 20 }, yildiz: [9500, 11500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['ss....ss', 's......s', '........', '...SS...', '...SS...', '........', 's......s', 'ss....ss'] },
  { no: 38, hamle: 30, tur: 6, hedef: { kar: 16, kasa: 8 }, yildiz: [6000, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', 'ssssssss', 'ssssssss', '........', '........', '..kkkk..', '.kk..kk.'] },
  { no: 39, hamle: 24, tur: 6, hedef: { topla: { 0: 25, 2: 25 } }, yildiz: [5750, 6750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 40, hamle: 46, tur: 6, hedef: { kar: 40 }, yildiz: [9750, 11250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', 'ssSSSSss', 'ssSSSSss', 'ssssssss', 'ssssssss'] },
  { no: 41, hamle: 20, tur: 6, hedef: { tohum: 1 }, yildiz: [4000, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '...t....', '........', '........', '........', '........'], yeni: 'tohum' },
  { no: 42, hamle: 24, tur: 6, hedef: { tohum: 2 }, yildiz: [5250, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..t..t..', '........', '........', '........', '........', '........'] },
  { no: 43, hamle: 28, tur: 6, hedef: { tohum: 2, topla: { 3: 20 } }, yildiz: [6250, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.t....t.', '........', '........', '........', '........', '........'] },
  { no: 44, hamle: 28, tur: 6, hedef: { puan: 6500 }, yildiz: [8250, 9500], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 45, hamle: 34, tur: 6, hedef: { tohum: 2, kar: 12 }, yildiz: [6250, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '...tt...', '........', '........', '........', '........', 'ssssssss', '..ssss..'] },
  { no: 46, hamle: 38, tur: 6, hedef: { tohum: 3, buz: 8 }, yildiz: [8000, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 't..t..t.', '........', 'bb....bb', 'bb....bb', '........', '........', '........'] },
  { no: 47, hamle: 34, tur: 6, hedef: { tohum: 2, kasa: 8 }, yildiz: [6750, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..t..t..', '........', '........', '........', '........', '.kkkkkk.', '.k....k.'] },
  { no: 48, hamle: 24, tur: 6, hedef: { topla: { 1: 28, 5: 28 } }, yildiz: [6000, 7000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 49, hamle: 47, tur: 6, hedef: { tohum: 4 }, yildiz: [9000, 10750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 't.t..t.t', '........', '........', '........', '........', '........', '........'] },
  { no: 50, hamle: 43, tur: 6, hedef: { tohum: 3, kar: 20 }, yildiz: [8250, 10250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.t..t..t', '........', '........', '........', 'ssSSSSss', 'ssssssss', '........'] },
  // ---- 6. bölüm: Tropik Bahçe (sarmaşık) ----
  { no: 51, hamle: 22, tur: 6, hedef: { sarmasik: 4 }, yildiz: [4250, 4500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '...vv...', '...vv...', '........', '........', '........'], yeni: 'sarmasik' },
  { no: 52, hamle: 24, tur: 6, hedef: { sarmasik: 6 }, yildiz: [4500, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..vvv...', '..vvv...', '........', '........', '........', '........'] },
  { no: 53, hamle: 25, tur: 6, hedef: { sarmasik: 5, topla: { 0: 20 } }, yildiz: [5500, 6500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'v......v', '........', '...v....', '........', 'v......v', '........', '........'] },
  { no: 54, hamle: 26, tur: 6, hedef: { puan: 7000 }, yildiz: [8500, 9500], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 55, hamle: 37, tur: 6, hedef: { sarmasik: 8, kar: 12 }, yildiz: [7750, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.vv..vv.', '.vv..vv.', '........', '........', 'ssssss..', '..ssssss'] },
  { no: 56, hamle: 30, tur: 6, hedef: { sarmasik: 6, tohum: 2 }, yildiz: [6750, 8500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..t..t..', '........', 'vvv..vvv', '........', '........', '........', '........'] },
  { no: 57, hamle: 30, tur: 6, hedef: { sarmasik: 12 }, yildiz: [6250, 7500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['vv....vv', 'v......v', '........', '........', '........', '........', 'v......v', 'vv....vv'] },
  { no: 58, hamle: 26, tur: 6, hedef: { topla: { 3: 30, 4: 30 } }, yildiz: [6250, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 59, hamle: 30, tur: 6, hedef: { sarmasik: 8, kasa: 8 }, yildiz: [6000, 7000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..vvvv..', '..vvvv..', '........', '........', '........', '.kkkkkk.', '.k....k.'] },
  { no: 60, hamle: 34, tur: 6, hedef: { sarmasik: 16, buz: 8 }, yildiz: [6750, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['vvv..vvv', 'v......v', '........', '..bbbb..', '..bbbb..', '........', 'v......v', 'vvv..vvv'] },
  // ---- 7. bölüm: Kiraz Çiçeği Bahçesi (dinlenme: yeni engel yok, karışık) ----
  { no: 61, hamle: 26, tur: 6, hedef: { kar: 8, topla: { 0: 15 } }, yildiz: [5500, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '..ssss..', '..ssss..', '........', '........', '........'] },
  { no: 62, hamle: 32, tur: 6, hedef: { buz: 10, kar: 8 }, yildiz: [7250, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.bbbbb..', '..bbbbb.', '........', '........', '........', 'ssss....', '....ssss'] },
  { no: 63, hamle: 39, tur: 6, hedef: { tohum: 2, sarmasik: 4 }, yildiz: [7750, 9500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..t..t..', '........', '........', 'vv....vv', '........', '........', '........'] },
  { no: 64, hamle: 28, tur: 6, hedef: { puan: 7000 }, yildiz: [8750, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 65, hamle: 26, tur: 6, hedef: { kasa: 8, kar: 16 }, yildiz: [5500, 6500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '..SSSS..', '..SSSS..', '........', '.kkkkkk.', '.k....k.'] },
  { no: 66, hamle: 43, tur: 6, hedef: { tohum: 3, kar: 10 }, yildiz: [8750, 10750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.t..t..t', '........', '........', '........', '........', 'sssss...', '...sssss'] },
  { no: 67, hamle: 24, tur: 6, hedef: { sarmasik: 8, buz: 8 }, yildiz: [4750, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'vv....vv', 'vv....vv', '........', '..bbbb..', '..bbbb..', '........', '........'] },
  { no: 68, hamle: 23, tur: 6, hedef: { topla: { 2: 25, 3: 25, 5: 25 } }, yildiz: [6000, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 69, hamle: 30, tur: 6, hedef: { kar: 20, kasa: 6 }, yildiz: [6250, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', 'ssSSSSss', 'ssssssss', '........', '........', '..kkkk..', '...kk...'] },
  { no: 70, hamle: 51, tur: 6, hedef: { tohum: 2, sarmasik: 6, kar: 12 }, yildiz: [10250, 12500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '...tt...', '........', 'vvv..vvv', '........', '........', 'ssssss..', '..ssssss'] },
];

export const TANITIM = {
  sarmasik: { baslik: 'Yeni: Sarmaşık', metin: 'Sarmaşıklı meyve yer değiştiremez. Yanında ya da üstünde eşleşme yap, sarmaşık kesilsin. Dikkat: bir hamlede hiç sarmaşık kesmezsen yanındaki bir meyveye yayılır!' },
  kar: { baslik: 'Yeni: Kar', metin: 'Bazı karelerin zemini karla kaplı. Karın üstündeki meyveyi patlat, kar erisin. Bütün karı erit!' },
  kar2: { baslik: 'Yeni: Kalın kar', metin: 'Mavi kenarlı kar iki kat: erimesi için üstünde iki kez meyve patlatman gerekir.' },
  tohum: { baslik: 'Yeni: Tohum', metin: 'Tohumlar patlamaz. Altındaki meyveleri patlat, tohum aşağı insin. En alt sıraya ulaşınca çiçek açar!' },
  guc: { baslik: 'Yeni: Güçlendiriciler', metin: 'Tahtanın altındaki Çekiç tek bir parçayı kırar, Karıştır meyveleri karıştırır, +3 Hamle seviyene 3 hamle ekler. Hiçbiri hamle harcamaz.' },
  cizgili: { baslik: 'Yeni: Çizgili meyve', metin: '4 meyveyi yan yana getir. Çizgili meyve patlayınca bütün satırı ya da sütunu temizler.' },
  bomba: { baslik: 'Yeni: Bomba meyve', metin: '5 meyveyi L ya da T şeklinde birleştir. Bomba patlayınca çevresini temizler.' },
  buz: { baslik: 'Yeni: Buzlu meyve', metin: 'Buzlu meyve yer değiştiremez. Hemen yanında meyve eşleştir ya da özel parçayla vur, buz kırılsın.' },
  kasa: { baslik: 'Yeni: Tahta kasa', metin: 'Kasanın hemen yanında meyve eşleştir ya da özel parçayla vur, kasa kırılsın.' },
  kasa2: { baslik: 'Yeni: İki katlı kasa', metin: 'Bu kasalar sağlam: kırmak için iki kez vurman gerekir.' },
  gokkusagi: { baslik: 'Yeni: Gökkuşağı meyvesi', metin: '5 meyveyi düz bir sırada birleştir. Gökkuşağını bir meyveyle değiştir, o renkteki bütün meyveler patlar.' },
};

// Yıldız sayısı: hedefe ulaşıldıysa 1, eşikleri geçtikçe 2 ve 3
export function yildizHesapla(seviye, puan, basarili) {
  if (!basarili) return 0;
  if (puan >= seviye.yildiz[1]) return 3;
  if (puan >= seviye.yildiz[0]) return 2;
  return 1;
}

// Hedefin tamamlanıp tamamlanmadığı. toplanan: { tur: adet }
// toplanan: { tur: adet, buz: kırılan buz, kasa: kırılan kasa }
export function hedefTamam(seviye, toplanan, puan) {
  const h = seviye.hedef;
  if (h.puan) return puan >= h.puan;
  if (h.buz && (toplanan.buz || 0) < h.buz) return false;
  if (h.kasa && (toplanan.kasa || 0) < h.kasa) return false;
  if (h.kar && (toplanan.kar || 0) < h.kar) return false;
  if (h.tohum && (toplanan.tohum || 0) < h.tohum) return false;
  // Sarmaşık yayılabildiği için tahtada kalan sayısına bakılır (oyun her hamleden sonra toplanan.sarmasikKalan'ı yazar)
  if (h.sarmasik && (toplanan.sarmasikKalan == null ? h.sarmasik : toplanan.sarmasikKalan) > 0) return false;
  return Object.entries(h.topla || {}).every(([tur, n]) => (toplanan[tur] || 0) >= n);
}
