export interface PlacedItem {
  id: string;
  templateId: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  color: string;
  facadeStyle: 'matte';
  icon: string;
}

export interface DesignVariant {
  id: string;
  name: string;
  description: string;
  roomType: string;
  items: PlacedItem[];
  costTiers: { label: string; min: number; max: number }[];
}

type RoomDims = { width: number; height: number };

// ── хелперы ──────────────────────────────────────────────────────────────────
let _id = 0;
function uid() { return `gen-${++_id}`; }

function item(name: string, templateId: string, x: number, y: number, w: number, h: number, color: string, icon: string, rotation = 0): PlacedItem {
  return { id: uid(), templateId, name, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), rotation, color, facadeStyle: 'matte', icon };
}

// ── кухни ────────────────────────────────────────────────────────────────────
function kitchenLinear(r: RoomDims): PlacedItem[] {
  const d = 600;
  const items: PlacedItem[] = [];
  let x = 0;
  const segments = [
    { name: 'Нижний 60', id: 'k-base-60', w: 600, color: '#fef3c7', icon: '▭' },
    { name: 'Мойка', id: 'k-sink', w: 600, color: '#bae6fd', icon: '🚰' },
    { name: 'Нижний 60', id: 'k-base-60', w: 600, color: '#fef3c7', icon: '▭' },
    { name: 'Плита', id: 'k-stove', w: 600, color: '#f1f5f9', icon: '🔥' },
    { name: 'Нижний 60', id: 'k-base-60', w: 600, color: '#fef3c7', icon: '▭' },
  ];
  const total = segments.reduce((s, seg) => s + seg.w, 0);
  const startX = Math.max(0, (r.width - total) / 2);
  x = startX;
  for (const seg of segments) {
    items.push(item(seg.name, seg.id, x, 0, seg.w, d, seg.color, seg.icon));
    x += seg.w;
  }
  return items;
}

function kitchenL(r: RoomDims): PlacedItem[] {
  const d = 600;
  const items: PlacedItem[] = [];
  const bottomLen = Math.min(r.width, Math.max(1800, r.width * 0.7));
  const leftLen = Math.min(r.height * 0.5, 1800);

  items.push(item('Угловой нижний', 'k-corner', 0, 0, 900, 900, '#fde68a', '◩'));
  let x = 900;
  while (x + 600 <= bottomLen) {
    items.push(item('Нижний 60', 'k-base-60', x, 0, 600, d, '#fef3c7', '▭'));
    x += 600;
  }
  items.push(item('Мойка', 'k-sink', Math.min(x, bottomLen - 600), 0, 600, d, '#bae6fd', '🚰'));

  let y = 900;
  items.push(item('Плита', 'k-stove', 0, y, d, 600, '#f1f5f9', '🔥')); y += 600;
  if (y + 600 <= leftLen) { items.push(item('Нижний 60', 'k-base-60', 0, y, d, 600, '#fef3c7', '▭')); y += 600; }

  return items;
}

function kitchenU(r: RoomDims): PlacedItem[] {
  const d = 600;
  const items: PlacedItem[] = [];

  const topLen = r.width;
  const leftLen = Math.min(r.height - d, 2400);
  const rightLen = leftLen;

  let x = 0;
  while (x + 600 <= topLen) { items.push(item('Нижний 60', 'k-base-60', x, 0, 600, d, '#fef3c7', '▭')); x += 600; }

  let y = d;
  items.push(item('Мойка', 'k-sink', 0, y, d, 600, '#bae6fd', '🚰')); y += 600;
  while (y + 600 <= d + leftLen) { items.push(item('Нижний 60', 'k-base-60', 0, y, d, 600, '#fef3c7', '▭')); y += 600; }

  y = d;
  items.push(item('Плита', 'k-stove', r.width - d, y, d, 600, '#f1f5f9', '🔥')); y += 600;
  while (y + 600 <= d + rightLen) { items.push(item('Нижний 60', 'k-base-60', r.width - d, y, d, 600, '#fef3c7', '▭')); y += 600; }

  return items;
}

