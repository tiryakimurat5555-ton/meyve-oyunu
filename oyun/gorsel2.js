// 33-49. bölümlerin parça ve tahta çizimleri (kodla; PNG gelince yerlerine geçecek). gorsel.js'teki Parca bunları kullanır.
// Burada gorsel.js içe aktarılmaz (döngü olmasın); meyve resmi gereken çizimlere resim prop olarak verilir.
import React from 'react';
import { Image, Text, View } from 'react-native';

const TAM2 = { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 };
// mantik.js ile aynı sayılar
export const YENI_TUR = { DEV: 35, CAN: 36, SALYANGOZ: 37, KAZAN: 38, VAGON: 39, BOYA: 41, AYNA_T: 42, SINCAP: 43, FINDIK: 44, HAYALET: 45 };
export const RENK = ['#e8323c', '#f5c400', '#8b3fc8', '#ff8a1f', '#5cbf2a', '#2d3f9e'];
export const KURU_Z = 50;
export const TOZ_Z = 51;

function Emoji({ H, e, boy = 0.62, zemin, kenar }) {
  return (
    <View style={{ width: H * 0.86, height: H * 0.86, borderRadius: H * 0.24, backgroundColor: zemin || 'transparent', borderWidth: kenar ? 2.5 : 0, borderColor: kenar, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: H * boy, lineHeight: H * (boy + 0.08) }}>{e}</Text>
    </View>
  );
}

// Yeni türdeki parçalar (meyve olmayanlar)
export function YeniParca({ p, H }) {
  const T = YENI_TUR;
  const e = p.ek || '';
  if (p.tur === T.DEV) return null; // dev meyve tahtanın üstünde tek parça çizilir (DevMeyve)
  if (p.tur === T.CAN) return <Emoji H={H} e="🔔" zemin="#fff3c4" kenar="#d4a017" />;
  if (p.tur === T.SALYANGOZ) return <Emoji H={H} e="🐌" zemin="#e6f6d8" kenar="#7ab04a" />;
  if (p.tur === T.SINCAP) return <Emoji H={H} e="🐿️" zemin="#f6e2cc" kenar="#a8692e" />;
  if (p.tur === T.FINDIK) return <Emoji H={H} e="🌰" boy={0.66} />;
  if (p.tur === T.VAGON) return <Emoji H={H} e="🚃" zemin="#dbe8ff" kenar="#3a63b8" />;
  if (p.tur === T.HAYALET) return <Emoji H={H} e="👻" boy={0.5} zemin="rgba(255,255,255,0.35)" />;
  if (p.tur === T.KAZAN) {
    const n = Number(e.slice(2)) || 0;
    return (
      <View style={{ width: H * 0.88, height: H * 0.88, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: H * 0.82, height: H * 0.6, borderBottomLeftRadius: H * 0.4, borderBottomRightRadius: H * 0.4, borderTopLeftRadius: H * 0.08, borderTopRightRadius: H * 0.08, backgroundColor: '#6b4fa8', borderWidth: 2.5, borderColor: '#3a2a66', overflow: 'hidden', justifyContent: 'flex-end' }}>
          <View style={{ height: `${(n / 4) * 100}%`, backgroundColor: '#7cf08a' }} />
        </View>
        <Text style={{ position: 'absolute', bottom: H * 0.12, fontSize: H * 0.24, fontWeight: '900', color: '#ffffff', textShadowColor: '#000', textShadowRadius: 3 }}>{n}/4</Text>
        <Text style={{ position: 'absolute', top: -H * 0.04, fontSize: H * 0.26 }}>✨</Text>
      </View>
    );
  }
  if (p.tur === T.BOYA) {
    const r = RENK[Number(e.slice(2)) || 0];
    return (
      <View style={{ width: H * 0.8, height: H * 0.8, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: H * 0.62, height: H * 0.56, borderBottomLeftRadius: H * 0.12, borderBottomRightRadius: H * 0.12, backgroundColor: '#d9dee6', borderWidth: 2.5, borderColor: '#6b7480', overflow: 'hidden' }}>
          <View style={{ height: '34%', backgroundColor: r }} />
        </View>
        <View style={{ position: 'absolute', top: H * 0.04, width: H * 0.5, height: H * 0.3, borderTopLeftRadius: H * 0.3, borderTopRightRadius: H * 0.3, borderWidth: 2.5, borderBottomWidth: 0, borderColor: '#6b7480' }} />
        <View style={{ position: 'absolute', bottom: H * 0.36, left: H * 0.48, width: H * 0.14, height: H * 0.28, borderRadius: H * 0.07, backgroundColor: r }} />
      </View>
    );
  }
  if (p.tur === T.AYNA_T) {
    const a = e === 'ayA' ? '-45deg' : '45deg';
    return (
      <View style={{ width: H * 0.86, height: H * 0.86, borderRadius: H * 0.2, backgroundColor: '#e9eef6', borderWidth: 2.5, borderColor: '#7a8aa8', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: H * 0.92, height: H * 0.16, borderRadius: H * 0.05, backgroundColor: '#bfe8ff', borderWidth: 2, borderColor: '#4a6a90', transform: [{ rotate: a }] }} />
      </View>
    );
  }
  return null;
}

