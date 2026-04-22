export interface ColorScheme {
  id: string;
  name: string;
  description: string;
  preview: string[];
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  facadeColor: string;
  accentColor: string;
  facadeStyle: FacadeStyle;
}

export type FacadeStyle = 'matte' | 'gloss' | 'acrylic' | 'wood' | 'frame' | 'glass';

export interface FacadeOption {
  id: FacadeStyle;
  name: string;
  description: string;
  roughness: number;
  metalness: number;
  icon: string;
}

export const FACADE_OPTIONS: FacadeOption[] = [
  { id: 'matte',   name: 'Матовая эмаль',    description: 'Нет бликов, практична, скрывает отпечатки', roughness: 0.95, metalness: 0, icon: '🎨' },
  { id: 'gloss',   name: 'Глянцевая эмаль',  description: 'Яркий блеск, визуально расширяет пространство', roughness: 0.05, metalness: 0.1, icon: '✨' },
  { id: 'acrylic', name: 'Акрил',             description: 'Суперглянец, насыщенный цвет, премиум', roughness: 0.02, metalness: 0.15, icon: '💎' },
  { id: 'wood',    name: 'Плёнка под дерево', description: 'Тепло и натуральность, бюджетный вариант', roughness: 0.8, metalness: 0, icon: '🪵' },
  { id: 'frame',   name: 'Рамочный фасад',    description: 'Классика, МДФ рамка + вставка, вечный стиль', roughness: 0.85, metalness: 0, icon: '🖼️' },
  { id: 'glass',   name: 'Стекло матовое',    description: 'Лёгкость и воздух, для верхних шкафов', roughness: 0.1, metalness: 0.05, icon: '🪟' },
];

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'scandinavian',
    name: 'Скандинавский',
    description: 'Белые фасады, светлое дерево, серые акценты — вечная классика',
    preview: ['#ffffff', '#d4b896', '#e8e8e8', '#f0ede8'],
    wallColor: '#f5f2ee',
    floorColor: '#d4b896',
    ceilingColor: '#ffffff',
    facadeColor: '#ffffff',
    accentColor: '#9ca3af',
    facadeStyle: 'matte',
  },
  {
    id: 'modern-dark',
    name: 'Современный тёмный',
    description: 'Тёмно-серые фасады, белые стены, чёрные детали — стильно и дорого',
    preview: ['#374151', '#4b5563', '#ffffff', '#1f2937'],
    wallColor: '#f8f8f8',
    floorColor: '#6b5a4e',
    ceilingColor: '#ffffff',
    facadeColor: '#374151',
    accentColor: '#111827',
    facadeStyle: 'matte',
  },
  {
    id: 'warm-classic',
    name: 'Тёплая классика',
    description: 'Бежевые фасады, тёплые стены, кофейные детали — уютно и timeless',
    preview: ['#e8d5b8', '#c8a97e', '#f5e6d0', '#8b6340'],
    wallColor: '#f0e8d8',
    floorColor: '#8b6340',
    ceilingColor: '#faf7f2',
    facadeColor: '#e8d5b8',
    accentColor: '#8b6340',
    facadeStyle: 'frame',
  },
  {
    id: 'dark-luxury',
    name: 'Тёмный люкс',
    description: 'Чёрный глянец, мраморный пол, золотые ручки — максимально дорого',
    preview: ['#1a1a1a', '#2d2d2d', '#ffffff', '#d4af37'],
    wallColor: '#f0f0f0',
    floorColor: '#2d2d2d',
    ceilingColor: '#ffffff',
    facadeColor: '#1a1a1a',
    accentColor: '#d4af37',
    facadeStyle: 'gloss',
  },
  {
    id: 'coastal',
    name: 'Морской бриз',
    description: 'Синие фасады, белые стены, светлое дерево — свежо и современно',
    preview: ['#1e40af', '#93c5fd', '#ffffff', '#d4b896'],
    wallColor: '#f0f6ff',
    floorColor: '#d4b896',
    ceilingColor: '#ffffff',
    facadeColor: '#1e40af',
    accentColor: '#93c5fd',
    facadeStyle: 'matte',
  },
  {
    id: 'botanical',
    name: 'Ботанический',
    description: 'Оливковые фасады, кремовые стены, латунные акценты — природа и уют',
    preview: ['#4a7c59', '#86a879', '#f5f0e8', '#c8a96e'],
    wallColor: '#f5f0e8',
    floorColor: '#c8a96e',
    ceilingColor: '#faf8f4',
    facadeColor: '#4a7c59',
    accentColor: '#c8a96e',
    facadeStyle: 'matte',
  },
  {
    id: 'soft-rose',
    name: 'Нежная пудра',
    description: 'Пудрово-розовые фасады, светло-серые стены, белый — нежно и женственно',
    preview: ['#e8b4b8', '#f5dde0', '#f0f0f0', '#9e7b8a'],
    wallColor: '#f0eeee',
    floorColor: '#c8b4b8',
    ceilingColor: '#ffffff',
    facadeColor: '#e8b4b8',
    accentColor: '#9e7b8a',
    facadeStyle: 'matte',
  },
  {
    id: 'industrial',
    name: 'Индустриальный',
    description: 'Серый бетон, металл, тёмное дерево — лофт и брутальность',
    preview: ['#6b7280', '#374151', '#4b5563', '#78716c'],
    wallColor: '#e5e7eb',
    floorColor: '#4b5563',
    ceilingColor: '#d1d5db',
    facadeColor: '#6b7280',
    accentColor: '#1f2937',
    facadeStyle: 'matte',
  },
];

