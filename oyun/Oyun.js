// Oyun ekranı: bir seviyeyi oynatır. Görenler kaydırarak, VoiceOver kullananlar dokunarak oynar.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as M from './mantik';
import Sahne, { bolumNo, geceMi } from './sahne';
import { TANITIM, hedefTamam, yildizHesapla } from './seviyeler';
import { cal, meyveSesi, titret } from './ses';
import {
  BuzIkon,
  CicekAcma,
  KarIkon,
  SarmasikIkon,
  SisIkon,
  KarUst,
  CicekZemin,
  CicekUst,
  CicekIkon,
  AriEfekt,
  KapiIsareti,
  CivcivIkon,
  MantarIkon,
  BantSerit,
  SaatIkon,
  KarZemin,
  TohumIkon,
  Dalga,
  Donusum,
  KasaIkon,
  FiciIkon,
  Kirilma,
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

// Zincir yazıları İngilizce (Murat: global oyun). VoiceOver'a okunmaz; duyurular Türkçe kalır.
const OVGU = ['', '', 'Nice!', 'Great!', 'Amazing!', 'Fantastic!'];
// Övgü seslendirmeleri (aynı sıra); hamlenin bütün zinciri bitince en yüksek aşamanınki bir kez söylenir
const OVGU_SES = ['', '', 'ovgu_nice', 'ovgu_great', 'ovgu_amazing', 'ovgu_fantastic'];
const IPUCU_SURE = 5000;
const GUC_SEVIYE = 5; // güçlendiriciler bu seviyeden itibaren açılır
const EK_HAMLE = 5; // kaybedince bir kez verilen ek hamle
const SENLIK_EN_FAZLA = 15;
const BOT_ARA = 1100; // bot hamleleri arası bekleme (ms)
const OZEL_AD = { satir: 'satır temizler', sutun: 'sütun temizler', bomba: 'bomba', gokkusagi: '' };

let sonKimlik = 0;
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const oynat = (anim) => new Promise((r) => anim.start(() => r()));
const anahtar = (r, c) => r * M.SUTUN + c;

export function parcaAdi(p) {
  if (!p || p.tur === M.DELIK) return 'Boş';
  if (p.tur === M.KASA) return p.kat >= 2 ? 'İki katlı kasa' : 'Kasa';
  if (M.ficiMi(p.tur)) return (p.tur === M.FICI_ODUL ? 'Ödüllü fıçı' : 'Fıçı') + ', ' + p.kat + ' kat';
  if (p.tur === M.TOHUM) return 'Tohum';
  if (p.tur === M.CIVCIV) return 'Civciv';
  if (p.tur === M.YUMURTA) return p.kat >= 2 ? 'Yumurta, 2 kat' : 'Çatlak yumurta';
  if (p.sis) return 'Sisli';
  if (p.buz) return 'Buzlu ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.sarmasik) return 'Sarmaşıklı ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.mantar) return 'Mantarlı ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.ozel === 'gokkusagi' || !MEYVELER[p.tur]) return 'Gökkuşağı';
  return MEYVELER[p.tur].isim + (p.ozel ? ' ' + OZEL_AD[p.ozel] : '') + (p.saat ? `, saatli, ${p.saat} hamle` : '');
}

// Taşıyıcı bant satırı (rüzgâr) için hücre etiketine ek
function bantYaziKur(seviye) {
  return (r, c) => {
    const b = (seviye.bant || []).find((x) => x.satir === r);
    let y = b ? `, rüzgâr ${b.yon > 0 ? 'sağa' : 'sola'}` : '';
    (seviye.kapilar || []).forEach((k, i) => {
      if (k.giris[0] === r && k.giris[1] === c) y += `, ${i + 1}. akıntı kapısı girişi, meyveler ${k.cikis[1] + 1}. sütuna akar`;
      if (k.cikis[0] === r && k.cikis[1] === c) y += `, ${i + 1}. akıntı kapısı çıkışı`;
    });
    return y;
  };
}

