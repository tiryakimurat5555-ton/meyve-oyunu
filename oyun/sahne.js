// Canlı bahçe sahnesi (tamamen kodla): renk geçişli gökyüzü, gülen güneş, süzülen bulutlar,
// tepeler, ağaçlar, çiçekler ve bölüme göre uçuşan taç yaprakları / kelebekler / sonbahar yaprakları.
// Resimli arka planlar gelince gökyüzü ve tepeler resimle değişir; hareketli katmanlar üstte kalır.
// Hepsi süs: dokunmayı geçirir ve VoiceOver'dan gizlidir. "Hareketi azalt" açıksa sahne durgun kalır.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';

export const bolumNo = (seviyeNo) => Math.min(9, Math.floor((seviyeNo - 1) / 10));

const RENKLER = [
  // 0: İlkbahar
  {
    gok: ['#74c8ff', '#dff5ff'],
    gunes: '#ffe14d',
    gunesKenar: '#ffc928',
    tepeArka: ['#a6e08e', '#86cc6e'],
    tepeArka2: ['#b4e69a', '#93d47a'],
    tepeOn: ['#c9f0a6', '#ade08a'],
    tac: ['#5fbf57', '#4aa847', '#86d672'],
    nokta: ['#ffc1dc', '#ffffff', '#ff9cc6'],
    cicek: ['#ff9cc6', '#ffffff', '#ffd1e6'],
    parca: [
      { tip: 'yaprak', renk: '#ffb8d6' },
      { tip: 'yaprak', renk: '#ffffff' },
      { tip: 'yaprak', renk: '#ff9cc6' },
      { tip: 'yaprak', renk: '#ffd1e6' },
      { tip: 'kelebek', renk: '#ffd23f' },
      { tip: 'kelebek', renk: '#b98cff' },
    ],
  },
  // 1: Yaz
  {
    gok: ['#3fb0ff', '#fff2c6'],
    gunes: '#ffd93a',
    gunesKenar: '#ffb81c',
    tepeArka: ['#77c95e', '#5cb44a'],
    tepeArka2: ['#86d26a', '#69bd54'],
    tepeOn: ['#a5e07a', '#86cf5e'],
    tac: ['#3fa94a', '#2f923c', '#5cc45d'],
    nokta: ['#ff4d4d', '#ffb13b', '#ff4d4d'],
    cicek: ['#ff5a5a', '#ffd23f', '#a06bff'],
    parca: [
      { tip: 'kelebek', renk: '#ff8a3d' },
      { tip: 'kelebek', renk: '#4fc3ff' },
      { tip: 'kelebek', renk: '#ff6fb5' },
      { tip: 'kelebek', renk: '#ffd23f' },
    ],
  },
  // 2: Sonbahar
  {
    gok: ['#86bfe6', '#ffd8a6'],
    gunes: '#ffc94a',
    gunesKenar: '#ffa62b',
    tepeArka: ['#d9b056', '#c59a40'],
    tepeArka2: ['#e2bd62', '#cda54a'],
    tepeOn: ['#ecd078', '#dcbb5e'],
    tac: ['#f08a2c', '#d8641f', '#f6c445'],
    nokta: ['#e0452b', '#ffd34d', '#b8431c'],
    cicek: ['#e8743b', '#ffb13b', '#c4502a'],
    parca: [
      { tip: 'yaprak', renk: '#f08a2c', buyuk: true },
      { tip: 'yaprak', renk: '#e0452b', buyuk: true },
      { tip: 'yaprak', renk: '#f6c445', buyuk: true },
      { tip: 'yaprak', renk: '#d8641f', buyuk: true },
      { tip: 'yaprak', renk: '#f08a2c', buyuk: true },
      { tip: 'yaprak', renk: '#b8431c', buyuk: true },
      { tip: 'yaprak', renk: '#f6c445', buyuk: true },
    ],
  },
  // 3: Kış
  {
    gok: ['#8fc2e6', '#eef6fb'],
    gunes: '#fff3b0',
    gunesKenar: '#ffe07a',
    tepeArka: ['#f4f9fd', '#dcebf6'],
    tepeArka2: ['#f7fbfe', '#e2eff8'],
    tepeOn: ['#ffffff', '#eaf4fb'],
    tac: ['#eaf4fb', '#c9dfee', '#ffffff'],
    nokta: ['#ffffff', '#b9d9f0', '#ffffff'],
    cicek: ['#ffffff', '#cfe6f7', '#e8f3fb'],
    parca: [
      { tip: 'kar' },
      { tip: 'kar' },
      { tip: 'kar', buyuk: true },
      { tip: 'kar' },
      { tip: 'kar', buyuk: true },
      { tip: 'kar' },
      { tip: 'kar' },
      { tip: 'kar', buyuk: true },
    ],
  },
  // 4: Çiçek
  {
    gok: ['#6cc4ff', '#fde9f6'],
    gunes: '#ffe14d',
    gunesKenar: '#ffc928',
    tepeArka: ['#9fdc7e', '#82c964'],
    tepeArka2: ['#aee48c', '#8fd16f'],
    tepeOn: ['#c4ee9c', '#a8de80'],
    tac: ['#5fbf57', '#4aa847', '#86d672'],
    nokta: ['#ff6fb5', '#ffd23f', '#b98cff'],
    cicek: ['#ff6fb5', '#ffd23f', '#b98cff'],
    parca: [
      { tip: 'yaprak', renk: '#ff9cc6' },
      { tip: 'yaprak', renk: '#ffd23f' },
      { tip: 'yaprak', renk: '#c9a8ff' },
      { tip: 'kelebek', renk: '#ff6fb5' },
      { tip: 'kelebek', renk: '#4fc3ff' },
      { tip: 'kelebek', renk: '#ffd23f' },
    ],
  },
  // 5: Tropik
  {
    gok: ['#22b8f0', '#d8fbff'],
    gunes: '#ffd93a',
    gunesKenar: '#ffb81c',
    tepeArka: ['#4fc36a', '#38a955'],
    tepeArka2: ['#5ccf73', '#43b35e'],
    tepeOn: ['#f6e3a8', '#ead18a'],
    tac: ['#2fa84f', '#1f8f3f', '#58cc6a'],
    nokta: ['#ff8a1f', '#ffd23f', '#ff4d6d'],
    cicek: ['#ff4d6d', '#ff8a1f', '#ff6fb5'],
    parca: [
      { tip: 'kelebek', renk: '#ff4d6d' },
      { tip: 'kelebek', renk: '#22d3ee' },
      { tip: 'kelebek', renk: '#a3e635' },
      { tip: 'yaprak', renk: '#ff6fb5' },
      { tip: 'yaprak', renk: '#ff8a1f' },
    ],
  },
  // 6: Kiraz Çiçeği
  {
    gok: ['#9fd8ff', '#ffe9f3'],
    gunes: '#ffe680',
    gunesKenar: '#ffcf5a',
    tepeArka: ['#a8dc8f', '#8ccb73'],
    tepeArka2: ['#b6e39d', '#97d17e'],
    tepeOn: ['#cdeeb2', '#b2e095'],
    tac: ['#ffb7d5', '#f79cc2', '#ffd3e6'],
    nokta: ['#ffffff', '#ff8cbc', '#ffe3ef'],
    cicek: ['#ffb7d5', '#ffffff', '#ff8cbc'],
    parca: [
      { tip: 'yaprak', renk: '#ffb7d5' },
      { tip: 'yaprak', renk: '#ffd3e6' },
      { tip: 'yaprak', renk: '#ff9cc6' },
      { tip: 'yaprak', renk: '#ffffff' },
      { tip: 'yaprak', renk: '#ffb7d5' },
      { tip: 'yaprak', renk: '#ffc4dd' },
      { tip: 'kelebek', renk: '#ffffff' },
    ],
  },
  // 7: Bağ Bozumu (akşamüstü altın ışık, asma yaprakları, üzüm salkımları)
  {
    gok: ['#f7b267', '#fff1d6'],
    gunes: '#ffd36b',
    gunesKenar: '#ff9f43',
    tepeArka: ['#9bbf5a', '#86ab48'],
    tepeArka2: ['#a8c766', '#8fb350'],
    tepeOn: ['#d8c27a', '#c8ad62'],
    tac: ['#6f9e3a', '#5a8a2c', '#88b54c'],
    nokta: ['#7b3fa0', '#9c5cc4', '#5b2a7a'],
    cicek: ['#9c5cc4', '#ffd23f', '#7b3fa0'],
    parca: [
      { tip: 'yaprak', renk: '#c9a227' },
      { tip: 'yaprak', renk: '#d9822b' },
      { tip: 'yaprak', renk: '#88b54c' },
      { tip: 'yaprak', renk: '#b5542b' },
      { tip: 'kelebek', renk: '#9c5cc4' },
    ],
  },
  // 8: Gece (ay, yıldızlar, ateş böcekleri; tahta açık renk kalır)
  {
    gece: true,
    gok: ['#1c2559', '#6a5fa8'],
    gunes: '#fff4c2',
    gunesKenar: '#e8d98a',
    tepeArka: ['#2f4d6b', '#29445f'],
    tepeArka2: ['#36577a', '#2e4b69'],
    tepeOn: ['#3d5f55', '#34544b'],
    tac: ['#2e5a4c', '#244a3e', '#3c7060'],
    nokta: ['#fff4a8', '#c9b8ff', '#ffffff'],
    cicek: ['#c9b8ff', '#ffffff', '#8fd3ff'],
    parca: [
      { tip: 'atesbocegi' },
      { tip: 'atesbocegi' },
      { tip: 'atesbocegi' },
      { tip: 'atesbocegi' },
      { tip: 'atesbocegi' },
      { tip: 'atesbocegi' },
    ],
  },
  // 9: Kristal Bahçe (açık turkuaz-lila gök, cam gibi pastel ağaçlar, yükselen parıltılar)
  {
    gok: ['#8fd8f0', '#f3e8ff'],
    gunes: '#fff6a8',
    gunesKenar: '#ffd86b',
    tepeArka: ['#a7e3e0', '#8fd3d0'],
    tepeArka2: ['#c4d9ff', '#a9c4f5'],
    tepeOn: ['#d9f3ee', '#c2e9e2'],
    tac: ['#9fe6f2', '#7fd0e6', '#d6f7ff'],
    nokta: ['#ffffff', '#ffb3e6', '#c9b8ff'],
    cicek: ['#ffb3e6', '#9fe6f2', '#c9b8ff'],
    parca: [
      { tip: 'parilti', renk: '#ffffff' },
      { tip: 'parilti', renk: '#bff4ff' },
      { tip: 'parilti', renk: '#ffd6f4' },
      { tip: 'parilti', renk: '#ffffff' },
      { tip: 'parilti', renk: '#e2d6ff' },
      { tip: 'parilti', renk: '#bff4ff' },
      { tip: 'kelebek', renk: '#9fe6f2' },
    ],
  },
];
export const geceMi = (bolum) => !!(RENKLER[bolum] && RENKLER[bolum].gece);

