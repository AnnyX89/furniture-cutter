import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Project, EdgeBandingMaterial, HardwareItem } from '../types';
import { v4 as uuid } from 'uuid';

interface Props {
  project: Project;
  onChange: (p: Project) => void;
}

const HARDWARE_CATEGORIES = ['Ручки', 'Петли', 'Направляющие', 'Лифты / подъёмники', 'Уголки и стяжки', 'Ножки', 'Замки', 'Другое'];
const EDGE_WIDTHS = [19, 22, 44];
const UNITS = ['шт', 'пара', 'компл.', 'м', 'уп'];

// ── каталог популярной фурнитуры ──────────────────────────────────────────────
interface CatalogItem {
  name: string;
  category: string;
  unit: string;
  tiers: { label: string; price: number; brand: string; where: string; url?: string }[];
}

const HARDWARE_CATALOG: CatalogItem[] = [
  {
    name: 'Ручка-скоба 128 мм',
    category: 'Ручки',
    unit: 'шт',
    tiers: [
      { label: 'Эконом', price: 40, brand: 'Нет бренда (Китай)', where: 'Леруа Мерлен, Petropavlovsk', url: 'https://leroymerlin.ru' },
      { label: 'Средний', price: 150, brand: 'Boyard / GTV', where: 'ОБИ, Leroymerlin, Мегастрой', url: 'https://leroymerlin.ru' },
      { label: 'Премиум', price: 600, brand: 'Hafele / Hettich', where: 'Hafele.ru, Leroy Merlin', url: 'https://hafele.ru' },
    ],
  },
  {
    name: 'Петля накладная Blum',
    category: 'Петли',
    unit: 'шт',
    tiers: [
      { label: 'Эконом', price: 35, brand: 'Нет бренда', where: 'Стройматериалы, Авито' },
      { label: 'Средний', price: 120, brand: 'GTV / Boyard', where: 'ОБИ, Петрович, Мегастрой' },
      { label: 'Премиум', price: 350, brand: 'Blum Clip Top', where: 'blum.com/ru, Hafele.ru', url: 'https://www.blum.com/ru' },
    ],
  },
  {
    name: 'Направляющие роликовые 400 мм',
    category: 'Направляющие',
    unit: 'пара',
    tiers: [
      { label: 'Эконом', price: 120, brand: 'Нет бренда', where: 'Леруа Мерлен, Авито' },
      { label: 'Средний', price: 350, brand: 'GTV / Boyard с доводчиком', where: 'ОБИ, Мегастрой' },
      { label: 'Премиум', price: 1800, brand: 'Blum Tandem 560H', where: 'blum.com/ru, Hafele.ru', url: 'https://www.blum.com/ru' },
    ],
  },
  {
    name: 'Лифт подъёмный Aventos',
    category: 'Лифты / подъёмники',
    unit: 'компл.',
    tiers: [
      { label: 'Эконом', price: 800, brand: 'GTV / Boyard', where: 'Мегастрой, ОБИ' },
      { label: 'Средний', price: 2500, brand: 'Hafele Free flap', where: 'Hafele.ru', url: 'https://hafele.ru' },
      { label: 'Премиум', price: 5500, brand: 'Blum Aventos HK-S', where: 'blum.com/ru', url: 'https://www.blum.com/ru' },
    ],
  },
  {
    name: 'Ножка регулируемая 100 мм',
    category: 'Ножки',
    unit: 'шт',
    tiers: [
      { label: 'Эконом', price: 25, brand: 'Нет бренда', where: 'Леруа Мерлен' },
      { label: 'Средний', price: 80, brand: 'GTV / Boyard', where: 'ОБИ, Мегастрой' },
      { label: 'Премиум', price: 220, brand: 'Hettich / Hafele', where: 'Hafele.ru', url: 'https://hafele.ru' },
    ],
  },
  {
    name: 'Стяжка эксцентриковая',
    category: 'Уголки и стяжки',
    unit: 'шт',
    tiers: [
      { label: 'Эконом', price: 8, brand: 'Нет бренда', where: 'Леруа Мерлен, Петрович' },
      { label: 'Средний', price: 25, brand: 'Boyard / GTV', where: 'ОБИ, Мегастрой' },
      { label: 'Премиум', price: 65, brand: 'Hettich / Hafele', where: 'Hafele.ru', url: 'https://hafele.ru' },
    ],
  },
];

