// Görsel parçalar: meyveler, özel parça görünümleri, efektler, kutular, kartlar.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

export const TOHUM_TUR = 21; // mantik.js TOHUM ile aynı
export const FICI_TUR = 22; // mantik.js FICI
export const FICI_ODUL_TUR = 23; // mantik.js FICI_ODUL

export const MEYVELER = [
  { ad: 'cilek', koyu: '#a3122a', isim: 'Çilek', renk: '#ff3b4e', resim: require('../assets/meyve/cilek.png') },
  { ad: 'limon', koyu: '#b98a00', isim: 'Limon', renk: '#ffd21f', resim: require('../assets/meyve/limon.png') },
  { ad: 'uzum', koyu: '#5a1fa8', isim: 'Üzüm', renk: '#a24dff', resim: require('../assets/meyve/uzum.png') },
  { ad: 'portakal', koyu: '#b8540a', isim: 'Portakal', renk: '#ff8a1f', resim: require('../assets/meyve/portakal.png') },
  { ad: 'elma', koyu: '#3f7d0f', isim: 'Elma', renk: '#7ed321', resim: require('../assets/meyve/elma.png') },
  { ad: 'erik', koyu: '#1c2f8a', isim: 'Erik', renk: '#4263eb', resim: require('../assets/meyve/erik.png') },
];

// Tüm alanı kaplayan katman. StyleSheet.absoluteFillObject bu React Native sürümünde yok (telefonda boş geliyordu).
export const TAM = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };

const DONGU = (deger, sure) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(deger, { toValue: 1, duration: sure, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(deger, { toValue: 0, duration: sure, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])
  );

// ---------- Özel parça görünümleri (kodla; ileride resimle değişebilir) ----------
// Çizgili: meyvenin üstünde parlayan üç çizgi ve iki uçta ok
export function Cizgiler({ H, yon, renk }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = DONGU(a, 500);
    d.start();
    return () => d.stop();
  }, []);
  const yatay = yon === 'satir';
  const uz = H * 0.78;
  const ka = H * 0.07;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ ...TAM, alignItems: 'center', justifyContent: 'center', opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }), transform: [{ rotate: yatay ? '0deg' : '90deg' }] }}
    >
      {[-1, 0, 1].map((k) => (
        <View
          key={k}
          style={{
            position: 'absolute',
            width: uz,
            height: ka,
            borderRadius: ka,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: renk,
            transform: [{ translateY: k * H * 0.16 }],
          }}
        />
      ))}
      {[-1, 1].map((k) => (
        <View
          key={'o' + k}
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderTopWidth: H * 0.09,
            borderBottomWidth: H * 0.09,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            [k < 0 ? 'borderRightWidth' : 'borderLeftWidth']: H * 0.12,
            [k < 0 ? 'borderRightColor' : 'borderLeftColor']: '#ffffff',
            transform: [{ translateX: k * H * 0.44 }],
          }}
        />
      ))}
    </Animated.View>
  );
}

// Bomba: meyvenin arkasında nabız gibi atan renkli hale ve dönen kesikli halka
export function BombaHale({ H, renk }) {
  const a = useRef(new Animated.Value(0)).current;
  const d = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const n = DONGU(a, 380);
    const r = Animated.loop(Animated.timing(d, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }));
    n.start();
    r.start();
    return () => {
      n.stop();
      r.stop();
    };
  }, []);
  const b = H * 0.98;
  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          width: b,
          height: b,
          borderRadius: b / 2,
          backgroundColor: renk,
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.9] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.06] }) }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: b,
          height: b,
          borderRadius: b / 2,
          borderWidth: 3.5,
          borderStyle: 'dashed',
          borderColor: '#ffffff',
          transform: [{ rotate: d.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: H * 0.02,
          right: H * 0.08,
          width: H * 0.24,
          height: H * 0.24,
          borderRadius: H,
          backgroundColor: '#fff3a0',
          borderWidth: 2,
          borderColor: '#ff9d00',
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }],
          zIndex: 2,
        }}
      />
    </>
  );
}

// Gökkuşağı: beyaz parlak çekirdeğin çevresinde dönen altı renkli boncuk
export function GokkusagiKure({ H }) {
  const d = useRef(new Animated.Value(0)).current;
  const n = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const r = Animated.loop(Animated.timing(d, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }));
    const p = DONGU(n, 450);
    r.start();
    p.start();
    return () => {
      r.stop();
      p.stop();
    };
  }, []);
  const b = H * 0.86;
  const bon = H * 0.24;
  return (
    <View style={{ width: b, height: b, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: b * 0.62,
          height: b * 0.62,
          borderRadius: b,
          backgroundColor: '#fffdf0',
          borderWidth: 3,
          borderColor: '#ffe066',
          transform: [{ scale: n.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }],
        }}
      />
      <Animated.View style={{ position: 'absolute', width: b, height: b, transform: [{ rotate: d.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        {MEYVELER.map((m, i) => {
          const aci = (i / 6) * Math.PI * 2;
          return (
            <View
              key={m.ad}
              style={{
                position: 'absolute',
                left: b / 2 - bon / 2 + Math.cos(aci) * (b / 2 - bon / 2),
                top: b / 2 - bon / 2 + Math.sin(aci) * (b / 2 - bon / 2),
                width: bon,
                height: bon,
                borderRadius: bon,
                backgroundColor: m.renk,
                borderWidth: 1.5,
                borderColor: '#ffffff',
              }}
            >
              <View style={{ position: 'absolute', left: bon * 0.2, top: bon * 0.15, width: bon * 0.32, height: bon * 0.32, borderRadius: bon, backgroundColor: 'rgba(255,255,255,0.85)' }} />
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

// ---------- Özel parça efektleri ----------
// Işın: satır ya da sütun boyunca parlayan çizgi (ortadan iki yana açılır)
export function Isin({ e, H, N, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const yatay = e.yon === 'satir';
  const boy = H * N;
  const kalin = H * 0.62;
  const kutu = yatay ? { left: 0, top: e.r * H + H / 2 - kalin / 2, width: boy, height: kalin } : { top: 0, left: e.c * H + H / 2 - kalin / 2, height: boy, width: kalin };
  const ac = t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.05, 1, 1] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        ...kutu,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1, 0] }),
        transform: [yatay ? { scaleX: ac } : { scaleY: ac }],
      }}
    >
      <View style={{ position: 'absolute', ...(yatay ? { width: '100%', height: '100%' } : { width: '100%', height: '100%' }), borderRadius: kalin, backgroundColor: e.renk, opacity: 0.55 }} />
      <View style={{ position: 'absolute', ...(yatay ? { width: '100%', height: '38%' } : { width: '38%', height: '100%' }), borderRadius: kalin, backgroundColor: '#ffffff' }} />
    </Animated.View>
  );
}

// Dalga: bomba patlamasında genişleyen dolu ışık ve halka (yaricap: hücre cinsinden)
export function Dalga({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const b = H * (e.yaricap * 2 + 1);
  const cx = e.c * H + H / 2;
  const cy = e.r * H + H / 2;
  const daire = { position: 'absolute', left: cx - b / 2, top: cy - b / 2, width: b, height: b, borderRadius: b / 2 };
  return (
    <>
      <Animated.View
        style={[
          daire,
          {
            backgroundColor: '#fff7d6',
            opacity: t.interpolate({ inputRange: [0, 0.15, 0.6], outputRange: [0.9, 0.75, 0], extrapolate: 'clamp' }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 0.4], outputRange: [0.2, 1], extrapolate: 'clamp' }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          daire,
          {
            borderWidth: 6,
            borderColor: e.renk || '#ffb800',
            opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.25] }) }],
          },
        ]}
      />
    </>
  );
}

