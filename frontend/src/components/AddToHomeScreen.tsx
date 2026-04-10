import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'add-to-home-screen-dismissed';

// 检测是否为移动设备
function checkIsMobile(): boolean {
  return window.innerWidth < 768 || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
}

// 检测是否为 iOS
function checkIsIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showiOSGuide, setShowiOSGuide] = useState(false);

  useEffect(() => {
    // 只显示一次
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!checkIsMobile()) return;

    setIsVisible(true);

    // iOS 不支持 beforeinstallprompt
    if (checkIsIOS()) return;

    // Android: 监听 beforeinstallprompt 事件
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleInstall = async () => {
    // 点击后立即隐藏
    handleDismiss();

    // iOS: 显示添加桌面指南
    if (checkIsIOS()) {
      setShowiOSGuide(true);
      return;
    }

    // Android
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setDeferredPrompt(null);
  };

  if (!isVisible && !showiOSGuide) return null;

  return (
    <>
      {/* iOS 添加桌面指南 */}
      {showiOSGuide && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowiOSGuide(false)}>
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">添加到主屏幕</h3>
            <div className="space-y-3 text-sm">
              <p>1. 点击 Safari 底部的 <strong>分享按钮</strong> <Share2 className="w-4 h-4 inline" /></p>
              <p>2. 向下滚动，找到 <strong>「添加到主屏幕」</strong></p>
              <p>3. 点击右上角的 <strong>「添加」</strong> 完成</p>
            </div>
            <Button className="w-full" onClick={() => setShowiOSGuide(false)}>
              知道了
            </Button>
          </div>
        </div>
      )}

      {isVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={handleInstall}
            className="shadow-lg gap-2 rounded-full px-6 gradient-festive"
            size="lg"
          >
            <Share2 className="w-5 h-5" />
            添加到桌面
          </Button>
        </div>
      )}
    </>
  );
}