function kitchenIsland(r: RoomDims): PlacedItem[] {
  const items = kitchenL(r);
  const iw = Math.min(1400, r.width * 0.45);
  const ih = Math.min(900, r.height * 0.3);
  const ix = (r.width - iw) / 2;
  const iy = (r.height - ih) / 2 + 200;
  items.push(item('Кухонный остров', 'k-island', ix, iy, iw, ih, '#fef9c3', '⬛'));
  return items;
}

// Двухрядная/галерейная — шкафы на двух противоположных стенах
function kitchenGallery(r: RoomDims): PlacedItem[] {
  const d = 600;
  const items: PlacedItem[] = [];
  // Верхняя стена
  let x = 0;
  items.push(item('Нижний 60', 'k-base-60', x, 0, 600, d, '#fef3c7', '▭')); x += 600;
  items.push(item('Мойка', 'k-sink', x, 0, 600, d, '#bae6fd', '🚰')); x += 600;
  items.push(item('Нижний 60', 'k-base-60', x, 0, 600, d, '#fef3c7', '▭')); x += 600;
  if (x + 600 <= r.width) { items.push(item('Нижний 60', 'k-base-60', x, 0, 600, d, '#fef3c7', '▭')); }
  // Нижняя стена
  items.push(item('Плита', 'k-stove', 0, r.height - d, d, 600, '#f1f5f9', '🔥'));
  items.push(item('Нижний 60', 'k-base-60', 600, r.height - d, 600, d, '#fef3c7', '▭'));
  return items;
}

// Угловая с пеналом
function kitchenCornerPantry(r: RoomDims): PlacedItem[] {
  const items = kitchenL(r);
  const panW = 600; const panH = 600;
  items.push(item('Пенал', 'k-pantry', r.width - panW, 0, panW, panH, '#fde68a', '🗄️'));
  return items;
}

// ── спальни ──────────────────────────────────────────────────────────────────
function bedroomClassic(r: RoomDims): PlacedItem[] {
  const bw = Math.min(1800, r.width - 400);
  const bx = (r.width - bw) / 2;
  return [
    item('Кровать', 'b-bed-double', bx, r.height - 2100, bw, 2000, '#f9a8d4', '🛏️'),
    item('Тумба', 'b-nightstand', Math.max(0, bx - 550), r.height - 1500, 500, 400, '#fef3c7', '🕯️'),
    item('Тумба', 'b-nightstand', Math.min(r.width - 500, bx + bw + 50), r.height - 1500, 500, 400, '#fef3c7', '🕯️'),
    item('Шкаф-купе', 'b-wardrobe2', 0, 0, Math.min(2000, r.width), 600, '#fde68a', '👔'),
    item('Комод', 'b-dresser', r.width - 1050, r.height - 1600, 1000, 450, '#fed7aa', '🗃️'),
  ];
}

function bedroomSmall(r: RoomDims): PlacedItem[] {
  return [
    item('Кровать 90', 'b-bed-single', 0, r.height - 2100, 900, 2000, '#fbcfe8', '🛏️'),
    item('Тумба', 'b-nightstand', 950, r.height - 1500, 500, 400, '#fef3c7', '🕯️'),
    item('Шкаф-купе', 'b-wardrobe', r.width - 1500, 0, Math.min(1500, r.width), 600, '#fde68a', '👔'),
    item('Стол', 'o-desk', 0, 0, 1200, 600, '#d1fae5', '💻'),
  ];
}

