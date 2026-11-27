// Oyun ekranı: bir seviyeyi oynatır. Görenler kaydırarak, VoiceOver kullananlar dokunarak oynar.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as M from './mantik';
import { BoyaIkon, BulutSerit, CanIkon, DevIkon, DevMeyve, FindikIkon, HayaletIkon, IsikHatti, KazanIkon, KristalIkon, KurdeleIkon, KuruZemin, LavIkon, Ray, SagIkon, SalyangozIkon, SolIkon, TeraziCizgi, ToprakIkon, TozIkon, TozZemin, VagonIkon, PompaIkon, KelebekIkon, KapiIkon, MozaikIkon, MiknatisIkon, KayaIkon, KarincaIkon, KomurIkon, KavanozIkon, KayaZemin, MozaikZemin, KarincaYolu, SelaleSerit, AgIkon, OrumcekIkon, NotaIkon, HazineIkon, KostebekIkon, BoruIkon, AgacIkon, FirildakIkon, GunesIkon, AyIkon, NotaZemin, YuvaZemin, GunAyZemin, ZeminRozet, KartIkon, HayvanIkon, RecelIkon, FisekIkon, BalikIkon, LabutIkon, RecelZemin, YankiZemin, PistZemin, OltaSerit, KaranlikKatman } from './gorsel2';

// Bot düğmesi yalnız Expo Go'da görünür; mağaza paketinde (production kanalı) gizli.
const BOT_GORUNUR = (() => { try { return require('expo-updates').channel !== 'production'; } catch (e) { return true; } })();
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
  DominoIkon,
  FenerIkon,
  FenerYanma,
  KurbagaIkon,
  KartopuIkon,
  IstiridyeIkon,
  BalZemin,
  BalUst,
  BalIkon,
  BalonIkon,
  BalonUcus,
  BukalemunIkon,
  KafesIkon,
  KapiIsareti,
  CivcivIkon,
  MantarIkon,
  BantSerit,
  CarkCerceve,
  KumZemin,
  KumUst,
  GomuluSandik,
  SandikIkon,
  UnIkon,
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

const sifat = (n) => M.RENK_SIFAT[n] || '';
const kucukAd = (tur) => (MEYVELER[tur] ? MEYVELER[tur].isim.toLocaleLowerCase('tr') : '');
function yeniAd(p) {
  const e = p.ek || '';
  if (p.tur === M.DEV) {
    const b = M.dvBilgi(e);
    return `Dev ${kucukAd(b.tur)}, ${b.kat} vuruş kaldı`;
  }
  if (p.tur === M.CAN) return 'Çan';
  if (p.tur === M.SALYANGOZ) return 'Salyangoz';
  if (p.tur === M.KAZAN) return `Kazan, ${M.kzDeger(e)} / ${M.KAZAN_DOLU} dolu`;
  if (p.tur === M.VAGON) return 'Vagon';
  if (p.tur === M.BOYA) return `${sifat(M.byTur(e)).replace(/^./, (h) => h.toLocaleUpperCase('tr'))} boya kovası`;
  if (p.tur === M.AYNA_T) return e === 'ayA' ? 'Ayna, sağa yatık' : 'Ayna, sola yatık';
  if (p.tur === M.SINCAP) return 'Sincap';
  if (p.tur === M.FINDIK) return 'Fındık';
  if (p.tur === M.HAYALET) return 'Görünmez hayalet';
  if (p.tur === M.KAVANOZ) return 'Bal kavanozu';
  if (p.tur === M.KAPALI) return 'Kapalı bölüm';
  if (p.tur === M.BASINC) return 'Basınç taşı';
  if (p.tur === M.POMPA) return 'Su pompası';
  if (p.tur === M.TIRTIL) return e === 'tr1' ? 'Koza' : 'Tırtıl';
  if (p.tur === M.MIKNATIS) {
    const b = M.mkBilgi(e);
    return `${sifat(b.tur).replace(/^./, (h) => h.toLocaleUpperCase('tr'))} mıknatıs, ${b.n} / ${M.MIKNATIS_DOLU} dolu`;
  }
  if (p.tur === M.KARINCA) return 'Karınca';
  if (p.tur === M.KOMUR) return p.kat >= 2 ? 'Kömür, 2 kat' : 'Çatlak kömür';
  if (p.tur === M.PARATONER) return M.ptDeger(e) ? `Paratoner, ${M.ptDeger(e)} dolu` : 'Paratoner, boş';
  if (p.tur === M.AYI) return 'Uykucu ayı';
  if (p.tur === M.ORUMCEK) return 'Örümcek';
  if (p.tur === M.KART) {
    const k = M.kartBilgi(e);
    return k.acik ? `Açık kart, ${M.KART_RESIM[k.resim]}` : 'Kapalı kart';
  }
  if (p.tur === M.HAYVAN) {
    const b = M.cfBilgi(e);
    return `${M.HAYVAN_AD[b.tur].replace(/^./, (h) => h.toLocaleUpperCase('tr'))}, ${kucukAd(b.tur)} seviyor, doymasına ${M.HAYVAN_DOY - b.n} kaldı`;
  }
  if (p.tur === M.FISEK) return 'Havai fişek';
  if (p.tur === M.LABUT) return 'Labut';
  if (p.tur === M.TOP) return 'Bowling topu';
  if (p.tur === M.EJDERHA) return 'Ejderha yavrusu';
  if (p.tur === M.BORU) return e === 'bry' ? 'Yatay boru' : 'Dikey boru';
  if (p.tur === M.FIDAN) {
    const n = Number(e.slice(2)) || 0;
    return n >= 3 ? 'Ağaç' : `${['Filiz', 'Fidan', 'Büyük fidan'][n]}, ağaç olmasına ${3 - n} eşleşme kaldı`;
  }
  if (p.tur === M.FIRILDAK) return `Fırıldak, ${M.FR_AD[Number(e.slice(2)) || 0]} bakıyor`;
  return null;
}
function ekOn(p, ad) {
  const e = p.ek || '';
  const k = ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (M.krMi(e)) return `${sifat(Number(e.slice(2))).replace(/^./, (h) => h.toLocaleUpperCase('tr'))} kristalli ${k}`;
  if (M.kdMi(e)) return `Kurdeleli ${k}`;
  if (e === 'lav') return `Lavlı ${k}`;
  if (e === 'tas') return `Taşlaşmış ${k}`;
  if (e === 'hy1') return `Hayalet ${k}`;
  if (e === 'su') return `Su altında ${k}`;
  if (e === 'ag') return `Ağlı ${k}`;
  if (e === 'blk') return `Balık, ${k}`;
  if (e === 'ab') return `Ateşböcekli ${k}`;
  if (e === 'kos') return `Köstebek çıktı, ${k}`;
  return ad;
}
export function parcaAdi(p) {
  if (p && M.yeniTurMi(p.tur)) return yeniAd(p);
  if (p && p.ek && MEYVELER[p.tur]) return ekOn(p, eskiParcaAdi(p));
  return eskiParcaAdi(p);
}
function eskiParcaAdi(p) {
  if (!p || p.tur === M.DELIK) return 'Boş';
  if (p.tur === M.KASA) return p.kat >= 2 ? 'İki katlı kasa' : 'Kasa';
  if (M.ficiMi(p.tur)) return (p.tur === M.FICI_ODUL ? 'Ödüllü fıçı' : 'Fıçı') + ', ' + p.kat + ' kat';
  if (p.tur === M.TOHUM) return 'Tohum';
  if (p.tur === M.CIVCIV) return 'Civciv';
  if (p.tur === M.ANAHTAR) return 'Anahtar';
  if (p.tur === M.BALON) return 'Balon';
  if (p.tur === M.FENER) return 'Sönük fener';
  if (p.tur === M.KOVAN) return 'Arı kovanı';
  if (p.tur === M.DOMINO) return p.dom === 'domd' ? 'Dikey domino' : 'Yatay domino';
  if (p.tur === M.KARTOPU) return ['Küçük', 'Orta', 'Büyük'][Math.min(3, p.kt || 1) - 1] + ' kartopu';
  if (p.tur === M.ISTIRIDYE) return p.ist ? 'Açık istiridye' : 'Kapalı istiridye';
  if (p.tur === M.KURBAGA) return `Kurbağa, ${p.kurb || 0} meyve yedi, doymasına ${M.KURBAGA_DOY - (p.kurb || 0)} kaldı`;
  if (p.kafes) return 'Kafesli ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.tur === M.YUMURTA) return p.kat >= 2 ? 'Yumurta, 2 kat' : 'Çatlak yumurta';
  if (p.sis) return 'Sisli';
  if (p.buz) return 'Buzlu ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.sarmasik) return 'Sarmaşıklı ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.mantar) return 'Mantarlı ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr');
  if (p.ozel === 'gokkusagi' || !MEYVELER[p.tur]) return 'Gökkuşağı';
  return (p.buk ? 'Bukalemun ' + MEYVELER[p.tur].isim.toLocaleLowerCase('tr') : MEYVELER[p.tur].isim) + (p.ozel ? ' ' + OZEL_AD[p.ozel] : '') + (p.saat ? `, saatli, ${p.saat} hamle` : '');
}

