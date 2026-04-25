import { useMemo, useState } from 'react';
import { generateVariants } from './designTemplates';
import type { DesignVariant, PlacedItem } from './designTemplates';

interface Room { width: number; height: number; wallColor: string; floorColor: string; ceilingColor: string; }

interface Props {
  room: Room;
  projectName: string;
  onApply: (items: PlacedItem[]) => void;
  onClose: () => void;
}

const SCALE = 0.06;
const PAD = 8;

function MiniPreview({ variant, room }: { variant: DesignVariant; room: Room }) {
  const W = room.width * SCALE;
  const H = room.height * SCALE;
  return (
    <svg width={W + PAD * 2} height={H + PAD * 2} className="rounded border bg-white">
      {/* Пол */}
      <rect x={PAD} y={PAD} width={W} height={H} fill={room.floorColor} />
      {/* Сетка */}
      {Array.from({ length: Math.floor(room.width / 500) }).map((_, i) => (
        <line key={`gx${i}`} x1={PAD + (i + 1) * 500 * SCALE} y1={PAD} x2={PAD + (i + 1) * 500 * SCALE} y2={PAD + H} stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      {Array.from({ length: Math.floor(room.height / 500) }).map((_, i) => (
        <line key={`gy${i}`} x1={PAD} y1={PAD + (i + 1) * 500 * SCALE} x2={PAD + W} y2={PAD + (i + 1) * 500 * SCALE} stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      {/* Стены */}
      <rect x={PAD} y={PAD} width={W} height={H} fill="none" stroke={room.wallColor} strokeWidth="6" />
      {/* Мебель */}
      {variant.items.map(it => (
        <g key={it.id}>
          <rect
            x={PAD + it.x * SCALE} y={PAD + it.y * SCALE}
            width={it.w * SCALE} height={it.h * SCALE}
            rx="1"
            fill={it.color} stroke="#9ca3af" strokeWidth="0.7"
          />
          {it.w * SCALE > 18 && it.h * SCALE > 12 && (
            <text
              x={PAD + it.x * SCALE + it.w * SCALE / 2}
              y={PAD + it.y * SCALE + it.h * SCALE / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(7, it.w * SCALE / 6)} fill="#374151"
            >
              {it.name.split(' ')[0]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

const TIER_STYLES: Record<string, string> = {
  'Эконом': 'bg-green-50 text-green-700 border-green-200',
  'Средний': 'bg-blue-50 text-blue-700 border-blue-200',
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

  const selectedVariant = variants.find(v => v.id === selected);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">✨ Варианты дизайна</h2>
            <p className="text-xs text-gray-400 mt-0.5">«{projectName}» · {(room.width / 1000).toFixed(1)} × {(room.height / 1000).toFixed(1)} м</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Список вариантов */}
          <div className="w-56 flex-shrink-0 border-r overflow-y-auto">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`w-full text-left p-3 border-b transition-colors ${selected === v.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-sm text-gray-800">{v.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{v.description}</div>
              </button>
            ))}
          </div>

          {/* Детали варианта */}
          {selectedVariant && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Превью */}
              <div className="flex justify-center">
                <MiniPreview variant={selectedVariant} room={room} />
              </div>

              {/* Состав */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Состав ({selectedVariant.items.length} предметов)</h4>
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
                    const key = `${selectedVariant.id}`;
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
          )}
        </div>
      </div>
    </div>
  );
}
