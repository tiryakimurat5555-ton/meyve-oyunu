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
// Yumurta (Kuş Yuvası): kasa gibi (2 kat), kırılınca yerinde civciv çıkar. Civciv tohum gibi iner, en alta inince yuvaya uçar.
// Kafes ve anahtar: engel 'kafes' meyveyi kilitler; eşleşme, özel parça ve çekiç kafesi açmaz, kafesli meyve de temizlenmez.
// ANAHTAR tohum gibi iner; en alta inince tahtadaki bütün kafesler açılır (hedef.kafes). Düzende 'c' kafesli meyve, 'a' anahtar.
export const ANAHTAR = 26;
export const YUMURTA = 24;
export const CIVCIV = 25;
export const kasaMi = (v) => v === KASA || v === FICI || v === FICI_ODUL || v === YUMURTA;
export const ficiMi = (v) => v === FICI || v === FICI_ODUL;
// Tohum (4. bölüm sonrası, Çiçek Bahçesi): meyve değil; eşleşmez, patlamaz, takas edilebilir, yerçekimiyle düşer.
// En alt sıraya inince toplanır (çiçek açar). Özel parçalar ona işlemez.
export const TOHUM = 21;
// Delik (Kristal Bahçe, şekilli tahtalar): tahtada olmayan kare. Hiç değişmez, eşleşmez, takas edilmez, özel parçalar
// onu atlar; meyveler sütunda deliğin üstünden atlayarak düşer. Düzende 'x'.
export const DELIK = 30;
export const delikMi = (v) => v === DELIK;
// Balon (Balon Festivali): düşmez; yerçekimi onu delik gibi atlar (meyveler yanından geçip iner). Yanında eşleşme olunca ya da özel
// parça değince bir kare yükselir (üstündeki parçayla yer değiştirir); en üst hücredeyken yükselirse uçup gider (hedef.balon). Düzende 'o'.
export const BALON = 27;
export const balonMi = (v) => v === BALON;
// Kurbağa (Kurbağa Gölü): M.KURBAGA, engel 'kurb<n>' (n = yediği meyve). Takas edilebilir, eşleşmez, düşer. Her hamleden sonra yanındaki
// sade bir meyveye zıplayıp onu yer (meyve toplanmış sayılır). KURBAGA_DOY meyve yiyince doyar: çevresindeki 3x3 patlar, kurbağa gider
// (hedef.kurbaga). Düzende 'q'.
export const KURBAGA = 28;
// Fener (Fener Bahçesi): M.FENER; takas edilmez, eşleşmez, düşer. Yanındaki eşleşme işlemez; yalnız özel parça alanına girince
// (ya da çekiçle) yanar ve gider (hedef.fener). Düzende 'l'.
export const FENER = 29;
export const KURBAGA_DOY = 5;
export const kurbMi = (e) => typeof e === 'string' && e.startsWith('kurb');
export const kurbDeger = (e) => Number(e.slice(4));
const gecilmez = (v) => v === DELIK || v === BALON;
// Bir sütunda meyvelerin inebileceği en alt satır (tohum oraya inince toplanır)
export function enAltSatir(t, c) {
  for (let r = SATIR - 1; r >= 0; r--) if (t[r][c] !== DELIK) return r;
  return -1;
}
// Sis (Gece Bahçesi): engel 'sis'. Buz gibi meyveyi örter (takas edilemez; eşleşmeye katılınca, yanında eşleşme olunca, özel parça
// ya da çekiç değince dağılır, meyve kalır) ama üstelik altındaki meyveyi GİZLER: oyuncu (ve bot/ipucu) onu göremez.
// Mantar (Mantar Ormanı): engel 'mantar', sarmaşık gibi (takas yok; eşleşme / komşu eşleşme / özel parça / çekiç keser, meyve kalır)
// ama yayılma kuralı farklı: kesilse de kesilmese de her 3 hamlede bir yanındaki bir meyveye yayılır. Düzende 'm'.
export const MANTAR_ARALIK = 3;
export const ortuMu = (e) => e === 'buz' || e === 'sarmasik' || e === 'sis' || e === 'mantar';
// Botun ve ipucunun gördüğü tahta: sisli hücrelerin türü bilinmez (birbirleriyle de eşleşmeyen benzersiz değerler)
export function gorunurTahta(t, engel) {
  if (!engel) return t;
  let var_ = false;
  const g = t.map((s, r) => s.map((v, c) => {
    if (engel[r][c] === 'sis') {
      var_ = true;
      return 100 + r * 8 + c;
    }
    return v;
  }));
  return var_ ? g : t;
}
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
  const kilitli = (r, c) => kasaMi(t[r][c]) || gecilmez(t[r][c]) || t[r][c] === FENER || (kilit && kilit[r][c]);
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
// Akış zincirleri: her zincir, parçaların düştüğü hücrelerin aşağıdan yukarı sırasıdır. Delikler atlanır; akıntı kapısının
// girişindeki (sütunun en alt hücresi) parçalar çıkış hücresine (başka sütunun en üst hücresi) akar.
// Yerçekimi yönü (Uzay Bahçesi): 'asagi' | 'yukari' | 'sol' | 'sag'. Döndürülmüş çerçevede (a, b) hücresi: a = düşüş ekseni.
let yerYonu = 'asagi';
export const yercekimiYonu = () => yerYonu;
export function yonAyarla(y) {
  yerYonu = y || 'asagi';
}
// Döndürülmüş çerçeve (a: yukarıdan aşağı, b: soldan sağa) → gerçek [r, c]
function gercekHucre(a, b) {
  if (yerYonu === 'yukari') return [SATIR - 1 - a, SUTUN - 1 - b];
  if (yerYonu === 'sol') return [b, SUTUN - 1 - a];
  if (yerYonu === 'sag') return [SATIR - 1 - b, a];
  return [a, b];
}
export const YON_AD = { asagi: 'aşağı', yukari: 'yukarı', sol: 'sola', sag: 'sağa' };