// Yeni kuralların duyuruları
function ekOlayMetni(o) {
  if (o.tip === 'hayalet') return 'Hayaletler yer değiştirdi';
  if (o.tip === 'lavYay') return `Lav yayıldı, ${o.hucre[0] + 1}. satır ${o.hucre[1] + 1}. sütun`;
  if (o.tip === 'sincap') return `Sincap bir meyveyi fındığa çevirdi, ${o.hucre[0] + 1}. satır ${o.hucre[1] + 1}. sütun`;
  if (o.tip === 'vagon') return 'Tren ilerledi';
  if (o.tip === 'vagonVardi') return 'Vagon istasyona vardı!';
  if (o.tip === 'panayir') return o.sonuc === 'ozel' ? 'Panayır çarkı döndü: iki meyve özel meyve oldu!' : o.sonuc === 'buz' ? 'Panayır çarkı döndü: iki meyve buzlandı' : 'Panayır çarkı döndü: 300 puan!';
  if (o.tip === 'yildiz') return `Kuyruklu yıldız ${o.c + 1}. sütuna düştü`;
  if (o.tip === 'isik') return `Işık ${o.n} buzu eritti`;
  if (o.tip === 'suYukseldi') return 'Su bir kare yükseldi';
  if (o.tip === 'suBekle') return `Su ${o.satir + 1}. satırda, ${o.kalan} hamle sonra yükselecek`;
  if (o.tip === 'suBasti') return 'Su tahtayı bastı!';
  if (o.tip === 'tirtil') return 'Tırtıl bir kare indi';
  if (o.tip === 'yaprakYendi') return 'Tırtıl yaprağı yedi, bir hamle gitti';
  if (o.tip === 'miknatis') return `Mıknatıs bir meyve yuttu, ${o.n} / ${M.MIKNATIS_DOLU} dolu`;
  if (o.tip === 'miknatisPatladi') return 'Mıknatıs doldu ve patladı!';
  if (o.tip === 'cekim') return 'Mıknatıs bir meyveyi çekti';
  if (o.tip === 'karinca') return 'Karıncalar ilerledi';
  if (o.tip === 'karincaVardi') return 'Karınca yuvaya vardı!';
  if (o.tip === 'simsek') return `Şimşek çaktı, ${o.hucre[0] + 1}. satır ${o.hucre[1] + 1}. sütundaki meyve kömür oldu`;
  if (o.tip === 'simsekParatoner') return `Şimşek paratonere düştü, ${o.c + 1}. sütun temizlendi`;
  if (o.tip === 'ag') return `Örümcek ağ ördü, ${o.hucre[0] + 1}. satır ${o.hucre[1] + 1}. sütun`;
  if (o.tip === 'kostebek') return `Köstebek çıktı: ${o.hucre[0] + 1}. satır ${o.hucre[1] + 1}. sütun`;
  if (o.tip === 'agac') return 'Ağaç bir özel meyve döktü';
  if (o.tip === 'firildak') return `Fırıldak döndü, artık ${M.FR_AD[o.yon] || ''} bakıyor`;
  if (o.tip === 'gunduz') return o.gunduz ? 'Gündüz oldu, güneş çiçekleri açtı' : 'Gece oldu, ay çiçekleri açtı';
  if (o.tip === 'hazineIpucu') return `Hazine: ${o.soz}`;
  if (o.tip === 'kartCift') return `İki ${M.KART_RESIM[o.resim]} kartı eşleşti!`;
  if (o.tip === 'kartKapandi') return `${M.KART_RESIM[o.resim].replace(/^./, (h) => h.toLocaleUpperCase('tr'))} kartı kapandı`;
  if (o.tip === 'yanki') return o.n > 1 ? `${o.n} yankı patladı` : 'Yankı patladı';
  return '';
}