function bedroomLuxury(r: RoomDims): PlacedItem[] {
  const bw = Math.min(2000, r.width - 600);
  const bx = (r.width - bw) / 2;
  return [
    item('Кровать 200×200', 'b-bed-king', bx, r.height - 2200, bw, 2100, '#fda4af', '🛏️'),
    item('Тумба', 'b-nightstand', Math.max(0, bx - 500), r.height - 1700, 450, 450, '#fef3c7', '🕯️'),
    item('Тумба', 'b-nightstand', Math.min(r.width - 450, bx + bw + 50), r.height - 1700, 450, 450, '#fef3c7', '🕯️'),
    item('Шкаф-купе', 'b-wardrobe2', 0, 0, r.width, 650, '#fde68a', '👔'),
    item('Туалетный столик', 'b-dresser', r.width - 1000, r.height - 1500, 900, 450, '#fce7f3', '🪞'),
    item('Кресло', 'l-armchair', 0, r.height - 1000, 850, 850, '#ede9fe', '💺'),
  ];
}

function bedroomKids(r: RoomDims): PlacedItem[] {
  return [
    item('Детская кровать', 'b-bed-single', 0, 0, 900, 1900, '#bfdbfe', '🛏️'),
    item('Стол письменный', 'o-desk', 0, r.height - 600, Math.min(1200, r.width), 600, '#d1fae5', '💻'),
    item('Стеллаж', 'l-bookshelf', r.width - 800, 0, 800, 300, '#fde68a', '📚'),
    item('Шкаф', 'b-wardrobe', r.width - 1200, r.height - 600, Math.min(1200, r.width * 0.4), 600, '#fef3c7', '👔'),
    item('Тумба', 'b-nightstand', 950, 200, 500, 400, '#fed7aa', '🕯️'),
  ];
}

function bedroomWithDressing(r: RoomDims): PlacedItem[] {
  const bw = Math.min(1800, r.width - 400);
  const bx = (r.width - bw) / 2;
  const dressingW = Math.min(1800, r.width);
  return [
    item('Кровать', 'b-bed-double', bx, r.height - 2100, bw, 2000, '#f9a8d4', '🛏️'),
    item('Тумба', 'b-nightstand', Math.max(0, bx - 500), r.height - 1500, 450, 400, '#fef3c7', '🕯️'),
    item('Тумба', 'b-nightstand', Math.min(r.width - 450, bx + bw + 50), r.height - 1500, 450, 400, '#fef3c7', '🕯️'),
    item('Гардеробный шкаф', 'b-wardrobe2', (r.width - dressingW) / 2, 0, dressingW, 600, '#fde68a', '👔'),
    item('Комод', 'b-dresser', 0, r.height - 1000, 900, 450, '#fed7aa', '🗃️'),
  ];
}

// ── гостиная ─────────────────────────────────────────────────────────────────
function livingTV(r: RoomDims): PlacedItem[] {
  const sw = Math.min(2000, r.width - 400);
  return [
    item('ТВ тумба', 'l-tv', (r.width - 1600) / 2, 0, 1600, 450, '#374151', '📺'),
    item('Диван 3м', 'l-sofa3', (r.width - sw) / 2, r.height - 900, sw, 850, '#c4b5fd', '🛋️'),
    item('Журнальный стол', 'l-coffee', (r.width - 1000) / 2, r.height - 1700, 1000, 600, '#d4d4d4', '⬛'),
    item('Кресло', 'l-armchair', 0, r.height - 1800, 900, 900, '#ede9fe', '💺'),
    item('Кресло', 'l-armchair', r.width - 900, r.height - 1800, 900, 900, '#ede9fe', '💺'),
    item('Шкаф', 'l-wardrobe', 0, 0, 1200, 600, '#fde68a', '🗄️'),
  ];
}

function livingCornerSofa(r: RoomDims): PlacedItem[] {
  return [
    item('Угловой диван', 'l-sofa-corner', 0, r.height - 1700, 2400, 1600, '#a78bfa', '🛋️'),
    item('ТВ тумба', 'l-tv', r.width - 1700, 0, 1600, 450, '#374151', '📺'),
    item('Журнальный стол', 'l-coffee', r.width - 1600, r.height - 1400, 1000, 600, '#d4d4d4', '⬛'),
    item('Стеллаж', 'l-bookshelf', 0, 0, 800, 300, '#d1fae5', '📚'),
  ];
}

