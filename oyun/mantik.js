// Meyve oyununun saf mantığı: tahta, eşleşme bulma, yerçekimi, hamle kontrolü, karıştırma.
// Bu dosya React'ten bağımsızdır; node ile test edilebilir (araclar/mantik-testi.js).
// Tahta: tahta[satir][sutun] = tür numarası (0..TUR_SAYISI-1) ya da boş için -1.

export const SATIR = 8;
export const SUTUN = 8;
export const TUR_SAYISI = 6;
// Gökkuşağı meyvesinin rengi yoktur; hiçbir meyveyle eşleşmez.
export const GOKKUSAGI = 9;
// Kasa: meyve değil; eşleşmez, takas edilemez, yerçekimiyle düşer. Kat sayısı engel ızgarasında tutulur.
export const KASA = 20;
// Fıçı (Bağ Bozumu): kasa gibi davranır (takas/eşleşme yok, düşer, yanında eşleşme ya da özel parça bir kat azaltır) ama 3 katlıdır.
// Ödüllü fıçı kırılınca yerinde özel meyve (çizgili ya da bomba) çıkar.
export const FICI = 22;
export const FICI_ODUL = 23;
export const kasaMi = (v) => v === KASA || v === FICI || v === FICI_ODUL;
export const ficiMi = (v) => v === FICI || v === FICI_ODUL;
// Tohum (4. bölüm sonrası, Çiçek Bahçesi): meyve değil; eşleşmez, patlamaz, takas edilebilir, yerçekimiyle düşer.
// En alt sıraya inince toplanır (çiçek açar). Özel parçalar ona işlemez.
export const TOHUM = 21;
// Sarmaşık (Tropik Bahçe): buz gibi meyveyi sarar (engel 'sarmasik'): takas edilemez; eşleşmeye katılınca, yanında eşleşme olunca
// ya da özel parça değince kesilir, meyve kalır. Bir hamlede hiç sarmaşık kesilmezse yanındaki bir meyveye yayılır (sarmasikYay).
// Kar (Kış Bahçesi): parçayla birlikte DÜŞMEYEN zemin katmanı, zemin[r][c] = kat sayısı (0, 1, 2).
// Üstündeki parça temizlenince (eşleşme, özel parça, kırılan kasa) ya da orada özel parça oluşunca bir kat erir.
// Buz yanındaki eşleşmeyle de kırılır (Murat 25 Kasım 2026'da onayladı; önceki kural yalnız eşleşmeye katılınca kırıyordu)
let buzKomsuKirar = true;
export function buzKuraliAyarla(komsu) {
  buzKomsuKirar = !!komsu;
}

// Seviyede kullanılan tür sayısı (ilk seviyelerde 5: erik çıkmaz)
let etkinTur = TUR_SAYISI;
export function turSayisiAyarla(n) {
  etkinTur = Math.max(3, Math.min(TUR_SAYISI, n));
}

export function rastgeleTur(rnd = Math.random) {
  return Math.floor(rnd() * etkinTur);
}

const renkli = (tur) => tur >= 0 && tur < TUR_SAYISI;

export function kopya(t) {
  return t.map((s) => s.slice());
}

// Bu hücreye bu tür konursa hemen üçlü oluşur mu (soldan ve yukarıdan bakar; ilk dolum için)
function ucluOlusturur(t, r, c, tur) {
  if (c >= 2 && t[r][c - 1] === tur && t[r][c - 2] === tur) return true;
  if (r >= 2 && t[r - 1][c] === tur && t[r - 2][c] === tur) return true;
  return false;
}

// Eşleşmesiz ve en az bir hamlesi olan yeni tahta
export function yeniTahta(rnd = Math.random) {
  for (let deneme = 0; deneme < 200; deneme++) {
    const t = [];
    for (let r = 0; r < SATIR; r++) {
      t.push([]);
      for (let c = 0; c < SUTUN; c++) {
        let tur;
        let say = 0;
        do {
          tur = rastgeleTur(rnd);
          say++;
        } while (ucluOlusturur(t, r, c, tur) && say < 50);
        t[r].push(tur);
      }
    }
    if (eslesmeleriBul(t).length === 0 && hamleBul(t)) return t;
  }
  throw new Error('Tahta kurulamadı');
}

