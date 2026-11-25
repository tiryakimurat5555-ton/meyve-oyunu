# ElevenLabs ile üretilen "Kristal Bahçe" seslerini (araclar/ham-sesler/*.mp3) oyuna hazırlar:
# baştaki sessizliği kırpar, sonunu yumuşak söndürür, meyveleri kendi notalarına kaydırır, ses seviyelerini eşitler,
# meyve seslerinin sol/orta/sağ kopyalarını, zincir ve yıldız notalarını üretir; assets/ses ve oyun/sesListesi.js'i yazar.
# Tema ve promptlar: araclar/ses-tema.md.  Çalıştırma: python3 araclar/sesleri-isle.py  (ffmpeg ve numpy gerekir)
import os, subprocess, wave
import numpy as np

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = os.path.join(KOK, 'araclar', 'ham-sesler')
HEDEF = os.path.join(KOK, 'assets', 'ses')
SR = 44100


def oku(ad):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HAM, ad + '.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, dtype=np.float32).astype(np.float64)


def temel_frekans(x):
    """En alçak güçlü kısmi (tepe gücün %25'inden yüksek ilk tepe)."""
    n = 16384
    seg = x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))
    sp = np.abs(np.fft.rfft(seg * np.hanning(n)))
    f = np.fft.rfftfreq(n, 1 / SR)
    sp[f < 150] = 0
    esik = sp.max() * 0.25
    for i in range(1, len(sp) - 1):
        if sp[i] > esik and sp[i] >= sp[i - 1] and sp[i] >= sp[i + 1]:
            return f[i]
    return f[np.argmax(sp)]


def perde(x, oran):
    """Perdeyi 'oran' kadar kaydırır (yeniden örnekleme; süre de 1/oran olur)."""
    if abs(oran - 1) < 1e-3:
        return x
    n = int(len(x) / oran)
    return np.interp(np.arange(n) * oran, np.arange(len(x)), x)


def kirp(x, en_uzun, sondur=0.06, esik_db=-42):
    a = np.abs(x)
    tepe = a.max() or 1
    bas = max(0, int(np.argmax(a > tepe * 0.03)) - int(SR * 0.003))
    x = x[bas:]
    # sonu: zarf eşiğin altına inince bitir
    w = int(SR * 0.01)
    zarf = np.array([np.abs(x[i:i + w]).max() for i in range(0, len(x), w)])
    sinir = tepe * 10 ** (esik_db / 20)
    ust = np.nonzero(zarf > sinir)[0]
    son = min(len(x), (ust[-1] + 2) * w if len(ust) else len(x), int(SR * en_uzun))
    x = x[:son].copy()
    f = min(len(x), int(SR * sondur))
    x[-f:] *= np.linspace(1, 0, f) ** 2
    g = min(len(x), int(SR * 0.002))
    x[:g] *= np.linspace(0, 1, g)
    return x


def esitle(x, hedef_db, tepe_sinir=0.95):
    """Etkin bölümün RMS'ini hedef dB'ye getirir; tepe sınırı aşılmaz."""
    a = np.abs(x)
    etkin = x[a > a.max() * 0.05]
    rms = np.sqrt(np.mean(etkin ** 2)) if len(etkin) else 1e-6
    k = 10 ** (hedef_db / 20) / rms
    k = min(k, tepe_sinir / a.max())
    return x * k


