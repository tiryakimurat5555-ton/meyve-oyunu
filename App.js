// Meyve Oyunu (geçici ad). Ekranlar: seviye listesi ve oyun. İlerleme telefonda saklanır.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Oyun from './oyun/Oyun';
import ListeEkrani from './oyun/ListeEkrani';
import { SEVIYELER } from './oyun/seviyeler';
import { sesleriHazirla } from './oyun/ses';
import { st } from './oyun/gorsel';

const KAYIT = 'meyve-ilerleme-v1';
const BOS = { acik: 1, yildiz: {}, enIyi: {} };

export default function App() {
  const [ilerleme, setIlerleme] = useState(null);
  const [ekran, setEkran] = useState({ ad: 'liste' });

  useEffect(() => {
    sesleriHazirla();
    AsyncStorage.getItem(KAYIT)
      .then((v) => setIlerleme(v ? { ...BOS, ...JSON.parse(v) } : BOS))
      .catch(() => setIlerleme(BOS));
  }, []);

  const seviyeBitti = ({ no, basarili, yildiz, puan }) => {
    if (!basarili) return;
    setIlerleme((onceki) => {
      const yeni = {
        acik: Math.max(onceki.acik, Math.min(SEVIYELER.length, no + 1)),
        yildiz: { ...onceki.yildiz, [no]: Math.max(onceki.yildiz[no] || 0, yildiz) },
        enIyi: { ...onceki.enIyi, [no]: Math.max(onceki.enIyi[no] || 0, puan) },
      };
      AsyncStorage.setItem(KAYIT, JSON.stringify(yeni)).catch(() => {});
      return yeni;
    });
  };

  const oyna = (no) => setEkran({ ad: 'oyun', no, deneme: Date.now() });

  let icerik = <View style={st.kok} />;
  if (ilerleme && ekran.ad === 'liste') icerik = <ListeEkrani ilerleme={ilerleme} sec={oyna} />;
  if (ilerleme && ekran.ad === 'oyun') {
    const seviye = SEVIYELER.find((s) => s.no === ekran.no);
    icerik = (
      <Oyun
        key={ekran.deneme}
        seviye={seviye}
        enIyi={ilerleme.enIyi[seviye.no] || 0}
        sonrakiVar={seviye.no < SEVIYELER.length}
        bitince={seviyeBitti}
        geri={() => setEkran({ ad: 'liste' })}
        sonraki={() => oyna(Math.min(SEVIYELER.length, seviye.no + 1))}
        tekrar={() => oyna(seviye.no)}
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
