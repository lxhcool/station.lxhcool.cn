import React from 'react';

export type WidgetSize = '1x1' | '1x2' | '2x1' | '2x2' | '4x2' | '4x3' | '4x4';

export interface WidgetStrategy<TConfig = any> {
  type: string;                    // 组件类型唯一标识，如 'bookmark' | 'weather' | 'calendar' | 'hotboard'
  name: string;                    // 友好名称，如 '快捷书签' | '实时天气' | '日历日程' | '热点榜单'
  description: string;             // 简短描述
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultSize: WidgetSize;         // 默认添加时的尺寸
  supportedSizes: WidgetSize[];    // 该组件支持的所有尺寸
  defaultConfig: TConfig;          // 默认独立配置
  render: React.ComponentType<{
    instance: WidgetInstance<TConfig>;
    size: WidgetSize;
    openInNewTab?: boolean;
    isEditing?: boolean;
    onUpdateConfig?: (cfg: Partial<TConfig>) => void;
  }>;
}

export interface WidgetInstance<TConfig = any> {
  id: string;                      // 唯一实例 ID
  type: string;                    // 对应 WidgetStrategy.type
  size: WidgetSize;                // 当前渲染尺寸
  config: TConfig;                 // 实例专属配置
  layout?: { x: number; y: number }; // 网格物理坐标 (可选)
}