def yaz(ad, sol, sag=None):
    sag = sol if sag is None else sag
    s = np.stack([sol, sag], axis=1)
    s = np.clip(s, -1, 1)
    with wave.open(os.path.join(HEDEF, ad + '.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((s * 32767).astype('<i2').tobytes())


yazilan = []


def kaydet(ad, x, sol=1.0, sag=1.0):
    yaz(ad, x * sol, x * sag)
    yazilan.append(ad)


# ---------- meyveler: her biri kendi çalgısı ve kendi notası (görme engelli oyuncu sesinden tanısın) ----------
# hedef temel frekanslar: erik Sol4, portakal Do5, elma Do6, limon Mi6, çilek Mi7; üzüm cam boncuk şıngırtısı (perdesiz)
MEYVE = {
    'erik': ('meyve_erik_1', 392.0),
    'portakal': ('meyve_portakal_1', 523.3),
    'elma': ('meyve_elma_2', 1046.5),
    'limon': ('meyve_limon_1', 1318.5),
    'cilek': ('meyve_cilek_3', 2637.0),
    'uzum': ('meyve_uzum_1', None),
}
for ad, (dosya, hedef_f) in MEYVE.items():
    x = oku(dosya)
    x = kirp(x, 0.9)
    if hedef_f:
        f0 = temel_frekans(x)
        x = perde(x, hedef_f / f0)
        print(f'{ad}: {f0:.0f} Hz -> {hedef_f:.0f} Hz')
    x = kirp(x, 0.6, sondur=0.08)
    x = esitle(x, -16)
    # sütuna göre: sol / orta / sağ (eşit güçlü yönlendirme)
    kaydet(f'meyve_{ad}_sol', x, 1.0, 0.3)
    kaydet(f'meyve_{ad}_orta', x * 0.85, 1.0, 1.0)
    kaydet(f'meyve_{ad}_sag', x, 0.3, 1.0)

# ---------- kristal nota: pling, zincir notaları, yıldızlar, seçim ----------
pling = kirp(oku('pling_1'), 1.0, sondur=0.12)
f0 = temel_frekans(pling)
do6 = perde(pling, 1046.5 / f0)  # Do6'ya ayarla
kaydet('pling', esitle(kirp(do6, 0.7, 0.1), -17))
# zincir: Do majör pentatonik yükselen dizi (Do, Re, Mi, Sol, La, Do)
for i, oran in enumerate([1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2], 1):
    kaydet(f'zincir_{i}', esitle(kirp(perde(do6, oran), 0.7, 0.12), -16))
# yıldızlar: Do, Mi, Sol (her biri biraz daha parlak)
for i, oran in enumerate([1, 5 / 4, 3 / 2], 1):
    kaydet(f'yildiz_{i}', esitle(kirp(perde(do6, oran * 2), 0.6, 0.12), -15))
# seçim: çok kısa, yumuşak kristal tık
kaydet('secim', esitle(kirp(perde(do6, 3), 0.09, 0.05), -22))

# ---------- diğer efektler: (ham dosya, en uzun süre, hedef dB) ----------
DIGER = {
    'takas': ('takas_1', 0.35, -18),
    'gecersiz': ('gecersiz_1', 0.3, -17),
    'ozel_olustu': ('ozel_olustu_2', 0.8, -16),
    'cizgi': ('cizgi_2', 0.6, -15),
    'bomba': ('bomba_1', 1.0, -13),
    'gokkusagi': ('gokkusagi_1', 1.4, -15),
    'karistir': ('karistir_3', 0.7, -18),
    'buz': ('buz_1', 0.4, -16),
    'kasa_vur': ('kasa_vur_2', 0.25, -16),
    'kasa_kir': ('kasa_kir_1', 0.4, -15),
    'cekic': ('cekic_2', 0.3, -15),
    'kazandin': ('kazandin_1', 2.4, -14),
    'kaybettin': ('kaybettin_2', 1.3, -17),
    'sarmasik_kes': ('sarmasik_kes_3', 0.45, -16),
    'sarmasik_yay': ('sarmasik_yay_2', 0.55, -18),
    'sis': ('sis_2', 0.6, -17),
}
for ad, (dosya, uzun, db) in DIGER.items():
    kaydet(ad, esitle(kirp(oku(dosya), uzun, 0.08), db))

# ---------- övgü seslendirmeleri (ElevenLabs eleven_v4, ses "Miranda": tatlı, neşeli; zincir büyüdükçe coşku artar) ----------
# Hafif kristal yankı: iki kısa yansıma, ses tema ile bütünleşsin
def yanki(x):
    y = np.concatenate([x, np.zeros(int(SR * 0.3))])
    for gecikme, kat in ((0.07, 0.22), (0.15, 0.12), (0.24, 0.06)):
        d = int(SR * gecikme)
        y[d:d + len(x)] += x * kat
    return y


OVGU_SES = {
    'ovgu_nice': ('ovgu_nice_2', -15),
    'ovgu_great': ('ovgu_great_2', -14),
    'ovgu_amazing': ('ovgu_amazing_1', -13),
    'ovgu_fantastic': ('ovgu_fantastic_2', -12),
    'ovgu_garden': ('ovgu_garden_1', -12),
    'ovgu_level': ('ovgu_level_2', -13),
}
for ad, (dosya, db) in OVGU_SES.items():
    x = kirp(oku(dosya), 2.2, sondur=0.1, esik_db=-38)
    kaydet(ad, esitle(kirp(yanki(x), 2.5, sondur=0.15, esik_db=-40), db))

# ---------- menü düğmeleri: kristal tık (ileri) ve aynı tıkın kalın kopyası (geri / kapat) ----------
kaydet('dugme', esitle(kirp(oku('dugme_3'), 0.18, 0.05), -20))
kaydet('dugme_geri', esitle(kirp(perde(kirp(oku('dugme_1'), 0.3, 0.05), 0.72), 0.25, 0.06), -20))

# ---------- sessiz döngü (yalnız iPhone çalar: ses kanalını açık tutar; bkz. oyun/ses.js) ----------
with wave.open(os.path.join(HEDEF, 'sessiz.wav'), 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(8000)
    w.writeframes(np.zeros(8000, dtype='<i2').tobytes())

# ---------- sesListesi.js: assets/ses'teki bütün WAV dosyaları ----------
hepsi = sorted(f[:-4] for f in os.listdir(HEDEF) if f.endswith('.wav'))
with open(os.path.join(KOK, 'oyun', 'sesListesi.js'), 'w') as f:
    f.write('// araclar/sesleri-isle.py tarafından üretildi; elle değiştirme.\nexport const SES_DOSYALARI = {\n')
    for ad in hepsi:
        f.write(f"  {ad}: require('../assets/ses/{ad}.wav'),\n")
    f.write('};\n')
print(len(yazilan), 'ses yazıldı;', len(hepsi), 'ses listede')
