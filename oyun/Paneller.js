// Açılır paneller: Ayarlar ve Günlük ödül. İkisi de ekranın üstünde kart olarak açılır.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { GirisKart, st } from './gorsel';

// 7 günlük ödül döngüsü (Murat onayladı, 25 Kasım). Bir gün kaçırılırsa 1. günden başlar.
export const GUNLUK_ODUL = [
  { cekic: 1 },
  { karistir: 1 },
  { hamle3: 1 },
  { cekic: 1 },
  { karistir: 1 },
  { hamle3: 1 },
  { cekic: 2, karistir: 2, hamle3: 2 },
];

const SIMGE = { cekic: '🔨', karistir: '🔄', hamle3: '+3' };
const AD = { cekic: 'çekiç', karistir: 'karıştır', hamle3: 'artı 3 hamle' };

export function odulMetni(odul) {
  return Object.entries(odul)
    .map(([k, n]) => `${n} ${AD[k]}`)
    .join(', ');
}

function OdulSimgesi({ odul, buyuk }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
      {Object.entries(odul).map(([k, n]) => (
        <Text key={k} style={{ fontSize: buyuk ? 22 : 15, fontWeight: '900', color: k === 'hamle3' ? '#2fae4f' : '#24384a', marginHorizontal: 1 }}>
          {SIMGE[k]}
          {n > 1 ? `×${n}` : ''}
        </Text>
      ))}
    </View>
  );
}

export function GunlukOdulPaneli({ gun, al }) {
  const odul = GUNLUK_ODUL[gun - 1];
  return (
    <View style={st.perde} accessibilityViewIsModal>
      <GirisKart>
        <Text style={st.kartBaslik} accessibilityRole="header">
          Günlük Ödül
        </Text>
        <Text style={[st.kartAlt, { marginTop: 4 }]}>{gun}. gün</Text>
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300, marginTop: 14 }}
          accessible
          accessibilityLabel={`Bugünün ödülü: ${odulMetni(odul)}. Her gün gelirsen ödül büyür; 7. gün her güçlendiriciden 2 tane.`}
        >
          {GUNLUK_ODUL.map((o, i) => {
            const bugun = i === gun - 1;
            const alindi = i < gun - 1;
            return (
              <View key={i} style={[pst.gunKutu, bugun && pst.gunBugun, alindi && { opacity: 0.45 }, i === 6 && { width: 128 }]}>
                <Text style={pst.gunNo}>{i + 1}. gün</Text>
                <OdulSimgesi odul={o} />
                {alindi && <Text style={pst.tik}>✓</Text>}
              </View>
            );
          })}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Al: ${odulMetni(odul)}`} onPress={al} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, { backgroundColor: '#2fae4f', borderBottomColor: '#1f8a3a' }, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Al</Text>
        </Pressable>
      </GirisKart>
    </View>
  );
}

function Anahtar({ ad, acik, degistir }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={ad} accessibilityState={{ checked: acik }} onPress={() => degistir(!acik)} style={pst.satir}>
      <Text style={pst.satirYazi}>{ad}</Text>
      <View style={[pst.anahtar, acik && pst.anahtarAcik]}>
        <View style={[pst.top, acik && { alignSelf: 'flex-end' }]} />
      </View>
    </Pressable>
  );
}

export function AyarlarPaneli({ ayar, degistir, kapat }) {
  return (
    <View style={st.perde} accessibilityViewIsModal>
      <GirisKart>
        <Text style={st.kartBaslik} accessibilityRole="header">
          Ayarlar
        </Text>
        <View style={{ marginTop: 14, minWidth: 250 }}>
          <Anahtar ad="Ses efektleri" acik={ayar.ses} degistir={(v) => degistir({ ses: v })} />
          <Anahtar ad="Titreşim" acik={ayar.titresim} degistir={(v) => degistir({ titresim: v })} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={kapat} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Kapat</Text>
        </Pressable>
      </GirisKart>
    </View>
  );
}

const pst = {
  gunKutu: { width: 62, height: 66, margin: 4, borderRadius: 14, backgroundColor: '#f3f7fb', borderWidth: 2, borderColor: '#dde7f0', alignItems: 'center', justifyContent: 'center' },
  gunBugun: { backgroundColor: '#fff4cc', borderColor: '#ffb81c', transform: [{ scale: 1.08 }] },
  gunNo: { fontSize: 11, fontWeight: '800', color: '#6a7f91', marginBottom: 3 },
  tik: { position: 'absolute', right: 4, top: 2, fontSize: 13, fontWeight: '900', color: '#2fae4f' },
  satir: { borderWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f6' },
  satirYazi: { fontSize: 18, fontWeight: '800', color: '#24384a', marginRight: 20 },
  anahtar: { width: 54, height: 32, borderRadius: 16, backgroundColor: '#cfd8e1', padding: 3, justifyContent: 'center' },
  anahtarAcik: { backgroundColor: '#2fae4f' },
  top: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff' },
};
