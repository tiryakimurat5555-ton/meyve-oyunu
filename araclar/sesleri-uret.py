"""Kristal çınlama seslerini üretir (geçici sesler; ileride ElevenLabs sesleriyle değiştirilebilir).
Kullanım: python3 araclar/sesleri-uret.py
Çıktı: assets/ses/*.wav ve oyun/sesListesi.js
"""
import os, wave
import numpy as np

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKIS = os.path.join(KOK, 'assets', 'ses')
os.makedirs(CIKIS, exist_ok=True)
SR = 22050
rng = np.random.default_rng(7)


def zaman(sure):
    return np.arange(int(round(SR * sure))) / SR


def ekle(y, b, parca):
    n = min(len(parca), len(y) - b)
    y[b : b + n] += parca[:n]


def can(f, sure, parlak=1.0, tok=0.0):
    """Cam çan: uyumsuz kısmi tonlar, hızlı vuruş, üstel sönüm."""
    t = zaman(sure)
    kismi = [(1.0, 1.0, 5.0), (2.0, 0.30 + tok * 0.3, 7.0), (2.76, 0.45 * parlak, 9.0), (5.40, 0.22 * parlak, 14.0), (8.93, 0.10 * parlak, 20.0)]
    y = np.zeros_like(t)
    for oran, gen, son in kismi:
        y += gen * np.sin(2 * np.pi * f * oran * t) * np.exp(-son * t)
        y += 0.35 * gen * np.sin(2 * np.pi * f * oran * 1.004 * t) * np.exp(-son * t)  # hafif titreşim
    if tok:
        y += tok * 0.6 * np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-6 * t)
    atak = np.minimum(1, t / 0.002)
    return y * atak


def pirilti(sure, adet=6, bas=0.0, yay=0.15, ses=0.18):
    """Şıkır şıkır: kısa, tiz cam tıkırtıları."""
    t = zaman(sure)
    y = np.zeros_like(t)
    for _ in range(adet):
        b = bas + rng.random() * yay
        f = 3000 + rng.random() * 4000
        i = int(b * SR)
        if i >= len(t):
            continue
        tt = t[: len(t) - i]
        y[i:] += ses * np.sin(2 * np.pi * f * tt) * np.exp(-60 * tt)
    return y


def normalle(y, tepe=0.85):
    m = np.max(np.abs(y)) or 1
    return y / m * tepe


def yaz(ad, y, sol=1.0, sag=1.0):
    y = normalle(y)
    st = np.stack([y * sol, y * sag], axis=1)
    veri = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(CIKIS, ad + '.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(veri.tobytes())
    return ad


adlar = []
# Her meyvenin kendi notası (pentatonik, birbirinden ayırt edilir)
MEYVELER = {
    'uzum': (523.25, 0.7, 0.8),  # tok boncuk
    'erik': (587.33, 0.8, 0.5),
    'portakal': (659.25, 1.0, 0.2),
    'cilek': (783.99, 1.1, 0.0),
    'limon': (880.00, 1.3, 0.0),  # tiz çıngırak
    'elma': (1046.50, 1.2, 0.0),
}
PAN = {'sol': (1.0, 0.3), 'orta': (0.85, 0.85), 'sag': (0.3, 1.0)}
for ad, (f, parlak, tok) in MEYVELER.items():
    y = can(f, 0.6, parlak, tok) + pirilti(0.6, 7, 0.0, 0.18)
    for p, (s, g) in PAN.items():
        adlar.append(yaz(f'meyve_{ad}_{p}', y, s, g))

# Zincir: her basamakta daha yükseğe çıkan hızlı arpej
OLCEK = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]
for n in range(1, 7):
    sure = 0.7
    y = np.zeros(int(round(SR * sure)))
    for k in range(3):
        f = OLCEK[min(len(OLCEK) - 1, n + k * 2)]
        b = int(k * 0.06 * SR)
        parca = can(f, sure - k * 0.06, 1.2)
        ekle(y, b, parca * (0.8 + 0.1 * k))
    y += pirilti(sure, 6 + n * 2, 0.05, 0.3, 0.2)
    adlar.append(yaz(f'zincir_{n}', y))

# Takas: kısa cam hışırtısı
t = zaman(0.16)
gurultu = rng.standard_normal(len(t))
supurme = np.sin(2 * np.pi * (1500 + 6000 * t / 0.16) * t)
y = (0.5 * gurultu * supurme) * np.exp(-18 * t) * np.minimum(1, t / 0.01)
y += 0.4 * pirilti(0.16, 2, 0.02, 0.06)
adlar.append(yaz('takas', y))