// Yatay ve dikey üç ve üzeri dizileri bulur.
// Dönüş: [{ tur, hucreler: [[r,c],...], yon: 'yatay'|'dikey' }]
export function eslesmeleriBul(t) {
  const gruplar = [];
  for (let r = 0; r < SATIR; r++) {
    let c = 0;
    while (c < SUTUN) {
      const tur = t[r][c];
      let son = c;
      while (son + 1 < SUTUN && renkli(tur) && t[r][son + 1] === tur) son++;
      if (renkli(tur) && son - c + 1 >= 3) {
        const h = [];
        for (let k = c; k <= son; k++) h.push([r, k]);
        gruplar.push({ tur, hucreler: h, yon: 'yatay' });
      }
      c = son + 1;
    }
  }
  for (let c = 0; c < SUTUN; c++) {
    let r = 0;
    while (r < SATIR) {
      const tur = t[r][c];
      let son = r;
      while (son + 1 < SATIR && renkli(tur) && t[son + 1][c] === tur) son++;
      if (renkli(tur) && son - r + 1 >= 3) {
        const h = [];
        for (let k = r; k <= son; k++) h.push([k, c]);
        gruplar.push({ tur, hucreler: h, yon: 'dikey' });
      }
      r = son + 1;
    }
  }
  return gruplar;
}

// Gruplardaki hücrelerin tekil listesi
export function silinecekler(gruplar) {
  const gor = new Set();
  const liste = [];
  for (const g of gruplar) {
    for (const [r, c] of g.hucreler) {
      const k = r * SUTUN + c;
      if (!gor.has(k)) {
        gor.add(k);
        liste.push([r, c]);
      }
    }
  }
  return liste;
}

export function komsuMu(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

export function takasla(t, a, b) {
  const y = kopya(t);
  const g = y[a[0]][a[1]];
  y[a[0]][a[1]] = y[b[0]][b[1]];
  y[b[0]][b[1]] = g;
  return y;
}

// Eşleşme oluşturan ilk takası bulur (ipucu ve "hamle kaldı mı" denetimi için). Yoksa null.
// kilit: takas edilemeyen hücreler (buzlu meyve, kasa). Verilmezse kasalar yine de kilitli sayılır.
export function hamleBul(t, oz, kilit) {
  const kilitli = (r, c) => kasaMi(t[r][c]) || (kilit && kilit[r][c]);
  // Gökkuşağı her komşusuyla takas edilebilir; iki özel parça yan yanaysa birleşim de bir hamledir
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++) {
      if (kilitli(r, c)) continue;
      if (t[r][c] === GOKKUSAGI) {
        for (const b of [[r, c + 1], [r, c - 1], [r + 1, c], [r - 1, c]])
          if (b[0] >= 0 && b[1] >= 0 && b[0] < SATIR && b[1] < SUTUN && !kilitli(b[0], b[1])) return [[r, c], b];
      }
      if (oz && oz[r][c]) {
        if (c + 1 < SUTUN && oz[r][c + 1] && !kilitli(r, c + 1)) return [[r, c], [r, c + 1]];
        if (r + 1 < SATIR && oz[r + 1][c] && !kilitli(r + 1, c)) return [[r, c], [r + 1, c]];
      }
    }
  for (let r = 0; r < SATIR; r++) {
    for (let c = 0; c < SUTUN; c++) {
      const komsular = [
        [r, c + 1],
        [r + 1, c],
      ];
      for (const b of komsular) {
        if (b[0] >= SATIR || b[1] >= SUTUN) continue;
        if (kilitli(r, c) || kilitli(b[0], b[1])) continue;
        if (t[r][c] === t[b[0]][b[1]]) continue;
        if (eslesmeleriBul(takasla(t, [r, c], b)).length) return [[r, c], b];
      }
    }
  }
  return null;
}

// Boş (-1) hücreleri yerçekimiyle doldurur.
// Dönüş: { tahta, kaymalar: [{ eski:[r,c], yeni:[r,c] }], yeniler: [{ yeni:[r,c], tur, kacinci }] }
// kacinci: o sütunda yukarıdan düşen kaçıncı yeni meyve (1 = en alttaki); başlangıç yüksekliği için.
export function yercekimi(t, rnd = Math.random) {
  const y = kopya(t);
  const kaymalar = [];
  const yeniler = [];
  for (let c = 0; c < SUTUN; c++) {
    let yaz = SATIR - 1;
    for (let r = SATIR - 1; r >= 0; r--) {
      if (y[r][c] >= 0) {
        if (r !== yaz) {
          y[yaz][c] = y[r][c];
          y[r][c] = -1;
          kaymalar.push({ eski: [r, c], yeni: [yaz, c] });
        }
        yaz--;
      }
    }
    let kacinci = 1;
    for (let r = yaz; r >= 0; r--) {
      const tur = rastgeleTur(rnd);
      y[r][c] = tur;
      yeniler.push({ yeni: [r, c], tur, kacinci });
      kacinci++;
    }
  }
  return { tahta: y, kaymalar, yeniler };
}