function livingCinema(r: RoomDims): PlacedItem[] {
  const sw = Math.min(2400, r.width - 200);
  return [
    item('Экран/ТВ', 'l-tv', (r.width - 2000) / 2, 0, 2000, 400, '#1e293b', '📺'),
    item('Диван широкий', 'l-sofa3', (r.width - sw) / 2, r.height - 950, sw, 900, '#6d28d9', '🛋️'),
    item('Пуф', 'l-coffee', (r.width - 800) / 2, r.height - 1800, 800, 500, '#7c3aed', '⬛'),
    item('Кресло', 'l-armchair', 0, r.height - 1000, 900, 900, '#ede9fe', '💺'),
    item('Кресло', 'l-armchair', r.width - 900, r.height - 1000, 900, 900, '#ede9fe', '💺'),
    item('Стеллаж', 'l-bookshelf', 0, 0, 1000, 300, '#fde68a', '📚'),
  ];
}

function livingOpen(r: RoomDims): PlacedItem[] {
  const sw = Math.min(1800, r.width - 400);
  return [
    item('ТВ тумба', 'l-tv', 0, 0, 1400, 450, '#374151', '📺'),
    item('Диван', 'l-sofa2', (r.width - sw) / 2, r.height - 900, sw, 800, '#c4b5fd', '🛋️'),
    item('Кресло', 'l-armchair', 0, r.height - 1700, 850, 850, '#ede9fe', '💺'),
    item('Журнальный стол', 'l-coffee', (r.width - 800) / 2, r.height - 1600, 800, 500, '#d4d4d4', '⬛'),
    item('Стол обеденный', 'o-desk2', r.width - 1300, 0, 1200, 800, '#fef3c7', '🍽️'),
    item('Стул', 'l-armchair', r.width - 1300, 850, 400, 400, '#e0f2fe', '🪑'),
    item('Стул', 'l-armchair', r.width - 850, 850, 400, 400, '#e0f2fe', '🪑'),
  ];
}

// ── прихожая ─────────────────────────────────────────────────────────────────
function hallwayMin(r: RoomDims): PlacedItem[] {
  return [
    item('Шкаф для одежды', 'b-wardrobe', 0, 0, Math.min(1800, r.width), 600, '#fde68a', '👔'),
    item('Обувница', 'b-nightstand', 0, r.height - 400, Math.min(1000, r.width), 400, '#fef3c7', '👟'),
    item('Зеркало', 'b-dresser', r.width - 600, 0, 500, 200, '#e0f2fe', '🪞'),
  ];
}

function hallwayFull(r: RoomDims): PlacedItem[] {
  return [
    item('Шкаф-купе', 'b-wardrobe2', 0, 0, Math.min(2400, r.width), 650, '#fde68a', '👔'),
    item('Тумба с зеркалом', 'b-dresser', 0, r.height - 500, Math.min(1200, r.width * 0.5), 450, '#fef3c7', '🪞'),
    item('Пуф', 'l-coffee', Math.min(1300, r.width * 0.5), r.height - 500, 500, 400, '#ede9fe', '⬛'),
    item('Обувница', 'b-nightstand', r.width - 800, r.height - 400, 800, 350, '#fed7aa', '👟'),
  ];
}

// ── кабинет ──────────────────────────────────────────────────────────────────
function officeBasic(r: RoomDims): PlacedItem[] {
  return [
    item('Рабочий стол', 'o-desk', 0, 0, Math.min(1600, r.width), 700, '#d1fae5', '💻'),
    item('Кресло офисное', 'l-armchair', (Math.min(1600, r.width) - 700) / 2, 750, 700, 700, '#ede9fe', '🪑'),
    item('Стеллаж', 'l-bookshelf', r.width - 900, 0, 900, 300, '#fde68a', '📚'),
    item('Диван 2м', 'l-sofa2', 0, r.height - 850, Math.min(1800, r.width), 800, '#c4b5fd', '🛋️'),
  ];
}