const GIZLI = { pointerEvents: 'none', importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true };

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function karis(a, b, t) {
  const x = hex(a);
  const y = hex(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// 0'dan 1'e sürekli dönen değer (hareket kapalıysa durur)
function useDongu(sure, hareket) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!hareket) return undefined;
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: sure, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [hareket, sure]);
  return v;
}

// ---------- gökyüzü ----------
function Gok({ renk, EY }) {
  const n = 18;
  const h = EY / n;
  return Array.from({ length: n }, (_, i) => (
    <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * h, height: h + 1, backgroundColor: karis(renk[0], renk[1], i / (n - 1)) }} />
  ));
}

// ---------- güneş ----------
function Gunes({ x, y, boy, renk, kenar, hareket }) {
  const don = useDongu(48000, hareket);
  const nefes = useDongu(4200, hareket);
  const donus = don.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const olcek = nefes.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });
  const isin = boy * 2.7;
  return (
    <View style={{ position: 'absolute', left: x - isin / 2, top: y - isin / 2, width: isin, height: isin, alignItems: 'center', justifyContent: 'center' }}>
      {/* ışınlar */}
      <Animated.View style={{ position: 'absolute', width: isin, height: isin, transform: [{ rotate: donus }] }}>
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <View
            key={a}
            style={{ position: 'absolute', left: isin / 2 - boy * 0.09, top: 0, width: boy * 0.18, height: isin, borderRadius: boy * 0.09, backgroundColor: 'rgba(255,240,160,0.45)', transform: [{ rotate: `${a}deg` }] }}
          />
        ))}
      </Animated.View>
      {/* hale */}
      <Animated.View style={{ position: 'absolute', width: boy * 1.75, height: boy * 1.75, borderRadius: boy, backgroundColor: 'rgba(255,244,170,0.45)', transform: [{ scale: olcek }] }} />
      <View style={{ position: 'absolute', width: boy * 1.35, height: boy * 1.35, borderRadius: boy, backgroundColor: 'rgba(255,240,150,0.55)' }} />
      {/* yüzlü güneş */}
      <View style={{ width: boy, height: boy, borderRadius: boy / 2, backgroundColor: renk, borderWidth: boy * 0.05, borderColor: kenar, alignItems: 'center' }}>
        <View style={{ position: 'absolute', left: boy * 0.16, top: boy * 0.12, width: boy * 0.26, height: boy * 0.18, borderRadius: boy * 0.1, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ flexDirection: 'row', marginTop: boy * 0.36 }}>
          <View style={{ width: boy * 0.1, height: boy * 0.13, borderRadius: boy * 0.06, backgroundColor: '#7a4a12', marginHorizontal: boy * 0.1 }} />
          <View style={{ width: boy * 0.1, height: boy * 0.13, borderRadius: boy * 0.06, backgroundColor: '#7a4a12', marginHorizontal: boy * 0.1 }} />
        </View>
        <View style={{ width: boy * 0.3, height: boy * 0.14, borderBottomLeftRadius: boy * 0.15, borderBottomRightRadius: boy * 0.15, borderWidth: boy * 0.035, borderTopWidth: 0, borderColor: '#9a5a10', marginTop: boy * 0.03 }} />
        <View style={{ position: 'absolute', left: boy * 0.14, top: boy * 0.56, width: boy * 0.14, height: boy * 0.08, borderRadius: boy * 0.05, backgroundColor: 'rgba(255,120,120,0.45)' }} />
        <View style={{ position: 'absolute', right: boy * 0.14, top: boy * 0.56, width: boy * 0.14, height: boy * 0.08, borderRadius: boy * 0.05, backgroundColor: 'rgba(255,120,120,0.45)' }} />
      </View>
    </View>
  );
}