// Meyveleri karıştırır: eşleşmesiz ve hamlesi olan bir düzen bulana kadar.
export function karistir(t, rnd = Math.random) {
  const hepsi = [];
  for (let r = 0; r < SATIR; r++) for (let c = 0; c < SUTUN; c++) hepsi.push(t[r][c]);
  for (let deneme = 0; deneme < 500; deneme++) {
    for (let i = hepsi.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [hepsi[i], hepsi[j]] = [hepsi[j], hepsi[i]];
    }
    const y = [];
    for (let r = 0; r < SATIR; r++) y.push(hepsi.slice(r * SUTUN, r * SUTUN + SUTUN));
    if (eslesmeleriBul(y).length === 0 && hamleBul(y)) return y;
  }
  return yeniTahta(rnd);
}

// Puan: 3'lü 30, 4'lü 60, 5 ve üzeri 100; zincir çarpanı (1. patlama x1, 2. x2 ...)
// ÖNERİ: Murat henüz onaylamadı.
export const OZEL_HUCRE_PUANI = 20;

export function grupPuani(boy, zincir) {
  const taban = boy >= 5 ? 100 : boy === 4 ? 60 : 30;
  return taban * Math.max(1, zincir);
}

// ---------------- Özel parçalar ----------------
// Özel parça türleri: 'satir' (satırı temizler), 'sutun' (sütunu temizler), 'bomba' (3x3), 'gokkusagi' (bir rengin hepsi).
// izinli: { cizgili, bomba, gokkusagi } — seviyeye göre hangi özel parçaların oluşabileceği.

const anahtar = (r, c) => r * SUTUN + c;

// Eşleşme gruplarından hangi özel parçaların oluşacağını bulur.
// hamle: takas edilen iki hücre (özel parça oraya konur); zincirde null.
// Dönüş: [{ hucre:[r,c], ozel, tur, hucreler:[[r,c]...] }]
export function ozelOlusumlari(gruplar, hamle, izinli) {
  if (!izinli) return [];
  // Aynı türden ve ortak hücresi olan grupları birleştir (L ve T şekilleri)
  const ebeveyn = gruplar.map((_, i) => i);
  const bul = (i) => (ebeveyn[i] === i ? i : (ebeveyn[i] = bul(ebeveyn[i])));
  for (let i = 0; i < gruplar.length; i++)
    for (let j = i + 1; j < gruplar.length; j++) {
      if (gruplar[i].tur !== gruplar[j].tur) continue;
      const a = new Set(gruplar[i].hucreler.map(([r, c]) => anahtar(r, c)));
      if (gruplar[j].hucreler.some(([r, c]) => a.has(anahtar(r, c)))) ebeveyn[bul(i)] = bul(j);
    }
  const sekiller = new Map();
  gruplar.forEach((g, i) => {
    const k = bul(i);
    if (!sekiller.has(k)) sekiller.set(k, []);
    sekiller.get(k).push(g);
  });
  const sonuc = [];
  for (const gs of sekiller.values()) {
    const hucreMap = new Map();
    for (const g of gs) for (const [r, c] of g.hucreler) hucreMap.set(anahtar(r, c), [r, c]);
    const hucreler = [...hucreMap.values()];
    const enUzun = gs.reduce((a, g) => (g.hucreler.length > a.hucreler.length ? g : a), gs[0]);
    const yatay = gs.some((g) => g.yon === 'yatay');
    const dikey = gs.some((g) => g.yon === 'dikey');
    let ozel = null;
    if (enUzun.hucreler.length >= 5 && izinli.gokkusagi) ozel = 'gokkusagi';
    else if (yatay && dikey && hucreler.length >= 5 && izinli.bomba) ozel = 'bomba';
    else if (enUzun.hucreler.length >= 4 && izinli.cizgili) ozel = enUzun.yon === 'yatay' ? 'satir' : 'sutun';
    if (!ozel) continue;
    let yer = null;
    if (hamle) for (const h of hamle) if (hucreMap.has(anahtar(h[0], h[1]))) yer = h;
    if (!yer && ozel === 'bomba') {
      // L/T'nin köşesi: hem yatay hem dikey gruptaki hücre
      const y = new Set(gs.filter((g) => g.yon === 'yatay').flatMap((g) => g.hucreler.map(([r, c]) => anahtar(r, c))));
      yer = gs.filter((g) => g.yon === 'dikey').flatMap((g) => g.hucreler).find(([r, c]) => y.has(anahtar(r, c))) || null;
    }
    if (!yer) yer = enUzun.hucreler[Math.floor((enUzun.hucreler.length - 1) / 2)];
    sonuc.push({ hucre: yer, ozel, tur: ozel === 'gokkusagi' ? GOKKUSAGI : enUzun.tur, hucreler });
  }
  return sonuc;
}

