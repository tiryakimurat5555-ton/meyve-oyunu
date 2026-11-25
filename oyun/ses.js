// Ses ve titreşim. Her ses için küçük bir çalar havuzu tutulur; böylece aynı ses üst üste çalabilir.
// iPhone'a özel düzeltmeler (Demir 1919 ve Kayıp Okyanus'taki gibi); Android'de eski davranış aynen sürer:
//  - seekTo iOS'ta eşzamansızdır: sarma bitmeden play() çağrılırsa art arda gelen ses çalmayabilir (basaSarVeCal).
//  - keepAudioSessionActive: kısa bir ses bitince iPhone ses kanalını kapatıp sonraki sesi geciktirmesin / VoiceOver'ı kısmasın.
//  - Sürekli çalan sessiz döngü: ses kanalı hep açık kalır, art arda gelen sesler gecikmeden çalar.
import { AppState, Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { SES_DOSYALARI } from './sesListesi';

const IOS = Platform.OS === 'ios';
const HAVUZ = IOS ? 3 : 2;
// Hızlı art arda çalabilen sesler tam havuz alır; nadir çalanlara (menü, kazanma, seslendirme...) tek çalar yeter.
// Böylece açılışta hazırlanan çalar sayısı yarıya iner (iPhone'da 160 çalar açılışı ağırlaştırıyordu).
const SIK = /^(meyve_|zincir_|takas|secim|gecersiz|cizgi|bomba|buz|kasa_vur|kasa_kir|sarmasik_kes|pling)/;
const havuzBoyu = (ad) => (SIK.test(ad) ? HAVUZ : 1);
const havuzlar = {};
const sira = {};
let hazir = false;
let sesAcik = true;
let titresimAcik = true;
let sessiz = null;

export async function sesleriHazirla() {
  if (hazir) return;
  hazir = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false });
  } catch (e) {}
  if (IOS) {
    try {
      await setIsAudioActiveAsync(true);
    } catch (e) {}
  }
  const ayar = IOS ? { keepAudioSessionActive: true } : undefined;
  for (const ad of Object.keys(SES_DOSYALARI)) {
    if (ad === 'sessiz') continue;
    havuzlar[ad] = [];
    sira[ad] = 0;
    for (let i = 0; i < havuzBoyu(ad); i++) {
      try {
        havuzlar[ad].push(ayar ? createAudioPlayer(SES_DOSYALARI[ad], ayar) : createAudioPlayer(SES_DOSYALARI[ad]));
      } catch (e) {}
    }
  }
  if (IOS && SES_DOSYALARI.sessiz) {
    try {
      sessiz = createAudioPlayer(SES_DOSYALARI.sessiz, ayar);
      sessiz.loop = true;
    } catch (e) {}
    oturumuAcikTut();
    // Uygulama arka plandan dönünce sessiz döngüyü yeniden başlat
    AppState.addEventListener('change', (d) => {
      if (d === 'active') oturumuAcikTut();
    });
  }
}

// iPhone: sessiz döngü çalarken ses kanalı açık kalır
function oturumuAcikTut() {
  if (!sessiz) return;
  try {
    sessiz.volume = 1;
    if (!sessiz.playing) sessiz.play();
  } catch (e) {}
}

// iPhone: önce başa sar, sarma bitince çal (en geç 120 ms sonra yine de çalar)
function basaSarVeCal(p) {
  let oldu = false;
  const oynat = () => {
    if (oldu) return;
    oldu = true;
    try {
      p.play();
    } catch (e) {}
  };
  try {
    if (p.playing) p.pause();
    const s = p.seekTo(0);
    if (s && typeof s.then === 'function') {
      s.then(oynat, oynat);
      setTimeout(oynat, 120);
    } else oynat();
  } catch (e) {
    oynat();
  }
}

export function cal(ad, ses = 1) {
  if (!sesAcik) return;
  const h = havuzlar[ad];
  if (!h || !h.length) return;
  const p = h[sira[ad] % h.length];
  sira[ad]++;
  try {
    p.volume = ses;
    if (IOS) {
      basaSarVeCal(p);
    } else {
      p.seekTo(0);
      p.play();
    }
  } catch (e) {}
}

// Meyve sesi, tahtadaki sütuna göre soldan, ortadan ya da sağdan
export function meyveSesi(turAdi, sutun, sutunSayisi) {
  const oran = sutun / Math.max(1, sutunSayisi - 1);
  const yon = oran < 0.34 ? 'sol' : oran > 0.66 ? 'sag' : 'orta';
  cal(`meyve_${turAdi}_${yon}`);
}

export function titret(guc) {
  if (!titresimAcik) return;
  try {
    if (guc === 'hafif') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (guc === 'orta') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (guc === 'guclu') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (guc === 'basari') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (guc === 'hata') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {}
}

export function sesAyari(acik) {
  sesAcik = acik;
}
export function titresimAyari(acik) {
  titresimAcik = acik;
}
