export interface FurnitureTemplate {
  id: string;
  name: string;
  category: string;
  w: number; // mm
  h: number; // mm
  color: string;
  icon: string;
  shape?: 'rect' | 'l-shape' | 'circle';
}

export const CATEGORIES = [
  { id: 'kitchen', label: 'Кухня', icon: '🍳' },
  { id: 'living', label: 'Гостиная', icon: '🛋️' },
  { id: 'bedroom', label: 'Спальня', icon: '🛏️' },
  { id: 'bathroom', label: 'Ванная', icon: '🚿' },
  { id: 'hallway', label: 'Прихожая', icon: '🚪' },
  { id: 'office', label: 'Кабинет', icon: '💼' },
  { id: 'dining', label: 'Столовая', icon: '🍽️' },
];

export const FURNITURE: FurnitureTemplate[] = [
  // Кухня
  { id: 'k-base-40', name: 'Нижний шкаф 40', category: 'kitchen', w: 400, h: 600, color: '#fef3c7', icon: '▭' },
  { id: 'k-base-50', name: 'Нижний шкаф 50', category: 'kitchen', w: 500, h: 600, color: '#fef3c7', icon: '▭' },
  { id: 'k-base-60', name: 'Нижний шкаф 60', category: 'kitchen', w: 600, h: 600, color: '#fef3c7', icon: '▭' },
  { id: 'k-base-80', name: 'Нижний шкаф 80', category: 'kitchen', w: 800, h: 600, color: '#fef3c7', icon: '▭' },
  { id: 'k-corner', name: 'Угловой нижний', category: 'kitchen', w: 900, h: 900, color: '#fde68a', icon: '◩' },
  { id: 'k-wall-40', name: 'Верхний шкаф 40', category: 'kitchen', w: 400, h: 300, color: '#e0f2fe', icon: '▭' },
  { id: 'k-wall-60', name: 'Верхний шкаф 60', category: 'kitchen', w: 600, h: 300, color: '#e0f2fe', icon: '▭' },
  { id: 'k-wall-80', name: 'Верхний шкаф 80', category: 'kitchen', w: 800, h: 300, color: '#e0f2fe', icon: '▭' },
  { id: 'k-sink', name: 'Мойка', category: 'kitchen', w: 600, h: 600, color: '#bae6fd', icon: '🚰' },
  { id: 'k-stove', name: 'Плита', category: 'kitchen', w: 600, h: 600, color: '#f1f5f9', icon: '🔥' },
  { id: 'k-fridge', name: 'Холодильник', category: 'kitchen', w: 600, h: 650, color: '#f8fafc', icon: '❄️' },
  { id: 'k-dishwasher', name: 'Посудомойка', category: 'kitchen', w: 600, h: 600, color: '#f0fdf4', icon: '🫧' },
  { id: 'k-island', name: 'Кухонный остров', category: 'kitchen', w: 1200, h: 800, color: '#fef9c3', icon: '⬛' },

  // Гостиная
  { id: 'l-sofa2', name: 'Диван 2-местный', category: 'living', w: 1500, h: 850, color: '#ddd6fe', icon: '🛋️' },
  { id: 'l-sofa3', name: 'Диван 3-местный', category: 'living', w: 2000, h: 850, color: '#c4b5fd', icon: '🛋️' },
  { id: 'l-sofa-corner', name: 'Угловой диван', category: 'living', w: 2400, h: 1600, color: '#a78bfa', icon: '🛋️' },
  { id: 'l-armchair', name: 'Кресло', category: 'living', w: 900, h: 900, color: '#ede9fe', icon: '💺' },
  { id: 'l-coffee', name: 'Журнальный стол', category: 'living', w: 1000, h: 600, color: '#d4d4d4', icon: '⬛' },
  { id: 'l-tv', name: 'ТВ тумба', category: 'living', w: 1600, h: 450, color: '#374151', icon: '📺' },
  { id: 'l-bookshelf', name: 'Стеллаж', category: 'living', w: 800, h: 300, color: '#d1fae5', icon: '📚' },
  { id: 'l-wardrobe', name: 'Шкаф', category: 'living', w: 1200, h: 600, color: '#fde68a', icon: '🗄️' },

  // Спальня
  { id: 'b-bed-single', name: 'Кровать 90×200', category: 'bedroom', w: 900, h: 2000, color: '#fbcfe8', icon: '🛏️' },
  { id: 'b-bed-double', name: 'Кровать 160×200', category: 'bedroom', w: 1600, h: 2000, color: '#f9a8d4', icon: '🛏️' },
  { id: 'b-bed-king', name: 'Кровать 180×200', category: 'bedroom', w: 1800, h: 2000, color: '#ec4899', icon: '🛏️' },
  { id: 'b-wardrobe', name: 'Шкаф-купе 150', category: 'bedroom', w: 1500, h: 600, color: '#fde68a', icon: '👔' },
  { id: 'b-wardrobe2', name: 'Шкаф-купе 200', category: 'bedroom', w: 2000, h: 600, color: '#fbbf24', icon: '👔' },
  { id: 'b-dresser', name: 'Комод', category: 'bedroom', w: 1000, h: 450, color: '#fed7aa', icon: '🗃️' },
  { id: 'b-nightstand', name: 'Тумба прикроватная', category: 'bedroom', w: 500, h: 400, color: '#fef3c7', icon: '🕯️' },
  { id: 'b-desk', name: 'Туалетный столик', category: 'bedroom', w: 1000, h: 450, color: '#fce7f3', icon: '🪞' },

  // Ванная
  { id: 'ba-bath', name: 'Ванна 170×70', category: 'bathroom', w: 1700, h: 700, color: '#bae6fd', icon: '🛁' },
  { id: 'ba-shower', name: 'Душевая кабина', category: 'bathroom', w: 900, h: 900, color: '#e0f2fe', icon: '🚿' },
  { id: 'ba-toilet', name: 'Унитаз', category: 'bathroom', w: 380, h: 600, color: '#f0fdf4', icon: '🚽' },
  { id: 'ba-sink', name: 'Раковина', category: 'bathroom', w: 500, h: 450, color: '#f0fdf4', icon: '🚰' },
  { id: 'ba-vanity', name: 'Тумба с раковиной', category: 'bathroom', w: 800, h: 480, color: '#dcfce7', icon: '🪥' },
  { id: 'ba-washer', name: 'Стиральная машина', category: 'bathroom', w: 600, h: 600, color: '#eff6ff', icon: '🌀' },

  // Прихожая
  { id: 'h-wardrobe', name: 'Шкаф-купе 120', category: 'hallway', w: 1200, h: 600, color: '#fde68a', icon: '🧥' },
  { id: 'h-wardrobe2', name: 'Шкаф-купе 160', category: 'hallway', w: 1600, h: 600, color: '#fbbf24', icon: '🧥' },
  { id: 'h-coat-rack', name: 'Вешалка', category: 'hallway', w: 400, h: 400, color: '#e5e7eb', icon: '🪝' },
  { id: 'h-shoe-bench', name: 'Банкетка с ящиком', category: 'hallway', w: 1000, h: 400, color: '#d1fae5', icon: '👟' },
  { id: 'h-console', name: 'Консольный столик', category: 'hallway', w: 1000, h: 350, color: '#ede9fe', icon: '🖼️' },

  // Кабинет
  { id: 'o-desk', name: 'Рабочий стол 120', category: 'office', w: 1200, h: 600, color: '#d1fae5', icon: '💻' },
  { id: 'o-desk2', name: 'Рабочий стол 160', category: 'office', w: 1600, h: 700, color: '#a7f3d0', icon: '💻' },
  { id: 'o-desk-corner', name: 'Угловой стол', category: 'office', w: 1600, h: 1200, color: '#6ee7b7', icon: '💻' },
  { id: 'o-chair', name: 'Кресло офисное', category: 'office', w: 700, h: 700, color: '#374151', icon: '🪑' },
  { id: 'o-bookcase', name: 'Книжный шкаф', category: 'office', w: 800, h: 300, color: '#fef3c7', icon: '📚' },
  { id: 'o-cabinet', name: 'Шкаф с документами', category: 'office', w: 800, h: 450, color: '#e5e7eb', icon: '🗄️' },

  // Столовая
  { id: 'd-table4', name: 'Стол 4 персоны', category: 'dining', w: 1200, h: 800, color: '#fef3c7', icon: '🍽️' },
  { id: 'd-table6', name: 'Стол 6 персон', category: 'dining', w: 1600, h: 900, color: '#fde68a', icon: '🍽️' },
  { id: 'd-table-round', name: 'Круглый стол', category: 'dining', w: 1000, h: 1000, color: '#fef3c7', icon: '⭕', shape: 'circle' },
  { id: 'd-chair', name: 'Стул', category: 'dining', w: 450, h: 450, color: '#d4d4d4', icon: '🪑' },
  { id: 'd-buffet', name: 'Буфет', category: 'dining', w: 1200, h: 500, color: '#d1fae5', icon: '🗄️' },
];