// Tahtadaki en çok bulunan renk (gökkuşağı bir patlamayla tetiklenince bunu temizler)
export function enCokTur(t) {
  const say = {};
  for (const s of t) for (const v of s) if (renkli(v)) say[v] = (say[v] || 0) + 1;
  let en = 0;
  let tur = 0;
  for (const k of Object.keys(say)) if (say[k] > en) [en, tur] = [say[k], +k];
  return tur;
}

// Bir özel parçanın etki ettiği hücreler
export function etkiAlani(ozel, r, c, t, hedefTur) {
  const h = [];
  if (ozel === 'satir') for (let k = 0; k < SUTUN; k++) h.push([r, k]);
  else if (ozel === 'sutun') for (let k = 0; k < SATIR; k++) h.push([k, c]);
  else if (ozel === 'bomba' || ozel === 'bomba5') {
    const y = ozel === 'bomba5' ? 2 : 1;
    for (let i = r - y; i <= r + y; i++) for (let j = c - y; j <= c + y; j++) if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN) h.push([i, j]);
  } else if (ozel === 'arti') {
    for (let k = 0; k < SUTUN; k++) h.push([r, k]);
    for (let k = 0; k < SATIR; k++) if (k !== r) h.push([k, c]);
  } else if (ozel === 'arti3') {
    for (let d = -1; d <= 1; d++) {
      if (r + d >= 0 && r + d < SATIR) for (let k = 0; k < SUTUN; k++) h.push([r + d, k]);
      if (c + d >= 0 && c + d < SUTUN) for (let k = 0; k < SATIR; k++) h.push([k, c + d]);
    }
  } else if (ozel === 'gokkusagi') {
    const hedef = hedefTur == null ? enCokTur(t) : hedefTur;
    for (let i = 0; i < SATIR; i++) for (let j = 0; j < SUTUN; j++) if (t[i][j] === hedef) h.push([i, j]);
    h.push([r, c]);
  } else if (ozel === 'hepsi') {
    for (let i = 0; i < SATIR; i++) for (let j = 0; j < SUTUN; j++) h.push([i, j]);
  }
  return h;
}

// İki hücrenin takası özel bir birleşim mi? (Gökkuşağı her şeyle; diğer özel parçalar birbiriyle)
// t: tür ızgarası, oz: özel ızgarası (null ya da tür adı). Dönüş null ya da
// { merkez:[r,c], etki:'arti'|'arti3'|'bomba5'|'gokkusagi'|'hepsi', hedefTur, donusum:[{hucre, ozel}] }
export function birlesim(t, oz, a, b) {
  const oa = oz[a[0]][a[1]];
  const ob = oz[b[0]][b[1]];
  if (!oa && !ob) return null;
  const cizgili = (o) => o === 'satir' || o === 'sutun';
  if (oa === 'gokkusagi' || ob === 'gokkusagi') {
    const [g, d] = oa === 'gokkusagi' ? [a, b] : [b, a];
    const od = oz[d[0]][d[1]];
    if (od === 'gokkusagi') return { merkez: d, etki: 'hepsi', donusum: [] };
    const hedefTur = t[d[0]][d[1]];
    const donusum = [];
    if (od) {
      // O renkteki bütün meyveler aynı özel parçaya dönüşür (çizgililer yön değiştirerek)
      let k = 0;
      for (let i = 0; i < SATIR; i++)
        for (let j = 0; j < SUTUN; j++)
          if (t[i][j] === hedefTur && !(i === g[0] && j === g[1])) donusum.push({ hucre: [i, j], ozel: cizgili(od) ? (k++ % 2 ? 'sutun' : 'satir') : od });
    }
    return { merkez: g, etki: 'gokkusagi', hedefTur, donusum };
  }
  if (!oa || !ob) return null; // özel + normal: eşleşme gerekir
  if (cizgili(oa) && cizgili(ob)) return { merkez: b, etki: 'arti', donusum: [] };
  if (oa === 'bomba' && ob === 'bomba') return { merkez: b, etki: 'bomba5', donusum: [] };
  return { merkez: b, etki: 'arti3', donusum: [] };
}