// ---------- ay (gece): uykulu yüzlü hilal-dolunay, hafif ışıltılı hale ----------
function Ay({ x, y, boy, hareket }) {
  const nefes = useDongu(5200, hareket);
  const olcek = nefes.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });
  return (
    <View style={{ position: 'absolute', left: x - boy, top: y - boy, width: boy * 2, height: boy * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: boy * 1.8, height: boy * 1.8, borderRadius: boy, backgroundColor: 'rgba(255,248,200,0.18)', transform: [{ scale: olcek }] }} />
      <View style={{ position: 'absolute', width: boy * 1.35, height: boy * 1.35, borderRadius: boy, backgroundColor: 'rgba(255,248,200,0.25)' }} />
      <View style={{ width: boy, height: boy, borderRadius: boy / 2, backgroundColor: '#fff4c2', borderWidth: boy * 0.04, borderColor: '#e8d98a', alignItems: 'center', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: boy * 0.58, top: boy * 0.18, width: boy * 0.16, height: boy * 0.16, borderRadius: boy, backgroundColor: 'rgba(214,196,120,0.45)' }} />
        <View style={{ position: 'absolute', left: boy * 0.2, top: boy * 0.66, width: boy * 0.12, height: boy * 0.12, borderRadius: boy, backgroundColor: 'rgba(214,196,120,0.45)' }} />
        {/* kapalı, uykulu gözler */}
        <View style={{ flexDirection: 'row', marginTop: boy * 0.4 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ width: boy * 0.16, height: boy * 0.08, borderBottomLeftRadius: boy * 0.1, borderBottomRightRadius: boy * 0.1, borderWidth: boy * 0.03, borderTopWidth: 0, borderColor: '#8a7330', marginHorizontal: boy * 0.08 }} />
          ))}
        </View>
        <View style={{ width: boy * 0.16, height: boy * 0.07, borderBottomLeftRadius: boy * 0.1, borderBottomRightRadius: boy * 0.1, borderWidth: boy * 0.03, borderTopWidth: 0, borderColor: '#8a7330', marginTop: boy * 0.06 }} />
        <View style={{ position: 'absolute', left: boy * 0.12, top: boy * 0.55, width: boy * 0.14, height: boy * 0.07, borderRadius: boy, backgroundColor: 'rgba(255,150,150,0.4)' }} />
        <View style={{ position: 'absolute', right: boy * 0.12, top: boy * 0.55, width: boy * 0.14, height: boy * 0.07, borderRadius: boy, backgroundColor: 'rgba(255,150,150,0.4)' }} />
      </View>
    </View>
  );
}

