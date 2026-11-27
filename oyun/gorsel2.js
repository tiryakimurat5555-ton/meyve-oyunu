// 33-49. bölümlerin parça ve tahta çizimleri (kodla; PNG gelince yerlerine geçecek). gorsel.js'teki Parca bunları kullanır.
// Burada gorsel.js içe aktarılmaz (döngü olmasın); meyve resmi gereken çizimlere resim prop olarak verilir.
import React from 'react';
import { Image, Text, View } from 'react-native';

const TAM2 = { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 };
// mantik.js ile aynı sayılar
export const YENI_TUR = { DEV: 35, CAN: 36, SALYANGOZ: 37, KAZAN: 38, VAGON: 39, BOYA: 41, AYNA_T: 42, SINCAP: 43, FINDIK: 44, HAYALET: 45, KAVANOZ: 46, KAPALI: 47, BASINC: 48, POMPA: 49, TIRTIL: 52, MIKNATIS: 53, KARINCA: 54, KOMUR: 55, PARATONER: 56, AYI: 57, ORUMCEK: 58, BORU: 59, FIDAN: 61, FIRILDAK: 62, EJDERHA: 63, KART: 64, HAYVAN: 65, FISEK: 66, LABUT: 67, TOP: 68 };
export const yeniParcaMi = (v) => (v >= 35 && v <= 49) || (v >= 52 && v <= 59) || (v >= 61 && v <= 68);
const KART_E = ['⭐', '❤️', '🌙', '☀️', '🌸', '🍀'];
const HAYVAN_E = ['🦔', '🐒', '🦊', '🐰', '🐴', '🐻'];
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
  if (p.tur === T.KAVANOZ) return <Emoji H={H} e="🍯" boy={0.66} />;
  if (p.tur === T.KAPALI)
    return (
      <View style={{ width: H, height: H, backgroundColor: '#3f7a32', borderWidth: 2, borderColor: '#2a5622', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.34, opacity: 0.8 }}>🌿</Text>
      </View>
    );
  if (p.tur === T.BASINC) return <Emoji H={H} e="🔘" zemin="#d8d2c4" kenar="#7a7060" />;
  if (p.tur === T.POMPA) return <Emoji H={H} e="🚰" zemin="#d6ecff" kenar="#3a7ac8" />;
  if (p.tur === T.TIRTIL) return e === 'tr1' ? <Emoji H={H} e="🥚" boy={0.5} zemin="#f2ead2" kenar="#b89a5a" /> : <Emoji H={H} e="🐛" zemin="#e2f5d0" kenar="#6aa83a" />;
  if (p.tur === T.KARINCA) return <Emoji H={H} e="🐜" zemin="#f3e4cc" kenar="#8a5a2a" />;
  if (p.tur === T.KOMUR)
    return (
      <View style={{ width: H * 0.86, height: H * 0.86, borderRadius: H * 0.2, backgroundColor: '#2e2e34', borderWidth: 2.5, borderColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', left: H * 0.15, top: H * 0.2, width: H * 0.2, height: H * 0.12, borderRadius: H, backgroundColor: '#55555f' }} />
        {p.kat < 2 ? <View style={{ position: 'absolute', left: H * 0.2, top: H * 0.45, width: H * 0.45, height: 3, backgroundColor: '#ff8a3d', transform: [{ rotate: '-25deg' }] }} /> : null}
        <Text style={{ position: 'absolute', right: 3, bottom: 1, color: '#fff', fontWeight: '900', fontSize: H * 0.24 }}>{p.kat}</Text>
      </View>
    );
  if (p.tur === T.PARATONER) {
    const n = Number(e.slice(2)) || 0;
    return (
      <View style={{ width: H * 0.86, height: H * 0.86, borderRadius: H * 0.2, backgroundColor: n ? '#fff3a8' : '#e2e6ee', borderWidth: 2.5, borderColor: '#7a8aa8', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.48 }}>⚡</Text>
        <Text style={{ position: 'absolute', right: 3, bottom: 1, fontWeight: '900', fontSize: H * 0.22, color: '#3a4a6a' }}>{n}/3</Text>
      </View>
    );
  }
  if (p.tur === T.AYI) return <Emoji H={H} e="🐻" zemin="#f0dcc0" kenar="#8a5a2a" />;
  if (p.tur === T.KART) {
    const resim = Number(e.slice(2, e.indexOf('_'))) || 0;
    const acik = Number(e.slice(e.indexOf('_') + 1)) || 0;
    return acik ? <Emoji H={H} e={KART_E[resim]} boy={0.52} zemin="#ffffff" kenar="#e0a02e" /> : (
      <View style={{ width: H * 0.82, height: H * 0.86, borderRadius: H * 0.14, backgroundColor: '#4a6ad8', borderWidth: 3, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.36, color: '#ffffff', fontWeight: '900' }}>?</Text>
      </View>
    );
  }
  if (p.tur === T.HAYVAN) {
    const tur = Number(e.slice(2, e.indexOf('_'))) || 0;
    const n = Number(e.slice(e.indexOf('_') + 1)) || 0;
    return (
      <View style={{ width: H * 0.88, height: H * 0.88, borderRadius: H * 0.22, backgroundColor: '#fff6e0', borderWidth: 3, borderColor: RENK[tur], alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.5 }}>{HAYVAN_E[tur]}</Text>
        <View style={{ position: 'absolute', bottom: 1, right: 1, width: H * 0.26, height: H * 0.26, borderRadius: H, backgroundColor: RENK[tur] }} />
        <Text style={{ position: 'absolute', top: 0, left: 3, fontSize: H * 0.2, fontWeight: '900', color: '#5a3a1a' }}>{n}/2</Text>
      </View>
    );
  }
  if (p.tur === T.FISEK) return <Emoji H={H} e="🎆" zemin="#2a2450" kenar="#ffd84a" />;
  if (p.tur === T.LABUT) return <Emoji H={H} e="🎳" boy={0.56} zemin="#ffffff" kenar="#c8401a" />;
  if (p.tur === T.TOP) return <Emoji H={H} e="🎱" zemin="#e8eef8" kenar="#2a3a6a" />;
  if (p.tur === T.ORUMCEK) return <Emoji H={H} e="🕷️" zemin="#e8e4f0" kenar="#5a4a7a" />;
  if (p.tur === T.EJDERHA) return <Emoji H={H} e="🐉" zemin="#fbe0d0" kenar="#d0502a" />;
  if (p.tur === T.FIDAN) {
    const n = Number(e.slice(2)) || 0;
    return <Emoji H={H} e={['🌱', '🌿', '🪴', '🌳'][n]} boy={0.5 + n * 0.06} zemin="#e4f4d4" kenar="#5a9a3a" />;
  }
  if (p.tur === T.FIRILDAK) {
    const y = Number(e.slice(2)) || 0;
    return (
      <View style={{ width: H * 0.88, height: H * 0.88, borderRadius: H, backgroundColor: '#fff4e0', borderWidth: 2.5, borderColor: '#e08a2e', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.4 }}>🌀</Text>
        <Text style={{ position: 'absolute', fontSize: H * 0.34, fontWeight: '900', color: '#c8401a', transform: [{ rotate: `${y * 90}deg` }, { translateY: -H * 0.28 }] }}>▲</Text>
      </View>
    );
  }
  if (p.tur === T.BORU) {
    const yatay = e === 'bry';
    return (
      <View style={{ width: H, height: H, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: yatay ? H : H * 0.42, height: yatay ? H * 0.42 : H, backgroundColor: '#8fa4b8', borderColor: '#4a5a6a', borderTopWidth: yatay ? 3 : 0, borderBottomWidth: yatay ? 3 : 0, borderLeftWidth: yatay ? 0 : 3, borderRightWidth: yatay ? 0 : 3 }} />
        <View style={{ position: 'absolute', width: H * 0.5, height: H * 0.5, borderRadius: H * 0.1, backgroundColor: '#6a8296', borderWidth: 2, borderColor: '#3a4a5a' }} />
      </View>
    );
  }
  if (p.tur === T.MIKNATIS) {
    const tur = Number(e.slice(2, e.indexOf('_'))) || 0;
    const n = Number(e.slice(e.indexOf('_') + 1)) || 0;
    return (
      <View style={{ width: H * 0.88, height: H * 0.88, borderRadius: H * 0.22, backgroundColor: '#f4f4f6', borderWidth: 3, borderColor: RENK[tur], alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: H * 0.48 }}>🧲</Text>
        <View style={{ position: 'absolute', bottom: 2, minWidth: H * 0.4, paddingHorizontal: 3, borderRadius: H, backgroundColor: RENK[tur] }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: H * 0.2, textAlign: 'center' }}>{n}/5</Text>
        </View>
      </View>
    );
  }
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
  if (e === 'su')
    return (
      <View pointerEvents="none" style={{ ...TAM2, borderRadius: H * 0.12, backgroundColor: 'rgba(60,140,230,0.48)', borderTopWidth: 3, borderColor: 'rgba(200,235,255,0.95)' }}>
        <Text style={{ position: 'absolute', right: 2, top: 0, fontSize: H * 0.22 }}>💧</Text>
      </View>
    );
  if (e === 'ag')
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: H * 0.2 }}>
        <Text style={{ fontSize: H * 0.7, opacity: 0.85 }}>🕸️</Text>
      </View>
    );
  if (e === 'blk')
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: H * 0.42, marginRight: -2, marginBottom: -4 }}>🐟</Text>
      </View>
    );
  if (e === 'ab')
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: H * 0.3, textShadowColor: '#fff36a', textShadowRadius: 8 }}>✨</Text>
      </View>
    );
  if (e === 'kos')
    return (
      <View pointerEvents="none" style={{ ...TAM2, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: H * 0.62, height: H * 0.44, borderTopLeftRadius: H * 0.3, borderTopRightRadius: H * 0.3, backgroundColor: '#8a5a3a', borderWidth: 2, borderColor: '#4a2a1a', alignItems: 'center' }}>
          <Text style={{ fontSize: H * 0.3, marginTop: H * 0.02 }}>👀</Text>
        </View>
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

// Şelale taşı (zemin, 1-2 kat) ve mozaik karo (zemin, renkli)
export function KayaZemin({ H, r, c, kat }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.18, backgroundColor: kat >= 2 ? '#7c7f88' : '#a3a7b0', borderWidth: 2, borderColor: '#4c4f58' }}>
      <View style={{ position: 'absolute', left: b * 0.15, top: b * 0.55, width: b * 0.4, height: 2, backgroundColor: '#3a3c44', transform: [{ rotate: '20deg' }] }} />
      {kat >= 2 ? <View style={{ position: 'absolute', left: b * 0.5, top: b * 0.25, width: b * 0.35, height: 2, backgroundColor: '#3a3c44', transform: [{ rotate: '-30deg' }] }} /> : null}
    </View>
  );
}
export function MozaikZemin({ H, r, c, tur }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.1, backgroundColor: '#f4efe4', borderWidth: 4, borderColor: RENK[tur] }}>
      <View style={{ position: 'absolute', left: b * 0.38, top: b * 0.38, width: b * 0.16, height: b * 0.16, backgroundColor: RENK[tur], transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}
// Karınca yolu (hücre listesi; son hücre yuva) ve şelale sütunları
export function KarincaYolu({ yol, H }) {
  return (
    <>
      {yol.map(([r, c], i) => (
        <View key={i} pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: H - 3, height: H - 3, borderRadius: H * 0.2, backgroundColor: 'rgba(170,120,60,0.42)', borderWidth: 2, borderColor: 'rgba(120,80,30,0.6)' }} />
      ))}
      {yol.length ? <Text style={{ position: 'absolute', left: yol[yol.length - 1][1] * H + H * 0.5, top: yol[yol.length - 1][0] * H - H * 0.15, fontSize: H * 0.36 }}>🏠</Text> : null}
    </>
  );
}
export function SelaleSerit({ selale, H }) {
  return (
    <>
      {selale.map(([c, tur]) => (
        <View key={c} pointerEvents="none" style={{ position: 'absolute', left: c * H + 3, top: 0, width: H - 6, height: H * 8, borderRadius: H * 0.2, backgroundColor: 'rgba(120,200,255,0.32)', borderLeftWidth: 3, borderRightWidth: 3, borderColor: RENK[tur] }}>
          <Text style={{ position: 'absolute', top: -H * 0.1, left: H * 0.22, fontSize: H * 0.36 }}>💦</Text>
        </View>
      ))}
    </>
  );
}