// Başlangıç hücrelerinden yola çıkıp içindeki özel parçaları zincirleme tetikler.
// korunan: bu adımda yeni oluşan özel parçaların hücreleri (silinmez, tetiklenmez).
// Dönüş: { hucreler:[[r,c]...], tetiklenen:[{ hucre, ozel, alan:[[r,c]...] }] }
export function genislet(t, oz, baslangic, korunan = []) {
  const kor = new Set(korunan.map(([r, c]) => anahtar(r, c)));
  const gor = new Set();
  const liste = [];
  const sira = [];
  const tetiklenen = [];
  const ekle = ([r, c]) => {
    const k = anahtar(r, c);
    if (gor.has(k) || kor.has(k)) return;
    gor.add(k);
    liste.push([r, c]);
    if (oz[r][c]) sira.push([r, c]);
  };
  baslangic.forEach(ekle);
  while (sira.length) {
    const [r, c] = sira.shift();
    const o = oz[r][c];
    const alan = etkiAlani(o, r, c, t);
    tetiklenen.push({ hucre: [r, c], ozel: o, alan });
    alan.forEach(ekle);
  }
  return { hucreler: liste, tetiklenen };
}

// Bir çözüm adımı: eşleşmeleri bulur, oluşacak özel parçaları ayırır, silinecekleri (tetiklenen özel parçalarla) genişletir.
// ek: eşleşme dışında temizlenecek hücreler (birleşim etkisi). Dönüş: { gruplar, olusan, hucreler, tetiklenen }
// engel: null | 'buz' | kasa kat sayısı (1, 2). Dönüşe kasaVurus eklenir: bu adımda bir kez vurulan kasalar
// (eşleşmeye komşu olanlar ve özel parça alanına girenler).
export function cozumAdimi(t, oz, { hamle = null, ek = [], izinli = null, engel = null } = {}) {
  const gruplar = eslesmeleriBul(t);
  const buzlu = (r, c) => engel && (engel[r][c] === 'buz' || engel[r][c] === 'sarmasik');
  // Yeni özel parça, zaten özel parça olan ya da buzlu bir hücreye konmaz; şeklin başka bir hücresi seçilir
  const olusan = [];
  for (const o of ozelOlusumlari(gruplar, hamle, izinli)) {
    if (oz[o.hucre[0]][o.hucre[1]] || buzlu(o.hucre[0], o.hucre[1])) {
      const bos = o.hucreler.find(([r, c]) => !oz[r][c] && !buzlu(r, c));
      if (!bos) continue;
      o.hucre = bos;
    }
    olusan.push(o);
  }
  const korunan = olusan.map((o) => o.hucre);
  const g = genislet(t, oz, [...silinecekler(gruplar), ...ek], korunan);
  // Kasa vuruşları
  const vur = new Map();
  for (const [r, c] of g.hucreler) if (kasaMi(t[r][c])) vur.set(anahtar(r, c), [r, c]);
  for (const [r, c] of silinecekler(gruplar))
    for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
      if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && kasaMi(t[i][j])) vur.set(anahtar(i, j), [i, j]);
  let hucreler = g.hucreler.filter(([r, c]) => !kasaMi(t[r][c]) && t[r][c] !== TOHUM);
  if (buzKomsuKirar && engel) {
    // Eşleşmeye komşu buzlar da kırılır (meyve yerinde kalır): buzlu hücre listeye eklenir
    const var_ = new Set(hucreler.map(([r, c]) => anahtar(r, c)));
    for (const [r, c] of silinecekler(gruplar))
      for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
        if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && (engel[i][j] === 'buz' || engel[i][j] === 'sarmasik') && !var_.has(anahtar(i, j))) {
          var_.add(anahtar(i, j));
          hucreler.push([i, j]);
        }
  }
  // En alt sıraya inmiş tohumlar toplanır
  const tohumlar = [];
  for (let c = 0; c < SUTUN; c++) if (t[SATIR - 1][c] === TOHUM) tohumlar.push([SATIR - 1, c]);
  return { gruplar, olusan, hucreler, tetiklenen: g.tetiklenen, kasaVurus: [...vur.values()], tohumlar };
}