export function akisZincirleri(t) {
  const alt = new Map();
  const ust = new Map();
  for (let b = 0; b < SUTUN; b++) {
    let onceki = null;
    for (let a = 0; a < SATIR; a++) {
      const [r, c] = gercekHucre(a, b);
      if (gecilmez(t[r][c])) continue;
      if (onceki) {
        alt.set(anahtar(onceki[0], onceki[1]), [r, c]);
        ust.set(anahtar(r, c), onceki);
      }
      onceki = [r, c];
    }
  }
  if (yerYonu === 'asagi') for (const k of kapilar) {
    const [gr, gc] = k.giris;
    const [cr, cc] = k.cikis;
    if (alt.has(anahtar(gr, gc)) || ust.has(anahtar(cr, cc))) continue; // geçersiz kapı (giriş en alt, çıkış en üst olmalı)
    alt.set(anahtar(gr, gc), [cr, cc]);
    ust.set(anahtar(cr, cc), [gr, gc]);
  }
  const zincirler = [];
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++) {
      if (gecilmez(t[r][c]) || alt.has(anahtar(r, c))) continue;
      // Batak hücre (altında yer yok): yukarı doğru zinciri topla
      const z = [];
      let h = [r, c];
      while (h) {
        z.push(h);
        h = ust.get(anahtar(h[0], h[1]));
      }
      zincirler.push(z);
    }
  return zincirler;
}

// Boş (-1) hücreleri yerçekimiyle doldurur.
export function yercekimi(t, rnd = Math.random) {
  const y = kopya(t);
  const kaymalar = [];
  const yeniler = [];
  for (const yerler of akisZincirleri(t)) {
    let yaz = 0;
    for (const [r, c] of yerler) {
      if (y[r][c] >= 0) {
        const [hr, hc] = yerler[yaz];
        if (r !== hr || c !== hc) {
          y[hr][hc] = y[r][c];
          y[r][c] = -1;
          kaymalar.push({ eski: [r, c], yeni: [hr, hc] });
        }
        yaz++;
      }
    }
    let kacinci = 1;
    for (let i = yaz; i < yerler.length; i++) {
      const [r, c] = yerler[i];
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
  // Yalnız renkli meyveler karışır; delik, kasa, tohum gibi parçalar yerinde kalır
  const yerler = [];
  const hepsi = [];
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++)
      if (renkli(t[r][c])) {
        yerler.push([r, c]);
        hepsi.push(t[r][c]);
      }
  for (let deneme = 0; deneme < 500; deneme++) {
    for (let i = hepsi.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [hepsi[i], hepsi[j]] = [hepsi[j], hepsi[i]];
    }
    const y = kopya(t);
    yerler.forEach(([r, c], i) => (y[r][c] = hepsi[i]));
    if (eslesmeleriBul(y).length === 0 && hamleBul(y)) return y;
  }
  // Olmazsa renkli yerlere yeni meyveler
  for (let deneme = 0; deneme < 500; deneme++) {
    const y = kopya(t);
    for (const [r, c] of yerler) y[r][c] = rastgeleTur(rnd);
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
    if (gor.has(k) || kor.has(k) || t[r][c] === DELIK) return;
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
  const buzlu = (r, c) => engel && (ortuMu(engel[r][c]) || saatMi(engel[r][c]) || engel[r][c] === 'kafes' || engel[r][c] === 'buk');
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
  // Balonlar: özel parça alanına girenler ve eşleşmeye komşu olanlar yükselir
  const balon = new Map();
  for (const [r, c] of g.hucreler) if (t[r][c] === BALON) balon.set(anahtar(r, c), [r, c]);
  for (const [r, c] of silinecekler(gruplar))
    for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
      if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && t[i][j] === BALON) balon.set(anahtar(i, j), [i, j]);
  let hucreler = g.hucreler.filter(([r, c]) => !kasaMi(t[r][c]) && !inenMi(t[r][c]) && t[r][c] !== BALON && t[r][c] !== KURBAGA && t[r][c] !== FENER && !(engel && engel[r][c] === 'kafes'));
  if (buzKomsuKirar && engel) {
    // Eşleşmeye komşu buzlar da kırılır (meyve yerinde kalır): buzlu hücre listeye eklenir
    const var_ = new Set(hucreler.map(([r, c]) => anahtar(r, c)));
    for (const [r, c] of silinecekler(gruplar))
      for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
        if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && ortuMu(engel[i][j]) && !var_.has(anahtar(i, j))) {
          var_.add(anahtar(i, j));
          hucreler.push([i, j]);
        }
  }
  // En alt sıraya inmiş tohumlar toplanır
  const tohumlar = [];
  for (const z of akisZincirleri(t)) {
    const [r, c] = z[0];
    if (inenMi(t[r][c])) tohumlar.push([r, c]);
  }
  const fenerler = g.hucreler.filter(([r, c]) => t[r][c] === FENER);
  return { gruplar, olusan, hucreler, fenerler, tetiklenen: g.tetiklenen, kasaVurus: [...vur.values()], tohumlar, balonlar: [...balon.values()].sort((a, b) => a[0] - b[0]) };
}