// ---------- yıldızlar (gece): göğün üst yarısında göz kırpan noktalar ----------
function Yildizlar({ EG, EY, hareket }) {
  const v = useDongu(3600, hareket);
  const noktalar = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: ((i * 0.381 + 0.07) % 1) * EG, y: ((i * 0.613 + 0.03) % 1) * EY * 0.62, r: 1 + (i % 3) * 0.7, faz: (i % 5) / 5 })), [EG, EY]);
  return noktalar.map((n, i) => (
    <Animated.View
      key={i}
      style={{
        position: 'absolute',
        left: n.x,
        top: n.y,
        width: n.r * 2,
        height: n.r * 2,
        borderRadius: n.r,
        backgroundColor: '#ffffff',
        opacity: i % 3 === 0 ? Animated.modulo(Animated.add(v, n.faz), 1).interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }) : 0.8,
      }}
    />
  ));
}

// ---------- ateş böceği (gece): sarı ışık, yavaşça süzülür ve yanıp söner ----------
function AtesBocegi({ x, y, sure, bas, EG, hareket }) {
  const v = useDongu(sure, hareket);
  const yan = useDongu(1800 + (bas * 1000), hareket);
  const t = Animated.modulo(Animated.add(v, bas), 1);
  const tx = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, EG * 0.12, EG * 0.04, -EG * 0.1, 0] });
  const ty = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -30, -8, -36, 0] });
  const op = yan.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 1, 0.25] });
  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, width: 18, height: 18, alignItems: 'center', justifyContent: 'center', opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }}>
      <View style={{ position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,236,80,0.5)' }} />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff59a' }} />
    </Animated.View>
  );
}

