import { v4 as uuid } from 'uuid';
import type { Part } from '../../types';
import { FURNITURE_3D_HEIGHTS } from './colorSchemes';

const T = 16; // стандартная толщина ДСП, мм

function panel(name: string, w: number, h: number, qty: number, matId: string): Part {
  return {
    id: uuid(),
    name,
    width: Math.max(10, Math.round(w)),
    height: Math.max(10, Math.round(h)),
    quantity: qty,
    materialId: matId,
    canRotate: true,
    edgeBanding: { top: false, bottom: false, left: false, right: false },
  };
}

export interface FurnitureItem {
  templateId: string;
  name: string;
  w: number; // ширина по плану (мм)
  h: number; // глубина по плану (мм)
}

export function generateFurnitureParts(items: FurnitureItem[], materialId: string): Part[] {
  const parts: Part[] = [];

  for (const item of items) {
    const heights = FURNITURE_3D_HEIGHTS[item.templateId];
    const H = heights?.h ?? 800;
    const D = item.h;  // глубина (спереди назад)
    const W = item.w;  // ширина
    const IW = Math.max(T, W - 2 * T); // внутренняя ширина
    const ID = Math.max(T, D - T);     // внутренняя глубина
    const p = item.name;

    if (item.templateId.startsWith('k-wall')) {
      // Навесной кухонный шкаф
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Низ`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Фасад`, W, H, 1, materialId));

    } else if (item.templateId.startsWith('k-base') || item.templateId === 'k-sink' || item.templateId === 'k-dishwasher') {
      // Нижний кухонный шкаф
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Дно`, IW, ID, 1, materialId));
      parts.push(panel(`${p} — Стяжка пер.`, IW, 96, 1, materialId));
      parts.push(panel(`${p} — Стяжка зад.`, IW, 96, 1, materialId));
      parts.push(panel(`${p} — Фасад`, W, H - 50, 1, materialId));

    } else if (item.templateId === 'k-corner') {
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Дно`, IW, ID, 1, materialId));
      parts.push(panel(`${p} — Полка`, IW, ID, 1, materialId));

    } else if (item.templateId === 'k-island') {
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Дно`, IW, ID, 1, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Разделитель`, H - 2 * T, ID, 2, materialId));

    } else if (item.templateId.includes('wardrobe') || item.templateId.includes('bookshelf') || item.templateId.includes('bookcase')) {
      // Шкаф / стеллаж
      const shelves = Math.max(1, Math.floor(H / 350) - 1);
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Дно`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Полка`, IW, D - T, shelves, materialId));

    } else if (item.templateId.includes('dresser') || item.templateId.includes('nightstand') || item.templateId.includes('buffet') || item.templateId.includes('cabinet')) {
      // Комод / тумба / буфет
      const drawers = Math.max(1, Math.floor(H / 180));
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Дно`, IW, D, 1, materialId));
      if (drawers > 1) parts.push(panel(`${p} — Перегородка`, IW, D - 50, drawers - 1, materialId));

    } else if (item.templateId.includes('desk') || item.templateId.startsWith('d-table') || item.templateId === 'k-stove') {
      // Стол / столешница
      parts.push(panel(`${p} — Столешница`, W, D, 1, materialId));
      parts.push(panel(`${p} — Царга фронт`, IW, 75, 1, materialId));
      parts.push(panel(`${p} — Царга задн.`, IW, 75, 1, materialId));
      parts.push(panel(`${p} — Царга бок.`, ID, 75, 2, materialId));

    } else if (item.templateId === 'l-tv') {
      // ТВ-тумба
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Дно`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Полка`, IW, D - T, 1, materialId));

    } else if (item.templateId === 'h-console') {
      parts.push(panel(`${p} — Боковина`, D, H, 2, materialId));
      parts.push(panel(`${p} — Верх`, IW, D, 1, materialId));
      parts.push(panel(`${p} — Дно`, IW, D, 1, materialId));
    }
    // Диваны, кресла, кровати, сантехника — не содержат ДСП-деталей, пропускаем
  }

  return parts;
}