# Geçersiz hamle: iki tok tık
t = zaman(0.3)
y = np.zeros_like(t)
for b in (0.0, 0.12):
    i = int(b * SR)
    tt = t[: len(t) - i]
    y[i:] += np.sin(2 * np.pi * 220 * tt) * np.exp(-35 * tt) + 0.4 * np.sin(2 * np.pi * 440 * tt) * np.exp(-50 * tt)
adlar.append(yaz('gecersiz', y * 0.6))

# Seçim: minik tık
t = zaman(0.06)
adlar.append(yaz('secim', np.sin(2 * np.pi * 2600 * t) * np.exp(-70 * t)))

# Karıştırma: tıkırdayan cam boncuklar
adlar.append(yaz('karistir', pirilti(0.8, 40, 0.0, 0.65, 0.3)))

# Oyun sonu: yükselen çan arpeji
sure = 1.6
y = np.zeros(int(round(SR * sure)))
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.51]):
    b = int(k * 0.11 * SR)
    parca = can(f, sure - k * 0.11, 1.1)
    ekle(y, b, parca)
y += pirilti(sure, 16, 0.4, 0.8, 0.15)
adlar.append(yaz('bitis', y))


# ---------- Özel parça ve seviye sesleri ----------
# Çizgi: yükselen lazer süpürmesi + pırıltı
t = zaman(0.45)
f = 600 + 2600 * (t / 0.45) ** 0.6
faz = 2 * np.pi * np.cumsum(f) / SR
y = (np.sin(faz) + 0.4 * np.sin(2 * faz)) * np.exp(-4 * t) * np.minimum(1, t / 0.01)
y += 0.6 * rng.standard_normal(len(t)) * np.exp(-14 * t) * 0.3
y += pirilti(0.45, 10, 0.05, 0.3, 0.25)
adlar.append(yaz('cizgi', y))

# Bomba: tok gümleme + cam saçılması
t = zaman(0.9)
dus = 90 * np.exp(-3 * t) + 45
faz = 2 * np.pi * np.cumsum(dus) / SR
y = 1.2 * np.sin(faz) * np.exp(-5 * t)
y += 0.5 * rng.standard_normal(len(t)) * np.exp(-12 * t)
y += pirilti(0.9, 30, 0.02, 0.5, 0.3)
y += 0.5 * can(1046.5, 0.9, 1.3)
adlar.append(yaz('bomba', y))

# Gökkuşağı: hızla yükselen çan glisandosu
sure = 1.1
y = np.zeros(int(round(SR * sure)))
for k, fq in enumerate(OLCEK + [2349.3, 2637.0]):
    ekle(y, int(k * 0.06 * SR), can(fq, sure - k * 0.06, 1.2) * 0.6)
y += pirilti(sure, 30, 0.0, 0.9, 0.2)
adlar.append(yaz('gokkusagi', y))

# Özel parça oluştu: büyülü çift çan
sure = 0.7
y = np.zeros(int(round(SR * sure)))
ekle(y, 0, can(1318.5, sure, 1.3))
ekle(y, int(0.08 * SR), can(1975.5, sure - 0.08, 1.3))
y += pirilti(sure, 12, 0.0, 0.4, 0.22)
adlar.append(yaz('ozel_olustu', y))

# Şenlik dönüşümü: kısa pling
adlar.append(yaz('pling', can(1567.98, 0.35, 1.4) + pirilti(0.35, 3, 0, 0.05)))

# Yıldızlar: üç yükselen parlak çan
for i, fq in enumerate([1046.5, 1318.5, 1567.98]):
    adlar.append(yaz(f'yildiz_{i + 1}', can(fq, 0.9, 1.3) + pirilti(0.9, 10 + i * 6, 0.0, 0.4, 0.25)))

# Kazandın: majör arpej, en üstte uzun çan
sure = 2.0
y = np.zeros(int(round(SR * sure)))
for k, fq in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0]):
    ekle(y, int(k * 0.09 * SR), can(fq, sure - k * 0.09, 1.2) * (0.7 + 0.05 * k))
y += pirilti(sure, 30, 0.5, 1.2, 0.18)
adlar.append(yaz('kazandin', y))

# Kaybettin: yavaşça inen yumuşak çanlar
sure = 1.6
y = np.zeros(int(round(SR * sure)))
for k, fq in enumerate([783.99, 659.25, 523.25, 392.0]):
    ekle(y, int(k * 0.22 * SR), can(fq, sure - k * 0.22, 0.6, 0.4) * 0.8)
adlar.append(yaz('kaybettin', y))

with open(os.path.join(KOK, 'oyun', 'sesListesi.js'), 'w') as d:
    d.write('// araclar/sesleri-uret.py tarafından üretildi; elle değiştirme.\n')
    d.write('export const SES_DOSYALARI = {\n')
    for a in adlar:
        d.write(f"  {a}: require('../assets/ses/{a}.wav'),\n")
    d.write('};\n')
print(len(adlar), 'ses')
