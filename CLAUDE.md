# meyve-oyunu — çalışma notları

Murat'ın meyve temalı 3'lü eşleştirme oyunu (Kasım 2026). Geçici ad "Meyve Oyunu"; global mağaza adı en son seçilecek
(adaylar: Prism Orchard, Glimmer Grove, Glintberry; "Crystal …" adları dolu).

## Kararlar (Murat'ın)
- React Native / Expo; Expo Go'da denenir. Ağırlıklı olarak GÖRENLERE hitap eder; ama tam erişilebilir olacak (VoiceOver).
- Tema: meyve bahçesi, yüzlü sevimli meyveler. Hedef tarz: "kristal meyveler" (cam gibi parlak) + şıkır şıkır cam/çan sesleri.
  Şu anki resimler Higgsfield Seedream 5.5 ile üretilen "tombul parlak" yüzlü meyveler (assets/meyve, 256 px, şeffaf).
- Renkler: çilek kırmızı, limon sarı, üzüm mor, portakal turuncu, elma yeşil, erik lacivert. Koyu zeminde üzüm/erik kaybolur:
  tahta zemini açık renk kalmalı.
- Yapı: seviyeli (hedef + hamle sınırı + 1-3 yıldız). Denge sayıları Murat'a önerilir, onaylarsa uygulanır.
  25 Kasım ONAYLANDI: özel parçalar (4'lü = çizgili: yatay eşleşme satırı, dikey sütunu temizler; L/T = bomba 3x3;
  5 düz = gökkuşağı), birleşimler (çizgili+çizgili artı, çizgili+bomba 3 satır+3 sütun, bomba+bomba 5x5,
  gökkuşağı+meyve o rengin hepsi, gökkuşağı+özel o renk özel parçaya dönüşüp patlar, gökkuşağı+gökkuşağı tahta),
  puan 30/60/100 × zincir + özel parçanın temizlediği meyve başına 20 × zincir, seviye sonu şenliği (kalan hamleler
  çizgiliye dönüşüp patlar, en çok 15; fazlası 100 puan), can sistemi yok, ilk 3 seviye 5 tür meyve,
  ilk 10 seviye oyun/seviyeler.js'teki gibi. Özel parçalar seviye 4 (çizgili), 6 (bomba), 9 (gökkuşağı) itibarıyla açılır.
  25 Kasım: 7. seviye 20 hamle, 9. seviye 22 hamle/3500 puan (yıldız 4500/6000), 10. seviye 28 hamle (onaylandı).
  İLKE (Murat): uzun soluklu oyun; ilk seviyelerde oyuncu zorlanmaz, zorluk çok yavaş artar, arada kolay seviyeler.
  Bot simülasyonu: `bun araclar/seviye-testi.mjs` (SEVIYE='{"no":9,"hamle":22}' ile tek seviye denenir).
- Engeller (25 Kasım onaylandı): BUZ = buzlu meyve yer değiştiremez, eşleşmeye katılınca, yanında eşleşme olunca ya da özel
  parça değince kırılır, meyve kalır. KASA = meyve değil (tur M.KASA), takas/eşleşme yok, yerçekimiyle düşer, yanında eşleşme
  ya da özel parça değince bir kat azalır; iki katlı (K) iki vuruş ister. Seviye düzeni 8 satır metin: '.', 'b', 'k', 'K'.
  11-30. seviyeler oyun/seviyeler.js'te; bölümler: 1-10 İlkbahar, 11-20 Yaz, 21-30 Sonbahar Bahçesi.
  Bot hedefi: 1-10 ≥%88, 11-20 ≥%85, 21-30 ≥%75 geçme; yıldız eşikleri bottan (2★ ≈ %40'lık, 3★ ≈ %75'lik puan).
  Simülasyon mulberry32 üreteci kullanır (eski LCG tekrarlı dizilerle sonuçları çarpıtıyordu).
