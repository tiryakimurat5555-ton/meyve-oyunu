// Meyve Oyunu (geçici ad). Ekranlar: ana ekran, harita, günlük ödül ve oyun. İlerleme, güçlendiriciler ve ayarlar telefonda saklanır.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Oyun from './oyun/Oyun';
import AnaEkran from './oyun/AnaEkran';
import HaritaEkrani from './oyun/HaritaEkrani';
import GunlukEkrani from './oyun/GunlukEkrani';
import { SEVIYELER } from './oyun/seviyeler';
import { cal, sesAyari, sesleriHazirla, titresimAyari, titret } from './oyun/ses';

// Menü düğmelerinin tık sesi: ileri giden düğmeler 'dugme', geri dönen / kapatan düğmeler 'dugme_geri'
const tikla = (f, ses = 'dugme') => (...a) => {
  cal(ses);
  return f && f(...a);
};
import { st } from './oyun/gorsel';
import { AyarlarPaneli, CanYokPaneli, GUNLUK_ODUL } from './oyun/Paneller';
import { BOS_CAN, canEkle, canGerekli, canHarca, oynanabilir, sinirsizEkle } from './oyun/can';

const KAYIT = 'meyve-ilerleme-v1';
const AYAR_KAYIT = 'meyve-ayar-v1';
// guc: güçlendiriciler (başlangıç hediyesi her birinden 2); gunluk: son alınan gün ve kaçıncı gün; bolumOdul: verilen bölüm ödülleri
const BOS = { acik: 1, yildiz: {}, enIyi: {}, guc: { cekic: 2, karistir: 2, hamle3: 2 }, gunluk: { son: null, seri: 0 }, bolumOdul: {}, can: BOS_CAN };
const GUC_SEVIYE = 5;

function gunMetni(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function bugun() {
  return gunMetni(new Date());
}
function dun() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return gunMetni(d);
}
// Ödül ver: güçlendiriciler guc'a, 'can' cana, 'sinirsiz' (dakika) sınırsız cana
function odulVer(o, odul) {
  const guc = { ...o.guc };
  let can = o.can;
  for (const [k, n] of Object.entries(odul)) {
    if (k === 'can') can = canEkle(can, n);
    else if (k === 'sinirsiz') can = sinirsizEkle(can, n);
    else guc[k] = (guc[k] || 0) + n;
  }
  return { ...o, guc, can };
}

