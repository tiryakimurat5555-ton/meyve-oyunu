// Ana ekran: logo, büyük Oyna düğmesi ve altta üç yuvarlak düğme (Harita, Günlük ödül, Ayarlar).
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEVIYELER } from './seviyeler';
import { MEYVELER, Yildiz, st } from './gorsel';
import Sahne, { bolumNo, geceMi } from './sahne';
import { bolumBul } from './bolumler';
import { GucSimge, HaritaSimge, Sepet, YuvarlakZemin } from './arayuz';

const GUC_SEVIYE = 5;

// Logonun üstündeki meyveler sırayla hafifçe zıplar
function ZiplayanMeyve({ m, i, boy }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = Animated.loop(
      Animated.sequence([
        Animated.delay(i * 180),
        Animated.timing(a, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay((5 - i) * 180 + 1400),
      ])
    );
    d.start();
    return () => d.stop();
  }, []);
  return (
    <Animated.View style={{ marginHorizontal: 1, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -boy * 0.3] }) }] }}>
      <Image source={m.resim} style={{ width: boy, height: boy }} resizeMode="contain" />
    </Animated.View>
  );
}

export default function AnaEkran({ ilerleme, oyna, haritaAc, gunlukAc, ayarlarAc, gunlukVar }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const siradaki = Math.min(ilerleme.acik, SEVIYELER.length);
  const toplamYildiz = Object.values(ilerleme.yildiz || {}).reduce((a, b) => a + b, 0);
  const gece = geceMi(bolumNo(siradaki));
  const gucAcik = ilerleme.acik >= GUC_SEVIYE;
  const meyveBoy = Math.min(64, (Math.min(EG, 520) - 60) / 6);
  const dugmeBoy = Math.min(92, (Math.min(EG, 520) - 80) / 3.4);

  // Oyna düğmesi nefes alır gibi büyüyüp küçülür
  const nefes = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(nefes, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(nefes, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    d.start();
    return () => d.stop();
  }, []);

  // Günlük ödül düğmesindeki parlayan nokta
  const nokta = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!gunlukVar) return;
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(nokta, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(nokta, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => d.stop();
  }, [gunlukVar]);

  const yaziRengi = gece ? { color: '#ffffff' } : null;

  return (
    <View style={[st.kok, { justifyContent: 'flex-start' }]}>
      <Sahne bolum={bolumNo(siradaki)} EG={EG} EY={EY} gunesX={EG - 34} gunesY={ek.top + 20} gunesBoy={50} />

      {/* Üst bilgi: yıldız ve güçlendiriciler */}
      <View style={{ marginTop: ek.top + 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        <View style={ast.rozet} accessible accessibilityLabel={`Toplam ${toplamYildiz} yıldız`}>
          <Yildiz dolu boy={22} />
          <Text style={ast.rozetYazi}>
            {toplamYildiz} / {SEVIYELER.length * 3}
          </Text>
        </View>
        {gucAcik && (
          <View
            style={ast.rozet}
            accessible
            accessibilityLabel={`Güçlendiricilerin: ${ilerleme.guc.cekic || 0} çekiç, ${ilerleme.guc.karistir || 0} karıştır, ${ilerleme.guc.hamle3 || 0} artı 3 hamle`}
          >
            {['cekic', 'karistir', 'hamle3'].map((k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 5 }}>
                <GucSimge ad={k} boy={22} />
                <Text style={ast.rozetYazi}>{ilerleme.guc[k] || 0}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Logo (oyunun adı seçilince PNG logo gelecek) */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <View style={{ flexDirection: 'row', marginBottom: 6 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {MEYVELER.map((m, i) => (
            <ZiplayanMeyve key={m.ad} m={m} i={i} boy={meyveBoy} />
          ))}
        </View>
        <Text style={[ast.logo, gece && { color: '#ffffff', textShadowColor: '#1c2559' }]} accessibilityRole="header">
          Prism Orchard
        </Text>
        <Text style={[ast.bolum, yaziRengi]}>{bolumBul(siradaki).ad}</Text>

        <Animated.View style={{ marginTop: 22, transform: [{ scale: nefes.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Oyna, seviye ${siradaki}`}
            onPress={() => oyna(siradaki)}
            style={({ pressed }) => [st.dugme, ast.oyna, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <Text style={ast.oynaYazi}>Oyna</Text>
            <Text style={ast.oynaAlt}>Seviye {siradaki}</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Alttaki üç yuvarlak düğme: Harita, Günlük ödül (ortada), Ayarlar */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: ek.bottom + 28 }}>
        <AltDugme boy={dugmeBoy} yazi="Harita" etiket="Harita, bütün seviyeler" onPress={haritaAc} gece={gece}>
          <HaritaSimge boy={dugmeBoy * 0.62} />
        </AltDugme>
        <AltDugme
          boy={dugmeBoy * 1.15}
          yazi="Günlük ödül"
          etiket={!gucAcik ? `Günlük ödül, seviye ${GUC_SEVIYE}'te açılır` : gunlukVar ? 'Günlük ödül, bugünün ödülü hazır' : 'Günlük ödül, bugünkü alındı'}
          onPress={gucAcik ? gunlukAc : null}
          kilitli={!gucAcik}
          renk="#fff4cc"
          gece={gece}
        >
          <Sepet boy={dugmeBoy * 0.8} />
          {gunlukVar && (
            <Animated.View style={[ast.nokta, { transform: [{ scale: nokta.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }]}>
              <Text style={ast.noktaYazi}>!</Text>
            </Animated.View>
          )}
        </AltDugme>
        <AltDugme boy={dugmeBoy} yazi="Ayarlar" etiket="Ayarlar" onPress={ayarlarAc} gece={gece}>
          <Text style={{ fontSize: dugmeBoy * 0.42 }}>⚙️</Text>
        </AltDugme>
      </View>
    </View>
  );
}

function AltDugme({ boy, yazi, etiket, onPress, kilitli, renk, gece, children }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ disabled: !!kilitli }}
      onPress={onPress || undefined}
      style={({ pressed }) => [{ alignItems: 'center', marginHorizontal: 12 }, pressed && !kilitli && { transform: [{ scale: 0.93 }] }, kilitli && { opacity: 0.55 }]}
    >
      <YuvarlakZemin boy={boy} renk={renk}>
        {children}
        {kilitli && <Text style={{ position: 'absolute', right: -2, bottom: -2, fontSize: boy * 0.28 }}>🔒</Text>}
      </YuvarlakZemin>
      <Text style={[ast.altYazi, gece && { color: '#ffffff' }]} importantForAccessibility="no" accessibilityElementsHidden>
        {yazi}
      </Text>
    </Pressable>
  );
}

const ast = {
  rozet: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, margin: 4 },
  rozetYazi: { fontSize: 17, fontWeight: '900', color: '#24384a', marginLeft: 5 },
  logo: { fontSize: 40, fontWeight: '900', color: '#24384a', textShadowColor: '#ffffff', textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 }, textAlign: 'center' },
  bolum: { marginTop: 4, fontSize: 17, fontWeight: '800', color: '#3d5a70' },
  oyna: { paddingVertical: 14, paddingHorizontal: 64, borderRadius: 34, alignItems: 'center', borderBottomWidth: 6 },
  oynaYazi: { color: '#ffffff', fontSize: 32, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 2 } },
  oynaAlt: { color: '#fff4e0', fontSize: 16, fontWeight: '800', marginTop: -2 },
  altYazi: { marginTop: 6, fontSize: 15, fontWeight: '900', color: '#24384a', textShadowColor: '#ffffff', textShadowRadius: 4, textShadowOffset: { width: 0, height: 0 } },
  nokta: { position: 'absolute', right: -4, top: -4, width: 26, height: 26, borderRadius: 13, backgroundColor: '#ff3b4e', borderWidth: 3, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  noktaYazi: { color: '#ffffff', fontSize: 14, fontWeight: '900', lineHeight: 16 },
};
