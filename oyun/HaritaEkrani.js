// Harita: seviyeler kıvrılan bir patikanın üstünde taşlar halinde. Her bölüm kendi renginde bir bant; bölüm başında tabela.
// Açılınca sıradaki seviyeye kayar. VoiceOver: bölüm adları başlık, seviyeler sırayla ("Seviye 47, sıradaki").
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEVIYELER } from './seviyeler';
import { Yildiz, st } from './gorsel';
import { geceMi, gokRenk } from './sahne';
import { BOLUMLER } from './bolumler';
import { Tabela } from './arayuz';

const SATIR = 108;
// İki renk arasında karışım (bant renk geçişi)
function renkKaristir(a, b, t) {
  const c = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [c(a), c(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
} // iki taş arası dikey mesafe
const UST_BOSLUK = 96; // bant başında tabelaya ayrılan yer

export default function HaritaEkrani({ ilerleme, sec, geri }) {
  const ek = useSafeAreaInsets();
  const { width: EG, height: EY } = useWindowDimensions();
  const siradaki = Math.min(ilerleme.acik, SEVIYELER.length);
  const toplamYildiz = Object.values(ilerleme.yildiz || {}).reduce((a, b) => a + b, 0);
  const genislik = Math.min(EG, 520);
  const tas = Math.min(68, genislik / 6);
  const genlik = genislik * 0.3;
  const kayma = useRef(null);

  // Her bölümün bant yüksekliği ve taşların konumu
  const bantlar = useMemo(
    () =>
      BOLUMLER.filter((b) => SEVIYELER.some((s) => s.no >= b.ilk && s.no <= b.son)).map((b, bi) => {
        const nolar = SEVIYELER.filter((s) => s.no >= b.ilk && s.no <= b.son).map((s) => s.no);
        const yerler = nolar.map((no, i) => ({ no, x: genislik / 2 + genlik * Math.sin(((no - 1) * Math.PI) / 3), y: UST_BOSLUK + i * SATIR }));
        return { b, bi, yerler, yukseklik: UST_BOSLUK + nolar.length * SATIR };
      }),
    [genislik]
  );
  const ustBaslik = ek.top + 62;

  // Açılınca sıradaki seviyeye kay (içerik ölçülünce bir kez)
  const kaydi = useRef(false);
  const siradakineKay = () => {
    if (kaydi.current || !kayma.current) return;
    kaydi.current = true;
    let y = 0;
    for (const bt of bantlar) {
      const yer = bt.yerler.find((p) => p.no === siradaki);
      if (yer) {
        y += yer.y;
        break;
      }
      y += bt.yukseklik;
    }
    kayma.current.scrollTo({ y: Math.max(0, y - (EY - ustBaslik) / 2), animated: false });
  };
  useEffect(() => {
    const t = setTimeout(siradakineKay, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={[st.kok, { justifyContent: 'flex-start', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }]}>
      <ScrollView ref={kayma} onContentSizeChange={() => setTimeout(siradakineKay, 30)} style={{ width: '100%', flex: 1 }} contentContainerStyle={{ paddingTop: ustBaslik, paddingBottom: ek.bottom + 40, alignItems: 'center' }}>
        {bantlar.map((bt) => (
          <Bant key={bt.b.ad} bt={bt} genislik={genislik} EG={EG} tas={tas} ilerleme={ilerleme} siradaki={siradaki} sec={sec} />
        ))}
        <Text style={hst.yakinda}>Yeni seviyeler yakında</Text>
      </ScrollView>

      {/* Üst çubuk: geri, başlık, yıldız */}
      <View style={[hst.ust, { paddingTop: ek.top + 8, height: ustBaslik }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Geri, ana ekran" onPress={geri} hitSlop={10} style={({ pressed }) => [hst.geri, pressed && { opacity: 0.6 }]}>
          <Text style={hst.geriYazi}>‹ Geri</Text>
        </Pressable>
        <Text style={hst.baslik} accessibilityRole="header">
          Harita
        </Text>
        <View style={hst.yildiz} accessible accessibilityLabel={`Toplam ${toplamYildiz} yıldız`}>
          <Yildiz dolu boy={18} />
          <Text style={hst.yildizYazi}>{toplamYildiz}</Text>
        </View>
      </View>
    </View>
  );
}

function Bant({ bt, genislik, EG, tas, ilerleme, siradaki, sec }) {
  const [g1, g2] = gokRenk(bt.bi);
  const gece = geceMi(bt.bi);
  // Patika: ardışık taşlar arasında noktalar
  const noktalar = [];
  for (let i = 0; i < bt.yerler.length - 1; i++) {
    const a = bt.yerler[i];
    const b = bt.yerler[i + 1];
    for (const t of [0.3, 0.5, 0.7]) noktalar.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, acik: b.no <= ilerleme.acik });
  }
  return (
    <View style={{ width: EG, height: bt.yukseklik, backgroundColor: g1, alignItems: 'center' }}>
      {Array.from({ length: 23 }, (_, k) => k + 1).map((i) => (
        <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: (bt.yukseklik * i) / 24, height: bt.yukseklik / 24 + 1, backgroundColor: renkKaristir(g1, g2, i / 23) }} />
      ))}
      <View style={{ width: genislik, height: bt.yukseklik }}>
        <View style={{ position: 'absolute', top: 14, left: 0, right: 0, alignItems: 'center' }} accessible accessibilityRole="header" accessibilityLabel={`${bt.b.ad}, seviye ${bt.b.ilk} ile ${bt.b.son} arası`}>
          <Tabela ad={bt.b.ad} renk={bt.b.renk} />
        </View>
        {noktalar.map((n, i) => (
          <View key={i} style={{ position: 'absolute', left: n.x - 6, top: n.y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: n.acik ? '#fff4d0' : 'rgba(255,255,255,0.45)', borderWidth: 2, borderColor: n.acik ? '#e0a040' : 'rgba(120,140,160,0.4)' }} />
        ))}
        {bt.yerler.map((p) => (
          <Tas key={p.no} p={p} tas={tas} acik={p.no <= ilerleme.acik} yildiz={(ilerleme.yildiz || {})[p.no] || 0} siradaki={p.no === siradaki} sec={sec} gece={gece} />
        ))}
      </View>
    </View>
  );
}

function Tas({ p, tas, acik, yildiz, siradaki, sec, gece }) {
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
  const etiket = acik ? `Seviye ${p.no}${yildiz ? `, ${yildiz} yıldız` : siradaki ? ', sıradaki' : ''}` : `Seviye ${p.no}, kilitli`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ disabled: !acik }}
      disabled={!acik}
      onPress={() => sec(p.no)}
      style={{ position: 'absolute', left: p.x - tas / 2 - 10, top: p.y - tas / 2, width: tas + 20, alignItems: 'center' }}
    >
      <Animated.View
        style={[
          hst.tas,
          { width: tas, height: tas, borderRadius: tas / 2 },
          !acik && hst.kilitli,
          siradaki && hst.siradaki,
          { transform: [{ scale: n.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] },
        ]}
      >
        <Text style={[hst.no, { fontSize: tas * 0.38 }, !acik && { color: '#9aa9b6' }]}>{acik ? p.no : '🔒'}</Text>
      </Animated.View>
      {acik && (
        <View style={{ flexDirection: 'row', marginTop: 1 }}>
          {[0, 1, 2].map((i) => (
            <Yildiz key={i} dolu={i < yildiz} boy={15} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const hst = {
  ust: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderBottomWidth: 2, borderBottomColor: '#e6d2a8' },
  geri: { backgroundColor: '#fff4dc', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 2, borderColor: '#e6c48a' },
  geriYazi: { fontSize: 17, fontWeight: '900', color: '#24384a' },
  baslik: { fontSize: 24, fontWeight: '900', color: '#24384a' },
  yildiz: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff4dc', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: '#e6c48a' },
  yildizYazi: { fontSize: 17, fontWeight: '900', color: '#24384a', marginLeft: 4 },
  tas: {
    backgroundColor: '#ff9a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    borderBottomWidth: 6,
    borderBottomColor: '#d4561c',
    shadowColor: '#2c5d7c',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  kilitli: { backgroundColor: '#dfe7ee', borderBottomColor: '#b9c6d2' },
  siradaki: { backgroundColor: '#ffcf1f', borderBottomColor: '#d49b00' },
  no: { color: '#ffffff', fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 2 } },
  yakinda: { marginTop: 18, fontSize: 15, fontWeight: '700', color: '#4d6a80' },
};