// Çiçek (Arı Bahçesi): zemin değeri CICEK + meyve türü (10-15). Parçayla düşmez. Üstünde KENDİ RENGİNDEKİ meyve temizlenince
// ile eşleşince ya da orada o renkte özel parça oluşunca tozlanır; özel parçanın patlaması her rengi tozlar. Kasa kırılması tozlamaz.
export const CICEK = 10;
export const cicekMi = (z) => z >= CICEK && z < CICEK + TUR_SAYISI;
// Bal (Bal Kovanı): zemin değeri BAL. Üstündeki parça temizlenince (kar gibi) silinir; bir hamlede hiç bal silinmezse yanındaki bir
// kareye yayılır (balYay). Hedef tahtada kalan bal (toplanan.balKalan). Düzende 'h'.
export const BAL = 20;

// Bu adımda karı eriyen hücreler: temizlenen parçalar (buz kırılması hariç), oluşan özel parçaların yeri, kırılan kasalar.
export function karEriyen(adim, engel, zemin, t = null) {
  if (!zemin) return [];
  const l = new Map();
  // tur: o hücrede temizlenen meyvenin rengi (çiçek yalnız kendi rengiyle tozlanır); null = kasa vb.
  const ekle = ([r, c], tur) => {
    const z = zemin[r][c];
    if (z <= 0) return;
    if (cicekMi(z) && tur !== 'ozel' && tur !== z - CICEK) return;
    l.set(anahtar(r, c), [r, c]);
  };
  // Eşleşmedeki hücreler meyvenin rengiyle, özel parçanın temizlediği hücreler her renkle ('ozel') sayılır
  const eslesen = new Set(silinecekler(adim.gruplar).map(([r, c]) => anahtar(r, c)));
  for (const h of adim.hucreler) if (!(engel && ortuMu(engel[h[0]][h[1]]))) ekle(h, eslesen.has(anahtar(h[0], h[1])) ? (t ? t[h[0]][h[1]] : null) : 'ozel');
  for (const o of adim.olusan) ekle(o.hucre, o.tur);
  for (const h of adim.kasaVurus) if (!engel || (engel[h[0]][h[1]] || 1) <= 1) ekle(h, null);
  return [...l.values()];
}

export const adimBos = (adim) => !adim.hucreler.length && !adim.olusan.length && !adim.kasaVurus.length && !(adim.tohumlar && adim.tohumlar.length) && !(adim.balonlar && adim.balonlar.length) && !(adim.fenerler && adim.fenerler.length);