// Nota karosu (1-4), köstebek yuvası, güneş / ay çiçeği (açıkken parlak)
export function NotaZemin({ H, r, c, k }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.18, backgroundColor: '#e6dcff', borderWidth: 3, borderColor: '#7a5ad8' }}>
      <Text style={{ position: 'absolute', left: 3, top: 0, fontSize: H * 0.26, fontWeight: '900', color: '#5a3ab8' }}>{k}</Text>
      <Text style={{ position: 'absolute', right: 3, bottom: 0, fontSize: H * 0.26, color: '#5a3ab8' }}>♪</Text>
    </View>
  );
}
export function YuvaZemin({ H, r, c }) {
  return <View pointerEvents="none" style={{ position: 'absolute', left: c * H + H * 0.1, top: r * H + H * 0.55, width: H * 0.8, height: H * 0.38, borderRadius: H, backgroundColor: '#6a4a2a', borderWidth: 2, borderColor: '#3a2410' }} />;
}
export function GunAyZemin({ H, r, c, gunes, acik }) {
  const b = H - 3;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.22, backgroundColor: gunes ? 'rgba(255,214,60,0.45)' : 'rgba(90,100,200,0.45)', borderWidth: 3, borderColor: gunes ? '#f0a000' : '#4a4ab0', opacity: acik ? 1 : 0.4 }}>
      <Text style={{ position: 'absolute', right: 1, top: -1, fontSize: H * 0.26 }}>{gunes ? '☀️' : '🌙'}</Text>
    </View>
  );
}

