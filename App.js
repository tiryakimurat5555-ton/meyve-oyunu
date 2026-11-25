// Meyve Oyunu (geçici ad). Ekranlar: seviye listesi ve oyun. İlerleme, güçlendiriciler ve ayarlar telefonda saklanır.
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Oyun from './oyun/Oyun';
import ListeEkrani from './oyun/ListeEkrani';
import { SEVIYELER } from './oyun/seviyeler';
import { cal, sesAyari, sesleriHazirla, titresimAyari, titret } from './oyun/ses';

// Menü düğmelerinin tık sesi: ileri giden düğmeler 'dugme', geri dönen / kapatan düğmeler 'dugme_geri'
const tikla = (f, ses = 'dugme') => (...a) => {
  cal(ses);
  return f && f(...a);
};
import { st } from './oyun/gorsel';
import { AyarlarPaneli, GUNLUK_ODUL, GunlukOdulPaneli, odulMetni } from './oyun/Paneller';

const KAYIT = 'meyve-ilerleme-v1';
const AYAR_KAYIT = 'meyve-ayar-v1';
// guc: güçlendiriciler (başlangıç hediyesi her birinden 2); gunluk: son alınan gün ve kaçıncı gün; bolumOdul: verilen bölüm ödülleri
const BOS = { acik: 1, yildiz: {}, enIyi: {}, guc: { cekic: 2, karistir: 2, hamle3: 2 }, gunluk: { son: null, seri: 0 }, bolumOdul: {} };
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
function gucEkle(guc, odul) {
  const y = { ...guc };
  for (const [k, n] of Object.entries(odul)) y[k] = (y[k] || 0) + n;
  return y;
}

export default function App() {
  const [ilerleme, setIlerleme] = useState(null);
  const [ekran, setEkran] = useState({ ad: 'liste' });
  // Bot açık kalırsa sonraki seviyede de oynamaya devam eder
  const [bot, setBot] = useState(false);
  const [ayar, setAyar] = useState({ ses: true, titresim: true });
  const [ayarAcik, setAyarAcik] = useState(false);
  const [gunluk, setGunluk] = useState(null); // { gun } gösterilecek günlük ödül

  useEffect(() => {
    sesleriHazirla();
    AsyncStorage.getItem(KAYIT)
      .then((v) => {
        const o = v ? JSON.parse(v) : {};
        setIlerleme({ ...BOS, ...o, guc: { ...BOS.guc, ...(o.guc || {}) }, gunluk: o.gunluk || BOS.gunluk, bolumOdul: o.bolumOdul || {} });
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

  // Günlük ödül: listeye dönünce, güçlendiriciler açıldıysa (seviye 5) ve bugün alınmadıysa gösterilir
  useEffect(() => {
    if (!ilerleme || ekran.ad !== 'liste' || gunluk) return;
    if (ilerleme.acik < GUC_SEVIYE) return;
    const g = ilerleme.gunluk || BOS.gunluk;
    if (g.son === bugun()) return;
    const gun = g.son === dun() ? (g.seri % 7) + 1 : 1;
    setGunluk({ gun });
  }, [ilerleme, ekran.ad]);

  const gunlukAl = () => {
    if (!gunluk) return;
    const odul = GUNLUK_ODUL[gunluk.gun - 1];
    kaydet((o) => ({ ...o, guc: gucEkle(o.guc, odul), gunluk: { son: bugun(), seri: gunluk.gun } }));
    cal('kazandin', 0.8);
    titret('basari');
    AccessibilityInfo.announceForAccessibility(`${odulMetni(odul)} alındı`);
    setGunluk(null);
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
    kaydet((onceki) => {
      const yeni = {
        ...onceki,
        acik: Math.max(onceki.acik, Math.min(SEVIYELER.length, no + 1)),
        yildiz: { ...onceki.yildiz, [no]: Math.max(onceki.yildiz[no] || 0, yildiz) },
        enIyi: { ...onceki.enIyi, [no]: Math.max(onceki.enIyi[no] || 0, puan) },
      };
      // Bölüm sonu (10, 20, 30. seviye) ilk kez geçilince her güçlendiriciden 1 tane
      if (no % 10 === 0 && !onceki.bolumOdul[no]) {
        yeni.guc = gucEkle(onceki.guc, { cekic: 1, karistir: 1, hamle3: 1 });
        yeni.bolumOdul = { ...onceki.bolumOdul, [no]: true };
      }
      return yeni;
    });
  };

  const gucHarca = (ad) => kaydet((o) => ({ ...o, guc: { ...o.guc, [ad]: Math.max(0, (o.guc[ad] || 0) - 1) } }));

  const oyna = (no) => setEkran({ ad: 'oyun', no, deneme: Date.now() });

  let icerik = <View style={st.kok} />;
  if (ilerleme && ekran.ad === 'liste')
    icerik = (
      <>
        <ListeEkrani ilerleme={ilerleme} sec={tikla(oyna)} ayarlarAc={tikla(() => setAyarAcik(true))} />
        {gunluk && !ayarAcik && <GunlukOdulPaneli gun={gunluk.gun} al={gunlukAl} />}
        {ayarAcik && <AyarlarPaneli ayar={ayar} degistir={tikla(ayarDegistir)} kapat={tikla(() => setAyarAcik(false), 'dugme_geri')} />}
      </>
    );
  if (ilerleme && ekran.ad === 'oyun') {
    const seviye = SEVIYELER.find((s) => s.no === ekran.no);
    icerik = (
      <Oyun
        key={ekran.deneme}
        seviye={seviye}
        enIyi={ilerleme.enIyi[seviye.no] || 0}
        sonrakiVar={seviye.no < SEVIYELER.length}
        bitince={seviyeBitti}
        geri={tikla(() => setEkran({ ad: 'liste' }), 'dugme_geri')}
        sonraki={tikla(() => oyna(Math.min(SEVIYELER.length, seviye.no + 1)))}
        tekrar={tikla(() => oyna(seviye.no))}
        bot={bot}
        botDegistir={tikla(setBot)}
        guc={ilerleme.guc}
        gucHarca={gucHarca}
        bolumOdulVar={seviye.no % 10 === 0 && !ilerleme.bolumOdul[seviye.no]}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {icerik}
    </SafeAreaProvider>
  );
}
