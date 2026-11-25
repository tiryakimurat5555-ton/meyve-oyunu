// Seviye listesi: açık seviyeler, yıldızlar, kilitler. Resimli bahçe haritası resim aşamasında gelecek.
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEVIYELER } from './seviyeler';
import { MEYVELER, Yildiz, st } from './gorsel';
import Sahne, { bolumNo } from './sahne';

// Bölümler (ileride resimli haritada her biri ayrı bir bahçe olacak)
const BOLUMLER = [
  { ad: 'İlkbahar Bahçesi', ilk: 1, son: 10, renk: '#ff9fc4' },
  { ad: 'Yaz Bahçesi', ilk: 11, son: 20, renk: '#ffc93d' },
  { ad: 'Sonbahar Bahçesi', ilk: 21, son: 30, renk: '#ff8f4a' },
  { ad: 'Kış Bahçesi', ilk: 31, son: 40, renk: '#6fb6e8' },
  { ad: 'Çiçek Bahçesi', ilk: 41, son: 50, renk: '#e86fb0' },
  { ad: 'Tropik Bahçe', ilk: 51, son: 60, renk: '#22b07a' },
  { ad: 'Kiraz Çiçeği Bahçesi', ilk: 61, son: 70, renk: '#f07aab' },
];

export default function ListeEkrani({ ilerleme, sec, ayarlarAc }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const sutun = 4;
  const boy = Math.min(84, (Math.min(EG, 520) - 40) / sutun - 12);
  const siradaki = Math.min(ilerleme.acik, SEVIYELER.length);
  const toplamYildiz = Object.values(ilerleme.yildiz || {}).reduce((a, b) => a + b, 0);

  return (
    <View style={[st.kok, { justifyContent: 'flex-start' }]}>
      <Sahne bolum={bolumNo(siradaki)} EG={EG} EY={EY} gunesX={EG - 34} gunesY={ek.top + 20} gunesBoy={50} />
      {/* Ayarlar düğmesi sol üstte (sağ üstte Expo Go'nun dişlisi var) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ayarlar"
        onPress={ayarlarAc}
        hitSlop={10}
        style={({ pressed }) => [lst.ayar, { top: ek.top + 8 }, pressed && { opacity: 0.6 }]}
      >
        <Text style={{ fontSize: 22 }}>⚙️</Text>
      </Pressable>
      <ScrollView contentContainerStyle={{ paddingTop: ek.top + 16, paddingBottom: ek.bottom + 40, alignItems: 'center' }} style={{ width: '100%' }}>
        <View style={{ flexDirection: 'row', marginBottom: 6 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {MEYVELER.map((m) => (
            <Image key={m.ad} source={m.resim} style={{ width: 40, height: 40, marginHorizontal: 1 }} resizeMode="contain" />
          ))}
        </View>
        <Text style={lst.baslik} accessibilityRole="header">
          Meyve Bahçesi
        </Text>
        <View style={lst.yildizSatir} accessible accessibilityLabel={`Toplam ${toplamYildiz} yıldız`}>
          <Yildiz dolu boy={22} />
          <Text style={lst.yildizSayi}>
            {toplamYildiz} / {SEVIYELER.length * 3}
          </Text>
        </View>

        {ilerleme.acik >= 5 && ilerleme.guc && (
          <View
            style={lst.gucSatir}
            accessible
            accessibilityLabel={`Güçlendiricilerin: ${ilerleme.guc.cekic || 0} çekiç, ${ilerleme.guc.karistir || 0} karıştır, ${ilerleme.guc.hamle3 || 0} artı 3 hamle`}
          >
            <Text style={lst.gucYazi}>🔨 {ilerleme.guc.cekic || 0}</Text>
            <Text style={lst.gucYazi}>🔄 {ilerleme.guc.karistir || 0}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[lst.gucYazi, { color: '#2fae4f', marginRight: 0 }]}>+3</Text>
              <Text style={[lst.gucYazi, { marginLeft: 5 }]}>{ilerleme.guc.hamle3 || 0}</Text>
            </View>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Oyna, seviye ${siradaki}`}
          onPress={() => sec(siradaki)}
          style={({ pressed }) => [st.dugme, st.dugmeBuyuk, { marginTop: 8, marginBottom: 18 }, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <Text style={[st.dugmeYazi, { fontSize: 22 }]}>Oyna · Seviye {siradaki}</Text>
        </Pressable>

        {BOLUMLER.map((b) => (
          <View key={b.ad} style={{ alignItems: 'center', marginBottom: 10 }}>
            <View style={[lst.bolum, { backgroundColor: b.renk }]}>
              <Text style={lst.bolumYazi} accessibilityRole="header">
                {b.ad}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: (boy + 12) * sutun }}>
              {SEVIYELER.filter((s) => s.no >= b.ilk && s.no <= b.son).map((s) => (
                <SeviyeDugmesi key={s.no} s={s} boy={boy} acik={s.no <= ilerleme.acik} yildiz={(ilerleme.yildiz || {})[s.no] || 0} siradaki={s.no === siradaki} sec={sec} />
              ))}
            </View>
          </View>
        ))}
        <Text style={lst.yakinda}>Yeni seviyeler yakında</Text>
      </ScrollView>
    </View>
  );
}

function SeviyeDugmesi({ s, boy, acik, yildiz, siradaki, sec }) {
  const n = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!siradaki) return;
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(n, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(n, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => d.stop();
  }, [siradaki]);
  const etiket = acik ? `Seviye ${s.no}${yildiz ? `, ${yildiz} yıldız` : siradaki ? ', sıradaki' : ''}` : `Seviye ${s.no}, kilitli`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ disabled: !acik }}
      disabled={!acik}
      onPress={() => sec(s.no)}
      style={{ alignItems: 'center', margin: 6, width: boy }}
    >
      <Animated.View
        style={[
          lst.daire,
          { width: boy, height: boy, borderRadius: boy / 2 },
          !acik && lst.kilitli,
          siradaki && lst.siradaki,
          { transform: [{ scale: n.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] },
        ]}
      >
        <Text style={[lst.no, { fontSize: boy * 0.4 }, !acik && { color: '#9aa9b6' }]}>{acik ? s.no : '🔒'}</Text>
      </Animated.View>
      <View style={{ flexDirection: 'row', marginTop: 2 }}>
        {[0, 1, 2].map((i) => (
          <Yildiz key={i} dolu={i < yildiz} boy={16} />
        ))}
      </View>
    </Pressable>
  );
}

const lst = {
  ayar: { position: 'absolute', left: 14, zIndex: 5, width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#3a6a8a', shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  gucSatir: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, paddingVertical: 5, paddingHorizontal: 8, marginTop: 8 },
  gucYazi: { fontSize: 17, fontWeight: '900', color: '#24384a', marginHorizontal: 9 },
  baslik: { fontSize: 32, fontWeight: '900', color: '#24384a', textShadowColor: '#ffffff', textShadowRadius: 6, textShadowOffset: { width: 0, height: 0 } },
  yildizSatir: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  yildizSayi: { fontSize: 17, fontWeight: '900', color: '#24384a', marginLeft: 6 },
  daire: {
    backgroundColor: '#ff9a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    borderBottomWidth: 6,
    borderBottomColor: '#d4561c',
    shadowColor: '#2c5d7c',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  kilitli: { backgroundColor: '#dfe7ee', borderBottomColor: '#b9c6d2' },
  siradaki: { backgroundColor: '#ffcf1f', borderBottomColor: '#d49b00' },
  no: { color: '#ffffff', fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 2 } },
  bolum: { borderRadius: 18, paddingVertical: 6, paddingHorizontal: 18, marginTop: 6, marginBottom: 6, borderWidth: 3, borderColor: '#ffffff' },
  bolumYazi: { fontSize: 18, fontWeight: '900', color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
  yakinda: { marginTop: 18, fontSize: 15, fontWeight: '700', color: '#4d6a80' },
};