function officeFull(r: RoomDims): PlacedItem[] {
  return [
    item('Стол угловой', 'o-desk2', 0, 0, Math.min(1800, r.width * 0.65), 700, '#d1fae5', '💻'),
    item('Кресло', 'l-armchair', 0, 750, 700, 700, '#ede9fe', '🪑'),
    item('Тумба', 'b-nightstand', Math.min(1850, r.width * 0.65 + 50), 0, 500, 500, '#fef3c7', '🗃️'),
    item('Шкаф', 'b-wardrobe', r.width - 1200, 0, Math.min(1200, r.width * 0.4), 600, '#fde68a', '📚'),
    item('Переговорный стол', 'o-desk', (r.width - 1400) / 2, r.height - 900, 1400, 800, '#fef9c3', '🍽️'),
    item('Кресло', 'l-armchair', (r.width - 1400) / 2, r.height - 1700, 700, 700, '#ede9fe', '🪑'),
    item('Кресло', 'l-armchair', (r.width + 200) / 2, r.height - 1700, 700, 700, '#ede9fe', '🪑'),
  ];
}

// ── стоимость по типам ────────────────────────────────────────────────────────
export function kitchenCost(items: PlacedItem[]) {
  const baseCount = items.filter(i => i.templateId.startsWith('k-base') || i.templateId === 'k-corner').length;
  const lm = baseCount * 0.6;
  return [
    { label: 'Эконом', min: Math.round(lm * 15000 / 1000) * 1000, max: Math.round(lm * 25000 / 1000) * 1000 },
    { label: 'Средний', min: Math.round(lm * 40000 / 1000) * 1000, max: Math.round(lm * 70000 / 1000) * 1000 },
    { label: 'Премиум', min: Math.round(lm * 90000 / 1000) * 1000, max: Math.round(lm * 160000 / 1000) * 1000 },
  ];
}

export function roomCost(items: PlacedItem[]) {
  const priceMap: Record<string, number> = {
    'b-bed-double': 35000, 'b-bed-single': 18000, 'b-bed-king': 55000,
    'b-wardrobe': 45000, 'b-wardrobe2': 65000, 'b-dresser': 20000,
    'b-nightstand': 8000,
    'l-sofa3': 45000, 'l-sofa2': 30000, 'l-sofa-corner': 75000,
    'l-armchair': 18000, 'l-coffee': 12000, 'l-tv': 20000,
    'l-wardrobe': 40000, 'l-bookshelf': 15000,
    'o-desk': 18000, 'o-desk2': 25000,
  };
  const base = items.reduce((s, i) => s + (priceMap[i.templateId] ?? 8000), 0);
  return [
    { label: 'Эконом', min: Math.round(base * 0.6 / 1000) * 1000, max: Math.round(base * 0.9 / 1000) * 1000 },
    { label: 'Средний', min: Math.round(base / 1000) * 1000, max: Math.round(base * 1.5 / 1000) * 1000 },
    { label: 'Премиум', min: Math.round(base * 2 / 1000) * 1000, max: Math.round(base * 3.5 / 1000) * 1000 },
  ];
}

// ── генератор вариантов ───────────────────────────────────────────────────────
const ROOM_KEYWORDS: Record<string, string[]> = {
  kitchen: ['кухн', 'kitchen', 'кухон'],
  bedroom: ['спальн', 'bedroom', 'комнат', 'детск'],
  living: ['гостин', 'living', 'зал', 'гостевая'],
  bathroom: ['ванн', 'bathroom', 'санузел', 'туалет'],
  hallway: ['прихожая', 'hallway', 'коридор'],
  office: ['кабинет', 'office', 'рабочая'],
};