// ---------- parıltı (Kristal Bahçe): aşağıdan yukarı süzülen, dönerek parlayan küçük yıldız ----------
function Parilti({ x, sure, bas, renk, EY, hareket }) {
  const v = useDongu(sure, hareket);
  const t = Animated.modulo(Animated.add(v, bas), 1);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [EY * 0.95, -20] });
  const tx = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 10, 0, -10, 0] });
  const op = t.interpolate({ inputRange: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], outputRange: [0, 1, 0.4, 1, 0.4, 1, 0] });
  const donus = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.Text style={{ position: 'absolute', left: x, top: 0, fontSize: 14, lineHeight: 16, color: renk, textShadowColor: 'rgba(120,180,255,0.8)', textShadowRadius: 4, opacity: op, transform: [{ translateY: ty }, { translateX: tx }, { rotate: donus }] }}>
      ✦
    </Animated.Text>
  );
}

// ---------- bulut ----------
function Bulut({ y, olcek, sure, bas, EG, saydam, hareket }) {
  const v = useDongu(sure, hareket);
  const g = 130 * olcek;
  const tx = Animated.modulo(Animated.add(v, bas), 1).interpolate({ inputRange: [0, 1], outputRange: [-g - 20, EG + 20] });
  const daire = (x, yy, r, renk) => <View key={`${x}-${yy}`} style={{ position: 'absolute', left: (x - r) * olcek, top: (yy - r) * olcek, width: r * 2 * olcek, height: r * 2 * olcek, borderRadius: r * olcek, backgroundColor: renk }} />;
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: y, width: g, height: 70 * olcek, opacity: saydam, transform: [{ translateX: tx }] }}>
      {/* alt gölge */}
      <View style={{ position: 'absolute', left: 6 * olcek, top: 40 * olcek, width: 118 * olcek, height: 26 * olcek, borderRadius: 13 * olcek, backgroundColor: '#dcecfa' }} />
      {daire(36, 36, 24, '#dcecfa')}
      {daire(70, 30, 30, '#dcecfa')}
      {daire(100, 40, 20, '#dcecfa')}
      <View style={{ position: 'absolute', left: 4 * olcek, top: 36 * olcek, width: 120 * olcek, height: 26 * olcek, borderRadius: 13 * olcek, backgroundColor: '#ffffff' }} />
      {daire(36, 33, 22, '#ffffff')}
      {daire(70, 27, 28, '#ffffff')}
      {daire(100, 37, 18, '#ffffff')}
    </Animated.View>
  );
}

