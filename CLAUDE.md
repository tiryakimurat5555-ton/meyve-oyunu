# meyve-oyunu — çalışma notları

Murat'ın meyve temalı 3'lü eşleştirme oyunu (Kasım 2026). Geçici ad "Meyve Oyunu"; global mağaza adı en son seçilecek
(adaylar: Prism Orchard, Glimmer Grove, Glintberry; "Crystal …" adları dolu).

## Kararlar (Murat'ın)
- React Native / Expo; Expo Go'da denenir. Ağırlıklı olarak GÖRENLERE hitap eder; ama tam erişilebilir olacak (VoiceOver).
- Tema: meyve bahçesi, yüzlü sevimli meyveler. Hedef tarz: "kristal meyveler" (cam gibi parlak) + şıkır şıkır cam/çan sesleri.
  Şu anki resimler Higgsfield Seedream 5.5 ile üretilen "tombul parlak" yüzlü meyveler (assets/meyve, 256 px, şeffaf).
- Renkler: çilek kırmızı, limon sarı, üzüm mor, portakal turuncu, elma yeşil, erik lacivert. Koyu zeminde üzüm/erik kaybolur:
  tahta zemini açık renk kalmalı.
- Yapı (önerildi): seviyeli (hedef + hamle sınırı + 1-3 yıldız), özel parçalar, engeller, ödüllü reklam. Denge sayıları
  Murat'a önerilir, onaylarsa uygulanır. Şu an tek deneme oyunu: 30 hamle (ÖNERİ, onaylanmadı), puan 30/60/100 × zincir.
- Ekranda VoiceOver'a özel uyarı yazıları olmasın.

## Yayın
- Murat'ın Expo derleme dakikası yok. main'e her gönderimde `.github/workflows/expo-guncelleme.yml` GitHub Actions'ta
  `eas update --branch main` çalıştırır (depo açık: Actions dakikası ücretsiz). EXPO_TOKEN gizli anahtarı gerekir.
- app.json'da proje kimliği yoksa iş akışı `eas init` ile bağlar, app.json'u kendisi gönderir (önce `git pull` yap).
- Sonuç ve Expo Go bağlantısı `yayin-kaydi` dalındaki yayin-kaydi.txt'de: `git fetch origin +yayin-kaydi:refs/remotes/origin/yayin-kaydi && git show origin/yayin-kaydi:yayin-kaydi.txt` (dal her seferinde baştan yazılır; + şart). Çalışma listesi: `gh api repos/tiryakimurat5555-ton/meyve-oyunu/actions/runs`.
- Expo derlemesi (build) Murat'a sormadan başlatılmaz.

## Dosyalar
- `App.js`: oyun ekranı. Parçalar kimlikli nesneler (poz ValueXY hücre biriminde, olcek); `izgara` ref'i kimlikleri tutar.
  Görerek kipte tahtaya PanResponder (kaydır = takas, dokun = seç). VoiceOver kipinde 64 hücre Pressable
  ("Çilek seçili, 3. satır 5. sütun"), seç + komşuya dokun = takas; sonuçlar announceForAccessibility ile.
  Efektler: patlama parçacıkları, uçan puan, zincir övgüsü (Güzel/Harika/Muhteşem/Efsane), seçili halka, 7 sn sonra ipucu.
- `oyun/mantik.js`: saf mantık (test: `bun araclar/mantik-testi.mjs`).
- `oyun/ses.js`: expo-audio havuzu + expo-haptics. Meyve sesi sütuna göre sol/orta/sağ.
- `araclar/sesleri-uret.py`: geçici kristal sesleri üretir (assets/ses + oyun/sesListesi.js). İleride ElevenLabs.
- `araclar/web-deneme`: tarayıcı denemesi (animasyonlar anında biter):
  `bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/dene.cjs /tmp/meyve-web /tmp/meyve-ekran`

## Murat ile çalışma
- Yalnızca iPhone'u var, kodu elle düzenleyemez; bütün dosyaları ben yazar, depoya gönderirim. "Şu satırı değiştir" deme.
- Görme engelli, VoiceOver kullanıyor; görselleri kendisi değerlendiremez. Görseli ben ekran görüntüsüyle kontrol ederim,
  gören test kişisi de bakar.
- Kendisinin yapacağı adımlarda doğrudan bağlantı ver. Her şey Türkçe.
- Telefonda denenmemiş şeyi "çalışıyor" diye sunma.