// Gökkuşağı ışınları: merkezden hedef hücrelere uzanan renkli ışık çizgileri
export function GokkusagiIsinlari({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const x0 = e.c * H + H / 2;
  const y0 = e.r * H + H / 2;
  return (
    <>
      {e.hedefler.map(([r, c], i) => {
        const x1 = c * H + H / 2;
        const y1 = r * H + H / 2;
        const uz = Math.hypot(x1 - x0, y1 - y0);
        if (uz < 1) return null;
        const aci = Math.atan2(y1 - y0, x1 - x0);
        const kalin = H * 0.12;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: (x0 + x1) / 2 - uz / 2,
              top: (y0 + y1) / 2 - kalin / 2,
              width: uz,
              height: kalin,
              borderRadius: kalin,
              backgroundColor: MEYVELER[i % 6].renk,
              borderWidth: 1,
              borderColor: '#ffffff',
              opacity: t.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 1, 1, 0] }),
              transform: [{ rotate: aci + 'rad' }, { scaleX: t.interpolate({ inputRange: [0, 0.35], outputRange: [0, 1], extrapolate: 'clamp' }) }],
            }}
          />
        );
      })}
    </>
  );
}

// Dönüşüm parıltısı: bir meyve özel parçaya dönüşürken çıkan yıldız
export function Donusum({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const b = H * 1.3;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: e.c * H + H / 2 - b / 2,
        top: e.r * H + H / 2 - b / 2,
        width: b,
        height: b,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
        transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }, { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.1, 0.8] }) }],
      }}
    >
      <View style={{ position: 'absolute', width: b, height: b * 0.12, borderRadius: b, backgroundColor: '#ffffff' }} />
      <View style={{ position: 'absolute', width: b * 0.12, height: b, borderRadius: b, backgroundColor: '#ffffff' }} />
      <View style={{ position: 'absolute', width: b * 0.4, height: b * 0.4, borderRadius: b, backgroundColor: 'rgba(255,240,150,0.9)' }} />
    </Animated.View>
  );
}

// ---------- Engeller (kodla; ileride resimle değişebilir) ----------
// Buz: meyvenin üstünde yarı saydam mavi kristal katman ve parlama çizgileri
export function BuzKatman({ H }) {
  const b = H * 0.94;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: (H - b) / 2, top: (H - b) / 2, width: b, height: b, borderRadius: H * 0.2, overflow: 'hidden' }}>
      <View style={{ ...TAM, backgroundColor: 'rgba(175,222,255,0.38)', borderRadius: H * 0.2, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)' }} />
      <View style={{ position: 'absolute', left: b * 0.12, top: -b * 0.1, width: b * 0.14, height: b * 0.8, backgroundColor: 'rgba(255,255,255,0.75)', transform: [{ rotate: '35deg' }] }} />
      <View style={{ position: 'absolute', left: b * 0.38, top: -b * 0.05, width: b * 0.06, height: b * 0.7, backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ rotate: '35deg' }] }} />
      <View style={{ position: 'absolute', right: b * 0.1, bottom: b * 0.1, width: b * 0.16, height: b * 0.16, borderRadius: b, backgroundColor: 'rgba(255,255,255,0.8)' }} />
    </View>
  );
}