// Meyvenin üstünde köşe rozetleri: nota numarası, güneş / ay
export function ZeminRozet({ H, r, c, yazi, renk, soluk }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1, top: r * H + 1, minWidth: H * 0.34, height: H * 0.34, paddingHorizontal: 2, borderRadius: H, backgroundColor: renk, opacity: soluk ? 0.45 : 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' }}>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: H * 0.2 }}>{yazi}</Text>
    </View>
  );
}

// Reçel ve yankı (zemin), buz pisti, olta sütunu, karanlık örtü
export function RecelZemin({ H, r, c }) {
  const b = H - 3;
  return <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 1.5, top: r * H + 1.5, width: b, height: b, borderRadius: H * 0.24, backgroundColor: 'rgba(214,40,90,0.5)', borderWidth: 2, borderColor: '#b01850' }} />;
}
export function YankiZemin({ H, r, c, n }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: c * H + H * 0.06, top: r * H + H * 0.06, width: H * 0.88, height: H * 0.88, borderRadius: H, borderWidth: n >= 2 ? 2 : 4, borderColor: 'rgba(120,80,220,0.85)', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ position: 'absolute', right: 0, top: -2, fontSize: H * 0.2, fontWeight: '900', color: '#5a3ab8' }}>{n}</Text>
    </View>
  );
}
export function PistZemin({ H, r, c }) {
  const b = H - 1;
  return <View pointerEvents="none" style={{ position: 'absolute', left: c * H + 0.5, top: r * H + 0.5, width: b, height: b, backgroundColor: 'rgba(190,235,255,0.7)', borderWidth: 1, borderColor: 'rgba(120,190,230,0.9)' }} />;
}
export function OltaSerit({ sutunlar, H }) {
  return (
    <>
      {sutunlar.map((c) => (
        <View key={c} pointerEvents="none" style={{ position: 'absolute', left: c * H + H * 0.45, top: 0, width: 2, height: H * 8, backgroundColor: 'rgba(60,60,60,0.35)' }}>
          <Text style={{ position: 'absolute', top: -H * 0.1, left: -H * 0.18, fontSize: H * 0.34 }}>🎣</Text>
        </View>
      ))}
    </>
  );
}
export function KaranlikKatman({ H, r, c }) {
  return <View pointerEvents="none" style={{ position: 'absolute', left: c * H, top: r * H, width: H, height: H, backgroundColor: 'rgba(8,10,30,0.95)' }} />;
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
export const PompaIkon = ik('🚰');
export const KelebekIkon = ik('🦋');
export const KapiIkon = ik('🚪');
export const MozaikIkon = ik('🟥');
export const MiknatisIkon = ik('🧲');
export const KayaIkon = ik('🪨');
export const KarincaIkon = ik('🐜');
export const KomurIkon = ik('⚫');
export const KavanozIkon = ik('🍯');
export const AgIkon = ik('🕸️');
export const OrumcekIkon = ik('🕷️');
export const NotaIkon = ik('🎵');
export const HazineIkon = ik('💰');
export const KostebekIkon = ik('🐹');
export const BoruIkon = ik('🚿');
export const AgacIkon = ik('🌳');
export const FirildakIkon = ik('🌀');
export const GunesIkon = ik('☀️');
export const AyIkon = ik('🌙');
export const KartIkon = ik('🃏');
export const HayvanIkon = ik('🐰');
export const RecelIkon = ik('🍓');
export const FisekIkon = ik('🎆');
export const BalikIkon = ik('🐟');
export const LabutIkon = ik('🎳');
