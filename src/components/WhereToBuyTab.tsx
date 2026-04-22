import { useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
}

interface MaterialCategory {
  id: string;
  name: string;
  icon: string;
  queries: { ozon: string; wb: string; ym: string };
  tips: string;
}

const MATERIALS: MaterialCategory[] = [
  {
    id: 'dsp',
    name: 'ДСП листовой',
    icon: '📦',
    queries: {
      ozon: 'ДСП лист мебельный 16мм',
      wb: 'ДСП плита мебельная 16мм',
      ym: 'ДСП лист 2750x1830',
    },
    tips: 'Стандартный размер 2750×1830 мм. Толщина 16 мм — для корпусов, 10 мм — для задних стенок.',
  },
  {
    id: 'mdf',
    name: 'МДФ листовой',
    icon: '📋',
    queries: {
      ozon: 'МДФ лист мебельный',
      wb: 'МДФ плита листовая',
      ym: 'МДФ лист 16мм мебельный',
    },
    tips: 'МДФ плотнее ДСП, лучше держит крепёж и фрезеровку. Используют для фасадов.',
  },
  {
    id: 'kromka',
    name: 'Кромка ПВХ',
    icon: '🎗️',
    queries: {
      ozon: 'кромка ПВХ мебельная 22мм',
      wb: 'кромка мебельная ПВХ 22х0.4',
      ym: 'кромка ПВХ мебельная рулон',
    },
    tips: 'Берите 22 мм для торцов 16 мм ДСП. Толщина 0.4–2 мм — чем толще, тем прочнее.',
  },
  {
    id: 'furnitura',
    name: 'Фурнитура (петли, ящики)',
    icon: '🔧',
    queries: {
      ozon: 'петли мебельные накладные blum',
      wb: 'петли мебельные + направляющие ящиков',
      ym: 'мебельные петли накладные + направляющие',
    },
    tips: 'Blum, Hettich — надёжные марки. Для ящиков берите направляющие с доводчиком.',
  },
  {
    id: 'stoleshnitsa',
    name: 'Столешница',
    icon: '🍽️',
    queries: {
      ozon: 'столешница кухонная 38мм',
      wb: 'столешница кухонная постформинг',
      ym: 'столешница кухонная 3000мм',
    },
    tips: 'Стандартная глубина 600 мм. Толщина 28–38 мм. Постформинг — закруглённый передний край.',
  },
  {
    id: 'fasad',
    name: 'Фасады кухонные',
    icon: '🚪',
    queries: {
      ozon: 'фасады кухонные МДФ',
      wb: 'фасады для кухни МДФ под заказ',
      ym: 'кухонные фасады МДФ эмаль',
    },
    tips: 'Фасады лучше заказывать под размер. МДФ в эмали или шпоне — практичный выбор.',
  },
  {
    id: 'hdv',
    name: 'ХДФ / ДВП (задние стенки)',
    icon: '🗂️',
    queries: {
      ozon: 'ХДФ лист 3мм задняя стенка',
      wb: 'ДВП лист мебельный 3.2мм',
      ym: 'ХДФ лист 2440x1220',
    },
    tips: 'Для задних стенок шкафов. Толщина 3–4 мм. ХДФ плотнее и ровнее ДВП.',
  },
  {
    id: 'ruchki',
    name: 'Ручки и профили',
    icon: '🖐️',
    queries: {
      ozon: 'ручки мебельные кухня скоба',
      wb: 'ручки для мебели кухни профиль',
      ym: 'мебельные ручки скоба 128мм',
    },
    tips: 'Стандартный межосевой размер 128 мм. Профильные ручки-рейлинги — современный вариант.',
  },
  {
    id: 'klej',
    name: 'Клей и расходники',
    icon: '🧴',
    queries: {
      ozon: 'клей ПВА мебельный столярный',
      wb: 'конфирматы саморезы мебельные',
      ym: 'конфирматы 7x50 + клей мебельный',
    },
    tips: 'Конфирматы 7×50 мм — основной крепёж для ДСП. Заглушки подбирайте в цвет материала.',
  },
];

function searchUrl(shop: 'ozon' | 'wb' | 'ym', query: string): string {
  const q = encodeURIComponent(query + ' Челябинск');
  if (shop === 'ozon') return `https://www.ozon.ru/search/?text=${encodeURIComponent(query)}&from_global=true`;
  if (shop === 'wb') return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(query)}`;
  return `https://market.yandex.ru/search?text=${q}&lr=56`;
}