// Sarmaşık: meyvenin üstünden çapraz geçen iki yeşil dal, üzerinde yapraklar (meyvenin yüzü görünür kalır)
function Yaprakci({ x, y, boy, aci, renk }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x - boy / 2,
        top: y - boy * 0.3,
        width: boy,
        height: boy * 0.6,
        backgroundColor: renk,
        borderTopLeftRadius: boy * 0.6,
        borderBottomRightRadius: boy * 0.6,
        borderTopRightRadius: 2,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#1f6b1a',
        transform: [{ rotate: `${aci}deg` }],
      }}
    />
  );
}
// Sis (Gece Bahçesi): altındaki meyveyi tamamen örten yumuşak, mor-gri bulut; ortada hafif sarmal ve iki küçük yıldız parıltısı
export function SisKatman({ H }) {
  const b = H * 0.96;
  const puf = (x, y, r, renk) => <View style={{ position: 'absolute', left: b * x - r, top: b * y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: renk }} />;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: (H - b) / 2, top: (H - b) / 2, width: b, height: b, borderRadius: H * 0.22, overflow: 'hidden', backgroundColor: '#b9bfdc', borderWidth: 2, borderColor: '#e6e9f8' }}>
      {puf(0.2, 0.3, b * 0.28, '#c9cee7')}
      {puf(0.75, 0.25, b * 0.3, '#d3d7ee')}
      {puf(0.3, 0.8, b * 0.32, '#d0d4ec')}
      {puf(0.82, 0.78, b * 0.26, '#c5cae5')}
      {puf(0.52, 0.52, b * 0.3, '#dde0f3')}
      <View style={{ position: 'absolute', left: b * 0.3, top: b * 0.36, width: b * 0.4, height: b * 0.28, borderRadius: b, borderWidth: 2.5, borderColor: 'rgba(150,158,200,0.7)', borderBottomColor: 'transparent' }} />
      <Text style={{ position: 'absolute', left: b * 0.12, top: b * 0.06, fontSize: b * 0.2, lineHeight: b * 0.26, color: '#ffffff' }}>✦</Text>
      <Text style={{ position: 'absolute', left: b * 0.7, top: b * 0.62, fontSize: b * 0.15, lineHeight: b * 0.2, color: '#ffffff' }}>✦</Text>
    </View>
  );
}
export function SisIkon({ boy = 26 }) {
  return (
    <View style={{ width: boy, height: boy }}>
      <SisKatman H={boy / 0.96} />
    </View>
  );
}

export function SarmasikKatman({ H }) {
  const b = H * 0.96;
  const dal = (aci, ust) => (
    <View style={{ position: 'absolute', left: -b * 0.1, top: ust, width: b * 1.2, height: H * 0.075, borderRadius: H, backgroundColor: '#2f8a28', borderWidth: 1, borderColor: '#1f5f19', transform: [{ rotate: `${aci}deg` }] }} />
  );
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: (H - b) / 2, top: (H - b) / 2, width: b, height: b, borderRadius: H * 0.2, overflow: 'hidden', borderWidth: 2.5, borderColor: 'rgba(47,138,40,0.85)' }}>
      {dal(40, b * 0.46)}
      {dal(-40, b * 0.46)}
      <Yaprakci x={b * 0.2} y={b * 0.2} boy={H * 0.26} aci={-30} renk="#4fbf3a" />
      <Yaprakci x={b * 0.8} y={b * 0.22} boy={H * 0.24} aci={200} renk="#5fd14a" />
      <Yaprakci x={b * 0.2} y={b * 0.8} boy={H * 0.24} aci={30} renk="#5fd14a" />
      <Yaprakci x={b * 0.8} y={b * 0.8} boy={H * 0.26} aci={150} renk="#4fbf3a" />
      <Yaprakci x={b * 0.5} y={b * 0.92} boy={H * 0.2} aci={90} renk="#6ad957" />
    </View>
  );
}

// Tahta kasa: tahta kutu, iki yatay tahta çizgisi, köşe çivileri; iki katlıda iki metal kuşak
export function Kasa({ H, kat }) {
  const b = H * 0.9;
  const civi = H * 0.08;
  return (
    <View style={{ width: b, height: b, borderRadius: H * 0.12, backgroundColor: '#cf8f48', borderWidth: 3, borderColor: '#7a4a1c', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: b * 0.31, height: 2.5, backgroundColor: '#8f5a24' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: b * 0.62, height: 2.5, backgroundColor: '#8f5a24' }} />
      <View style={{ position: 'absolute', left: b * 0.06, right: b * 0.06, top: b * 0.08, height: b * 0.1, borderRadius: 4, backgroundColor: 'rgba(255,230,180,0.45)' }} />
      {[
        [0.1, 0.1],
        [0.1, 0.78],
        [0.78, 0.1],
        [0.78, 0.78],
      ].map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: b * x, top: b * y, width: civi, height: civi, borderRadius: civi, backgroundColor: '#5b3a17' }} />
      ))}
      {kat >= 2 &&
        [0.22, 0.66].map((x) => (
          <View key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: b * x, width: b * 0.12, backgroundColor: '#a9b4bd', borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: '#5f6b75' }}>
            <View style={{ position: 'absolute', top: b * 0.42, left: b * 0.025, width: b * 0.07, height: b * 0.07, borderRadius: b, backgroundColor: '#5f6b75' }} />
          </View>
        ))}
    </View>
  );
}

// Fıçı (Bağ Bozumu): yanları yuvarlak ahşap fıçı, dikey tahta çıtalar, iki metal çember.
// Kat azaldıkça çatlaklar belirir; ödüllü fıçının önünde altın yıldızlı bir mühür var.
export function Fici({ H, kat = 3, odul = false }) {
  const b = H * 0.9;
  const catlak = (x, y, a, u) => <View style={{ position: 'absolute', left: b * x, top: b * y, width: b * u, height: 2.5, borderRadius: 2, backgroundColor: '#3d2208', transform: [{ rotate: a + 'deg' }] }} />;
  return (
    <View style={{ width: b, height: b, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: b * 0.86, height: b, borderRadius: b * 0.3, backgroundColor: '#b06a2c', borderWidth: 2.5, borderColor: '#5e3212', overflow: 'hidden' }}>
        {[0.2, 0.4, 0.6, 0.8].map((x) => (
          <View key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: b * 0.86 * x - 1, width: 2, backgroundColor: '#7c4518' }} />
        ))}
        <View style={{ position: 'absolute', left: b * 0.08, top: b * 0.06, width: b * 0.14, bottom: b * 0.06, borderRadius: b, backgroundColor: 'rgba(255,215,160,0.35)' }} />
        {[0.17, 0.75].map((y) => (
          <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: b * y, height: b * 0.09, backgroundColor: '#8a96a0', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#4b555e' }} />
        ))}
        {kat <= 2 && catlak(0.18, 0.4, 35, 0.32)}
        {kat <= 2 && catlak(0.32, 0.5, -25, 0.22)}
        {kat <= 1 && catlak(0.45, 0.32, -40, 0.3)}
        {kat <= 1 && catlak(0.5, 0.58, 30, 0.26)}
      </View>
      {odul && (
        <View style={{ position: 'absolute', width: b * 0.4, height: b * 0.4, borderRadius: b, backgroundColor: '#ffd23f', borderWidth: 2, borderColor: '#b07800', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: b * 0.26, lineHeight: b * 0.32, color: '#b4570a', fontWeight: 'bold' }}>★</Text>
        </View>
      )}
    </View>
  );
}

