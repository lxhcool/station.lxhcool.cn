import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cancel01Icon,
  Download01Icon,
  Upload01Icon,
  Copy01Icon,
  Tick02Icon,
  RefreshIcon,
} from 'hugeicons-react';
import { UserPreferences } from '../../types';
import { api } from '../../services/api';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [inputToken, setInputToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (!preferences.syncToken) return;
    navigator.clipboard.writeText(preferences.syncToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preferences, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `station-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onUpdatePreferences(parsed);
          setSyncStatus('配置恢复成功！');
          setTimeout(() => setSyncStatus(''), 2500);
        } else {
          alert('无效的配置文件格式');
        }
      } catch {
        alert('解析配置文件失败，请确保为合法的 JSON 文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyCustomToken = async () => {
    const token = inputToken.trim();
    if (!token) return;

    setSyncStatus('正在拉取配置...');
    const res = await api.pullConfig(token);
    if (res.success && res.data) {
      onUpdatePreferences({ ...res.data, syncToken: token });
      setSyncStatus('已同步远程配置！');
      setShowTokenInput(false);
      setInputToken('');
    } else {
      // 若该 token 尚无远程数据，则将本地数据绑定为此 token
      onUpdatePreferences({ syncToken: token });
      await api.pushConfig(token, preferences);
      setSyncStatus('已绑定新密钥并推送到云端！');
      setShowTokenInput(false);
      setInputToken('');
    }
    setTimeout(() => setSyncStatus(''), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-[440px] max-w-[94vw] rounded-[24px] modal-card-glow text-white p-6 space-y-4"
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold tracking-tight text-white/95">常规设置</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {/* 新标签页开启 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.05]">
              <div>
                <div className="text-[12.5px] text-white/90 font-medium">在新标签页打开</div>
                <div className="text-[11px] text-white/40 mt-0.5">搜索与访问书签时在新窗口中打开</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.openInNewTab}
                onChange={(e) => onUpdatePreferences({ openInNewTab: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 云端免密同步秘钥 (Sync Token) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] text-white/90 font-medium">云端同步密钥 (Sync Token)</div>
                  <div className="text-[10.5px] text-white/40 mt-0.5">多设备粘贴此密钥即可自动无缝漫游</div>
                </div>
                <button
                  onClick={handleCopyToken}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11px] text-white/85 font-medium transition-colors cursor-pointer"
                  title="复制同步密钥"
                >
                  {copied ? <Tick02Icon size={12} className="text-emerald-400" /> : <Copy01Icon size={12} />}
                  <span>{copied ? '已复制' : '复制'}</span>
                </button>
              </div>

              <div className="font-mono text-[11px] px-2.5 py-1.5 rounded-lg bg-black/40 text-emerald-400/90 break-all select-all">
                {preferences.syncToken || '正在生成...'}
              </div>

              {showTokenInput ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="粘贴已有的 Token 恢复配置..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleApplyCustomToken}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    恢复
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTokenInput(true)}
                  className="text-[11px] text-white/45 hover:text-white/80 transition-colors underline cursor-pointer"
                >
                  输入其他设备的密钥切换/恢复
                </button>
              )}
            </div>

            {/* 本地备份与恢复 */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.05] space-y-2">
              <div>
                <div className="text-[12.5px] text-white/90 font-medium">配置备份与导入</div>
                <div className="text-[10.5px] text-white/40 mt-0.5">将全部桌面布局、壁纸与书签保存为本地文件</div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleExportJson}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[11.5px] text-white/90 font-medium transition-colors cursor-pointer"
                >
                  <Download01Icon size={14} className="text-white/60" />
                  <span>导出备份 (.json)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[11.5px] text-white/90 font-medium transition-colors cursor-pointer"
                >
                  <Upload01Icon size={14} className="text-white/60" />
                  <span>导入恢复</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </div>

              {syncStatus && (
                <div className="text-center text-[11px] font-medium text-emerald-400 animate-pulse pt-0.5">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
