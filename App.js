// Meyve Oyunu (geçici ad) — ilk oynanabilir sürüm.
// Görenler parmağını kaydırarak oynar; VoiceOver açıkken hücreler düğme olur: meyveye dokun, sonra yanındakine dokun.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as M from './oyun/mantik';
import { cal, meyveSesi, sesleriHazirla, titret } from './oyun/ses';

const MEYVELER = [
  { ad: 'cilek', isim: 'Çilek', renk: '#ff3b4e', resim: require('./assets/meyve/cilek.png') },
  { ad: 'limon', isim: 'Limon', renk: '#ffd21f', resim: require('./assets/meyve/limon.png') },
  { ad: 'uzum', isim: 'Üzüm', renk: '#a24dff', resim: require('./assets/meyve/uzum.png') },
  { ad: 'portakal', isim: 'Portakal', renk: '#ff8a1f', resim: require('./assets/meyve/portakal.png') },
  { ad: 'elma', isim: 'Elma', renk: '#7ed321', resim: require('./assets/meyve/elma.png') },
  { ad: 'erik', isim: 'Erik', renk: '#4263eb', resim: require('./assets/meyve/erik.png') },
];

// ÖNERİ (Murat onaylamadı): deneme oyununda 30 hamle
const BASLANGIC_HAMLE = 30;
const OVGU = ['', '', 'Güzel!', 'Harika!', 'Muhteşem!', 'Efsane!'];
const KAYIT_EN_IYI = 'meyve-en-iyi-v1';
const IPUCU_SURE = 7000;

let sonKimlik = 0;
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const oynat = (anim) => new Promise((r) => anim.start(() => r()));

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Oyun />
    </SafeAreaProvider>
  );
}

