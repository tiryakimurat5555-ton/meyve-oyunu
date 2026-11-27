# meyve-oyunu — çalışma notları

Murat'ın meyve temalı 3'lü eşleştirme oyunu (Kasım 2026). Global ad "Prism Orchard" (26 Kasım, Murat). Paket adı com.murat5561.prismorchard (Android + iOS; imza com.murat5561 kalsın, Murat). Expo slug meyve-oyunu kalır
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
- HEDEF: 10 bölüm × 10 = 100 seviye (Murat 25 Kasım onayladı). Plan: 4 Kış (kar), 5 Çiçek (tohum), 6 Tropik (sarmaşık: kesilmezse
  yayılır), 7 Kiraz Çiçeği (dinlenme, iki katlı kar), 8 Bağ Bozumu (fıçı: 3 vuruş, bazısından özel meyve), 9 Gece (sis: gizler,
  VoiceOver "sisli" der), 10 Kristal Bahçe (final, hepsi). Bot geçme: 31-50 ≥%75, 51-80 ≥%70, 81-100 ≥%65; bölüm başı tanıtım,
  4-5 seviyede bir dinlenme. Parça parça: 4-5 (31-50), 6 (51-60), 7 Kiraz Çiçeği (61-70, dinlenme: karışık engeller, bot %74-100), 8 Bağ Bozumu (71-80, bot %73-95), 9 Gece Bahçesi (81-90, bot %72-100) YAPILDI (25 Kasım);
  25 Kasım Murat: SON BÖLÜM YOK. 100 seviye sınır değil; bölüm çeşitliliği olabildiğince artırılacak (her bölüm yeni bir mekanik/tema).
  Murat'ın onayladığı sıra (25 Kasım): 10 Kristal Bahçe (şekilli tahtalar) YAPILDI (91-100, bot %65-99); 11 Arı Bahçesi (101-110, %69-97) ve 12 Saat Kulesi (111-120, %70-98)
  13 Rüzgârlı Tepe (121-130, %78-99), 14 Mantar Ormanı (131-140, %76-100),
  15 Kuş Yuvası (141-150, %67-95), 16 Göl Kıyısı (151-160, %71-100), 17 Gizli Bahçe (161-170, %75-96),
  18 Bukalemun Bahçesi (171-180, %79-100), 19 Balon Festivali (181-190, %70-97), 20 Hasat Pazarı (191-200, %70-98), 21 Bal Kovanı (201-210, %70-97),
  22 Kartopu Tepesi (211-220, 26 Kasım Kış Dönüşü'nden çevrildi; sahne 21 kış), 23 Kurbağa Gölü (221-230, %72-100),
  24 Fener Bahçesi (231-240, %66-93), 25 Uzay Bahçesi (241-250, %77-100),
  26 Kovan Arıları (251-260, %79-99), 27 İnci Koyu (261-270, 26 Kasım Yaz Dönüşü'nden çevrildi; sahne 26 kumsal),
  28 Domino Bahçesi (271-280, %72-100), 29 Ayna Gölü (281-290, %69-100), 30 Büyük Hasat (291-300, karışık şenlik, %75-97; sahne 29 altın hasat) YAPILDI (26 Kasım). YAPILACAK (26 Kasım Murat ekletti): 31 Değirmen Tepesi (301-310, %67-100) YAPILDI (26 Kasım),
  32 Define Adası (311-320, %75-100) YAPILDI (26 Kasım), 33-50 YAPILDI (26 Kasım; aşağıda 33-50. BÖLÜMLER). 33 Dev Meyve Bahçesi (2x2 dev meyve,
  yanında eşleşme = çatlar, 4 vuruşta kırılır, o rengin hepsini patlatır), 34 İkiz Bahçe (kurdeleli meyve çifti: biri eşleşince öbürü
  de patlar), 35 Renkli Kristaller (renkli kapak yalnız kendi rengindeki eşleşmeyle kırılır; VO "Kırmızı kristalli elma"),
  36 Çan Kulesi (yardımcı: yanında eşleşme = satır+sütun temizler), 37 Yağmur Bulutu (bulutun altındaki sütunda eşleşme = yağar, kuru toprağı sular; hedef kuru toprak),
  38 Salyangoz Yarışı (yanında eşleşme = bir kare sağa; sağ kenarda bitiş), 39 Sihirli Kazan (yanındaki eşleşme kazana atar;
  dolunca özel parça saçar), 40 Kış Masalı (31-39 karışık, 400. seviye). Sonrası için yeni öneriler Murat'a sunulacak.
  KURAL (26 Kasım Murat): KARIŞIK (mevsim dönüşü / şenlik) BÖLÜMLER YALNIZ 10'UN KATLARINDA (40, 50, 60...). Diğer her bölüm yeni mekanik.
  YAPILACAK 41-50 (26 Kasım Murat ekletti): 41 Tren İstasyonu (vagon önündeki engeller temizlendikçe ilerler, istasyonda toplanır),
  42 Lav Adası (lav her 4 hamlede ilerler, değdiğini taşa çevirir; yanında eşleşme soğutur), 43 Hayalet Bahçesi (hayalet meyve her hamle
  görünür/görünmez; yalnız görünürken eşleşir), 44 Boya Atölyesi (yardımcı: boya kovası patlayınca çevreyi kendi rengine boyar),
  45 Panayır Çarkı (her 5 hamlede çark döner: rastgele ödül ya da küçük engel; VO söyler), 46 Işık Kulesi (ışık geçtiği buzu eritir;
  aynaların yanında eşleşme aynayı döndürür), 47 Sincap Ormanı (sincap birkaç hamlede bir meyveyi fındığa çevirir; fındık iner, toplanır;
  yanında eşleşme sincabı kaçırır), 48 Terazi Pazarı (sol/sağ yarıda eşit toplama; VO denge söyler), 49 Kuyruklu Yıldız Gecesi
  (her 5 hamlede yıldız düşüp sütun temizler; yıldız tozu toplanır; gece), 50 Yarı Yol Şenliği (41-49 karışık, 500. seviye). Sırada: yeni mekanikler / mevsim dönüşleri (19. bölüm, 181-). Plan: 11 Arı Bahçesi (çiçek
  tozu: üstünde eşleşme = tozlanır), 12 Saat Kulesi (geri sayımlı meyve, sıfırda kaybedilir), 13 Rüzgârlı Tepe (taşıyıcı bant),
  14 Mantar Ormanı (her 3 hamlede çoğalır), 15 Kuş Yuvası (yumurta 2 vuruş → civciv, tohum gibi iner), 16 Göl Kıyısı (akıntı kapıları),
  17 Kafes ve Anahtar, 18 Bukalemun Bahçesi (renk değiştiren meyve); sonra mevsim dönüşleri + yeni mekanikler.
  26 Kasım Murat: "Bütün bölümleri benden onay beklemeden yap" — bölümleri sırayla onay beklemeden yap, her biri bitince yayınla.
- ORTAK ALTYAPI (26 Kasım): mantik.js'te hamleDegeri (bot puanı, HEDEF_AGIRLIK), sayacEkle, duzenSayilari (DUZEN_HEDEF: düzen harfi →
  hedef), kalanlariYaz (KALAN_ENGEL: yayılan engellerde tahtada kalan), seviyeKur(seviye) (seviyeye özel ayar: saat başlangıcı vb.),
  hamleSonrasiKurallar (sarmaşık yayılması, saat azalması; ileride bant/mantar/bukalemun) — seviye-testi bunları kullanır; Oyun.js
  aynı kuralları animasyonlu uygular. serbestMi(e): takası engellemeyen engel (null, saat). seviyeler.hedefTamam genel (KALAN_HEDEF).
  Oyun.js EK_HEDEF tablosu: yeni hedeflerin anlatımı/kalan/olay/simgesi tek yerde. Yeni sesler ElevenLabs'ta topluca üretildi
  (cicek, saat_tik, saat_alarm, ruzgar, mantar, yumurta, civciv, kapi, anahtar, bukalemun; ham adaylar /tmp'de, seçilenler ham-sesler).
- ÇİÇEK (101-110, Arı Bahçesi): zemin değeri M.CICEK(10)+tür; düzen '1'-'6' (çilek, limon, üzüm, portakal, elma, erik). Eşleşmede yalnız
  kendi rengindeki meyve tozlar; özel parça patlaması her rengi tozlar (karEriyen t ile). Kasa kırılması tozlamaz. hedef.cicek.
  Çizim CicekZemin + CicekUst (renk rozeti), AriEfekt. VO "Elma çiçeğinde çilek". Ses 'cicek'. Sahne 10 (UcanAri).
- SAAT (111-120, Saat Kulesi): engel 'saat<n>' (Oyun.js p.saat), düzen 'z', başlangıç seviye.saat. Takas edilir (serbestMi), özel parça
  saatli hücreye konmaz. Temizlenince hedef.saat sayılır. Her çekiçsiz hamlede bir azalır; 0 olursa kaybedilir ("Saat doldu", +5 teklifi yok).
  SaatRozet (≤3 kırmızı). VO "Çilek, saatli, 5 hamle"; ≤3 iken duyuru. Sesler saat_tik / saat_alarm. Sahne 11 gün batımı.
- BANT / RÜZGÂR (121-130, Rüzgârlı Tepe): seviye.bant = [{ satir, yon }]; her çekiçsiz hamleden sonra o satırlar bir kare kayar (sarma),
  meyve engeli/özel haliyle taşınır, zemin kalır; sonra zincirCoz ile eşleşmeler çözülür (Oyun: bantKaydir + cozumle, sonucBirlestir).
  Çizim BantSerit (mavi şerit + »/« okları). VO hücre etiketine ", rüzgâr sağa/sola". Ses 'ruzgar'. Bant bedava eşleşme ürettiği için
  hamleler kısa tutuldu. mantik.zincirCoz: hamle dışı zincir çözümü; sayacBirlestir (iç, topla iç içe) ≠ sayacEkle (toplanan, düz).
- MANTAR (131-140, Mantar Ormanı): engel 'mantar' (Oyun.js p.mantar), ortuMu (sarmaşık gibi kesilir, meyve kalır). Kesilse de
  kesilmese de her M.MANTAR_ARALIK (3) çekiçsiz hamlede bir yayılır (sarmasikYay(..., 'mantar'); Oyun mantarSayac). Hedef kalan-sayılı
  (toplanan.mantarKalan, KALAN_ENGEL/KALAN_HEDEF). Düzen 'm'. MantarKatman/MantarIkon. VO "Mantarlı elma", duyuruda "Mantarlar N hamle
  sonra çoğalacak". Ses 'mantar'. Sahne 13 orman (sporlar).
- YUMURTA / CİVCİV (141-150, Kuş Yuvası): M.YUMURTA=24 (kasaMi, 2 kat; düzen 'y'), kırılınca yerinde M.CIVCIV=25 olur. Civciv INEN
  listesinde (tohum gibi: eşleşmez, takas edilir, en alt deliksiz satıra inince toplanır, sayac.civciv). hedef.civciv = yumurta sayısı.
  Bot: inen parça iki hamle ileri bakış civcivi de kapsar; yumurta vuruşu ödüllü. Çizim Yumurta (yuvada, çatlak), Civciv, CivcivIkon.
  VO "Yumurta, 2 kat" / "Çatlak yumurta" / "Civciv". Sesler 'yumurta', 'civciv'. Sahne 14 sabah.
- AKINTI KAPISI (151-160, Göl Kıyısı): seviye.kapilar = [{ giris: [r,c] (sütunun en alt deliksiz hücresi), cikis: [r,c] (bir sütunun en üst
  hücresi) }]. mantik.akisZincirleri: yerçekimi artık zincirler üzerinden (delik atlanır, kapı girişi çıkışa bağlanır); tohum/civciv
  zincirin dibinde (batak hücre) toplanır. Kapılar DÖNGÜ kurmamalı (seviye-testi denetler). seviyeKur kapıları kurar (Oyun da çağırır).
  Oyun: kapıdan geçen parça çıkış sütununun üstünden düşer (ses 'kapi'). KapiIsareti (numaralı renkli şerit, meyvelerin üstünde).
  VO hücre etiketine ", 1. akıntı kapısı girişi, meyveler 7. sütuna akar" / "çıkışı".
- KAFES / ANAHTAR (161-170, Gizli Bahçe): engel 'kafes' (Oyun.js p.kafes; düzen 'c'): takas yok, eşleşme/özel parça/çekiç açmaz, kafesli
  meyve temizlenmez (cozumAdimi hücrelerden çıkarır). M.ANAHTAR=26 (düzen 'a') INEN listesinde; en alta inince bütün kafesler açılır
  (sayac.kafes). DİKKAT: anahtarın sütununda altında kafes olmamalı (takılır; seviye-testi denetler). KafesKatman, Anahtar, KafesIkon.
  VO "Kafesli çilek", "Anahtar"; çekiçte "Kafes çekiçle kırılmaz". Ses 'anahtar'. Sahne 16 lila.
- BUKALEMUN (171-180, Bukalemun Bahçesi): engel 'buk' (Oyun.js p.buk; düzen 'u'), serbestMi (takas edilir); her çekiçsiz hamleden sonra
  bir sonraki renge geçer (bukalemunDegistir; Oyun bukalemunDegistir + cozumle), özel parça bukalemun hücresine konmaz. Temizlenince
  hedef.bukalemun. BukalemunHale (gökkuşağı halka + göz). VO "Bukalemun çilek", "Bukalemunlar renk değiştirdi". Ses 'bukalemun'.
- BALON (181-190, Balon Festivali): M.BALON=27 (düzen 'o'). Yerçekimi onu delik gibi atlar (gecilmez), takas edilmez. Eşleşmeye komşu ya da
  özel parça alanındaysa (cozumAdimi.balonlar) bir kare yükselir: üstündeki parçayla yer değiştirir (balonYukselt); en üstteyse uçar
  (sayac.balon, hedef.balon). Oyun: balon yükselme animasyonu + BalonUcus efekti. VO "Balon". Sahne 18 şenlik.
- SİPARİŞ (191-200, Hasat Pazarı): seviye.siparisler = [{ tur, n } | { ozel: 'cizgili'|'bomba'|'gokkusagi', n }]; hedef.siparis = sayısı.
  Sırayla; yalnız açık sipariş sayılır (fazlası geçmez). toplanan.siparis / siparisAdim. mantik.siparisIlerlet (kurallar ve Oyun
  hamleSonrasi), aktifSiparis (bot puanı), adimUygula sayac.ozel_<ad> (oluşan özel parça). Oyun: HedefKutusu açık siparişi simgeyle
  + "2/5" gösterir; tamamlanınca 'yildiz_2' sesi ve "Sipariş tamam! Sıradaki: 12 limon". Not: tarayıcı deneme betiği botu ayrı
  modülde çalıştırdığı için M.seviyeKur + siparisIlerlet ile açık siparişi bildirmek gerekir.
- BAL (201-210, Bal Kovanı): zemin değeri M.BAL=20 (düzen 'h'); karEriyen ile silinir (sayac.bal); hamlede hiç bal silinmezse balYay
  yanına yayılır. Hedef kalan-sayılı: kalanlariYaz(toplanan, engel, zemin) → balKalan (KALAN_HEDEF 'bal'). BalZemin/BalUst/BalIkon.
  VO "Ballı çilek", "Bal yayıldı, ...". Sahne 20 (arılar).
- KURBAĞA (221-230, Kurbağa Gölü): M.KURBAGA=28 (düzen 'q'), engel 'kurb<n>' (serbestMi: takas edilir), eşleşmez, düşer. Her çekiçsiz
  hamleden sonra kurbagaBeslen: komşu sade meyveyi yer (topla sayılır), KURBAGA_DOY (5) olunca 3x3 patlar (hedef.kurbaga). mantik
  yercekimiUygula (t/oz/engel birlikte); Oyun dusurDoldur() (cozumle'den ayrıldı) + kurbagaBeslen animasyonu. Kurbag, "n/5" rozeti.
  VO "Kurbağa, 3 meyve yedi, doymasına 2 kaldı". Bölüm dost mekanik olduğu için kolay; zorluk engellerden.
- FENER (231-240, Fener Bahçesi): M.FENER=29 (düzen 'l'); takas yok, eşleşmez, düşer; komşu eşleşme işlemez, yalnız özel parça alanı /
  çekiç (cozumAdimi.fenerler = g.hucreler içindeki fenerler) yakar → gider (hedef.fener). Bot özel parça yapmayı ödüllendirir ama
  planlamadığı için zayıf; hamleler uzun (34-46). Fener/FenerIkon/FenerYanma. VO "Sönük fener". Sahne 23 gece (RENKLER.gece).
- UZAY / YERÇEKİMİ YÖNÜ (241-250, Uzay Bahçesi): seviye.yercekimi = { yonler: ['asagi','sol',...], aralik }; her `aralik` çekiçsiz hamlede
  sıradaki yön. mantik yerYonu (yonAyarla/yercekimiYonu), akisZincirleri döndürülmüş çerçevede (gercekHucre) → düşme, yeni meyvenin
  geldiği kenar ve tohumun toplandığı kenar yöne uyar. Kapılar yalnız 'asagi'da (uzayda kapı/balon kullanma). seviyeKur yönü sıfırlar
  (seviye-testi her denemede çağırır). Oyun: dusurDoldur yeni meyveyi ters kenardan sokar; başlıkta ⬇️⬆️⬅️➡️, VO "yerçekimi sola",
  dönüşte "Yerçekimi döndü, meyveler artık sola düşüyor". Sahne 24 uzay (gece).
- ARI KOVANI (251-260, Kovan Arıları): M.KOVAN=31 (kasaMi, engel 9; düzen 'w'), kırılmaz; vuruluşta sayac.ari, zincirCoz bir sonraki
  adımın ek'ine ariHedefleri (rastgele engelli/zeminli/kasa/fener hücreleri) koyar. Oyun: kasaVurus'ta kovan → ariSay, dusurDoldur sonrası
  ekler = arı hedefleri + 'ari' efekti. Kovan çizimi. Arılar güçlü: hamleler kısa (10-15).
- DOMİNO (271-280, Domino Bahçesi): M.DOMINO=32, engel 'domy'/'domd' (düzen 'd'/'D'); takas yok, düşer. Komşu eşleşme / özel parça
  alanı → bitişik aynı yöndeki dizinin tamamı devrilir (cozumAdimi.dominolar), dizinin iki ucundaki meyveler hücrelere eklenir.
  hedef.domino. Domino/DominoIkon. VO "Yatay domino". Zincir devrilme güçlü: hamleler kısa.
- AYNA (281-290, Ayna Gölü): seviye.ayna = true. Oyuncunun hamlesinin aynası (sütun → 7-sütun) geçerli bir eşleşme hamlesiyse
  hamleSonrasi başında kendiliğinden yapılır (hamle harcamaz; mantik.aynaHamlesi, kurallar ctx.sonHamle; Oyun hamleYap(a,b,true),
  sonHamle ref). Ortada dikey ayna çizgisi. VO "Ayna hamlesi yapıldı". Ses 'kapi'. Sahne 28 göl (parıltı). Engeller karışık.
- KARTOPU (211-220, Kartopu Tepesi): M.KARTOPU=33, engel 'kt<n>' (boy 1-3; serbestMi), INEN listesinde (tohum gibi iner, takas edilir,
  eşleşmez). Yanında eşleşme = büyür (cozumAdimi.buyuyen, en çok 3). En alta inince toplanır (sayac.kartopu, hedef.kartopu) ve
  kartopuAlani(r,c,boy) bir sonraki adımın ek'i olur: boy 1 artı, 2 3x3, 3 5x5. Düzen 'n'. Kartopu çizimi (boy rozeti). VO "Küçük/Orta/Büyük kartopu".
- İSTİRİDYE (261-270, İnci Koyu): M.ISTIRIDYE=34, engel 'ist0' kapalı / 'ist1' açık; gecilmez (yerçekimi atlar, takas yok). Her çekiçsiz
  hamleden sonra hepsi açılır/kapanır (istiridyeDegistir; Oyun hamleSonrasi). Açıkken komşu eşleşme ya da özel parça alanı → inci verir,
  gider (cozumAdimi.istiridyeler, hedef.istiridye). Düzen 'i' / 'I'. Istiridye çizimi. VO "Açık/Kapalı istiridye", "İstiridyeler döndü, 2 tanesi açık".
- DEĞİRMEN (301-310, Değirmen Tepesi): seviye.carklar = [[r, c]] (2x2 çarkın sol üst hücresi). Her M.CARK_ARALIK (2) çekiçsiz hamlede
  çarktaki parçalar (engel/özel haliyle) saat yönünde döner (mantik.carkDondur, carkSirasi; zemin kalır), sonra zincirCoz. Çark hücresinde
  patlayan renkli meyve = 1 çuval un (sayac.un, hedef.un; mantik carkHucreMi seviyeKur'da kurulur; Oyun unSay). Oyun carkDondur + carkSayac.
  CarkCerceve (altta ahşap çerçeve + göbek), UnIkon. VO hücreye ", değirmen çarkı"; "Çarklar döndü" / "Çarklar bir hamle sonra dönecek".
  Sahne 30: buğday tepeleri + iki dönen yel değirmeni (Degirmen). Tanıtım 'cark' (301).
- KUM / SANDIK (311-320, Define Adası): zemin değeri M.KUM=40 (düzen 'r'), kar gibi tek kat silinir (sayac.kum). seviye.sandiklar =
  [[r, c, 'y'|'d']] kumun altındaki 2 karelik sandık; hücreleri kumlu olmalı (seviye-testi denetler). Bütün kumu gidince bulunur: hedef.sandik
  KALAN_HEDEF (toplanan.sandikKalan = M.sandikKalan(zemin), etkinSeviye'den). sayac.sandik = sandık hücresinde kalkan kum (bot ağırlığı).
  Oyun: eriyen döngüsünde KUM dalı, sandikBulunan → 'Sandık bulundu!' (yildiz_3), sarmasikGuncelle hedef.sandik için de çalışır.
  Çizim: GomuluSandik (kumun ALTINDA; bulununca altın), KumZemin/KumUst, SandikIkon. VO "Kumlu elma", açılan sandık hücresi ", sandık". Sahne 31 kumsal ada.
- 33-50. BÖLÜMLER (321-500; 26 Kasım, Murat "bana sormadan planladığımız tüm bölümleri eksiksiz yap"): ortak altyapı mantik.js sonunda
  ("33-49. bölümlerin nesneleri"): t türleri DEV 35, CAN 36, SALYANGOZ 37, KAZAN 38, VAGON 39, BOYA 41, AYNA_T 42, SINCAP 43, FINDIK 44 (INEN),
  HAYALET 45; zemin KURU 50, TOZ 51. Nesneler (NESNE) gecilmez + kilitli; vuruluş yeniCozum → adim.nesneler. Adımın yeni kısmı ekAdim
  (adımdan ÖNCEKİ ızgaralarla; kalan/degis/zemin/sayac/alan/etiket/efekt) hem adimUygula'da hem Oyun cozumle'de çağrılır (Oyun hucreEsitle ile
  uygular). Hamle sonrası yeni kurallar ekKurallar (hayalet, lav yayılması, sincap, tren, panayır, kuyruklu yıldız, ışık kulesi) hem
  hamleSonrasiKurallar'da hem Oyun hamleSonrasi'nda (ekSayac; tasimalar animasyonu, sonra hucreEsitle + cozumle). Oyun'da yeni engeller
  parçada ham olarak p.ek (M.yeniEngelMi); engelIzgarasi önce p.ek döner. Çizimler oyun/gorsel2.js (YeniParca, EkKatman, DevMeyve, KuruZemin,
  TozZemin, BulutSerit, IsikHatti, Ray, TeraziCizgi, emoji simgeler; PNG gelince değişecek). VO adları Oyun yeniAd/ekOn, duyurular ekOlayMetni.
  Düzen harfleri: C çan, L salyangoz, Q kazan, V vagon, R lav, H/G görünür/görünmez hayalet, B boya (renk seviye.boyalar), M/N ayna, J sincap,
  p yıldız tozu, T kuru toprak. Listeler: devler [[r,c,tür]], ikizler [[[r,c],[r,c]]], kristaller [[r,c,tür]], boyalar, bulutlar [sütun],
  ray (satır), isik (satır), terazi/panayir/kuyruklu: true. Hedefler: dev, kurdele, kristal, can, toprak (KALAN), salyangoz, kazan, vagon,
  lav (KALAN: lav+taş), hayalet, boya, findik, toz, sol/sag. Sahne 32-49 var olanlardan türetildi (sahne.js tret). Seviyeler /tmp/sv/uret.py
  ile üretildi, /tmp/sv/ayar.py ile bot ayarlandı (hamle ±, sonra eşik). Telefonda denenmedi.
- 26 Kasım Murat onayı ("Yap"): 19 Balon, 20 Hasat Pazarı (sırayla sipariş), 21 Bal Kovanı (bal lekesi yayılır), 22 Kış Dönüşü (karışık),
  23 Kurbağa Gölü, 24 Fener Bahçesi (yalnız özel parça yakar), 25 Uzay Bahçesi (yerçekimi yönü), 26 Kovan Arıları (yardımcı arılar),
  27 Yaz Dönüşü (karışık), 28 Domino, 29 Ayna Gölü (hamle aynalanır), 30 Büyük Hasat (karışık, 300. seviye).
- DELİK (91-100, Kristal Bahçe): t[r][c] = M.DELIK (30), düzen 'x'. Sabit; eşleşmez, takas edilmez (hamleBul/tumHamleler kilitli),
  genislet atlar (özel parçalar deliği temizlemez), yercekimi sütunda deliksiz hücreler üzerinden: meyve deliğin üstünden atlar.
  karistir yalnız renkli meyveleri karıştırır (diğer her şey yerinde). Tohum sütunun en alt deliksiz satırında toplanır (M.enAltSatir).
  Oyun.js: delik parçası çizilmez, karesi çerçeve ahşabı (#c88442) ile dolu; VO "Boş"; dokununca "Boş kare". Sahne 9: Kristal (Parilti).

- KAR (31-40): zemin katmanı (Oyun.js zemin ref, mantik zemin[r][c]=kat), parçayla düşmez. Üstündeki parça temizlenince / orada özel
  parça oluşunca / üstündeki kasa kırılınca bir kat erir (karEriyen); buz kırılması eritmez; komşu eşleşme eritmez. Düzen 's'/'S'.
  Çizim: KarZemin (altta) + KarUst (meyvenin üstünde alt kenar kar yığını + mavi kenar). VO: "Karlı çilek", "İki kat karlı ...".
- TOHUM (41-50): M.TOHUM=21; eşleşmez, patlamaz, özel parça işlemez, takas edilebilir, düşer; en alt sıraya inince toplanır
  (cozumAdimi.tohumlar, çiçek efekti). Çekiç tohuma işlemez. Düzen 't' (en alt sırada başlamaz). Bot (mantik.enIyiHamle ve
  seviye-testi) tohum seviyelerinde 2 hamle ileri bakar (1 hamlelik bot tohumu alt sıranın üstünde takılı bırakıyordu).
- SARMAŞIK (51-60, Tropik Bahçe; 25 Kasım): engel 'sarmasik' (Oyun.js p.sarmasik), buz gibi: takas edilemez, eşleşme / komşu eşleşme /
  özel parça / çekiç keser, meyve kalır (kar eritmez). Hamlede hiç kesilmezse M.sarmasikYay komşu sade meyveye yayılır (çekiçte yayılmaz;
  yayıldıktan sonra hamle kalmayacaksa o yer seçilmez). Hedef tahtada kalan: toplanan.sarmasikKalan (hedefTamam buna bakar).
  Düzen 'v'. Sesler sarmasik_kes / sarmasik_yay (ElevenLabs). VO: "Sarmaşıklı elma", "Sarmaşık yayıldı, 4. satır 3. sütun".
  Bot hedefi: 1-10 ≥%88, 11-20 ≥%85, 21-30 ≥%75 geçme; yıldız eşikleri bottan (2★ ≈ %40'lık, 3★ ≈ %75'lik puan).
  Simülasyon mulberry32 üreteci kullanır (eski LCG tekrarlı dizilerle sonuçları çarpıtıyordu).
- FIÇI (71-80, Bağ Bozumu; 25 Kasım): M.FICI=22, M.FICI_ODUL=23; kasa gibi (M.kasaMi ortak kontrol: takas/eşleşme yok, düşer, komşu
  eşleşme / özel parça / çekiç bir kat azaltır) ama 3 kat; ödüllü fıçı (altın yıldızlı) kırılınca yerinde rastgele satir/sutun/bomba meyve
  çıkar. Hedef hedef.fici, sayaç toplanan.fici. Düzen 'f'/'F'. Çizim gorsel.js Fici (çatlaklar kat azaldıkça), FiciIkon. Sesler kasa_vur/kasa_kir.
  VO: "Fıçı, 3 kat", "Ödüllü fıçı, 2 kat". Tanıtım 'fici' (71), 'fici_odul' (73). Sahne 7: akşamüstü bağ.
- SİS (81-90, Gece Bahçesi; 25 Kasım): engel 'sis' (Oyun.js p.sis), buz gibi (M.ortuMu: buz/sarmasik/sis) ama meyveyi GİZLER (SisKatman opak).
  Eşleşme / komşu eşleşme / özel parça / çekiç dağıtır. Hedef hedef.sis, toplanan.sis. Düzen 'g'. VO yalnız "Sisli" (meyve adı söylenmez).
  Bot ve ipucu sisin altını görmez: M.gorunurTahta (sisli hücre = benzersiz 100+ değer) ile karar verir (enIyiHamle ve seviye-testi).
  Ses 'sis' (ElevenLabs, ham sis_2). Sahne 8 gece: RENKLER.gece, Ay (uykulu yüz), Yildizlar, AtesBocegi; geceMi(bolum) ile başlık ve
  güçlendirici yazıları beyaz (koyu gökte okunsun).
- PNG PLANI (26 Kasım, Murat): Higgsfield kredisi gelince (1000 kredi, Seedream 5.5: taş 2,5 / arka plan 3,5 kredi) promptları ben yazar,
  üretir, tutarlılığı kontrol ederim (ortak tarz metni + mevcut meyveler referans). PNG: meyve/engel taşları (256, şeffaf), 30 arka plan
  (9:16 2K, önemli şeyler ortada; tablette kesilir), simge/açılış ekranı, arayüz süs/simgeleri (güçlendirici simgeleri emoji yerine, yıldız,
  kilit, dişli, düğme zemini, kutu çerçevesi, seviye düğmesi, günlük ödül sepetleri + raf, tahta çerçevesi). Yazı/sayı/efekt kodla. Kod çizimleri yedek kalır.
  Liste: Murat'a verilen higgsfield-png-listesi.txt. Sıra: arka planlar → buz/kasa/kar/fıçı/sis → diğer taşlar → simge/açılış.
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
- PLAY (26 Kasım): Android paketi `.github/workflows/android-derle.yml` ile GitHub'da derlenir (eas build --local, imza anahtarı Expo'da;
  sonuç GitHub sürümü android-<n>/prism-orchard.aab). Play işlemleri Deneme deposunun `prism` DALINDAKİ play-islem.yml ile (anahtarlar
  orada kalır, buraya ASLA kopyalanmaz): `gh api -X POST repos/tiryakimurat5555-ton/Deneme/actions/workflows/play-islem.yml/dispatches
  -f ref=prism -f 'inputs[islem]=yukle' -f 'inputs[paket]=com.murat5561.prismorchard' -f 'inputs[hedef]=<aab adresi>' -f 'inputs[kanal]=alpha'
  -f 'inputs[grup]=galaktik-imparatorluk@googlegroups.com'`; mağaza sayfası islem listeAdres, hedef
  https://raw.githubusercontent.com/tiryakimurat5555-ton/meyve-oyunu/main/magaza/play (liste/*.txt, simge.png, one_cikan.png, ekran/N.jpg).
  Sürüm kodu 2 kapalı teste yüklendi; Murat formları doldurup 26 Kasım 18:26 incelemeye gönderdi, 26 Kasım akşam ONAYLANDI (alpha completed; 14 gün sayacı 12 test kullanıcısı katılınca) (hedef kitle 13+, veri toplanmıyor,
  oturum açma yok — oturum açmalı sürümde Uygulama erişimi + Veri güvenliği + gizlilik güncellenecek). Katılım: https://play.google.com/apps/testing/com.murat5561.prismorchard Gizlilik: docs/gizlilik.html (GitHub Pages, Murat açacak).
  Mağaza paketinde Bot düğmesi gizli (expo-updates kanalı 'production'). Simge assets/simge.png (kodla, geçici; PNG gelince değişir).

## Dosyalar
- `App.js`: kök; ekran (liste/oyun), ilerleme kaydı (AsyncStorage 'meyve-ilerleme-v1': acik, yildiz, enIyi, guc, gunluk{son,seri},
  bolumOdul), ayarlar, günlük ödül. `oyun/Paneller.js`: GunlukOdulPaneli, AyarlarPaneli, GUNLUK_ODUL.
- EKRANLAR (26 Kasım, Murat onayladı): App ekran.ad = 'ana' | 'harita' | 'gunluk' | 'oyun' (oyun ekran.nereden'e döner; Oyun geriAd).
  `oyun/AnaEkran.js`: logo (şimdilik zıplayan meyveler + "Prism Orchard"), yıldız + güçlendirici rozetleri, büyük "Oyna · Seviye N",
  altta üç yuvarlak düğme: Harita, Günlük ödül (ortada, sepet; alınabilirse kırmızı "!" noktası; seviye 5'ten önce kilitli), Ayarlar.
  Günlük ödül ARTIK KENDİLİĞİNDEN AÇILMAZ (Murat). `oyun/GunlukEkrani.js`: rafta 7 sepet (7. gün sandık), bugünkü zıplar, "Aç" →
  ödül simgeleri sayaca uçar, "Yarın gel: ..." notu; VO her gün ayrı ("4. gün, bugün, açılmadı, 1 çekiç"). App.gunlukDurum/gunlukAl.
  `oyun/HaritaEkrani.js`: bölüm bantları (gök renginden geçiş), Tabela, zikzak patika noktaları, taşlar (sıradaki parlar); açılınca
  sıradakine kayar (kök absolute dolgu şart: web denemesinde ScrollView ancak öyle kayıyor). Eski ListeEkrani silindi.
  `oyun/bolumler.js`: BOLUMLER (yeni bölüm eklenince BURAYA ekle), bolumBul. `oyun/arayuz.js`: kodla çizilen Sepet, Sandik, Raf,
  HaritaSimge, YuvarlakZemin, Tabela, GucSimge — PNG gelince yerlerine geçecek.
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
  (AppState active'de yeniden), basaSarVeCal (seekTo sözü bitince çal, en geç 120 ms), havuz 3 (Android 2) yalnız SIK seslere
  (meyve, zincir, takas...), diğerlerine 1 çalar (25 Kasım: 160 çalar iPhone açılışını ağırlaştırıyordu). 27 Kasım (Murat: 27 yeni sesten
  sonra açılışta hiçbir düğme basılmıyordu, ~147 çalar): çalarlar açılıştan 300 ms sonra 60 ms'de 3'er kurulur (havuzKur), kurulmamış ses istenirse o an kurulur.
- SESLER (25 Kasım): ElevenLabs Sound Effects v3 ile "Kristal Bahçe" teması (araclar/ses-tema.md: promptlar). Her meyve ayrı
  çalgı + ayrı nota (erik Sol4, portakal Do5, elma Do6, limon Mi6, çilek Mi7, üzüm şıngırtı). Seçilen ham adaylar
  araclar/ham-sesler/*.mp3; `python3 araclar/sesleri-isle.py` kırpar, perde kaydırır, eşitler, sol/orta/sağ + zincir/yıldız
  notalarını (pling'den) üretir, sesListesi.js'i yazar. ElevenLabs akışı: OBjuJE2oZVloNRL2PvNY. Bu ortam ElevenLabs depolamasına
  erişemez: adaylar Murat'ın onayıyla `ses-istek` dalındaki ses-indir.yml iş akışıyla indirildi (adaylar/).
  araclar/sesleri-uret.py eski sentez sesler (artık kullanılmıyor).
- TOK MEYVE SESLERİ (27 Kasım, Murat: "daha tok, kulağı tırmalamayan"): erik marimba Sol3 (tok_erik_1), portakal vibrafon Do4 (tok_portakal_1),
  elma kalimba Mi4 (tok_elma_4), limon eski cam bardak Do5'e indirildi, çilek eski çan Sol5'e, üzüm tahta boncuk (tok_uzum_4, tanh sıkıştırma);
  hepsi Butterworth alçak geçiren (3-4,5 kHz, yumusat) + 4 ms yumuşak başlangıç, -17 dB. Eski (tiz) sesler git geçmişinde.
- DIŞARIDAN SESLER (27 Kasım, Murat başka bir yapay zekaya ürettirdi, sesler.zip, 94 WAV 48 kHz mono): araclar/disaridan/*.wav; sesleri-isle.py en sonda
  bunları işler (esitle -17, kazandin/kaybettin -14; meyve_* sol/orta/sağ) ve aynı adlı eski sesin YERİNE GEÇER (tok meyve sesleri de dahil; ovgu_* ve sessiz
  dışarıdan gelmedi, eskisi kaldı). Yeni adlar Oyun.js'e bağlandı: kar_eri, tohum_cicek, fici_odul, yercekimi, ayna_hamle, kafes, balon_yuksel/_uc, siparis,
  bal_temizle/_yay, kartopu_buyu/_patla, kurbaga_ye/_patla, fener_yan, ari_kovan, istiridye_don, inci, domino, un, terazi. Bilgi belgesi: /tmp/prism-orchard-ses-bilgisi.txt (Murat'ta).
- ÖVGÜ SESLENDİRMESİ (25 Kasım, Murat istedi): ElevenLabs eleven_v4, kütüphane sesi "Miranda" (PoHUWWWMHFrA8z7Q88pu, tatlı/neşeli),
  akış csKqxNdVJHGnAhNOObTv. ovgu_nice/great/amazing/fantastic (coşku zincirle artar), ovgu_garden (şenlik), ovgu_level (kazanınca,
  kazandin'dan 250 ms sonra). Zincir sesi hamlenin bütün zinciri bitince en yüksek aşama için bir kez (hamleSonrasi); hedef tamamsa
  yalnız Garden Party. Hafif kristal yankı sesleri-isle.py'de. VoiceOver için ayrı ayar YOK (Murat: doğrudan çalsın).
- 31-50. BÖLÜM SESLERİ (27 Kasım, Murat istedi; ben seçtim): 27 ses (can_cal, dev_catla, dev_kir, kurdele, kristal_kir, yagmur, salyangoz_adim/_bitis,
  kazan_dol/_tasma, tren_ilerle/_vardi, lav_yay, lav_sogu, tas_kir, hayalet, boya, panayir (atempo 2 ile hızlandırıldı), isik, ayna_don, sincap, findik,
  yildiz_dus, toz, cark, sandik, kum). Promptlar ses-tema.md sonunda. Oyun.js: ekA efektleri EK_SES listesiyle (adımda en çok 2 ses), ekKurallar olayları OLAY_SES.
- MENÜ TIK SESLERİ (25 Kasım, Murat istedi): 'dugme' (kristal tık; ham dugme_3) ileri giden düğmeler, 'dugme_geri' (dugme_1'in
  kalın kopyası) geri/kapat/vazgeç. App.js'te tikla(f, ses) sarmalayıcısı; Başla ve Vazgeç Oyun.js'te. Oyun içi güçlendirici
  düğmelerinin kendi sesleri var (ipucu pling, çekiç secim, karıştır, +3 ozel_olustu).
- `araclar/web-deneme`: tarayıcı denemesi (animasyonlar anında biter; window.__dondur=0..1 animasyonu o anda dondurur):
  `bash araclar/web-deneme/yap.sh /tmp/meyve-web && NODE_PATH=/opt/npm-tools/node_modules node araclar/web-deneme/seviye-dene.cjs /tmp/meyve-web /tmp/meyve-ekran`
- Murat ekran videosu gönderirse ffmpeg ile kare kare incele (Expo Go eski güncellemeyi açabilir: yeşil tepe var mı bak).

## Murat ile çalışma
- Yalnızca iPhone'u var, kodu elle düzenleyemez; bütün dosyaları ben yazar, depoya gönderirim. "Şu satırı değiştir" deme.
- Görme engelli, VoiceOver kullanıyor; görselleri kendisi değerlendiremez. Görseli ben ekran görüntüsüyle kontrol ederim,
  gören test kişisi de bakar.
- Kendisinin yapacağı adımlarda doğrudan bağlantı ver. Her şey Türkçe.
- Telefonda denenmemiş şeyi "çalışıyor" diye sunma.