// ── мини-пикер цвета ─────────────────────────────────────────────────────────
function InlineColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(color);
  useEffect(() => setHex(color), [color]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors flex-shrink-0"
        style={{ background: color }}
        title="Выбрать цвет"
      />
      {open && (
        <div
          className="absolute z-50 top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border p-3 w-52"
          onMouseDown={e => e.stopPropagation()}
        >
          <HexColorPicker color={color} onChange={c => { setHex(c); onChange(c); }} />
          <input
            className="mt-2 w-full border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={hex}
            onChange={e => { setHex(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value); }}
            onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
            maxLength={7}
          />
          <button
            className="mt-1 w-full text-xs text-gray-400 hover:text-gray-600"
            onClick={() => setOpen(false)}
          >закрыть</button>
        </div>
      )}
    </div>
  );
}

// ── кромка ────────────────────────────────────────────────────────────────────
function EdgeBandingSection({ project, onChange }: Props) {
  const items = project.edgeBandingMaterials ?? [];
  const _matMap = new Map(project.materials.map(m => [m.id, m])); void _matMap;

  // Автосчёт метров по деталям
  const metersUsed = new Map<string, number>();
  items.forEach(eb => metersUsed.set(eb.id, 0));
  // Если кромка одна — считаем по всем деталям с кантом
  if (items.length === 1) {
    let total = 0;
    project.parts.forEach(p => {
      const e = p.edgeBanding;
      const mm = (e.top ? p.width : 0) + (e.bottom ? p.width : 0) + (e.left ? p.height : 0) + (e.right ? p.height : 0);
      total += mm * p.quantity;
    });
    metersUsed.set(items[0].id, Math.ceil(total / 1000));
  }

  function add() {
    const eb: EdgeBandingMaterial = { id: uuid(), name: 'Кромка', color: '#c8a97e', width: 22, pricePerMeter: 15 };
    onChange({ ...project, edgeBandingMaterials: [...items, eb], updatedAt: new Date().toISOString() });
  }

  function update(id: string, changes: Partial<EdgeBandingMaterial>) {
    onChange({
      ...project,
      edgeBandingMaterials: items.map(e => e.id === id ? { ...e, ...changes } : e),
      updatedAt: new Date().toISOString(),
    });
  }

  function remove(id: string) {
    onChange({ ...project, edgeBandingMaterials: items.filter(e => e.id !== id), updatedAt: new Date().toISOString() });
  }

  const totalCost = items.reduce((s, e) => s + (metersUsed.get(e.id) ?? 0) * e.pricePerMeter, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Кромка / кант</h3>
          <p className="text-xs text-gray-400 mt-0.5">АБС, ПВХ, меламин — по материалам проекта</p>
        </div>
        <button onClick={add} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">
          + Добавить
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          <div className="text-2xl mb-2">🎀</div>
          Нет кромки. Нажмите «+ Добавить»
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(eb => {
            const meters = metersUsed.get(eb.id) ?? 0;
            const cost = meters * eb.pricePerMeter;
            return (
              <div key={eb.id} className="border rounded-xl p-3 bg-white">
                <div className="flex items-start gap-3">
                  <InlineColorPicker color={eb.color} onChange={c => update(eb.id, { color: c })} />
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs text-gray-400">Название</label>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm mt-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={eb.name}
                        onChange={e => update(eb.id, { name: e.target.value })}
                        onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Ширина мм</label>
                      <select
                        className="w-full border rounded px-2 py-1 text-sm mt-0.5 bg-white"
                        value={eb.width}
                        onChange={e => update(eb.id, { width: +e.target.value })}
                      >
                        {EDGE_WIDTHS.map(w => <option key={w} value={w}>{w} мм</option>)}
                        <option value={0}>Другая</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Цена ₽/м</label>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-sm mt-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={eb.pricePerMeter}
                        onChange={e => update(eb.id, { pricePerMeter: +e.target.value || 0 })}
                        onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Плита (цвет)</label>
                      <select
                        className="w-full border rounded px-2 py-1 text-sm mt-0.5 bg-white"
                        value={eb.materialId ?? ''}
                        onChange={e => update(eb.id, { materialId: e.target.value || undefined })}
                      >
                        <option value="">— не привязана —</option>
                        {project.materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => remove(eb.id)} className="text-red-400 hover:text-red-600 text-lg leading-none mt-1">✕</button>
                </div>
                {meters > 0 && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
                    <span>📏 По деталям: <b>{meters} м</b></span>
                    <span>💰 Стоимость: <b>{cost.toLocaleString('ru-RU')} ₽</b></span>
                  </div>
                )}
              </div>
            );
          })}
          {totalCost > 0 && (
            <div className="text-right text-sm font-semibold text-gray-700 pr-1">
              Итого кромка: {totalCost.toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── фурнитура ─────────────────────────────────────────────────────────────────
function HardwareSection({ project, onChange }: Props) {
  const items = project.hardware ?? [];
  const [activeCategory, setActiveCategory] = useState<string>('all');

  function add() {
    const item: HardwareItem = { id: uuid(), name: '', category: 'Ручки', quantity: 1, pricePerUnit: 0, unit: 'шт', notes: '' };
    onChange({ ...project, hardware: [...items, item], updatedAt: new Date().toISOString() });
  }

  function update(id: string, changes: Partial<HardwareItem>) {
    onChange({ ...project, hardware: items.map(h => h.id === id ? { ...h, ...changes } : h), updatedAt: new Date().toISOString() });
  }

  function remove(id: string) {
    onChange({ ...project, hardware: items.filter(h => h.id !== id), updatedAt: new Date().toISOString() });
  }

  const categories = ['all', ...HARDWARE_CATEGORIES.filter(c => items.some(h => h.category === c))];
  const visible = activeCategory === 'all' ? items : items.filter(h => h.category === activeCategory);
  const totalCost = items.reduce((s, h) => s + h.quantity * h.pricePerUnit, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Фурнитура</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ручки, петли, направляющие и прочее</p>
        </div>
        <button onClick={add} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">
          + Добавить
        </button>
      </div>

      {items.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${activeCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {c === 'all' ? 'Все' : c}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          <div className="text-2xl mb-2">🔩</div>
          Нет позиций. Нажмите «+ Добавить»
        </div>
      ) : (
        <>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">Наименование</th>
                  <th className="text-left px-3 py-2 hidden sm:table-cell">Категория</th>
                  <th className="text-center px-3 py-2 w-20">Кол-во</th>
                  <th className="text-left px-3 py-2 w-16 hidden sm:table-cell">Ед.</th>
                  <th className="text-right px-3 py-2 w-24">Цена ₽</th>
                  <th className="text-right px-3 py-2 w-24 hidden sm:table-cell">Сумма</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {visible.map((h, i) => (
                  <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <input
                          className="w-full border-b border-transparent hover:border-gray-200 focus:border-blue-400 bg-transparent text-sm focus:outline-none"
                          value={h.name}
                          placeholder="Название"
                          onChange={e => update(h.id, { name: e.target.value })}
                        />
                        {h.notes && <span className="text-xs text-gray-400">{h.notes}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 hidden sm:table-cell">
                      <select
                        className="border rounded px-1.5 py-0.5 text-xs bg-white"
                        value={h.category}
                        onChange={e => update(h.id, { category: e.target.value })}
                      >
                        {HARDWARE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <input
                        type="number" min="1"
                        className="w-16 border rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={h.quantity}
                        onChange={e => update(h.id, { quantity: +e.target.value || 1 })}
                        onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                      />
                    </td>
                    <td className="px-3 py-1.5 hidden sm:table-cell">
                      <select
                        className="border rounded px-1.5 py-0.5 text-xs bg-white"
                        value={h.unit}
                        onChange={e => update(h.id, { unit: e.target.value })}
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <input
                        type="number" min="0"
                        className="w-20 border rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={h.pricePerUnit}
                        onChange={e => update(h.id, { pricePerUnit: +e.target.value || 0 })}
                        onFocus={e => { const t = e.target; setTimeout(() => t.select(), 0); }}
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right hidden sm:table-cell text-gray-600 font-medium text-xs">
                      {(h.quantity * h.pricePerUnit).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => remove(h.id)} className="text-red-400 hover:text-red-600">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-2 text-sm font-semibold text-gray-700 pr-1">
            Итого фурнитура: {totalCost.toLocaleString('ru-RU')} ₽
          </div>
        </>
      )}
    </section>
  );
}

// ── каталог с ценами ─────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  'Эконом': 'bg-green-50 border-green-200 text-green-800',
  'Средний': 'bg-blue-50 border-blue-200 text-blue-800',
  'Премиум': 'bg-purple-50 border-purple-200 text-purple-800',
};

function CatalogSection({ onAdd }: { onAdd: (item: Omit<HardwareItem, 'id'>) => void }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const categories = ['all', ...new Set(HARDWARE_CATALOG.map(c => c.category))];
  const visible = activeCategory === 'all' ? HARDWARE_CATALOG : HARDWARE_CATALOG.filter(c => c.category === activeCategory);

  return (
    <section>
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800">Каталог фурнитуры</h3>
        <p className="text-xs text-gray-400 mt-0.5">Популярные позиции от эконом до премиум — нажмите чтобы добавить в проект</p>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${activeCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {c === 'all' ? 'Все' : c}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map(item => (
          <div key={item.name} className="border rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 text-left"
              onClick={() => setExpanded(expanded === item.name ? null : item.name)}
            >
              <div>
                <span className="font-medium text-sm text-gray-800">{item.name}</span>
                <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
              </div>
              <span className="text-gray-400 text-xs">{expanded === item.name ? '▲' : '▼'}</span>
            </button>
            {expanded === item.name && (
              <div className="border-t bg-gray-50 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {item.tiers.map(tier => (
                  <div key={tier.label} className={`border rounded-lg p-3 ${TIER_COLORS[tier.label] ?? 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide">{tier.label}</span>
                      <span className="text-sm font-bold">{tier.price} ₽/{item.unit}</span>
                    </div>
                    <div className="text-xs font-medium mb-0.5">{tier.brand}</div>
                    <div className="text-xs opacity-75 mb-2">
                      {tier.url
                        ? <a href={tier.url} target="_blank" rel="noreferrer" className="underline hover:opacity-100">{tier.where}</a>
                        : tier.where}
                    </div>
                    <button
                      onClick={() => onAdd({ name: `${item.name} (${tier.label})`, category: item.category, quantity: 1, pricePerUnit: tier.price, unit: item.unit, notes: tier.brand })}
                      className="w-full text-xs py-1 rounded bg-white/60 hover:bg-white border border-current font-medium transition-colors"
                    >
                      + В проект
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── главный компонент ─────────────────────────────────────────────────────────
export default function HardwareTab({ project, onChange }: Props) {
  const edgeCost = (project.edgeBandingMaterials ?? []).reduce((s, e) => {
    let meters = 0;
    if ((project.edgeBandingMaterials?.length ?? 0) === 1) {
      project.parts.forEach(p => {
        const eb = p.edgeBanding;
        const mm = (eb.top ? p.width : 0) + (eb.bottom ? p.width : 0) + (eb.left ? p.height : 0) + (eb.right ? p.height : 0);
        meters += Math.ceil(mm * p.quantity / 1000);
      });
    }
    return s + meters * e.pricePerMeter;
  }, 0);

  const hwCost = (project.hardware ?? []).reduce((s, h) => s + h.quantity * h.pricePerUnit, 0);
  const total = edgeCost + hwCost;

  function addFromCatalog(item: Omit<HardwareItem, 'id'>) {
    const hw = project.hardware ?? [];
    onChange({ ...project, hardware: [...hw, { ...item, id: uuid() }], updatedAt: new Date().toISOString() });
  }

  return (
    <div className="space-y-8">
      <EdgeBandingSection project={project} onChange={onChange} />
      <hr />
      <HardwareSection project={project} onChange={onChange} />
      <hr />
      <CatalogSection onAdd={addFromCatalog} />

      {total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">💰 Итого (кромка + фурнитура)</span>
          <span className="text-lg font-bold text-blue-900">{total.toLocaleString('ru-RU')} ₽</span>
        </div>
      )}
    </div>
  );
}
