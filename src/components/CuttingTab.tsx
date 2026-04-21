import { useState } from 'react';
import type { Project, CuttingResult, CutSheet } from '../types';
import { optimize } from '../utils/optimizer';

interface Props {
  project: Project;
}

const SCALE = 0.18;

function SheetSVG({ sheet }: { sheet: CutSheet }) {
  const W = sheet.sheetWidth * SCALE;
  const H = sheet.sheetHeight * SCALE;
  const colors = ['#bfdbfe', '#bbf7d0', '#fde68a', '#ddd6fe', '#fbcfe8', '#fed7aa', '#a7f3d0', '#e9d5ff'];

  const partColors = new Map<string, string>();
  let ci = 0;
  for (const p of sheet.pieces) {
    if (!partColors.has(p.partId)) partColors.set(p.partId, colors[ci++ % colors.length]);
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="border border-gray-300 rounded bg-white">
      <rect x={0} y={0} width={W} height={H} fill="#f9fafb" />
      {sheet.pieces.map((p, i) => {
        const x = p.x * SCALE;
        const y = p.y * SCALE;
        const w = p.w * SCALE;
        const h = p.h * SCALE;
        const color = partColors.get(p.partId) ?? '#e5e7eb';
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={color} stroke="#374151" strokeWidth="0.8" rx="1" />
            {w > 30 && h > 16 && (
              <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.min(9, w / 5, h / 2)} fill="#1f2937">
                <tspan x={x + w / 2} dy="-4">{p.partName}{p.rotated ? '↺' : ''}</tspan>
                <tspan x={x + w / 2} dy="11" fontSize={Math.min(7, w / 6)}>{p.w}×{p.h}</tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function CuttingTab({ project }: Props) {
  const [result, setResult] = useState<CuttingResult | null>(null);
  const [kerf, setKerf] = useState(project.kerf);

  function run() {
    if (project.parts.length === 0) return alert('Добавьте детали на вкладке «Детали»');
    if (project.materials.length === 0) return alert('Добавьте материалы на вкладке «Материалы»');
    setResult(optimize(project.parts, project.materials, kerf));
  }

  const matMap = new Map(project.materials.map(m => [m.id, m]));

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Ширина пропила (мм)</label>
          <input type="number" min="0" max="10" step="0.5" value={kerf}
            onChange={e => setKerf(+e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-32" />
        </div>
        <button onClick={run} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          ▶ Рассчитать раскройку
        </button>
      </div>

      {result && (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{result.totalSheets}</div>
              <div className="text-xs text-gray-500 mt-1">листов всего</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{result.totalCost.toLocaleString('ru')} ₽</div>
              <div className="text-xs text-gray-500 mt-1">стоимость материалов</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">
                {result.sheets.length > 0 ? Math.round(result.sheets.reduce((s, sh) => s + sh.wastePercent, 0) / result.sheets.length) : 0}%
              </div>
              <div className="text-xs text-gray-500 mt-1">средние отходы</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">
                {project.parts.reduce((s, p) => s + p.quantity, 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">деталей</div>
            </div>
          </div>

          {/* Sheets by material */}
          {project.materials.map(mat => {
            const matSheets = result.sheets.filter(s => s.materialId === mat.id);
            if (matSheets.length === 0) return null;
            return (
              <div key={mat.id} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: mat.color }} />
                  <h3 className="font-semibold text-gray-800">{mat.name}</h3>
                  <span className="text-gray-500 text-sm">— {matSheets.length} лист{matSheets.length > 1 ? 'а' : ''}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {matSheets.map((sheet, i) => (
                    <div key={i} className="flex-shrink-0">
                      <div className="text-xs text-gray-500 mb-1 text-center">
                        Лист {sheet.sheetIndex} · отходы {sheet.wastePercent}%
                      </div>
                      <SheetSVG sheet={sheet} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Unplaced */}
          {result.unplacedParts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-red-700 mb-2">⚠ Не удалось разместить:</h4>
              {result.unplacedParts.map(({ part, count }) => (
                <div key={part.id} className="text-sm text-red-600">
                  {part.name} — {count} шт. ({part.width}×{part.height} мм) — деталь больше листа
                </div>
              ))}
            </div>
          )}

          {/* Per-sheet table */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Сводка по листам</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4 font-medium">Лист</th>
                  <th className="pb-2 pr-4 font-medium">Материал</th>
                  <th className="pb-2 pr-4 font-medium">Деталей</th>
                  <th className="pb-2 pr-4 font-medium">Отходы</th>
                  <th className="pb-2 font-medium">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {result.sheets.map((s, i) => {
                  const mat = matMap.get(s.materialId);
                  return (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4">#{s.sheetIndex}</td>
                      <td className="py-2 pr-4">{s.materialName}</td>
                      <td className="py-2 pr-4">{s.pieces.length} шт.</td>
                      <td className="py-2 pr-4">
                        <span className={s.wastePercent > 40 ? 'text-red-600' : s.wastePercent > 20 ? 'text-orange-500' : 'text-green-600'}>
                          {s.wastePercent}%
                        </span>
                      </td>
                      <td className="py-2">{mat ? mat.price.toLocaleString('ru') + ' ₽' : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📐</div>
          <p>Нажмите «Рассчитать раскройку» чтобы получить оптимальную схему</p>
        </div>
      )}
    </div>
  );
}