// Bir çözüm adımını ızgaralara uygular (bot ve testler için; oyun ekranı aynı kuralları animasyonla uygular).
// Dönüş: { t, oz, engel, sayac: { topla:{tur:n}, buz, kasa } } — yerçekimi ve yeni meyveler dahil.
export function adimUygula(t, oz, engel, adim, rnd = Math.random, zemin = null) {
  t = kopya(t);
  oz = kopya(oz);
  engel = kopya(engel);
  const sayac = { topla: {}, buz: 0, kasa: 0, kar: 0, tohum: 0, sarmasik: 0, fici: 0, vurus: 0, sis: 0 };
  if (zemin) {
    zemin = kopya(zemin);
    for (const [r, c] of karEriyen(adim, engel, zemin, t)) {
      if (cicekMi(zemin[r][c])) {
        zemin[r][c] = 0;
        sayac.cicek = (sayac.cicek || 0) + 1;
      } else if (zemin[r][c] === BAL) {
        zemin[r][c] = 0;
        sayac.bal = (sayac.bal || 0) + 1;
      } else {
        zemin[r][c]--;
        sayac.kar++;
      }
    }
  }
  let anahtarGeldi = false;
  for (const [r, c] of adim.tohumlar || []) {
    if (t[r][c] === CIVCIV) sayac.civciv = (sayac.civciv || 0) + 1;
    else if (t[r][c] === ANAHTAR) {
      sayac.anahtar = (sayac.anahtar || 0) + 1;
      anahtarGeldi = true;
    } else sayac.tohum++;
    t[r][c] = -1;
    oz[r][c] = null;
  }
  if (anahtarGeldi)
    for (let r = 0; r < SATIR; r++)
      for (let c = 0; c < SUTUN; c++)
        if (engel[r][c] === 'kafes') {
          engel[r][c] = null;
          sayac.kafes = (sayac.kafes || 0) + 1;
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
    if (engel[r][c] === 'sis') {
      engel[r][c] = null;
      sayac.sis++;
      continue;
    }
    if (engel[r][c] === 'mantar') {
      engel[r][c] = null;
      sayac.mantar = (sayac.mantar || 0) + 1;
      continue;
    }
    if (saatMi(engel[r][c])) {
      engel[r][c] = null;
      sayac.saat = (sayac.saat || 0) + 1;
    }
    if (engel[r][c] === 'buk') {
      engel[r][c] = null;
      sayac.bukalemun = (sayac.bukalemun || 0) + 1;
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
      if (t[r][c] === YUMURTA) {
        // Yumurtadan civciv çıkar (yerinde kalır, sonra aşağı iner)
        t[r][c] = CIVCIV;
        sayac.yumurta = (sayac.yumurta || 0) + 1;
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
    const k = 'ozel_' + ozelSiparisAdi(o.ozel);
    sayac[k] = (sayac[k] || 0) + 1;
  }
  for (const [r, c] of adim.fenerler || []) {
    t[r][c] = -1;
    oz[r][c] = null;
    engel[r][c] = null;
    sayac.fener = (sayac.fener || 0) + 1;
  }
  for (const [r, c] of adim.balonlar || []) {
    const h = balonYukselt(t, oz, engel, r, c);
    if (h === 'uctu') sayac.balon = (sayac.balon || 0) + 1;
    else if (h) sayac.balonKalk = (sayac.balonKalk || 0) + 1;
  }
  const g = yercekimiUygula(t, oz, engel, rnd);
  return { t: g.t, oz: g.oz, engel: g.engel, sayac, yercekimi: g.y, zemin };
}

const ODUL_OZEL = ['satir', 'sutun', 'bomba'];

// Seviye düzeninden (8 satırlık metin: '.' boş, 'b' buz, 'k' kasa, 'K' iki katlı kasa, 's' kar, 'S' iki katlı kar,
// 't' tohum, 'v' sarmaşık, 'g' sis, 'x' delik, 'o' balon, 'h' bal, 'q' kurbağa, 'l' fener, 'z' saatli meyve, 'm' mantar, 'y' yumurta (2 kat, içinden civciv), 'c' kafesli meyve, 'a' anahtar, 'u' bukalemun, '1'-'6' çiçek (çilek, limon, üzüm, portakal, elma, erik), 'f' fıçı, 'F' ödüllü fıçı) başlangıç tahtası kurar. Dönüş: { t, oz, engel, zemin } — eşleşmesiz ve en az bir hamlesi olan.
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
          else if (h >= '1' && h <= '6') zemin[r][c] = CICEK + Number(h) - 1;
          else if (h === 'h') zemin[r][c] = BAL;
          else if (h === 't') t[r][c] = TOHUM;
          else if (h === 'v') engel[r][c] = 'sarmasik';
          else if (h === 'g') engel[r][c] = 'sis';
          else if (h === 'm') engel[r][c] = 'mantar';
          else if (h === 'c') engel[r][c] = 'kafes';
          else if (h === 'a') t[r][c] = ANAHTAR;
          else if (h === 'u') engel[r][c] = 'buk';
          else if (h === 'x') t[r][c] = DELIK;
          else if (h === 'o') t[r][c] = BALON;
          else if (h === 'l') t[r][c] = FENER;
          else if (h === 'q') {
            t[r][c] = KURBAGA;
            engel[r][c] = 'kurb0';
          }
          else if (h === 'z') engel[r][c] = 'saat' + ((etkinSeviye && etkinSeviye.saat) || 10);
          else if (h === 'y') {
            t[r][c] = YUMURTA;
            engel[r][c] = 2;
          } else if (h === 'f' || h === 'F') {
            t[r][c] = h === 'F' ? FICI_ODUL : FICI;
            engel[r][c] = 3;
          }
        }
    const kilit = engel.map((s) => s.map((e) => !serbestMi(e)));
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
export function sarmasikYay(t, oz, engel, rnd = Math.random, tip = 'sarmasik') {
  const adaylar = [];
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++) {
      if (engel[r][c] !== tip) continue;
      for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
        if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && renkli(t[i][j]) && engel[i][j] == null && !oz[i][j]) adaylar.push([i, j]);
    }
  while (adaylar.length) {
    const k = Math.floor(rnd() * adaylar.length);
    const h = adaylar.splice(k, 1)[0];
    const y = kopya(engel);
    y[h[0]][h[1]] = tip;
    if (hamleBul(t, oz, y.map((s) => s.map((e) => !serbestMi(e))))) return { engel: y, hucre: h };
  }
  return null;
}

// ---------------- Otomatik oyun (bot) ----------------
// Bütün geçerli hamleler (kilitli hücreler ve kasalar hariç)
export function tumHamleler(t, oz, engel) {
  const l = [];
  const kilitli = (r, c) => kasaMi(t[r][c]) || gecilmez(t[r][c]) || t[r][c] === FENER || (engel && !serbestMi(engel[r][c]));
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
  const sayac = { topla: {}, buz: 0, kasa: 0, kar: 0, tohum: 0, sarmasik: 0, fici: 0, vurus: 0, sis: 0 };
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
  const z = zincirCoz(t, oz, engel, zemin, { hamle: [a, b], ek, izinli, rnd });
  sayacBirlestir(sayac, z.sayac);
  return z.sonuc(puan, sayac);
}

// Tahtadaki eşleşmeleri zincirleme çözer (hamle sonrası, bant kayması, renk değişimi vb.)
export function zincirCoz(t, oz, engel, zemin, { hamle = null, ek = [], izinli = null, rnd = Math.random } = {}) {
  let puan = 0;
  const sayac = { topla: {} };
  let zincir = 0;
  for (;;) {
    const adim = cozumAdimi(t, oz, { hamle: zincir === 0 ? hamle : null, ek, izinli, engel });
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
    sayacBirlestir(sayac, u.sayac);
  }
  let enAzSaat = null;
  for (const s of engel) for (const e of s) if (saatMi(e)) enAzSaat = enAzSaat == null ? saatDeger(e) : Math.min(enAzSaat, saatDeger(e));
  return {
    t,
    oz,
    engel,
    puan,
    sayac,
    zemin,
    zincir,
    // hamleSonucu için: önceki puan/sayaçla birleştirip tek sonuç döndürür
    sonuc: (p0, s0) => ({ t, oz, engel, puan: p0 + puan, sayac: s0, zemin, enAzSaat }),
  };
}

