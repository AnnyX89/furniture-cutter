import { useState, useRef, useEffect } from 'react';
import { generateVariants, detectRoomType } from './designTemplates';
import type { PlacedItem } from './designTemplates';

const STORAGE_KEY = 'fc_openai_key';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

interface Room {
  width: number; height: number;
  wallColor: string; floorColor: string; ceilingColor: string;
  wallTexture: string; floorTexture: string; ceilTexture: string;
}

interface AnyItem { name: string; w: number; h: number; }

interface Props {
  room: Room;
  items: AnyItem[];
  projectName: string;
  onApplyItems: (items: PlacedItem[]) => void;
  onSetColors: (c: { wallColor?: string; floorColor?: string; ceilingColor?: string }) => void;
  onSetTextures: (t: { wallTexture?: string; floorTexture?: string; ceilTexture?: string }) => void;
  onClose: () => void;
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'apply_design_variant',
      description: 'Применить готовый вариант расстановки мебели с цветами и текстурами.',
      parameters: {
        type: 'object',
        properties: {
          variant_id: {
            type: 'string',
            enum: ['k-linear','k-l','k-u','k-island','k-pantry','k-gallery',
                   'b-classic','b-small','b-luxury','b-kids','b-dressing',
                   'l-tv','l-corner','l-cinema','l-open',
                   'h-min','h-full','o-basic','o-full'],
            description: 'ID варианта расстановки',
          },
          wall_color:    { type: 'string', description: 'Hex цвет стен, напр. #f5f0e8' },
          floor_color:   { type: 'string', description: 'Hex цвет пола' },
          ceiling_color: { type: 'string', description: 'Hex цвет потолка' },
          wall_texture:  { type: 'string', enum: ['solid','tile-metro','marble','wood-panel','brick','concrete','wallpaper-light'] },
          floor_texture: { type: 'string', enum: ['solid','wood-light','wood-dark','parquet','marble-white','marble-dark','tile-white','tile-terracotta','concrete','carpet-beige','carpet-gray'] },
          ceil_texture:  { type: 'string', enum: ['solid','plaster','wood-beam','concrete'] },
        },
        required: ['variant_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_colors',
      description: 'Изменить цвета стен, пола или потолка.',
      parameters: {
        type: 'object',
        properties: {
          wall_color:    { type: 'string' },
          floor_color:   { type: 'string' },
          ceiling_color: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_textures',
      description: 'Изменить текстуры стен, пола или потолка.',
      parameters: {
        type: 'object',
        properties: {
          wall_texture:  { type: 'string', enum: ['solid','tile-metro','marble','wood-panel','brick','concrete','wallpaper-light'] },
          floor_texture: { type: 'string', enum: ['solid','wood-light','wood-dark','parquet','marble-white','marble-dark','tile-white','tile-terracotta','concrete','carpet-beige','carpet-gray'] },
          ceil_texture:  { type: 'string', enum: ['solid','plaster','wood-beam','concrete'] },
        },
      },
    },
  },
];

const WELCOME = `Привет! Я AI-дизайнер интерьеров 🎨

Опишите, что вы хотите — например:
• «Хочу скандинавскую кухню с белыми стенами и деревянным полом»
• «Поставь мебель для уютной гостиной с угловым диваном»
• «Сделай спальню в стиле минимализм»

Я расставлю мебель и подберу цвета!`;

export default function AIDesignAssistant({ room, items, projectName, onApplyItems, onSetColors, onSetTextures, onClose }: Props) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [editingKey, setEditingKey] = useState(!localStorage.getItem(STORAGE_KEY));
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function buildSystemPrompt() {
    const roomType = detectRoomType(projectName);
    const itemsSummary = items.length > 0
      ? items.map(i => `${i.name} (${i.w}×${i.h}мм)`).join(', ')
      : 'пусто';
    return `Ты AI-дизайнер интерьеров. Помогаешь расставлять мебель и подбирать цвета на основе пожеланий клиента.

Текущая комната: "${projectName}" (${room.width}×${room.height}мм)
Тип: ${roomType}
Цвета: стены ${room.wallColor}, пол ${room.floorColor}, потолок ${room.ceilingColor}
Текстуры: стены=${room.wallTexture}, пол=${room.floorTexture}
Мебель сейчас: ${itemsSummary}

Доступные варианты расстановки (по типу):
- Кухня: k-linear (линейная), k-l (Г-образная), k-u (П-образная), k-island (с островом), k-pantry (Г+пенал), k-gallery (двухрядная)
- Спальня: b-classic, b-small (рабочая зона), b-luxury, b-kids (детская), b-dressing (с гардеробной)
- Гостиная: l-tv (классика), l-corner (угловой диван), l-cinema (кинотеатр), l-open (гостиная-столовая)
- Прихожая: h-min, h-full
- Кабинет: o-basic, o-full

Текстуры стен: solid, tile-metro, marble, wood-panel, brick, concrete, wallpaper-light
Текстуры пола: solid, wood-light, wood-dark, parquet, marble-white, tile-white, tile-terracotta, concrete, carpet-beige, carpet-gray
Текстуры потолка: solid, plaster, wood-beam, concrete

Инструкция:
1. Коротко объясни своё решение (1–2 предложения)
2. Вызови нужные функции для применения изменений
3. Отвечай только на русском языке`;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || !apiKey) return;

    const prevMsgs = messages.filter(m => !m.pending);
    setMessages([...prevMsgs, { role: 'user', content: text }, { role: 'assistant', content: '⏳', pending: true }]);
    setInput('');
    setLoading(true);

    try {
      const history = prevMsgs.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...history,
            { role: 'user', content: text },
          ],
          tools: TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as {
        choices: Array<{
          message: {
            content: string | null;
            tool_calls?: Array<{ function: { name: string; arguments: string } }>;
          };
        }>;
      };
      const msg = data.choices[0].message;
      let reply = msg.content ?? '';

      if (msg.tool_calls?.length) {
        for (const tc of msg.tool_calls) {
          const args = JSON.parse(tc.function.arguments) as Record<string, string>;

          if (tc.function.name === 'apply_design_variant') {
            const variants = generateVariants(projectName, room);
            const variant = variants.find(v => v.id === args.variant_id);
            if (variant) {
              onApplyItems(variant.items);
              if (!reply) reply = `Применил вариант «${variant.name}» ✅`;
            }
            if (args.wall_color || args.floor_color || args.ceiling_color) {
              onSetColors({ wallColor: args.wall_color, floorColor: args.floor_color, ceilingColor: args.ceiling_color });
            }
            if (args.wall_texture || args.floor_texture || args.ceil_texture) {
              onSetTextures({ wallTexture: args.wall_texture, floorTexture: args.floor_texture, ceilTexture: args.ceil_texture });
            }
          }

          if (tc.function.name === 'set_colors') {
            onSetColors({ wallColor: args.wall_color, floorColor: args.floor_color, ceilingColor: args.ceiling_color });
            if (!reply) reply = 'Цвета обновлены ✅';
          }

          if (tc.function.name === 'set_textures') {
            onSetTextures({ wallTexture: args.wall_texture, floorTexture: args.floor_texture, ceilTexture: args.ceil_texture });
            if (!reply) reply = 'Текстуры обновлены ✅';
          }
        }
      }

      if (!reply) reply = 'Готово ✅';

      setMessages(prev => prev.map(m => m.pending ? { ...m, content: reply, pending: false } : m));
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Неизвестная ошибка';
      setMessages(prev => prev.map(m => m.pending ? { ...m, content: `❌ Ошибка: ${errMsg}`, pending: false } : m));
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function saveKey() {
    localStorage.setItem(STORAGE_KEY, apiKey);
    setEditingKey(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white border-l shadow-2xl flex flex-col z-40">

      {/* Шапка */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <div className="font-semibold text-sm">AI-дизайнер</div>
            <div className="text-xs opacity-75">GPT-4o-mini</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none pb-0.5">×</button>
      </div>

      {/* API ключ */}
      {editingKey ? (
        <div className="p-3 border-b bg-yellow-50 flex-shrink-0">
          <div className="text-xs text-yellow-800 mb-2 font-medium">🔑 OpenAI API ключ:</div>
          <div className="flex gap-2">
            <input
              type="password"
              className="flex-1 border rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveKey(); }}
              autoFocus
            />
            <button onClick={saveKey} disabled={!apiKey.trim()} className="bg-blue-600 disabled:opacity-40 text-white px-3 py-1.5 rounded text-xs font-medium">OK</button>
          </div>
          <div className="text-[10px] text-yellow-700 mt-1.5">Ключ сохраняется только в вашем браузере</div>
        </div>
      ) : (
        <div className="px-3 py-1.5 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-gray-500">🔑 API ключ сохранён</span>
          <button onClick={() => setEditingKey(true)} className="text-xs text-blue-500 hover:underline">Изменить</button>
        </div>
      )}

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            } ${m.pending ? 'animate-pulse' : ''}`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Ввод */}
      <div className="border-t p-3 flex-shrink-0">
        {!apiKey && (
          <p className="text-xs text-center text-red-500 mb-2">Введите API ключ выше для начала работы</p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={2}
            className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            placeholder="Хочу скандинавскую кухню..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={loading || !apiKey}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !apiKey || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl p-2.5 flex items-center justify-center transition-colors flex-shrink-0"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-1.5 text-center">Enter — отправить · Shift+Enter — новая строка</div>
      </div>
    </div>
  );
}
