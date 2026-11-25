// Seviye listesi: açık seviyeler, yıldızlar, kilitler. Resimli bahçe haritası resim aşamasında gelecek.
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEVIYELER } from './seviyeler';
import { MEYVELER, Yildiz, st } from './gorsel';

export default function ListeEkrani({ ilerleme, sec }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const sutun = 4;
  const boy = Math.min(84, (Math.min(EG, 520) - 40) / sutun - 12);
  const siradaki = Math.min(ilerleme.acik, SEVIYELER.length);
  const toplamYildiz = Object.values(ilerleme.yildiz || {}).reduce((a, b) => a + b, 0);

  return (
    <View style={[st.kok, { justifyContent: 'flex-start' }]}>
      <View style={st.tepe} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={[st.tepe2, { left: -EG * 0.3, width: EG * 1.6, height: EG * 0.9, borderRadius: EG * 0.8, top: EY - EG * 0.32 }]} />
      </View>
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Oyna, seviye ${siradaki}`}
          onPress={() => sec(siradaki)}
          style={({ pressed }) => [st.dugme, st.dugmeBuyuk, { marginTop: 8, marginBottom: 18 }, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <Text style={[st.dugmeYazi, { fontSize: 22 }]}>Oyna · Seviye {siradaki}</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: (boy + 12) * sutun }}>
          {SEVIYELER.map((s) => (
            <SeviyeDugmesi key={s.no} s={s} boy={boy} acik={s.no <= ilerleme.acik} yildiz={(ilerleme.yildiz || {})[s.no] || 0} siradaki={s.no === siradaki} sec={sec} />
          ))}
        </View>
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
  yakinda: { marginTop: 18, fontSize: 15, fontWeight: '700', color: '#4d6a80' },
};