// ---------------- Sipariş (Hasat Pazarı) ----------------
// seviye.siparisler = [{ tur: 0, n: 12 } (o meyveden topla) | { ozel: 'cizgili'|'bomba'|'gokkusagi', n: 2 } (o özel parçayı yap)].
// Siparişler sırayla gelir; yalnız açık sipariş sayılır, fazlası sonrakine geçmez. hedef.siparis = sipariş sayısı.
// toplanan.siparis = biten sipariş, toplanan.siparisAdim = açık siparişteki ilerleme.
export const ozelSiparisAdi = (o) => (o === 'satir' || o === 'sutun' ? 'cizgili' : o);
let aktifSiparis = null;
export function siparisIlerlet(top, seviye, sayacIc) {
  const l = seviye.siparisler || [];
  top.siparis = top.siparis || 0;
  top.siparisAdim = top.siparisAdim || 0;
  const s = l[top.siparis];
  if (s) {
    const n = s.ozel ? sayacIc['ozel_' + s.ozel] || 0 : (sayacIc.topla && sayacIc.topla[s.tur]) || 0;
    top.siparisAdim += n;
    if (top.siparisAdim >= s.n) {
      top.siparis++;
      top.siparisAdim = 0;
    }
  }
  aktifSiparis = l[top.siparis] || null;
  return top;
}
export function siparisSifirla(seviye) {
  aktifSiparis = (seviye && seviye.siparisler && seviye.siparisler[0]) || null;
}

// Yerçekimini tür, özel ve engel ızgaralarına birlikte uygular
export function yercekimiUygula(t, oz, engel, rnd = Math.random) {
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
  return { t: y.tahta, oz: yoz, engel: yen, y };
}

// Kurbağanın yiyeceği komşu meyve (sade, engelsiz, özel olmayan); yoksa null
export function kurbagaHedefi(t, oz, engel, r, c, rnd = Math.random) {
  const ad = [];
  for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
    if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && renkli(t[i][j]) && engel[i][j] == null && !oz[i][j]) ad.push([i, j]);
  return ad.length ? ad[Math.floor(rnd() * ad.length)] : null;
}
// Bütün kurbağalar birer meyve yer. Dönüş: { t, oz, engel, sayac, patlamalar: [[r,c]] } (ızgaralar yerinde değişmez, kopya)
export function kurbagaBeslen(t, oz, engel, rnd = Math.random) {
  t = kopya(t);
  oz = kopya(oz);
  engel = kopya(engel);
  const sayac = { topla: {} };
  const patlamalar = [];
  const kurbalar = [];
  for (let r = 0; r < SATIR; r++) for (let c = 0; c < SUTUN; c++) if (t[r][c] === KURBAGA) kurbalar.push([r, c]);
  for (const [r, c] of kurbalar) {
    const h = kurbagaHedefi(t, oz, engel, r, c, rnd);
    if (!h) continue;
    const n = kurbDeger(engel[r][c] || 'kurb0') + 1;
    sayac.topla[t[h[0]][h[1]]] = (sayac.topla[t[h[0]][h[1]]] || 0) + 1;
    t[h[0]][h[1]] = KURBAGA;
    engel[h[0]][h[1]] = 'kurb' + n;
    t[r][c] = -1;
    engel[r][c] = null;
    if (n >= KURBAGA_DOY) {
      t[h[0]][h[1]] = -1;
      engel[h[0]][h[1]] = null;
      sayac.kurbaga = (sayac.kurbaga || 0) + 1;
      patlamalar.push(h);
    }
  }
  return { t, oz, engel, sayac, patlamalar };
}
export const kurbagaAlani = (patlamalar) => {
  const m = new Map();
  for (const [r, c] of patlamalar)
    for (let i = r - 1; i <= r + 1; i++) for (let j = c - 1; j <= c + 1; j++) if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN) m.set(i * SUTUN + j, [i, j]);
  return [...m.values()];
};

// Balonu bir kare yükseltir (üstündeki parçayla yer değiştirir; yerinde değiştirir). En üstteyse uçar: 'uctu'.
export function balonYukselt(t, oz, engel, r, c) {
  if (t[r][c] !== BALON) return null;
  const u = r - 1;
  if (u < 0 || t[u][c] === DELIK) {
    t[r][c] = -1;
    oz[r][c] = null;
    engel[r][c] = null;
    return 'uctu';
  }
  if (t[u][c] === BALON) return null;
  for (const g of [t, oz, engel]) [g[u][c], g[r][c]] = [g[r][c], g[u][c]];
  return 'kalkti';
}

// Düzendeki bal zemini (başlangıç kalan sayısı için)
function duzenliZemin(duzen) {
  return duzen.map((s) => s.split('').map((h) => (h === 'h' ? BAL : 0)));
}
// Bal yayılır: rastgele bir bal karesinin yanındaki balsız, deliksiz bir kareye
export function balYay(t, zemin, rnd = Math.random) {
  const ad = [];
  for (let r = 0; r < SATIR; r++)
    for (let c = 0; c < SUTUN; c++) {
      if (zemin[r][c] !== BAL) continue;
      for (const [i, j] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]])
        if (i >= 0 && j >= 0 && i < SATIR && j < SUTUN && zemin[i][j] === 0 && !gecilmez(t[i][j])) ad.push([i, j]);
    }
  if (!ad.length) return null;
  const h = ad[Math.floor(rnd() * ad.length)];
  const z = kopya(zemin);
  z[h[0]][h[1]] = BAL;
  return { zemin: z, hucre: h };
}

