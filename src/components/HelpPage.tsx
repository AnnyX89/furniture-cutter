export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-sm text-gray-700">
      <h2 className="text-xl font-bold text-gray-900 mb-6">📖 Инструкция по работе с программой</h2>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Шаг 1 — Создайте проект</h3>
        <p className="text-sm leading-relaxed">
          На главном экране нажмите <strong>«Новый проект»</strong> и введите название (например, «Кухня»).
          Проект автоматически сохраняется в браузере — вы можете закрыть вкладку и вернуться позже.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Шаг 2 — Добавьте материалы</h3>
        <p className="text-sm leading-relaxed mb-2">
          Откройте вкладку <strong>«Материалы»</strong> и добавьте все типы листов, которые будете использовать.
        </p>
        <ul className="text-sm space-y-1 list-disc pl-4">
          <li><strong>Название</strong> — например «ДСП 16мм белый» или «МДФ 10мм»</li>
          <li><strong>Размер листа</strong> — стандартный размер ДСП: 2750×1830 мм или 2440×1220 мм</li>
          <li><strong>Толщина</strong> — 16 мм для корпусов, 10 мм для задних стенок</li>
          <li><strong>Цена за лист</strong> — для расчёта сметы</li>
          <li><strong>Текстура</strong> — если включено, детали нельзя поворачивать при раскройке (рисунок должен идти в одном направлении)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Шаг 3 — Добавьте детали</h3>
        <p className="text-sm leading-relaxed mb-2">
          Откройте вкладку <strong>«Детали»</strong>. Для каждой детали укажите:
        </p>
        <ul className="text-sm space-y-1 list-disc pl-4">
          <li><strong>Название</strong> — понятное вам (боковая стенка, полка, фасад и т.д.)</li>
          <li><strong>Ширина и высота</strong> — в миллиметрах, чистовой размер детали <em>без учёта пропила</em></li>
          <li><strong>Количество</strong> — сколько одинаковых деталей нужно</li>
          <li><strong>Материал</strong> — из какого листа будет деталь</li>
          <li><strong>Кромкование</strong> — отметьте стороны, которые нужно закрыть кромкой (видимые торцы)</li>
        </ul>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 text-sm">
          <strong>Совет:</strong> Размеры вводите уже с учётом толщины кромки, если она влияет на сборку.
          Например, если кромка 2 мм, а деталь должна вставать в паз — вычтите 2 мм из нужного размера.
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Шаг 4 — Рассчитайте раскройку</h3>
        <p className="text-sm leading-relaxed mb-2">
          Откройте вкладку <strong>«Раскройка»</strong>:
        </p>
        <ul className="text-sm space-y-1 list-disc pl-4">
          <li><strong>Ширина пропила</strong> — обычно 3–4 мм (размер диска пилы). Уточните у мастера.</li>
          <li>Нажмите <strong>«Рассчитать раскройку»</strong></li>
          <li>Программа автоматически расставит все детали по листам с минимальными отходами</li>
          <li>Каждый лист отображается схемой с размерами и цветовой маркировкой деталей</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm">
          <strong>Как читать схему:</strong> Каждый прямоугольник на схеме — одна деталь. Название и размеры написаны внутри.
          Значок ↺ означает, что деталь повёрнута на 90° для лучшей раскладки.
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Шаг 5 — Распечатайте отчёты</h3>
        <p className="text-sm leading-relaxed">
          На вкладке <strong>«Отчёты»</strong> нажмите <strong>«Распечатать»</strong>. Вы получите:
        </p>
        <ul className="text-sm space-y-1 list-disc pl-4 mt-2">
          <li>Полный список деталей с размерами</li>
          <li>Потребность в материалах и смету</li>
          <li>Список кромки по каждой детали и итоговый метраж</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Стандартные размеры листов ДСП</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-1 pr-4 text-left font-medium">Формат</th>
              <th className="pb-1 pr-4 text-left font-medium">Ширина</th>
              <th className="pb-1 text-left font-medium">Высота</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Стандартный', '2750 мм', '1830 мм'],
              ['Малый', '2440 мм', '1220 мм'],
              ['Большой', '3500 мм', '1750 мм'],
            ].map(([f, w, h]) => (
              <tr key={f} className="border-b">
                <td className="py-1 pr-4">{f}</td>
                <td className="py-1 pr-4">{w}</td>
                <td className="py-1">{h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold text-gray-800 text-base mb-2">Часто задаваемые вопросы</h3>
        <div className="space-y-3">
          {[
            ['Деталь не помещается на лист — что делать?',
              'Программа покажет предупреждение. Проверьте размер детали — она не должна быть больше листа. Если деталь почти равна листу — уменьшите её на несколько мм.'],
            ['Почему много отходов?',
              'При нестандартных размерах деталей отходы неизбежны. Попробуйте разрешить поворот деталей (снять галочку «текстура» у материала).'],
            ['Нужно ли указывать кромку?',
              'Да, если хотите получить правильный расчёт метража кромки для закупки. Для самой раскройки кромка значения не имеет.'],
            ['Данные сохраняются?',
              'Да, автоматически в браузере. Но если вы очистите данные браузера — проекты удалятся. Важные проекты распечатайте или сохраните скриншот.'],
          ].map(([q, a]) => (
            <div key={q} className="border rounded-lg p-3">
              <div className="font-medium text-gray-800 text-sm mb-1">{q}</div>
              <div className="text-sm text-gray-600">{a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
