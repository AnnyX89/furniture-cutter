import { lazy, Suspense, useMemo, useState } from 'react';
import { generateVariants } from './designTemplates';
import type { DesignVariant, PlacedItem } from './designTemplates';

const Room3D = lazy(() => import('./Room3D'));

interface Room { width: number; height: number; wallColor: string; floorColor: string; ceilingColor: string; }

interface Props {
  room: Room;
  projectName: string;
  onApply: (items: PlacedItem[]) => void;
  onClose: () => void;
}

const TIER_STYLES: Record<string, string> = {
  'Эконом':  'bg-green-50  text-green-700  border-green-200',
  'Средний': 'bg-blue-50   text-blue-700   border-blue-200',
  'Премиум': 'bg-purple-50 text-purple-700 border-purple-200',
};

function fmt(n: number) { return n.toLocaleString('ru-RU'); }

export default function DesignSuggestionsModal({ room, projectName, onApply, onClose }: Props) {
  const variants = useMemo(() => generateVariants(projectName, room), [projectName, room]);
  const [selected, setSelected] = useState<string | null>(variants[0]?.id ?? null);
  const [activeTier, setActiveTier] = useState<Record<string, string>>({});

  if (variants.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-3">🤔</div>
          <h3 className="font-bold text-lg mb-2">Тип комнаты не определён</h3>
          <p className="text-gray-500 text-sm mb-4">Назовите проект «Кухня», «Спальня», «Гостиная» — и я предложу варианты.</p>
          <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Закрыть</button>
        </div>
      </div>
    );
  }

  const selectedVariant = variants.find(v => v.id === selected) as DesignVariant;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">✨ Варианты дизайна</h2>
            <p className="text-xs text-gray-400 mt-0.5">«{projectName}» · {(room.width/1000).toFixed(1)} × {(room.height/1000).toFixed(1)} м</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Список вариантов */}
          <div className="w-48 flex-shrink-0 border-r overflow-y-auto bg-gray-50">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`w-full text-left p-3 border-b transition-colors ${
                  selected === v.id
                    ? 'bg-white border-l-2 border-l-blue-600 shadow-sm'
                    : 'hover:bg-white'
                }`}
              >
                <div className="font-medium text-sm text-gray-800">{v.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{v.description}</div>
              </button>
            ))}
          </div>

          {/* Детали варианта */}
          {selectedVariant && (
            <div className="flex-1 overflow-y-auto flex flex-col">

              {/* 3D-превью комнаты */}
              <div className="h-72 bg-gray-900 relative flex-shrink-0">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full text-white text-sm">
                    <div className="text-center">
                      <div className="text-3xl mb-2 animate-pulse">🧊</div>
                      <div className="text-gray-300">Загрузка 3D-вида...</div>
                    </div>
                  </div>
                }>
                  <Room3D
                    room={room}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items={selectedVariant.items as any}
                  />
                </Suspense>
                <div className="absolute bottom-2 left-3 text-xs text-gray-400 pointer-events-none">
                  🖱️ Вращайте мышью чтобы осмотреть
                </div>
              </div>

              {/* Детали */}
              <div className="p-5 space-y-4">

                {/* Состав */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Состав ({selectedVariant.items.length} предметов)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVariant.items.map(it => (
                      <span key={it.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Стоимость */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Примерная стоимость</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedVariant.costTiers.map(tier => {
                      const key = selectedVariant.id;
                      const isActive = (activeTier[key] ?? selectedVariant.costTiers[1]?.label) === tier.label;
                      return (
                        <button
                          key={tier.label}
                          onClick={() => setActiveTier(prev => ({ ...prev, [key]: tier.label }))}
                          className={`border rounded-xl p-3 text-left transition-all ${TIER_STYLES[tier.label] ?? 'bg-gray-50 text-gray-700 border-gray-200'} ${isActive ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
                        >
                          <div className="text-xs font-bold uppercase tracking-wide mb-1">{tier.label}</div>
                          <div className="text-sm font-bold">{fmt(tier.min)} ₽</div>
                          <div className="text-xs opacity-70">до {fmt(tier.max)} ₽</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">* Ориентировочная стоимость мебели. Не включает доставку и монтаж.</p>
                </div>

                {/* Кнопка */}
                <button
                  onClick={() => { onApply(selectedVariant.items); onClose(); }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  ✅ Применить этот вариант → в дизайнер
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