// Taşıyıcı bant satırı (rüzgâr) için hücre etiketine ek
function bantYaziKur(seviye) {
  return (r, c) => {
    const b = (seviye.bant || []).find((x) => x.satir === r);
    let y = b ? `, rüzgâr ${b.yon > 0 ? 'sağa' : 'sola'}` : '';
    if ((seviye.carklar || []).some(([a, d]) => r >= a && r <= a + 1 && c >= d && c <= d + 1)) y += ', değirmen çarkı';
    if ((seviye.bulutlar || []).includes(c) && r === 0) y += ', üstünde yağmur bulutu';
    if (seviye.ray != null && r === seviye.ray) y += ', tren rayı';
    if (seviye.terazi) y += c < 4 ? ', sol kefe' : ', sağ kefe';
    if (M.pistMi(r, c)) y += ', buz pisti';
    if ((seviye.oltalar || []).includes(c) && r === 0) y += ', olta sütunu';
    if (seviye.yol) {
      const i = seviye.yol.findIndex(([a, b]) => a === r && b === c);
      if (i === seviye.yol.length - 1) y += ', karınca yuvası';
      else if (i >= 0) y += ', karınca yolu';
    }
    if (r === 0 && (seviye.selale || []).some(([a]) => a === c)) y += `, şelale: ${MEYVELER[seviye.selale.find(([a]) => a === c)[1]].isim.toLocaleLowerCase('tr')} düşer`;
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
  if (kat === M.BAL) return 'Ballı ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (kat === M.KUM) return 'Kumlu ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (kat === M.KURU) return 'Kuru toprakta ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (kat === M.TOZ) return 'Yıldız tozlu ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (M.notaMi(kat)) return `${kat - M.NOTA + 1}. nota karosunda ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  if (kat === M.HAZINE) return ad;
  if (kat === M.RECEL) return 'Reçelli ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (kat === M.YANKI1 || kat === M.YANKI2) return `${ad}, yankı ${kat === M.YANKI1 ? 1 : 2} hamle sonra patlayacak`;
  if (kat === M.YUVA) return 'Köstebek yuvasında ' + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (kat === M.GUNES) return `Güneş çiçeğinde${M.gunduzMu() ? '' : ', kapalı,'} ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  if (kat === M.AY) return `Ay çiçeğinde${M.gunduzMu() ? ', kapalı,' : ''} ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  if (M.kayaMi(kat)) return (kat === M.KAYA2 ? 'İki kat taşta ' : 'Taşta ') + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
  if (M.mozaikMi(kat)) return `${M.RENK_SIFAT[kat - M.MOZAIK].replace(/^./, (h) => h.toLocaleUpperCase('tr'))} karoda ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  if (M.cicekMi(kat)) return `${MEYVELER[kat - M.CICEK].isim} çiçeğinde ${ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1)}`;
  return (kat >= 2 ? 'İki kat karlı ' : 'Karlı ') + ad.charAt(0).toLocaleLowerCase('tr') + ad.slice(1);
}

// Sipariş (Hasat Pazarı) yardımcıları
const OZEL_SIPARIS = { cizgili: { ad: 'çizgili meyve', simge: '〰️' }, bomba: { ad: 'bomba', simge: '💣' }, gokkusagi: { ad: 'gökkuşağı', simge: '🌈' } };
function siparisAdi(s, n) {
  if (s.ozel) return `${n} ${OZEL_SIPARIS[s.ozel].ad}`;
  return `${n} ${MEYVELER[s.tur].isim.toLocaleLowerCase('tr')}`;
}
function SiparisSimge({ s, boy }) {
  if (s.ozel) return <Text style={{ fontSize: boy * 0.8, lineHeight: boy, width: boy, textAlign: 'center' }}>{OZEL_SIPARIS[s.ozel].simge}</Text>;
  return <Image source={MEYVELER[s.tur].resim} style={{ width: boy, height: boy }} resizeMode="contain" />;
}

// Yeni bölümlerin hedefleri tek tabloda: hedef anlatımı, kalan, olay duyurusu ve simge
// kalanAnahtar: yayılabilen engeller için tahtada kalan sayısı (toplanan[k + 'Kalan'])
const EK_HEDEF = [
  { k: 'dev', hedef: (n) => `${n} dev meyveyi kır (yanında eşleşme yap, ${M.DEV_KAT} vuruşta kırılır)`, ad: 'dev meyve', olay: (n) => (n > 1 ? `${n} dev meyve kırıldı!` : 'Dev meyve kırıldı!'), Ikon: DevIkon },
  { k: 'kurdele', hedef: (n) => `${n} kurdeleli meyveyi patlat (biri patlayınca eşi de patlar)`, ad: 'kurdeleli meyve', olay: (n) => `${n} kurdeleli meyve patladı`, Ikon: KurdeleIkon },
  { k: 'kristal', hedef: (n) => `${n} kristali kır (yalnız kendi rengindeki eşleşme kırar)`, ad: 'kristal', olay: (n) => `${n} kristal kırıldı`, Ikon: KristalIkon },
  { k: 'can', hedef: (n) => `${n} çanı çaldır (yanında eşleşme yap)`, ad: 'çan', olay: (n) => (n > 1 ? `${n} çan çaldı` : 'Çan çaldı'), Ikon: CanIkon },
  { k: 'toprak', kalanAnahtar: true, hedef: () => 'bütün kuru toprağı sula (bulutlu sütunlarda eşleşme yap)', ad: 'kuru toprak', olay: (n) => `Yağmur yağdı, ${n} toprak sulandı`, Ikon: ToprakIkon },
  { k: 'salyangoz', hedef: (n) => `${n} salyangozu sağ kenara ulaştır (yanında eşleşme yap)`, ad: 'salyangoz', olay: (n) => (n > 1 ? `${n} salyangoz bitişe vardı` : 'Salyangoz bitişe vardı!'), Ikon: SalyangozIkon },
  { k: 'kazan', hedef: (n) => `kazanı ${n} kez doldur (yanında eşleşme yap)`, ad: 'kazan dolumu', olay: (n) => 'Kazan doldu, özel meyveler saçtı!', Ikon: KazanIkon },
  { k: 'vagon', hedef: (n) => `${n} vagonu istasyona ulaştır (önündeki engelleri temizle)`, ad: 'vagon', olay: (n) => 'Vagon istasyona vardı!', Ikon: VagonIkon },
  { k: 'lav', kalanAnahtar: true, hedef: () => 'bütün lavı ve taşı temizle', ad: 'lav', olay: (n) => `${n} lav soğudu ya da kırıldı`, Ikon: LavIkon },
  { k: 'hayalet', hedef: (n) => `${n} hayalet meyveyi patlat (yalnız görünürken eşleşir)`, ad: 'hayalet', olay: (n) => `${n} hayalet patladı`, Ikon: HayaletIkon },
  { k: 'boya', hedef: (n) => `${n} boya kovasını patlat (yanında eşleşme yap)`, ad: 'boya kovası', olay: (n) => 'Boya kovası patladı, çevre boyandı!', Ikon: BoyaIkon },
  { k: 'findik', hedef: (n) => `${n} fındığı en alta indir`, ad: 'fındık', olay: (n) => (n > 1 ? `${n} fındık toplandı` : 'Fındık toplandı'), Ikon: FindikIkon },
  { k: 'toz', hedef: (n) => `${n} yıldız tozunu topla`, ad: 'yıldız tozu', olay: (n) => `${n} yıldız tozu toplandı`, Ikon: TozIkon },
  { k: 'sol', hedef: (n) => `sol kefede ${n} meyve patlat`, ad: 'sol kefe', olay: () => '', Ikon: SolIkon },
  { k: 'sag', hedef: (n) => `sağ kefede ${n} meyve patlat`, ad: 'sağ kefe', olay: () => '', Ikon: SagIkon },
  { k: 'sandik', kalanAnahtar: true, hedef: (n) => `kumun altındaki ${n} sandığı bul (kumlu karelerde eşleşme yap)`, ad: 'sandık', olay: (n) => (n > 1 ? `${n} sandık bulundu!` : 'Sandık bulundu!'), Ikon: SandikIkon },
  { k: 'un', hedef: (n) => `${n} çuval un topla (değirmen çarkının üstündeki meyveleri patlat)`, ad: 'çuval un', olay: (n) => `${n} çuval un`, Ikon: UnIkon },
  { k: 'istiridye', hedef: (n) => `${n} istiridyeden inci al (açıkken yanında eşleşme yap)`, ad: 'istiridye', olay: (n) => (n > 1 ? `${n} inci alındı` : 'İnci alındı'), Ikon: IstiridyeIkon },
  { k: 'kartopu', hedef: (n) => `${n} kartopunu en alta yuvarla`, ad: 'kartopu', olay: (n) => (n > 1 ? `${n} kartopu patladı` : 'Kartopu patladı'), Ikon: KartopuIkon },
  { k: 'domino', hedef: (n) => `${n} dominoyu devir`, ad: 'domino', olay: (n) => `${n} domino devrildi`, Ikon: DominoIkon },
  { k: 'fener', hedef: (n) => `${n} feneri özel meyveyle yak`, ad: 'fener', olay: (n) => (n > 1 ? `${n} fener yandı` : 'Fener yandı'), Ikon: FenerIkon },
  { k: 'kurbaga', hedef: (n) => `${n} kurbağayı doyur (her biri ${M.KURBAGA_DOY} meyve yiyince doyar)`, ad: 'kurbağa', olay: (n) => (n > 1 ? `${n} kurbağa doydu` : 'Kurbağa doydu'), Ikon: KurbagaIkon },
  { k: 'bal', kalanAnahtar: true, hedef: () => 'bütün bal lekelerini temizle', ad: 'bal', olay: (n) => `${n} bal temizlendi`, Ikon: BalIkon },
  { k: 'balon', hedef: (n) => `${n} balonu en üste çıkarıp uçur`, ad: 'balon', olay: (n) => (n > 1 ? `${n} balon uçtu` : 'Balon uçtu'), Ikon: BalonIkon },
  { k: 'bukalemun', hedef: (n) => `${n} bukalemun meyveyi patlat`, ad: 'bukalemun', olay: (n) => `${n} bukalemun patladı`, Ikon: BukalemunIkon },
  { k: 'kafes', hedef: (n) => `anahtarı en alta indirip ${n} kafesi aç`, ad: 'kafes', olay: (n) => `Anahtar geldi, ${n} kafes açıldı`, Ikon: KafesIkon },
  { k: 'civciv', hedef: (n) => `${n} yumurtayı kır, civcivleri en alta indir`, ad: 'civciv', olay: (n) => (n > 1 ? `${n} civciv yuvaya uçtu` : 'Civciv yuvaya uçtu'), Ikon: CivcivIkon },
  { k: 'mantar', kalanAnahtar: true, hedef: () => 'bütün mantarları temizle', ad: 'mantar', olay: (n) => `${n} mantar temizlendi`, Ikon: MantarIkon },
  { k: 'saat', hedef: (n) => `${n} saatli meyveyi süresi dolmadan patlat`, ad: 'saatli meyve', olay: (n) => `${n} saatli meyve patladı`, Ikon: SaatIkon },
  { k: 'cicek', hedef: (n) => `${n} çiçeği tozlat`, ad: 'çiçek', olay: (n) => `${n} çiçek tozlandı`, Ikon: CicekIkon },
  { k: 'pompa', hedef: (n) => `pompayı ${n} kez çalıştır (yanında eşleşme yap); su üstten ikinci satıra ulaşmasın`, ad: 'pompa', olay: (n) => 'Pompa çalıştı, su boşaldı', Ikon: PompaIkon },
  { k: 'kelebek', hedef: (n) => `${n} tırtılı kelebeğe çevir (yanında iki kez eşleşme yap)`, ad: 'kelebek', olay: (n) => (n > 1 ? `${n} kelebek uçtu` : 'Kelebek uçtu!'), Ikon: KelebekIkon },
  { k: 'kapi', hedef: (n) => `${n} basınç taşını çökert, kapalı bölümleri aç`, ad: 'basınç taşı', olay: (n) => 'Gizli kapı açıldı!', Ikon: KapiIkon },
  { k: 'mozaik', hedef: (n) => `${n} mozaik karoyu boya (karonun rengindeki meyveyi üstünde ya da yanında eşleştir)`, ad: 'karo', olay: (n) => `${n} karo boyandı`, Ikon: MozaikIkon },
  { k: 'miknatis', hedef: (n) => `${n} mıknatısı doldur (${M.MIKNATIS_DOLU} dolumda patlar)`, ad: 'mıknatıs', olay: (n) => 'Mıknatıs patladı!', Ikon: MiknatisIkon },
  { k: 'kaya', hedef: (n) => `${n} kat taşı aşındır (taşın üstündeki meyveleri patlat)`, ad: 'taş', olay: (n) => `${n} kat taş aşındı`, Ikon: KayaIkon },
  { k: 'karinca', hedef: (n) => `${n} karıncayı yuvaya ulaştır (yollarındaki engelleri temizle)`, ad: 'karınca', olay: (n) => 'Karınca yuvaya vardı!', Ikon: KarincaIkon },
  { k: 'komur', hedef: (n) => `${n} kömürü kır (yanında iki kez eşleşme yap)`, ad: 'kömür', olay: (n) => `${n} kömür kırıldı`, Ikon: KomurIkon },
  { k: 'ag', kalanAnahtar: true, hedef: () => 'bütün örümcek ağlarını yırt (yanında eşleşme yap)', ad: 'ağ', olay: (n) => `${n} ağ yırtıldı`, Ikon: AgIkon },
  { k: 'orumcek', hedef: (n) => `${n} örümceği kaçır (yanında eşleşme yap)`, ad: 'örümcek', olay: (n) => 'Örümcek kaçtı!', Ikon: OrumcekIkon },
  { k: 'nota', hedef: (n) => `${n} notayı sırayla çal (nota karolarında önce 1, sonra 2, 3, 4 numarada meyve patlat)`, ad: 'nota', olay: (n) => (n > 1 ? `${n} nota çaldı` : 'Nota çaldı'), Ikon: NotaIkon },
  { k: 'hazine', hedef: (n) => `${n} gizli hazineyi bul (sıcak dendikçe yaklaşıyorsun)`, ad: 'hazine', olay: (n) => 'Hazine bulundu!', Ikon: HazineIkon },
  { k: 'kostebek', hedef: (n) => `${n} köstebek yakala (çıktığı yerde yanında eşleşme yap)`, ad: 'köstebek', olay: (n) => 'Köstebek yakalandı!', Ikon: KostebekIkon },
  { k: 'boru', hedef: (n) => `${n} boru hattını bağla (bir sıradaki bütün borular yatay olsun)`, ad: 'boru hattı', olay: (n) => 'Su aktı, sıra temizlendi!', Ikon: BoruIkon },
  { k: 'agac', hedef: (n) => `${n} filizi ağaca dönüştür (yanında üç kez eşleşme yap)`, ad: 'ağaç', olay: (n) => 'Filiz ağaç oldu!', Ikon: AgacIkon },
  { k: 'firildak', hedef: (n) => `fırıldağı ${n} kez çalıştır (yanında eşleşme yap)`, ad: 'fırıldak', olay: (n) => 'Fırıldak sırayı temizledi', Ikon: FirildakIkon },
  { k: 'gunes', hedef: (n) => `gündüz ${n} güneş çiçeği topla`, ad: 'güneş çiçeği', olay: (n) => `${n} güneş çiçeği toplandı`, Ikon: GunesIkon },
  { k: 'ay', hedef: (n) => `gece ${n} ay çiçeği topla`, ad: 'ay çiçeği', olay: (n) => `${n} ay çiçeği toplandı`, Ikon: AyIkon },
  { k: 'kart', hedef: (n) => `${n} çift kartı eşleştir (kartın yanında eşleşme yap, açılsın; aynı resimli iki kart açık kalınca toplanır)`, ad: 'kart çifti', olay: (n) => 'Kart çifti toplandı!', Ikon: KartIkon },
  { k: 'hayvan', hedef: (n) => `${n} hayvanı doyur (yanında sevdiği meyveyi iki kez eşleştir)`, ad: 'hayvan', olay: (n) => 'Hayvan doydu!', Ikon: HayvanIkon },
  { k: 'recel', kalanAnahtar: true, hedef: () => 'bütün tahtayı reçelle (reçelli kareye değen eşleşme reçeli yayar)', ad: 'reçelsiz kare', olay: (n) => `${n} kare reçellendi`, Ikon: RecelIkon },
  { k: 'fisek', hedef: (n) => `${n} havai fişeği ateşle (yanında eşleşme yap)`, ad: 'havai fişek', olay: (n) => 'Havai fişek patladı!', Ikon: FisekIkon },
  { k: 'balik', hedef: (n) => `${n} balık tut (balık olta sütunundayken yanında eşleşme yap)`, ad: 'balık', olay: (n) => 'Balık tutuldu!', Ikon: BalikIkon },
  { k: 'labut', hedef: (n) => `${n} labutu devir (topun ya da labutun yanında eşleşme yap)`, ad: 'labut', olay: (n) => `${n} labut devrildi`, Ikon: LabutIkon },
  { k: 'kavanoz', hedef: (n) => `${n} bal kavanozunu en alta, ayıya indir`, ad: 'bal kavanozu', olay: (n) => (n > 1 ? `${n} kavanoz ayıya ulaştı` : 'Kavanoz ayıya ulaştı'), Ikon: KavanozIkon },
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
  if (h.siparis) parca.push(`${h.siparis} müşterinin siparişini sırayla hazırla. İlk sipariş: ${siparisAdi(seviye.siparisler[0], seviye.siparisler[0].n)}`);
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
  if (h.siparis) {
    const yapilan = toplanan.siparis || 0;
    const s = seviye.siparisler[yapilan];
    l.push(s ? `${yapilan + 1}. sipariş: ${siparisAdi(s, Math.max(0, s.n - (toplanan.siparisAdim || 0)))} kaldı` : 'siparişler tamam');
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

export default function Oyun({ seviye, enIyi, sonrakiVar, bitince, geri, sonraki, tekrar, bot = false, botDegistir, guc = {}, gucHarca, bolumOdulVar = false, geriAd = 'Ana ekran', basladi }) {
  let karanlikEngel = null;
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
  const yonSayac = useRef(0);
  const sonHamle = useRef(null); // Ayna Gölü: oyuncunun son takası
  const sonTakas = useRef(null); // Hazine Haritası: son takasın hücreleri
  const ekDuyuru = useRef([]); // hamle içinde biriken ek duyurular (açılan kartlar)
  const [yon, setYon] = useState('asagi');
  const ekSayac = useRef(0); // çekiçsiz hamle sayısı (yeni kurallar: lav, sincap, panayır, kuyruklu yıldız)
  const carkSayac = useRef(0); // çekiçsiz hamle sayısı (çark her 2 hamlede döner)
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
      kafes: engel === 'kafes',
      buk: engel === 'buk',
      dom: engel === 'domy' || engel === 'domd' ? engel : null,
      kt: M.ktMi(engel) ? M.ktDeger(engel) : tur === M.KARTOPU ? 1 : 0,
      ist: engel === 'ist1' ? 1 : 0,
      kurb: M.kurbMi(engel) ? M.kurbDeger(engel) : tur === M.KURBAGA ? 0 : null,
      saat: M.saatMi(engel) ? M.saatDeger(engel) : 0,
      sis: engel === 'sis',
      ek: M.yeniEngelMi(engel) ? engel : null,
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
  // Yeni mekanikler: bir hücreyi hedef duruma getirir (tür/özel/engel); tür -1 ise parça kalkar, parça yoksa yenisi kurulur
  const hucreEsitle = (r, c, tur, ozel, engel) => {
    const p = parcalar.current.get(izgara.current[r][c]);
    if (tur === -1) {
      if (p) {
        parcalar.current.delete(p.id);
        izgara.current[r][c] = null;
      }
      return;
    }
    if (!p) {
      izgara.current[r][c] = yeniParca(tur, r, c, r, ozel, engel).id;
      return;
    }
    const q = yeniParca(tur, r, c, r, ozel, engel);
    parcalar.current.delete(q.id);
    for (const k of ['tur', 'ozel', 'buz', 'sarmasik', 'mantar', 'kafes', 'buk', 'dom', 'kt', 'ist', 'kurb', 'saat', 'sis', 'kat', 'ek']) p[k] = q[k];
  };
  const izgaraYeri = (p) => {
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) if (izgara.current[r][c] === p.id) return [r, c];
    return null;
  };
  const turIzgarasi = () => izgara.current.map((s) => s.map((id) => (id == null ? -1 : parcalar.current.get(id).tur)));
  const ozIzgarasi = () => izgara.current.map((s) => s.map((id) => (id == null ? null : parcalar.current.get(id).ozel || null)));
  const engelIzgarasi = () =>
    izgara.current.map((s) =>
      s.map((id) => {
        const p = id == null ? null : parcalar.current.get(id);
        if (!p) return null;
        if (p.ek) return p.ek;
        if (p.buz) return 'buz';
        if (p.sarmasik) return 'sarmasik';
        if (p.mantar) return 'mantar';
        if (p.kafes) return 'kafes';
        if (p.buk) return 'buk';
        if (p.dom) return p.dom;
        if (p.tur === M.KURBAGA) return 'kurb' + (p.kurb || 0);
        if (p.tur === M.KARTOPU) return 'kt' + (p.kt || 1);
        if (p.tur === M.ISTIRIDYE) return 'ist' + (p.ist ? 1 : 0);
        if (p.saat) return 'saat' + p.saat;
        if (p.sis) return 'sis';
        if (M.kasaMi(p.tur)) return p.kat;
        return null;
      })
    );
  const kilitIzgarasi = () => engelIzgarasi().map((s) => s.map((e) => !M.serbestMi(e)));
  const kilitli = (p) => !p || (M.yeniTurMi(p.tur) && p.tur !== M.FINDIK && p.tur !== M.KAVANOZ) || (p.ek && !M.serbestMi(p.ek)) || p.tur === M.BALON || p.tur === M.ISTIRIDYE || p.tur === M.FENER || p.tur === M.DOMINO || p.buz || p.sarmasik || p.sis || p.mantar || p.kafes || M.kasaMi(p.tur) || p.tur === M.DELIK;
  // Karıştırmada ve şenlikte yerinde kalanlar (tohum takas edilebilir ama meyveye dönüşmez)
  const sabit = (p) => kilitli(p) || M.inenMi(p.tur) || p.tur === M.KURBAGA;

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
    carkSayac.current = 0;
    ekSayac.current = 0;
    yonSayac.current = 0;
    setYon(M.yercekimiYonu());
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
    if (basladi) basladi();
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
    if (!(seviye.hedef.sarmasik || seviye.hedef.mantar || seviye.hedef.bal || seviye.hedef.sandik || seviye.hedef.lav || seviye.hedef.toprak || seviye.hedef.ag || seviye.hedef.recel) || !izgara.current) return;
    toplananRef.current = M.kalanlariYaz({ ...toplananRef.current }, engelIzgarasi(), zemin.current);
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

  // Boşlukları yerçekimiyle doldurur (düşen ve yeni gelen parçalar)
  const dusurDoldur = async () => {
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
      } else dusenler.push([p, k.yeni[0], k.yeni[1], Math.abs(k.yeni[0] - k.eski[0]) + Math.abs(k.yeni[1] - k.eski[1]), 0]);
    }
    if (kapidan) cal('kapi', 0.7);
    const yon = M.yercekimiYonu();
    for (const n of s.yeniler) {
      const p = yeniParca(n.tur, n.yeni[0], n.yeni[1], -n.kacinci);
      yeniIzgara[n.yeni[0]][n.yeni[1]] = p.id;
      // Yeni meyve yerçekiminin tersindeki kenardan girer
      let bas = { x: n.yeni[1], y: -n.kacinci };
      if (yon === 'yukari') bas = { x: n.yeni[1], y: M.SATIR - 1 + n.kacinci };
      else if (yon === 'sol') bas = { x: M.SUTUN - 1 + n.kacinci, y: n.yeni[0] };
      else if (yon === 'sag') bas = { x: -n.kacinci, y: n.yeni[0] };
      p.poz.setValue(bas);
      dusenler.push([p, n.yeni[0], n.yeni[1], Math.abs(n.yeni[0] - bas.y) + Math.abs(n.yeni[1] - bas.x), 40]);
    }
    izgara.current = yeniIzgara;
    yenile();
    await Promise.all(dusenler.map(([p, r, c, m, g]) => dusur(p, r, c, m, g + c * 12)));
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
      const ekA = M.ekAdim(turIzgarasi(), ozIzgarasi(), engelIzgarasi(), zemin.current, adim);
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
        if (ekA.kalan.has(anahtar(r, c))) continue;
        if (p.buz || p.sarmasik || p.sis || p.mantar) buzKirilan.push({ r, c, p });
        else silinen.push({ r, c, p });
      }
      // Kasalar: vurulan kasanın katı azalır, sıfırlanınca kırılıp silinir
      let kasaKirilan = 0;
      let komurKirilan = 0;
      let ficiKirilan = 0;
      let ficiOdul = 0;
      let ficiVurulan = 0;
      let yumurtaVurulan = 0;
      let ariSay = 0;
      const odulOlusan = [];
      for (const [r, c] of adim.kasaVurus) {
        const p = parcaAt(r, c);
        if (!p || !M.kasaMi(p.tur)) continue;
        if (p.tur === M.KOVAN) {
          // Kovan kırılmaz: içinden yardımcı arı çıkar
          ariSay++;
          Animated.sequence([-0.4, 0.4, 0].map((v) => Animated.timing(p.don, { toValue: v, duration: 50, useNativeDriver: true }))).start();
          continue;
        }
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
          else if (p.tur === M.KOMUR) komurKirilan++;
          else kasaKirilan++;
          if (p.tur === M.FICI_ODUL) {
            ficiOdul++;
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
      let balSay = 0;
      let kumSay = 0;
      let tozSay = 0;
      const sandikOnce = M.sandikKalan(zemin.current);
      for (const [r, c] of eriyen) {
        if (zemin.current[r][c] === M.TOZ) {
          zemin.current[r][c] = 0;
          tozSay++;
          efektEkle({ tip: 'kirilma', tur: 'kar', r, c, az: true });
          continue;
        }
        if (zemin.current[r][c] === M.KUM) {
          zemin.current[r][c] = 0;
          kumSay++;
          efektEkle({ tip: 'kirilma', tur: 'bal', r, c, az: true });
          continue;
        }
        if (zemin.current[r][c] === M.BAL) {
          zemin.current[r][c] = 0;
          balSay++;
          efektEkle({ tip: 'kirilma', tur: 'bal', r, c });
          continue;
        }
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
      if (karSay) cal('kar_eri');
      if (cicekSay) cal('cicek');
      if (balSay) cal('bal_temizle');
      const sandikBulunan = sandikOnce - M.sandikKalan(zemin.current);
      if (sandikBulunan) {
        cal('sandik');
        titret('basari');
      } else if (kumSay) cal('kum');
      // Alt sıraya inen tohumlar toplanır: çiçek açar (civcivler yuvaya uçar)
      let civcivSay = 0;
      let anahtarSay = 0;
      let findikSay = 0;
      let kavanozSay = 0;
      let kartopuSay = 0;
      const kartopuAlan = [];
      for (const [r, c] of adim.tohumlar || []) {
        const p = parcaAt(r, c);
        if (!p || !M.inenMi(p.tur)) continue;
        silinen.push({ r, c, p, tohum: true });
        if (p.tur === M.KARTOPU) {
          kartopuSay++;
          kartopuAlan.push(...M.kartopuAlani(r, c, p.kt || 1));
          efektEkle({ tip: 'dalga', r, c, yaricap: 1, renk: '#ffffff' });
          efektEkle({ tip: 'kirilma', tur: 'kar', r, c });
        } else if (p.tur === M.CIVCIV) {
          civcivSay++;
          efektEkle({ tip: 'kirilma', tur: 'civciv', r, c });
        } else if (p.tur === M.ANAHTAR) {
          anahtarSay++;
          efektEkle({ tip: 'donusum', r, c });
        } else if (p.tur === M.FINDIK) {
          findikSay++;
          efektEkle({ tip: 'donusum', r, c });
        } else if (p.tur === M.KAVANOZ) {
          kavanozSay++;
          efektEkle({ tip: 'donusum', r, c });
        } else efektEkle({ tip: 'cicek', r, c });
      }
      // Dominolar devrilir
      let dominoSay = 0;
      for (const [r, c] of adim.dominolar || []) {
        const p = parcaAt(r, c);
        if (!p || p.tur !== M.DOMINO) continue;
        silinen.push({ r, c, p, tohum: true });
        dominoSay++;
        efektEkle({ tip: 'kirilma', tur: 'domino', r, c });
        Animated.timing(p.don, { toValue: p.dom === 'domd' ? 1.2 : -1.2, duration: 160, useNativeDriver: true }).start();
      }
      if (dominoSay) {
        cal('domino');
        titret('orta');
      }
      // Özel parçanın değdiği fenerler yanar ve gider
      let fenerSay = 0;
      for (const [r, c] of adim.fenerler || []) {
        const p = parcaAt(r, c);
        if (!p || p.tur !== M.FENER) continue;
        silinen.push({ r, c, p, tohum: true });
        fenerSay++;
        efektEkle({ tip: 'fener', r, c });
      }
      if (fenerSay) {
        cal('fener_yan');
        titret('basari');
      }
      // Anahtar en alta indi: bütün kafesler açılır
      let kafesAcilan = 0;
      if (anahtarSay)
        for (const q of parcalar.current.values())
          if (q.kafes) {
            q.kafes = false;
            kafesAcilan++;
            const yer = izgaraYeri(q);
            if (yer) efektEkle({ tip: 'kirilma', tur: 'kafes', r: yer[0], c: yer[1] });
          }
      if (anahtarSay) {
        cal('anahtar');
        titret('basari');
      }
      if (kartopuSay) {
        cal('kartopu_patla');
        titret('guclu');
        sars(4 + kartopuSay * 2);
      }
      // Yanında eşleşme olan kartopları büyür
      let buyuyenSay = 0;
      for (const [r, c] of adim.buyuyen || []) {
        const p = parcaAt(r, c);
        if (!p || p.tur !== M.KARTOPU || (p.kt || 1) >= 3 || silinen.some((x) => x.p === p)) continue;
        p.kt = (p.kt || 1) + 1;
        buyuyenSay++;
        Animated.sequence([
          Animated.timing(p.olcek, { toValue: 1.25, duration: 120, useNativeDriver: true }),
          Animated.spring(p.olcek, { toValue: 1, speed: 16, bounciness: 12, useNativeDriver: true }),
        ]).start();
      }
      if (buyuyenSay) {
        cal('kartopu_buyu');
        yenile();
      }
      // Açık istiridyeler inci verir
      let istSay = 0;
      for (const [r, c] of adim.istiridyeler || []) {
        const p = parcaAt(r, c);
        if (!p || p.tur !== M.ISTIRIDYE) continue;
        silinen.push({ r, c, p, tohum: true });
        istSay++;
        efektEkle({ tip: 'donusum', r, c });
      }
      if (istSay) {
        cal('inci');
        titret('basari');
      }
      if ((adim.tohumlar || []).length > civcivSay + anahtarSay + kartopuSay) {
        cal('tohum_cicek');
        titret('basari');
      }
      if (civcivSay) {
        cal('civciv');
        titret('basari');
      }
      if (ficiOdul) cal('fici_odul');
      else if (kasaKirilan || ficiKirilan || komurKirilan) cal('kasa_kir');
      else if (adim.kasaVurus.length > yumurtaVurulan + ariSay) cal('kasa_vur');
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
      // Balonlar yükselir (üstündeki parçayla yer değiştirir); en üsttekiler uçup gider
      let balonUcan = 0;
      const balonAnim = [];
      for (const [r, c] of adim.balonlar || []) {
        const p = parcaAt(r, c);
        if (!p || p.tur !== M.BALON) continue;
        const u = r - 1;
        if (u < 0 || (parcaAt(u, c) || {}).tur === M.DELIK) {
          balonUcan++;
          parcalar.current.delete(p.id);
          izgara.current[r][c] = null;
          efektEkle({ tip: 'balonUc', r, c });
          continue;
        }
        const q = parcaAt(u, c);
        if (q && q.tur === M.BALON) continue;
        izgara.current[u][c] = p.id;
        izgara.current[r][c] = q ? q.id : null;
        balonAnim.push(tasi(p, u, c, 200, Easing.out(Easing.quad)));
        if (q) balonAnim.push(tasi(q, r, c, 200, Easing.in(Easing.quad)));
      }
      if (balonAnim.length || balonUcan) {
        cal(balonUcan ? 'balon_uc' : 'balon_yuksel');
        if (balonUcan) titret('basari');
        yenile();
        await oynat(Animated.parallel(balonAnim));
      }
      const tohumSay = (adim.tohumlar || []).length - civcivSay - anahtarSay - kartopuSay - findikSay - kavanozSay;
      if (kavanozSay) {
        topla({ kavanoz: kavanozSay });
        sayacToplam.kavanoz = (sayacToplam.kavanoz || 0) + kavanozSay;
        cal('bal_temizle');
      }
      if (komurKirilan) {
        topla({ komur: komurKirilan });
        sayacToplam.komur = (sayacToplam.komur || 0) + komurKirilan;
      }
      if (findikSay) {
        topla({ findik: findikSay });
        sayacToplam.findik = (sayacToplam.findik || 0) + findikSay;
        cal('findik');
      }
      const saatSay = silinen.filter((x) => x.p.saat).length;
      const bukSay = silinen.filter((x) => x.p.buk).length;
      const unSay = seviye.carklar ? silinen.filter((x) => !x.kasa && !x.tohum && x.p.tur >= 0 && x.p.tur < 6 && M.carkHucreMi(x.r, x.c)).length : 0;
      topla({ ...adimSayaci(silinen), buz: buzKirilan.length - sarmasikKesilen - sisDagilan - mantarKesilen, sis: sisDagilan, mantar: mantarKesilen, kasa: kasaKirilan, fici: ficiKirilan, kar: karSay, cicek: cicekSay, saat: saatSay, tohum: tohumSay, civciv: civcivSay, anahtar: anahtarSay, kafes: kafesAcilan, bukalemun: bukSay, balon: balonUcan, bal: balSay, fener: fenerSay, domino: dominoSay, kartopu: kartopuSay, istiridye: istSay, un: unSay, sandik: sandikBulunan });
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
      sayacToplam.kafes = (sayacToplam.kafes || 0) + kafesAcilan;
      sayacToplam.bukalemun = (sayacToplam.bukalemun || 0) + bukSay;
      sayacToplam.balon = (sayacToplam.balon || 0) + balonUcan;
      sayacToplam.bal = (sayacToplam.bal || 0) + balSay;
      sayacToplam.fener = (sayacToplam.fener || 0) + fenerSay;
      sayacToplam.domino = (sayacToplam.domino || 0) + dominoSay;
      sayacToplam.kartopu = (sayacToplam.kartopu || 0) + kartopuSay;
      sayacToplam.istiridye = (sayacToplam.istiridye || 0) + istSay;
      sayacToplam.un = (sayacToplam.un || 0) + unSay;
      if (unSay) cal('un');
      sayacToplam.tohum += tohumSay;
      puanEkle(kazanc);

      // Yeni mekanikler (dev meyve, çan, kazan, boya, salyangoz, sincap, kristal, lav, kurdele, bulut...)
      if (tozSay) {
        topla({ toz: tozSay });
        cal('toz');
      }
      sayacToplam.toz = (sayacToplam.toz || 0) + tozSay;
      if (ekA.degis.length || ekA.zemin.length || Object.keys(ekA.sayac).length) {
        for (const d of ekA.degis) hucreEsitle(d.r, d.c, d.tur, d.oz, d.engel);
        for (const z of ekA.zemin) zemin.current[z.r][z.c] = z.v;
        for (const e of ekA.efekt) {
          if (e.tip === 'can') {
            efektEkle({ tip: 'isin', yon: 'satir', r: e.r, c: e.c, renk: '#ffd84a' });
            efektEkle({ tip: 'isin', yon: 'sutun', r: e.r, c: e.c, renk: '#ffd84a' });
          } else if (e.tip === 'pompa') {
            efektEkle({ tip: 'isin', yon: 'satir', r: e.r, c: e.c, renk: '#5ab0ff' });
            efektEkle({ tip: 'isin', yon: 'sutun', r: e.r, c: e.c, renk: '#5ab0ff' });
          } else if (e.tip === 'ates') efektEkle({ tip: 'dalga', r: e.r, c: e.c, yaricap: 1.5, renk: '#ff6a1a' });
          else if (e.tip === 'boru') efektEkle({ tip: 'isin', yon: 'satir', r: e.r, c: e.c, renk: '#5ab0ff' });
          else if (e.tip === 'firildak') efektEkle({ tip: 'isin', yon: e.yon % 2 ? 'satir' : 'sutun', r: e.r, c: e.c, renk: '#ffb84d' });
          else if (e.tip === 'miknatis' || e.tip === 'ayi') efektEkle({ tip: 'dalga', r: e.r, c: e.c, yaricap: 1.5, renk: e.tip === 'ayi' ? '#a8692e' : '#e8323c' });
          else if (e.tip === 'dev') efektEkle({ tip: 'dalga', r: e.r + 0.5, c: e.c + 0.5, yaricap: 2, renk: '#ffd84a' });
          else if (e.tip === 'yagmur') efektEkle({ tip: 'kirilma', tur: 'buz', r: 7, c: e.c });
          else efektEkle({ tip: 'donusum', r: e.r, c: e.c });
        }
        const ef = new Set(ekA.efekt.map((e) => e.tip));
        if (ekA.sayac.kazanDol && !ef.has('kazan')) ef.add('kazanDol');
        if (ekA.sayac.slyAdim && !ef.has('salyangoz')) ef.add('slyAdim');
        // Her olay türünün kendi sesi; aynı adımda en çok iki ses (önemli olan önce)
        const EK_SES = [['dev', 'dev_kir'], ['can', 'can_cal'], ['kazan', 'kazan_tasma'], ['salyangoz', 'salyangoz_bitis'], ['devCatla', 'dev_catla'], ['kristal', 'kristal_kir'], ['boya', 'boya'], ['yagmur', 'yagmur'], ['lav', 'lav_sogu'], ['tas', 'tas_kir'], ['ayna', 'ayna_don'], ['findik', 'sincap'], ['kazanDol', 'kazan_dol'], ['slyAdim', 'salyangoz_adim'], ['ayi', 'ayi_uyan'], ['miknatis', 'bomba'], ['kapi', 'gizli_kapi'], ['kelebek', 'kelebek'], ['pompa', 'pompa'], ['koza', 'sarmasik_kes'], ['mozaik', 'boya'], ['kaya', 'tas_kir'], ['su', 'bal_temizle'], ['paratoner', 'pling'], ['hazine', 'sandik'], ['boru', 'yagmur'], ['agac', 'cicek'], ['ates', 'lav_sogu'], ['orumcek', 'hayalet'], ['kostebek', 'kafes'], ['firildak', 'ruzgar'], ['ag', 'sarmasik_kes'], ['fidan', 'tohum_cicek'], ['gunes', 'toz'], ['ay', 'toz'], ['hayvan', 'kurbaga_patla'], ['hayvanYe', 'kurbaga_ye'], ['fisek', 'yildiz_dus'], ['labut', 'domino'], ['top', 'tren_ilerle'], ['balik', 'inci'], ['recel', 'bal_yay'], ['kart', 'secim']];
        for (const x of ekA.efekt) if (x.tip === 'kart') ekDuyuru.current.push(`Kart açıldı: ${M.KART_RESIM[x.resim]}`);
        const nota = ekA.efekt.find((x) => x.tip === 'nota');
        if (nota) cal('zincir_' + Math.min(6, nota.k + 1));
        let sesN = 0;
        for (const [tip, ad] of EK_SES) if (ef.has(tip) && sesN < 2) {
          cal(ad);
          sesN++;
        }
        if (ef.has('dev') || ef.has('can') || ef.has('kazan') || ef.has('kelebek') || ef.has('kapi') || ef.has('miknatis')) titret('basari');
        const teraziOnce = seviye.terazi ? ['sol', 'sag'].filter((k) => (toplananRef.current[k] || 0) < (seviye.hedef[k] || 0)) : [];
        topla(ekA.sayac);
        for (const [k, v] of Object.entries(ekA.sayac)) sayacToplam[k] = (sayacToplam[k] || 0) + v;
        if (teraziOnce.some((k) => (toplananRef.current[k] || 0) >= seviye.hedef[k])) cal('terazi');
        sarmasikGuncelle();
        yenile();
      }
      // Düşür ve yenilerini getir
      await dusurDoldur();
      if (ekA.alan.length) ekler = [...ekler, ...ekA.alan];
      if (ekA.etiket.length) {
        ekler = [...ekler, ...M.ikizAlan(engelIzgarasi(), ekA.etiket)];
        cal('kurdele');
      }
      // Kartopu patlaması: alanı bir sonraki adımda temizlenir
      if (kartopuAlan.length) ekler = [...ekler, ...kartopuAlan];
      // Kovandan çıkan arılar rastgele engellere vurur (bir sonraki adımda)
      if (ariSay) {
        const h = M.ariHedefleri(turIzgarasi(), engelIzgarasi(), zemin.current, ariSay);
        if (h.length) {
          ekler = [...ekler, ...h];
          for (const [r, c] of h) efektEkle({ tip: 'ari', r, c });
          cal('ari_kovan');
          await bekle(450);
        }
      }
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
      duyur(`Seviye ${seviye.no} tamam! ${yildiz} yıldız. Puanın ${p}.${rekor ? ' Yeni rekor!' : ''}${bolumOdulu ? ' Bölüm tamamlandı! Her güçlendiriciden 1 tane ve 1 can kazandın.' : ''}`);
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
    if (p.kafes) {
      cal('kafes');
      titret('hata');
      duyur('Kafes çekiçle kırılmaz, anahtarı en alta indir');
      salla(p).start();
      return;
    }
    if (M.inenMi(p.tur)) {
      cal('gecersiz');
      titret('hata');
      duyur(p.tur === M.KARTOPU ? 'Kartopu kırılamaz, onu en alt sıraya indir' : p.tur === M.ANAHTAR ? 'Anahtar kırılamaz, onu en alt sıraya indir' : p.tur === M.CIVCIV ? 'Civciv kırılamaz, onu en alt sıraya indir' : 'Tohum kırılamaz, onu en alt sıraya indir');
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

  // Değirmen çarkları saat yönünde bir kare döner (üstündeki parçalar taşınır), sonra oluşan eşleşmeler çözülür
  const carkDondur = async () => {
    cal('cark');
    const yeni = izgara.current.map((s) => s.slice());
    const animler = [];
    for (const [r0, c0] of seviye.carklar) {
      const h = M.carkSirasi(r0, c0);
      if (h.some(([r, c]) => (parcaAt(r, c) || {}).tur === M.DELIK)) continue;
      h.forEach(([r, c], i) => {
        const [y0, y1] = h[(i + 1) % 4];
        const id = izgara.current[r][c];
        yeni[y0][y1] = id;
        const p = parcalar.current.get(id);
        if (p) animler.push(tasi(p, y0, y1, 260, Easing.inOut(Easing.quad)));
      });
    }
    await oynat(Animated.parallel(animler));
    izgara.current = yeni;
    yenile();
    return cozumle();
  };

  // Bukalemun meyveler bir sonraki renge geçer, sonra oluşan eşleşmeler çözülür
  const bukalemunDegistir = async () => {
    const liste = [];
    for (let r = 0; r < M.SATIR; r++)
      for (let c = 0; c < M.SUTUN; c++) {
        const p = parcaAt(r, c);
        if (p && p.buk && p.tur >= 0 && p.tur < seviye.tur) liste.push([p, r, c]);
      }
    if (!liste.length) return null;
    cal('bukalemun', 0.8);
    for (const [p, r, c] of liste) {
      p.tur = (p.tur + 1) % seviye.tur;
      efektEkle({ tip: 'donusum', r, c });
      parlayarakDonustur(p).start();
    }
    yenile();
    await bekle(260);
    return cozumle();
  };

  // Kurbağalar komşu meyveyi yer; doyan kurbağa çevresini patlatır
  const kurbagaBeslen = async () => {
    const kurbalar = [];
    for (let r = 0; r < M.SATIR; r++) for (let c = 0; c < M.SUTUN; c++) if ((parcaAt(r, c) || {}).tur === M.KURBAGA) kurbalar.push([r, c]);
    if (!kurbalar.length) return null;
    const yenen = {};
    const patlamalar = [];
    let doyan = 0;
    for (const [r, c] of kurbalar) {
      const k = parcaAt(r, c);
      const h = M.kurbagaHedefi(turIzgarasi(), ozIzgarasi(), engelIzgarasi(), r, c);
      if (!k || !h) continue;
      const m = parcaAt(h[0], h[1]);
      yenen[m.tur] = (yenen[m.tur] || 0) + 1;
      await oynat(
        Animated.parallel([
          tasi(k, h[0], h[1], 220, Easing.out(Easing.back(1.4))),
          Animated.timing(m.olcek, { toValue: 0, duration: 200, useNativeDriver: true }),
        ])
      );
      parcalar.current.delete(m.id);
      izgara.current[h[0]][h[1]] = k.id;
      izgara.current[r][c] = null;
      k.kurb = (k.kurb || 0) + 1;
      cal('kurbaga_ye');
      if (k.kurb >= M.KURBAGA_DOY) {
        doyan++;
        patlamalar.push(h);
        parcalar.current.delete(k.id);
        izgara.current[h[0]][h[1]] = null;
        efektEkle({ tip: 'dalga', r: h[0], c: h[1], yaricap: 1, renk: '#7ad06a' });
        cal('kurbaga_patla');
        titret('guclu');
        sars(5);
      }
      yenile();
    }
    topla({ ...yenen, kurbaga: doyan });
    puanEkle(Object.values(yenen).reduce((a, b) => a + b, 0) * 20);
    await dusurDoldur();
    const z = await cozumle({ ek: M.kurbagaAlani(patlamalar) });
    z.kurbaga = (z.kurbaga || 0) + doyan;
    for (const [t, n] of Object.entries(yenen)) z.patlayan[t] = (z.patlayan[t] || 0) + n;
    return z;
  };

  const hamleSonrasi = async (sonuc, cekicle = false) => {
    // Ayna: oyuncunun hamlesinin aynası (öbür yarıda) eşleşme oluşturuyorsa kendiliğinden yapılır
    let aynaYapildi = false;
    if (seviye.ayna && !cekicle && sonHamle.current && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      const m = M.aynaHamlesi(sonHamle.current, turIzgarasi(), ozIzgarasi(), engelIzgarasi());
      sonHamle.current = null;
      if (m) {
        await bekle(200);
        cal('ayna_hamle');
        efektEkle({ tip: 'donusum', r: m[0][0], c: m[0][1] });
        const z = await hamleYap(m[0], m[1], true);
        if (z) {
          aynaYapildi = true;
          sonuc = sonucBirlestir(sonuc, z);
        }
      }
    }
    // Uzay: yerçekimi her N çekiçsiz hamlede bir döner
    let yonDegisti = null;
    if (seviye.yercekimi && !cekicle) {
      yonSayac.current += 1;
      if (yonSayac.current % seviye.yercekimi.aralik === 0) {
        const l = seviye.yercekimi.yonler;
        M.yonAyarla(l[(l.indexOf(M.yercekimiYonu()) + 1) % l.length]);
        yonDegisti = M.yercekimiYonu();
        setYon(yonDegisti);
        cal('yercekimi');
        titret('orta');
      }
    }
    // Kurbağalar yer
    if (seviye.hedef.kurbaga && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      const k = await kurbagaBeslen();
      if (k) sonuc = sonucBirlestir(sonuc, k);
    }
    // Bukalemunlar renk değiştirir
    let bukDegisti = false;
    if (seviye.hedef.bukalemun && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      const b = await bukalemunDegistir();
      if (b) {
        bukDegisti = true;
        sonuc = sonucBirlestir(sonuc, b);
      }
    }
    // Rüzgâr: bant satırları kayar
    if (seviye.bant && seviye.bant.length && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      sonuc = sonucBirlestir(sonuc, await bantKaydir());
    }
    // Değirmen çarkları her 2 hamlede döner
    let carkDondu = false;
    if (seviye.carklar && seviye.carklar.length && !cekicle) {
      carkSayac.current += 1;
      if (carkSayac.current % M.CARK_ARALIK === 0 && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
        carkDondu = true;
        sonuc = sonucBirlestir(sonuc, await carkDondur());
      }
    }
    // Yeni kurallar: hayalet, lav, sincap, tren, panayır, kuyruklu yıldız, ışık kulesi
    let ekOlay = [];
    let ekKayip = null;
    if (!cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      ekSayac.current += 1;
      const y = M.ekKurallar({ t: turIzgarasi(), oz: ozIzgarasi(), engel: engelIzgarasi(), zemin: zemin.current }, seviye, { yapilan: ekSayac.current, sonHamle: sonTakas.current });
      ekOlay = y.olaylar;
      if (y.ceza) {
        hamleRef.current = Math.max(0, hamleRef.current - y.ceza);
        setHamle(hamleRef.current);
        titret('hata');
      }
      if (y.kaybet) ekKayip = y.kaybet;
      if (y.olaylar.length || y.ek.length) {
        if (y.tasimalar.length) {
          const yeni = izgara.current.map((s) => s.slice());
          const animler = [];
          for (const { eski, yeni: h } of y.tasimalar) {
            const id = izgara.current[eski[0]][eski[1]];
            yeni[h[0]][h[1]] = id;
            const p = parcalar.current.get(id);
            if (p) animler.push(tasi(p, h[0], h[1], 240, Easing.inOut(Easing.quad)));
          }
          cal(y.olaylar.some((o) => o.tip === 'vagon' || o.tip === 'vagonVardi') ? 'tren_ilerle' : y.olaylar.some((o) => o.tip === 'karinca') ? 'salyangoz_adim' : 'kapi', 0.7);
          await oynat(Animated.parallel(animler));
          izgara.current = yeni;
        }
        let kalkan = false;
        for (let r = 0; r < M.SATIR; r++)
          for (let c = 0; c < M.SUTUN; c++) {
            const p = parcaAt(r, c);
            const e = engelIzgarasi()[r][c];
            if ((p ? p.tur : -1) !== y.t[r][c] || (p ? p.ozel || null : null) !== (y.oz[r][c] || null) || e !== y.engel[r][c]) {
              if (y.t[r][c] === -1) kalkan = true;
              hucreEsitle(r, c, y.t[r][c], y.oz[r][c] || null, y.engel[r][c]);
              efektEkle({ tip: 'donusum', r, c });
            }
          }
        if (y.puan) puanEkle(y.puan);
        if (Object.keys(y.sayac).length) topla(y.sayac);
        for (const o of y.olaylar) {
          if (o.tip === 'yildiz') efektEkle({ tip: 'isin', r: 0, c: o.c, yon: 'sutun', renk: '#fff3a0' });
          if (o.tip === 'simsekParatoner') efektEkle({ tip: 'isin', r: 0, c: o.c, yon: 'sutun', renk: '#bfe0ff' });
          if (o.tip === 'simsek') { efektEkle({ tip: 'isin', r: o.hucre[0], c: o.hucre[1], yon: 'sutun', renk: '#bfe0ff' }); sars(4); }
        }
        const OLAY_SES = { yildiz: 'yildiz_dus', panayir: 'panayir', vagonVardi: 'tren_vardi', lavYay: 'lav_yay', hayalet: 'hayalet', sincap: 'sincap', isik: 'isik', suYukseldi: 'su_yuksel', suBasti: 'saat_alarm', yaprakYendi: 'gecersiz', miknatis: 'miknatis', cekim: 'miknatis', miknatisPatladi: 'bomba', karincaVardi: 'tren_vardi', simsek: 'simsek', simsekParatoner: 'simsek', ag: 'sarmasik_yay', kostebek: 'findik', agac: 'ozel_olustu', gunduz: 'isik', kartCift: 'yildiz_2', yanki: 'can_cal' };
        for (const t of new Set(y.olaylar.map((o) => o.tip))) if (OLAY_SES[t]) cal(OLAY_SES[t]);
        sarmasikGuncelle();
        yenile();
        if (kalkan) await dusurDoldur();
        sonuc = sonucBirlestir(sonuc, await cozumle({ ek: y.ek }));
      }
    }
    // İstiridyeler açılır / kapanır
    let istiridyeAcik = null;
    if (seviye.hedef.istiridye && !cekicle && !hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      let n = 0;
      let acik = 0;
      for (const q of parcalar.current.values())
        if (q.tur === M.ISTIRIDYE) {
          q.ist = q.ist ? 0 : 1;
          n++;
          if (q.ist) acik++;
          Animated.sequence([
            Animated.timing(q.olcek, { toValue: 0.85, duration: 90, useNativeDriver: true }),
            Animated.spring(q.olcek, { toValue: 1, speed: 16, bounciness: 10, useNativeDriver: true }),
          ]).start();
        }
      if (n) {
        istiridyeAcik = acik;
        cal('istiridye_don');
        yenile();
      }
    }
    // Sipariş: bu hamlede patlayan meyveler ve oluşan özel parçalar açık siparişe işlenir
    let siparisBitti = null;
    if (seviye.hedef.siparis) {
      const ic = { topla: { ...sonuc.patlayan } };
      for (const o of sonuc.olusanlar) {
        const k = 'ozel_' + M.ozelSiparisAdi(o.ozel);
        ic[k] = (ic[k] || 0) + 1;
      }
      const once = toplananRef.current.siparis || 0;
      toplananRef.current = M.siparisIlerlet({ ...toplananRef.current }, seviye, ic);
      setToplanan(toplananRef.current);
      if ((toplananRef.current.siparis || 0) > once) {
        siparisBitti = seviye.siparisler[toplananRef.current.siparis] || 'son';
        cal('siparis');
        titret('basari');
      }
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
      [...ekDuyuru.current.splice(0), p.length ? p.join(', ') + ' patladı' : '', sonuc.buz ? `${sonuc.buz} buz kırıldı` : '', sonuc.kasa ? `${sonuc.kasa} kasa kırıldı` : '', sonuc.fici ? `${sonuc.fici} fıçı kırıldı` : '', sonuc.sarmasik ? `${sonuc.sarmasik} sarmaşık kesildi` : '', sonuc.sis ? `${sonuc.sis} sis dağıldı` : '', ...EK_HEDEF.map((e) => (sonuc[e.k] ? e.olay(sonuc[e.k]) : '')), sonuc.ayi ? 'Ayı uyandı ve üç kasa devirdi!' : '', sonuc.koza ? (sonuc.koza > 1 ? `${sonuc.koza} tırtıl koza oldu` : 'Tırtıl koza oldu') : '', sonuc.kar ? `${sonuc.kar} kat kar eridi` : '', sonuc.tohum ? (sonuc.tohum > 1 ? `${sonuc.tohum} tohum çiçek açtı` : 'Tohum çiçek açtı') : '', ...o, sonuc.zincir >= 2 ? `${sonuc.zincir} zincir` : '', bukDegisti ? 'Bukalemunlar renk değiştirdi' : '', ...ekOlay.map(ekOlayMetni), carkDondu ? 'Çarklar döndü' : seviye.carklar && !cekicle && carkSayac.current % M.CARK_ARALIK ? 'Çarklar bir hamle sonra dönecek' : '', aynaYapildi ? 'Ayna hamlesi yapıldı' : '', istiridyeAcik != null ? (istiridyeAcik ? `İstiridyeler döndü, ${istiridyeAcik} tanesi açık` : 'İstiridyelerin hepsi kapalı') : '', yonDegisti ? `Yerçekimi döndü, meyveler artık ${M.YON_AD[yonDegisti]} düşüyor` : '', siparisBitti ? (siparisBitti === 'son' ? 'Son sipariş tamam!' : `Sipariş tamam! Sıradaki: ${siparisAdi(siparisBitti, siparisBitti.n)}`) : '', seviye.hedef.mantar && !cekicle && toplananRef.current.mantarKalan > 0 && (mantarSayac.current + 1) % M.MANTAR_ARALIK ? `Mantarlar ${M.MANTAR_ARALIK - ((mantarSayac.current + 1) % M.MANTAR_ARALIK)} hamle sonra çoğalacak` : '', saatDoldu ? 'Saat doldu!' : enAzSaat != null && enAzSaat <= 3 ? `Dikkat, saatli meyvede ${enAzSaat} hamle kaldı` : '', kalanMetni(seviye, toplananRef.current, puanRef.current), `${hamleRef.current} hamle`]
        .filter(Boolean)
        .join('. ')
    );
    if (hedefTamam(seviye, toplananRef.current, puanRef.current)) {
      await senlik();
      return;
    }
    if (saatDoldu || ekKayip) {
      // Süresi dolan saatli meyve ya da tahtayı basan su: seviye kaybedilir (+5 hamle teklifi yok)
      titret('hata');
      sars(6);
      kayipNeden.current = ekKayip === 'su' ? 'Su tahtayı bastı' : 'Saat doldu';
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
    // Bal: hamlede hiç bal silinmediyse yanındaki bir kareye yayılır
    if (seviye.hedef.bal && !sonuc.bal && !cekicle && (toplananRef.current.balKalan || 0) > 0) {
      const y = M.balYay(turIzgarasi(), zemin.current);
      if (y) {
        zemin.current = y.zemin;
        efektEkle({ tip: 'kirilma', tur: 'bal', r: y.hucre[0], c: y.hucre[1], az: true });
        cal('bal_yay');
        sarmasikGuncelle();
        yenile();
        duyur(`Bal yayıldı, ${y.hucre[0] + 1}. satır ${y.hucre[1] + 1}. sütun`);
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

  // ayna: Ayna Gölü'nde kendiliğinden yapılan aynalanmış hamle (hamle harcamaz, sonucu döndürür)
  const hamleYap = async (a, b, ayna = false) => {
    if (!ayna && (mesgul.current || bittiRef.current)) return;
    if (!ayna && gucModuRef.current) return; // çekiç seçiliyken kaydırma takas yapmaz
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
      duyur(k.tur === M.DELIK ? 'Orası boş, meyve gidemez' : k.tur === M.BALON ? 'Balon yer değiştiremez, yanında eşleşme yap' : k.tur === M.ISTIRIDYE ? 'İstiridye yer değiştiremez, açıkken yanında eşleşme yap' : k.tur === M.FENER ? 'Fener yer değiştiremez, özel meyveyle yak' : k.tur === M.KOVAN ? 'Kovan yer değiştiremez, yanında eşleşme yap, arı çıksın' : k.tur === M.DOMINO ? 'Domino yer değiştiremez, yanında eşleşme yap, devrilsin' : k.tur === M.KASA ? 'Kasa yer değiştiremez' : M.ficiMi(k.tur) ? 'Fıçı yer değiştiremez' : k.sarmasik ? 'Sarmaşıklı meyve yer değiştiremez' : k.sis ? 'Sisli kare yer değiştiremez' : k.mantar ? 'Mantarlı meyve yer değiştiremez' : k.kafes ? 'Kafesli meyve yer değiştiremez, anahtarı en alta indir' : k.buz ? 'Buzlu meyve yer değiştiremez' : 'Bu kare yer değiştiremez, yanında eşleşme yap');
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
    // Buz pisti: itilen meyve pist boyunca kayar, aradakiler birer kare geri gelir
    const pist = bir ? null : M.pistHareket(turIzgarasi(), a, b);
    if (pist) {
      const eskiIz = izgara.current.map((s2) => s2.slice());
      const parcalarH = pist.map(([e, n]) => [parcalar.current.get(eskiIz[e[0]][e[1]]), e, n]);
      await oynat(Animated.parallel(parcalarH.map(([q, , n]) => tasi(q, n[0], n[1], 260, Easing.out(Easing.quad)))));
      for (const [q, , n] of parcalarH) izgara.current[n[0]][n[1]] = q.id;
      if (!M.eslesmeleriBul(turIzgarasi()).length) {
        cal('gecersiz');
        titret('hata');
        await oynat(Animated.parallel(parcalarH.map(([q, e]) => tasi(q, e[0], e[1], 200, Easing.out(Easing.back(1.4))))));
        izgara.current = eskiIz;
        duyur('Eşleşme olmadı');
        mesgul.current = false;
        yenile();
        ipucuKur();
        return;
      }
      if (!ayna) {
        hamleRef.current -= 1;
        setHamle(hamleRef.current);
        sonHamle.current = [a, b];
        sonTakas.current = [a, b];
      }
      const sonuc = await cozumle({ hamleHucre: [a, pist[0][1]] });
      if (ayna) return sonuc;
      await hamleSonrasi(sonuc);
      return;
    }
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
      if (!ayna) {
        hamleRef.current -= 1;
        setHamle(hamleRef.current);
        sonHamle.current = [a, b];
        sonTakas.current = [a, b];
      }
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
      if (ayna) return sonuc;
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

    if (!ayna) {
      hamleRef.current -= 1;
      setHamle(hamleRef.current);
      sonHamle.current = [a, b];
      sonTakas.current = [a, b];
    }
    const sonuc = await cozumle({ hamleHucre: [a, b] });
    if (ayna) return sonuc;
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
        <Pressable accessibilityRole="button" accessibilityLabel={`Geri, ${geriAd.toLocaleLowerCase('tr')}`} onPress={geri} hitSlop={10} style={({ pressed }) => [yst.geri, pressed && { opacity: 0.6 }]}>
          <Text style={yst.geriYazi}>‹ Geri</Text>
        </Pressable>
        <Text style={[yst.seviyeBaslik, geceMi(bolumNo(seviye.no)) && yst.geceYazi]} accessibilityRole="header" accessibilityLabel={`Seviye ${seviye.no}${seviye.yercekimi ? `, yerçekimi ${M.YON_AD[yon]}` : ''}${seviye.gunduzGece ? (M.gunduzMu() ? ', gündüz' : ', gece') : ''}`}>
          Seviye {seviye.no}
          {seviye.gunduzGece ? (M.gunduzMu() ? ' ☀️' : ' 🌙') : ''}
          {seviye.yercekimi ? ` ${{ asagi: '⬇️', yukari: '⬆️', sol: '⬅️', sag: '➡️' }[yon]}` : ''}
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
            {seviye.ayna ? <View style={{ position: 'absolute', left: H * 4 - 2, top: 0, width: 4, height: H * 8, backgroundColor: 'rgba(120,200,255,0.55)', borderRadius: 2 }} /> : null}
            {seviye.terazi ? <TeraziCizgi H={H} /> : null}
            {seviye.ray != null ? <Ray satir={seviye.ray} H={H} /> : null}
            {seviye.bulutlar ? <BulutSerit sutunlar={seviye.bulutlar} H={H} /> : null}
            {seviye.yol ? <KarincaYolu yol={seviye.yol} H={H} /> : null}
            {seviye.oltalar ? <OltaSerit sutunlar={seviye.oltalar} H={H} /> : null}
            {(seviye.duzen || []).map((satir, r) => [...satir].map((h, c) => (h === '_' ? <PistZemin key={`ps${r}-${c}`} H={H} r={r} c={c} /> : null)))}
            {seviye.selale ? <SelaleSerit selale={seviye.selale} H={H} /> : null}
            {(seviye.carklar || []).map(([r, c]) => (
              <CarkCerceve key={`ck${r}-${c}`} r={r} c={c} H={H} />
            ))}
            {(seviye.bant || []).map(({ satir: r, yon }) => (
              <BantSerit key={`b${r}`} r={r} yon={yon} H={H} />
            ))}
            {(seviye.sandiklar || []).map((sd, i) => (
              <GomuluSandik key={`sd${i}`} s={sd} H={H} bulundu={M.sandikHucreleri(sd).every(([a, b]) => zemin.current[a][b] !== M.KUM)} />
            ))}
            {zemin.current.map((satir, r) => satir.map((k, c) => (k > 0 ? (k === M.HAZINE ? null : k === M.RECEL ? <RecelZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : k === M.YANKI1 || k === M.YANKI2 ? <YankiZemin key={`k${r}-${c}`} H={H} r={r} c={c} n={k === M.YANKI1 ? 1 : 2} /> : M.notaMi(k) ? <NotaZemin key={`k${r}-${c}`} H={H} r={r} c={c} k={k - M.NOTA + 1} /> : k === M.YUVA ? <YuvaZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : k === M.GUNES || k === M.AY ? <GunAyZemin key={`k${r}-${c}`} H={H} r={r} c={c} gunes={k === M.GUNES} acik={(k === M.GUNES) === M.gunduzMu()} /> : M.kayaMi(k) ? <KayaZemin key={`k${r}-${c}`} H={H} r={r} c={c} kat={k === M.KAYA2 ? 2 : 1} /> : M.mozaikMi(k) ? <MozaikZemin key={`k${r}-${c}`} H={H} r={r} c={c} tur={k - M.MOZAIK} /> : k === M.KURU ? <KuruZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : k === M.TOZ ? <TozZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : k === M.KUM ? <KumZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : k === M.BAL ? <BalZemin key={`k${r}-${c}`} H={H} r={r} c={c} /> : M.cicekMi(k) ? <CicekZemin key={`k${r}-${c}`} H={H} tur={k - M.CICEK} r={r} c={c} /> : <KarZemin key={`k${r}-${c}`} H={H} kat={k} r={r} c={c} />) : null)))}
          </View>
          {secili && <SeciliHalka r={secili[0]} c={secili[1]} H={H} />}
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {liste.map((p) => (
              <Parca key={p.id} p={p} H={H} />
            ))}
          </View>
          <View style={TAM} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {seviye.isik != null ? <IsikHatti yol={M.isikYolu(turIzgarasi(), engelIzgarasi(), seviye.isik)} H={H} /> : null}
            {M.devKoseleri().map(([r, c]) => {
              const p = parcaAt(r, c);
              if (!p || p.tur !== M.DEV || !p.ek) return null;
              const b = M.dvBilgi(p.ek);
              return <DevMeyve key={`dv${r}-${c}`} r={r} c={c} H={H} resim={MEYVELER[b.tur].resim} kat={b.kat} enCok={M.DEV_KAT} />;
            })}
            {(seviye.kapilar || []).map((k, i) => (
              <KapiIsareti key={`kp${i}`} k={k} i={i} H={H} />
            ))}
            {seviye.karanlik ? (() => { const en = engelIzgarasi(); return en.map((s2, r) => s2.map((_, c) => (M.karanlikMi(en, r, c) ? <KaranlikKatman key={`kr${r}-${c}`} H={H} r={r} c={c} /> : null))); })() : null}
            {zemin.current.map((satir, r) => satir.map((k, c) => (M.notaMi(k) ? <ZeminRozet key={`zr${r}-${c}`} H={H} r={r} c={c} yazi={`♪${k - M.NOTA + 1}`} renk="#7a5ad8" /> : k === M.GUNES || k === M.AY ? <ZeminRozet key={`zr${r}-${c}`} H={H} r={r} c={c} yazi={k === M.GUNES ? '☀' : '☾'} renk={k === M.GUNES ? '#f0a000' : '#4a4ab0'} soluk={(k === M.GUNES) !== M.gunduzMu()} /> : null)))}
            {zemin.current.map((satir, r) => satir.map((k, c) => (k > 0 && k !== M.KURU && k !== M.TOZ && k < M.KAYA1 ? (k === M.KUM ? <KumUst key={`u${r}-${c}`} H={H} r={r} c={c} /> : k === M.BAL ? <BalUst key={`u${r}-${c}`} H={H} r={r} c={c} /> : M.cicekMi(k) ? <CicekUst key={`u${r}-${c}`} H={H} tur={k - M.CICEK} r={r} c={c} /> : <KarUst key={`u${r}-${c}`} H={H} kat={k} r={r} c={c} />) : null)))}
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
              if (e.tip === 'fener') return <FenerYanma key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'balonUc') return <BalonUcus key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'ari') return <AriEfekt key={e.id} e={e} H={H} bitti={efektKaldir} />;
              if (e.tip === 'cicek') return <CicekAcma key={e.id} e={e} H={H} bitti={efektKaldir} />;
              return null;
            })}
          </View>
          {vo &&
            asama === 'oyun' &&
            (karanlikEngel = seviye.karanlik ? engelIzgarasi() : null, true) &&
            izgara.current.map((satir, r) =>
              satir.map((id, c) => {
                const p = parcalar.current.get(id);
                const sec = secili && secili[0] === r && secili[1] === c;
                return (
                  <Pressable
                    key={`h${r}-${c}`}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${seviye.karanlik && p && M.karanlikMi(karanlikEngel, r, c) ? 'Karanlık' : karliAd(zemin.current[r][c], parcaAdi(p))}${sec ? ' seçili' : ''}, ${r + 1}. satır ${c + 1}. sütun${bantYazi(r, c)}${zemin.current[r][c] !== M.KUM && M.sandikHucreMi(r, c) ? ', sandık' : ''}`}
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
      {BOT_GORUNUR && (<Pressable
        accessibilityRole="switch"
        accessibilityLabel="Otomatik oyun"
        accessibilityState={{ checked: !!bot }}
        onPress={() => botDegistir && botDegistir(!bot)}
        hitSlop={10}
        style={({ pressed }) => [yst.geri, yst.bot, bot && yst.botAcik, { marginTop: 2, paddingVertical: 5 }, pressed && { opacity: 0.6 }]}
      >
        <Text style={[yst.geriYazi, bot && { color: '#ffffff' }]}>{bot ? 'Bot: Açık' : 'Bot: Kapalı'}</Text>
      </Pressable>)}

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
                <Text style={yst.tanitimMetin}>Ödül: 🔨 1   🔄 1   +3 hamle 1   ❤️ 1</Text>
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
              <Pressable accessibilityRole="button" accessibilityLabel={geriAd} onPress={geri} style={({ pressed }) => [yst.ikinciDugme, pressed && { opacity: 0.7 }]}>
                <Text style={yst.ikinciYazi}>{geriAd}</Text>
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
        {h.siparis ? (
          (() => {
            const yapilan = toplanan.siparis || 0;
            const s = seviye.siparisler[yapilan];
            return (
              <View style={{ alignItems: 'center', marginHorizontal: 3 }}>
                {s ? <SiparisSimge s={s} boy={24} /> : <Text style={{ fontSize: 20 }}>🧺</Text>}
                <Text style={[yst.hedefSayi, !s && { color: '#2f9e2a' }]}>{s ? Math.max(0, s.n - (toplanan.siparisAdim || 0)) : '✓'}</Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#6b7a88' }}>{Math.min(yapilan + 1, h.siparis)}/{h.siparis}</Text>
              </View>
            );
          })()
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
      {h.siparis
        ? seviye.siparisler.map((s, i) => (
            <View key={'s' + i} style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <SiparisSimge s={s} boy={34} />
              <Text style={[yst.hedefSayi, { fontSize: 16 }]}>{s.n}</Text>
            </View>
          ))
        : null}
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
