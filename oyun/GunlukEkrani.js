// Günlük ödül sayfası: rafta 7 hasır sepet (7. gün hazine sandığı). Bugünün sepeti parlar; "Aç" ile ödül fırlar.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { st } from './gorsel';
import Sahne, { bolumNo, geceMi } from './sahne';
import { GUNLUK_ODUL, odulMetni } from './Paneller';
import { GucSimge, Raf, Sandik, Sepet } from './arayuz';

const AD = { cekic: 'çekiç', karistir: 'karıştır', hamle3: 'artı 3 hamle' };

// durum: { gun: bugünün (ya da bugün alınan) günü 1-7, alinabilir: bugün henüz alınmadıysa true }
export default function GunlukEkrani({ durum, guc, siradaki, al, geri }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const gece = geceMi(bolumNo(siradaki));
  const [acildi, setAcildi] = useState(!durum.alinabilir);
  const [ucanlar, setUcanlar] = useState([]);
  const genislik = Math.min(EG - 24, 460);
  const sepetBoy = Math.min(96, (genislik - 30) / 3 - 14);
  const gunIdx = durum.gun - 1;

  // Bugünün sepeti zıplar
  const zipla = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (acildi) return;
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(zipla, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(zipla, { toValue: 0, duration: 320, easing: Easing.bounce, useNativeDriver: true }),
        Animated.delay(700),
      ])
    );
    d.start();
    return () => d.stop();
  }, [acildi]);

  const yarin = GUNLUK_ODUL[durum.gun % 7];
  const yarinMetni = durum.gun === 7 ? 'Tebrikler! Yarın yeni hafta 1. günle başlıyor.' : `Yarın gel: ${durum.gun + 1}. gün, ${odulMetni(yarin)}`;

  const ac = () => {
    if (acildi) return;
    const odul = GUNLUK_ODUL[gunIdx];
    setAcildi(true);
    // Ödül simgeleri sepetten fırlayıp üstteki sayaca uçar
    const l = [];
    let k = 0;
    for (const [ad, n] of Object.entries(odul))
      for (let i = 0; i < n; i++) l.push({ id: `${ad}${i}`, ad, a: new Animated.Value(0), gecikme: k++ * 120, x: (k % 3) - 1 });
    setUcanlar(l);
    Animated.parallel(l.map((u) => Animated.sequence([Animated.delay(u.gecikme), Animated.timing(u.a, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]))).start(() =>
      setUcanlar([])
    );
    al();
    const sonra = Object.entries(odul).map(([ad, n]) => `${(guc[ad] || 0) + n} ${AD[ad]}`).join(', ');
    setTimeout(() => AccessibilityInfo.announceForAccessibility(`Sepet açıldı, ${odulMetni(odul)} kazandın. Artık ${sonra} var. ${yarinMetni}`), 400);
  };

  const gunDurumu = (i) => {
    if (i < gunIdx) return 'alindi';
    if (i === gunIdx) return acildi ? 'alindi' : 'bugun';
    return 'gelecek';
  };

  const GunKutusu = ({ i, sandik }) => {
    const d = gunDurumu(i);
    const o = GUNLUK_ODUL[i];
    const etiket = `${i + 1}. gün, ${d === 'bugun' ? 'bugün, açılmadı' : d === 'alindi' ? 'alındı' : 'henüz gelmedi'}, ${odulMetni(o)}`;
    const Ciz = sandik ? Sandik : Sepet;
    const boy = sandik ? sepetBoy * 1.5 : sepetBoy;
    const ic = <Ciz boy={boy} acik={d === 'alindi'} parlak={d === 'bugun'} />;
    return (
      <View style={{ alignItems: 'center', marginHorizontal: 7 }} accessible accessibilityLabel={etiket}>
        <Text style={[gst.gunNo, d === 'bugun' && gst.gunBugun, gece && { color: '#ffffff' }]}>{i + 1}. gün</Text>
        {d === 'bugun' ? <Animated.View style={{ transform: [{ translateY: zipla.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>{ic}</Animated.View> : ic}
        <View style={[gst.odul, d === 'alindi' && { opacity: 0.5 }]}>
          {Object.entries(o).map(([ad, n]) => (
            <View key={ad} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 2 }}>
              <GucSimge ad={ad} boy={18} />
              {n > 1 && <Text style={gst.carpi}>×{n}</Text>}
            </View>
          ))}
          {d === 'alindi' && <Text style={gst.tik}>✓</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={[st.kok, { justifyContent: 'flex-start' }]}>
      <Sahne bolum={bolumNo(siradaki)} EG={EG} EY={EY} gunesX={EG - 34} gunesY={ek.top + 20} gunesBoy={50} />
      <View style={{ width: '100%', paddingTop: ek.top + 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Geri, ana ekran" onPress={geri} hitSlop={10} style={({ pressed }) => [gst.geri, pressed && { opacity: 0.6 }]}>
          <Text style={gst.geriYazi}>‹ Geri</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: ek.bottom + 30 }} style={{ width: '100%' }}>
        <Text style={[gst.baslik, gece && { color: '#ffffff', textShadowColor: '#1c2559' }]} accessibilityRole="header">
          Günlük Ödül
        </Text>
        {/* Güçlendirici sayacı: uçan ödüller buraya gider */}
        <View style={gst.sayac} accessible accessibilityLabel={`Güçlendiricilerin: ${guc.cekic || 0} çekiç, ${guc.karistir || 0} karıştır, ${guc.hamle3 || 0} artı 3 hamle`}>
          {['cekic', 'karistir', 'hamle3'].map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 7 }}>
              <GucSimge ad={k} boy={24} />
              <Text style={gst.sayacYazi}>{guc[k] || 0}</Text>
            </View>
          ))}
        </View>

        <View style={[gst.dolap, { width: genislik }]}>
          {[[0, 1, 2], [3, 4, 5]].map((sira, s) => (
            <View key={s} style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                {sira.map((i) => (
                  <GunKutusu key={i} i={i} />
                ))}
              </View>
              <Raf genislik={genislik - 28} />
            </View>
          ))}
          <View style={{ alignItems: 'center' }}>
            <GunKutusu i={6} sandik />
            <Raf genislik={genislik * 0.6} />
          </View>
        </View>

        {acildi ? (
          <View style={gst.not} accessible accessibilityLabel={(durum.alinabilir ? '' : 'Bugünün ödülü alındı. ') + yarinMetni}>
            {!durum.alinabilir && <Text style={gst.notYazi}>Bugünün ödülü alındı.</Text>}
            <Text style={gst.notYazi}>{yarinMetni}</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Aç, ${durum.gun}. günün sepeti`}
            onPress={ac}
            style={({ pressed }) => [st.dugme, st.dugmeBuyuk, gst.ac, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <Text style={[st.dugmeYazi, { fontSize: 24 }]}>Aç</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Uçan ödüller (ekranın ortasından üstteki sayaca) */}
      {ucanlar.map((u) => (
        <Animated.View
          key={u.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: EG / 2 - 22 + u.x * 40,
            top: EY * 0.5,
            opacity: u.a.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: u.a.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, -EY * 0.12, -EY * 0.5 + ek.top + 90] }) },
              { scale: u.a.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.8, 0.8] }) },
              { rotate: u.a.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
            ],
          }}
        >
          <View style={gst.ucan}>
            <GucSimge ad={u.ad} boy={30} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const gst = {
  geri: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 14 },
  geriYazi: { fontSize: 17, fontWeight: '900', color: '#24384a' },
  baslik: { marginTop: 4, fontSize: 32, fontWeight: '900', color: '#24384a', textShadowColor: '#ffffff', textShadowRadius: 6, textShadowOffset: { width: 0, height: 0 } },
  sayac: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10, marginTop: 8, marginBottom: 12 },
  sayacYazi: { fontSize: 19, fontWeight: '900', color: '#24384a', marginLeft: 4 },
  dolap: { backgroundColor: 'rgba(255,248,232,0.82)', borderRadius: 24, borderWidth: 3, borderColor: '#e0b070', paddingTop: 12, paddingBottom: 8, alignItems: 'center' },
  gunNo: { fontSize: 14, fontWeight: '900', color: '#6a5030', marginBottom: 2 },
  gunBugun: { color: '#e67e00', fontSize: 16 },
  odul: { flexDirection: 'row', alignItems: 'center', marginTop: 2, minHeight: 22 },
  carpi: { fontSize: 13, fontWeight: '900', color: '#24384a' },
  tik: { marginLeft: 3, fontSize: 15, fontWeight: '900', color: '#2fae4f' },
  ac: { backgroundColor: '#2fae4f', borderBottomColor: '#1f8a3a', paddingHorizontal: 70 },
  not: { marginTop: 18, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 18, maxWidth: 360 },
  notYazi: { fontSize: 17, fontWeight: '800', color: '#24384a', textAlign: 'center' },
  ucan: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', borderWidth: 3, borderColor: '#ffcf3a', alignItems: 'center', justifyContent: 'center' },
};