// ---------- tepe (büyük daire) ----------
function Tepe({ cx, ust, cap, renk }) {
  return (
    <>
      <View style={{ position: 'absolute', left: cx - cap / 2, top: ust, width: cap, height: cap, borderRadius: cap / 2, backgroundColor: renk[0] }} />
      <View style={{ position: 'absolute', left: cx - cap / 2 + 3, top: ust + 7, width: cap - 6, height: cap - 6, borderRadius: cap / 2, backgroundColor: renk[1] }} />
    </>
  );
}
// Dairenin x noktasındaki üst kenarı
function tepeY(cx, ust, cap, x) {
  const r = cap / 2;
  const d = Math.min(Math.abs(x - cx), r * 0.98);
  return ust + r - Math.sqrt(r * r - d * d) + 6;
}

// ---------- ağaç ----------
function Agac({ x, y, s, renk }) {
  const daire = (dx, dy, r, c, k) => (
    <View key={k} style={{ position: 'absolute', left: x + (dx - r) * s, top: y + (dy - r) * s, width: r * 2 * s, height: r * 2 * s, borderRadius: r * s, backgroundColor: c }} />
  );
  const [ana, koyu, acik] = renk.tac;
  const noktalar = [
    [-11, -46, 0],
    [7, -58, 1],
    [15, -38, 2],
    [-2, -36, 1],
    [-20, -34, 0],
    [4, -48, 2],
    [-8, -62, 1],
  ];
  return (
    <>
      <View style={{ position: 'absolute', left: x - 5 * s, top: y - 30 * s, width: 10 * s, height: 30 * s, borderRadius: 3 * s, backgroundColor: '#8a5a2b' }} />
      <View style={{ position: 'absolute', left: x - 5 * s, top: y - 30 * s, width: 4 * s, height: 30 * s, borderRadius: 2 * s, backgroundColor: '#a7713c' }} />
      {daire(0, -45, 24, koyu, 'a')}
      {daire(-17, -33, 17, koyu, 'b')}
      {daire(17, -33, 17, koyu, 'c')}
      {daire(0, -48, 22, ana, 'd')}
      {daire(-16, -36, 15, ana, 'e')}
      {daire(16, -36, 15, ana, 'f')}
      {daire(-7, -58, 8, acik, 'g')}
      {noktalar.map(([dx, dy, i], k) => daire(dx, dy, 3.6, renk.nokta[i], `n${k}`))}
    </>
  );
}

// ---------- çiçek ----------
function Cicek({ x, y, renk, s = 1 }) {
  const p = 4.2 * s;
  return (
    <>
      <View style={{ position: 'absolute', left: x - 1, top: y - 10 * s, width: 2, height: 10 * s, backgroundColor: '#4e9a3a' }} />
      {[0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <View
            key={a}
            style={{ position: 'absolute', left: x + Math.cos(r) * p - p, top: y - 12 * s + Math.sin(r) * p - p, width: p * 2, height: p * 2, borderRadius: p, backgroundColor: renk }}
          />
        );
      })}
      <View style={{ position: 'absolute', left: x - 2.6 * s, top: y - 12 * s - 2.6 * s, width: 5.2 * s, height: 5.2 * s, borderRadius: 2.6 * s, backgroundColor: '#ffcf33' }} />
    </>
  );
}

