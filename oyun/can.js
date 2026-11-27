// Can sistemi (27 Kasım 2026, Murat onayladı): en çok 5 can, kaybedince ya da seviyenin ortasında çıkınca 1 can gider
// (seviye başlarken düşülür, kazanınca geri verilir), her 30 dakikada bir can dolar, ilk 20 seviye can harcamaz.
// Kayıt: ilerleme.can = { n, zaman, sinirsiz } — zaman: can 5'in altına indiğinde sayacın başladığı an (ms), sinirsiz: sınırsız canın bittiği an (ms).
// Ödüllerle 5'in üstüne çıkılabilir; sayaç yalnız 5'in altındayken işler.
export const CAN_EN_COK = 5;
export const CAN_SURE = 30 * 60 * 1000;
export const CANSIZ_SEVIYE = 20;
export const BOS_CAN = { n: CAN_EN_COK, zaman: null, sinirsiz: 0 };

// Bu seviye can ister mi?
export const canGerekli = (no) => no > CANSIZ_SEVIYE;

// Şu anki durum: { n, zaman, sinirsiz (bitiş ms ya da 0), sonraki (sonraki cana kalan ms ya da 0) }
export function canDurumu(can, t = Date.now()) {
  let n = can && typeof can.n === 'number' ? can.n : CAN_EN_COK;
  let z = can && can.zaman ? can.zaman : null;
  if (n < CAN_EN_COK) {
    if (z == null || z > t) z = t;
    const k = Math.floor((t - z) / CAN_SURE);
    if (k > 0) {
      n = Math.min(CAN_EN_COK, n + k);
      z = n >= CAN_EN_COK ? null : z + k * CAN_SURE;
    }
  } else z = null;
  const sinirsiz = can && can.sinirsiz > t ? can.sinirsiz : 0;
  return { n, zaman: z, sinirsiz, sonraki: n < CAN_EN_COK ? z + CAN_SURE - t : 0 };
}

const kayitYap = (d) => ({ n: d.n, zaman: d.zaman, sinirsiz: d.sinirsiz });

// Oynanabilir mi (can var ya da sınırsız can sürüyor)
export const oynanabilir = (can, t = Date.now()) => {
  const d = canDurumu(can, t);
  return d.sinirsiz > 0 || d.n > 0;
};

// Bir can harca (sınırsız can sürüyorsa harcanmaz). Döner: { can, harcandi }
export function canHarca(can, t = Date.now()) {
  const d = canDurumu(can, t);
  if (d.sinirsiz > 0 || d.n <= 0) return { can: kayitYap(d), harcandi: false };
  const n = d.n - 1;
  return { can: { n, zaman: n < CAN_EN_COK ? (d.n >= CAN_EN_COK ? t : d.zaman) : null, sinirsiz: d.sinirsiz }, harcandi: true };
}

// k can ekle (5'in üstüne çıkabilir)
export function canEkle(can, k, t = Date.now()) {
  const d = canDurumu(can, t);
  const n = d.n + k;
  return { n, zaman: n < CAN_EN_COK ? d.zaman : null, sinirsiz: d.sinirsiz };
}

// dk dakika sınırsız can ekle (sürüyorsa üstüne eklenir)
export function sinirsizEkle(can, dk, t = Date.now()) {
  const d = canDurumu(can, t);
  return { n: d.n, zaman: d.zaman, sinirsiz: Math.max(t, d.sinirsiz) + dk * 60000 };
}

// Kalan süre yazısı: "12:05" (ekran) ve "12 dakika" (ekran okuyucu)
export function sureYazi(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const sa = Math.floor(s / 3600);
  const dk = Math.floor((s % 3600) / 60);
  const sn = s % 60;
  const iki = (v) => String(v).padStart(2, '0');
  return sa ? `${sa}:${iki(dk)}:${iki(sn)}` : `${dk}:${iki(sn)}`;
}
export function sureSoz(ms) {
  const dk = Math.max(1, Math.ceil(ms / 60000));
  if (dk < 60) return `${dk} dakika`;
  const sa = Math.floor(dk / 60);
  const k = dk % 60;
  return k ? `${sa} saat ${k} dakika` : `${sa} saat`;
}

// Ekran okuyucu için can durumu cümlesi
export function canSoz(d) {
  if (d.sinirsiz) return `Sınırsız can, ${sureSoz(d.sinirsiz - Date.now())} kaldı`;
  if (d.n >= CAN_EN_COK) return `Can ${d.n}, dolu`;
  return `Can ${d.n}, sonraki can ${sureSoz(d.sonraki)} sonra`;
}
