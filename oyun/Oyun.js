// Oyun ekranı: bir seviyeyi oynatır. Görenler kaydırarak, VoiceOver kullananlar dokunarak oynar.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as M from './mantik';
import { TANITIM, hedefTamam, yildizHesapla } from './seviyeler';
import { cal, meyveSesi, titret } from './ses';
import {
  Dalga,
  Donusum,
  GirisKart,
  GokkusagiIsinlari,
  Isin,
  Kutu,
  MEYVELER,
  Ovgu,
  Parca,
  Patlama,
  PuanYazisi,
  SeciliHalka,
  TAM,
  Yildiz,
  st,
} from './gorsel';

const OVGU = ['', '', 'Güzel!', 'Harika!', 'Muhteşem!', 'Efsane!'];
const IPUCU_SURE = 7000;
const SENLIK_EN_FAZLA = 15;
const OZEL_AD = { satir: 'satır temizler', sutun: 'sütun temizler', bomba: 'bomba', gokkusagi: '' };

let sonKimlik = 0;
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const oynat = (anim) => new Promise((r) => anim.start(() => r()));
const anahtar = (r, c) => r * M.SUTUN + c;

export function parcaAdi(p) {
  if (!p) return 'Boş';
  if (p.ozel === 'gokkusagi' || !MEYVELER[p.tur]) return 'Gökkuşağı';
  return MEYVELER[p.tur].isim + (p.ozel ? ' ' + OZEL_AD[p.ozel] : '');
}

// Hedefin kısa anlatımı ("10 çilek topla", "1500 puana ulaş")
export function hedefMetni(seviye) {
  const h = seviye.hedef;
  if (h.puan) return `${h.puan} puana ulaş`;
  const p = Object.entries(h.topla).map(([tur, n]) => `${n} ${MEYVELER[tur].isim.toLocaleLowerCase('tr')}`);
  return (p.length > 1 ? p.slice(0, -1).join(', ') + ' ve ' + p[p.length - 1] : p[0]) + ' topla';
}

// Kalan hedef ("7 çilek kaldı, elma tamam")
function kalanMetni(seviye, toplanan, puan) {
  const h = seviye.hedef;
  if (h.puan) return puan >= h.puan ? 'Puan hedefi tamam' : `${h.puan - puan} puan kaldı`;
  return Object.entries(h.topla)
    .map(([tur, n]) => {
      const k = Math.max(0, n - (toplanan[tur] || 0));
      const ad = MEYVELER[tur].isim.toLocaleLowerCase('tr');
      return k ? `${k} ${ad} kaldı` : `${ad} tamam`;
    })
    .join(', ');
}