// Meyvenin üstündeki yeni örtüler: kristal, kurdele, lav, taş, görünür hayalet
export function EkKatman({ p, H }) {
  const e = p.ek || '';
  if (e.startsWith('kr')) {
    const r = RENK[Number(e.slice(2)) || 0];
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: H * 0.74, height: H * 0.74, borderRadius: H * 0.12, backgroundColor: r, opacity: 0.42, borderWidth: 3, borderColor: r, transform: [{ rotate: '45deg' }] }} />
        <View style={{ position: 'absolute', width: H * 0.74, height: H * 0.74, borderRadius: H * 0.12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', transform: [{ rotate: '45deg' }] }} />
        <View style={{ position: 'absolute', left: H * 0.3, top: H * 0.18, width: H * 0.12, height: H * 0.12, borderRadius: H, backgroundColor: 'rgba(255,255,255,0.85)' }} />
      </View>
    );
  }
  if (e.startsWith('kd')) {
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: H * 0.34, lineHeight: H * 0.4, marginRight: H * 0.02 }}>🎀</Text>
      </View>
    );
  }
  if (e === 'lav')
    return (
      <View pointerEvents="none" style={{ ...TAM2, borderRadius: H * 0.22, backgroundColor: 'rgba(255,80,0,0.55)', borderWidth: 3, borderColor: '#ff3d00', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: H * 0.1, top: H * 0.55, width: H * 0.4, height: H * 0.18, borderRadius: H, backgroundColor: 'rgba(255,220,0,0.8)' }} />
        <View style={{ position: 'absolute', right: H * 0.08, top: H * 0.2, width: H * 0.24, height: H * 0.14, borderRadius: H, backgroundColor: 'rgba(255,220,0,0.8)' }} />
      </View>
    );
  if (e === 'tas')
    return (
      <View pointerEvents="none" style={{ ...TAM2, borderRadius: H * 0.22, backgroundColor: 'rgba(90,90,100,0.72)', borderWidth: 3, borderColor: '#3c3c44' }}>
        <View style={{ position: 'absolute', left: H * 0.2, top: H * 0.3, width: H * 0.4, height: 2, backgroundColor: '#222', transform: [{ rotate: '30deg' }] }} />
        <View style={{ position: 'absolute', left: H * 0.4, top: H * 0.55, width: H * 0.3, height: 2, backgroundColor: '#222', transform: [{ rotate: '-20deg' }] }} />
      </View>
    );
  if (e === 'hy1')
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: H * 0.3, lineHeight: H * 0.36, marginLeft: H * 0.02 }}>👻</Text>
      </View>
    );
  return null;
}

// 2x2 dev meyve (sol üst köşe r, c); kat azaldıkça çatlaklar
export function DevMeyve({ r, c, H, resim, kat, enCok = 4 }) {
  const b = H * 2;
  const catlak = enCok - kat;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H, top: r * H, width: b, height: b, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: b * 0.96, height: b * 0.96, borderRadius: b * 0.2, backgroundColor: 'rgba(255,240,200,0.55)', borderWidth: 3, borderColor: '#d4a017' }} />
      <Image source={resim} style={{ width: b * 0.92, height: b * 0.92 }} resizeMode="contain" />
      {[[0.3, 0.3, 40], [0.55, 0.45, -30], [0.35, 0.62, 15]].slice(0, catlak).map(([x, y, a], i) => (
        <View key={i} style={{ position: 'absolute', left: b * x, top: b * y, width: b * 0.28, height: 3, backgroundColor: '#3a2a1a', transform: [{ rotate: `${a}deg` }] }} />
      ))}
      <View style={{ position: 'absolute', right: 4, bottom: 4, minWidth: H * 0.42, height: H * 0.42, borderRadius: H, backgroundColor: '#d4a017', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: H * 0.26 }}>{kat}</Text>
      </View>
    </View>
  );
}

