import React, { useState, useEffect, useRef, useMemo } from 'react';
import RGL, { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetInstance, WidgetSize } from '../../types/widget';
import { widgetRegistry } from '../../services/widgetRegistry';
import {
  Add01Icon,
  Delete02Icon,
  Cancel01Icon,
  Link01Icon,
  Copy01Icon,
  Menu01Icon,
  Tick02Icon,
  Folder01Icon,
} from 'hugeicons-react';
import { FolderEditModal } from '../../widgets/folder/FolderEditModal';
import { FolderConfig } from '../../widgets/folder';


// 兼容 ESM / CJS 的 GridLayout 组件引用
const GridLayout = (RGL as any).default || RGL;

interface WidgetCanvasProps {
  widgets: WidgetInstance[];
  openInNewTab: boolean;
  onUpdateWidgets: (newWidgets: WidgetInstance[]) => void;
  onOpenAddModal: () => void;
}

interface ContextMenuState {
  instance: WidgetInstance;
  index: number;
  x: number;
  y: number;
}

// 栅格尺寸映射 (转换为 RGL 的 w, h)
const getWidgetWH = (size: WidgetSize): { w: number; h: number } => {
  switch (size) {
    case '1x1':
      return { w: 1, h: 1 };
    case '1x2':
      return { w: 1, h: 2 };
    case '2x1':
      return { w: 2, h: 1 };
    case '2x2':
      return { w: 2, h: 2 };
    case '4x2':
      return { w: 4, h: 2 };
    case '4x3':
      return { w: 4, h: 3 };
    case '4x4':
      return { w: 4, h: 4 };
    default:
      return { w: 1, h: 1 };
  }
};

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({
  widgets,
  openInNewTab,
  onUpdateWidgets,
  onOpenAddModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<WidgetInstance<FolderConfig> | null>(null);

  // 监听文件夹点击添加或触发编辑事件
  useEffect(() => {
    const handleOpenFolder = (e: any) => {
      const target = widgets.find((w) => w.id === e.detail?.id);
      if (target && target.type === 'folder') {
        setEditingFolder(target as WidgetInstance<FolderConfig>);
      }
    };
    window.addEventListener('open-folder-edit' as any, handleOpenFolder);
    return () => window.removeEventListener('open-folder-edit' as any, handleOpenFolder);
  }, [widgets]);

  // 容器响应式宽度与列数计算 (单元格固定 68px，间距 14px，步长 82px)
  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 最大支持 12 列 (标准 960px 桌面容器)，小屏自动响应式适配列数，单元格保持标准正方
  const CELL_GAP = 14;
  const CELL_SIZE = 67;
  const MAX_COLS = 12;
  const cols = Math.min(MAX_COLS, Math.max(4, Math.floor((screenWidth - 32 + CELL_GAP) / (CELL_SIZE + CELL_GAP))));
  const gridWidth = cols === 12 ? 960 : cols * CELL_SIZE + (cols - 1) * CELL_GAP;
  const rowHeight = 67;

  // 长按定时器
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // 按 Escape 键退出编辑模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 点击任何空白区域退出编辑模式 (原生 iPadOS 交互)
  useEffect(() => {
    if (!isEditing) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.react-grid-item')) return;
      if (target.closest('.modal-card-glow')) return;

      setIsEditing(false);
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isEditing]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClose);
      window.addEventListener('contextmenu', handleClose);
      window.addEventListener('resize', handleClose);
      window.addEventListener('scroll', handleClose, true);
    }
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [contextMenu]);

  // 长按触发逻辑 (480ms，严格仅限鼠标左键或单指触控，右键绝对不触发长按编辑)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    if (e.button !== 0) return;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      setIsEditing(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 480);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.buttons !== 1) return;
    if (!startPosRef.current || !longPressTimerRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    startPosRef.current = null;
  };

  // 改变组件尺寸
  const handleSizeChange = (id: string, newSize: WidgetSize) => {
    onUpdateWidgets(
      widgets.map((w) => (w.id === id ? { ...w, size: newSize } : w))
    );
    setContextMenu(null);
  };

  // 移除组件挂载
  const handleRemove = (id: string) => {
    onUpdateWidgets(widgets.filter((w) => w.id !== id));
    if (contextMenu?.instance.id === id) {
      setContextMenu(null);
    }
  };

  // 复制网址 (针对书签类组件)
  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    setContextMenu(null);
  };

  // 构建 react-grid-layout 专有布局矩阵 (采用 2D 真实空间探测算法)
  const layout: LayoutItem[] = useMemo(() => {
    // 2D 占用网格，避免多行多列尺寸组件初次排布时互相践踏重叠
    const occupied = new Set<string>();
    const isOccupied = (x: number, y: number, w: number, h: number) => {
      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          if (occupied.has(`${x + dx},${y + dy}`)) return true;
        }
      }
      return false;
    };
    const markOccupied = (x: number, y: number, w: number, h: number) => {
      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          occupied.add(`${x + dx},${y + dy}`);
        }
      }
    };

    const items: LayoutItem[] = [];

    // 先放置已有合法非冲突坐标的组件
    widgets.forEach((widget) => {
      const wh = getWidgetWH(widget.size);
      const w = Math.min(wh.w, cols);
      const h = wh.h;

      if (widget.layout?.x !== undefined && widget.layout?.y !== undefined) {
        const x = Math.min(widget.layout.x, cols - w);
        const y = widget.layout.y;
        if (!isOccupied(x, y, w, h)) {
          markOccupied(x, y, w, h);
          items.push({
            i: widget.id,
            x,
            y,
            w,
            h,
            isDraggable: isEditing,
            isResizable: false,
          });
        }
      }
    });

    // 为未指定坐标的组件寻找首个可容纳空间
    widgets.forEach((widget) => {
      if (items.some((item) => item.i === widget.id)) return;

      const wh = getWidgetWH(widget.size);
      const w = Math.min(wh.w, cols);
      const h = wh.h;

      let found = false;
      let targetX = 0;
      let targetY = 0;

      for (let y = 0; y < 100 && !found; y++) {
        for (let x = 0; x <= cols - w && !found; x++) {
          if (!isOccupied(x, y, w, h)) {
            targetX = x;
            targetY = y;
            found = true;
          }
        }
      }

      markOccupied(targetX, targetY, w, h);
      items.push({
        i: widget.id,
        x: targetX,
        y: targetY,
        w,
        h,
        isDraggable: isEditing,
        isResizable: false,
      });
    });

    return items;
  }, [widgets, isEditing, cols]);

  // 工业级布局变动回调 (基于 react-grid-layout 的确定性物理重排)
  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    if (!isEditing) return;

    const layoutMap = new Map(newLayout.map((l) => [l.i, l]));

    const updated = widgets.map((w) => {
      const l = layoutMap.get(w.id);
      if (!l) return w;
      return {
        ...w,
        layout: { x: l.x, y: l.y },
      };
    });

    // 按纵向 y 再横向 x 排序，保证数组内部序列与视觉一致
    updated.sort((a, b) => {
      const ya = a.layout?.y ?? 0;
      const yb = b.layout?.y ?? 0;
      if (ya !== yb) return ya - yb;
      const xa = a.layout?.x ?? 0;
      const xb = b.layout?.x ?? 0;
      return xa - xb;
    });

    onUpdateWidgets(updated);
  };

  return (
    <div className="relative w-full max-w-[1020px] mx-auto px-4 py-6 select-none flex justify-center">
      <div style={{ width: gridWidth }}>
        <GridLayout
          className="react-grid-layout select-none"
          layout={layout}
          width={gridWidth}
          gridConfig={{
            cols: cols,
            rowHeight: rowHeight,
            margin: [CELL_GAP, CELL_GAP],
            containerPadding: [0, 0],
            maxRows: Infinity,
          }}
          dragConfig={{
            enabled: isEditing,
            bounded: false,
            threshold: 3,
          }}
          resizeConfig={{
            enabled: false,
          }}
          // 同时声明顶层兼容属性
          cols={cols}
          rowHeight={rowHeight}
          margin={[CELL_GAP, CELL_GAP]}
          containerPadding={[0, 0]}
          isDraggable={isEditing}
          isResizable={false}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((widget, index) => {
            const strategy = widgetRegistry.get(widget.type);
            if (!strategy) return <div key={widget.id} />;

            const WidgetRenderer = strategy.render;

            // 抖动交错类名 (奇偶错开，呈现自然有机晃动)
            const jiggleClass = isEditing
              ? index % 2 === 0
                ? 'jiggle-even'
                : 'jiggle-odd'
              : '';

            return (
              <div
                key={widget.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 关键：右键点击立即销毁长按定时器，确保右键绝不触发编辑模式
                  if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current);
                    longPressTimerRef.current = null;
                  }
                  setContextMenu({
                    instance: widget,
                    index,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                className="relative group select-none"
              >
                {/* 独立内部抖动与交互容器 */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`w-full h-full ${
                    isEditing
                      ? `${jiggleClass} cursor-grab active:cursor-grabbing`
                      : 'cursor-pointer hover:-translate-y-0.5 transition-transform duration-200'
                  }`}
                >
                  {/* 编辑模式下：左上角高透明度磨砂浮空删除角标 */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemove(widget.id);
                      }}
                      className="animate-badge-pop absolute -top-1.5 -left-1.5 z-30 w-[22px] h-[22px] rounded-full bg-black/35 hover:bg-red-500/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/[0.14] hover:border-red-400/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer group/btn"
                      title="移除组件"
                    >
                      <Cancel01Icon size={10} className="transition-transform group-hover/btn:rotate-90 duration-200" />
                    </button>
                  )}

                  {/* 组件渲染策略挂载点 */}
                  <WidgetRenderer
                    instance={widget}
                    size={widget.size}
                    openInNewTab={openInNewTab}
                    isEditing={isEditing}
                    onUpdateConfig={(cfg) => {
                      onUpdateWidgets(
                        widgets.map((w) =>
                          w.id === widget.id
                            ? { ...w, config: { ...w.config, ...cfg } }
                            : w
                        )
                      );
                    }}
                  />
                </div>
              </div>
            );
          })}
        </GridLayout>
      </div>

      {/* 右下角悬浮操作入口：常规状态下为【添加小组件】，编辑模式下为【完成编辑】 */}
      <div className="fixed bottom-7 right-7 z-30 pointer-events-auto">
        {isEditing ? (
          <button
            onClick={() => setIsEditing(false)}
            className="h-9 px-3.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 backdrop-blur-md active:scale-95 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] text-[12.5px] font-medium"
            title="完成编辑"
          >
            <Tick02Icon size={15} />
            <span>完成</span>
          </button>
        ) : (
          <button
            onClick={onOpenAddModal}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/75 hover:text-white backdrop-blur-md active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] group"
            title="添加小组件"
          >
            <Add01Icon size={17} className="transition-transform duration-300 group-hover:rotate-90" />
          </button>
        )}
      </div>

      {/* 统一规范的黑橙微光同心右键快捷菜单 */}
      <AnimatePresence>
        {contextMenu && (
          <WidgetContextMenu
            menuState={contextMenu}
            isCopied={copiedId === contextMenu.instance.id}
            onSizeChange={(size) => handleSizeChange(contextMenu.instance.id, size)}
            onEnterEditMode={() => {
              setIsEditing(true);
              setContextMenu(null);
            }}
            onRemove={() => handleRemove(contextMenu.instance.id)}
            onCopy={(url) => handleCopy(url, contextMenu.instance.id)}
            onEditFolder={(instance) => setEditingFolder(instance)}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* 文件夹编辑弹窗 */}
      {editingFolder && (
        <FolderEditModal
          isOpen={!!editingFolder}
          folderTitle={editingFolder.config?.title || '文件夹'}
          items={editingFolder.config?.items || []}
          maxItems={
            editingFolder.size === '2x2'
              ? 9
              : editingFolder.size === '2x1'
              ? 4
              : editingFolder.size === '1x2'
              ? 3
              : 4
          }
          onSave={(newCfg) => {
            onUpdateWidgets(
              widgets.map((w) =>
                w.id === editingFolder.id
                  ? { ...w, config: { ...w.config, ...newCfg } }
                  : w
              )
            );
          }}
          onClose={() => setEditingFolder(null)}
        />
      )}
    </div>
  );
};