export default function App() {
  const [ilerleme, setIlerleme] = useState(null);
  const [ekran, setEkran] = useState({ ad: 'ana' });
  // Bot açık kalırsa sonraki seviyede de oynamaya devam eder
  const [bot, setBot] = useState(false);
  const [ayar, setAyar] = useState({ ses: true, titresim: true });
  const [ayarAcik, setAyarAcik] = useState(false);
  // Can bitince açılan kart: { no, nereden } (can dolunca o seviye oynanır)
  const [canYok, setCanYok] = useState(null);
  // Bu denemede can harcandı mı (kazanınca geri verilir)
  const harcanan = useRef(null);

  useEffect(() => {
    sesleriHazirla();
    AsyncStorage.getItem(KAYIT)
      .then((v) => {
        const o = v ? JSON.parse(v) : {};
        setIlerleme({ ...BOS, ...o, guc: { ...BOS.guc, ...(o.guc || {}) }, gunluk: o.gunluk || BOS.gunluk, bolumOdul: o.bolumOdul || {}, can: o.can || BOS_CAN });
      })
      .catch(() => setIlerleme(BOS));
    AsyncStorage.getItem(AYAR_KAYIT)
      .then((v) => {
        if (!v) return;
        const a = { ses: true, titresim: true, ...JSON.parse(v) };
        sesAyari(a.ses);
        titresimAyari(a.titresim);
        setAyar(a);
      })
      .catch(() => {});
  }, []);

  const kaydet = (degistir) =>
    setIlerleme((onceki) => {
      const yeni = degistir(onceki);
      AsyncStorage.setItem(KAYIT, JSON.stringify(yeni)).catch(() => {});
      return yeni;
    });

  // Günlük ödül durumu: bugünün günü (1-7) ve bugün alınabilir mi (güçlendiriciler seviye 5'te açılır)
  const gunlukDurum = () => {
    const g = (ilerleme && ilerleme.gunluk) || BOS.gunluk;
    if (g.son === bugun()) return { gun: g.seri || 1, alinabilir: false };
    return { gun: g.son === dun() ? (g.seri % 7) + 1 : 1, alinabilir: !!ilerleme && ilerleme.acik >= GUC_SEVIYE };
  };

  const gunlukAl = () => {
    const d = gunlukDurum();
    if (!d.alinabilir) return;
    const odul = GUNLUK_ODUL[d.gun - 1];
    kaydet((o) => ({ ...odulVer(o, odul), gunluk: { son: bugun(), seri: d.gun } }));
    cal('kazandin', 0.8);
    titret('basari');
  };

  const ayarDegistir = (d) => {
    const a = { ...ayar, ...d };
    sesAyari(a.ses);
    titresimAyari(a.titresim);
    setAyar(a);
    AsyncStorage.setItem(AYAR_KAYIT, JSON.stringify(a)).catch(() => {});
    if (d.ses) cal('pling', 0.7);
    if (d.titresim) titret('orta');
  };

  const seviyeBitti = ({ no, basarili, yildiz, puan }) => {
    if (!basarili) return;
    // Kazanınca seviye başında düşülen can geri verilir
    const iade = harcanan.current === no;
    harcanan.current = null;
    kaydet((onceki) => {
      const yeni = {
        ...onceki,
        acik: Math.max(onceki.acik, Math.min(SEVIYELER.length, no + 1)),
        yildiz: { ...onceki.yildiz, [no]: Math.max(onceki.yildiz[no] || 0, yildiz) },
        enIyi: { ...onceki.enIyi, [no]: Math.max(onceki.enIyi[no] || 0, puan) },
      };
      // Bölüm sonu (10, 20, 30. seviye) ilk kez geçilince her güçlendiriciden 1 tane
      if (no % 10 === 0 && !onceki.bolumOdul[no]) {
        Object.assign(yeni, odulVer(yeni, { cekic: 1, karistir: 1, hamle3: 1, can: 1 }));
        yeni.bolumOdul = { ...onceki.bolumOdul, [no]: true };
      }
      if (iade) yeni.can = canEkle(yeni.can, 1);
      return yeni;
    });
  };

  const gucHarca = (ad) => kaydet((o) => ({ ...o, guc: { ...o.guc, [ad]: Math.max(0, (o.guc[ad] || 0) - 1) } }));

  // nereden: oyundan geri dönülecek ekran (ana ya da harita)
  // Can yoksa (21. seviyeden sonra) oyun yerine can kartı açılır
  const oyna = (no, nereden) => {
    if (canGerekli(no) && ilerleme && !oynanabilir(ilerleme.can)) {
      setCanYok({ no, nereden: nereden || ekran.nereden || (ekran.ad === 'harita' ? 'harita' : 'ana') });
      cal('gecersiz', 0.7);
      return;
    }
    setCanYok(null);
    setEkran((e) => ({ ad: 'oyun', no, deneme: Date.now(), nereden: nereden || e.nereden || 'ana' }));
  };
  // Seviye başladı (Başla düğmesi): can düşülür; ortada çıkılırsa ya da kaybedilirse geri gelmez
  const seviyeBasladi = (no) => {
    if (!canGerekli(no)) return;
    harcanan.current = canHarca(ilerleme.can).harcandi ? no : null;
    kaydet((o) => ({ ...o, can: canHarca(o.can).can }));
  };

  let icerik = <View style={st.kok} />;
  const canKarti = canYok && ilerleme && (
    <CanYokPaneli can={ilerleme.can} oyna={tikla(() => oyna(canYok.no, canYok.nereden))} kapat={tikla(() => setCanYok(null), 'dugme_geri')} />
  );
  const ayarlar = ayarAcik && <AyarlarPaneli ayar={ayar} degistir={tikla(ayarDegistir)} kapat={tikla(() => setAyarAcik(false), 'dugme_geri')} />;
  if (ilerleme && ekran.ad === 'ana')
    icerik = (
      <>
        <AnaEkran
          ilerleme={ilerleme}
          oyna={tikla((no) => oyna(no, 'ana'))}
          haritaAc={tikla(() => setEkran({ ad: 'harita' }))}
          gunlukAc={tikla(() => setEkran({ ad: 'gunluk' }))}
          ayarlarAc={tikla(() => setAyarAcik(true))}
          gunlukVar={gunlukDurum().alinabilir}
        />
        {ayarlar}
      </>
    );
  if (ilerleme && ekran.ad === 'harita')
    icerik = <HaritaEkrani ilerleme={ilerleme} sec={tikla((no) => oyna(no, 'harita'))} geri={tikla(() => setEkran({ ad: 'ana' }), 'dugme_geri')} />;
  if (ilerleme && ekran.ad === 'gunluk')
    icerik = <GunlukEkrani durum={gunlukDurum()} guc={ilerleme.guc} siradaki={Math.min(ilerleme.acik, SEVIYELER.length)} al={gunlukAl} geri={tikla(() => setEkran({ ad: 'ana' }), 'dugme_geri')} />;
  if (ilerleme && ekran.ad === 'oyun') {
    const seviye = SEVIYELER.find((s) => s.no === ekran.no);
    icerik = (
      <Oyun
        key={ekran.deneme}
        seviye={seviye}
        enIyi={ilerleme.enIyi[seviye.no] || 0}
        sonrakiVar={seviye.no < SEVIYELER.length}
        bitince={seviyeBitti}
        geri={tikla(() => setEkran({ ad: ekran.nereden || 'ana' }), 'dugme_geri')}
        sonraki={tikla(() => oyna(Math.min(SEVIYELER.length, seviye.no + 1)))}
        tekrar={tikla(() => oyna(seviye.no))}
        bot={bot}
        botDegistir={tikla(setBot)}
        guc={ilerleme.guc}
        gucHarca={gucHarca}
        basladi={() => seviyeBasladi(seviye.no)}
        bolumOdulVar={seviye.no % 10 === 0 && !ilerleme.bolumOdul[seviye.no]}
        geriAd={ekran.nereden === 'harita' ? 'Harita' : 'Ana ekran'}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {icerik}
      {canKarti}
    </SafeAreaProvider>
  );
}
