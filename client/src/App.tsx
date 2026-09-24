import React, { useState } from 'react';
import { usePreferences } from './hooks/usePreferences';
import { WallpaperBackground } from './components/wallpaper/WallpaperBackground';
import { WallpaperSettingsModal } from './components/wallpaper/WallpaperSettingsModal';
import { SettingsDropdown } from './components/settings/SettingsDropdown';
import { SearchPreferencesModal } from './components/search/SearchPreferencesModal';
import { GeneralSettingsModal } from './components/settings/GeneralSettingsModal';
import { InfoModal } from './components/settings/InfoModal';
import { SearchBar } from './components/search/SearchBar';
import { DigitalClock } from './components/common/DigitalClock';
import { WidgetCanvas } from './components/widgets/WidgetCanvas';
import { AddWidgetModal } from './components/widgets/AddWidgetModal';
import { WidgetInstance } from './types/widget';

export function App() {
  const { preferences, updatePreferences } = usePreferences();

  // 弹窗状态
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'extension' | null>(null);

  const handleAddWidget = (widget: Omit<WidgetInstance, 'id'>) => {
    const newWidget: WidgetInstance = {
      ...widget,
      id: 'w_' + Date.now().toString(36),
    };
    updatePreferences({
      widgets: [...(preferences.widgets || []), newWidget],
    });
  };

  const handleUpdateWidgets = (newWidgets: WidgetInstance[]) => {
    updatePreferences({ widgets: newWidgets });
  };

  return (
    <div className="relative h-screen h-[100svh] w-screen overflow-hidden flex flex-col justify-between">
      {/* 1. 核心壁纸与柔光模糊滤镜引擎 */}
      <WallpaperBackground config={preferences.wallpaper} />

      {/* 2. 顶部微操作栏：右上角仅保留唯一个性化【齿轮设置图标】 */}
      <header className="fixed top-0 inset-x-0 z-30 px-7 py-5 flex items-center justify-end pointer-events-auto">
        <SettingsDropdown
          onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenGeneral={() => setIsGeneralModalOpen(true)}
          onOpenAbout={() => setInfoModalType('about')}
          onOpenExtension={() => setInfoModalType('extension')}
        />
      </header>

      {/* 3. 屏幕上半区：明亮通透的柔光玻璃搜索框与可挂载平板风格组件画板 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-[6vh] px-4 w-full max-w-[1020px] mx-auto overflow-y-auto no-scrollbar">
        {/* 顶部点阵数字时钟 (采用 SquareDotMatrix Tight 字体) */}
        <DigitalClock className="mb-7" />

        <SearchBar
          activeEngineId={preferences.activeEngineId}
          onEngineChange={(id) => updatePreferences({ activeEngineId: id })}
          openInNewTab={preferences.openInNewTab}
        />

        <WidgetCanvas
          widgets={preferences.widgets || []}
          openInNewTab={preferences.openInNewTab}
          onUpdateWidgets={handleUpdateWidgets}
          onOpenAddModal={() => setIsAddWidgetOpen(true)}
        />
      </main>

      {/* 4. 480px 竖向壁纸偏好弹窗 (参考图 2 样式) */}
      <WallpaperSettingsModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        config={preferences.wallpaper}
        onChange={(newConfig) => updatePreferences({ wallpaper: newConfig })}
      />

      {/* 5. 搜索引擎偏好弹窗 */}
      <SearchPreferencesModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        activeEngineId={preferences.activeEngineId}
        onEngineChange={(id) => updatePreferences({ activeEngineId: id })}
        openInNewTab={preferences.openInNewTab}
        onToggleNewTab={(open) => updatePreferences({ openInNewTab: open })}
      />

      {/* 6. 常规偏好弹窗 */}
      <GeneralSettingsModal
        isOpen={isGeneralModalOpen}
        onClose={() => setIsGeneralModalOpen(false)}
        openInNewTab={preferences.openInNewTab}
        onToggleNewTab={(open) => updatePreferences({ openInNewTab: open })}
      />

      {/* 7. 关于与扩展信息弹窗 */}
      <InfoModal
        isOpen={infoModalType !== null}
        onClose={() => setInfoModalType(null)}
        type={infoModalType || 'about'}
      />

      {/* 8. 添加桌面组件画廊弹窗 */}
      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}

export default App;
