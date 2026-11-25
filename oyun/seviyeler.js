// Seviyeler. Murat 25 Kasım 2026'da ilk 10 seviyeyi onayladı; aynı gün 7, 9 ve 10 kolaylaştırıldı
// (ilke: uzun soluklu oyun, ilk seviyelerde oyuncu zorlanmaz; bot ilk 10 seviyeyi en az ~%88 geçmeli).
// meyve numaraları: 0 çilek, 1 limon, 2 üzüm, 3 portakal, 4 elma, 5 erik
// hedef: { topla: { tur: adet }, buz: n, kasa: n } ya da { puan: n }; yildiz: [2 yıldız, 3 yıldız] puan eşikleri
// duzen: 8 satır; '.' boş, 'b' buzlu meyve, 'k' kasa, 'K' iki katlı kasa, 's' kar, 'S' iki katlı kar, 't' tohum, 'v' sarmaşık, 'g' sis, 'x' delik, 'f' fıçı (3 kat), 'F' ödüllü fıçı
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
  // ---- 8. bölüm: Bağ Bozumu (fıçı: 3 vuruş; ödüllü fıçıdan özel meyve çıkar) ----
  { no: 71, hamle: 26, tur: 6, hedef: { fici: 2 }, yildiz: [5000, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '...ff...', '........'], yeni: 'fici' },
  { no: 72, hamle: 30, tur: 6, hedef: { fici: 4 }, yildiz: [6000, 7000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '..f..f..', '........', '..f..f..'] },
  { no: 73, hamle: 31, tur: 6, hedef: { fici: 3, topla: { 2: 16 } }, yildiz: [6500, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '.f..F..f', '........'], yeni: 'fici_odul' },
  { no: 74, hamle: 33, tur: 6, hedef: { fici: 4, buz: 8 }, yildiz: [7000, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..bbbb..', '..bbbb..', '........', '........', '........', '.f....f.', '..F..F..'] },
  { no: 75, hamle: 35, tur: 6, hedef: { fici: 4, kasa: 6 }, yildiz: [6750, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '........', '.kffffk.', 'kk....kk'] },
  { no: 76, hamle: 30, tur: 6, hedef: { puan: 7500 }, yildiz: [9250, 10500], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 77, hamle: 34, tur: 6, hedef: { fici: 4, kar: 12 }, yildiz: [6750, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '........', '........', '.f.FF.f.', 'ssssss..', '..ssssss'] },
  { no: 78, hamle: 30, tur: 6, hedef: { fici: 4, sarmasik: 6 }, yildiz: [6000, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'vvv..vvv', '........', '........', '........', '........', '..fFFf..', '........'] },
  { no: 79, hamle: 36, tur: 6, hedef: { fici: 2, tohum: 2 }, yildiz: [6750, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..t..t..', '........', '........', '........', '........', '...FF...', '........'] },
  { no: 80, hamle: 43, tur: 6, hedef: { fici: 8, kar: 8, buz: 6 }, yildiz: [8250, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.bbbbbb.', '........', '........', 'ssssssss', '........', '.ffFFff.', '..f..f..'] },
  // ---- 9. bölüm: Gece Bahçesi (sis: altındaki meyveyi gizler; yanında eşleşme dağıtır) ----
  { no: 81, hamle: 20, tur: 6, hedef: { sis: 6 }, yildiz: [4000, 4250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '..ggg...', '..ggg...', '........', '........', '........'], yeni: 'sis' },
  { no: 82, hamle: 18, tur: 6, hedef: { sis: 10 }, yildiz: [3500, 4000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.gg..gg.', '.gg..gg.', '........', '..g..g..', '........', '........'] },
  { no: 83, hamle: 19, tur: 6, hedef: { sis: 8, topla: { 4: 24 } }, yildiz: [4000, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'gg....gg', 'gg....gg', '........', '........', '........', '........', '........'] },
  { no: 84, hamle: 22, tur: 6, hedef: { sis: 8, buz: 14 }, yildiz: [4500, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..gggg..', '..gggg..', '........', '........', '.bbbbbb.', '.b....b.', 'bbb..bbb'] },
  { no: 85, hamle: 28, tur: 6, hedef: { puan: 6500 }, yildiz: [8500, 9500], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 86, hamle: 34, tur: 6, hedef: { sis: 10, kar: 10 }, yildiz: [7000, 8500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.ggggg..', '..ggggg.', '........', '........', 'sssss...', '...sssss'] },
  { no: 87, hamle: 26, tur: 6, hedef: { sis: 8, fici: 4 }, yildiz: [5000, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'gggggggg', '........', '........', '........', '........', '..fFFf..', '........'] },
  { no: 88, hamle: 20, tur: 6, hedef: { sis: 6, sarmasik: 6 }, yildiz: [4000, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'vv....vv', 'v......v', '..gggg..', '..g..g..', '........', '........', '........'] },
  { no: 89, hamle: 18, tur: 6, hedef: { topla: { 1: 26, 3: 26 } }, yildiz: [4750, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 90, hamle: 40, tur: 6, hedef: { sis: 12, fici: 4, kar: 8 }, yildiz: [7750, 9250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['gg....gg', 'gg....gg', '........', '..gggg..', '........', '........', '.fFFf...', 'ssssssss'] },
  // ---- 10. bölüm: Kristal Bahçe (şekilli tahtalar: 'x' delik; meyveler deliğin üstünden atlayarak düşer) ----
  { no: 91, hamle: 22, tur: 6, hedef: { topla: { 0: 18, 2: 18 } }, yildiz: [4500, 5500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['xx....xx', 'x......x', '........', '........', '........', '........', 'x......x', 'xx....xx'], yeni: 'delik' },
  { no: 92, hamle: 20, tur: 6, hedef: { buz: 8 }, yildiz: [3750, 4000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['x..xx..x', '........', '..bbbb..', '..bbbb..', 'x......x', 'xx....xx', 'xxx..xxx', 'xxx..xxx'] },
  { no: 93, hamle: 26, tur: 6, hedef: { kar: 12 }, yildiz: [4750, 5500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..ssss..', '.s.xx.s.', '.s.xx.s.', '..ssss..', '........', '........'] },
  { no: 94, hamle: 22, tur: 6, hedef: { sarmasik: 6 }, yildiz: [4250, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['xx....xx', 'xx.vv.xx', '........', 'v......v', 'v......v', '........', 'xx....xx', 'xx....xx'] },
  { no: 95, hamle: 28, tur: 6, hedef: { puan: 3500 }, yildiz: [5000, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['xxx..xxx', 'xx....xx', 'x......x', '........', '........', 'x......x', 'xx....xx', 'xxx..xxx'] },
  { no: 96, hamle: 43, tur: 6, hedef: { tohum: 2 }, yildiz: [7000, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.t....t.', '........', '...xx...', '...xx...', '........', '........'] },
  { no: 97, hamle: 36, tur: 6, hedef: { fici: 4, sis: 6 }, yildiz: [5500, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.gg..gg.', '..g..g..', 'x.xxxx.x', '........', '........', '..fFFf..', '........'] },
  { no: 98, hamle: 28, tur: 6, hedef: { kar: 14 }, yildiz: [4750, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['ssssssss', '.ssssss.', 'xx....xx', 'xx....xx', 'xx....xx', 'xx....xx', '........', '........'] },
  { no: 99, hamle: 24, tur: 6, hedef: { topla: { 1: 18, 5: 18 } }, yildiz: [3000, 3750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['x......x', '.x....x.', '..x..x..', '........', '........', '..x..x..', '.x....x.', 'x......x'] },
  { no: 100, hamle: 43, tur: 6, hedef: { buz: 5, sis: 5, kasa: 4, kar: 4 }, yildiz: [6750, 7750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['x..xx..x', '.bb..gg.', '.bb..gg.', '.b....g.', 'x......x', 'xx....xx', 'xxkkkkxx', 'xxssssxx'] },
  // ---- 11. bölüm: Arı Bahçesi (çiçek: üstünde kendi rengindeki meyve patlayınca tozlanır) ----
  { no: 101, hamle: 27, tur: 6, hedef: { cicek: 4 }, yildiz: [6250, 7500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '...11...', '...11...', '........', '........', '........'], yeni: 'cicek' },
  { no: 102, hamle: 31, tur: 6, hedef: { cicek: 6 }, yildiz: [7500, 9250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '.1....2.', '.1....2.', '.1....2.', '........', '........', '........'] },
  { no: 103, hamle: 37, tur: 6, hedef: { cicek: 8 }, yildiz: [9000, 10750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..3..3..', '........', '.5....5.', '.5....5.', '........', '..3..3..', '........'] },
  { no: 104, hamle: 29, tur: 6, hedef: { cicek: 6, buz: 8 }, yildiz: [7250, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.bbbbbb.', '.b....b.', '..4..4..', '..2..2..', '..6..6..', '........', '........'] },
  { no: 105, hamle: 26, tur: 6, hedef: { puan: 6500 }, yildiz: [8250, 9250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 106, hamle: 38, tur: 6, hedef: { cicek: 10 }, yildiz: [9250, 11000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.1.2.3.4', '........', '........', '4.3.2.1.', '........', '..5..6..', '........'] },
  { no: 107, hamle: 33, tur: 6, hedef: { cicek: 8, kar: 8 }, yildiz: [7750, 9000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', 'ssssssss', '........', '..1234..', '..5612..', '........', '........'] },
  { no: 108, hamle: 30, tur: 6, hedef: { cicek: 8 }, yildiz: [6500, 7500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['xx....xx', 'x......x', '..1..2..', '..3..4..', '..5..6..', '..1..2..', 'x......x', 'xx....xx'] },
  { no: 109, hamle: 22, tur: 6, hedef: { topla: { 0: 22, 2: 22 } }, yildiz: [5250, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 110, hamle: 37, tur: 6, hedef: { cicek: 12, sis: 6, kasa: 4 }, yildiz: [8250, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.gg..gg.', '.g....g.', '.123456.', '.654321.', '........', '..kkkk..', '........'] },
  // ---- 12. bölüm: Saat Kulesi (saatli meyve: her hamlede azalır; sıfıra inmeden patlat, yoksa seviye kaybedilir) ----
  { no: 111, hamle: 20, tur: 6, hedef: { saat: 2 }, yildiz: [4000, 4500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 14, duzen: ['........', '........', '........', '..z..z..', '........', '........', '........', '........'], yeni: 'saat' },
  { no: 112, hamle: 22, tur: 6, hedef: { saat: 3 }, yildiz: [4500, 5250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 12, duzen: ['........', '........', '.z..z..z', '........', '........', '........', '........', '........'] },
  { no: 113, hamle: 24, tur: 6, hedef: { saat: 3, topla: { 1: 15 } }, yildiz: [5250, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 14, duzen: ['........', 'z......z', '........', '........', '...z....', '........', '........', '........'] },
  { no: 114, hamle: 26, tur: 6, hedef: { saat: 4, buz: 8 }, yildiz: [5000, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 14, duzen: ['........', '.z....z.', '..bbbb..', '..bbbb..', '.z....z.', '........', '........', '........'] },
  { no: 115, hamle: 26, tur: 6, hedef: { puan: 6500 }, yildiz: [8000, 9000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 116, hamle: 28, tur: 6, hedef: { saat: 5 }, yildiz: [5500, 6500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 13, duzen: ['z.......', '........', '...z....', '.......z', '........', '..z...z.', '........', '........'] },
  { no: 117, hamle: 30, tur: 6, hedef: { saat: 4, kar: 10 }, yildiz: [6250, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 14, duzen: ['........', '..z..z..', '........', '........', '.z....z.', 'sssss...', '...sssss', '........'] },
  { no: 118, hamle: 32, tur: 6, hedef: { saat: 4, cicek: 6 }, yildiz: [7500, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 18, duzen: ['........', '.z....z.', '........', '..1..2..', '..3..4..', '..5..6..', '.z....z.', '........'] },
  { no: 119, hamle: 20, tur: 6, hedef: { topla: { 3: 20, 4: 20 } }, yildiz: [4750, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 120, hamle: 40, tur: 6, hedef: { saat: 6, kasa: 4, sis: 4 }, yildiz: [7000, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, saat: 20, duzen: ['z......z', '.gg..gg.', '........', '..z..z..', '........', 'z.kkkk.z', '........', '........'] },
  // ---- 13. bölüm: Rüzgârlı Tepe (taşıyıcı bant: işaretli satırlar her hamleden sonra bir kare kayar) ----
  { no: 121, hamle: 15, tur: 6, hedef: { topla: { 0: 18, 4: 18 } }, yildiz: [4000, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 3, yon: 1 }], yeni: 'bant' },
  { no: 122, hamle: 16, tur: 6, hedef: { buz: 16 }, yildiz: [4250, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 2, yon: 1 }, { satir: 5, yon: -1 }], duzen: ['bbbbbbbb', '........', '........', '........', '........', '........', '........', 'bbbbbbbb'] },
  { no: 123, hamle: 15, tur: 6, hedef: { kar: 12 }, yildiz: [3500, 4500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 4, yon: -1 }], duzen: ['........', '........', '........', '........', '........', 'ssssss..', '..ssssss', '........'] },
  { no: 124, hamle: 23, tur: 6, hedef: { cicek: 6 }, yildiz: [6750, 8000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 3, yon: 1 }], duzen: ['........', '........', '.1....2.', '........', '.3....4.', '.5....6.', '........', '........'] },
  { no: 125, hamle: 24, tur: 6, hedef: { puan: 9000 }, yildiz: [10250, 11000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 2, yon: 1 }, { satir: 5, yon: -1 }] },
  { no: 126, hamle: 18, tur: 6, hedef: { sis: 16 }, yildiz: [4250, 5250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 3, yon: 1 }, { satir: 4, yon: -1 }], duzen: ['gggg....', 'gggg....', '........', '........', '........', '........', '....gggg', '....gggg'] },
  { no: 127, hamle: 22, tur: 6, hedef: { tohum: 2 }, yildiz: [5250, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 4, yon: 1 }], duzen: ['........', '..t..t..', '........', '........', '........', '........', '........', '........'] },
  { no: 128, hamle: 15, tur: 6, hedef: { saat: 3, kasa: 4 }, yildiz: [3250, 4000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 3, yon: -1 }], saat: 11, duzen: ['........', '........', '.z....z.', '...z....', '........', '........', '..kkkk..', '........'] },
  { no: 129, hamle: 12, tur: 6, hedef: { topla: { 2: 22, 5: 22 } }, yildiz: [4000, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 1, yon: 1 }, { satir: 6, yon: -1 }] },
  { no: 130, hamle: 24, tur: 6, hedef: { sarmasik: 6, cicek: 4, buz: 6 }, yildiz: [7500, 9000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, bant: [{ satir: 3, yon: 1 }, { satir: 4, yon: -1 }], duzen: ['vv....vv', 'v......v', '........', '.bbbbbb.', '........', '..1..4..', '..2..5..', '........'] },
  // ---- 14. bölüm: Mantar Ormanı (mantar: kesilse de kesilmese de her 3 hamlede bir yayılır) ----
  { no: 131, hamle: 18, tur: 6, hedef: { mantar: 2 }, yildiz: [3750, 4000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '........', '...m....', '....m...', '........', '........', '........'], yeni: 'mantar' },
  { no: 132, hamle: 23, tur: 6, hedef: { mantar: 12 }, yildiz: [5000, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['mm....mm', 'm......m', '........', '........', '........', '........', 'm......m', 'mm....mm'] },
  { no: 133, hamle: 12, tur: 6, hedef: { mantar: 6, topla: { 3: 14 } }, yildiz: [2750, 3500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..mmm...', '..mmm...', '........', '........', '........', '........'] },
  { no: 134, hamle: 16, tur: 6, hedef: { mantar: 4, buz: 8 }, yildiz: [3500, 4250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'm......m', '..bbbb..', '..bbbb..', 'm......m', '........', '........', '........'] },
  { no: 135, hamle: 24, tur: 6, hedef: { puan: 6000 }, yildiz: [7500, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 136, hamle: 22, tur: 6, hedef: { mantar: 12 }, yildiz: [4750, 5750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['mm....mm', 'm......m', '...mm...', '........', '........', '...mm...', 'm......m', '........'] },
  { no: 137, hamle: 23, tur: 6, hedef: { mantar: 4, kar: 10 }, yildiz: [5000, 6250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.m....m.', '........', '.m....m.', '........', 'sssss...', '...sssss', '........'] },
  { no: 138, hamle: 25, tur: 6, hedef: { mantar: 4, cicek: 6 }, yildiz: [6250, 7500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['m......m', '........', '..1..2..', '..3..4..', '..5..6..', '........', 'm......m', '........'] },
  { no: 139, hamle: 16, tur: 6, hedef: { topla: { 0: 20, 1: 20 } }, yildiz: [4000, 5000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 140, hamle: 20, tur: 6, hedef: { mantar: 10, sis: 4, kasa: 4 }, yildiz: [4000, 4750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['mm....mm', 'mgg..ggm', '........', '...mm...', '...mm...', '..kkkk..', '........', '........'] },
  // ---- 15. bölüm: Kuş Yuvası (yumurta: 2 vuruşta çatlar, içinden çıkan civciv en alta inince yuvaya uçar) ----
  { no: 141, hamle: 30, tur: 6, hedef: { civciv: 2 }, yildiz: [6000, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '........', '..y..y..', '........', '........', '........', '........', '........'], yeni: 'civciv' },
  { no: 142, hamle: 39, tur: 6, hedef: { civciv: 3 }, yildiz: [8250, 9750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.y..y..y', '........', '........', '........', '........', '........', '........'] },
  { no: 143, hamle: 35, tur: 6, hedef: { civciv: 3, topla: { 1: 12 } }, yildiz: [7250, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..y.....', '.....y..', '...y....', '........', '........', '........', '........'] },
  { no: 144, hamle: 30, tur: 6, hedef: { civciv: 2, buz: 8 }, yildiz: [6000, 7250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '..y..y..', '........', '.bbbbbb.', '.b....b.', '........', '........', '........'] },
  { no: 145, hamle: 26, tur: 6, hedef: { puan: 6500 }, yildiz: [8000, 9250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 146, hamle: 38, tur: 6, hedef: { civciv: 4 }, yildiz: [7500, 8750], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['.y....y.', '........', '...yy...', '........', '........', '........', '........', '........'] },
  { no: 147, hamle: 38, tur: 6, hedef: { civciv: 3, kar: 8 }, yildiz: [8000, 9500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.y..y..y', '........', '........', '........', '........', 'ssssssss', '........'] },
  { no: 148, hamle: 34, tur: 6, hedef: { civciv: 2, tohum: 2 }, yildiz: [7000, 8250], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', '.t.yy.t.', '........', '........', '........', '........', '........', '........'] },
  { no: 149, hamle: 18, tur: 6, hedef: { topla: { 2: 20, 3: 20 } }, yildiz: [4250, 5250], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
  { no: 150, hamle: 44, tur: 6, hedef: { civciv: 4, sis: 4, mantar: 4 }, yildiz: [8750, 10500], ozel: { cizgili: true, bomba: true, gokkusagi: true }, duzen: ['........', 'yggyyggy', '........', 'm......m', 'm......m', '........', '........', '........'] },
];

export const TANITIM = {
  civciv: { baslik: 'Yeni: Yumurta ve civciv', metin: 'Yuvadaki yumurtanın yanında iki kez eşleşme yap: önce çatlar, sonra içinden civciv çıkar. Civciv tohum gibi aşağı iner; en alt sıraya ulaşınca yuvaya uçar!' },
  mantar: { baslik: 'Yeni: Mantar', metin: 'Mantarlı meyve yer değiştiremez; yanında eşleşme yap, mantar temizlensin. Dikkat: mantarlar her 3 hamlede bir yanlarındaki meyveye çoğalır. Hepsini temizle!' },
  bant: { baslik: 'Yeni: Rüzgâr', metin: 'Tepede rüzgâr esiyor! Mavi şeritli satırlar her hamleden sonra okların yönünde bir kare kayar; uçtan çıkan meyve öbür uçtan girer. Kayınca yeni eşleşmeler kendiliğinden patlar.' },
  saat: { baslik: 'Yeni: Saatli meyve', metin: 'Saatli meyvenin köşesindeki sayı her hamlede bir azalır. Sıfıra inmeden o meyveyi patlat; yoksa seviye biter! Sayı 3 ve altına inince saat kırmızı olur.' },
  cicek: { baslik: 'Yeni: Çiçekler', metin: 'Bazı karelerde renkli çiçekler var. Bir çiçeği tozlatmak için üstünde kendi rengindeki meyveyi eşleştir: kırmızı çiçeğe çilek, sarı çiçeğe limon. Çizgili, bomba ya da gökkuşağı patlaması ise her çiçeği tozlar!' },
  delik: { baslik: 'Yeni: Şekilli tahtalar', metin: 'Kristal Bahçe\'de tahtalar farklı şekillerde. Boş karelere meyve gidemez; meyveler boşlukların üstünden atlayarak aşağı düşer.' },
  sis: { baslik: 'Yeni: Sis', metin: 'Gece bahçeyi sis kapladı! Sisli karenin altında hangi meyve olduğu görünmez ve yer değiştiremez. Hemen yanında meyve eşleştir ya da özel parçayla vur, sis dağılsın.' },
  fici: { baslik: 'Yeni: Fıçı', metin: 'Fıçılar çok sağlam: kırmak için hemen yanında üç kez meyve eşleştir ya da özel parçayla vur. Her vuruşta biraz daha çatlar.' },
  fici_odul: { baslik: 'Yeni: Ödüllü fıçı', metin: 'Önünde altın yıldız olan fıçı kırılınca yerinde çizgili ya da bomba bir meyve çıkar!' },
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
  for (const [k, n] of Object.entries(h)) {
    if (k === 'topla') continue;
    if (KALAN_HEDEF.includes(k)) {
      // Yayılabilen engeller: tahtada kalan sayısına bakılır (oyun her hamleden sonra toplanan.<ad>Kalan'ı yazar)
      const v = toplanan[k + 'Kalan'];
      if ((v == null ? n : v) > 0) return false;
    } else if ((toplanan[k] || 0) < n) return false;
  }
  return Object.entries(h.topla || {}).every(([tur, n]) => (toplanan[tur] || 0) >= n);
}
export const KALAN_HEDEF = ['sarmasik', 'mantar'];
