// Meyve oyununun saf mantığı: tahta, eşleşme bulma, yerçekimi, hamle kontrolü, karıştırma.
// Bu dosya React'ten bağımsızdır; node ile test edilebilir (araclar/mantik-testi.js).
// Tahta: tahta[satir][sutun] = tür numarası (0..TUR_SAYISI-1) ya da boş için -1.

export const SATIR = 8;
export const SUTUN = 8;
export const TUR_SAYISI = 6;

export function rastgeleTur(rnd = Math.random) {
  return Math.floor(rnd() * TUR_SAYISI);
}

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
      while (son + 1 < SUTUN && tur >= 0 && t[r][son + 1] === tur) son++;
      if (tur >= 0 && son - c + 1 >= 3) {
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
      while (son + 1 < SATIR && tur >= 0 && t[son + 1][c] === tur) son++;
      if (tur >= 0 && son - r + 1 >= 3) {
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
export function hamleBul(t) {
  for (let r = 0; r < SATIR; r++) {
    for (let c = 0; c < SUTUN; c++) {
      const komsular = [
        [r, c + 1],
        [r + 1, c],
      ];
      for (const b of komsular) {
        if (b[0] >= SATIR || b[1] >= SUTUN) continue;
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
export function grupPuani(boy, zincir) {
  const taban = boy >= 5 ? 100 : boy === 4 ? 60 : 30;
  return taban * Math.max(1, zincir);
}