const SHOP_STYLES = {
  ozon:  { bg: 'bg-blue-600 hover:bg-blue-700', label: 'Ozon', emoji: '🛒' },
  wb:    { bg: 'bg-purple-600 hover:bg-purple-700', label: 'Wildberries', emoji: '🍇' },
  ym:    { bg: 'bg-yellow-500 hover:bg-yellow-600', label: 'Яндекс.Маркет', emoji: '🛍️' },
};

export default function WhereToBuyTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier,'id'>>({ name:'', phone:'', address:'', note:'' });
  const [search, setSearch] = useState('');

  function addSupplier() {
    if (!newSupplier.name.trim()) return;
    setSuppliers(prev => [...prev, { ...newSupplier, id: Math.random().toString(36).slice(2) }]);
    setNewSupplier({ name:'', phone:'', address:'', note:'' });
    setShowAddSupplier(false);
  }

  const filtered = MATERIALS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Где купить материалы</h2>
          <p className="text-sm text-gray-500 mt-0.5">Поиск на маркетплейсах — нажмите кнопку и выберите по цене</p>
        </div>
        <input
          className="border rounded-lg px-3 py-2 text-sm w-48"
          placeholder="🔍 Поиск материала..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Маркетплейсы */}
      <div className="grid gap-4 mb-8">
        {filtered.map(mat => (
          <div key={mat.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{mat.icon}</span>
                  <h3 className="font-semibold text-gray-800">{mat.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">{mat.tips}</p>
                <div className="flex flex-wrap gap-2">
                  {(['ozon','wb','ym'] as const).map(shop => {
                    const st = SHOP_STYLES[shop];
                    return (
                      <a
                        key={shop}
                        href={searchUrl(shop, mat.queries[shop])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${st.bg}`}
                      >
                        <span>{st.emoji}</span>
                        {st.label}
                        <span className="opacity-70 text-xs">↗</span>
                      </a>
                    );
                  })}
                  <a
                    href={`https://chelябинск.yandex.ru/search?text=${encodeURIComponent(mat.name + ' купить Челябинск')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    🔍 Яндекс Челябинск ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Свои поставщики */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Мои поставщики</h3>
            <p className="text-xs text-gray-500 mt-0.5">Сохраните контакты проверенных магазинов</p>
          </div>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
          >
            + Добавить
          </button>
        </div>

        {suppliers.length === 0 && !showAddSupplier && (
          <p className="text-gray-400 text-sm text-center py-6">
            Нет сохранённых поставщиков.<br/>
            Добавьте магазины которые вы уже проверили.
          </p>
        )}

        {showAddSupplier && (
          <div className="border rounded-lg p-3 mb-3 bg-gray-50">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Название магазина *</label>
                <input className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="Например: ДСП-маркет"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier(s => ({...s, name: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Телефон</label>
                <input className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="+7 (351) ..."
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier(s => ({...s, phone: e.target.value}))} />
              </div>
            </div>
            <div className="mb-2">
              <label className="text-xs text-gray-500 block mb-1">Адрес</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="Улица, дом"
                value={newSupplier.address}
                onChange={e => setNewSupplier(s => ({...s, address: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Заметка (что покупаете, цены)</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm resize-none" rows={2}
                placeholder="Например: ДСП белый 16мм — 2100₽/лист, кромка — 80₽/м"
                value={newSupplier.note}
                onChange={e => setNewSupplier(s => ({...s, note: e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <button onClick={addSupplier} className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">Сохранить</button>
              <button onClick={() => setShowAddSupplier(false)} className="flex-1 border py-1.5 rounded text-sm hover:bg-gray-50">Отмена</button>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          {suppliers.map(s => (
            <div key={s.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                {s.phone && <div className="text-xs text-gray-500 mt-0.5">📞 {s.phone}</div>}
                {s.address && <div className="text-xs text-gray-500">📍 {s.address}</div>}
                {s.note && <div className="text-xs text-gray-400 mt-1 bg-gray-50 rounded p-1.5">{s.note}</div>}
              </div>
              <button
                onClick={() => setSuppliers(prev => prev.filter(x => x.id !== s.id))}
                className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Подсказка */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>💡 Совет:</strong> На маркетплейсах фильтруйте по городу доставки и сортируйте «по цене».
        Для крупных листов (ДСП, МДФ) удобнее искать в местных строительных базах — дешевле и без доставки.
      </div>
    </div>
  );
}