// Kar varsa durum başa gelir: "Karlı çilek", "İki kat karlı tohum"
function karliAd(kat, ad) {
  if (!kat) return ad;
  if (M.cicekMi(kat)) return `${MEYVELER[kat - M.CICEK].isim} çiçeğinde ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  return (kat >= 2 ? 'İki kat karlı ' : 'Karlı ') + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
}

// Yeni bölümlerin hedefleri tek tabloda: hedef anlatımı, kalan, olay duyurusu ve simge
// kalanAnahtar: yayılabilen engeller için tahtada kalan sayısı (toplanan[k + 'Kalan'])
const EK_HEDEF = [
  { k: 'civciv', hedef: (n) => `${n} yumurtayı kır, civcivleri en alta indir`, ad: 'civciv', olay: (n) => (n > 1 ? `${n} civciv yuvaya uçtu` : 'Civciv yuvaya uçtu'), Ikon: CivcivIkon },
  { k: 'mantar', kalanAnahtar: true, hedef: () => 'bütün mantarları temizle', ad: 'mantar', olay: (n) => `${n} mantar temizlendi`, Ikon: MantarIkon },
  { k: 'saat', hedef: (n) => `${n} saatli meyveyi süresi dolmadan patlat`, ad: 'saatli meyve', olay: (n) => `${n} saatli meyve patladı`, Ikon: SaatIkon },
  { k: 'cicek', hedef: (n) => `${n} çiçeği tozlat`, ad: 'çiçek', olay: (n) => `${n} çiçek tozlandı`, Ikon: CicekIkon },
];

// Hedefin kısa anlatımı ("10 çilek topla", "1500 puana ulaş")
export function hedefMetni(seviye) {
  const h = seviye.hedef;
  if (h.puan) return `${h.puan} puana ulaş`;
  const parca = [];
  if (h.buz) parca.push(`${h.buz} buzu kır`);
  if (h.kasa) parca.push(`${h.kasa} kasayı kır`);
  if (h.fici) parca.push(`${h.fici} fıçıyı kır`);
  if (h.kar) parca.push(`${h.kar} kat karı erit`);
  if (h.tohum) parca.push(`${h.tohum} tohumu en alta indir`);
  if (h.sarmasik) parca.push('bütün sarmaşıkları kes');
  if (h.sis) parca.push(`${h.sis} sisi dağıt`);
  for (const e of EK_HEDEF) if (h[e.k]) parca.push(e.hedef(h[e.k]));
  const p = Object.entries(h.topla || {}).map(([tur, n]) => `${n} ${MEYVELER[tur].isim.toLocaleLowerCase('tr')}`);
  if (p.length) parca.push((p.length > 1 ? p.slice(0, -1).join(', ') + ' ve ' + p[p.length - 1] : p[0]) + ' topla');
  const m = parca.length > 1 ? parca.slice(0, -1).join(', ') + ' ve ' + parca[parca.length - 1] : parca[0];
  return m.charAt(0).toLocaleUpperCase('tr') + m.slice(1);
}

// Kalan hedef ("7 çilek kaldı, elma tamam")
function kalanMetni(seviye, toplanan, puan) {
  const h = seviye.hedef;
  if (h.puan) return puan >= h.puan ? 'Puan hedefi tamam' : `${h.puan - puan} puan kaldı`;
  const l = [];
  if (h.buz) {
    const k = Math.max(0, h.buz - (toplanan.buz || 0));
    l.push(k ? `${k} buz kaldı` : 'buz tamam');
  }
  if (h.kasa) {
    const k = Math.max(0, h.kasa - (toplanan.kasa || 0));
    l.push(k ? `${k} kasa kaldı` : 'kasa tamam');
  }
  if (h.fici) {
    const k = Math.max(0, h.fici - (toplanan.fici || 0));
    l.push(k ? `${k} fıçı kaldı` : 'fıçı tamam');
  }
  if (h.kar) {
    const k = Math.max(0, h.kar - (toplanan.kar || 0));
    l.push(k ? `${k} kar kaldı` : 'kar tamam');
  }
  if (h.sarmasik) {
    const k = toplanan.sarmasikKalan == null ? h.sarmasik : toplanan.sarmasikKalan;
    l.push(k ? `${k} sarmaşık kaldı` : 'sarmaşık tamam');
  }
  if (h.sis) {
    const k = Math.max(0, h.sis - (toplanan.sis || 0));
    l.push(k ? `${k} sis kaldı` : 'sis tamam');
  }
  if (h.tohum) {
    const k = Math.max(0, h.tohum - (toplanan.tohum || 0));
    l.push(k ? `${k} tohum kaldı` : 'tohum tamam');
  }
  for (const e of EK_HEDEF)
    if (h[e.k]) {
      const k = e.kalanAnahtar ? (toplanan[e.k + 'Kalan'] == null ? h[e.k] : toplanan[e.k + 'Kalan']) : Math.max(0, h[e.k] - (toplanan[e.k] || 0));
      l.push(k ? `${k} ${e.ad} kaldı` : `${e.ad} tamam`);
    }
  for (const [tur, n] of Object.entries(h.topla || {})) {
    const k = Math.max(0, n - (toplanan[tur] || 0));
    const ad = MEYVELER[tur].isim.toLocaleLowerCase('tr');
    l.push(k ? `${k} ${ad} kaldı` : `${ad} tamam`);
  }
  return l.join(', ');
}

export default function Oyun({ seviye, enIyi, sonrakiVar, bitince, geri, sonraki, tekrar, bot = false, botDegistir, guc = {}, gucHarca, bolumOdulVar = false }) {
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
  const [gucModu, setGucModu] = useState(null); // 'cekic' seçiliyken dokunulan parça kırılır
  const gucModuRef = useRef(null);
  const ekHamleRef = useRef(false);
  const gucRef = useRef(guc);
  gucRef.current = guc;

  const izgara = useRef(null);
  // Kar: parçalarla birlikte düşmeyen zemin katmanı (kat sayısı)
  const zemin = useRef(null);
  const parcalar = useRef(new Map());
  const mesgul = useRef(true);
  const puanRef = useRef(0);
  const hamleRef = useRef(seviye.hamle);
  const toplananRef = useRef({});
  const seciliRef = useRef(null);
  const voRef = useRef(false);
  const bittiRef = useRef(false);
  const ipucuZaman = useRef(null);
  const kayipNeden = useRef(null);
  const mantarSayac = useRef(0); // çekiçsiz hamle sayısı (mantar her 3 hamlede yayılır)
  const bantYazi = bantYaziKur(seviye); // 'Saat doldu' gibi; boşsa 'Hamleler bitti'
  const ipucuParcalar = useRef([]);
  const HRef = useRef(H);
  HRef.current = H;
  // Bot (otomatik oyun): ekran görüntüsü ve deneme için. Açıkken her hamleden sonra kısa bekleyip en iyi hamleyi yapar.
  const botRef = useRef(bot);
  botRef.current = bot;

  const duyur = (metin) => {
    if (voRef.current && metin) AccessibilityInfo.announceForAccessibility(metin);
  };

  // ---------- parçalar ----------
  const yeniParca = (tur, r, c, baslangicSatir = r, ozel = null, engel = null) => {
    const p = {
      id: ++sonKimlik,
      tur,
      ozel,
      buz: engel === 'buz',
      sarmasik: engel === 'sarmasik',
      mantar: engel === 'mantar',
      saat: M.saatMi(engel) ? M.saatDeger(engel) : 0,
      sis: engel === 'sis',
      kat: M.kasaMi(tur) ? engel || (M.ficiMi(tur) ? 3 : 1) : 0,
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
  const engelIzgarasi = () =>
    izgara.current.map((s) =>
      s.map((id) => {
        const p = id == null ? null : parcalar.current.get(id);
        if (!p) return null;
        if (p.buz) return 'buz';
        if (p.sarmasik) return 'sarmasik';
        if (p.mantar) return 'mantar';
        if (p.saat) return 'saat' + p.saat;
        if (p.sis) return 'sis';
        if (M.kasaMi(p.tur)) return p.kat;
        return null;
      })
    );
  const kilitIzgarasi = () => engelIzgarasi().map((s) => s.map((e) => !M.serbestMi(e)));
  const kilitli = (p) => !p || p.buz || p.sarmasik || p.sis || p.mantar || M.kasaMi(p.tur) || p.tur === M.DELIK;
  // Karıştırmada ve şenlikte yerinde kalanlar (tohum takas edilebilir ama meyveye dönüşmez)
  const sabit = (p) => kilitli(p) || M.inenMi(p.tur);

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
    M.seviyeKur(seviye);
    kayipNeden.current = null;
    // Yalnız bilgisayardaki denemelerde: hazır tahta ve özel parçalar verilebilir (telefonda bu değişkenler yoktur)
    const deneme = typeof globalThis !== 'undefined' ? globalThis.__denemeTahta : null;
    const kur = deneme && deneme.tur ? { t: deneme.tur, oz: deneme.oz, engel: deneme.engel, zemin: deneme.zemin } : M.duzenliTahta(seviye.duzen);
    zemin.current = kur.zemin || kur.t.map((s) => s.map(() => 0));
    toplananRef.current = M.baslangicToplanan(seviye, kur.engel || kur.t.map((s) => s.map(() => null)));
    mantarSayac.current = 0;
    izgara.current = kur.t.map((satir, r) =>
      satir.map((tur, c) => yeniParca(tur, r, c, r - M.SATIR - 1, kur.oz ? kur.oz[r][c] : null, kur.engel ? kur.engel[r][c] : null).id)
    );
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

  useEffect(() => {
    const id = setInterval(() => {
      if (!botRef.current || mesgul.current || bittiRef.current || !izgara.current || asamaRef.current !== 'oyun') return;
      const h = M.enIyiHamle(turIzgarasi(), ozIzgarasi(), engelIzgarasi(), seviye.hedef, seviye.ozel, 30, zemin.current);
      if (h) fonk.current.hamleYap(h[0], h[1]);
    }, BOT_ARA);
    return () => clearInterval(id);
  }, []);
  const asamaRef = useRef('giris');
  asamaRef.current = asama;
  // Bot açıkken tam otomatik: "Başla"ya basar; seviye bitince sonucu gösterip sonrakine geçer ya da tekrar dener
  useEffect(() => {
    if (!bot) return;
    let z = null;
    if (asama === 'giris') z = setTimeout(() => botRef.current && asamaRef.current === 'giris' && basla(), 1800);
    if (asama === 'teklif') z = setTimeout(() => botRef.current && ekHamleAl(), 1800);
    if (asama === 'sonuc' && sonuc)
      z = setTimeout(() => {
        if (!botRef.current) return;
        if (sonuc.basarili && sonrakiVar) sonraki();
        else tekrar();
      }, 4500);
    return () => clearTimeout(z);
  }, [asama, bot, sonuc]);

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
  // Uygun bir hamlenin iki parçası nabız gibi büyüyüp küçülür; soyle: VoiceOver'a hamleyi söyler (İpucu düğmesi)
  const ipucuGoster = (soyle = false) => {
    if (mesgul.current || !izgara.current || bittiRef.current) return;
    const h = M.hamleBul(turIzgarasi(), ozIzgarasi(), kilitIzgarasi());
    if (!h) return;
    ipucuDurdur();
    const ps = [parcaAt(h[0][0], h[0][1]), parcaAt(h[1][0], h[1][1])];
    ipucuParcalar.current = ps;
    if (soyle) {
      cal('pling', 0.6);
      duyur(`İpucu: ${h[0][0] + 1}. satır ${h[0][1] + 1}. sütundaki ${parcaAdi(ps[0])} ile ${h[1][0] + 1}. satır ${h[1][1] + 1}. sütundaki ${parcaAdi(ps[1])} yer değiştir`);
    }
    const nabiz = (p) => Animated.sequence([1.16, 1, 1.16, 1].map((v) => Animated.timing(p.olcek, { toValue: v, duration: 220, useNativeDriver: true })));
    Animated.parallel(ps.map(nabiz)).start(() => {
      if (ipucuParcalar.current === ps) ipucuKur();
    });
  };
  const ipucuKur = () => {
    ipucuDurdur();
    ipucuZaman.current = setTimeout(() => ipucuGoster(false), IPUCU_SURE);
  };

  // ---------- toplama ----------
  const topla = (sayac) => {
    const yeni = { ...toplananRef.current };
    for (const [tur, n] of Object.entries(sayac)) yeni[tur] = (yeni[tur] || 0) + n;
    toplananRef.current = yeni;
    setToplanan(yeni);
  };
  // Sarmaşık yayılabildiği için hedefte tahtada kalan sayısı tutulur
  const sarmasikGuncelle = () => {
    if (!(seviye.hedef.sarmasik || seviye.hedef.mantar) || !izgara.current) return;
    toplananRef.current = M.kalanlariYaz({ ...toplananRef.current }, engelIzgarasi());
    setToplanan(toplananRef.current);
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
    const sayacToplam = { buz: 0, kasa: 0, kar: 0, tohum: 0, sarmasik: 0, fici: 0, sis: 0 };
    let ekler = ekHucre;
    for (;;) {
      const t = turIzgarasi();
      const oz = ozIzgarasi();
      const adim = M.cozumAdimi(t, oz, { hamle: zincir === 0 ? hamleHucre : null, ek: ekler, izinli: seviye.ozel, engel: engelIzgarasi() });
      ekler = [];
      if (M.adimBos(adim)) break;
      zincir++;
      // Kar erimesi: kasaların katı azalmadan önce hesaplanır
      const eriyen = M.karEriyen(adim, engelIzgarasi(), zemin.current, turIzgarasi());

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
      // Buzlu meyveler silinmez: buzları kırılır, meyve yerinde kalır
      const buzKirilan = [];
      const silinen = [];
      for (const [r, c] of adim.hucreler) {
        const p = parcaAt(r, c);
        if (!p) continue;
        if (p.buz || p.sarmasik || p.sis || p.mantar) buzKirilan.push({ r, c, p });
        else silinen.push({ r, c, p });
      }
      // Kasalar: vurulan kasanın katı azalır, sıfırlanınca kırılıp silinir
      let kasaKirilan = 0;
      let ficiKirilan = 0;
      let ficiVurulan = 0;
      let yumurtaVurulan = 0;
      const odulOlusan = [];
      for (const [r, c] of adim.kasaVurus) {
        const p = parcaAt(r, c);
        if (!p || !M.kasaMi(p.tur)) continue;
        const fici = M.ficiMi(p.tur);
        if (fici) ficiVurulan++;
        p.kat -= 1;
        if (p.tur === M.YUMURTA) {
          // Yumurta: ilk vuruşta çatlar, ikincide civciv çıkar
          yumurtaVurulan++;
          efektEkle({ tip: 'kirilma', tur: 'yumurta', r, c, az: p.kat > 0 });
          if (p.kat <= 0) {
            p.tur = M.CIVCIV;
            p.kat = 0;
            efektEkle({ tip: 'donusum', r, c });
            parlayarakDonustur(p).start();
          } else Animated.sequence([-0.5, 0.5, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 50, useNativeDriver: true }))).start();
          continue;
        }
        if (p.kat <= 0) {
          efektEkle({ tip: 'kirilma', tur: 'kasa', r, c });
          if (fici) ficiKirilan++;
          else kasaKirilan++;
          if (p.tur === M.FICI_ODUL) {
            // Ödüllü fıçıdan özel meyve çıkar (yerinde kalır)
            const tur = Math.floor(Math.random() * seviye.tur);
            const ozel = ['satir', 'sutun', 'bomba'][Math.floor(Math.random() * 3)];
            p.kat = 0;
            p.tur = tur;
            p.ozel = ozel;
            odulOlusan.push({ hucre: [r, c], tur, ozel });
            efektEkle({ tip: 'donusum', r, c });
            parlayarakDonustur(p).start();
          } else silinen.push({ r, c, p, kasa: true });
        } else {
          efektEkle({ tip: 'kirilma', tur: 'kasa', r, c, az: true });
          Animated.sequence([-0.5, 0.5, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 50, useNativeDriver: true }))).start();
        }
      }
      // Eriyen kar: zemin bir kat azalır
      let karSay = 0;
      let cicekSay = 0;
      for (const [r, c] of eriyen) {
        if (M.cicekMi(zemin.current[r][c])) {
          // Çiçek tozlandı: arı gelir
          zemin.current[r][c] = 0;
          cicekSay++;
          efektEkle({ tip: 'ari', r, c });
          continue;
        }
        zemin.current[r][c] -= 1;
        karSay++;
        efektEkle({ tip: 'kirilma', tur: 'kar', r, c, az: zemin.current[r][c] > 0 });
      }
      if (karSay) cal('buz', 0.55);
      if (cicekSay) cal('cicek');
      // Alt sıraya inen tohumlar toplanır: çiçek açar (civcivler yuvaya uçar)
      let civcivSay = 0;
      for (const [r, c] of adim.tohumlar || []) {
        const p = parcaAt(r, c);
        if (!p || !M.inenMi(p.tur)) continue;
        silinen.push({ r, c, p, tohum: true });
        if (p.tur === M.CIVCIV) {
          civcivSay++;
          efektEkle({ tip: 'kirilma', tur: 'civciv', r, c });
        } else efektEkle({ tip: 'cicek', r, c });
      }
      if ((adim.tohumlar || []).length > civcivSay) {
        cal('ozel_olustu');
        titret('basari');
      }
      if (civcivSay) {
        cal('civciv');
        titret('basari');
      }
      if (kasaKirilan || ficiKirilan) cal('kasa_kir');
      else if (adim.kasaVurus.length > yumurtaVurulan) cal('kasa_vur');
      if (yumurtaVurulan) {
        cal('yumurta');
        yenile();
      }
      if (odulOlusan.length) {
        cal('ozel_olustu');
        olusanlar.push(...odulOlusan);
        yenile();
      } else if (ficiVurulan) yenile();
      let sarmasikKesilen = 0;
      let sisDagilan = 0;
      let mantarKesilen = 0;
      for (const { r, c, p } of buzKirilan) {
        if (p.sis) {
          p.sis = false;
          sisDagilan++;
          efektEkle({ tip: 'kirilma', tur: 'sis', r, c });
        } else if (p.sarmasik) {
          p.sarmasik = false;
          sarmasikKesilen++;
          efektEkle({ tip: 'kirilma', tur: 'yaprak', r, c });
        } else if (p.mantar) {
          p.mantar = false;
          mantarKesilen++;
          efektEkle({ tip: 'kirilma', tur: 'mantar', r, c });
        } else {
          p.buz = false;
          efektEkle({ tip: 'kirilma', tur: 'buz', r, c });
        }
        Animated.sequence([
          Animated.timing(p.olcek, { toValue: 1.15, duration: 90, useNativeDriver: true }),
          Animated.spring(p.olcek, { toValue: 1, speed: 18, bounciness: 12, useNativeDriver: true }),
        ]).start();
      }
      if (buzKirilan.length) {
        if (sarmasikKesilen) cal('sarmasik_kes');
        if (sisDagilan) cal('sis');
        if (mantarKesilen) cal('sarmasik_kes');
        if (buzKirilan.length > sarmasikKesilen + sisDagilan + mantarKesilen) cal('buz');
        yenile();
      }
      const akan = new Map(); // hücre -> hedef hücre
      for (const o of adim.olusan)
        for (const [r, c] of o.hucreler) {
          const p = parcaAt(r, c);
          if ((r !== o.hucre[0] || c !== o.hucre[1]) && p && !p.buz && !p.sarmasik && !p.sis && !p.mantar && !buzKirilan.some((b) => b.p === p)) akan.set(anahtar(r, c), o.hucre);
        }
      const animler = [];
      for (const { r, c, p, kasa, tohum } of silinen) {
        if (p.tur >= 0 && p.tur < 6) patlayan[p.tur] = (patlayan[p.tur] || 0) + 1;
        if (kasa || tohum) {
          animler.push(Animated.timing(p.olcek, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }));
          continue;
        }
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
      for (const { r, c, p } of silinen) if (!akan.has(anahtar(r, c)) && !M.kasaMi(p.tur) && !M.inenMi(p.tur)) efektEkle({ tip: 'patlama', x: c, y: r, renk: MEYVELER[p.tur] ? MEYVELER[p.tur].renk : '#ffcc33', koyu: MEYVELER[p.tur] ? MEYVELER[p.tur].koyu : '#c08a00' });
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
      const tohumSay = (adim.tohumlar || []).length - civcivSay;
      const saatSay = silinen.filter((x) => x.p.saat).length;
      topla({ ...adimSayaci(silinen), buz: buzKirilan.length - sarmasikKesilen - sisDagilan - mantarKesilen, sis: sisDagilan, mantar: mantarKesilen, kasa: kasaKirilan, fici: ficiKirilan, kar: karSay, cicek: cicekSay, saat: saatSay, tohum: tohumSay, civciv: civcivSay });
      sarmasikGuncelle();
      sayacToplam.sarmasik += sarmasikKesilen;
      sayacToplam.buz += buzKirilan.length - sarmasikKesilen - sisDagilan - mantarKesilen;
      sayacToplam.mantar = (sayacToplam.mantar || 0) + mantarKesilen;
      sayacToplam.sis += sisDagilan;
      sayacToplam.kasa += kasaKirilan;
      sayacToplam.fici += ficiKirilan;
      sayacToplam.kar += karSay;
      sayacToplam.cicek = (sayacToplam.cicek || 0) + cicekSay;
      sayacToplam.saat = (sayacToplam.saat || 0) + saatSay;
      sayacToplam.civciv = (sayacToplam.civciv || 0) + civcivSay;
      sayacToplam.tohum += tohumSay;
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
      let kapidan = 0;
      for (const k of s.kaymalar) {
        const p = parcalar.current.get(yeniIzgara[k.yeni[0]][k.yeni[1]]);
        if (k.eski[1] !== k.yeni[1]) {
          // Akıntı kapısından geçen parça: çıkış sütununun üstünden süzülerek iner
          kapidan++;
          const bas = -1 - kapidan * 0.6;
          p.poz.setValue({ x: k.yeni[1], y: bas });
          dusenler.push([p, k.yeni[0], k.yeni[1], k.yeni[0] - bas, 60 * kapidan]);
        } else dusenler.push([p, k.yeni[0], k.yeni[1], k.yeni[0] - k.eski[0], 0]);
      }
      if (kapidan) cal('kapi', 0.7);
      for (const n of s.yeniler) {
        const p = yeniParca(n.tur, n.yeni[0], n.yeni[1], -n.kacinci);
        yeniIzgara[n.yeni[0]][n.yeni[1]] = p.id;
        dusenler.push([p, n.yeni[0], n.yeni[1], n.yeni[0] + n.kacinci, 40]);
      }
      izgara.current = yeniIzgara;
      yenile();
      await Promise.all(dusenler.map(([p, r, c, m, g]) => dusur(p, r, c, m, g + c * 12)));
    }
    return { zincir, toplam, patlayan, olusanlar, ...sayacToplam };
  };
  // Bu adımda silinen meyvelerin türlere göre sayısı (toplama hedefi için)
  function adimSayaci(silinen) {
    const s = {};
    for (const { p, kasa, tohum } of silinen) if (!kasa && !tohum && p.tur >= 0 && p.tur < 6) s[p.tur] = (s[p.tur] || 0) + 1;
    return s;
  }

  // ---------- karıştır (hamle kalmazsa) ----------
  const karistir = async (mesaj = 'Hamle kalmadı, meyveler karıştırıldı') => {
    cal('karistir');
    // Buzlu meyveler ve kasalar yerinde kalır; yalnız hareketli parçalar karışır
    const hepsi = [];
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) hepsi.push(parcaAt(r, c));
    const sabitYer = hepsi.map((p) => sabit(p));
    const hareketli = hepsi.filter((p, i) => !sabitYer[i]);
    const kilit = kilitIzgarasi();
    let yerlesim = null;
    for (let d = 0; d < 400 && !yerlesim; d++) {
      const kar = hareketli.slice();
      for (let i = kar.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kar[i], kar[j]] = [kar[j], kar[i]];
      }
      let n = 0;
      const k = hepsi.map((p, i) => (sabitYer[i] ? p : kar[n++]));
      const t = [];
      const oz = [];
      for (let r = 0; r < M.SATIR; r++) {
        t.push(k.slice(r * M.SUTUN, r * M.SUTUN + M.SUTUN).map((p) => p.tur));
        oz.push(k.slice(r * M.SUTUN, r * M.SUTUN + M.SUTUN).map((p) => p.ozel || null));
      }
      if (!M.eslesmeleriBul(t).length && M.hamleBul(t, oz, kilit)) yerlesim = k;
    }
    if (!yerlesim) {
      // Çok nadir: normal meyvelerin türlerini yeniden dağıt
      const t = M.karistir(turIzgarasi());
      for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) {
        const p = parcaAt(r, c);
        if (!p.ozel && !sabit(p)) p.tur = t[r][c];
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
    duyur(mesaj);
  };

  // ---------- seviye sonu ----------
  const sonucuGoster = async (basarili) => {
    bittiRef.current = true;
    ipucuDurdur();
    const p = puanRef.current;
    const yildiz = yildizHesapla(seviye, p, basarili);
    const rekor = basarili && enIyi > 0 && p > enIyi;
    const bolumOdulu = basarili && bolumOdulVar;
    bitince && bitince({ no: seviye.no, basarili, yildiz, puan: p });
    setSonuc({ basarili, yildiz, puan: p, rekor, bolumOdulu, neden: kayipNeden.current });
    setAsama('sonuc');
    if (basarili) {
      cal('kazandin');
      setTimeout(() => cal('ovgu_level'), 250);
      titret('basari');
      duyur(`Seviye ${seviye.no} tamam! ${yildiz} yıldız. Puanın ${p}.${rekor ? ' Yeni rekor!' : ''}${bolumOdulu ? ' Bölüm tamamlandı! Her güçlendiriciden 1 tane kazandın.' : ''}`);
    } else {
      cal('kaybettin');
      titret('hata');
      duyur(`${kayipNeden.current || 'Hamleler bitti'}. ${kalanMetni(seviye, toplananRef.current, p)}. Tekrar dene.`);
    }
  };

  // Hedef tamamlanınca kalan hamleler çizgili meyveye dönüşüp patlar
  const senlik = async () => {
    setAsama('senlik');
    setOvgu({ id: ++sonKimlik, metin: 'Garden Party!' });
    cal('ovgu_garden');
    duyur('Hedef tamam! Kalan hamleler şenliğe dönüşüyor.');
    await bekle(700);
    const donusecek = Math.min(SENLIK_EN_FAZLA, hamleRef.current);
    const hucreler = [];
    for (let i = 0; i < donusecek; i++) {
      const adaylar = [];
      for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) {
        const p = parcaAt(r, c);
        if (p && !p.ozel && !sabit(p)) adaylar.push([r, c]);
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

  // ---------- hamleler bitince ek hamle teklifi (her denemede bir kez; ileride ödüllü reklam) ----------
  const teklifGoster = () => {
    ipucuDurdur();
    setAsama('teklif');
    cal('gecersiz', 0.7);
    titret('hata');
    duyur(`Hamleler bitti. ${kalanMetni(seviye, toplananRef.current, puanRef.current)}. ${EK_HAMLE} hamle daha ister misin?`);
  };
  const ekHamleAl = async () => {
    if (ekHamleRef.current || asamaRef.current !== 'teklif') return;
    ekHamleRef.current = true;
    hamleRef.current += EK_HAMLE;
    setHamle(hamleRef.current);
    setAsama('oyun');
    cal('ozel_olustu');
    titret('basari');
    duyur(`${EK_HAMLE} hamle eklendi`);
    if (!M.hamleBul(turIzgarasi(), ozIzgarasi(), kilitIzgarasi())) await karistir();
    mesgul.current = false;
    yenile();
    ipucuKur();
  };
  const teklifiReddet = () => {
    if (asamaRef.current !== 'teklif') return;
    ekHamleRef.current = true;
    sonucuGoster(false);
  };

  // ---------- güçlendiriciler ----------
  const GUC_AD = { cekic: 'Çekiç', karistir: 'Karıştır', hamle3: 'Artı 3 hamle' };
  const gucModuAyarla = (m) => {
    gucModuRef.current = m;
    setGucModu(m);
  };
  const gucBas = async (ad) => {
    if (asamaRef.current !== 'oyun' || bittiRef.current) return;
    if (ad === 'ipucu') {
      if (mesgul.current) return;
      ipucuGoster(true);
      return;
    }
    if (mesgul.current) return;
    if (gucModuRef.current === 'cekic' && ad === 'cekic') {
      gucModuAyarla(null);
      duyur('Çekiç bırakıldı');
      return;
    }
    if (!(gucRef.current[ad] > 0)) {
      cal('gecersiz');
      titret('hata');
      duyur(`${GUC_AD[ad]} kalmadı`);
      return;
    }
    if (ad === 'cekic') {
      seciliAyarla(null);
      ipucuDurdur();
      gucModuAyarla('cekic');
      cal('secim');
      titret('hafif');
      duyur('Çekiç hazır. Kırmak istediğin parçaya dokun.');
      return;
    }
    gucModuAyarla(null);
    gucHarca && gucHarca(ad);
    if (ad === 'karistir') {
      mesgul.current = true;
      ipucuDurdur();
      seciliAyarla(null);
      await karistir('Meyveler karıştırıldı');
      mesgul.current = false;
      yenile();
      ipucuKur();
    } else if (ad === 'hamle3') {
      hamleRef.current += 3;
      setHamle(hamleRef.current);
      cal('ozel_olustu');
      titret('basari');
      duyur(`3 hamle eklendi. ${hamleRef.current} hamle`);
    }
  };
  const cekicVur = async (h) => {
    const p = parcaAt(h[0], h[1]);
    if (!p || p.tur === M.DELIK) return;
    if (M.inenMi(p.tur)) {
      cal('gecersiz');
      titret('hata');
      duyur(p.tur === M.CIVCIV ? 'Civciv kırılamaz, onu en alt sıraya indir' : 'Tohum kırılamaz, onu en alt sıraya indir');
      salla(p).start();
      return;
    }
    gucModuAyarla(null);
    gucHarca && gucHarca('cekic');
    mesgul.current = true;
    ipucuDurdur();
    seciliAyarla(null);
    cal('cekic');
    titret('guclu');
    sars(5);
    await oynat(
      Animated.sequence([
        Animated.timing(p.olcek, { toValue: 0.75, duration: 90, useNativeDriver: true }),
        Animated.timing(p.olcek, { toValue: 1.1, duration: 90, useNativeDriver: true }),
      ])
    );
    p.olcek.setValue(1);
    const sonuc = await cozumle({ ek: [h] });
    await hamleSonrasi(sonuc, true);
  };

  // ---------- hamle ----------
  // İki çözüm sonucunu birleştirir (hamle + bant kayması gibi)
  const sonucBirlestir = (a, b) => {
    const y = { ...a, patlayan: { ...a.patlayan }, olusanlar: [...a.olusanlar, ...b.olusanlar], zincir: Math.max(a.zincir, b.zincir) };
    for (const [k, v] of Object.entries(b.patlayan)) y.patlayan[k] = (y.patlayan[k] || 0) + v;
    for (const k of Object.keys(b)) if (typeof b[k] === 'number' && k !== 'zincir') y[k] = (a[k] || 0) + b[k];
    return y;
  };
  // Taşıyıcı bant: bant satırları bir kare kayar (uçtan çıkan öbür uçtan girer), sonra oluşan eşleşmeler çözülür
  const bantKaydir = async () => {
    cal('ruzgar');
    const yeni = izgara.current.map((s) => s.slice());
    const animler = [];
    const sarmalar = [];
    for (const { satir: r, yon } of seviye.bant)
      for (let c = 0; c < M.SUTUN; c++) {
        const id = izgara.current[r][c];
        const y = (c + yon + M.SUTUN) % M.SUTUN;
        yeni[r][y] = id;
        const p = parcalar.current.get(id);
        if (!p) continue;
        if (Math.abs(y - c) > 1) {
          sarmalar.push([p, r, y, yon]);
          animler.push(Animated.timing(p.poz, { toValue: { x: c + yon, y: r }, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
        } else animler.push(tasi(p, r, y, 220, Easing.inOut(Easing.quad)));
      }
    await oynat(Animated.parallel(animler));
    await oynat(
      Animated.parallel(
        sarmalar.map(([p, r, y, yon]) => {
          p.poz.setValue({ x: y - yon, y: r });
          return tasi(p, r, y, 160);
        })
      )
    );
    izgara.current = yeni;
    yenile();
    return cozumle();
  };

  const hamleSonrasi = async (sonuc, cekicle = false) => {
    // Rüzgâr: bant satırları kayar
    if (seviye.bant && seviye.bant.length && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      sonuc = sonucBirlestir(sonuc, await bantKaydir());
    }
    // Saatler: her (çekiçsiz) hamlede bir azalır
    let saatDoldu = false;
    let enAzSaat = null;
    if (seviye.hedef.saat && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      for (const q of parcalar.current.values())
        if (q.saat) {
          q.saat -= 1;
          enAzSaat = enAzSaat == null ? q.saat : Math.min(enAzSaat, q.saat);
          if (q.saat <= 0) saatDoldu = true;
        }
      if (enAzSaat != null) {
        cal(saatDoldu ? 'saat_alarm' : 'saat_tik', saatDoldu ? 1 : 0.6);
        yenile();
      }
    }
    const p = Object.entries(sonuc.patlayan).map(([tur, n]) => `${n} ${MEYVELER[tur].isim}`);
    const o = sonuc.olusanlar.map((x) => (x.ozel === 'gokkusagi' ? 'Gökkuşağı oluştu' : `${MEYVELER[x.tur].isim} ${OZEL_AD[x.ozel]} oluştu`));
    duyur(
      [p.length ? p.join(', ') + ' patladı' : '', sonuc.buz ? `${sonuc.buz} buz kırıldı` : '', sonuc.kasa ? `${sonuc.kasa} kasa kırıldı` : '', sonuc.fici ? `${sonuc.fici} fıçı kırıldı` : '', sonuc.sarmasik ? `${sonuc.sarmasik} sarmaşık kesildi` : '', sonuc.sis ? `${sonuc.sis} sis dağıldı` : '', ...EK_HEDEF.map((e) => (sonuc[e.k] ? e.olay(sonuc[e.k]) : '')), sonuc.kar ? `${sonuc.kar} kat kar eridi` : '', sonuc.tohum ? (sonuc.tohum > 1 ? `${sonuc.tohum} tohum çiçek açtı` : 'Tohum çiçek açtı') : '', ...o, sonuc.zincir >= 2 ? `${sonuc.zincir} zincir` : '', seviye.hedef.mantar && !cekicle && toplananRef.current.mantarKalan > 0 && (mantarSayac.current + 1) % M.MANTAR_ARALIK ? `Mantarlar ${M.MANTAR_ARALIK - ((mantarSayac.current + 1) % M.MANTAR_ARALIK)} hamle sonra çoğalacak` : '', saatDoldu ? 'Saat doldu!' : enAzSaat != null && enAzSaat <= 3 ? `Dikkat, saatli meyvede ${enAzSaat} hamle kaldı` : '', kalanMetni(seviye, toplananRef.current, puanRef.current), `${hamleRef.current} hamle`]
        .filter(Boolean)
        .join('. ')
    );
    if (hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      await senlik();
      return;
    }
    if (saatDoldu) {
      // Süresi dolan saatli meyve: seviye kaybedilir (+5 hamle teklifi yok)
      titret('hata');
      sars(6);
      kayipNeden.current = 'Saat doldu';
      await bekle(700);
      sonucuGoster(false);
      return;
    }
    // Bu hamlede hiç sarmaşık kesilmediyse sarmaşık yanındaki bir meyveye yayılır
    if (seviye.hedef.sarmasik && !sonuc.sarmasik && !cekicle) {
      const y = M.sarmasikYay(turIzgarasi(), ozIzgarasi(), engelIzgarasi());
      if (y) {
        const p = parcaAt(y.hucre[0], y.hucre[1]);
        p.sarmasik = true;
        efektEkle({ tip: 'kirilma', tur: 'yaprak', r: y.hucre[0], c: y.hucre[1], az: true });
        cal('sarmasik_yay');
        titret('hafif');
        await oynat(
          Animated.sequence([
            Animated.timing(p.olcek, { toValue: 0.85, duration: 120, useNativeDriver: true }),
            Animated.spring(p.olcek, { toValue: 1, speed: 16, bounciness: 10, useNativeDriver: true }),
          ])
        );
        sarmasikGuncelle();
        yenile();
        duyur(`Sarmaşık yayıldı, ${y.hucre[0] + 1}. satır ${y.hucre[1] + 1}. sütun`);
      }
    }
    // Mantar: her 3 çekiçsiz hamlede bir yayılır
    if (seviye.hedef.mantar && !cekicle) {
      mantarSayac.current += 1;
      if (mantarSayac.current % M.MANTAR_ARALIK === 0) {
        const y = M.sarmasikYay(turIzgarasi(), ozIzgarasi(), engelIzgarasi(), Math.random, 'mantar');
        if (y) {
          const p = parcaAt(y.hucre[0], y.hucre[1]);
          p.mantar = true;
          efektEkle({ tip: 'kirilma', tur: 'mantar', r: y.hucre[0], c: y.hucre[1], az: true });
          cal('mantar');
          titret('hafif');
          await oynat(
            Animated.sequence([
              Animated.timing(p.olcek, { toValue: 0.85, duration: 120, useNativeDriver: true }),
              Animated.spring(p.olcek, { toValue: 1, speed: 16, bounciness: 10, useNativeDriver: true }),
            ])
          );
          sarmasikGuncelle();
          yenile();
          duyur(`Mantar çoğaldı, ${y.hucre[0] + 1}. satır ${y.hucre[1] + 1}. sütun`);
        }
      }
    }
    if (sonuc.zincir >= 2) cal(OVGU_SES[Math.min(OVGU_SES.length - 1, sonuc.zincir)]);
    if (hamleRef.current <= 0) {
      await bekle(300);
      if (!ekHamleRef.current) teklifGoster();
      else sonucuGoster(false);
      return;
    }
    if (!M.hamleBul(turIzgarasi(), ozIzgarasi(), kilitIzgarasi())) await karistir();
    mesgul.current = false;
    yenile();
    ipucuKur();
  };

  const hamleYap = async (a, b) => {
    if (mesgul.current || bittiRef.current) return;
    if (gucModuRef.current) return; // çekiç seçiliyken kaydırma takas yapmaz
    if (a[0] < 0 || a[1] < 0 || b[0] < 0 || b[1] < 0 || a[0] >= M.SATIR || b[0] >= M.SATIR || a[1] >= M.SUTUN || b[1] >= M.SUTUN) return;
    const pa = parcaAt(a[0], a[1]);
    const pb = parcaAt(b[0], b[1]);
    if (kilitli(pa) || kilitli(pb)) {
      // Buzlu meyve ve kasa yer değiştiremez
      mesgul.current = true;
      seciliAyarla(null);
      cal('gecersiz');
      titret('hata');
      const k = kilitli(pa) ? pa : pb;
      duyur(k.tur === M.DELIK ? 'Orası boş, meyve gidemez' : k.tur === M.KASA ? 'Kasa yer değiştiremez' : M.ficiMi(k.tur) ? 'Fıçı yer değiştiremez' : k.sarmasik ? 'Sarmaşıklı meyve yer değiştiremez' : k.sis ? 'Sisli kare yer değiştiremez' : k.mantar ? 'Mantarlı meyve yer değiştiremez' : 'Buzlu meyve yer değiştiremez');
      await oynat(salla(k));
      mesgul.current = false;
      ipucuKur();
      return;
    }
    mesgul.current = true;
    ipucuDurdur();
    seciliAyarla(null);
    const bir = M.birlesim(turIzgarasi(), ozIzgarasi(), a, b);
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
    if (gucModuRef.current === 'cekic') {
      cekicVur(h);
      return;
    }
    const s = seciliRef.current;
    const p = parcaAt(h[0], h[1]);
    if (!p || p.tur === M.DELIK) {
      duyur('Boş kare');
      return;
    }
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

  if (typeof globalThis !== 'undefined' && globalThis.__denemeTahta) globalThis.__denemeOyun = { hamleYap, hucreDokun, gucBas, hamleAyarla: (n) => { hamleRef.current = n; setHamle(n); }, durum: () => ({ puan: puanRef.current, hamle: hamleRef.current, toplanan: toplananRef.current, t: turIzgarasi(), oz: ozIzgarasi(), engel: engelIzgarasi(), mesgul: mesgul.current, zemin: zemin.current }) };

  // ---------- çizim ----------
  if (!izgara.current) return <View style={st.kok} />;
  const liste = Array.from(parcalar.current.values()).filter((p) => p.tur !== M.DELIK);
  const N = M.SUTUN;

  return (
    <View style={[st.kok, { paddingTop: ek.top + 4, paddingBottom: ek.bottom + 8, justifyContent: 'flex-start' }]}>
      <Sahne bolum={bolumNo(seviye.no)} EG={EG} EY={EY} />

      <View style={yst.ustSatir}>
        <Pressable accessibilityRole="button" accessibilityLabel="Seviyelere dön" onPress={geri} hitSlop={10} style={({ pressed }) => [yst.geri, pressed && { opacity: 0.6 }]}>
          <Text style={yst.geriYazi}>‹ Seviyeler</Text>
        </Pressable>
        <Text style={[yst.seviyeBaslik, geceMi(bolumNo(seviye.no)) && yst.geceYazi]} accessibilityRole="header">
          Seviye {seviye.no}
        </Text>
        <View style={{ width: 96 }} />
      </View>

      <View style={st.ust}>
        <HedefKutusu seviye={seviye} toplanan={toplanan} puan={puan} />
        <Kutu baslik="Hamle" deger={hamle} etiket={`${hamle} hamle kaldı`} vurgu={hamle <= 5 && asama === 'oyun'} buyuk />
        <Kutu baslik="Puan" deger={puan} etiket={`Puan ${puan}`} />
      </View>

      <Animated.View style={[yst.cerceve, { width: TAHTA + 18, height: TAHTA + 18, transform: [{ translateX: sarsinti }] }]}>
        <View style={yst.cerceveIc}>
        <View style={{ width: TAHTA, height: TAHTA, overflow: 'hidden', borderRadius: 12, backgroundColor: 'rgba(255,236,200,0.28)' }} {...(vo ? {} : pan.panHandlers)}>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {izgara.current.map((satir, r) =>
              satir.map((id, c) => (parcalar.current.get(id) || {}).tur === M.DELIK ? (
                // Delik: tahta orada yok; çerçevenin ahşabı görünür (komşu delikler birleşip tahtaya şekil verir)
                <View key={`z${r}-${c}`} style={{ position: 'absolute', left: c * H - 0.5, top: r * H - 0.5, width: H + 1, height: H + 1, backgroundColor: '#c88442' }}>
                  <View style={{ position: 'absolute', left: 0, right: 0, top: H * 0.33, height: 1.5, backgroundColor: 'rgba(140,80,30,0.35)' }} />
                  <View style={{ position: 'absolute', left: 0, right: 0, top: H * 0.7, height: 1.5, backgroundColor: 'rgba(140,80,30,0.3)' }} />
                </View>
              ) : (
                <View
                  key={`z${r}-${c}`}
                  style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: H - 3, height: H - 3, borderRadius: H * 0.22, backgroundColor: (r + c) % 2 ? 'rgba(255,246,226,0.7)' : 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)' }}
                />
              ))
            )}
          </View>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {(seviye.bant || []).map(({ satir: r, yon }) => (
              <BantSerit key={`b${r}`} r={r} yon={yon} H={H} />
            ))}
            {zemin.current.map((satir, r) => satir.map((k, c) => (k > 0 ? (M.cicekMi(k) ? <CicekZemin key={`k${r}-${c}`} H={H} tur={k - M.CICEK} r={r} c={c} /> : <KarZemin key={`k${r}-${c}`} H={H} kat={k} r={r} c={c} />) : null)))}
          </View>
          {secili && <SeciliHalka r={secili[0]} c={secili[1]} H={H} />}
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {liste.map((p) => (
              <Parca key={p.id} p={p} H={H} />
            ))}
          </View>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {(seviye.kapilar || []).map((k, i) => (
              <KapiIsareti key={`kp${i}`} k={k} i={i} H={H} />
            ))}
            {zemin.current.map((satir, r) => satir.map((k, c) => (k > 0 ? (M.cicekMi(k) ? <CicekUst key={`u${r}-${c}`} H={H} tur={k - M.CICEK} r={r} c={c} /> : <KarUst key={`u${r}-${c}`} H={H} kat={k} r={r} c={c} />) : null)))}
          </View>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {efektler.map((e) => {
              if (e.tip === 'patlama') return <Patlama key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'puan') return <PuanYazisi key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'isin') return <Isin key={e.id} e={e} H={H} N={N} bitti={efektKaldir} />;
              if (e.tip === 'dalga') return <Dalga key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'gokkusagi') return <GokkusagiIsinlari key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'donusum') return <Donusum key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'kirilma') return <Kirilma key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'ari') return <AriEfekt key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'cicek') return <CicekAcma key={e.id} e={e} H={H} bitti={efektKaldir} />;
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
                    accessibilityLabel={`${karliAd(zemin.current[r][c], parcaAdi(p))}${sec ? ' seçili' : ''}, ${r + 1}. satır ${c + 1}. sütun${bantYazi(r, c)}`}
                    onPress={() => hucreDokun([r, c])}
                    style={{ position: 'absolute', left: c * H, top: r * H, width: H, height: H }}
                  />
                );
              })
            )}
        </View>
        </View>
        <CerceveSusu />
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[TAM, { borderRadius: 22, backgroundColor: '#ffffff', opacity: flas }]}
        />
        {ovgu && <Ovgu key={ovgu.id} metin={ovgu.metin} bitti={() => setOvgu((o) => (o && o.id === ovgu.id ? null : o))} />}
      </Animated.View>

      {/* Güçlendiriciler ve ipucu */}
      <View style={yst.gucSatir}>
        <GucDugmesi gece={geceMi(bolumNo(seviye.no))} ad="ipucu" simge="💡" yazi="İpucu" etiket="İpucu, uygun bir hamle gösterir" onPress={() => gucBas('ipucu')} />
        {seviye.no >= GUC_SEVIYE && (
          <>
            <GucDugmesi gece={geceMi(bolumNo(seviye.no))} ad="cekic" simge="🔨" yazi="Çekiç" sayi={guc.cekic || 0} secili={gucModu === 'cekic'} etiket={`Çekiç, ${guc.cekic || 0} tane. Tek bir meyveyi, buzu ya da kasayı kırar`} onPress={() => gucBas('cekic')} />
            <GucDugmesi gece={geceMi(bolumNo(seviye.no))} ad="karistir" simge="🔄" yazi="Karıştır" sayi={guc.karistir || 0} etiket={`Karıştır, ${guc.karistir || 0} tane. Meyveleri karıştırır`} onPress={() => gucBas('karistir')} />
            <GucDugmesi gece={geceMi(bolumNo(seviye.no))} ad="hamle3" simgeYazi="+3" yazi="Hamle" sayi={guc.hamle3 || 0} etiket={`Artı 3 hamle, ${guc.hamle3 || 0} tane`} onPress={() => gucBas('hamle3')} />
          </>
        )}
      </View>
      <View style={{ height: 22, justifyContent: 'center' }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text style={[yst.cekicYazi, !gucModu && { opacity: 0 }]}>Kırmak istediğin parçaya dokun</Text>
      </View>

      {/* Bot (otomatik oyun) düğmesi: tahtanın altında (sağ üst köşede Expo Go'nun dişli düğmesi duruyor) */}
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Otomatik oyun"
        accessibilityState={{ checked: !!bot }}
        onPress={() => botDegistir && botDegistir(!bot)}
        hitSlop={10}
        style={({ pressed }) => [yst.geri, yst.bot, bot && yst.botAcik, { marginTop: 2, paddingVertical: 5 }, pressed && { opacity: 0.6 }]}
      >
        <Text style={[yst.geriYazi, bot && { color: '#ffffff' }]}>{bot ? 'Bot: Açık' : 'Bot: Kapalı'}</Text>
      </Pressable>

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
            <Pressable accessibilityRole="button" accessibilityLabel="Başla" onPress={() => {
                cal('dugme');
                basla();
              }} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Başla</Text>
            </Pressable>
          </GirisKart>
        </View>
      )}

      {asama === 'teklif' && (
        <View style={st.perde} accessibilityViewIsModal>
          <GirisKart>
            <Text style={st.kartBaslik} accessibilityRole="header">
              Hamleler bitti
            </Text>
            <Text style={[st.kartAlt, { marginTop: 10, textAlign: 'center' }]}>{kalanMetni(seviye, toplanan, puan)}</Text>
            <Text style={[yst.kartHedef, { marginTop: 16 }]}>Biraz kaldı! {EK_HAMLE} hamle daha?</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Artı ${EK_HAMLE} hamle, ücretsiz`} onPress={ekHamleAl} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, { backgroundColor: '#2fae4f', borderBottomColor: '#1f8a3a' }, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Text style={[st.dugmeYazi, { fontSize: 22 }]}>+{EK_HAMLE} Hamle</Text>
              <Text style={[st.dugmeYazi, { fontSize: 13, textAlign: 'center', opacity: 0.9 }]}>Ücretsiz</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Vazgeç" onPress={() => {
                cal('dugme_geri');
                teklifiReddet();
              }} style={({ pressed }) => [yst.ikinciDugme, { marginTop: 14 }, pressed && { opacity: 0.7 }]}>
              <Text style={yst.ikinciYazi}>Vazgeç</Text>
            </Pressable>
          </GirisKart>
        </View>
      )}

      {asama === 'sonuc' && sonuc && (
        <View style={st.perde} accessibilityViewIsModal>
          <GirisKart>
            <Text style={st.kartBaslik} accessibilityRole="header">
              {sonuc.basarili ? `Seviye ${seviye.no} tamam!` : sonuc.neden || 'Hamleler bitti'}
            </Text>
            {sonuc.basarili ? (
              <SonucYildizlari sayi={sonuc.yildiz} />
            ) : (
              <Text style={[st.kartAlt, { marginTop: 10, textAlign: 'center' }]}>{kalanMetni(seviye, toplanan, puan)}</Text>
            )}
            <Text style={st.kartPuan}>{sonuc.puan}</Text>
            {sonuc.rekor && <Text style={st.kartAlt}>Yeni rekor!</Text>}
            {sonuc.bolumOdulu && (
              <View style={yst.tanitim}>
                <Text style={yst.tanitimBaslik}>Bölüm tamamlandı!</Text>
                <Text style={yst.tanitimMetin}>Ödül: 🔨 1   🔄 1   +3 hamle 1</Text>
              </View>
            )}
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

// Tahta çerçevesinin süsleri: üstte parlak şerit, köşelerde yaprak ve çiçek (yalnızca görsel)
function Yaprakcik({ x, y, aci, boy = 1, renk = '#5cb85c' }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 30 * boy,
        height: 16 * boy,
        backgroundColor: renk,
        borderTopLeftRadius: 16 * boy,
        borderBottomRightRadius: 16 * boy,
        borderTopRightRadius: 2,
        borderBottomLeftRadius: 2,
        transform: [{ rotate: `${aci}deg` }],
      }}
    >
      <View style={{ position: 'absolute', left: 4 * boy, right: 4 * boy, top: 7.5 * boy, height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' }} />
    </View>
  );
}
function Cicekcik({ x, y, renk }) {
  return (
    <View style={{ position: 'absolute', left: x, top: y, width: 26, height: 26 }}>
      {[0, 72, 144, 216, 288].map((a) => {
        const r = ((a - 90) * Math.PI) / 180;
        return <View key={a} style={{ position: 'absolute', left: 13 + Math.cos(r) * 6.5 - 6.5, top: 13 + Math.sin(r) * 6.5 - 6.5, width: 13, height: 13, borderRadius: 6.5, backgroundColor: renk, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }} />;
      })}
      <View style={{ position: 'absolute', left: 8.5, top: 8.5, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#ffcf33' }} />
    </View>
  );
}
function CerceveSusu() {
  return (
    <View style={[TAM, { overflow: 'visible' }]} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={{ position: 'absolute', left: 16, right: 16, top: 1.5, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)' }} />
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 1.5, height: 2, borderRadius: 2, backgroundColor: 'rgba(60,30,0,0.25)' }} />
      {/* sol üst köşe */}
      <Yaprakcik x={-14} y={-6} aci={-25} />
      <Yaprakcik x={4} y={-16} aci={-70} boy={0.85} renk="#4aa847" />
      <Cicekcik x={-9} y={-11} renk="#ff9cc6" />
      {/* sağ üst köşe */}
      <View style={{ position: 'absolute', right: 0, top: 0, width: 1, height: 1 }}>
        <Yaprakcik x={-16} y={-6} aci={205} />
        <Yaprakcik x={-32} y={-16} aci={250} boy={0.85} renk="#4aa847" />
        <Cicekcik x={-17} y={-11} renk="#ffffff" />
      </View>
    </View>
  );
}

// Güçlendirici / ipucu düğmesi: yuvarlak, altında adı, köşesinde kaç tane kaldığı
function GucDugmesi({ simge, simgeYazi, yazi, sayi, secili, etiket, onPress, gece }) {
  const bos = sayi === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ selected: !!secili, disabled: bos }}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [{ alignItems: 'center', marginHorizontal: 7 }, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <View style={[yst.gucDaire, secili && yst.gucSecili, bos && { opacity: 0.5 }]}>
        {simgeYazi ? <Text style={yst.gucSimgeYazi}>{simgeYazi}</Text> : <Text style={yst.gucSimge}>{simge}</Text>}
        {sayi != null && (
          <View style={[yst.gucRozet, bos && { backgroundColor: '#9aa9b6' }]}>
            <Text style={yst.gucRozetYazi}>{sayi}</Text>
          </View>
        )}
      </View>
      <Text style={[yst.gucAd, gece && yst.geceYazi]}>{yazi}</Text>
    </Pressable>
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
  const kalan = (n, k) => Math.max(0, n - (toplanan[k] || 0));
  return (
    <View style={[st.kutu, yst.hedefKutu]} accessible accessibilityLabel={etiket}>
      <Text style={st.kutuBaslik}>Hedef</Text>
      <View style={{ flexDirection: 'row', marginTop: 2 }}>
        {h.buz ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <BuzIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.buz, 'buz') && { color: '#2f9e2a' }]}>{kalan(h.buz, 'buz') || '✓'}</Text>
          </View>
        ) : null}
        {h.kasa ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <KasaIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.kasa, 'kasa') && { color: '#2f9e2a' }]}>{kalan(h.kasa, 'kasa') || '✓'}</Text>
          </View>
        ) : null}
        {h.fici ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <FiciIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.fici, 'fici') && { color: '#2f9e2a' }]}>{kalan(h.fici, 'fici') || '✓'}</Text>
          </View>
        ) : null}
        {h.kar ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <KarIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.kar, 'kar') && { color: '#2f9e2a' }]}>{kalan(h.kar, 'kar') || '✓'}</Text>
          </View>
        ) : null}
        {h.sarmasik ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <SarmasikIkon boy={24} />
            {(() => {
              const k = toplanan.sarmasikKalan == null ? h.sarmasik : toplanan.sarmasikKalan;
              return <Text style={[yst.hedefSayi, !k && { color: '#2f9e2a' }]}>{k || '✓'}</Text>;
            })()}
          </View>
        ) : null}
        {EK_HEDEF.filter((e) => h[e.k]).map((e) => {
          const k = e.kalanAnahtar ? (toplanan[e.k + 'Kalan'] == null ? h[e.k] : toplanan[e.k + 'Kalan']) : kalan(h[e.k], e.k);
          return (
            <View key={e.k} style={{ alignItems: 'center', marginHorizontal: 3 }}>
              <e.Ikon boy={24} />
              <Text style={[yst.hedefSayi, !k && { color: '#2f9e2a' }]}>{k || '✓'}</Text>
            </View>
          );
        })}
        {h.sis ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <SisIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.sis, 'sis') && { color: '#2f9e2a' }]}>{kalan(h.sis, 'sis') || '✓'}</Text>
          </View>
        ) : null}
        {h.tohum ? (
          <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
            <TohumIkon boy={24} />
            <Text style={[yst.hedefSayi, !kalan(h.tohum, 'tohum') && { color: '#2f9e2a' }]}>{kalan(h.tohum, 'tohum') || '✓'}</Text>
          </View>
        ) : null}
        {Object.entries(h.topla || {}).map(([tur, n]) => {
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
      {h.buz ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <BuzIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.buz}</Text>
        </View>
      ) : null}
      {h.kasa ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <KasaIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.kasa}</Text>
        </View>
      ) : null}
      {h.fici ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <FiciIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.fici}</Text>
        </View>
      ) : null}
      {h.kar ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <KarIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.kar}</Text>
        </View>
      ) : null}
      {EK_HEDEF.filter((e) => h[e.k]).map((e) => (
        <View key={e.k} style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <e.Ikon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h[e.k]}</Text>
        </View>
      ))}
      {h.sis ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <SisIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.sis}</Text>
        </View>
      ) : null}
      {h.sarmasik ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <SarmasikIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.sarmasik}</Text>
        </View>
      ) : null}
      {h.tohum ? (
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <TohumIkon boy={52} />
          <Text style={[yst.hedefSayi, { fontSize: 20 }]}>{h.tohum}</Text>
        </View>
      ) : null}
      {Object.entries(h.topla || {}).map(([tur, n]) => (
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
  // Ahşap tahta çerçevesi: koyu dış kenar + açık iç kenar; kareler yarı saydam, arkadaki bahçe hafifçe görünür
  cerceve: {
    padding: 5,
    borderRadius: 22,
    backgroundColor: '#c27a3a',
    borderWidth: 1.5,
    borderColor: '#9c5a24',
    shadowColor: '#3b2a10',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  cerceveIc: { flex: 1, padding: 2.5, borderRadius: 17, backgroundColor: '#f6d7a0', alignItems: 'center', justifyContent: 'center' },
  gucSatir: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  gucDaire: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#ffcf3a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3a6a8a',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  gucSecili: { borderColor: '#ff7a3d', backgroundColor: '#fff1c4', transform: [{ scale: 1.12 }] },
  gucSimge: { fontSize: 26 },
  gucSimgeYazi: { fontSize: 21, fontWeight: '900', color: '#2fae4f' },
  gucRozet: { position: 'absolute', right: -7, bottom: -5, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#ff7a3d', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#ffffff' },
  gucRozetYazi: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  gucAd: { marginTop: 4, fontSize: 12, fontWeight: '800', color: '#24384a', textShadowColor: '#ffffff', textShadowRadius: 4, textShadowOffset: { width: 0, height: 0 } },
  cekicYazi: { fontSize: 14, fontWeight: '900', color: '#c2410c', textShadowColor: '#ffffff', textShadowRadius: 4, textShadowOffset: { width: 0, height: 0 } },
  ustSatir: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 4 },
  geri: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12, minWidth: 96 },
  geriYazi: { fontSize: 15, fontWeight: '800', color: '#2b5876' },
  bot: { alignItems: 'center' },
  botAcik: { backgroundColor: '#2fae4f' },
  seviyeBaslik: { fontSize: 20, fontWeight: '900', color: '#24384a' },
  geceYazi: { color: '#ffffff', textShadowColor: '#1c2559', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
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
