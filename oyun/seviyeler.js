// Seviyeler. Murat 25 Kasım 2026'da ilk 10 seviyeyi onayladı; aynı gün 7, 9 ve 10 kolaylaştırıldı
// (ilke: uzun soluklu oyun, ilk seviyelerde oyuncu zorlanmaz; bot ilk 10 seviyeyi en az ~%88 geçmeli).
// meyve numaraları: 0 çilek, 1 limon, 2 üzüm, 3 portakal, 4 elma, 5 erik
// hedef: { topla: { tur: adet }, buz: n, kasa: n } ya da { puan: n }; yildiz: [2 yıldız, 3 yıldız] puan eşikleri
// duzen: 8 satır; '.' boş, 'b' buzlu meyve, 'k' kasa, 'K' iki katlı kasa (hedefteki buz/kasa sayısı düzendekiyle aynı olmalı)
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
];

export const TANITIM = {
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
  return Object.entries(h.topla || {}).every(([tur, n]) => (toplanan[tur] || 0) >= n);
}
