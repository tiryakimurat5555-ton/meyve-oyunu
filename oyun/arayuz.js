// Ana ekran, harita ve günlük ödül için kodla çizilen arayüz parçaları.
// Higgsfield PNG'leri gelince her bileşen kendi PNG'sini çizer; PNG yoksa bu kod çizimleri yedek olarak kalır.
import React from 'react';
import { Text, View } from 'react-native';

// ---------- Güçlendirici simgeleri (PNG gelene kadar emoji / yazı) ----------
export function GucSimge({ ad, boy = 24 }) {
  if (ad === 'can') return <Text style={{ fontSize: boy * 0.82, lineHeight: boy * 1.05, textAlign: 'center', minWidth: boy }}>❤️</Text>;
  if (ad === 'sinirsiz')
    return (
      <View style={{ width: boy, height: boy, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: boy * 0.82, lineHeight: boy * 1.05 }}>❤️</Text>
        <Text style={{ position: 'absolute', fontSize: boy * 0.42, fontWeight: '900', color: '#ffffff' }}>∞</Text>
      </View>
    );
  if (ad === 'hamle3')
    return <Text style={{ fontSize: boy * 0.78, lineHeight: boy, fontWeight: '900', color: '#2fae4f', textAlign: 'center', minWidth: boy }}>+3</Text>;
  return <Text style={{ fontSize: boy * 0.82, lineHeight: boy * 1.05, textAlign: 'center', minWidth: boy }}>{ad === 'cekic' ? '🔨' : '🔄'}</Text>;
}

// ---------- Hasır sepet (günlük ödül) ----------
// acik: bezi kalkmış, içi boş görünür
export function Sepet({ boy = 80, acik = false, parlak = false }) {
  const b = boy;
  return (
    <View style={{ width: b, height: b, alignItems: 'center', justifyContent: 'flex-end' }}>
      {parlak && <View style={{ position: 'absolute', width: b * 1.15, height: b * 1.15, borderRadius: b, top: -b * 0.08, backgroundColor: 'rgba(255,214,60,0.45)' }} />}
      {/* Sap */}
      <View style={{ position: 'absolute', top: b * 0.06, width: b * 0.62, height: b * 0.5, borderTopLeftRadius: b, borderTopRightRadius: b, borderWidth: b * 0.06, borderBottomWidth: 0, borderColor: '#a8692c' }} />
      {/* Gövde: örgü çizgileri */}
      <View style={{ width: b * 0.86, height: b * 0.52, borderBottomLeftRadius: b * 0.22, borderBottomRightRadius: b * 0.22, borderTopLeftRadius: b * 0.06, borderTopRightRadius: b * 0.06, backgroundColor: '#d9984a', borderWidth: 2, borderColor: '#8a5320', overflow: 'hidden' }}>
        {[0.22, 0.48, 0.74].map((y) => (
          <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: b * 0.52 * y, height: 2, backgroundColor: '#b0702e' }} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((x) => (
          <View key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: b * 0.86 * x, width: 2, backgroundColor: '#c07f38' }} />
        ))}
      </View>
      {/* Üst kenar */}
      <View style={{ position: 'absolute', bottom: b * 0.48, width: b * 0.92, height: b * 0.1, borderRadius: b, backgroundColor: '#c4823a', borderWidth: 2, borderColor: '#8a5320' }} />
      {/* Bez örtü (kapalıyken) */}
      {!acik && (
        <View style={{ position: 'absolute', bottom: b * 0.52, width: b * 0.8, height: b * 0.24, borderTopLeftRadius: b * 0.3, borderTopRightRadius: b * 0.3, backgroundColor: '#ff6b6b', borderWidth: 2, borderColor: '#c0392b', overflow: 'hidden' }}>
          {[0.15, 0.45, 0.75].map((x) => (
            <View key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: b * 0.8 * x, width: b * 0.08, backgroundColor: 'rgba(255,255,255,0.7)' }} />
          ))}
        </View>
      )}
    </View>
  );
}