// Bukalemun meyveler bir sonraki renge geçer
export function bukalemunDegistir(t, engel) {
  return t.map((s, r) => s.map((v, c) => (engel[r][c] === 'buk' && renkli(v) ? (v + 1) % etkinTur : v)));
}

// Taşıyıcı bant (Rüzgârlı Tepe): seviye.bant = [{ satir, yon: 1 (sağa) | -1 (sola) }]. Her hamleden sonra o satırdaki parçalar
// (meyve, engeli ve özel hali ile) bir kare kayar; uçtan çıkan öbür uçtan girer. Zemin (kar, çiçek) yerinde kalır.
export function bantKaydir(t, oz, engel, bantlar) {
  t = kopya(t);
  oz = kopya(oz);
  engel = kopya(engel);
  const tasimalar = [];
  for (const { satir: r, yon } of bantlar) {
    const yt = t[r].slice();
    const yo = oz[r].slice();
    const ye = engel[r].slice();
    for (let c = 0; c < SUTUN; c++) {
      const y = (c + yon + SUTUN) % SUTUN;
      t[r][y] = yt[c];
      oz[r][y] = yo[c];
      engel[r][y] = ye[c];
      tasimalar.push({ eski: [r, c], yeni: [r, y], sarma: Math.abs(y - c) > 1 });
    }
  }
  return { t, oz, engel, tasimalar };
}

// Hedefe en çok katkı yapan hamleyi seçer. hedef: seviye hedefi. Hamle yoksa null.
// Tohumların toplam derinliği (bot için: tohumu aşağı indiren hamle iyidir)
// ---------------- Ortak kurallar (oyun, bot ve simülasyon aynı fonksiyonları kullanır) ----------------
// İnen parçalar: en alta inince toplanır (tohum; ileride civciv ve anahtar)
export const INEN = [TOHUM, CIVCIV, ANAHTAR];
export const INEN_DUZEN = 'ta';
export const inenMi = (v) => INEN.includes(v);
const INEN_SAYAC = ['tohum', 'civciv', 'anahtar'];
export const inenHedefMi = (hedef) => INEN_SAYAC.some((k) => hedef[k]) || !!hedef.kafes;
export const inenToplandi = (sayac) => INEN_SAYAC.some((k) => sayac[k]);
export function inenDerinligi(t) {
  let d = 0;
  for (let r = 0; r < SATIR; r++) for (let c = 0; c < SUTUN; c++) if (inenMi(t[r][c])) d += r;
  return d;
}
export const inenDegeri = (s, d0) => INEN_SAYAC.reduce((a, k) => a + (s.sayac[k] || 0) * 400, 0) + (inenDerinligi(s.t) - d0) * 60;

// Bot: hamle sonucunun hedefe katkısı
export const HEDEF_AGIRLIK = { buz: 150, kasa: 150, kar: 150, sarmasik: 170, fici: 200, sis: 160, cicek: 180, saat: 220, mantar: 180, kafes: 300, bukalemun: 200, balon: 400, bal: 170, fener: 500 };
export function hamleDegeri(s, hedef, derin0 = 0) {
  if (hedef.puan) return s.puan;
  let d = s.puan / 100;
  if (hedef.topla) d += Object.keys(hedef.topla).reduce((a, k) => a + (s.sayac.topla[k] || 0), 0) * 100;
  for (const k in HEDEF_AGIRLIK) if (hedef[k]) d += (s.sayac[k] || 0) * HEDEF_AGIRLIK[k];
  if (hedef.fici) d += (s.sayac.vurus || 0) * 60;
  if (hedef.siparis && aktifSiparis) {
    const s0 = aktifSiparis;
    d += (s0.ozel ? (s.sayac['ozel_' + s0.ozel] || 0) * 500 : ((s.sayac.topla && s.sayac.topla[s0.tur]) || 0) * 120);
  }
  if (hedef.fener) d += (s.sayac.ozel_cizgili || 0) * 90 + (s.sayac.ozel_bomba || 0) * 110 + (s.sayac.ozel_gokkusagi || 0) * 140;
  if (hedef.balon) d += (s.sayac.balonKalk || 0) * 110;
  if (hedef.civciv) d += (s.sayac.vurus || 0) * 70 + (s.sayac.yumurta || 0) * 200;
  if (inenHedefMi(hedef)) d += inenDegeri(s, derin0);
  if (hedef.saat && s.enAzSaat != null) d -= Math.max(0, 6 - s.enAzSaat) * 120;
  return d;
}

// İç sayaçları birleştirir (topla iç içe kalır): hamle/zincir sonuçları için
export function sayacBirlestir(a, b) {
  for (const k in b) {
    if (k === 'topla') {
      a.topla = a.topla || {};
      for (const t in b.topla) a.topla[t] = (a.topla[t] || 0) + b.topla[t];
    } else if (typeof b[k] === 'number') a[k] = (a[k] || 0) + b[k];
  }
  return a;
}
// Toplanan hedef sayaçlarına ekler (meyve türleri düz anahtar olur: toplanan[0] = çilek sayısı)
export function sayacEkle(hedef, ek) {
  for (const k in ek) {
    if (k === 'topla') for (const t in ek.topla) hedef[t] = (hedef[t] || 0) + ek.topla[t];
    else if (typeof ek[k] === 'number') hedef[k] = (hedef[k] || 0) + ek[k];
  }
  return hedef;
}

