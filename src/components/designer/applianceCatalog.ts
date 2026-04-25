export interface ApplianceModel {
  id: string;
  brand: string;
  model: string;
  category: string;
  w: number;   // ширина мм
  h: number;   // глубина мм
  color: string;
  icon: string;
}

export const APPLIANCE_CATALOG: ApplianceModel[] = [
  // ── Холодильники ────────────────────────────────────────────────────────────
  { id: 'bosch-kgn56', brand: 'Bosch', model: 'KGN56VI30', category: 'Холодильник', w: 600, h: 650, color: '#f8fafc', icon: '❄️' },
  { id: 'bosch-kgs57', brand: 'Bosch', model: 'KGS57EI20U', category: 'Холодильник', w: 700, h: 650, color: '#f8fafc', icon: '❄️' },
  { id: 'bosch-kgn39', brand: 'Bosch', model: 'KGN39VL17R', category: 'Холодильник', w: 600, h: 650, color: '#f8fafc', icon: '❄️' },
  { id: 'samsung-rb37', brand: 'Samsung', model: 'RB37A5200SA', category: 'Холодильник', w: 595, h: 650, color: '#f0f4f8', icon: '❄️' },
  { id: 'samsung-rf60', brand: 'Samsung', model: 'RF60A91ESR8 (Side-by-Side)', category: 'Холодильник', w: 912, h: 716, color: '#f0f4f8', icon: '❄️' },
  { id: 'samsung-rb33', brand: 'Samsung', model: 'RB33A3440EL', category: 'Холодильник', w: 600, h: 650, color: '#f0f4f8', icon: '❄️' },
  { id: 'lg-gc-b459', brand: 'LG', model: 'GC-B459SMUM', category: 'Холодильник', w: 595, h: 637, color: '#f8fafc', icon: '❄️' },
  { id: 'lg-gb7143', brand: 'LG', model: 'GB7143AIDV', category: 'Холодильник', w: 595, h: 668, color: '#f8fafc', icon: '❄️' },
  { id: 'atlant-4421', brand: 'Атлант', model: 'ХМ 4421-000 N', category: 'Холодильник', w: 600, h: 570, color: '#f5f5f5', icon: '❄️' },
  { id: 'atlant-4624', brand: 'Атлант', model: 'ХМ 4624-101', category: 'Холодильник', w: 595, h: 605, color: '#f5f5f5', icon: '❄️' },
  { id: 'indesit-dfe4', brand: 'Indesit', model: 'ITD 4180 W', category: 'Холодильник', w: 600, h: 600, color: '#f8f8f8', icon: '❄️' },
  { id: 'gorenje-nrk6', brand: 'Gorenje', model: 'NRK6192AXL4', category: 'Холодильник', w: 600, h: 650, color: '#f0f0f0', icon: '❄️' },
  { id: 'liebherr-cn', brand: 'Liebherr', model: 'CNsdc 5223', category: 'Холодильник', w: 600, h: 675, color: '#f8fafc', icon: '❄️' },

  // ── Посудомоечные машины ──────────────────────────────────────────────────
  { id: 'bosch-sms25', brand: 'Bosch', model: 'SMS25AI01R', category: 'Посудомоечная', w: 600, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'bosch-sps2', brand: 'Bosch', model: 'SPS2IKW1BR (узкая)', category: 'Посудомоечная', w: 450, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'electrolux-esf', brand: 'Electrolux', model: 'ESF9552LOW', category: 'Посудомоечная', w: 600, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'samsung-dw60', brand: 'Samsung', model: 'DW60M6040BB', category: 'Посудомоечная', w: 598, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'hansa-zim', brand: 'Hansa', model: 'ZIM466ELH', category: 'Посудомоечная', w: 450, h: 550, color: '#e2e8f0', icon: '🍽️' },
  { id: 'miele-g5310', brand: 'Miele', model: 'G 5310 SCi', category: 'Посудомоечная', w: 598, h: 570, color: '#e2e8f0', icon: '🍽️' },

  // ── Плиты и варочные поверхности ─────────────────────────────────────────
  { id: 'bosch-pkn645', brand: 'Bosch', model: 'PKN645F17R (варочная)', category: 'Плита', w: 580, h: 510, color: '#1e293b', icon: '🔥' },
  { id: 'gorenje-ect64', brand: 'Gorenje', model: 'ECT642SC (варочная)', category: 'Плита', w: 600, h: 510, color: '#1e293b', icon: '🔥' },
  { id: 'hansa-fcew', brand: 'Hansa', model: 'FCEW53000 (свободностоящая)', category: 'Плита', w: 500, h: 600, color: '#374151', icon: '🔥' },
  { id: 'gorenje-fs6121', brand: 'Gorenje', model: 'FS6121BH (свободностоящая)', category: 'Плита', w: 600, h: 600, color: '#374151', icon: '🔥' },
  { id: 'darina-1b', brand: 'Darina', model: '1B GM441 001 W', category: 'Плита', w: 500, h: 570, color: '#f0f0f0', icon: '🔥' },
  { id: 'electrolux-ek', brand: 'Electrolux', model: 'EKC96450AW (свободностоящая)', category: 'Плита', w: 900, h: 600, color: '#f5f5f5', icon: '🔥' },

  // ── Духовые шкафы ────────────────────────────────────────────────────────
  { id: 'bosch-hbf154', brand: 'Bosch', model: 'HBF154BS0R (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'gorenje-bos737', brand: 'Gorenje', model: 'BOS737E20BG (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'electrolux-ezb', brand: 'Electrolux', model: 'EZB55410AX (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'samsung-nv75', brand: 'Samsung', model: 'NV75N5641RS (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },

  // ── Стиральные машины ────────────────────────────────────────────────────
  { id: 'bosch-wan28', brand: 'Bosch', model: 'WAN28163OE', category: 'Стиральная машина', w: 600, h: 590, color: '#f0f4f8', icon: '🧺' },
  { id: 'samsung-ww70', brand: 'Samsung', model: 'WW70A4S20CE', category: 'Стиральная машина', w: 600, h: 550, color: '#f0f4f8', icon: '🧺' },
  { id: 'lg-f2j5hs6w', brand: 'LG', model: 'F2J5HS6W', category: 'Стиральная машина', w: 600, h: 560, color: '#f0f4f8', icon: '🧺' },
  { id: 'indesit-bwsa', brand: 'Indesit', model: 'BWSA 61051 W', category: 'Стиральная машина', w: 600, h: 530, color: '#f5f5f5', icon: '🧺' },
  { id: 'atlant-60c8', brand: 'Атлант', model: '60С812', category: 'Стиральная машина', w: 600, h: 500, color: '#f5f5f5', icon: '🧺' },

  // ── Микроволновые печи ───────────────────────────────────────────────────
  { id: 'samsung-me88', brand: 'Samsung', model: 'ME88SUG (настольная)', category: 'Микроволновка', w: 518, h: 469, color: '#374151', icon: '📡' },
  { id: 'lg-mh6535', brand: 'LG', model: 'MH6535GISR (настольная)', category: 'Микроволновка', w: 520, h: 486, color: '#374151', icon: '📡' },
  { id: 'bosch-hmt75', brand: 'Bosch', model: 'HMT75M421 (встраиваемая)', category: 'Микроволновка', w: 595, h: 322, color: '#374151', icon: '📡' },

  // ── Холодильники встраиваемые ─────────────────────────────────────────────
  { id: 'bosch-kil22', brand: 'Bosch', model: 'KIL22NSE0 (встраиваемый)', category: 'Встраиваемый холодильник', w: 560, h: 550, color: '#f8fafc', icon: '❄️' },
  { id: 'electrolux-ern', brand: 'Electrolux', model: 'ERN1900AOW (встраиваемый)', category: 'Встраиваемый холодильник', w: 560, h: 550, color: '#f8fafc', icon: '❄️' },

  // ── Leran ─────────────────────────────────────────────────────────────────
  { id: 'leran-rfb190', brand: 'Leran', model: 'RFB 190 W (однокамерный)', category: 'Холодильник', w: 595, h: 570, color: '#f5f5f5', icon: '❄️' },
  { id: 'leran-rfb200', brand: 'Leran', model: 'RFB 200 IX', category: 'Холодильник', w: 595, h: 620, color: '#e8eaed', icon: '❄️' },
  { id: 'leran-cbf420', brand: 'Leran', model: 'CBF 420 W (двухкамерный)', category: 'Холодильник', w: 595, h: 630, color: '#f5f5f5', icon: '❄️' },
  { id: 'leran-fdw55', brand: 'Leran', model: 'FDW 55-096 W (узкая)', category: 'Посудомоечная', w: 450, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'leran-fdw64', brand: 'Leran', model: 'FDW 64 D6 W', category: 'Посудомоечная', w: 598, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'leran-eob451', brand: 'Leran', model: 'EOB 451 BL (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#1e293b', icon: '🍕' },
  { id: 'leran-hi32', brand: 'Leran', model: 'HI 32 B (варочная)', category: 'Плита', w: 580, h: 510, color: '#1e293b', icon: '🔥' },
  { id: 'leran-hi64', brand: 'Leran', model: 'HI 641 B (варочная)', category: 'Плита', w: 595, h: 510, color: '#1e293b', icon: '🔥' },
  { id: 'leran-wms60', brand: 'Leran', model: 'WMS 60T12 W', category: 'Стиральная машина', w: 600, h: 550, color: '#f5f5f5', icon: '🧺' },
  { id: 'leran-wms47', brand: 'Leran', model: 'WMS 47T102 W (узкая)', category: 'Стиральная машина', w: 470, h: 550, color: '#f5f5f5', icon: '🧺' },

  // ── Weissgauff ───────────────────────────────────────────────────────────
  { id: 'wg-wrk2000', brand: 'Weissgauff', model: 'WRK 2000 Full NoFrost', category: 'Холодильник', w: 595, h: 640, color: '#f0f4f8', icon: '❄️' },
  { id: 'wg-wcd337', brand: 'Weissgauff', model: 'WCD 337 NFW', category: 'Холодильник', w: 595, h: 650, color: '#f5f5f5', icon: '❄️' },
  { id: 'wg-wrs590', brand: 'Weissgauff', model: 'WRS 590 BeNFX (Side-by-Side)', category: 'Холодильник', w: 910, h: 700, color: '#e8eaed', icon: '❄️' },
  { id: 'wg-dw4026', brand: 'Weissgauff', model: 'DW 4026 D', category: 'Посудомоечная', w: 598, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'wg-bdw4533', brand: 'Weissgauff', model: 'BDW 4533 D (узкая)', category: 'Посудомоечная', w: 450, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'wg-ov692', brand: 'Weissgauff', model: 'OV W 692 (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'wg-eov29', brand: 'Weissgauff', model: 'EOV 29 PD (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'wg-hi641', brand: 'Weissgauff', model: 'HI 641 B (варочная)', category: 'Плита', w: 575, h: 505, color: '#1e293b', icon: '🔥' },
  { id: 'wg-wm4148', brand: 'Weissgauff', model: 'WM 4148 DC', category: 'Стиральная машина', w: 600, h: 550, color: '#f0f4f8', icon: '🧺' },
  { id: 'wg-wm4758', brand: 'Weissgauff', model: 'WM 4758 D (узкая)', category: 'Стиральная машина', w: 470, h: 550, color: '#f0f4f8', icon: '🧺' },

  // ── Haier ─────────────────────────────────────────────────────────────────
  { id: 'haier-a2f637', brand: 'Haier', model: 'A2F637CGG (двухкамерный)', category: 'Холодильник', w: 595, h: 650, color: '#e8eaed', icon: '❄️' },
  { id: 'haier-a2f737', brand: 'Haier', model: 'A2F737CGG (двухкамерный)', category: 'Холодильник', w: 595, h: 650, color: '#e8eaed', icon: '❄️' },
  { id: 'haier-hrf628', brand: 'Haier', model: 'HRF-628IG6 (French Door)', category: 'Холодильник', w: 910, h: 730, color: '#e8eaed', icon: '❄️' },
  { id: 'haier-hrf450', brand: 'Haier', model: 'HRF-450DS6 (Side-by-Side)', category: 'Холодильник', w: 908, h: 695, color: '#e8eaed', icon: '❄️' },
  { id: 'haier-hdw50', brand: 'Haier', model: 'HDW50-288 (узкая)', category: 'Посудомоечная', w: 450, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'haier-hdw15', brand: 'Haier', model: 'HDW15-288 W', category: 'Посудомоечная', w: 598, h: 600, color: '#e2e8f0', icon: '🍽️' },
  { id: 'haier-hhi640', brand: 'Haier', model: 'HHI 640 B (варочная)', category: 'Плита', w: 590, h: 510, color: '#1e293b', icon: '🔥' },
  { id: 'haier-hob60', brand: 'Haier', model: 'HOB 60 (свободностоящая)', category: 'Плита', w: 600, h: 600, color: '#374151', icon: '🔥' },
  { id: 'haier-hov60', brand: 'Haier', model: 'HOV 60 S3X (встраиваемый)', category: 'Духовой шкаф', w: 595, h: 548, color: '#374151', icon: '🍕' },
  { id: 'haier-hw70', brand: 'Haier', model: 'HW70-BP14959', category: 'Стиральная машина', w: 600, h: 550, color: '#f0f4f8', icon: '🧺' },
  { id: 'haier-hw80', brand: 'Haier', model: 'HW80-BP14979S', category: 'Стиральная машина', w: 600, h: 590, color: '#f0f4f8', icon: '🧺' },
  { id: 'haier-hmc255', brand: 'Haier', model: 'HMC255BSSX (настольная)', category: 'Микроволновка', w: 475, h: 361, color: '#374151', icon: '📡' },

  // ── Мойки кухонные ───────────────────────────────────────────────────────
  { id: 'wulian-680', brand: 'Wulian', model: '680×460 Белая с краном (накладная)', category: 'Мойка', w: 680, h: 460, color: '#f8f8f8', icon: '🚰' },
  { id: 'sink-franke-610', brand: 'Franke', model: 'MRX 610-52 (врезная)', category: 'Мойка', w: 610, h: 500, color: '#e2e8f0', icon: '🚰' },
  { id: 'sink-blanco-514', brand: 'Blanco', model: 'Classik 6S (врезная)', category: 'Мойка', w: 780, h: 500, color: '#e2e8f0', icon: '🚰' },
  { id: 'sink-omoikiri-480', brand: 'Omoikiri', model: 'Bosen 48-U (накладная)', category: 'Мойка', w: 480, h: 432, color: '#e2e8f0', icon: '🚰' },
];

export function searchAppliances(query: string): ApplianceModel[] {
  if (!query.trim()) return APPLIANCE_CATALOG;
  const q = query.toLowerCase();
  return APPLIANCE_CATALOG.filter(a =>
    a.brand.toLowerCase().includes(q) ||
    a.model.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q)
  );
}