// ---------- Hazine sandığı (7. gün) ----------
export function Sandik({ boy = 110, acik = false, parlak = false }) {
  const b = boy;
  return (
    <View style={{ width: b, height: b * 0.86, alignItems: 'center', justifyContent: 'flex-end' }}>
      {parlak && <View style={{ position: 'absolute', width: b * 1.2, height: b * 1.05, borderRadius: b, top: -b * 0.1, backgroundColor: 'rgba(255,214,60,0.5)' }} />}
      {/* Kapak */}
      <View
        style={{
          position: 'absolute',
          bottom: b * 0.42,
          width: b * 0.9,
          height: b * 0.3,
          borderTopLeftRadius: b * 0.3,
          borderTopRightRadius: b * 0.3,
          backgroundColor: '#a0522d',
          borderWidth: 3,
          borderColor: '#6b3410',
          transform: acik ? [{ translateY: -b * 0.12 }, { rotate: '-14deg' }] : [],
        }}
      >
        <View style={{ position: 'absolute', left: b * 0.38, top: 0, bottom: 0, width: b * 0.1, backgroundColor: '#ffc21a' }} />
      </View>
      {acik && <View style={{ position: 'absolute', bottom: b * 0.4, width: b * 0.8, height: b * 0.08, borderRadius: b, backgroundColor: '#ffe680' }} />}
      {/* Gövde */}
      <View style={{ width: b * 0.9, height: b * 0.44, borderBottomLeftRadius: b * 0.08, borderBottomRightRadius: b * 0.08, backgroundColor: '#b5632f', borderWidth: 3, borderColor: '#6b3410', alignItems: 'center' }}>
        <View style={{ position: 'absolute', left: b * 0.38, top: 0, bottom: 0, width: b * 0.1, backgroundColor: '#ffc21a' }} />
        <View style={{ marginTop: b * 0.06, width: b * 0.16, height: b * 0.16, borderRadius: b * 0.04, backgroundColor: '#ffd84a', borderWidth: 2, borderColor: '#b07800' }} />
      </View>
    </View>
  );
}

// ---------- Ahşap raf ----------
export function Raf({ genislik }) {
  return (
    <View style={{ width: genislik, height: 22, alignItems: 'center' }}>
      <View style={{ width: genislik, height: 14, borderRadius: 4, backgroundColor: '#b8783c', borderWidth: 2, borderColor: '#7a4a1c' }}>
        <View style={{ position: 'absolute', left: 6, right: 6, top: 3, height: 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: genislik * 0.8 }}>
        <View style={{ width: 8, height: 8, backgroundColor: '#7a4a1c', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
        <View style={{ width: 8, height: 8, backgroundColor: '#7a4a1c', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
      </View>
    </View>
  );
}

// ---------- Ana ekran düğme simgeleri ----------
export function HaritaSimge({ boy = 40 }) {
  const b = boy;
  return (
    <View style={{ width: b, height: b, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: b * 0.86, height: b * 0.7, backgroundColor: '#f6e3b4', borderRadius: 4, borderWidth: 2, borderColor: '#a8692c', transform: [{ rotate: '-6deg' }] }}>
        {[[0.15, 0.6], [0.35, 0.35], [0.55, 0.55], [0.75, 0.25]].map(([x, y], i) => (
          <View key={i} style={{ position: 'absolute', left: b * 0.86 * x - 3, top: b * 0.7 * y - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: i === 3 ? '#e74c3c' : '#a8692c' }} />
        ))}
      </View>
    </View>
  );
}

// Ana ekranın yuvarlak düğme zemini
export function YuvarlakZemin({ boy, renk = '#ffffff', children }) {
  return (
    <View
      style={{
        width: boy,
        height: boy,
        borderRadius: boy / 2,
        backgroundColor: renk,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#ffffff',
        borderBottomWidth: 6,
        borderBottomColor: 'rgba(0,0,0,0.15)',
        shadowColor: '#2c5d7c',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      {children}
    </View>
  );
}

// ---------- Harita: bölüm tabelası ----------
export function Tabela({ ad, renk }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ backgroundColor: '#c8884a', borderRadius: 10, borderWidth: 3, borderColor: '#7a4a1c', paddingVertical: 6, paddingHorizontal: 16 }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 5, backgroundColor: renk, borderTopLeftRadius: 7, borderTopRightRadius: 7 }} />
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } }}>{ad}</Text>
      </View>
      <View style={{ flexDirection: 'row', width: 90, justifyContent: 'space-between' }}>
        <View style={{ width: 6, height: 16, backgroundColor: '#7a4a1c' }} />
        <View style={{ width: 6, height: 16, backgroundColor: '#7a4a1c' }} />
      </View>
    </View>
  );
}