// Высоты мебели в 3D (мм)
export const FURNITURE_3D_HEIGHTS: Record<string, { h: number; mountedAt?: number }> = {
  // Кухня нижние
  'k-base-40': { h: 850 }, 'k-base-50': { h: 850 }, 'k-base-60': { h: 850 }, 'k-base-80': { h: 850 },
  'k-corner': { h: 850 }, 'k-sink': { h: 850 }, 'k-stove': { h: 850 }, 'k-dishwasher': { h: 850 },
  // Кухня верхние
  'k-wall-40': { h: 720, mountedAt: 1380 }, 'k-wall-60': { h: 720, mountedAt: 1380 }, 'k-wall-80': { h: 720, mountedAt: 1380 },
  // Крупная кухня
  'k-fridge': { h: 2000 }, 'k-island': { h: 900 },
  // Гостиная
  'l-sofa2': { h: 750 }, 'l-sofa3': { h: 750 }, 'l-sofa-corner': { h: 750 },
  'l-armchair': { h: 850 }, 'l-coffee': { h: 420 }, 'l-tv': { h: 500 },
  'l-bookshelf': { h: 2000 }, 'l-wardrobe': { h: 2100 },
  // Спальня
  'b-bed-single': { h: 550 }, 'b-bed-double': { h: 550 }, 'b-bed-king': { h: 550 },
  'b-wardrobe': { h: 2200 }, 'b-wardrobe2': { h: 2200 },
  'b-dresser': { h: 800 }, 'b-nightstand': { h: 600 }, 'b-desk': { h: 750 },
  // Ванная
  'ba-bath': { h: 600 }, 'ba-shower': { h: 2100 }, 'ba-toilet': { h: 780 },
  'ba-sink': { h: 850 }, 'ba-vanity': { h: 850 }, 'ba-washer': { h: 850 },
  // Прихожая
  'h-wardrobe': { h: 2200 }, 'h-wardrobe2': { h: 2200 },
  'h-coat-rack': { h: 1800 }, 'h-shoe-bench': { h: 500 }, 'h-console': { h: 850 },
  // Кабинет
  'o-desk': { h: 750 }, 'o-desk2': { h: 750 }, 'o-desk-corner': { h: 750 },
  'o-chair': { h: 1100 }, 'o-bookcase': { h: 2000 }, 'o-cabinet': { h: 1500 },
  // Столовая
  'd-table4': { h: 750 }, 'd-table6': { h: 750 }, 'd-table-round': { h: 750 },
  'd-chair': { h: 900 }, 'd-buffet': { h: 900 },
};