function Oyun() {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const TAHTA = Math.floor(Math.min(EG - 20, EY * 0.62, 560));
  const H = TAHTA / M.SUTUN;

  const [, setSurum] = useState(0);
  const yenile = useCallback(() => setSurum((s) => s + 1), []);
  const [puan, setPuan] = useState(0);
  const [hamle, setHamle] = useState(BASLANGIC_HAMLE);
  const [enIyi, setEnIyi] = useState(0);
  const [secili, setSecili] = useState(null);
  const [bitti, setBitti] = useState(null);
  const [efektler, setEfektler] = useState([]);
  const [ovgu, setOvgu] = useState(null);
  const [vo, setVo] = useState(false);

  const izgara = useRef(null); // izgara[r][c] = parça kimliği
  const parcalar = useRef(new Map()); // kimlik -> parça
  const mesgul = useRef(false);
  const puanRef = useRef(0);
  const hamleRef = useRef(BASLANGIC_HAMLE);
  const seciliRef = useRef(null);
  const voRef = useRef(false);
  const tahtaKonum = useRef({ x: 0, y: 0 });
  const tahtaGorunum = useRef(null);
  const ipucuZaman = useRef(null);
  const ipucuParcalar = useRef([]);
  const HRef = useRef(H);
  HRef.current = H;

  // ---------- yardımcılar ----------
  const duyur = (metin) => {
    if (voRef.current && metin) AccessibilityInfo.announceForAccessibility(metin);
  };

  const yeniParca = (tur, r, c, baslangicSatir = r) => {
    const p = {
      id: ++sonKimlik,
      tur,
      poz: new Animated.ValueXY({ x: c, y: baslangicSatir }),
      olcek: new Animated.Value(1),
      ez: new Animated.Value(0), // +1 ezilmiş (yere değince), -1 uzamış (düşerken)
      don: new Animated.Value(0), // sallanma (-1..1)
      zip: new Animated.Value(0), // zıplama (hücre biriminde, eksi = yukarı)
    };
    parcalar.current.set(p.id, p);
    return p;
  };

  const turIzgarasi = () => izgara.current.map((s) => s.map((id) => (id == null ? -1 : parcalar.current.get(id).tur)));

  const parcaAt = (r, c) => parcalar.current.get(izgara.current[r][c]);

  const tasi = (p, r, c, sure, yumusak = Easing.out(Easing.quad)) =>
    Animated.timing(p.poz, { toValue: { x: c, y: r }, duration: sure, easing: yumusak, useNativeDriver: true });

  // Yere değince ezilip jöle gibi geri gelir
  const inis = (p, guc = 1) =>
    Animated.sequence([
      Animated.timing(p.ez, { toValue: 0.9 * guc, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(p.ez, { toValue: 0, speed: 22, bounciness: 14, useNativeDriver: true }),
    ]);

  // Düşer (uzayarak), yere değince ezilir. Söz düşüş bitince çözülür; esneme arkada sürer.
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

  // Hafif zıplama (seçimde ve boşta)
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

  // "Hayır" sallanması
  const salla = (p) =>
    Animated.sequence([-1, 1, -0.7, 0.7, -0.3, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 45, useNativeDriver: true })));

  // Ekran sarsıntısı ve ışık parlaması (büyük zincirlerde)
  const sarsinti = useRef(new Animated.Value(0)).current;
  const flas = useRef(new Animated.Value(0)).current;
  const sars = (guc) => {
    Animated.sequence([guc, -guc, guc * 0.7, -guc * 0.7, guc * 0.35, 0].map((v) => Animated.timing(sarsinti, { toValue: v, duration: 40, useNativeDriver: true }))).start();
  };
  const parlat = () => {
    flas.setValue(0.45);
    Animated.timing(flas, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const seciliAyarla = (h) => {
    seciliRef.current = h;
    setSecili(h);
  };

  // ---------- oyunu kur ----------
  const kur = useCallback(() => {
    parcalar.current.clear();
    const t = M.yeniTahta();
    izgara.current = t.map((satir, r) => satir.map((tur, c) => yeniParca(tur, r, c, r - M.SATIR - 1).id));
    puanRef.current = 0;
    hamleRef.current = BASLANGIC_HAMLE;
    setPuan(0);
    setHamle(BASLANGIC_HAMLE);
    seciliAyarla(null);
    setBitti(null);
    setEfektler([]);
    mesgul.current = true;
    yenile();
    // Açılışta meyveler yukarıdan yağar, yere değince esner
    const sozler = [];
    for (let r = 0; r < M.SATIR; r++)
      for (let c = 0; c < M.SUTUN; c++) sozler.push(dusur(parcaAt(r, c), r, c, 4, (M.SATIR - 1 - r) * 55 + c * 22));
    Promise.all(sozler).then(() => {
      mesgul.current = false;
      ipucuKur();
    });
    cal('karistir', 0.6);
  }, []);

  useEffect(() => {
    sesleriHazirla();
    kur();
    AsyncStorage.getItem(KAYIT_EN_IYI)
      .then((v) => v && setEnIyi(parseInt(v, 10) || 0))
      .catch(() => {});
    AccessibilityInfo.isScreenReaderEnabled().then((a) => {
      voRef.current = a;
      setVo(a);
    });
    const dinle = AccessibilityInfo.addEventListener('screenReaderChanged', (a) => {
      voRef.current = a;
      setVo(a);
    });
    // Boşta: arada bir rastgele bir meyve hafifçe zıplar (tahta canlı görünsün)
    const canli = setInterval(() => {
      if (mesgul.current || !izgara.current || voRef.current) return;
      const r = Math.floor(Math.random() * M.SATIR);
      const c = Math.floor(Math.random() * M.SUTUN);
      const p = parcaAt(r, c);
      if (p && !ipucuParcalar.current.includes(p)) zipla(p, 0.12).start();
    }, 1600);
    return () => {
      dinle && dinle.remove && dinle.remove();
      clearTimeout(ipucuZaman.current);
      clearInterval(canli);
    };
  }, []);

  // ---------- ipucu: bir süre hamle yapılmazsa iki meyve hafifçe sallanır ----------
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
      if (mesgul.current || !izgara.current) return;
      const h = M.hamleBul(turIzgarasi());
      if (!h) return;
      const ps = [parcaAt(h[0][0], h[0][1]), parcaAt(h[1][0], h[1][1])];
      ipucuParcalar.current = ps;
      const salla = (p) =>
        Animated.sequence([
          Animated.timing(p.olcek, { toValue: 1.16, duration: 220, useNativeDriver: true }),
          Animated.timing(p.olcek, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(p.olcek, { toValue: 1.16, duration: 220, useNativeDriver: true }),
          Animated.timing(p.olcek, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]);
      Animated.parallel(ps.map(salla)).start(() => {
        if (ipucuParcalar.current === ps) ipucuKur();
      });
    }, IPUCU_SURE);
  };

  // ---------- efektler ----------
  const efektEkle = (e) => setEfektler((l) => [...l, { ...e, id: ++sonKimlik }]);
  const efektKaldir = useCallback((id) => setEfektler((l) => l.filter((e) => e.id !== id)), []);

  // ---------- eşleşmeleri çöz (zincirler dahil) ----------
  const cozumle = async () => {
    let zincir = 0;
    let toplam = 0;
    const patlayan = {};
    for (;;) {
      const gruplar = M.eslesmeleriBul(turIzgarasi());
      if (!gruplar.length) break;
      zincir++;

      // Puan ve sesler
      let sesSay = 0;
      for (const g of gruplar) {
        const kazanc = M.grupPuani(g.hucreler.length, zincir);
        toplam += kazanc;
        const orta = g.hucreler[Math.floor(g.hucreler.length / 2)];
        if (sesSay++ < 3) meyveSesi(MEYVELER[g.tur].ad, orta[1], M.SUTUN);
        efektEkle({ tip: 'puan', x: orta[1], y: orta[0], metin: '+' + kazanc, renk: MEYVELER[g.tur].renk });
      }
      if (zincir >= 2) {
        cal('zincir_' + Math.min(6, zincir - 1));
        const metin = OVGU[Math.min(OVGU.length - 1, zincir)];
        setOvgu({ id: ++sonKimlik, metin });
      }
      titret(zincir >= 3 ? 'guclu' : 'orta');
      const enBuyuk = Math.max(...gruplar.map((g) => g.hucreler.length));
      if (zincir >= 3 || enBuyuk >= 5) {
        sars(Math.min(9, 3 + zincir * 1.5));
        parlat();
      } else if (zincir === 2 || enBuyuk === 4) {
        sars(3);
      }

      // Patlat: önce sevinçle şişip sallanır, sonra patlar
      const sil = M.silinecekler(gruplar);
      const animler = [];
      for (const [r, c] of sil) {
        const p = parcaAt(r, c);
        patlayan[p.tur] = (patlayan[p.tur] || 0) + 1;
        animler.push(
          Animated.sequence([
            Animated.parallel([
              Animated.spring(p.olcek, { toValue: 1.28, speed: 40, bounciness: 10, useNativeDriver: true }),
              Animated.sequence([-0.6, 0.6, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 45, useNativeDriver: true }))),
            ]),
            Animated.timing(p.olcek, { toValue: 0, duration: 120, easing: Easing.in(Easing.back(2)), useNativeDriver: true }),
          ])
        );
      }
      const patlat = oynat(Animated.parallel(animler));
      await bekle(150);
      for (const [r, c] of sil) {
        const p = parcaAt(r, c);
        efektEkle({ tip: 'patlama', x: c, y: r, renk: MEYVELER[p.tur].renk });
      }
      await patlat;
      for (const [r, c] of sil) {
        parcalar.current.delete(izgara.current[r][c]);
        izgara.current[r][c] = null;
      }

      // Düşür ve yenilerini getir
      const s = M.yercekimi(turIzgarasi());
      const yeniIzgara = izgara.current.map((satir) => satir.slice());
      const dusus = [];
      for (const k of s.kaymalar) {
        const id = izgara.current[k.eski[0]][k.eski[1]];
        yeniIzgara[k.eski[0]][k.eski[1]] = null;
        yeniIzgara[k.yeni[0]][k.yeni[1]] = id;
      }
      const dusenler = [];
      for (const k of s.kaymalar) {
        const p = parcalar.current.get(yeniIzgara[k.yeni[0]][k.yeni[1]]);
        dusenler.push([p, k.yeni[0], k.yeni[1], k.yeni[0] - k.eski[0], 0]);
      }
      for (const n of s.yeniler) {
        const p = yeniParca(n.tur, n.yeni[0], n.yeni[1], -n.kacinci);
        yeniIzgara[n.yeni[0]][n.yeni[1]] = p.id;
        dusenler.push([p, n.yeni[0], n.yeni[1], n.yeni[0] + n.kacinci, 40]);
      }
      izgara.current = yeniIzgara;
      yenile();
      for (const [p, r, c, mesafe, gecikme] of dusenler) dusus.push(dusur(p, r, c, mesafe, gecikme + c * 12));
      await Promise.all(dusus);
    }
    puanRef.current += toplam;
    setPuan(puanRef.current);
    return { zincir, toplam, patlayan };
  };

  // ---------- karıştır (hamle kalmazsa) ----------
  const karistir = async () => {
    cal('karistir');
    const hepsi = [];
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) hepsi.push(parcaAt(r, c));
    await oynat(Animated.parallel(hepsi.map((p) => Animated.timing(p.olcek, { toValue: 0, duration: 200, useNativeDriver: true }))));
    const t = M.karistir(turIzgarasi());
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) parcaAt(r, c).tur = t[r][c];
    yenile();
    await oynat(Animated.parallel(hepsi.map((p) => Animated.spring(p.olcek, { toValue: 1, speed: 14, bounciness: 8, useNativeDriver: true }))));
    duyur('Hamle kalmadı, meyveler karıştırıldı');
  };

  // ---------- oyun sonu ----------
  const oyunuBitir = () => {
    const p = puanRef.current;
    const rekor = p > enIyiRef.current;
    if (rekor) {
      enIyiRef.current = p;
      setEnIyi(p);
      AsyncStorage.setItem(KAYIT_EN_IYI, String(p)).catch(() => {});
    }
    cal('bitis');
    titret('basari');
    setBitti({ puan: p, rekor });
    duyur(`Hamleler bitti. Puanın ${p}.${rekor ? ' Yeni rekor!' : ''}`);
  };
  const enIyiRef = useRef(0);
  enIyiRef.current = Math.max(enIyiRef.current, enIyi);

  // ---------- hamle ----------
  const hamleYap = async (a, b) => {
    if (mesgul.current || bitti) return;
    if (a[0] < 0 || a[1] < 0 || b[0] < 0 || b[1] < 0 || a[0] >= M.SATIR || b[0] >= M.SATIR || a[1] >= M.SUTUN || b[1] >= M.SUTUN) return;
    mesgul.current = true;
    ipucuDurdur();
    seciliAyarla(null);
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
    // Tutulan meyve hafifçe büyüyerek öbürünün üstünden geçer
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
    const sonuc = await cozumle();
    const parcalarMetni = Object.entries(sonuc.patlayan)
      .map(([tur, n]) => `${n} ${MEYVELER[tur].isim}`)
      .join(', ');
    duyur(`${parcalarMetni} patladı.${sonuc.zincir >= 2 ? ` ${sonuc.zincir} zincir.` : ''} ${sonuc.toplam} puan. ${hamleRef.current} hamle kaldı.`);

    if (hamleRef.current <= 0) {
      mesgul.current = false;
      yenile();
      oyunuBitir();
      return;
    }
    if (!M.hamleBul(turIzgarasi())) await karistir();
    mesgul.current = false;
    yenile();
    ipucuKur();
  };

  // Dokunarak seçme (VoiceOver kipinde ve kaydırmadan dokunulduğunda)
  const hucreDokun = (h) => {
    if (mesgul.current || bitti) return;
    const s = seciliRef.current;
    if (!s) {
      seciliAyarla(h);
      cal('secim');
      titret('hafif');
      zipla(parcaAt(h[0], h[1]), 0.2).start();
      duyur(`${MEYVELER[parcaAt(h[0], h[1]).tur].isim} seçildi`);
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
    zipla(parcaAt(h[0], h[1]), 0.2).start();
    duyur(`${MEYVELER[parcaAt(h[0], h[1]).tur].isim} seçildi`);
  };

  // ---------- kaydırma ----------
  const surukle = useRef({ bas: null, oldu: false });
  const fonk = useRef({});
  fonk.current = { hamleYap, hucreDokun };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !voRef.current,
      onMoveShouldSetPanResponder: () => !voRef.current,
      onPanResponderGrant: (e, g) => {
        // Meyveler ve zemin dokunmayı geçirir (pointerEvents none); bu yüzden locationX/Y tahtaya göredir.
        const hh = HRef.current;
        const ne = e.nativeEvent || {};
        const yerel = typeof ne.locationX === 'number' && typeof ne.locationY === 'number';
        const x = yerel ? ne.locationX : ne.pageX - tahtaKonum.current.x;
        const y = yerel ? ne.locationY : ne.pageY - tahtaKonum.current.y;
        const c = Math.floor(x / hh);
        const r = Math.floor(y / hh);
        surukle.current = { bas: r >= 0 && r < M.SATIR && c >= 0 && c < M.SUTUN ? [r, c] : null, oldu: false };
      },
      onPanResponderMove: (e, g) => {
        const s = surukle.current;
        if (!s.bas || s.oldu) return;
        const esik = HRef.current * 0.3;
        if (Math.max(Math.abs(g.dx), Math.abs(g.dy)) < esik) return;
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

  const tahtaYerlesti = () => {
    if (tahtaGorunum.current && tahtaGorunum.current.measureInWindow) {
      tahtaGorunum.current.measureInWindow((x, y) => {
        tahtaKonum.current = { x, y };
      });
    }
  };

  // ---------- çizim ----------
  if (!izgara.current) return <View style={st.kok} />;
  const liste = Array.from(parcalar.current.values());

  return (
    <View style={[st.kok, { paddingTop: ek.top + 8, paddingBottom: ek.bottom + 8 }]}>
      <View style={st.tepe} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={[st.tepe2, { left: -EG * 0.3, width: EG * 1.6, height: EG * 0.9, borderRadius: EG * 0.8, top: EY - EG * 0.32 }]} />
      </View>

      <View style={st.ust}>
        <Kutu baslik="Puan" deger={puan} etiket={`Puan ${puan}`} />
        <Kutu baslik="Hamle" deger={hamle} etiket={`${hamle} hamle kaldı`} vurgu={hamle <= 5} buyuk />
        <Kutu baslik="En iyi" deger={enIyi} etiket={`En iyi puan ${enIyi}`} />
      </View>

      <Animated.View style={[st.cerceve, { width: TAHTA + 12, height: TAHTA + 12, transform: [{ translateX: sarsinti }] }]}>
        <View
          ref={tahtaGorunum}
          onLayout={tahtaYerlesti}
          style={{ width: TAHTA, height: TAHTA, overflow: 'hidden', borderRadius: 12 }}
          {...(vo ? {} : pan.panHandlers)}
        >
          {/* Zemin kareleri */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {izgara.current.map((satir, r) =>
              satir.map((_, c) => (
                <View
                  key={`z${r}-${c}`}
                  style={{
                    position: 'absolute',
                    left: c * H + 1.5,
                    top: r * H + 1.5,
                    width: H - 3,
                    height: H - 3,
                    borderRadius: H * 0.22,
                    backgroundColor: (r + c) % 2 ? '#fff4df' : '#ffffff',
                  }}
                />
              ))
            )}
          </View>

          {secili && <SeciliHalka r={secili[0]} c={secili[1]} H={H} />}

          {/* Meyveler */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {liste.map((p) => (
              <Parca key={p.id} p={p} H={H} />
            ))}
          </View>

          {/* Efektler */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {efektler.map((e) =>
              e.tip === 'patlama' ? (
                <Patlama key={e.id} e={e} H={H} bitti={efektKaldir} />
              ) : (
                <PuanYazisi key={e.id} e={e} H={H} bitti={efektKaldir} />
              )
            )}
          </View>

          {/* VoiceOver kipinde her hücre bir düğme */}
          {vo &&
            izgara.current.map((satir, r) =>
              satir.map((id, c) => {
                const p = parcalar.current.get(id);
                const sec = secili && secili[0] === r && secili[1] === c;
                const ad = p ? MEYVELER[p.tur].isim : 'Boş';
                return (
                  <Pressable
                    key={`h${r}-${c}`}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${ad}${sec ? ' seçili' : ''}, ${r + 1}. satır ${c + 1}. sütun`}
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
          style={[StyleSheet.absoluteFill, { borderRadius: 18, backgroundColor: '#ffffff', opacity: flas }]}
        />
        {ovgu && <Ovgu key={ovgu.id} metin={ovgu.metin} bitti={() => setOvgu(null)} />}
      </Animated.View>

      <View style={st.alt}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Yeniden başla"
          onPress={() => !mesgul.current && kur()}
          style={({ pressed }) => [st.dugme, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <Text style={st.dugmeYazi}>Yeniden başla</Text>
        </Pressable>
      </View>

      {bitti && (
        <View style={st.perde} accessibilityViewIsModal>
          <GirisKart>
            <Text style={st.kartBaslik} accessibilityRole="header">
              Hamleler bitti!
            </Text>
            <Text style={st.kartPuan}>{bitti.puan}</Text>
            <Text style={st.kartAlt}>{bitti.rekor ? 'Yeni rekor!' : `En iyi: ${enIyi}`}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Tekrar oyna" onPress={kur} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Tekrar oyna</Text>
            </Pressable>
          </GirisKart>
        </View>
      )}
    </View>
  );
}

// Oyun sonu kartı yaylanarak gelir
function GirisKart({ children }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: 1, speed: 12, bounciness: 12, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[st.kart, { opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

// ---------- parçalar ----------
function Parca({ p, H }) {
  if (p.H !== H) {
    p.H = H;
    p.tx = Animated.multiply(p.poz.x, H);
    // Ezilince alt kenar yerinde kalsın diye hafifçe aşağı kayar
    p.ty = Animated.add(Animated.multiply(Animated.add(p.poz.y, p.zip), H), Animated.multiply(p.ez, H * 0.06));
    p.sx = p.ez.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.86, 1, 1.16] });
    p.sy = p.ez.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.14, 1, 0.82] });
    p.rot = p.don.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] });
  }
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: H,
        height: H,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateX: p.tx }, { translateY: p.ty }, { scale: p.olcek }, { scaleX: p.sx }, { scaleY: p.sy }, { rotate: p.rot }],
      }}
    >
      <Image source={MEYVELER[p.tur].resim} style={{ width: H * 0.9, height: H * 0.9 }} resizeMode="contain" />
    </Animated.View>
  );
}

function SeciliHalka({ r, c, H }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 450, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => d.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: c * H + 1,
        top: r * H + 1,
        width: H - 2,
        height: H - 2,
        borderRadius: H * 0.24,
        borderWidth: 3,
        borderColor: '#ffb800',
        backgroundColor: 'rgba(255,214,0,0.28)',
        opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
        transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) }],
      }}
    />
  );
}

// Patlama: meyve rengi damlalar (parlak noktalı), beyaz yıldız pırıltıları ve genişleyen ışık halkası
const DAMLALAR = [0, 40, 80, 125, 165, 205, 250, 290, 330].map((aci, i) => ({ aci, uzak: 0.7 + ((i * 37) % 10) / 22, boy: 0.13 + ((i * 53) % 7) / 70 }));
const PIRILTILAR = [20, 140, 260].map((aci, i) => ({ aci, uzak: 0.55 + i * 0.12 }));
function Patlama({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const cx = e.x * H + H / 2;
  const cy = e.y * H + H / 2;
  const sondur = t.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 1, 0] });
  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: cx - H * 0.5,
          top: cy - H * 0.5,
          width: H,
          height: H,
          borderRadius: H / 2,
          backgroundColor: e.renk,
          opacity: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.45, 0.2, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] }) }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: cx - H * 0.5,
          top: cy - H * 0.5,
          width: H,
          height: H,
          borderRadius: H / 2,
          borderWidth: 3,
          borderColor: '#ffffff',
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.95, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.6] }) }],
        }}
      />
      {DAMLALAR.map((d) => {
        const rad = (d.aci * Math.PI) / 180;
        const b = H * d.boy;
        const ux = Math.cos(rad) * H * d.uzak;
        const uy = Math.sin(rad) * H * d.uzak;
        return (
          <Animated.View
            key={d.aci}
            style={{
              position: 'absolute',
              left: cx - b / 2,
              top: cy - b / 2,
              width: b,
              height: b,
              borderRadius: b / 2,
              backgroundColor: e.renk,
              opacity: sondur,
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, ux] }) },
                // Damlalar önce dışarı fırlar, sonra hafifçe aşağı düşer
                { translateY: t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, uy, uy + H * 0.35] }) },
                { scale: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.1, 0.5] }) },
              ],
            }}
          >
            <View style={{ position: 'absolute', left: b * 0.2, top: b * 0.16, width: b * 0.32, height: b * 0.32, borderRadius: b, backgroundColor: 'rgba(255,255,255,0.85)' }} />
          </Animated.View>
        );
      })}
      {PIRILTILAR.map((p) => {
        const rad = (p.aci * Math.PI) / 180;
        const b = H * 0.34;
        return (
          <Animated.View
            key={'p' + p.aci}
            style={{
              position: 'absolute',
              left: cx - b / 2,
              top: cy - b / 2,
              width: b,
              height: b,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: t.interpolate({ inputRange: [0, 0.15, 0.6, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * H * p.uzak] }) },
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * H * p.uzak] }) },
                { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
                { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1, 0.3] }) },
              ],
            }}
          >
            <View style={{ position: 'absolute', width: b, height: b * 0.16, borderRadius: b, backgroundColor: '#ffffff' }} />
            <View style={{ position: 'absolute', width: b * 0.16, height: b, borderRadius: b, backgroundColor: '#ffffff' }} />
            <View style={{ position: 'absolute', width: b * 0.3, height: b * 0.3, borderRadius: b, backgroundColor: '#fffbe0' }} />
          </Animated.View>
        );
      })}
    </>
  );
}

function PuanYazisi({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  return (
    <Animated.Text
      style={[
        st.puanYazi,
        {
          left: e.x * H - H * 0.5,
          top: e.y * H + H * 0.1,
          width: H * 2,
          fontSize: Math.max(16, H * 0.42),
          color: e.renk,
          opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.9] }) }, { scale: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.5, 1.15, 1] }) }],
        },
      ]}
    >
      {e.metin}
    </Animated.Text>
  );
}

function Ovgu({ metin, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(t, { toValue: 1, speed: 16, bounciness: 12, useNativeDriver: true }),
      Animated.delay(550),
      Animated.timing(t, { toValue: 2, duration: 250, useNativeDriver: true }),
    ]).start(() => bitti());
  }, []);
  return (
    <View style={st.ovguKap} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Animated.Text
        style={[
          st.ovgu,
          {
            opacity: t.interpolate({ inputRange: [0, 0.3, 1, 2], outputRange: [0, 1, 1, 0] }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1, 1.3] }) }, { rotate: '-6deg' }],
          },
        ]}
      >
        {metin}
      </Animated.Text>
    </View>
  );
}

// Değer değişince sayaç gibi yükselir ve kutu hafifçe zıplar; vurgu açıkken kalp gibi atar
function Kutu({ baslik, deger, etiket, vurgu, buyuk }) {
  const [gosterilen, setGosterilen] = useState(deger);
  const onceki = useRef(deger);
  const olcek = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const bas = onceki.current;
    onceki.current = deger;
    if (bas === deger) return;
    Animated.sequence([
      Animated.timing(olcek, { toValue: 1.12, duration: 90, useNativeDriver: true }),
      Animated.spring(olcek, { toValue: 1, speed: 20, bounciness: 12, useNativeDriver: true }),
    ]).start();
    if (deger < bas) {
      setGosterilen(deger);
      return;
    }
    const t0 = Date.now();
    const sure = 450;
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / sure);
      setGosterilen(Math.round(bas + (deger - bas) * (1 - Math.pow(1 - k, 3))));
      if (k >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [deger]);
  const atis = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!vurgu) return;
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(atis, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0.6, duration: 120, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => {
      d.stop();
      atis.setValue(0);
    };
  }, [vurgu]);
  return (
    <Animated.View
      style={[st.kutu, buyuk && st.kutuBuyuk, { transform: [{ scale: Animated.add(olcek, Animated.multiply(atis, 0.08)) }] }]}
      accessible
      accessibilityLabel={etiket}
    >
      <Text style={st.kutuBaslik}>{baslik}</Text>
      <Text style={[st.kutuDeger, buyuk && { fontSize: 34 }, vurgu && { color: '#e8364a' }]}>{gosterilen}</Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  kok: { flex: 1, backgroundColor: '#bfe7ff', alignItems: 'center', justifyContent: 'center' },
  tepe: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  tepe2: { position: 'absolute', backgroundColor: '#c9eeb0' },
  ust: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 8, marginBottom: 14 },
  kutu: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    minWidth: 92,
    alignItems: 'center',
    shadowColor: '#3a6a8a',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  kutuBuyuk: { paddingVertical: 10, minWidth: 104, borderWidth: 3, borderColor: '#ffcf3a' },
  kutuBaslik: { fontSize: 13, fontWeight: '700', color: '#6a7f91', letterSpacing: 0.5 },
  kutuDeger: { fontSize: 24, fontWeight: '900', color: '#24384a' },
  cerceve: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#2c5d7c',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  alt: { marginTop: 18, alignItems: 'center' },
  dugme: {
    backgroundColor: '#ff7a3d',
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderBottomWidth: 4,
    borderBottomColor: '#d4561c',
  },
  dugmeBuyuk: { marginTop: 18, paddingVertical: 16, paddingHorizontal: 40 },
  dugmeYazi: { color: '#ffffff', fontSize: 17, fontWeight: '900' },
  puanYazi: {
    position: 'absolute',
    textAlign: 'center',
    fontWeight: '900',
    textShadowColor: '#ffffff',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  ovguKap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ovgu: {
    fontSize: 46,
    fontWeight: '900',
    color: '#ffcf1f',
    textShadowColor: '#c2410c',
    textShadowRadius: 2,
    textShadowOffset: { width: 3, height: 3 },
  },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,40,60,0.55)', alignItems: 'center', justifyContent: 'center' },
  kart: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 34,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffcf3a',
    minWidth: 260,
  },
  kartBaslik: { fontSize: 26, fontWeight: '900', color: '#24384a' },
  kartPuan: { fontSize: 56, fontWeight: '900', color: '#ff7a3d', marginTop: 6 },
  kartAlt: { fontSize: 17, fontWeight: '700', color: '#6a7f91' },
});
