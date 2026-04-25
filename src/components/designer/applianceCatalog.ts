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