interface WidgetContextMenuProps {
  menuState: ContextMenuState;
  isCopied: boolean;
  onSizeChange: (size: WidgetSize) => void;
  onEnterEditMode: () => void;
  onRemove: () => void;
  onCopy: (url: string) => void;
  onEditFolder?: (instance: WidgetInstance<FolderConfig>) => void;
  onClose: () => void;
}

const WidgetContextMenu: React.FC<WidgetContextMenuProps> = ({
  menuState,
  isCopied,
  onSizeChange,
  onEnterEditMode,
  onRemove,
  onCopy,
  onEditFolder,
  onClose,
}) => {
  const strategy = widgetRegistry.get(menuState.instance.type);
  const supportedSizes = strategy?.supportedSizes || [];

  const menuWidth = 168;
  const menuHeight = 220;
  const left = Math.min(Math.max(12, menuState.x), window.innerWidth - menuWidth - 16);
  const top = Math.min(Math.max(12, menuState.y), window.innerHeight - menuHeight - 16);

  const isBookmark = menuState.instance.type === 'bookmark';
  const bookmarkUrl = menuState.instance.config?.url;
  const isFolder = menuState.instance.type === 'folder';

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-50 w-[168px] p-1.5 rounded-[16px] modal-card-glow text-white select-none"
      >
        {/* 文件夹专属操作 */}
        {isFolder && (
          <>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onEditFolder?.(menuState.instance as WidgetInstance<FolderConfig>);
                  onClose();
                }}
                className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
              >
                <Folder01Icon size={14} className="text-white/50 flex-shrink-0" />
                <span className="truncate">编辑文件夹</span>
              </button>
            </div>
            <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />
          </>
        )}

        {/* 书签专属操作 */}
        {isBookmark && bookmarkUrl && (

          <>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  window.open(bookmarkUrl, '_blank');
                  onClose();
                }}
                className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
              >
                <Link01Icon size={14} className="text-white/50 flex-shrink-0" />
                <span className="truncate">打开链接</span>
              </button>

              <button
                onClick={() => onCopy(bookmarkUrl)}
                className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
              >
                <Copy01Icon size={14} className="text-white/50 flex-shrink-0" />
                <span className="truncate">{isCopied ? '已复制！' : '复制网址'}</span>
              </button>
            </div>
            <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />
          </>
        )}

        {/* 尺寸切换 */}
        {supportedSizes.length > 1 && (
          <>
            <div className="px-2.5 py-1 text-[10.5px] font-semibold text-white/40">
              更改尺寸
            </div>
            <div className="space-y-0.5">
              {supportedSizes.map((sz) => {
                const isActive = menuState.instance.size === sz;
                const sizeLabel =
                  sz === '1x1'
                    ? '小图标 (1x1)'
                    : sz === '1x2'
                    ? '双格竖卡 (1x2)'
                    : sz === '2x1'
                    ? '双格横卡 (2x1)'
                    : sz === '2x2'
                    ? '中方块 (2x2)'
                    : sz === '4x2'
                    ? '横幅卡 (4x2)'
                    : sz === '4x3'
                    ? '沉浸台 (4x3)'
                    : '大卡片 (4x4)';

                return (
                  <button
                    key={sz}
                    onClick={() => onSizeChange(sz)}
                    className={`w-full h-7 flex items-center justify-between px-2.5 rounded-[10px] text-[12px] transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400 font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{sizeLabel}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </button>
                );
              })}
            </div>
            <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />
          </>
        )}

        {/* 编辑模式入口 */}
        <div className="space-y-0.5">
          <button
            onClick={onEnterEditMode}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
          >
            <Menu01Icon size={14} className="text-white/50 flex-shrink-0" />
            <span className="truncate">编辑桌面布局</span>
          </button>
        </div>

        <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />

        {/* 移除组件 */}
        <div className="space-y-0.5">
          <button
            onClick={onRemove}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer text-left"
          >
            <Delete02Icon size={14} className="text-red-400/80 flex-shrink-0" />
            <span className="truncate">移除挂载</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
