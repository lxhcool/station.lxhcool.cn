import React, { useState, useEffect, useRef } from 'react';
import { WallpaperConfig } from '../../types';

interface WallpaperBackgroundProps {
  config: WallpaperConfig;
}

interface WallpaperState {
  url: string;
  isAmbient: boolean;
}

const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.src = url;
    if (typeof img.decode === 'function') {
      img.decode().then(resolve).catch(() => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });
    } else {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    }
  });
};

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({ config }) => {
  const targetIsAmbient = config.type === 'ambient' || !config.url;
  const targetUrl = targetIsAmbient ? '' : config.url;

  // 底层当前壁纸状态（始终保持在底下，避免过渡期间露出黑色底色导致闪烁）
  const [current, setCurrent] = useState<WallpaperState>(() => ({
    url: targetUrl,
    isAmbient: targetIsAmbient,
  }));

  // 顶层新进入的壁纸状态（预加载完成后平滑淡入）
  const [incoming, setIncoming] = useState<WallpaperState | null>(null);
  const [incomingVisible, setIncomingVisible] = useState(false);

  // 切回柔光模式时，当前壁纸渐隐
  const [isCurrentFadingOut, setIsCurrentFadingOut] = useState(false);

  const currentRef = useRef(current);
  currentRef.current = current;

  const targetRef = useRef({ targetUrl, targetIsAmbient });
  targetRef.current = { targetUrl, targetIsAmbient };

  useEffect(() => {
    // 若当前已经是目标壁纸且无新壁纸正在进入，则无需过渡
    if (
      currentRef.current.isAmbient === targetIsAmbient &&
      currentRef.current.url === targetUrl &&
      !incoming
    ) {
      return;
    }

    let cancelled = false;
    let timerId: NodeJS.Timeout | null = null;
    let raf1: number | null = null;
    let raf2: number | null = null;

    // 1. 目标是柔光氛围背景：让当前图片壁纸平滑淡出，露出底层的柔光氛围
    if (targetIsAmbient) {
      if (currentRef.current.isAmbient) return;

      setIsCurrentFadingOut(true);
      timerId = setTimeout(() => {
        if (cancelled) return;
        setCurrent({ url: '', isAmbient: true });
        setIsCurrentFadingOut(false);
      }, 520);

      return () => {
        cancelled = true;
        if (timerId) clearTimeout(timerId);
      };
    }

    // 2. 目标是图片壁纸：预解码后，顶层无缝淡入，覆盖底层旧壁纸
    setIsCurrentFadingOut(false);
    preloadImage(targetUrl).then(() => {
      if (cancelled) return;

      // 挂载顶层新壁纸（初始透明度 0）
      setIncoming({ url: targetUrl, isAmbient: false });
      setIncomingVisible(false);

      // 双 rAF 确保浏览器完成首帧绘制后再触发 opacity 0 -> 1 动画，杜绝白屏或黑屏闪烁
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (cancelled) return;
          setIncomingVisible(true);
        });
      });

      // 动画完成后（500ms），将底层提升为新壁纸，清理顶层图层
      timerId = setTimeout(() => {
        if (cancelled) return;
        setCurrent({ url: targetUrl, isAmbient: false });
        setIncoming(null);
        setIncomingVisible(false);
      }, 520);
    });

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [targetUrl, targetIsAmbient]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. 恒定存在的底层极光柔光流光背景（纯 GPU 硬件加速，超慢呼吸流动） */}
      <div className="ambient-container">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
        <div className="ambient-blob ambient-blob-4" />
      </div>
      <div className="ambient-shade" />

      {/* 2. 底层壁纸（切换图片时保持 100% 不透明，杜绝交叉淡化中间时段的亮度塌陷闪烁） */}
      {!current.isAmbient && current.url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
          style={{
            backgroundImage: `url("${current.url}")`,
            filter: `blur(${config.blur}px) brightness(${config.brightness || 1})`,
            transform: config.blur > 0 ? 'scale(1.08)' : 'scale(1)',
            opacity: isCurrentFadingOut ? 0 : 1,
          }}
        >
          {/* 单独跟随壁纸图层的专属遮罩 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(17, 19, 27, ${config.maskOpacity})`,
            }}
          />
        </div>
      )}

      {/* 3. 顶层新壁纸（预载解码后从 opacity 0 -> 1 平滑覆盖上来） */}
      {incoming && incoming.url && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
          style={{
            backgroundImage: `url("${incoming.url}")`,
            filter: `blur(${config.blur}px) brightness(${config.brightness || 1})`,
            transform: config.blur > 0 ? 'scale(1.08)' : 'scale(1)',
            opacity: incomingVisible ? 1 : 0,
          }}
        >
          {/* 单独跟随壁纸图层的专属遮罩 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(17, 19, 27, ${config.maskOpacity})`,
            }}
          />
        </div>
      )}
    </div>
  );
};
