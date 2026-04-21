import type { Project } from '../types';
import { optimize } from '../utils/optimizer';

interface Props {
  project: Project;
}

export default function ReportsTab({ project }: Props) {
  const result = project.parts.length > 0 && project.materials.length > 0
    ? optimize(project.parts, project.materials, project.kerf)
    : null;

  const matMap = new Map(project.materials.map(m => [m.id, m]));

  // Edge banding summary: collect all edges per material
  type EdgeRow = { name: string; width: number; height: number; qty: number; top: number; bottom: number; left: number; right: number };
  const edgeRows: EdgeRow[] = project.parts.map(p => ({
    name: p.name,
    width: p.width,
    height: p.height,
    qty: p.quantity,
    top: p.edgeBanding.top ? p.quantity : 0,
    bottom: p.edgeBanding.bottom ? p.quantity : 0,
    left: p.edgeBanding.left ? p.quantity : 0,
    right: p.edgeBanding.right ? p.quantity : 0,
  })).filter(r => r.top + r.bottom + r.left + r.right > 0);

  // Total edge lengths in meters
  const totalEdge = {
    top: edgeRows.reduce((s, r) => s + r.top * r.width, 0) / 1000,
    bottom: edgeRows.reduce((s, r) => s + r.bottom * r.width, 0) / 1000,
    left: edgeRows.reduce((s, r) => s + r.left * r.height, 0) / 1000,
    right: edgeRows.reduce((s, r) => s + r.right * r.height, 0) / 1000,
  };
  const totalEdgeM = totalEdge.top + totalEdge.bottom + totalEdge.left + totalEdge.right;

  // Sheet counts by material
  const sheetCounts = new Map<string, number>();
  if (result) {
    for (const s of result.sheets) {
      sheetCounts.set(s.materialId, (sheetCounts.get(s.materialId) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-lg font-semibold text-gray-800">Отчёты</h2>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
          🖨 Распечатать
        </button>
      </div>

      {/* Parts list */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Список деталей</h3>
        {project.parts.length === 0 ? (
          <p className="text-gray-400 text-sm">Нет деталей</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Название</th>
                <th className="pb-2 pr-3 font-medium">Ш × В (мм)</th>
                <th className="pb-2 pr-3 font-medium">Кол.</th>
                <th className="pb-2 font-medium">Материал</th>
              </tr>
            </thead>
            <tbody>
              {project.parts.map((p, i) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1.5 pr-3 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 pr-3 font-medium">{p.name}</td>
                  <td className="py-1.5 pr-3">{p.width} × {p.height}</td>
                  <td className="py-1.5 pr-3">{p.quantity} шт.</td>
                  <td className="py-1.5">{matMap.get(p.materialId)?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-medium">
                <td colSpan={3} className="pt-2 text-gray-500">Итого</td>
                <td className="pt-2">{project.parts.reduce((s, p) => s + p.quantity, 0)} шт.</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      {/* Materials needed */}
      {result && (
        <section className="print-break">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Потребность в материалах</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="pb-2 pr-3 font-medium">Материал</th>
                <th className="pb-2 pr-3 font-medium">Размер листа</th>
                <th className="pb-2 pr-3 font-medium">Листов</th>
                <th className="pb-2 pr-3 font-medium">Цена/лист</th>
                <th className="pb-2 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {project.materials.map(m => {
                const cnt = sheetCounts.get(m.id) ?? 0;
                return (
                  <tr key={m.id} className="border-b">
                    <td className="py-1.5 pr-3 font-medium">{m.name}</td>
                    <td className="py-1.5 pr-3">{m.sheetWidth} × {m.sheetHeight}</td>
                    <td className="py-1.5 pr-3">{cnt} шт.</td>
                    <td className="py-1.5 pr-3">{m.price.toLocaleString('ru')} ₽</td>
                    <td className="py-1.5 font-medium">{(m.price * cnt).toLocaleString('ru')} ₽</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t font-bold">
                <td colSpan={4} className="pt-2">Итого</td>
                <td className="pt-2 text-blue-700">{result.totalCost.toLocaleString('ru')} ₽</td>
              </tr>
            </tfoot>
          </table>
        </section>
      )}

      {/* Edge banding */}
      {edgeRows.length > 0 && (
        <section className="print-break">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Кромкование</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="pb-2 pr-3 font-medium">Деталь</th>
                <th className="pb-2 pr-3 font-medium">Ш × В</th>
                <th className="pb-2 pr-3 font-medium">Кол.</th>
                <th className="pb-2 pr-3 font-medium text-center">Верх</th>
                <th className="pb-2 pr-3 font-medium text-center">Низ</th>
                <th className="pb-2 pr-3 font-medium text-center">Лево</th>
                <th className="pb-2 font-medium text-center">Право</th>
              </tr>
            </thead>
            <tbody>
              {edgeRows.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1.5 pr-3">{r.name}</td>
                  <td className="py-1.5 pr-3">{r.width}×{r.height}</td>
                  <td className="py-1.5 pr-3">{r.qty}</td>
                  <td className="py-1.5 pr-3 text-center">{r.top > 0 ? '✓' : ''}</td>
                  <td className="py-1.5 pr-3 text-center">{r.bottom > 0 ? '✓' : ''}</td>
                  <td className="py-1.5 pr-3 text-center">{r.left > 0 ? '✓' : ''}</td>
                  <td className="py-1.5 text-center">{r.right > 0 ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <strong>Итого кромки:</strong>
            <span className="ml-2">{totalEdge.top.toFixed(1)} м (верх) + {totalEdge.bottom.toFixed(1)} м (низ) + {totalEdge.left.toFixed(1)} м (лево) + {totalEdge.right.toFixed(1)} м (право)</span>
            <span className="ml-2 font-bold">= {totalEdgeM.toFixed(1)} м</span>
          </div>
        </section>
      )}

      {!result && (
        <p className="text-gray-400 text-sm">Для полного отчёта сначала добавьте материалы и детали</p>
      )}
    </div>
  );
}