// Kırılma efekti: buz için mavi kristal parçaları, kasa için tahta kıymıkları (az = sadece çatlama)
export function Kirilma({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 620, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const cx = e.c * H + H / 2;
  const cy = e.r * H + H / 2;
  const sis = e.tur === 'sis';
  const kar = e.tur === 'kar' || sis;
  const yaprak = e.tur === 'yaprak';
  const buz = e.tur === 'buz' || kar;
  const adet = e.az ? 3 : 7;
  const renkler = yaprak ? ['#4fbf3a', '#2f8a28', '#6ad957'] : sis ? ['#d3d7ee', '#ffffff', '#b9bfdc'] : kar ? ['#ffffff', '#e4f3ff', '#ffffff'] : buz ? ['#e9f7ff', '#a7dcff', '#ffffff'] : ['#cf8f48', '#8f5a24', '#e0aa66'];
  return (
    <>
      {!e.az && (
        <Animated.View
          style={{
            position: 'absolute',
            left: cx - H * 0.55,
            top: cy - H * 0.55,
            width: H * 1.1,
            height: H * 1.1,
            borderRadius: H,
            backgroundColor: yaprak ? '#e4f8dc' : buz ? '#e8f8ff' : '#fff0d0',
            opacity: t.interpolate({ inputRange: [0, 0.35], outputRange: [0.85, 0], extrapolate: 'clamp' }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 0.35], outputRange: [0.5, 1.2], extrapolate: 'clamp' }) }],
          }}
        />
      )}
      {Array.from({ length: adet }, (_, i) => {
        const aci = ((i * 360) / adet + 20) * (Math.PI / 180);
        const uz = H * (0.6 + (i % 3) * 0.2);
        const gen = H * (yaprak ? 0.24 : buz ? 0.2 : 0.3);
        const yuk = H * (yaprak ? 0.14 : buz ? 0.2 : 0.1);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: cx - gen / 2,
              top: cy - yuk / 2,
              width: gen,
              height: yuk,
              borderRadius: kar ? H : yaprak ? H * 0.1 : buz ? 2 : 3,
              backgroundColor: renkler[i % 3],
              borderWidth: 1,
              borderColor: yaprak ? '#1f5f19' : kar ? 'rgba(140,200,240,0.7)' : buz ? 'rgba(90,160,210,0.8)' : '#6b4019',
              opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(aci) * uz] }) },
                { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, Math.sin(aci) * uz * 0.8, Math.sin(aci) * uz * 0.8 + (sis ? -H * 0.5 : H * 0.7)] }) },
                { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 ? 1 : -1) * (200 + i * 40)}deg`] }) },
                ...(buz ? [{ rotate: '45deg' }] : []),
              ],
            }}
          />
        );
      })}
    </>
  );
}

// Kar (zemin katmanı): hücrenin içinde beyaz kar yığını; iki katlıda daha kalın, mavimsi kenarlı ve tepeli.
// Parçaların ALTINDA çizilir; meyvenin kenarlarından görünür.
export function KarZemin({ H, kat, r, c }) {
  const b = H - 3;
  const iki = kat >= 2;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, overflow: 'hidden' }}>
      <View style={{ ...TAM, backgroundColor: iki ? '#e4f3ff' : '#f7fcff', borderRadius: H * 0.22, borderWidth: iki ? 3.5 : 2, borderColor: iki ? '#9fd0f5' : '#cfe9fb' }} />
      {/* alttaki kar tepecikleri */}
      <View style={{ position: 'absolute', left: -b * 0.1, bottom: -b * 0.25, width: b * 0.65, height: b * 0.55, borderRadius: b, backgroundColor: '#ffffff' }} />
      <View style={{ position: 'absolute', right: -b * 0.12, bottom: -b * 0.3, width: b * 0.7, height: b * 0.6, borderRadius: b, backgroundColor: iki ? '#f3faff' : '#ffffff' }} />
      {iki && <View style={{ position: 'absolute', left: b * 0.2, top: -b * 0.18, width: b * 0.6, height: b * 0.36, borderRadius: b, backgroundColor: '#ffffff' }} />}
      {/* parıltılar */}
      {[
        [0.14, 0.18],
        [0.8, 0.22],
        [0.5, 0.82],
      ].map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: b * x, top: b * y, width: b * 0.07, height: b * 0.07, borderRadius: b, backgroundColor: '#8fcaf3' }} />
      ))}
    </View>
  );
}

// Karın meyvenin ÜSTÜNDE görünen kısmı: hücrenin alt kenarında kar yığını ve kenarda buzlu çerçeve.
// Meyvenin yüzünü kapatmaz (yalnız alt %30); iki katlıda yığın daha yüksek ve mavimsi.
export function KarUst({ H, kat, r, c }) {
  const b = H - 3;
  const iki = kat >= 2;
  const y = b * (iki ? 0.34 : 0.26);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, overflow: 'hidden', borderWidth: iki ? 3 : 2, borderColor: iki ? 'rgba(120,190,240,0.95)' : 'rgba(170,215,245,0.95)' }}>
      <View style={{ position: 'absolute', left: -b * 0.08, bottom: -y * 0.55, width: b * 0.62, height: y * 1.6, borderRadius: b, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#cfe6f7' }} />
      <View style={{ position: 'absolute', right: -b * 0.1, bottom: -y * 0.6, width: b * 0.66, height: y * 1.5, borderRadius: b, backgroundColor: iki ? '#f1f8fe' : '#ffffff', borderWidth: 1.5, borderColor: '#cfe6f7' }} />
      <View style={{ position: 'absolute', left: b * 0.2, bottom: -y * 0.3, width: b * 0.5, height: y * 1.1, borderRadius: b, backgroundColor: '#ffffff' }} />
      <View style={{ position: 'absolute', left: b * 0.22, bottom: y * 0.35, width: b * 0.06, height: b * 0.06, borderRadius: b, backgroundColor: '#8fcaf3' }} />
      <View style={{ position: 'absolute', right: b * 0.24, bottom: y * 0.25, width: b * 0.05, height: b * 0.05, borderRadius: b, backgroundColor: '#8fcaf3' }} />
      {iki && <View style={{ position: 'absolute', left: b * 0.06, top: b * 0.06, width: b * 0.16, height: b * 0.16, borderRadius: b, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#cfe6f7' }} />}
    </View>
  );
}

// Tohum: tombul kahverengi tohum, tepesinde iki yapraklı filiz, sevimli yüz
export function Tohum({ H }) {
  const b = H * 0.72;
  return (
    <View style={{ width: H, height: H, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* filiz */}
      <View style={{ position: 'absolute', top: H * 0.06, left: H * 0.485, width: H * 0.04, height: H * 0.2, borderRadius: 2, backgroundColor: '#3f9a2b' }} />
      <View style={{ position: 'absolute', top: H * 0.05, left: H * 0.28, width: H * 0.22, height: H * 0.12, backgroundColor: '#5fcf3c', borderTopLeftRadius: H * 0.12, borderBottomRightRadius: H * 0.12, borderTopRightRadius: 2, borderBottomLeftRadius: 2, transform: [{ rotate: '-20deg' }] }} />
      <View style={{ position: 'absolute', top: H * 0.05, left: H * 0.5, width: H * 0.22, height: H * 0.12, backgroundColor: '#4dbb2e', borderTopRightRadius: H * 0.12, borderBottomLeftRadius: H * 0.12, borderTopLeftRadius: 2, borderBottomRightRadius: 2, transform: [{ rotate: '20deg' }] }} />
      {/* tohum gövdesi */}
      <View style={{ width: b, height: b * 0.95, marginBottom: H * 0.06, borderRadius: b * 0.5, borderTopLeftRadius: b * 0.62, borderTopRightRadius: b * 0.62, backgroundColor: '#b9773a', borderWidth: 2.5, borderColor: '#6e3f17', alignItems: 'center', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: b * 0.14, top: b * 0.1, width: b * 0.28, height: b * 0.2, borderRadius: b, backgroundColor: 'rgba(255,225,170,0.6)' }} />
        <View style={{ position: 'absolute', left: b * 0.5 - 1, top: b * 0.04, width: 2, height: b * 0.3, backgroundColor: 'rgba(110,63,23,0.45)' }} />
        <View style={{ flexDirection: 'row', marginTop: b * 0.42 }}>
          <View style={{ width: b * 0.1, height: b * 0.13, borderRadius: b, backgroundColor: '#3b2210', marginHorizontal: b * 0.09 }} />
          <View style={{ width: b * 0.1, height: b * 0.13, borderRadius: b, backgroundColor: '#3b2210', marginHorizontal: b * 0.09 }} />
        </View>
        <View style={{ width: b * 0.22, height: b * 0.1, borderBottomLeftRadius: b * 0.12, borderBottomRightRadius: b * 0.12, borderWidth: 2, borderTopWidth: 0, borderColor: '#3b2210', marginTop: b * 0.03 }} />
      </View>
    </View>
  );
}

// Tohum en alt sıraya inince açan çiçek (büyüyüp yukarı süzülür ve kaybolur)
// ---------- Çiçek (Arı Bahçesi) ----------
// Zemindeki çiçek: meyvenin arkasında, taç yaprakları meyvenin kenarlarından taşar (renk = tozlanması için gereken meyve)
export function CicekZemin({ H, tur, r, c }) {
  const m = MEYVELER[tur] || MEYVELER[0];
  const b = H - 3;
  const y = b * 0.4;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, overflow: 'hidden', backgroundColor: '#fff6d6' }}>
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = ((a + 30) * Math.PI) / 180;
        return <View key={a} style={{ position: 'absolute', left: b / 2 + Math.cos(rad) * b * 0.36 - y / 2, top: b / 2 + Math.sin(rad) * b * 0.36 - y / 2, width: y, height: y, borderRadius: y, backgroundColor: m.renk, opacity: 0.85, borderWidth: 1.5, borderColor: '#ffffff' }} />;
      })}
    </View>
  );
}
// Meyvenin üstünde sağ alt köşede küçük çiçek rozeti: hangi rengin gerektiği meyve üstündeyken de görünsün
export function CicekUst({ H, tur, r, c }) {
  const m = MEYVELER[tur] || MEYVELER[0];
  const b = H * 0.34;
  const y = b * 0.46;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + H - b - 1, top: r * H + H - b - 1, width: b, height: b }}>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <View key={a} style={{ position: 'absolute', left: b / 2 + Math.cos(rad) * b * 0.27 - y / 2, top: b / 2 + Math.sin(rad) * b * 0.27 - y / 2, width: y, height: y, borderRadius: y, backgroundColor: m.renk, borderWidth: 1, borderColor: '#ffffff' }} />;
      })}
      <View style={{ position: 'absolute', left: b * 0.36, top: b * 0.36, width: b * 0.28, height: b * 0.28, borderRadius: b, backgroundColor: '#ffd23f', borderWidth: 1, borderColor: '#c98a00' }} />
    </View>
  );
}
export function CicekIkon({ boy = 26, tur = null }) {
  const renk = tur == null ? '#ff8fc7' : (MEYVELER[tur] || MEYVELER[0]).renk;
  const y = boy * 0.46;
  return (
    <View style={{ width: boy, height: boy }}>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <View key={a} style={{ position: 'absolute', left: boy / 2 + Math.cos(rad) * boy * 0.27 - y / 2, top: boy / 2 + Math.sin(rad) * boy * 0.27 - y / 2, width: y, height: y, borderRadius: y, backgroundColor: renk, borderWidth: 1, borderColor: '#ffffff' }} />;
      })}
      <View style={{ position: 'absolute', left: boy * 0.36, top: boy * 0.36, width: boy * 0.28, height: boy * 0.28, borderRadius: boy, backgroundColor: '#ffd23f', borderWidth: 1, borderColor: '#c98a00' }} />
    </View>
  );
}
// ---------- Saat (Saat Kulesi) ----------
// Meyvenin sağ üst köşesinde kalan hamleyi gösteren saat rozeti; 3 ve altında kırmızı
export function SaatRozet({ H, n }) {
  const b = H * 0.42;
  const acil = n <= 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: H * 0.01, top: H * 0.01, width: b, height: b, borderRadius: b, backgroundColor: acil ? '#ff4d4d' : '#ffffff', borderWidth: 2, borderColor: acil ? '#a10f0f' : '#5b6b7a', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: -b * 0.16, width: b * 0.3, height: b * 0.2, borderRadius: 2, backgroundColor: acil ? '#a10f0f' : '#5b6b7a' }} />
      <Text style={{ fontSize: b * 0.56, lineHeight: b * 0.7, fontWeight: '900', color: acil ? '#ffffff' : '#24384a' }}>{n}</Text>
    </View>
  );
}
export function SaatIkon({ boy = 26 }) {
  return (
    <View style={{ width: boy, height: boy, borderRadius: boy, backgroundColor: '#ffffff', borderWidth: 2.5, borderColor: '#5b6b7a', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 2.5, height: boy * 0.34, top: boy * 0.16, backgroundColor: '#24384a', borderRadius: 2 }} />
      <View style={{ position: 'absolute', width: boy * 0.28, height: 2.5, left: boy * 0.47, top: boy * 0.47, backgroundColor: '#ff4d4d', borderRadius: 2 }} />
    </View>
  );
}

// Arı: yukarıdan uçup çiçeğe konar, tozlar ve uçup gider
export function AriEfekt({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const cx = e.c * H + H / 2;
  const cy = e.r * H + H / 2;
  return (
    <>
      <Animated.Text
        style={{
          position: 'absolute',
          left: cx - H * 0.28,
          top: cy - H * 0.32,
          fontSize: H * 0.5,
          lineHeight: H * 0.62,
          opacity: t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateX: t.interpolate({ inputRange: [0, 0.4, 0.6, 1], outputRange: [-H * 1.2, 0, 0, H * 1.4] }) },
            { translateY: t.interpolate({ inputRange: [0, 0.4, 0.5, 0.6, 1], outputRange: [-H * 1.4, 0, -H * 0.08, 0, -H * 1.6] }) },
          ],
        }}
      >
        🐝
      </Animated.Text>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: cx - 3,
              top: cy - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#ffd23f',
              opacity: t.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [0, 0, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, Math.cos(a) * H * 0.6] }) },
                { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, Math.sin(a) * H * 0.6] }) },
              ],
            }}
          />
        );
      })}
    </>
  );
}

export function CicekAcma({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const b = H * 1.2;
  const yaprak = b * 0.34;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: e.c * H + H / 2 - b / 2,
        top: e.r * H + H / 2 - b / 2,
        width: b,
        height: b,
        opacity: t.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.9] }) },
          { scale: t.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.2, 1.15, 1] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '40deg'] }) },
        ],
      }}
    >
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <View
            key={a}
            style={{ position: 'absolute', left: b / 2 + Math.cos(rad) * b * 0.24 - yaprak / 2, top: b / 2 + Math.sin(rad) * b * 0.24 - yaprak / 2, width: yaprak, height: yaprak, borderRadius: yaprak, backgroundColor: a % 120 ? '#ff9cc6' : '#ff7ab2', borderWidth: 1.5, borderColor: '#ffffff' }}
          />
        );
      })}
      <View style={{ position: 'absolute', left: b / 2 - b * 0.14, top: b / 2 - b * 0.14, width: b * 0.28, height: b * 0.28, borderRadius: b, backgroundColor: '#ffd23f', borderWidth: 2, borderColor: '#fff6c4' }} />
    </Animated.View>
  );
}

// Hedef kutusundaki küçük simgeler
export function SarmasikIkon({ boy = 26 }) {
  return (
    <View style={{ width: boy, height: boy, borderRadius: boy * 0.22, backgroundColor: '#eaf8e4', borderWidth: 2, borderColor: '#2f8a28', overflow: 'hidden' }}>
      <SarmasikKatman H={boy} />
    </View>
  );
}
export function KarIkon({ boy = 26 }) {
  return (
    <View style={{ width: boy, height: boy, borderRadius: boy * 0.22, backgroundColor: '#f7fcff', borderWidth: 2, borderColor: '#9fd0f5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: boy * 0.62, color: '#5aaee8', lineHeight: boy * 0.8 }}>❄</Text>
    </View>
  );
}
export function TohumIkon({ boy = 26 }) {
  return <Tohum H={boy * 1.05} />;
}
export function BuzIkon({ boy = 26 }) {
  return (
    <View style={{ width: boy, height: boy, borderRadius: boy * 0.22, backgroundColor: '#bfe6ff', borderWidth: 2, borderColor: '#ffffff', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: boy * 0.2, top: -boy * 0.1, width: boy * 0.18, height: boy * 0.9, backgroundColor: 'rgba(255,255,255,0.85)', transform: [{ rotate: '35deg' }] }} />
    </View>
  );
}
export function KasaIkon({ boy = 26 }) {
  return <Kasa H={boy / 0.9} kat={1} />;
}
export function FiciIkon({ boy = 26 }) {
  return <Fici H={boy / 0.9} kat={3} />;
}

// ---------- Yıldızlar ----------
export function Yildiz({ dolu, boy = 22, renk = '#ffc21a' }) {
  return <Text style={{ fontSize: boy, color: dolu ? renk : '#d3dbe3', lineHeight: boy * 1.15, textShadowColor: dolu ? '#c26a00' : 'transparent', textShadowRadius: 1, textShadowOffset: { width: 1, height: 1 } }}>★</Text>;
}

export function GirisKart({ children }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: 1, speed: 12, bounciness: 12, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[st.kart, { opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

// ---------- parçalar ----------
export function Parca({ p, H }) {
  if (p.H !== H) {
    p.H = H;
    p.tx = Animated.multiply(p.poz.x, H);
    // Ezilince alt kenar yerinde kalsın diye hafifçe aşağı kayar
    p.ty = Animated.add(Animated.multiply(Animated.add(p.poz.y, p.zip), H), Animated.multiply(p.ez, H * 0.06));
    p.sx = p.ez.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.86, 1, 1.16] });
    p.sy = p.ez.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.14, 1, 0.82] });
    p.rot = p.don.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] });
  }
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: H,
        height: H,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateX: p.tx }, { translateY: p.ty }, { scale: p.olcek }, { scaleX: p.sx }, { scaleY: p.sy }, { rotate: p.rot }],
      }}
    >
      {p.kat ? (
        p.tur === FICI_TUR || p.tur === FICI_ODUL_TUR ? (
          <Fici H={H} kat={p.kat} odul={p.tur === FICI_ODUL_TUR} />
        ) : (
          <Kasa H={H} kat={p.kat} />
        )
      ) : null}
      {p.ozel === 'bomba' && <BombaHale key="b" H={H} renk={MEYVELER[p.tur].renk} />}
      {p.tur === TOHUM_TUR ? (
        <Tohum H={H} />
      ) : p.kat ? null : p.ozel === 'gokkusagi' || !MEYVELER[p.tur] ? (
        <GokkusagiKure H={H} />
      ) : (
        <Image
          source={MEYVELER[p.tur].resim}
          // Mutlak konum: bomba halesinin üstünde çizilsin (sıra her ortamda aynı olsun)
          style={{ position: 'absolute', width: H * (p.ozel === 'bomba' ? 0.84 : 0.9), height: H * (p.ozel === 'bomba' ? 0.84 : 0.9), left: H * (p.ozel === 'bomba' ? 0.08 : 0.05), top: H * (p.ozel === 'bomba' ? 0.08 : 0.05) }}
          resizeMode="contain"
        />
      )}
      {(p.ozel === 'satir' || p.ozel === 'sutun') && <Cizgiler key={p.ozel} H={H} yon={p.ozel} renk={MEYVELER[p.tur].koyu} />}
      {p.buz && <BuzKatman H={H} />}
      {p.sarmasik && <SarmasikKatman H={H} />}
      {p.sis && <SisKatman H={H} />}
      {p.saat ? <SaatRozet H={H} n={p.saat} /> : null}
    </Animated.View>
  );
}

export function SeciliHalka({ r, c, H }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 450, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => d.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: c * H + 1,
        top: r * H + 1,
        width: H - 2,
        height: H - 2,
        borderRadius: H * 0.24,
        borderWidth: 3,
        borderColor: '#ffb800',
        backgroundColor: 'rgba(255,214,0,0.28)',
        opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
        transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) }],
      }}
    />
  );
}

// Patlama: beyaz ışık patlaması, genişleyen halka, koyu kenarlı meyve suyu damlaları (önce fırlar, sonra düşer), yıldız pırıltıları
const DAMLALAR = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((aci, i) => ({
  aci: aci + ((i * 17) % 20),
  uzak: 0.85 + ((i * 37) % 10) / 16,
  boy: 0.2 + ((i * 53) % 7) / 60,
}));
const PIRILTILAR = [15, 105, 195, 285].map((aci, i) => ({ aci, uzak: 0.5 + (i % 2) * 0.25 }));
export function Patlama({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  const cx = e.x * H + H / 2;
  const cy = e.y * H + H / 2;
  const sondur = t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });
  const daire = (boy) => ({ position: 'absolute', left: cx - boy / 2, top: cy - boy / 2, width: boy, height: boy, borderRadius: boy / 2 });
  return (
    <>
      {/* Beyaz ışık patlaması */}
      <Animated.View
        style={[
          daire(H * 1.05),
          {
            backgroundColor: '#ffffff',
            opacity: t.interpolate({ inputRange: [0, 0.08, 0.35], outputRange: [0.95, 0.9, 0], extrapolate: 'clamp' }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 0.35], outputRange: [0.55, 1.25], extrapolate: 'clamp' }) }],
          },
        ]}
      />
      {/* Halka */}
      <Animated.View
        style={[
          daire(H),
          {
            borderWidth: 4,
            borderColor: '#ffffff',
            opacity: t.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 0.6], outputRange: [0.5, 2.0], extrapolate: 'clamp' }) }],
          },
        ]}
      />
      {DAMLALAR.map((d) => {
        const rad = (d.aci * Math.PI) / 180;
        const b = H * d.boy;
        const ux = Math.cos(rad) * H * d.uzak;
        const uy = Math.sin(rad) * H * d.uzak;
        return (
          <Animated.View
            key={d.aci}
            style={[
              daire(b),
              {
                backgroundColor: e.renk,
                borderWidth: 1.5,
                borderColor: e.koyu || 'rgba(0,0,0,0.25)',
                opacity: sondur,
                transform: [
                  { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, ux] }) },
                  // Önce dışarı fırlar, sonra yerçekimiyle aşağı düşer
                  { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, uy, uy + H * 0.55] }) },
                  { scale: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.5, 1.15, 0.55] }) },
                ],
              },
            ]}
          >
            <View style={{ position: 'absolute', left: b * 0.18, top: b * 0.14, width: b * 0.34, height: b * 0.34, borderRadius: b, backgroundColor: 'rgba(255,255,255,0.9)' }} />
          </Animated.View>
        );
      })}
      {PIRILTILAR.map((p) => {
        const rad = (p.aci * Math.PI) / 180;
        const b = H * 0.5;
        return (
          <Animated.View
            key={'p' + p.aci}
            style={{
              position: 'absolute',
              left: cx - b / 2,
              top: cy - b / 2,
              width: b,
              height: b,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: t.interpolate({ inputRange: [0, 0.1, 0.55, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * H * p.uzak] }) },
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * H * p.uzak] }) },
                { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '120deg'] }) },
                { scale: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.3, 1, 0.2] }) },
              ],
            }}
          >
            <View style={{ position: 'absolute', width: b, height: b * 0.14, borderRadius: b, backgroundColor: '#ffffff' }} />
            <View style={{ position: 'absolute', width: b * 0.14, height: b, borderRadius: b, backgroundColor: '#ffffff' }} />
            <View style={{ position: 'absolute', width: b * 0.34, height: b * 0.34, borderRadius: b, backgroundColor: '#fff6b0' }} />
          </Animated.View>
        );
      })}
    </>
  );
}

export function PuanYazisi({ e, H, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => bitti(e.id));
  }, []);
  return (
    <Animated.Text
      style={[
        st.puanYazi,
        {
          left: e.x * H - H * 0.5,
          top: e.y * H + H * 0.1,
          width: H * 2,
          fontSize: Math.max(16, H * 0.42),
          color: e.renk,
          opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.9] }) }, { scale: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.5, 1.15, 1] }) }],
        },
      ]}
    >
      {e.metin}
    </Animated.Text>
  );
}

export function Ovgu({ metin, bitti }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(t, { toValue: 1, speed: 16, bounciness: 12, useNativeDriver: true }),
      Animated.delay(550),
      Animated.timing(t, { toValue: 2, duration: 250, useNativeDriver: true }),
    ]).start(() => bitti());
  }, []);
  return (
    <View style={st.ovguKap} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Animated.Text
        style={[
          st.ovgu,
          {
            opacity: t.interpolate({ inputRange: [0, 0.3, 1, 2], outputRange: [0, 1, 1, 0] }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1, 1.3] }) }, { rotate: '-6deg' }],
          },
        ]}
      >
        {metin}
      </Animated.Text>
    </View>
  );
}

// Değer değişince sayaç gibi yükselir ve kutu hafifçe zıplar; vurgu açıkken kalp gibi atar
export function Kutu({ baslik, deger, etiket, vurgu, buyuk }) {
  const [gosterilen, setGosterilen] = useState(deger);
  const onceki = useRef(deger);
  const olcek = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const bas = onceki.current;
    onceki.current = deger;
    if (bas === deger) return;
    Animated.sequence([
      Animated.timing(olcek, { toValue: 1.12, duration: 90, useNativeDriver: true }),
      Animated.spring(olcek, { toValue: 1, speed: 20, bounciness: 12, useNativeDriver: true }),
    ]).start();
    if (deger < bas) {
      setGosterilen(deger);
      return;
    }
    const t0 = Date.now();
    const sure = 450;
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / sure);
      setGosterilen(Math.round(bas + (deger - bas) * (1 - Math.pow(1 - k, 3))));
      if (k >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [deger]);
  const atis = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!vurgu) return;
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(atis, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0.6, duration: 120, useNativeDriver: true }),
        Animated.timing(atis, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    d.start();
    return () => {
      d.stop();
      atis.setValue(0);
    };
  }, [vurgu]);
  return (
    <Animated.View
      style={[st.kutu, buyuk && st.kutuBuyuk, { transform: [{ scale: Animated.add(olcek, Animated.multiply(atis, 0.08)) }] }]}
      accessible
      accessibilityLabel={etiket}
    >
      <Text style={st.kutuBaslik}>{baslik}</Text>
      <Text style={[st.kutuDeger, buyuk && { fontSize: 34 }, vurgu && { color: '#e8364a' }]}>{gosterilen}</Text>
    </Animated.View>
  );
}


export const st = StyleSheet.create({
  kok: { flex: 1, backgroundColor: '#bfe7ff', alignItems: 'center', justifyContent: 'center' },
  tepe: { ...TAM, overflow: 'hidden' },
  tepe2: { position: 'absolute', backgroundColor: '#c9eeb0' },
  ust: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 8, marginBottom: 14 },
  kutu: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    minWidth: 92,
    alignItems: 'center',
    shadowColor: '#3a6a8a',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  kutuBuyuk: { paddingVertical: 10, minWidth: 104, borderWidth: 3, borderColor: '#ffcf3a' },
  kutuBaslik: { fontSize: 13, fontWeight: '700', color: '#6a7f91', letterSpacing: 0.5 },
  kutuDeger: { fontSize: 24, fontWeight: '900', color: '#24384a' },
  cerceve: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#2c5d7c',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  alt: { marginTop: 18, alignItems: 'center' },
  dugme: {
    backgroundColor: '#ff7a3d',
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderBottomWidth: 4,
    borderBottomColor: '#d4561c',
  },
  dugmeBuyuk: { marginTop: 18, paddingVertical: 16, paddingHorizontal: 40 },
  dugmeYazi: { color: '#ffffff', fontSize: 17, fontWeight: '900' },
  puanYazi: {
    position: 'absolute',
    textAlign: 'center',
    fontWeight: '900',
    textShadowColor: '#ffffff',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  ovguKap: { ...TAM, alignItems: 'center', justifyContent: 'center' },
  ovgu: {
    fontSize: 46,
    fontWeight: '900',
    color: '#ffcf1f',
    textShadowColor: '#c2410c',
    textShadowRadius: 2,
    textShadowOffset: { width: 3, height: 3 },
  },
  perde: { ...TAM, backgroundColor: 'rgba(20,40,60,0.55)', alignItems: 'center', justifyContent: 'center' },
  kart: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 34,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffcf3a',
    minWidth: 260,
  },
  kartBaslik: { fontSize: 26, fontWeight: '900', color: '#24384a' },
  kartPuan: { fontSize: 56, fontWeight: '900', color: '#ff7a3d', marginTop: 6 },
  kartAlt: { fontSize: 17, fontWeight: '700', color: '#6a7f91' },
});