// ---------- uçuşan taç yaprağı / sonbahar yaprağı ----------
function Yaprak({ x, sure, bas, renk, buyuk, EY, hareket }) {
  const v = useDongu(sure, hareket);
  const t = Animated.modulo(Animated.add(v, bas), 1);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [-30, EY * 0.92] });
  const tx = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 22, 0, -22, 0] });
  const donus = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', buyuk ? '540deg' : '400deg'] });
  const op = t.interpolate({ inputRange: [0, 0.06, 0.85, 1], outputRange: [0, 0.95, 0.95, 0] });
  const g = buyuk ? 16 : 11;
  const y = buyuk ? 10 : 7;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: g,
        height: y,
        opacity: op,
        backgroundColor: renk,
        borderTopLeftRadius: y,
        borderBottomRightRadius: y,
        borderTopRightRadius: 1.5,
        borderBottomLeftRadius: 1.5,
        transform: [{ translateY: ty }, { translateX: tx }, { rotate: donus }],
      }}
    />
  );
}

// ---------- kar tanesi ----------
function KarTanesi({ x, sure, bas, buyuk, EY, hareket }) {
  const v = useDongu(sure, hareket);
  const t = Animated.modulo(Animated.add(v, bas), 1);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [-20, EY * 0.95] });
  const tx = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 14, 0, -14, 0] });
  const op = t.interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 0.95, 0.95, 0] });
  const g = buyuk ? 9 : 6;
  return <Animated.View style={{ position: 'absolute', left: x, top: 0, width: g, height: g, borderRadius: g, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(150,190,220,0.6)', opacity: op, transform: [{ translateY: ty }, { translateX: tx }] }} />;
}

// ---------- kelebek ----------
function Kelebek({ y, sure, bas, renk, EG, yon, hareket }) {
  const v = useDongu(sure, hareket);
  const kanat = useDongu(420, hareket);
  const t = Animated.modulo(Animated.add(v, bas), 1);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: yon > 0 ? [-30, EG + 30] : [EG + 30, -30] });
  const ty = t.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -22, 6, -18, 10, 0] });
  const cirp = kanat.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.25, 1] });
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: y, width: 26, height: 22, transform: [{ translateX: tx }, { translateY: ty }, { scaleX: yon }] }}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 26, height: 22, transform: [{ scaleX: cirp }] }}>
        <View style={{ position: 'absolute', left: 0, top: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: renk }} />
        <View style={{ position: 'absolute', left: 14, top: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: renk }} />
        <View style={{ position: 'absolute', left: 2, top: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: renk, opacity: 0.85 }} />
        <View style={{ position: 'absolute', left: 15, top: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: renk, opacity: 0.85 }} />
        <View style={{ position: 'absolute', left: 3, top: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' }} />
        <View style={{ position: 'absolute', left: 19, top: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' }} />
      </Animated.View>
      <View style={{ position: 'absolute', left: 11.5, top: 3, width: 3, height: 15, borderRadius: 2, backgroundColor: '#3b2a1e' }} />
    </Animated.View>
  );
}

function Sahne({ bolum = 0, EG, EY, gunesX, gunesY, gunesBoy = 58 }) {
  const renk = RENKLER[bolum] || RENKLER[0];
  const [hareket, setHareket] = useState(true);
  useEffect(() => {
    let canli = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((a) => canli && setHareket(!a)).catch(() => {});
    const d = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (a) => setHareket(!a));
    return () => {
      canli = false;
      d && d.remove && d.remove();
    };
  }, []);

  // Durgun katman (tepeler, ağaçlar, çiçekler) yalnızca ölçü ya da bölüm değişince yeniden çizilir
  const durgun = useMemo(() => {
    const t1 = { cx: EG * 0.12, ust: EY * 0.755, cap: EG * 1.25 };
    const t2 = { cx: EG * 0.92, ust: EY * 0.775, cap: EG * 1.15 };
    const t3 = { cx: EG * 0.5, ust: EY * 0.875, cap: EG * 2.4 };
    const agaclar = [
      [t1, 0.07, 1.15],
      [t1, 0.24, 0.85],
      [t2, 0.74, 0.95],
      [t2, 0.92, 1.2],
    ];
    const cicekler = [0.06, 0.17, 0.31, 0.45, 0.58, 0.7, 0.83, 0.95];
    return (
      <>
        <Tepe {...t1} renk={renk.tepeArka} />
        <Tepe {...t2} renk={renk.tepeArka2} />
        {agaclar.map(([t, x, s], i) => (
          <Agac key={i} x={EG * x} y={tepeY(t.cx, t.ust, t.cap, EG * x)} s={s * Math.min(1.4, EG / 390)} renk={renk} />
        ))}
        <Tepe {...t3} renk={renk.tepeOn} />
        {cicekler.map((x, i) => (
          <Cicek key={i} x={EG * x} y={tepeY(t3.cx, t3.ust, t3.cap, EG * x) + 14 + (i % 3) * 9} renk={renk.cicek[i % 3]} s={1 + (i % 2) * 0.25} />
        ))}
      </>
    );
  }, [bolum, EG, EY]);

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }} {...GIZLI}>
      <Gok renk={renk.gok} EY={EY} />
      {renk.gece && <Yildizlar EG={EG} EY={EY} hareket={hareket} />}
      {renk.gece ? (
        <Ay x={gunesX ?? EG - 62} y={gunesY ?? EY * 0.085} boy={gunesBoy} hareket={hareket} />
      ) : (
        <Gunes x={gunesX ?? EG - 62} y={gunesY ?? EY * 0.085} boy={gunesBoy} renk={renk.gunes} kenar={renk.gunesKenar} hareket={hareket} />
      )}
      <Bulut y={EY * 0.035} olcek={0.8} sure={70000} bas={0.15} EG={EG} saydam={renk.gece ? 0.22 : 0.95} hareket={hareket} />
      <Bulut y={EY * 0.2} olcek={1.1} sure={95000} bas={0.6} EG={EG} saydam={renk.gece ? 0.2 : 0.9} hareket={hareket} />
      <Bulut y={EY * 0.42} olcek={0.9} sure={82000} bas={0.35} EG={EG} saydam={renk.gece ? 0.18 : 0.85} hareket={hareket} />
      <Bulut y={EY * 0.6} olcek={0.7} sure={60000} bas={0.85} EG={EG} saydam={renk.gece ? 0.16 : 0.8} hareket={hareket} />
      {durgun}
      {renk.parca.map((p, i) =>
        p.tip === 'parilti' ? (
          <Parilti key={i} x={EG * ((i * 0.27 + 0.06) % 1)} sure={12000 + i * 1600} bas={(i * 0.19) % 1} renk={p.renk} EY={EY} hareket={hareket} />
        ) : p.tip === 'atesbocegi' ? (
          <AtesBocegi key={i} x={EG * ((i * 0.29 + 0.1) % 1)} y={EY * (0.7 + (i % 3) * 0.08)} sure={9000 + i * 1300} bas={(i * 0.23) % 1} EG={EG} hareket={hareket} />
        ) : p.tip === 'kar' ? (
          <KarTanesi key={i} x={EG * ((i * 0.17 + 0.05) % 1)} sure={14000 + i * 1900} bas={(i * 0.31) % 1} buyuk={p.buyuk} EY={EY} hareket={hareket} />
        ) : p.tip === 'kelebek' ? (
          <Kelebek key={i} y={EY * (0.66 + (i % 3) * 0.07)} sure={16000 + i * 3500} bas={(i * 0.37) % 1} renk={p.renk} EG={EG} yon={i % 2 ? -1 : 1} hareket={hareket} />
        ) : (
          <Yaprak key={i} x={EG * ((i * 0.23 + 0.08) % 1)} sure={11000 + i * 1700} bas={(i * 0.29) % 1} renk={p.renk} buyuk={p.buyuk} EY={EY} hareket={hareket} />
        )
      )}
    </View>
  );
}

export default React.memo(Sahne);