// Bu adımda karı eriyen hücreler: temizlenen parçalar (buz kırılması hariç), oluşan özel parçaların yeri, kırılan kasalar.
export function karEriyen(adim, engel, zemin) {
  if (!zemin) return [];
  const l = new Map();
  const ekle = ([r, c]) => {
    if (zemin[r][c] > 0) l.set(anahtar(r, c), [r, c]);
  };
  for (const h of adim.hucreler) if (!(engel && (engel[h[0]][h[1]] === 'buz' || engel[h[0]][h[1]] === 'sarmasik'))) ekle(h);
  for (const o of adim.olusan) ekle(o.hucre);
  for (const h of adim.kasaVurus) if (!engel || (engel[h[0]][h[1]] || 1) <= 1) ekle(h);
  return [...l.values()];
}

export const adimBos = (adim) => !adim.hucreler.length && !adim.olusan.length && !adim.kasaVurus.length && !(adim.tohumlar && adim.tohumlar.length);

// Bir çözüm adımını ızgaralara uygular (bot ve testler için; oyun ekranı aynı kuralları animasyonla uygular).
// Dönüş: { t, oz, engel, sayac: { topla:{tur:n}, buz, kasa } } — yerçekimi ve yeni meyveler dahil.
export function adimUygula(t, oz, engel, adim, rnd = Math.random, zemin = null) {
  t = kopya(t);
  oz = kopya(oz);
  engel = kopya(engel);
  const sayac = { topla: {}, buz: 0, kasa: 0, kar: 0, tohum: 0, sarmasik: 0, fici: 0, vurus: 0 };
  if (zemin) {
    zemin = kopya(zemin);
    for (const [r, c] of karEriyen(adim, engel, zemin)) {
      zemin[r][c]--;
      sayac.kar++;
    }
  }
  for (const [r, c] of adim.tohumlar || []) {
    t[r][c] = -1;
    oz[r][c] = null;
    sayac.tohum++;
  }
  for (const [r, c] of adim.hucreler) {
    if (engel[r][c] === 'buz') {
      engel[r][c] = null;
      sayac.buz++;
      continue;
    }
    if (engel[r][c] === 'sarmasik') {
      engel[r][c] = null;
      sayac.sarmasik++;
      continue;
    }
    if (renkli(t[r][c])) sayac.topla[t[r][c]] = (sayac.topla[t[r][c]] || 0) + 1;
    t[r][c] = -1;
    oz[r][c] = null;
  }
  for (const [r, c] of adim.kasaVurus) {
    engel[r][c] = (engel[r][c] || 1) - 1;
    sayac.vurus++;
    if (engel[r][c] <= 0) {
      engel[r][c] = null;
      if (t[r][c] === FICI_ODUL) {
        // Ödüllü fıçıdan özel meyve çıkar
        t[r][c] = rastgeleTur(rnd);
        oz[r][c] = ODUL_OZEL[Math.floor(rnd() * ODUL_OZEL.length)];
        sayac.fici++;
        continue;
      }
      if (t[r][c] === FICI) sayac.fici++;
      else sayac.kasa++;
      t[r][c] = -1;
    }
  }
  for (const o of adim.olusan) {
    t[o.hucre[0]][o.hucre[1]] = o.tur;
    oz[o.hucre[0]][o.hucre[1]] = o.ozel;
  }
  const y = yercekimi(t, rnd);
  const yoz = kopya(oz);
  const yen = kopya(engel);
  for (const k of y.kaymalar) {
    yoz[k.eski[0]][k.eski[1]] = null;
    yen[k.eski[0]][k.eski[1]] = null;
  }
  for (const k of y.kaymalar) {
    yoz[k.yeni[0]][k.yeni[1]] = oz[k.eski[0]][k.eski[1]];
    yen[k.yeni[0]][k.yeni[1]] = engel[k.eski[0]][k.eski[1]];
  }
  for (const n of y.yeniler) {
    yoz[n.yeni[0]][n.yeni[1]] = null;
    yen[n.yeni[0]][n.yeni[1]] = null;
  }
  return { t: y.tahta, oz: yoz, engel: yen, sayac, yercekimi: y, zemin };
}

const ODUL_OZEL = ['satir', 'sutun', 'bomba'];