- Zincir övgü yazıları İngilizce (Nice!, Great!, Amazing!, Fantastic!), şenlik yazısı 'Garden Party!' — Murat: global oyun. Ödüllü reklam sonraki aşama.
- Ekranda VoiceOver'a özel uyarı yazıları olmasın.
- 25 Kasım ONAYLANDI (güçlendiriciler/günlük ödül): Çekiç (tek parça/buz/kasa kırar), Karıştır, +3 Hamle; hamle harcamazlar;
  seviye 5'ten açılır (L5 tanıtım 'guc'), başlangıç hediyesi 2'şer. Günlük ödül 7 gün: çekiç, karıştır, +3, çekiç, karıştır, +3,
  her birinden 2; gün kaçarsa 1. güne döner; seviye 5 açılınca listede gösterilir. Bölüm sonu (10/20/30 ilk geçiş) 1'er.
  Kaybedince +5 hamle teklifi her denemede 1 kez, şimdilik ücretsiz (sonra ödüllü reklam). İpucu 5 sn + İpucu düğmesi
  (VoiceOver'a hamleyi söyler). Ayarlar (sol üst dişli): ses efektleri, titreşim ('meyve-ayar-v1'). Müzik henüz yok.
- BOT düğmesi (25 Kasım, Murat istedi): oyun ekranında tahtanın altında "Bot: Kapalı/Açık"; açıkken M.enIyiHamle ile
  1,1 sn arayla kendi oynar (ekran görüntüsü/video için). Tam otomatik: giriş kartında 1,8 sn sonra Başla'ya basar, sonuç
  kartından 4,5 sn sonra sonraki seviyeye geçer (kaybederse tekrar dener). Bot düğmesi Başla'dan sonra açılır (kart üstünü kapatır). Sağ üstte Expo Go dişlisi
  olduğu için oraya düğme koyma. MAĞAZA SÜRÜMÜNDEN ÖNCE kaldırılmalı ya da gizlenmeli (Murat'a sor).

## Yayın
- Murat'ın Expo derleme dakikası yok. main'e her gönderimde `.github/workflows/expo-guncelleme.yml` GitHub Actions'ta
  `eas update --branch main` çalıştırır (depo açık: Actions dakikası ücretsiz). EXPO_TOKEN gizli anahtarı gerekir.
- app.json'da proje kimliği yoksa iş akışı `eas init` ile bağlar, app.json'u kendisi gönderir (önce `git pull` yap).
- Sonuç ve Expo Go bağlantısı `yayin-kaydi` dalındaki yayin-kaydi.txt'de: `git fetch origin +yayin-kaydi:refs/remotes/origin/yayin-kaydi && git show origin/yayin-kaydi:yayin-kaydi.txt` (dal her seferinde baştan yazılır; + şart). Çalışma listesi: `gh api repos/tiryakimurat5555-ton/meyve-oyunu/actions/runs`.
- Expo derlemesi (build) Murat'a sormadan başlatılmaz.

## Dosyalar
- `App.js`: kök; ekran (liste/oyun), ilerleme kaydı (AsyncStorage 'meyve-ilerleme-v1': acik, yildiz, enIyi, guc, gunluk{son,seri},
  bolumOdul), ayarlar, günlük ödül. `oyun/Paneller.js`: GunlukOdulPaneli, AyarlarPaneli, GUNLUK_ODUL.
- `oyun/ListeEkrani.js`: seviye listesi (Oyna düğmesi, 4 sütun yuvarlak düğmeler, yıldızlar, kilit).
- `oyun/Oyun.js`: bir seviye. Parçalar kimlikli nesneler (tur, ozel, poz ValueXY hücre biriminde, olcek, ez, don, zip);
  `izgara` ref'i kimlikleri tutar. Aşamalar: giris (hedef kartı + tanıtım) → oyun (→ teklif: +5 hamle) → senlik → sonuc (yıldızlar).
  Güçlendirici sırası tahtanın altında (GucDugmesi); çekiç kipinde dokunulan hücre cozumle({ek}) ile kırılır.
  Görerek kipte PanResponder (kaydır = takas, dokun = seç). VoiceOver kipinde 64 hücre Pressable
  ("Çilek bomba seçili, 3. satır 5. sütun"), seç + komşuya dokun = takas; sonuçlar announceForAccessibility ile.
  Bilgisayar denemesi için globalThis.__denemeTahta (hazır tahta) ve __denemeOyun kancası (telefonda yok).
- `oyun/gorsel.js`: MEYVELER, TAM, özel parça görünümleri (Cizgiler, BombaHale, GokkusagiKure — kodla), efektler
  (Patlama, Isin, Dalga, GokkusagiIsinlari, Donusum, PuanYazisi, Ovgu), Kutu, GirisKart, Yildiz, ortak stiller st.
  Not: StyleSheet.absoluteFillObject bu RN sürümünde YOK; TAM kullan.
- `oyun/sahne.js`: kodla canlı bahçe sahnesi (renk geçişli gök, yüzlü güneş, bulutlar, tepeler, ağaçlar, çiçekler; İlkbahar taç
  yaprağı+kelebek, Yaz kelebek, Sonbahar düşen yaprak). bolumNo(seviyeNo). Hareketi azalt açıksa durgun. Tahta: ahşap çerçeve
  (yst.cerceve/cerceveIc, köşelerde yaprak+çiçek), kareler yarı saydam açık renk. Resimli arka planlar gelince gök/tepe yerine resim.
- `oyun/mantik.js`: saf mantık + özel parçalar (ozelOlusumlari, etkiAlani, birlesim, genislet, cozumAdimi).
  Testler: `bun araclar/mantik-testi.mjs`, `bun araclar/ozel-testi.mjs`, `bun araclar/engel-testi.mjs`, `bun araclar/seviye-testi.mjs` (bot;
  ARALIK=11-30, DENEME=200, TOHUM=n, SEVIYE='{...}'). Tarayıcıda engel denemesi: araclar/web-deneme/engel-dene.cjs (NO=20, VO=1).
- `oyun/seviyeler.js`: SEVIYELER, TANITIM, yildizHesapla, hedefTamam.
- `oyun/ses.js`: expo-audio havuzu + expo-haptics. Meyve sesi sütuna göre sol/orta/sağ. YALNIZ iPhone'da (Platform.OS==='ios';
  Android eski davranışta kalır, bozulmasın diye): setIsAudioActiveAsync, keepAudioSessionActive, sessiz.wav sürekli döngü
  (AppState active'de yeniden), basaSarVeCal (seekTo sözü bitince çal, en geç 120 ms), havuz 3 (Android 2).
- SESLER (25 Kasım): ElevenLabs Sound Effects v3 ile "Kristal Bahçe" teması (araclar/ses-tema.md: promptlar). Her meyve ayrı
  çalgı + ayrı nota (erik Sol4, portakal Do5, elma Do6, limon Mi6, çilek Mi7, üzüm şıngırtı). Seçilen ham adaylar
  araclar/ham-sesler/*.mp3; `python3 araclar/sesleri-isle.py` kırpar, perde kaydırır, eşitler, sol/orta/sağ + zincir/yıldız
  notalarını (pling'den) üretir, sesListesi.js'i yazar. ElevenLabs akışı: OBjuJE2oZVloNRL2PvNY. Bu ortam ElevenLabs depolamasına
  erişemez: adaylar Murat'ın onayıyla `ses-istek` dalındaki ses-indir.yml iş akışıyla indirildi (adaylar/).
  araclar/sesleri-uret.py eski sentez sesler (artık kullanılmıyor).
- `araclar/web-deneme`: tarayıcı denemesi (animasyonlar anında biter; window.__dondur=0..1 animasyonu o anda dondurur):
  `bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/seviye-dene.cjs /tmp/meyve-web /tmp/meyve-ekran`
- Murat ekran videosu gönderirse ffmpeg ile kare kare incele (Expo Go eski güncellemeyi açabilir: yeşil tepe var mı bak).

## Murat ile çalışma
- Yalnızca iPhone'u var, kodu elle düzenleyemez; bütün dosyaları ben yazar, depoya gönderirim. "Şu satırı değiştir" deme.
- Görme engelli, VoiceOver kullanıyor; görselleri kendisi değerlendiremez. Görseli ben ekran görüntüsüyle kontrol ederim,
  gören test kişisi de bakar.
- Kendisinin yapacağı adımlarda doğrudan bağlantı ver. Her şey Türkçe.
- Telefonda denenmemiş şeyi "çalışıyor" diye sunma.
