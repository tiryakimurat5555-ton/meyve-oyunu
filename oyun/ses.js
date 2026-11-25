// Ses ve titreşim. Her ses için küçük bir çalar havuzu tutulur; böylece aynı ses üst üste çalabilir.
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { SES_DOSYALARI } from './sesListesi';

const HAVUZ = 2;
const havuzlar = {};
const sira = {};
let hazir = false;
let sesAcik = true;
let titresimAcik = true;

export async function sesleriHazirla() {
  if (hazir) return;
  hazir = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false });
  } catch (e) {}
  for (const ad of Object.keys(SES_DOSYALARI)) {
    havuzlar[ad] = [];
    sira[ad] = 0;
    for (let i = 0; i < HAVUZ; i++) {
      try {
        havuzlar[ad].push(createAudioPlayer(SES_DOSYALARI[ad]));
      } catch (e) {}
    }
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
    p.seekTo(0);
    p.play();
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