// Seviye düzeninden (8 satırlık metin: '.' boş, 'b' buz, 'k' kasa, 'K' iki katlı kasa, 's' kar, 'S' iki katlı kar,
// 't' tohum, 'v' sarmaşık, 'f' fıçı, 'F' ödüllü fıçı) başlangıç tahtası kurar. Dönüş: { t, oz, engel, zemin } — eşleşmesiz ve en az bir hamlesi olan.
export function duzenliTahta(duzen, rnd = Math.random) {
  for (let d = 0; d < 300; d++) {
    const t = yeniTahta(rnd);
    const oz = t.map((s) => s.map(() => null));
    const engel = t.map((s) => s.map(() => null));
    const zemin = t.map((s) => s.map(() => 0));
    if (duzen)
      for (let r = 0; r < SATIR; r++)
        for (let c = 0; c < SUTUN; c++) {
          const h = duzen[r][c];
          if (h === 'b') engel[r][c] = 'buz';
          else if (h === 'k' || h === 'K') {
            t[r][c] = KASA;
            engel[r][c] = h === 'K' ? 2 : 1;
          } else if (h === 's' || h === 'S') zemin[r][c] = h === 'S' ? 2 : 1;
          else if (h === 't') t[r][c] = TOHUM;
          else if (h === 'v') engel[r][c] = 'sarmasik';
          else if (h === 'f' || h === 'F') {
            t[r][c] = h === 'F' ? FICI_ODUL : FICI;
            engel[r][c] = 3;
          }
        }
    const kilit = engel.map((s) => s.map((e) => e != null));
    if (!eslesmeleriBul(t).length && hamleBul(t, oz, kilit)) return { t, oz, engel, zemin };
  }
  throw new Error('Düzenli tahta kurulamadı');
}

// ---------------- Sarmaşık ----------------
export function sarmasikSay(engel) {
  let n = 0;
  for (const s of engel) for (const e of s) if (e === 'sarmasik') n++;
  return n;
}

// Sarmaşık yayılır: rastgele bir sarmaşığın yanındaki sade bir meyveyi (engelsiz, özel değil) sarar.
// Dönüş: { engel, hucre } ya da yayılacak yer yoksa null. Yayıldıktan sonra tahtada hamle kalmazsa o yer seçilmez.
export function sarmasikYay(t, oz, engel, rnd = Math.random) {
  const adaylar = [];
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++) {
      if (engel[r][c] !== 'sarmasik') continue;
      for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
        if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && renkli(t[i][j]) && engel[i][j] == null && !oz[i][j]) adaylar.push([i, j]);
    }
  while (adaylar.length) {
    const k = Math.floor(rnd() * adaylar.length);
    const h = adaylar.splice(k, 1)[0];
    const y = kopya(engel);
    y[h[0]][h[1]] = 'sarmasik';
    if (hamleBul(t, oz, y.map((s) => s.map((e) => e != null)))) return { engel: y, hucre: h };
  }
  return null;
}

// ---------------- Otomatik oyun (bot) ----------------
// Bütün geçerli hamleler (kilitli hücreler ve kasalar hariç)
export function tumHamleler(t, oz, engel) {
  const l = [];
  const kilitli = (r, c) => kasaMi(t[r][c]) || (engel && engel[r][c] != null);
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++)
      for (const b of [[r, c + 1], [r + 1, c]]) {
        if (b[0] >= SATIR || b[1] >= SUTUN || kilitli(r, c) || kilitli(b[0], b[1])) continue;
        if (birlesim(t, oz, [r, c], b) || eslesmeleriBul(takasla(t, [r, c], b)).length) l.push([[r, c], b]);
      }
  return l;
}

