import React, { useState, useEffect } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import {
  Note01Icon,
  Tick02Icon,
  Add01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
} from 'hugeicons-react';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteConfig {
  mode: 'text' | 'todo';
  content: string;
  todos: TodoItem[];
}

const DEFAULT_CONFIG: NoteConfig = {
  mode: 'todo',
  content: '记录你的灵感与备忘...',
  todos: [
    { id: '1', text: '完成今日重要任务', done: false },
    { id: '2', text: '保持好心情与多喝水', done: true },
  ],
};

const NoteWidget: React.FC<{
  instance: WidgetInstance<NoteConfig>;
  size: WidgetSize;
  isEditing?: boolean;
  onUpdateConfig?: (cfg: Partial<NoteConfig>) => void;
}> = ({ instance, size, isEditing, onUpdateConfig }) => {
  const config = { ...DEFAULT_CONFIG, ...(instance.config || {}) };
  const mode = config.mode || 'todo';
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const handleToggleMode = (newMode: 'text' | 'todo') => {
    if (isEditing) return;
    onUpdateConfig?.({ mode: newMode });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateConfig?.({ content: e.target.value });
  };

  const handleToggleTodo = (id: string) => {
    if (isEditing) return;
    const newTodos = (config.todos || []).map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    onUpdateConfig?.({ todos: newTodos });
  };

  const handleAddTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = newTodoText.trim();
    if (!text) {
      setIsAddingTodo(false);
      return;
    }
    const newTodos = [
      ...(config.todos || []),
      { id: Date.now().toString(), text, done: false },
    ];
    onUpdateConfig?.({ todos: newTodos });
    setNewTodoText('');
    setIsAddingTodo(false);
  };

  const handleDeleteTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTodos = (config.todos || []).filter((t) => t.id !== id);
    onUpdateConfig?.({ todos: newTodos });
  };

  const doneCount = (config.todos || []).filter((t) => t.done).length;
  const totalCount = (config.todos || []).length;

  return (
    <div className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-3 flex flex-col justify-between select-none transition-all duration-200 group">
      {/* 顶部标题栏与模式切换 */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <span className="text-[12px] font-semibold text-white/85 tracking-tight truncate">
            {mode === 'todo' ? '备忘待办' : '便签速记'}
          </span>
          {mode === 'todo' && totalCount > 0 && (
            <span className="text-[10px] text-white/40 font-mono ml-0.5">
              {doneCount}/{totalCount}
            </span>
          )}
        </div>

        {/* 模式切换小胶囊 */}
        <div className="flex items-center bg-white/[0.06] rounded-full p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => handleToggleMode('todo')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
              mode === 'todo'
                ? 'bg-amber-500/25 text-amber-300 font-semibold shadow-sm'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            待办
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('text')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
              mode === 'text'
                ? 'bg-amber-500/25 text-amber-300 font-semibold shadow-sm'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            便签
          </button>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex-1 overflow-hidden pt-2 flex flex-col min-h-0">
        {mode === 'todo' ? (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* 待办列表滚动区域 */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
              {(config.todos || []).map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => handleToggleTodo(todo.id)}
                  className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-[10px] transition-all cursor-pointer group/item ${
                    todo.done
                      ? 'bg-white/[0.02] text-white/35 line-through'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/85'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center shrink-0 border transition-colors ${
                        todo.done
                          ? 'bg-amber-500/30 border-amber-400/50 text-amber-300'
                          : 'border-white/25 bg-transparent'
                      }`}
                    >
                      {todo.done && <Tick02Icon size={10} />}
                    </div>
                    <span className="text-[11.5px] truncate tracking-tight">
                      {todo.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteTodo(todo.id, e)}
                    className="opacity-0 group-hover/item:opacity-70 hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity p-0.5"
                    title="删除"
                  >
                    <Delete02Icon size={12} />
                  </button>
                </div>
              ))}

              {(config.todos || []).length === 0 && (
                <div className="h-full flex items-center justify-center text-[11px] text-white/30 italic py-4">
                  暂无待办，点击下方添加
                </div>
              )}
            </div>

            {/* 底部新增待办 */}
            {isAddingTodo ? (
              <form onSubmit={handleAddTodo} className="pt-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="输入待办按回车..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onBlur={() => handleAddTodo()}
                  className="w-full bg-white/[0.08] border border-amber-500/30 rounded-[8px] px-2.5 py-1 text-[11px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTodo(true)}
                className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1 rounded-[8px] bg-white/[0.03] hover:bg-white/[0.07] text-white/45 hover:text-white/80 text-[10.5px] font-medium transition-colors cursor-pointer"
              >
                <Add01Icon size={12} />
                <span>添加事项</span>
              </button>
            )}
          </div>
        ) : (
          /* 纯文本便签模式 */
          <div className="flex-1 h-full min-h-0">
            <textarea
              value={config.content || ''}
              onChange={handleContentChange}
              placeholder="在此输入便签内容..."
              className="w-full h-full bg-transparent resize-none text-[11.5px] leading-relaxed text-white/80 placeholder-white/25 focus:outline-none overflow-y-auto no-scrollbar"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const noteStrategy: WidgetStrategy<NoteConfig> = {
  type: 'note',
  name: '便签备忘',
  description: '随时记录待办清单与灵感速记，支持 Todo 勾选与便签双模式',
  icon: Note01Icon,
  defaultSize: '2x2',
  supportedSizes: ['2x2', '4x2'],
  defaultConfig: DEFAULT_CONFIG,
  render: NoteWidget,
};
