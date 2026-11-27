// Can sistemi testi: bun araclar/can-testi.mjs
import { BOS_CAN, CAN_SURE, canDurumu, canEkle, canHarca, oynanabilir, sinirsizEkle, canGerekli } from '../oyun/can.js';
const ok = (k, m) => { if (!k) { console.error('HATA:', m); process.exit(1); } };
const t0 = 1_000_000_000;
let c = BOS_CAN;
ok(canDurumu(c, t0).n === 5, 'başta 5');
let r = canHarca(c, t0); c = r.can; ok(r.harcandi && canDurumu(c, t0).n === 4, '1 harcandı');
ok(Math.round(canDurumu(c, t0).sonraki) === CAN_SURE, 'sayaç 30 dk');
for (let i = 0; i < 4; i++) c = canHarca(c, t0 + i).can;
ok(canDurumu(c, t0 + 10).n === 0 && !oynanabilir(c, t0 + 10), 'can bitti');
ok(canDurumu(c, t0 + CAN_SURE).n === 1, '30 dk sonra 1 can');
ok(canDurumu(c, t0 + CAN_SURE * 5).n === 5 && canDurumu(c, t0 + CAN_SURE * 9).n === 5, '2,5 saatte dolu, fazlası yok');
c = canEkle(BOS_CAN, 2, t0); ok(canDurumu(c, t0 + CAN_SURE * 3).n === 7, 'ödülle 5 üstü, sayaç işlemez');
c = sinirsizEkle(canHarca(BOS_CAN, t0).can, 60, t0);
r = canHarca(c, t0 + 1000); ok(!r.harcandi && canDurumu(r.can, t0 + 1000).n === 4, 'sınırsızken harcanmaz');
ok(canDurumu(c, t0 + 61 * 60000).sinirsiz === 0, 'sınırsız biter');
ok(!canGerekli(20) && canGerekli(21), 'ilk 20 seviye ücretsiz');
console.log('CAN TESTLERİ GEÇTİ');