// Kuru toprak (zemin) ve yıldız tozu (zemin)
export function KuruZemin({ H, r, c }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, backgroundColor: '#c49a6c', borderWidth: 2, borderColor: '#8a6038', overflow: 'hidden' }}>
      {[[0.15, 0.3, 30], [0.45, 0.6, -25], [0.6, 0.2, 60]].map(([x, y, a], i) => (
        <View key={i} style={{ position: 'absolute', left: b * x, top: b * y, width: b * 0.35, height: 2, backgroundColor: '#6e4a28', transform: [{ rotate: `${a}deg` }] }} />
      ))}
    </View>
  );
}
export function TozZemin({ H, r, c }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, backgroundColor: 'rgba(120,100,220,0.35)', borderWidth: 2, borderColor: 'rgba(200,180,255,0.9)' }}>
      <Text style={{ position: 'absolute', right: 2, bottom: 0, fontSize: H * 0.28 }}>✨</Text>
    </View>
  );
}

// Yağmur bulutları: tahtanın üst kenarında, bulutlu sütunların üstünde
export function BulutSerit({ sutunlar, H }) {
  return (
    <>
      {sutunlar.map((c) => (
        <View key={c} pointerEvents="none" style={{ position: 'absolute', left: c * H + 2, top: 0, width: H - 4, height: H * 8, borderRadius: H * 0.2, backgroundColor: 'rgba(90,150,230,0.26)' }}>
          <Text style={{ position: 'absolute', top: -H * 0.08, left: H * 0.18, fontSize: H * 0.42, opacity: 0.95 }}>🌧️</Text>
        </View>
      ))}
    </>
  );
}

// Işık kulesinin ışın yolu (hücre listesi)
export function IsikHatti({ yol, H }) {
  return (
    <>
      {yol.map(([r, c], i) => (
        <View key={i} pointerEvents="none" style={{ position: 'absolute', left: c * H + H * 0.18, top: r * H + H * 0.18, width: H * 0.64, height: H * 0.64, borderRadius: H, backgroundColor: 'rgba(255,236,90,0.33)', borderWidth: 2, borderColor: 'rgba(255,214,0,0.55)' }} />
      ))}
      {yol.length ? <Text style={{ position: 'absolute', left: -H * 0.05, top: yol[0][0] * H - H * 0.05, fontSize: H * 0.36 }}>🗼</Text> : null}
    </>
  );
}

// Tren rayı (vagonların gittiği satır) ve istasyon
export function Ray({ satir, H }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: satir * H + H * 0.78, width: H * 8, height: H * 0.16 }}>
      <View style={{ ...TAM2, borderTopWidth: 3, borderBottomWidth: 3, borderColor: 'rgba(110,80,50,0.7)' }} />
      <Text style={{ position: 'absolute', right: 0, top: -H * 0.62, fontSize: H * 0.34 }}>🚉</Text>
    </View>
  );
}

// Terazi: tahtanın ortasında çizgi
export function TeraziCizgi({ H }) {
  return <View pointerEvents="none" style={{ position: 'absolute', left: H * 4 - 2, top: 0, width: 4, height: H * 8, backgroundColor: 'rgba(200,150,40,0.6)', borderRadius: 2 }} />;
}

// Hedef simgeleri
const ik = (e) =>
  function Ikon({ boy = 26 }) {
    return <Text style={{ fontSize: boy * 0.8, lineHeight: boy, width: boy, textAlign: 'center' }}>{e}</Text>;
  };
export const DevIkon = ik('🍉');
export const KurdeleIkon = ik('🎀');
export const KristalIkon = ik('💎');
export const CanIkon = ik('🔔');
export const ToprakIkon = ik('🌱');
export const SalyangozIkon = ik('🐌');
export const KazanIkon = ik('⚗️');
export const VagonIkon = ik('🚃');
export const LavIkon = ik('🌋');
export const HayaletIkon = ik('👻');
export const BoyaIkon = ik('🎨');
export const FindikIkon = ik('🌰');
export const TozIkon = ik('✨');
export const SolIkon = ik('⬅️');
export const SagIkon = ik('➡️');