export function detectRoomType(name: string): string {
  const lower = name.toLowerCase();
  for (const [type, kws] of Object.entries(ROOM_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return type;
  }
  return 'living';
}

export function generateVariants(roomName: string, room: RoomDims): DesignVariant[] {
  const type = detectRoomType(roomName);
  _id = 0;

  const variants: { id: string; name: string; description: string; items: PlacedItem[] }[] = [];

  if (type === 'kitchen') {
    variants.push({ id: 'k-linear', name: 'Линейная', description: 'Весь гарнитур вдоль одной стены. Подходит для узких кухонь.', items: kitchenLinear(room) });
    variants.push({ id: 'k-l', name: 'Г-образная', description: 'Мебель вдоль двух стен. Удобно для среднего размера.', items: kitchenL(room) });
    variants.push({ id: 'k-gallery', name: 'Двухрядная', description: 'Шкафы на двух противоположных стенах. Больше рабочего пространства.', items: kitchenGallery(room) });
    variants.push({ id: 'k-pantry', name: 'Г + пенал', description: 'Г-образная кухня с высоким пеналом для хранения.', items: kitchenCornerPantry(room) });
    if (room.width >= 2800 && room.height >= 2800) {
      variants.push({ id: 'k-u', name: 'П-образная', description: 'Максимум рабочей поверхности. Для просторных кухонь.', items: kitchenU(room) });
    }
    if (room.width >= 3000 && room.height >= 3500) {
      variants.push({ id: 'k-island', name: 'С островом', description: 'Г-образный гарнитур + центральный остров. Самый функциональный вариант.', items: kitchenIsland(room) });
    }
  } else if (type === 'bedroom') {
    variants.push({ id: 'b-classic', name: 'Классическая', description: 'Кровать у стены, шкаф-купе, прикроватные тумбы.', items: bedroomClassic(room) });
    variants.push({ id: 'b-small', name: 'Рабочая зона', description: 'Односпальная кровать + рабочий стол. Для небольших комнат.', items: bedroomSmall(room) });
    variants.push({ id: 'b-luxury', name: 'Люкс', description: 'Кровать 200×200, кресло, большой гардероб.', items: bedroomLuxury(room) });
    variants.push({ id: 'b-kids', name: 'Детская', description: 'Кровать, рабочий стол, стеллаж — для ребёнка или подростка.', items: bedroomKids(room) });
    variants.push({ id: 'b-dressing', name: 'С гардеробной', description: 'Двуспальная кровать + вместительная гардеробная зона.', items: bedroomWithDressing(room) });
  } else if (type === 'living') {
    variants.push({ id: 'l-tv', name: 'Классическая', description: 'Диван напротив ТВ, журнальный стол, кресла.', items: livingTV(room) });
    variants.push({ id: 'l-corner', name: 'Угловой диван', description: 'Угловой диван + ТВ-зона. Максимум места для отдыха.', items: livingCornerSofa(room) });
    variants.push({ id: 'l-cinema', name: 'Домашний кинотеатр', description: 'Широкий экран, мягкие кресла, затемнённая атмосфера.', items: livingCinema(room) });
    variants.push({ id: 'l-open', name: 'Гостиная-столовая', description: 'Диван + обеденная зона — открытая планировка.', items: livingOpen(room) });
  } else if (type === 'hallway') {
    variants.push({ id: 'h-min', name: 'Минимализм', description: 'Шкаф, обувница и зеркало — только необходимое.', items: hallwayMin(room) });
    variants.push({ id: 'h-full', name: 'Полная комплектация', description: 'Шкаф-купе, тумба с зеркалом, пуф и обувница.', items: hallwayFull(room) });
  } else if (type === 'office') {
    variants.push({ id: 'o-basic', name: 'Рабочий кабинет', description: 'Рабочий стол, кресло, стеллаж и небольшой диван.', items: officeBasic(room) });
    variants.push({ id: 'o-full', name: 'Переговорная', description: 'Угловой стол, шкаф и переговорный стол с креслами.', items: officeFull(room) });
  }

  return variants.map(v => ({
    ...v,
    roomType: type,
    costTiers: type === 'kitchen' ? kitchenCost(v.items) : roomCost(v.items),
  }));
}