// Düzen harfi -> hedef anahtarı ve sayısı (düzen ile hedef tutarlı mı denetimi için)
const DUZEN_HEDEF = { b: ['buz', 1], k: ['kasa', 1], K: ['kasa', 1], s: ['kar', 1], S: ['kar', 2], t: ['tohum', 1], v: ['sarmasik', 1], f: ['fici', 1], F: ['fici', 1], g: ['sis', 1], 1: ['cicek', 1], 2: ['cicek', 1], 3: ['cicek', 1], 4: ['cicek', 1], 5: ['cicek', 1], 6: ['cicek', 1], z: ['saat', 1], m: ['mantar', 1], y: ['civciv', 1], c: ['kafes', 1], u: ['bukalemun', 1], o: ['balon', 1], h: ['bal', 1], q: ['kurbaga', 1], l: ['fener', 1] };
export const DUZEN_HEDEF_ANAHTAR = [...new Set(Object.values(DUZEN_HEDEF).map((x) => x[0]))];
export function duzenSayilari(duzen) {
  const say = {};
  for (const satir of duzen)
    for (const h of satir)
      if (DUZEN_HEDEF[h]) {
        const [k, n] = DUZEN_HEDEF[h];
        say[k] = (say[k] || 0) + n;
      }
  return say;
}

// Tahtada kalanla ölçülen hedefler (yayılabildikleri için): sarmaşık
const KALAN_ENGEL = { sarmasik: 'sarmasik', mantar: 'mantar' };
export function kalanlariYaz(toplanan, engel, zemin = null) {
  if (zemin) {
    let n = 0;
    for (const s of zemin) for (const z of s) if (z === BAL) n++;
    toplanan.balKalan = n;
  }
  for (const k in KALAN_ENGEL) {
    let n = 0;
    for (const s of engel) for (const e of s) if (e === KALAN_ENGEL[k]) n++;
    toplanan[k + 'Kalan'] = n;
  }
  return toplanan;
}
export function baslangicToplanan(seviye, engel) {
  return kalanlariYaz({}, engel, seviye && seviye.duzen ? duzenliZemin(seviye.duzen) : null);
}

// Takası engellemeyen engel değerleri (ileride: saat, bukalemun)
// Saat (Saat Kulesi): engel 'saat<n>' (n = kalan hamle). Meyve takas edilir, eşleşir; temizlenince saat gider (hedef.saat).
// Her hamleden sonra bir azalır; sıfıra inen saat olursa seviye kaybedilir. Düzende 'z' (başlangıç seviye.saat, yoksa 10).
export const saatMi = (e) => typeof e === 'string' && e.startsWith('saat');
export const saatDeger = (e) => Number(e.slice(4));
// Bukalemun (Bukalemun Bahçesi): engel 'buk'. Meyve takas edilir ve eşleşir; her hamleden sonra bir sonraki renge geçer
// (çilek → limon → ... ). Temizlenince hedef.bukalemun sayılır. Düzende 'u'.
export const serbestMi = (e) => e == null || saatMi(e) || e === 'buk' || kurbMi(e);

// Seviyeye özel ayarlar (ileride: kapılar)
let etkinSeviye = null;
// Akıntı kapıları (Göl Kıyısı): seviye.kapilar = [{ giris: [r, c], cikis: [r, c] }]
let kapilar = [];
export function seviyeKur(seviye) {
  etkinSeviye = seviye;
  yonAyarla(seviye && seviye.yercekimi ? seviye.yercekimi.yonler[0] : 'asagi');
  siparisSifirla(seviye);
  kapilar = (seviye && seviye.kapilar) || [];
}
export const kapiGirisMi = (r, c) => kapilar.some((k) => k.giris[0] === r && k.giris[1] === c);
export const kapiCikisMi = (r, c) => kapilar.some((k) => k.cikis[0] === r && k.cikis[1] === c);

