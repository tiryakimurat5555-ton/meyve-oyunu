// Ayarlar paneli (ekranın üstünde kart) ve günlük ödül tablosu. Günlük ödül sayfası GunlukEkrani.js'te.
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

const AD = { cekic: 'çekiç', karistir: 'karıştır', hamle3: 'artı 3 hamle' };

export function odulMetni(odul) {
  return Object.entries(odul)
    .map(([k, n]) => `${n} ${AD[k]}`)
    .join(', ');
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
  satir: { borderWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f6' },
  satirYazi: { fontSize: 18, fontWeight: '800', color: '#24384a', marginRight: 20 },
  anahtar: { width: 54, height: 32, borderRadius: 16, backgroundColor: '#cfd8e1', padding: 3, justifyContent: 'center' },
  anahtarAcik: { backgroundColor: '#2fae4f' },
  top: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff' },
};
