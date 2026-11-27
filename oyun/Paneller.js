// Ayarlar paneli (ekranın üstünde kart) ve günlük ödül tablosu. Günlük ödül sayfası GunlukEkrani.js'te.
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GirisKart, st } from './gorsel';
import { GucSimge } from './arayuz';
import { CAN_EN_COK, canDurumu, canSoz, sureSoz, sureYazi } from './can';

// 7 günlük ödül döngüsü (Murat onayladı, 25 Kasım). Bir gün kaçırılırsa 1. günden başlar.
// 27 Kasım: her güne 1 can, 7. güne 1 saat sınırsız can eklendi (can sistemi). sinirsiz = dakika.
export const GUNLUK_ODUL = [
  { cekic: 1, can: 1 },
  { karistir: 1, can: 1 },
  { hamle3: 1, can: 1 },
  { cekic: 1, can: 1 },
  { karistir: 1, can: 1 },
  { hamle3: 1, can: 1 },
  { cekic: 2, karistir: 2, hamle3: 2, sinirsiz: 60 },
];

const AD = { cekic: 'çekiç', karistir: 'karıştır', hamle3: 'artı 3 hamle', can: 'can' };

export function odulMetni(odul) {
  return Object.entries(odul)
    .map(([k, n]) => (k === 'sinirsiz' ? `${sureSoz(n * 60000)} sınırsız can` : `${n} ${AD[k]}`))
    .join(', ');
}

// Saniyede bir yenilenen can durumu
export function useCan(can) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);
  return canDurumu(can);
}

// Kalp + can sayısı + sonraki cana kalan süre (ana ekran ve harita üstünde)
export function CanGostergesi({ can, stil }) {
  const d = useCan(can);
  const alt = d.sinirsiz ? sureYazi(d.sinirsiz - Date.now()) : d.n >= CAN_EN_COK ? 'Dolu' : sureYazi(d.sonraki);
  return (
    <View style={[pst.can, stil]} accessible accessibilityLabel={canSoz(d)}>
      <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
        <GucSimge ad="can" boy={30} />
        <Text style={pst.canSayi}>{d.sinirsiz ? '∞' : d.n}</Text>
      </View>
      <Text style={pst.canAlt}>{alt}</Text>
    </View>
  );
}

// Can bitince çıkan kart: sonraki cana kalan süre; can dolunca "Oyna" düğmesi çıkar
export function CanYokPaneli({ can, oyna, kapat }) {
  const d = useCan(can);
  const var_ = d.sinirsiz > 0 || d.n > 0;
  return (
    <View style={st.perde} accessibilityViewIsModal>
      <GirisKart>
        <Text style={st.kartBaslik} accessibilityRole="header">
          {var_ ? 'Canın doldu!' : 'Canların bitti'}
        </Text>
        <View style={{ alignItems: 'center', marginTop: 10 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <GucSimge ad="can" boy={64} />
        </View>
        <Text style={pst.canMetin} accessible accessibilityLabel={var_ ? `${d.n} canın var, oynayabilirsin.` : `Sonraki can ${sureSoz(d.sonraki)} sonra gelecek. Canlar her 30 dakikada bir dolar.`}>
          {var_ ? `${d.n} canın var, oynayabilirsin.` : `Sonraki can: ${sureYazi(d.sonraki)}\nCanlar her 30 dakikada bir dolar.`}
        </Text>
        {var_ && (
          <Pressable accessibilityRole="button" accessibilityLabel="Oyna" onPress={oyna} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, pressed && { transform: [{ scale: 0.96 }] }]}>
            <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Oyna</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={kapat} style={({ pressed }) => [st.dugme, st.dugmeBuyuk, { backgroundColor: '#8aa0b4', borderBottomColor: '#6a8094' }, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Text style={[st.dugmeYazi, { fontSize: 20 }]}>Kapat</Text>
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
  can: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 3, margin: 4 },
  canSayi: { position: 'absolute', fontSize: 13, fontWeight: '900', color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
  canAlt: { fontSize: 16, fontWeight: '900', color: '#24384a', marginLeft: 5, minWidth: 44 },
  canMetin: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#24384a', textAlign: 'center', lineHeight: 26 },
  satir: { borderWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f6' },
  satirYazi: { fontSize: 18, fontWeight: '800', color: '#24384a', marginRight: 20 },
  anahtar: { width: 54, height: 32, borderRadius: 16, backgroundColor: '#cfd8e1', padding: 3, justifyContent: 'center' },
  anahtarAcik: { backgroundColor: '#2fae4f' },
  top: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff' },
};
