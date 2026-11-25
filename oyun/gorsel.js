// Görsel parçalar: meyveler, özel parça görünümleri, efektler, kutular, kartlar.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

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
      {p.ozel === 'bomba' && <BombaHale key="b" H={H} renk={MEYVELER[p.tur].renk} />}
      {p.ozel === 'gokkusagi' || !MEYVELER[p.tur] ? (
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