// Bir hamlenin sonucunu (zincirler dahil) hesaplar: { t, oz, engel, puan, sayac }
export function hamleSonucu(t, oz, engel, a, b, izinli, rnd = Math.random, zemin = null) {
  let puan = 0;
  const sayac = { topla: {}, buz: 0, kasa: 0, kar: 0, tohum: 0, sarmasik: 0, fici: 0, vurus: 0 };
  const bir = birlesim(t, oz, a, b);
  t = takasla(t, a, b);
  oz = takasla(oz, a, b);
  let ek = [];
  if (bir) {
    const merkez = bir.merkez[0] === a[0] && bir.merkez[1] === a[1] ? b : a;
    for (const d of bir.donusum) if (!(d.hucre[0] === merkez[0] && d.hucre[1] === merkez[1])) oz[d.hucre[0]][d.hucre[1]] = d.ozel;
    for (const h of [a, b]) if (oz[h[0]][h[1]] === 'gokkusagi' || bir.etki !== 'gokkusagi') oz[h[0]][h[1]] = null;
    ek = [...etkiAlani(bir.etki, merkez[0], merkez[1], t, bir.hedefTur), a, b];
  }
  let zincir = 0;
  for (;;) {
    const adim = cozumAdimi(t, oz, { hamle: zincir === 0 ? [a, b] : null, ek, izinli, engel });
    ek = [];
    if (adimBos(adim)) break;
    zincir++;
    if (zincir > 60) break;
    for (const g of adim.gruplar) puan += grupPuani(g.hucreler.length, zincir);
    const eslesen = new Set(silinecekler(adim.gruplar).map(([r, c]) => anahtar(r, c)));
    puan += adim.hucreler.filter(([r, c]) => !eslesen.has(anahtar(r, c))).length * OZEL_HUCRE_PUANI * Math.max(1, zincir);
    const u = adimUygula(t, oz, engel, adim, rnd, zemin);
    t = u.t;
    oz = u.oz;
    engel = u.engel;
    zemin = u.zemin;
    for (const k in u.sayac.topla) sayac.topla[k] = (sayac.topla[k] || 0) + u.sayac.topla[k];
    sayac.buz += u.sayac.buz;
    sayac.kasa += u.sayac.kasa;
    sayac.kar += u.sayac.kar;
    sayac.tohum += u.sayac.tohum;
    sayac.sarmasik += u.sayac.sarmasik;
    sayac.fici += u.sayac.fici;
    sayac.vurus += u.sayac.vurus;
  }
  return { t, oz, engel, puan, sayac, zemin };
}

// Hedefe en çok katkı yapan hamleyi seçer. hedef: seviye hedefi. Hamle yoksa null.
// Tohumların toplam derinliği (bot için: tohumu aşağı indiren hamle iyidir)
function tohumDerinligi(t) {
  let d = 0;
  for (let r = 0; r < SATIR; r++) for (let c = 0; c < SUTUN; c++) if (t[r][c] === TOHUM) d += r;
  return d;
}

export function enIyiHamle(t, oz, engel, hedef, izinli, enFazla = 30, zemin = null) {
  const hl = tumHamleler(t, oz, engel);
  if (!hl.length) return null;
  const adaylar = hl.length <= enFazla ? hl : hl.slice().sort(() => Math.random() - 0.5).slice(0, enFazla);
  let en = null;
  const derin0 = hedef.tohum ? tohumDerinligi(t) : 0;
  const adayDeger = [];
  for (const h of adaylar) {
    const s = hamleSonucu(t, oz, engel, h[0], h[1], izinli, Math.random, zemin);
    let deger = s.puan / 100;
    if (hedef.topla) deger += Object.keys(hedef.topla).reduce((a, k) => a + (s.sayac.topla[k] || 0), 0) * 100;
    if (hedef.buz) deger += s.sayac.buz * 150;
    if (hedef.kasa) deger += s.sayac.kasa * 150;
    if (hedef.kar) deger += s.sayac.kar * 150;
    if (hedef.sarmasik) deger += s.sayac.sarmasik * 170;
    if (hedef.fici) deger += s.sayac.fici * 200 + s.sayac.vurus * 60;
    if (hedef.tohum) deger += s.sayac.tohum * 400 + (tohumDerinligi(s.t) - derin0) * 60;
    if (hedef.puan) deger = s.puan;
    deger += Math.random() * 0.01; // eşitlikte çeşitlilik
    adayDeger.push({ deger, h, s });
    if (!en || deger > en.deger) en = { deger, h };
  }
  // Tohum seviyelerinde iki hamle ileri bak (tohumun altını hazırlayan hamleyi bulmak için); en iyi 4 aday, her birinde 12 devam
  if (hedef.tohum && !(en && en.deger >= 400)) {
    adayDeger.sort((a, b) => b.deger - a.deger);
    let en2 = null;
    for (const x of adayDeger.slice(0, 4)) {
      const d1 = tohumDerinligi(x.s.t);
      let iki = 0;
      for (const h2 of tumHamleler(x.s.t, x.s.oz, x.s.engel).slice(0, 12)) {
        const s2 = hamleSonucu(x.s.t, x.s.oz, x.s.engel, h2[0], h2[1], izinli, Math.random, x.s.zemin);
        iki = Math.max(iki, s2.sayac.tohum * 400 + (tohumDerinligi(s2.t) - d1) * 60);
      }
      const top = x.deger + iki * 0.8;
      if (!en2 || top > en2.top) en2 = { top, h: x.h };
    }
    if (en2) return en2.h;
  }
  return en.h;
}