// Hamle (ve zincirleri) bittikten sonra işleyen kurallar. ctx: { yapilan, kesilen (hamlenin sayacı), top, puan, hedefTamam }
// Dönüş: { durum, sayac, puan, kaybetti, olaylar }
export function hamleSonrasiKurallar(durum, seviye, ctx, rnd = Math.random) {
  let { t, oz, engel, zemin } = durum;
  const sayac = {};
  const olaylar = [];
  let puan = 0;
  const h = seviye.hedef;
  // Sarmaşık: hamlede hiç kesilmediyse yayılır
  if (h.sarmasik && !(ctx.kesilen && ctx.kesilen.sarmasik) && !ctx.hedefTamam(seviye, kalanlariYaz({ ...ctx.top }, engel), ctx.puan)) {
    const y = sarmasikYay(t, oz, engel, rnd);
    if (y) {
      engel = y.engel;
      olaylar.push({ tip: 'sarmasikYay', hucre: y.hucre });
    }
  }
  // Bal: hamlede hiç bal silinmediyse yayılır
  if (h.bal && zemin && !(ctx.kesilen && ctx.kesilen.bal) && !ctx.hedefTamam(seviye, kalanlariYaz({ ...ctx.top }, engel, zemin), ctx.puan)) {
    const y = balYay(t, zemin, rnd);
    if (y) {
      zemin = y.zemin;
      olaylar.push({ tip: 'balYay', hucre: y.hucre });
    }
  }
  // Mantar: her MANTAR_ARALIK hamlede bir (kalan varsa) yayılır
  if (h.mantar && ctx.yapilan % MANTAR_ARALIK === 0 && !ctx.hedefTamam(seviye, kalanlariYaz({ ...ctx.top }, engel), ctx.puan)) {
    const y = sarmasikYay(t, oz, engel, rnd, 'mantar');
    if (y) {
      engel = y.engel;
      olaylar.push({ tip: 'mantarYay', hucre: y.hucre });
    }
  }
  // Yerçekimi yönü her N hamlede bir sıradaki yöne döner (boşluk varsa parçalar yeni yöne kayar)
  if (seviye.yercekimi && ctx.yapilan % seviye.yercekimi.aralik === 0) {
    const l = seviye.yercekimi.yonler;
    yonAyarla(l[(l.indexOf(yerYonu) + 1) % l.length]);
    olaylar.push({ tip: 'yon', yon: yerYonu });
  }
  // Kurbağa: komşu meyveyi yer; doyan kurbağa çevresini patlatır
  if (h.kurbaga && t.some((s) => s.includes(KURBAGA))) {
    const k = kurbagaBeslen(t, oz, engel, rnd);
    sayacBirlestir(sayac, k.sayac);
    const g = yercekimiUygula(k.t, k.oz, k.engel, rnd);
    const z = zincirCoz(g.t, g.oz, g.engel, zemin, { izinli: seviye.ozel, rnd, ek: kurbagaAlani(k.patlamalar) });
    ({ t, oz, engel, zemin } = z);
    puan += z.puan;
    sayacBirlestir(sayac, z.sayac);
    olaylar.push({ tip: 'kurbaga' });
  }
  // Bukalemun: renk değiştirir, oluşan eşleşmeler çözülür
  if (h.bukalemun && engel.some((s) => s.includes('buk'))) {
    t = bukalemunDegistir(t, engel);
    const z = zincirCoz(t, oz, engel, zemin, { izinli: seviye.ozel, rnd });
    ({ t, oz, engel, zemin } = z);
    puan += z.puan;
    sayacBirlestir(sayac, z.sayac);
    olaylar.push({ tip: 'bukalemun' });
  }
  // Taşıyıcı bant: satırlar kayar, oluşan eşleşmeler çözülür
  if (seviye.bant && seviye.bant.length) {
    const b = bantKaydir(t, oz, engel, seviye.bant);
    const z = zincirCoz(b.t, b.oz, b.engel, zemin, { izinli: seviye.ozel, rnd });
    ({ t, oz, engel, zemin } = z);
    puan += z.puan;
    sayacBirlestir(sayac, z.sayac);
    olaylar.push({ tip: 'bant' });
  }
  // Sipariş: hamlenin ve bu kuralların sayacı açık siparişe işlenir
  if (h.siparis) siparisIlerlet(ctx.top, seviye, sayacBirlestir(sayacBirlestir({ topla: {} }, ctx.kesilen || {}), sayac));
  // Saatler: her hamlede bir azalır; sıfıra inen varsa kaybedilir
  let kaybetti = false;
  if (h.saat) {
    engel = engel.map((s) => s.map((e) => (saatMi(e) ? 'saat' + (saatDeger(e) - 1) : e)));
    for (const s of engel) for (const e of s) if (saatMi(e) && saatDeger(e) <= 0) kaybetti = true;
    if (kaybetti) olaylar.push({ tip: 'saatDoldu' });
  }
  return { durum: { t, oz, engel, zemin }, sayac, puan, kaybetti, olaylar };
}

export function enIyiHamle(t0, oz, engel, hedef, izinli, enFazla = 30, zemin = null) {
  // Sisin altını görmeden karar verir; görünür hamle yoksa gerçek tahtaya bakar
  let t = gorunurTahta(t0, engel);
  let hl = tumHamleler(t, oz, engel);
  if (!hl.length && t !== t0) {
    t = t0;
    hl = tumHamleler(t, oz, engel);
  }
  if (!hl.length) return null;
  const adaylar = hl.length <= enFazla ? hl : hl.slice().sort(() => Math.random() - 0.5).slice(0, enFazla);
  let en = null;
  const derin0 = inenDerinligi(t);
  const adayDeger = [];
  for (const h of adaylar) {
    const s = hamleSonucu(t, oz, engel, h[0], h[1], izinli, Math.random, zemin);
    let deger = hamleDegeri(s, hedef, derin0);
    deger += Math.random() * 0.01; // eşitlikte çeşitlilik
    adayDeger.push({ deger, h, s });
    if (!en || deger > en.deger) en = { deger, h };
  }
  // İnen parça (tohum, civciv, anahtar) seviyelerinde iki hamle ileri bak; en iyi 4 aday, her birinde 12 devam
  if (inenHedefMi(hedef) && !(en && inenToplandi(adayDeger.find((x) => x.h === en.h).s.sayac))) {
    adayDeger.sort((a, b) => b.deger - a.deger);
    let en2 = null;
    for (const x of adayDeger.slice(0, 4)) {
      const d1 = inenDerinligi(x.s.t);
      let iki = 0;
      for (const h2 of tumHamleler(x.s.t, x.s.oz, x.s.engel).slice(0, 12)) {
        const s2 = hamleSonucu(x.s.t, x.s.oz, x.s.engel, h2[0], h2[1], izinli, Math.random, x.s.zemin);
        iki = Math.max(iki, inenDegeri(s2, d1));
      }
      const top = x.deger + iki * 0.8;
      if (!en2 || top > en2.top) en2 = { top, h: x.h };
    }
    if (en2) return en2.h;
  }
  return en.h;
}