export default function Oyun({ seviye, enIyi, sonrakiVar, bitince, geri, sonraki, tekrar }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const TAHTA = Math.floor(Math.min(EG - 20, EY * 0.58, 560));
  const H = TAHTA / M.SUTUN;

  const [, setSurum] = useState(0);
  const yenile = useCallback(() => setSurum((s) => s + 1), []);
  const [asama, setAsama] = useState('giris'); // giris | oyun | senlik | sonuc
  const [puan, setPuan] = useState(0);
  const [hamle, setHamle] = useState(seviye.hamle);
  const [toplanan, setToplanan] = useState({});
  const [secili, setSecili] = useState(null);
  const [efektler, setEfektler] = useState([]);
  const [ovgu, setOvgu] = useState(null);
  const [vo, setVo] = useState(false);
  const [sonuc, setSonuc] = useState(null);

  const izgara = useRef(null);
  const parcalar = useRef(new Map());
  const mesgul = useRef(true);
  const puanRef = useRef(0);
  const hamleRef = useRef(seviye.hamle);
  const toplananRef = useRef({});
  const seciliRef = useRef(null);
  const voRef = useRef(false);
  const bittiRef = useRef(false);
  const ipucuZaman = useRef(null);
  const ipucuParcalar = useRef([]);
  const HRef = useRef(H);
  HRef.current = H;

  const duyur = (metin) => {
    if (voRef.current && metin) AccessibilityInfo.announceForAccessibility(metin);
  };

  // ---------- parçalar ----------
  const yeniParca = (tur, r, c, baslangicSatir = r, ozel = null) => {
    const p = {
      id: ++sonKimlik,
      tur,
      ozel,
      poz: new Animated.ValueXY({ x: c, y: baslangicSatir }),
      olcek: new Animated.Value(1),
      ez: new Animated.Value(0),
      don: new Animated.Value(0),
      zip: new Animated.Value(0),
    };
    parcalar.current.set(p.id, p);
    return p;
  };
  const parcaAt = (r, c) => parcalar.current.get(izgara.current[r][c]);
  const turIzgarasi = () => izgara.current.map((s) => s.map((id) => (id == null ? -1 : parcalar.current.get(id).tur)));
  const ozIzgarasi = () => izgara.current.map((s) => s.map((id) => (id == null ? null : parcalar.current.get(id).ozel || null)));

  const tasi = (p, r, c, sure, yumusak = Easing.out(Easing.quad)) =>
    Animated.timing(p.poz, { toValue: { x: c, y: r }, duration: sure, easing: yumusak, useNativeDriver: true });
  const inis = (p, guc = 1) =>
    Animated.sequence([
      Animated.timing(p.ez, { toValue: 0.9 * guc, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(p.ez, { toValue: 0, speed: 22, bounciness: 14, useNativeDriver: true }),
    ]);
  const dusur = (p, r, c, mesafe, gecikme = 0) =>
    new Promise((coz) => {
      p.zip.stopAnimation();
      p.zip.setValue(0);
      const sure = 160 + 55 * mesafe;
      Animated.sequence([
        Animated.delay(gecikme),
        Animated.parallel([
          tasi(p, r, c, sure, Easing.in(Easing.quad)),
          Animated.timing(p.ez, { toValue: -Math.min(0.6, 0.15 * mesafe), duration: sure * 0.6, useNativeDriver: true }),
        ]),
      ]).start(() => {
        inis(p, Math.min(1, 0.45 + 0.12 * mesafe)).start();
        coz();
      });
    });
  const zipla = (p, yukseklik = 0.18) =>
    Animated.sequence([
      Animated.parallel([
        Animated.timing(p.zip, { toValue: -yukseklik, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(p.ez, { toValue: -0.4, duration: 130, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(p.zip, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(p.ez, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
      inis(p, 0.6),
    ]);
  const salla = (p) =>
    Animated.sequence([-1, 1, -0.7, 0.7, -0.3, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 45, useNativeDriver: true })));
  // Özel parçaya dönüşme: küçülüp büyüyerek parlar
  const parlayarakDonustur = (p) =>
    Animated.sequence([
      Animated.timing(p.olcek, { toValue: 0.6, duration: 90, useNativeDriver: true }),
      Animated.spring(p.olcek, { toValue: 1, speed: 16, bounciness: 16, useNativeDriver: true }),
    ]);

  const sarsinti = useRef(new Animated.Value(0)).current;
  const flas = useRef(new Animated.Value(0)).current;
  const sars = (guc) => {
    Animated.sequence([guc, -guc, guc * 0.7, -guc * 0.7, guc * 0.35, 0].map((v) => Animated.timing(sarsinti, { toValue: v, duration: 40, useNativeDriver: true }))).start();
  };
  const parlat = (guc = 0.45) => {
    flas.setValue(guc);
    Animated.timing(flas, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const seciliAyarla = (h) => {
    seciliRef.current = h;
    setSecili(h);
  };
  const efektEkle = (e) => setEfektler((l) => [...l, { ...e, id: ++sonKimlik }]);
  const efektKaldir = useCallback((id) => setEfektler((l) => l.filter((e) => e.id !== id)), []);

  // ---------- kurulum ----------
  useEffect(() => {
    M.turSayisiAyarla(seviye.tur);
    // Yalnız bilgisayardaki denemelerde: hazır tahta ve özel parçalar verilebilir (telefonda bu değişkenler yoktur)
    const deneme = typeof globalThis !== 'undefined' ? globalThis.__denemeTahta : null;
    const t = deneme && deneme.tur ? deneme.tur : M.yeniTahta();
    izgara.current = t.map((satir, r) => satir.map((tur, c) => yeniParca(tur, r, c, r - M.SATIR - 1, deneme && deneme.oz ? deneme.oz[r][c] : null).id));
    yenile();
    AccessibilityInfo.isScreenReaderEnabled().then((a) => {
      voRef.current = a;
      setVo(a);
    });
    const dinle = AccessibilityInfo.addEventListener('screenReaderChanged', (a) => {
      voRef.current = a;
      setVo(a);
    });
    const canli = setInterval(() => {
      if (mesgul.current || !izgara.current || voRef.current) return;
      const p = parcaAt(Math.floor(Math.random() * M.SATIR), Math.floor(Math.random() * M.SUTUN));
      if (p && !ipucuParcalar.current.includes(p)) zipla(p, 0.12).start();
    }, 1600);
    return () => {
      dinle && dinle.remove && dinle.remove();
      clearTimeout(ipucuZaman.current);
      clearInterval(canli);
    };
  }, []);

  const basla = () => {
    setAsama('oyun');
    cal('karistir', 0.6);
    const sozler = [];
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) sozler.push(dusur(parcaAt(r, c), r, c, 4, (M.SATIR - 1 - r) * 55 + c * 22));
    Promise.all(sozler).then(() => {
      mesgul.current = false;
      ipucuKur();
    });
    duyur(`Seviye ${seviye.no} başladı. ${hedefMetni(seviye)}. ${seviye.hamle} hamle.`);
  };

  // ---------- ipucu ----------
  const ipucuDurdur = () => {
    clearTimeout(ipucuZaman.current);
    for (const p of ipucuParcalar.current) {
      p.olcek.stopAnimation();
      p.olcek.setValue(1);
    }
    ipucuParcalar.current = [];
  };
  const ipucuKur = () => {
    ipucuDurdur();
    ipucuZaman.current = setTimeout(() => {
      if (mesgul.current || !izgara.current || bittiRef.current) return;
      const h = M.hamleBul(turIzgarasi(), ozIzgarasi());
      if (!h) return;
      const ps = [parcaAt(h[0][0], h[0][1]), parcaAt(h[1][0], h[1][1])];
      ipucuParcalar.current = ps;
      const nabiz = (p) =>
        Animated.sequence([1.16, 1, 1.16, 1].map((v) => Animated.timing(p.olcek, { toValue: v, duration: 220, useNativeDriver: true })));
      Animated.parallel(ps.map(nabiz)).start(() => {
        if (ipucuParcalar.current === ps) ipucuKur();
      });
    }, IPUCU_SURE);
  };

  // ---------- toplama ----------
  const topla = (sayac) => {
    const yeni = { ...toplananRef.current };
    for (const [tur, n] of Object.entries(sayac)) yeni[tur] = (yeni[tur] || 0) + n;
    toplananRef.current = yeni;
    setToplanan(yeni);
  };
  const puanEkle = (n) => {
    puanRef.current += n;
    setPuan(puanRef.current);
  };

  // Özel parça tetiklenince görsel efekt ve ses
  const ozelEfekti = (ozel, r, c, tur, alan) => {
    const renk = tur >= 0 && tur < 6 ? MEYVELER[tur].renk : '#ffcc33';
    if (ozel === 'satir' || ozel === 'sutun') {
      efektEkle({ tip: 'isin', yon: ozel, r, c, renk });
      cal('cizgi');
      sars(3);
    } else if (ozel === 'arti') {
      efektEkle({ tip: 'isin', yon: 'satir', r, c, renk });
      efektEkle({ tip: 'isin', yon: 'sutun', r, c, renk });
      cal('cizgi');
      sars(5);
    } else if (ozel === 'arti3') {
      for (let d = -1; d <= 1; d++) {
        if (r + d >= 0 && r + d < M.SATIR) efektEkle({ tip: 'isin', yon: 'satir', r: r + d, c, renk });
        if (c + d >= 0 && c + d < M.SUTUN) efektEkle({ tip: 'isin', yon: 'sutun', r, c: c + d, renk });
      }
      cal('cizgi');
      cal('bomba');
      sars(8);
      parlat();
    } else if (ozel === 'bomba' || ozel === 'bomba5') {
      efektEkle({ tip: 'dalga', r, c, yaricap: ozel === 'bomba5' ? 2 : 1, renk });
      cal('bomba');
      titret('guclu');
      sars(ozel === 'bomba5' ? 10 : 6);
      if (ozel === 'bomba5') parlat();
    } else if (ozel === 'gokkusagi' || ozel === 'hepsi') {
      efektEkle({ tip: 'gokkusagi', r, c, hedefler: (alan || []).slice(0, 40) });
      cal('gokkusagi');
      titret('guclu');
      sars(ozel === 'hepsi' ? 10 : 5);
      parlat(ozel === 'hepsi' ? 0.7 : 0.35);
    }
  };

  // ---------- eşleşmeleri ve özel parçaları çöz (zincirler dahil) ----------
  // ek: eşleşme dışında temizlenecek hücreler (birleşim ve şenlik)
  const cozumle = async ({ hamleHucre = null, ek: ekHucre = [] } = {}) => {
    let zincir = 0;
    let toplam = 0;
    const patlayan = {};
    const olusanlar = [];
    let ekler = ekHucre;
    for (;;) {
      const t = turIzgarasi();
      const oz = ozIzgarasi();
      const adim = M.cozumAdimi(t, oz, { hamle: zincir === 0 ? hamleHucre : null, ek: ekler, izinli: seviye.ozel });
      ekler = [];
      if (!adim.hucreler.length && !adim.olusan.length) break;
      zincir++;

      // Puan: eşleşme grupları + özel parçaların temizlediği her meyve
      let kazanc = 0;
      let sesSay = 0;
      const puanYazilari = [];
      for (const g of adim.gruplar) {
        const k = M.grupPuani(g.hucreler.length, zincir);
        kazanc += k;
        const orta = g.hucreler[Math.floor(g.hucreler.length / 2)];
        if (sesSay++ < 3) meyveSesi(MEYVELER[g.tur].ad, orta[1], M.SUTUN);
        puanYazilari.push({ tip: 'puan', x: orta[1], y: orta[0], metin: '+' + k, renk: MEYVELER[g.tur].renk });
      }
      const eslesen = new Set(M.silinecekler(adim.gruplar).map(([r, c]) => anahtar(r, c)));
      const ozelTemiz = adim.hucreler.filter(([r, c]) => !eslesen.has(anahtar(r, c))).length;
      if (ozelTemiz) {
        const k = ozelTemiz * M.OZEL_HUCRE_PUANI * Math.max(1, zincir);
        kazanc += k;
        const ilk = adim.tetiklenen[0] ? adim.tetiklenen[0].hucre : adim.hucreler[0];
        puanYazilari.push({ tip: 'puan', x: ilk[1], y: ilk[0], metin: '+' + k, renk: '#ff7a3d' });
      }
      toplam += kazanc;

      if (zincir >= 2) {
        cal('zincir_' + Math.min(6, zincir - 1));
        setOvgu({ id: ++sonKimlik, metin: OVGU[Math.min(OVGU.length - 1, zincir)] });
      }
      titret(zincir >= 3 ? 'guclu' : 'orta');
      const enBuyuk = adim.gruplar.length ? Math.max(...adim.gruplar.map((g) => g.hucreler.length)) : 0;
      if (zincir >= 3 || enBuyuk >= 5) {
        sars(Math.min(9, 3 + zincir * 1.5));
        parlat();
      } else if (zincir === 2 || enBuyuk === 4) sars(3);

      // Yeni özel parçaya katılan meyveler oraya akar; diğerleri patlar
      const akan = new Map(); // hücre -> hedef hücre
      for (const o of adim.olusan) for (const [r, c] of o.hucreler) if (r !== o.hucre[0] || c !== o.hucre[1]) akan.set(anahtar(r, c), o.hucre);
      const silinen = adim.hucreler.map(([r, c]) => ({ r, c, p: parcaAt(r, c) }));
      const animler = [];
      for (const { r, c, p } of silinen) {
        if (p.tur >= 0 && p.tur < 6) patlayan[p.tur] = (patlayan[p.tur] || 0) + 1;
        const hedef = akan.get(anahtar(r, c));
        if (hedef) {
          animler.push(
            Animated.parallel([
              tasi(p, hedef[0], hedef[1], 170, Easing.in(Easing.quad)),
              Animated.timing(p.olcek, { toValue: 0.3, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            ])
          );
        } else {
          animler.push(
            Animated.sequence([
              Animated.parallel([
                Animated.timing(p.olcek, { toValue: 1.25, duration: 120, easing: Easing.out(Easing.back(3)), useNativeDriver: true }),
                Animated.sequence([-0.6, 0.6, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 40, useNativeDriver: true }))),
              ]),
              Animated.timing(p.olcek, { toValue: 0, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            ])
          );
        }
      }
      const patlat = oynat(Animated.parallel(animler));
      // Tetiklenen özel parçaların efektleri hemen başlar
      for (const tt of adim.tetiklenen) {
        const p = parcaAt(tt.hucre[0], tt.hucre[1]);
        ozelEfekti(tt.ozel, tt.hucre[0], tt.hucre[1], p ? p.tur : -1, tt.alan);
      }
      await bekle(115);
      for (const { r, c, p } of silinen) if (!akan.has(anahtar(r, c))) efektEkle({ tip: 'patlama', x: c, y: r, renk: MEYVELER[p.tur] ? MEYVELER[p.tur].renk : '#ffcc33', koyu: MEYVELER[p.tur] ? MEYVELER[p.tur].koyu : '#c08a00' });
      for (const y of puanYazilari) efektEkle(y);
      await patlat;
      for (const { r, c } of silinen) {
        parcalar.current.delete(izgara.current[r][c]);
        izgara.current[r][c] = null;
      }
      // Yeni özel parçalar
      for (const o of adim.olusan) {
        const p = parcaAt(o.hucre[0], o.hucre[1]);
        p.tur = o.tur;
        p.ozel = o.ozel;
        olusanlar.push(o);
        efektEkle({ tip: 'donusum', r: o.hucre[0], c: o.hucre[1] });
        parlayarakDonustur(p).start();
      }
      if (adim.olusan.length) {
        cal('ozel_olustu');
        titret('basari');
        yenile();
      }
      topla(adimSayaci(silinen));
      puanEkle(kazanc);

      // Düşür ve yenilerini getir
      const s = M.yercekimi(turIzgarasi());
      const yeniIzgara = izgara.current.map((satir) => satir.slice());
      for (const k of s.kaymalar) {
        const id = izgara.current[k.eski[0]][k.eski[1]];
        yeniIzgara[k.eski[0]][k.eski[1]] = null;
        yeniIzgara[k.yeni[0]][k.yeni[1]] = id;
      }
      const dusenler = [];
      for (const k of s.kaymalar) dusenler.push([parcalar.current.get(yeniIzgara[k.yeni[0]][k.yeni[1]]), k.yeni[0], k.yeni[1], k.yeni[0] - k.eski[0], 0]);
      for (const n of s.yeniler) {
        const p = yeniParca(n.tur, n.yeni[0], n.yeni[1], -n.kacinci);
        yeniIzgara[n.yeni[0]][n.yeni[1]] = p.id;
        dusenler.push([p, n.yeni[0], n.yeni[1], n.yeni[0] + n.kacinci, 40]);
      }
      izgara.current = yeniIzgara;
      yenile();
      await Promise.all(dusenler.map(([p, r, c, m, g]) => dusur(p, r, c, m, g + c * 12)));
    }
    return { zincir, toplam, patlayan, olusanlar };
  };
  // Bu adımda silinen meyvelerin türlere göre sayısı (toplama hedefi için)
  function adimSayaci(silinen) {
    const s = {};
    for (const { p } of silinen) if (p.tur >= 0 && p.tur < 6) s[p.tur] = (s[p.tur] || 0) + 1;
    return s;
  }

  // ---------- karıştır (hamle kalmazsa) ----------
  const karistir = async () => {
    cal('karistir');
    const hepsi = [];
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) hepsi.push(parcaAt(r, c));
    let yerlesim = null;
    for (let d = 0; d < 400 && !yerlesim; d++) {
      const k = hepsi.slice();
      for (let i = k.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [k[i], k[j]] = [k[j], k[i]];
      }
      const t = [];
      const oz = [];
      for (let r = 0; r < M.SATIR; r++) {
        t.push(k.slice(r * M.SUTUN, r * M.SUTUN + M.SUTUN).map((p) => p.tur));
        oz.push(k.slice(r * M.SUTUN, r * M.SUTUN + M.SUTUN).map((p) => p.ozel || null));
      }
      if (!M.eslesmeleriBul(t).length && M.hamleBul(t, oz)) yerlesim = k;
    }
    if (!yerlesim) {
      // Çok nadir: normal meyvelerin türlerini yeniden dağıt
      const t = M.karistir(turIzgarasi());
      for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) {
        const p = parcaAt(r, c);
        if (!p.ozel) p.tur = t[r][c];
      }
      yerlesim = hepsi;
    }
    izgara.current = [];
    for (let r = 0; r < M.SATIR; r++) izgara.current.push(yerlesim.slice(r * M.SUTUN, r * M.SUTUN + M.SUTUN).map((p) => p.id));
    yenile();
    await oynat(
      Animated.parallel(
        yerlesim.map((p, i) =>
          Animated.sequence([
            Animated.timing(p.olcek, { toValue: 0.7, duration: 120, useNativeDriver: true }),
            tasi(p, Math.floor(i / M.SUTUN), i % M.SUTUN, 380, Easing.inOut(Easing.cubic)),
            Animated.spring(p.olcek, { toValue: 1, speed: 14, bounciness: 8, useNativeDriver: true }),
          ])
        )
      )
    );
    duyur('Hamle kalmadı, meyveler karıştırıldı');
  };

  // ---------- seviye sonu ----------
  const sonucuGoster = async (basarili) => {
    bittiRef.current = true;
    ipucuDurdur();
    const p = puanRef.current;
    const yildiz = yildizHesapla(seviye, p, basarili);
    const rekor = basarili && enIyi > 0 && p > enIyi;
    bitince && bitince({ no: seviye.no, basarili, yildiz, puan: p });
    setSonuc({ basarili, yildiz, puan: p, rekor });
    setAsama('sonuc');
    if (basarili) {
      cal('kazandin');
      titret('basari');
      duyur(`Seviye ${seviye.no} tamam! ${yildiz} yıldız. Puanın ${p}.${rekor ? ' Yeni rekor!' : ''}`);
    } else {
      cal('kaybettin');
      titret('hata');
      duyur(`Hamleler bitti. ${kalanMetni(seviye, toplananRef.current, p)}. Tekrar dene.`);
    }
  };

  // Hedef tamamlanınca kalan hamleler çizgili meyveye dönüşüp patlar
  const senlik = async () => {
    setAsama('senlik');
    setOvgu({ id: ++sonKimlik, metin: 'Bahçe şenliği!' });
    duyur('Hedef tamam! Kalan hamleler şenliğe dönüşüyor.');
    await bekle(700);
    const donusecek = Math.min(SENLIK_EN_FAZLA, hamleRef.current);
    const hucreler = [];
    for (let i = 0; i < donusecek; i++) {
      const adaylar = [];
      for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) {
        const p = parcaAt(r, c);
        if (p && !p.ozel) adaylar.push([r, c]);
      }
      if (!adaylar.length) break;
      const [r, c] = adaylar[Math.floor(Math.random() * adaylar.length)];
      const p = parcaAt(r, c);
      p.ozel = Math.random() < 0.5 ? 'satir' : 'sutun';
      hucreler.push([r, c]);
      efektEkle({ tip: 'donusum', r, c });
      parlayarakDonustur(p).start();
      cal('pling', 0.8);
      hamleRef.current -= 1;
      setHamle(hamleRef.current);
      yenile();
      await bekle(110);
    }
    // Bahçe şenliğinde kalan hamle puanı: dönüşmeyen hamleler de sayılır
    puanEkle(Math.max(0, hamleRef.current) * 100);
    hamleRef.current = 0;
    setHamle(0);
    // Tahtadaki bütün özel parçalar da patlar
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) if (parcaAt(r, c).ozel) hucreler.push([r, c]);
    await bekle(250);
    if (hucreler.length) await cozumle({ ek: hucreler });
    await bekle(400);
    sonucuGoster(true);
  };

  // ---------- hamle ----------
  const hamleSonrasi = async (sonuc) => {
    const p = Object.entries(sonuc.patlayan).map(([tur, n]) => `${n} ${MEYVELER[tur].isim}`);
    const o = sonuc.olusanlar.map((x) => (x.ozel === 'gokkusagi' ? 'Gökkuşağı oluştu' : `${MEYVELER[x.tur].isim} ${OZEL_AD[x.ozel]} oluştu`));
    duyur(
      [p.length ? p.join(', ') + ' patladı' : '', ...o, sonuc.zincir >= 2 ? `${sonuc.zincir} zincir` : '', kalanMetni(seviye, toplananRef.current, puanRef.current), `${hamleRef.current} hamle`]
        .filter(Boolean)
        .join('. ')
    );
    if (hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      await senlik();
      return;
    }
    if (hamleRef.current <= 0) {
      await bekle(300);
      sonucuGoster(false);
      return;
    }
    if (!M.hamleBul(turIzgarasi(), ozIzgarasi())) await karistir();
    mesgul.current = false;
    yenile();
    ipucuKur();
  };

  const hamleYap = async (a, b) => {
    if (mesgul.current || bittiRef.current) return;
    if (a[0] < 0 || a[1] < 0 || b[0] < 0 || b[1] < 0 || a[0] >= M.SATIR || b[0] >= M.SATIR || a[1] >= M.SUTUN || b[1] >= M.SUTUN) return;
    mesgul.current = true;
    ipucuDurdur();
    seciliAyarla(null);
    const bir = M.birlesim(turIzgarasi(), ozIzgarasi(), a, b);
    const pa = parcaAt(a[0], a[1]);
    const pb = parcaAt(b[0], b[1]);
    for (const p of [pa, pb]) {
      p.zip.stopAnimation();
      p.zip.setValue(0);
      p.ez.stopAnimation();
      p.ez.setValue(0);
    }
    cal('takas', 0.7);
    titret('hafif');
    await oynat(
      Animated.parallel([
        tasi(pa, b[0], b[1], 160, Easing.inOut(Easing.quad)),
        tasi(pb, a[0], a[1], 160, Easing.inOut(Easing.quad)),
        Animated.sequence([
          Animated.timing(pa.olcek, { toValue: 1.15, duration: 80, useNativeDriver: true }),
          Animated.timing(pa.olcek, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pb.olcek, { toValue: 0.88, duration: 80, useNativeDriver: true }),
          Animated.timing(pb.olcek, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]),
      ])
    );
    izgara.current[a[0]][a[1]] = pb.id;
    izgara.current[b[0]][b[1]] = pa.id;

    if (bir) {
      // Birleşim: takastan sonra merkez öbür hücrededir
      const merkez = bir.merkez[0] === a[0] && bir.merkez[1] === a[1] ? b : a;
      hamleRef.current -= 1;
      setHamle(hamleRef.current);
      // Gökkuşağı + özel parça: o renkteki meyveler önce özel parçaya dönüşür
      for (const d of bir.donusum) {
        const p = parcaAt(d.hucre[0], d.hucre[1]);
        if (!p || (d.hucre[0] === merkez[0] && d.hucre[1] === merkez[1])) continue;
        p.ozel = d.ozel;
        efektEkle({ tip: 'donusum', r: d.hucre[0], c: d.hucre[1] });
        parlayarakDonustur(p).start();
      }
      if (bir.donusum.length) {
        cal('ozel_olustu');
        yenile();
        await bekle(450);
      }
      const t = turIzgarasi();
      const alan = M.etkiAlani(bir.etki, merkez[0], merkez[1], t, bir.hedefTur);
      // Takas edilen özel parçalar bu birleşimde harcanır (ayrıca tetiklenmez).
      // Yalnız gökkuşağı + özel parçada öbür özel parça da kendi rengiyle birlikte patlar.
      for (const p of [pa, pb]) if (p.ozel === 'gokkusagi' || bir.etki !== 'gokkusagi') p.ozel = null;
      const diger = parcaAt(merkez[0], merkez[1]) === pa ? pb : pa;
      ozelEfekti(bir.etki, merkez[0], merkez[1], diger.tur, alan);
      await bekle(bir.etki === 'gokkusagi' || bir.etki === 'hepsi' ? 380 : 120);
      const sonuc = await cozumle({ hamleHucre: [a, b], ek: [...alan, a, b] });
      await hamleSonrasi(sonuc);
      return;
    }

    if (!M.eslesmeleriBul(turIzgarasi()).length) {
      cal('gecersiz');
      titret('hata');
      await oynat(Animated.parallel([salla(pa), salla(pb)]));
      await oynat(Animated.parallel([tasi(pa, a[0], a[1], 170, Easing.out(Easing.back(1.6))), tasi(pb, b[0], b[1], 170, Easing.out(Easing.back(1.6)))]));
      izgara.current[a[0]][a[1]] = pa.id;
      izgara.current[b[0]][b[1]] = pb.id;
      duyur('Eşleşme olmadı');
      mesgul.current = false;
      yenile();
      ipucuKur();
      return;
    }

    hamleRef.current -= 1;
    setHamle(hamleRef.current);
    const sonuc = await cozumle({ hamleHucre: [a, b] });
    await hamleSonrasi(sonuc);
  };

  const hucreDokun = (h) => {
    if (mesgul.current || bittiRef.current) return;
    const s = seciliRef.current;
    const p = parcaAt(h[0], h[1]);
    if (!s) {
      seciliAyarla(h);
      cal('secim');
      titret('hafif');
      zipla(p, 0.2).start();
      duyur(`${parcaAdi(p)} seçildi`);
      return;
    }
    if (s[0] === h[0] && s[1] === h[1]) {
      seciliAyarla(null);
      duyur('Seçim kaldırıldı');
      return;
    }
    if (M.komsuMu(s, h)) {
      hamleYap(s, h);
      return;
    }
    seciliAyarla(h);
    cal('secim');
    zipla(p, 0.2).start();
    duyur(`${parcaAdi(p)} seçildi`);
  };

  // ---------- kaydırma ----------
  const surukle = useRef({ bas: null, oldu: false });
  const fonk = useRef({});
  fonk.current = { hamleYap, hucreDokun };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !voRef.current,
      onMoveShouldSetPanResponder: () => !voRef.current,
      onPanResponderGrant: (e) => {
        // Meyveler ve zemin dokunmayı geçirir (pointerEvents none); bu yüzden locationX/Y tahtaya göredir.
        const hh = HRef.current;
        const ne = e.nativeEvent || {};
        const c = Math.floor((ne.locationX || 0) / hh);
        const r = Math.floor((ne.locationY || 0) / hh);
        surukle.current = { bas: r >= 0 && r < M.SATIR && c >= 0 && c < M.SUTUN ? [r, c] : null, oldu: false };
      },
      onPanResponderMove: (e, g) => {
        const s = surukle.current;
        if (!s.bas || s.oldu) return;
        if (Math.max(Math.abs(g.dx), Math.abs(g.dy)) < HRef.current * 0.3) return;
        s.oldu = true;
        const [r, c] = s.bas;
        const hedef = Math.abs(g.dx) > Math.abs(g.dy) ? [r, c + (g.dx > 0 ? 1 : -1)] : [r + (g.dy > 0 ? 1 : -1), c];
        fonk.current.hamleYap(s.bas, hedef);
      },
      onPanResponderRelease: () => {
        const s = surukle.current;
        if (s.bas && !s.oldu) fonk.current.hucreDokun(s.bas);
        surukle.current = { bas: null, oldu: false };
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  if (typeof globalThis !== 'undefined' && globalThis.__denemeTahta) globalThis.__denemeOyun = { hamleYap, hucreDokun, durum: () => ({ puan: puanRef.current, hamle: hamleRef.current, toplanan: toplananRef.current, t: turIzgarasi(), oz: ozIzgarasi(), mesgul: mesgul.current }) };

  // ---------- çizim ----------
  if (!izgara.current) return <View style={st.kok} />;
  const liste = Array.from(parcalar.current.values());
  const N = M.SUTUN;

  return (
    <View style={[st.kok, { paddingTop: ek.top + 4, paddingBottom: ek.bottom + 8, justifyContent: 'flex-start' }]}>
      <View style={st.tepe} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={[st.tepe2, { left: -EG * 0.3, width: EG * 1.6, height: EG * 0.9, borderRadius: EG * 0.8, top: EY - EG * 0.32 }]} />
      </View>

      <View style={yst.ustSatir}>
        <Pressable accessibilityRole="button" accessibilityLabel="Seviyelere dön" onPress={geri} hitSlop={10} style={({ pressed }) => [yst.geri, pressed && { opacity: 0.6 }]}>
          <Text style={yst.geriYazi}>‹ Seviyeler</Text>
        </Pressable>
        <Text style={yst.seviyeBaslik} accessibilityRole="header">
          Seviye {seviye.no}
        </Text>
        <View style={{ width: 96 }} />
      </View>

      <View style={st.ust}>
        <HedefKutusu seviye={seviye} toplanan={toplanan} puan={puan} />
        <Kutu baslik="Hamle" deger={hamle} etiket={`${hamle} hamle kaldı`} vurgu={hamle <= 5 && asama === 'oyun'} buyuk />
        <Kutu baslik="Puan" deger={puan} etiket={`Puan ${puan}`} />
      </View>

      <Animated.View style={[st.cerceve, { width: TAHTA + 12, height: TAHTA + 12, transform: [{ translateX: sarsinti }] }]}>
        <View style={{ width: TAHTA, height: TAHTA, overflow: 'hidden', borderRadius: 12 }} {...(vo ? {} : pan.panHandlers)}>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {izgara.current.map((satir, r) =>
              satir.map((_, c) => (
                <View
                  key={`z${r}-${c}`}
                  style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: H - 3, height: H - 3, borderRadius: H * 0.22, backgroundColor: (r + c) % 2 ? '#fff4df' : '#ffffff' }}
                />
              ))
            )}
          </View>
          {secili && <SeciliHalka r={secili[0]} c={secili[1]} H={H} />}
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {liste.map((p) => (
              <Parca key={p.id} p={p} H={H} />
            ))}
          </View>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {efektler.map((e) => {
              if (e.tip === 'patlama') return <Patlama key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'puan') return <PuanYazisi key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'isin') return <Isin key={e.id} e={e} H={H} N={N} bitti={efektKaldir} />;
              if (e.tip === 'dalga') return <Dalga key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'gokkusagi') return <GokkusagiIsinlari key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'donusum') return <Donusum key={e.id} e={e} H={H} bitti={efektKaldir} />;
              return null;
            })}
          </View>
          {vo &&
            asama === 'oyun' &&
            izgara.current.map((satir, r) =>
              satir.map((id, c) => {
                const p = parcalar.current.get(id);
                const sec = secili && secili[0] === r && secili[1] === c;
                return (
                  <Pressable
                    key={`h${r}-${c}`}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${parcaAdi(p)}${sec ? ' seçili' : ''}, ${r + 1}. satır ${c + 1}. sütun`}
                    onPress={() => hucreDokun([r, c])}
                    style={{ position: 'absolute', left: c * H, top: r * H, width: H, height: H }}
                  />
                );
              })
            )}
        </View>
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[TAM, { borderRadius: 18, backgroundColor: '#ffffff', opacity: flas }]}
        />
        {ovgu && <Ovgu key={ovgu.id} metin={ovgu.metin} bitti={() => setOvgu((o) => (o && o.id === ovgu.id ? null : o))} />}
      </Animated.View>

      {asama === 'giris' && (
        <View style={st.perde} accessibilityViewIsModal>
          <GirisKart>
            <Text style={st.kartBaslik} accessibilityRole="header">
              Seviye {seviye.no}
            </Text>
            <HedefGorseli seviye={seviye} />
            <Text style={yst.kartHedef}>{hedefMetni(seviye)}</Text>
            <Text style={st.kartAlt}>{seviye.hamle} hamle</Text>
            {seviye.yeni && (
              <View style={yst.tanitim} accessible accessibilityLabel={`${TANITIM[seviye.yeni].baslik}. ${TANITIM[seviye.yeni].metin}`}>
                <Text style={yst.tanitimBaslik}>{TANITIM[seviye.yeni].baslik}</Text>
                <Text style={yst.tanitimMetin}>{TANITIM[seviye.yeni].metin}</Text>
              </View>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel="Başla" onPress={basla} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Başla</Text>
            </Pressable>
          </GirisKart>
        </View>
      )}

      {asama === 'sonuc' && sonuc && (
        <View style={st.perde} accessibilityViewIsModal>
          <GirisKart>
            <Text style={st.kartBaslik} accessibilityRole="header">
              {sonuc.basarili ? `Seviye ${seviye.no} tamam!` : 'Hamleler bitti'}
            </Text>
            {sonuc.basarili ? (
              <SonucYildizlari sayi={sonuc.yildiz} />
            ) : (
              <Text style={[st.kartAlt, { marginTop: 10, textAlign: 'center' }]}>{kalanMetni(seviye, toplanan, puan)}</Text>
            )}
            <Text style={st.kartPuan}>{sonuc.puan}</Text>
            {sonuc.rekor && <Text style={st.kartAlt}>Yeni rekor!</Text>}
            {sonuc.basarili && sonrakiVar ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Sonraki seviye" onPress={sonraki} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
                <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Sonraki seviye</Text>
              </Pressable>
            ) : null}
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <Pressable accessibilityRole="button" accessibilityLabel={sonuc.basarili ? 'Tekrar oyna' : 'Tekrar dene'} onPress={tekrar} style={({ pressed }) => [yst.ikinciDugme, pressed && { opacity: 0.7 }]}>
                <Text style={yst.ikinciYazi}>{sonuc.basarili ? 'Tekrar oyna' : 'Tekrar dene'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Seviyeler" onPress={geri} style={({ pressed }) => [yst.ikinciDugme, pressed && { opacity: 0.7 }]}>
                <Text style={yst.ikinciYazi}>Seviyeler</Text>
              </Pressable>
            </View>
          </GirisKart>
        </View>
      )}
    </View>
  );
}

// Hedef kutusu: toplanacak meyveler ve kalan sayılar ya da puan hedefi çubuğu
function HedefKutusu({ seviye, toplanan, puan }) {
  const h = seviye.hedef;
  const etiket = 'Hedef: ' + kalanMetni(seviye, toplanan, puan);
  if (h.puan) {
    const oran = Math.min(1, puan / h.puan);
    return (
      <View style={[st.kutu, yst.hedefKutu]} accessible accessibilityLabel={etiket}>
        <Text style={st.kutuBaslik}>Hedef</Text>
        <Text style={[st.kutuDeger, { fontSize: 18 }]}>{h.puan}</Text>
        <View style={yst.cubuk}>
          <View style={[yst.cubukDolu, { width: `${oran * 100}%`, backgroundColor: oran >= 1 ? '#45c33a' : '#ffb21f' }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={[st.kutu, yst.hedefKutu]} accessible accessibilityLabel={etiket}>
      <Text style={st.kutuBaslik}>Hedef</Text>
      <View style={{ flexDirection: 'row', marginTop: 2 }}>
        {Object.entries(h.topla).map(([tur, n]) => {
          const k = Math.max(0, n - (toplanan[tur] || 0));
          return (
            <View key={tur} style={{ alignItems: 'center', marginHorizontal: 3 }}>
              <Image source={MEYVELER[tur].resim} style={{ width: 26, height: 26 }} resizeMode="contain" />
              <Text style={[yst.hedefSayi, !k && { color: '#2f9e2a' }]}>{k ? k : '✓'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Seviye başı kartındaki büyük hedef görseli
function HedefGorseli({ seviye }) {
  const h = seviye.hedef;
  if (h.puan) return null;
  return (
    <View style={{ flexDirection: 'row', marginTop: 12 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Object.entries(h.topla).map(([tur, n]) => (
        <View key={tur} style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <Image source={MEYVELER[tur].resim} style={{ width: 56, height: 56 }} resizeMode="contain" />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

// Sonuç kartında yıldızlar tek tek parlayarak gelir
function SonucYildizlari({ sayi }) {
  const degerler = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    let iptal = false;
    (async () => {
      for (let i = 0; i < 3; i++) {
        await bekle(i === 0 ? 450 : 380);
        if (iptal) return;
        if (i < sayi) {
          cal('yildiz_' + (i + 1));
          titret('orta');
        }
        Animated.spring(degerler[i], { toValue: 1, speed: 12, bounciness: 14, useNativeDriver: true }).start();
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }} accessible accessibilityLabel={`${sayi} yıldız`}>
      {degerler.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            marginHorizontal: 4,
            transform: [{ translateY: i === 1 ? -10 : 0 }, { scale: d.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }, { rotate: d.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '0deg'] }) }],
            opacity: d,
          }}
        >
          <Yildiz dolu={i < sayi} boy={i === 1 ? 64 : 52} />
        </Animated.View>
      ))}
    </View>
  );
}

const yst = {
  ustSatir: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 4 },
  geri: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12, minWidth: 96 },
  geriYazi: { fontSize: 15, fontWeight: '800', color: '#2b5876' },
  seviyeBaslik: { fontSize: 20, fontWeight: '900', color: '#24384a' },
  hedefKutu: { minWidth: 110, paddingHorizontal: 10 },
  hedefSayi: { fontSize: 15, fontWeight: '900', color: '#24384a' },
  cubuk: { width: 86, height: 8, borderRadius: 4, backgroundColor: '#e6edf3', marginTop: 4, overflow: 'hidden' },
  cubukDolu: { height: 8, borderRadius: 4 },
  kartHedef: { fontSize: 19, fontWeight: '800', color: '#24384a', marginTop: 10, textAlign: 'center' },
  tanitim: { marginTop: 14, backgroundColor: '#fff6d8', borderRadius: 14, padding: 12, borderWidth: 2, borderColor: '#ffcf3a', maxWidth: 280 },
  tanitimBaslik: { fontSize: 16, fontWeight: '900', color: '#c2410c', textAlign: 'center' },
  tanitimMetin: { fontSize: 15, fontWeight: '600', color: '#3d4f5f', textAlign: 'center', marginTop: 4 },
  ikinciDugme: { backgroundColor: '#e8f1f8', borderRadius: 22, paddingVertical: 11, paddingHorizontal: 18, marginHorizontal: 6 },
  ikinciYazi: { fontSize: 16, fontWeight: '800', color: '#2b5876' },
};
