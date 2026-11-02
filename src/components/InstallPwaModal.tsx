import React, { useEffect, useState } from 'react';
import {
  Apple,
  CheckCircle2,
  Download,
  Info,
  MoreVertical,
  PlusSquare,
  RefreshCw,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isMatchMedia =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches;
  // @ts-expect-error iOS Safari navigator.standalone
  const isIosStandalone = window.navigator.standalone === true;
  const isUrlPwa =
    window.location.search.includes('source=pwa') ||
    window.location.hash.includes('source=pwa');
  const isReferrerAndroidApp =
    typeof document !== 'undefined' && document.referrer.startsWith('android-app://');

  return Boolean(isMatchMedia || isIosStandalone || isUrlPwa || isReferrerAndroidApp);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__pwaInstallPrompt) {
      return window.__pwaInstallPrompt;
    }
    return null;
  });

  const [isStandalone, setIsStandalone] = useState<boolean>(() => checkIsStandalone());
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (checkIsStandalone()) return true;
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('pwa_installed') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const standaloneMode = checkIsStandalone();
    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      setIsInstalled(true);
      try {
        localStorage.setItem('pwa_installed', 'true');
      } catch {
        // ignore
      }
    }

    // Detekce OS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    setIsIos(iosDevice);
    setIsAndroid(androidDevice);

    // Kontrola instalovaných aplikací přes Chrome getInstalledRelatedApps API
    if ('getInstalledRelatedApps' in navigator) {
      // @ts-expect-error getInstalledRelatedApps
      navigator
        .getInstalledRelatedApps()
        .then((relatedApps: unknown[]) => {
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            setIsInstalled(true);
            try {
              localStorage.setItem('pwa_installed', 'true');
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {
          // API not available or rejected
        });
    }

    // Pokud už existuje prompt zachycený v index.html před hydratací Reactu
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    const handlePromptReady = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
      }
    };

    // Zachycení nativního instalačního promptu pro Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      // Pokud prohlížeč nabízí instalaci, aplikace není spuštěna jako standalone a nebyla dosud nainstalována
      if (!checkIsStandalone()) {
        setIsInstalled(false);
        try {
          localStorage.removeItem('pwa_installed');
        } catch {
          // ignore
        }
      }
    };

    const handleAppInstalled = () => {
      window.__pwaInstallPrompt = null;
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstalled(true);
      try {
        localStorage.setItem('pwa_installed', 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null);
    if (!prompt) {
      return 'unavailable';
    }
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch {
          // ignore
        }
        if (typeof window !== 'undefined') {
          window.__pwaInstallPrompt = null;
        }
      }
      return choice.outcome;
    } catch (err) {
      console.warn('Install prompt error:', err);
      return 'unavailable';
    }
  };

  return {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isIos,
    isAndroid,
    triggerInstall,
  };
}

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { deferredPrompt, isStandalone, isIos, triggerInstall } = usePwaInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIos ? 'ios' : 'android');
  const [isTriggering, setIsTriggering] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'dismissed' | 'manual';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isIos) {
      setActiveTab('ios');
    }
  }, [isIos]);

  if (!isOpen) return null;

  const handleAndroidClick = async () => {
    setIsTriggering(true);
    setStatusFeedback(null);

    const hasPrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__pwaInstallPrompt));

    if (hasPrompt) {
      const outcome = await triggerInstall();
      setIsTriggering(false);
      if (outcome === 'accepted') {
        setStatusFeedback({
          type: 'success',
          message: 'Instalace potvrzena! Aplikace se přidává na vaši plochu.',
        });
        setTimeout(onClose, 2500);
      } else if (outcome === 'dismissed') {
        setStatusFeedback({
          type: 'dismissed',
          message: 'Instalace byla zrušena. Můžete ji zkusit kdykoliv znovu.',
        });
      } else {
        // unavailable fallback
        setStatusFeedback({
          type: 'manual',
          message: 'Prohlížeč nepovolil otevření dialogu. Postupujte podle návodu níže.',
        });
        setShowManualSteps(true);
      }
    } else {
      // Prompt nebyl prohlížečem vydán (Chrome ho potlačil nebo zablokoval)
      setIsTriggering(false);
      setStatusFeedback({
        type: 'manual',
        message: 'Prohlížeč nepovolil automatické otevření dialogu. Nainstalujte aplikaci během 3 vteřin přes menu Chrome.',
      });
      setShowManualSteps(true);
    }
  };

  const isPromptReady = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__pwaInstallPrompt));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#221912] border border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1]">
              Nainstalovat aplikaci do mobilu
            </h2>
            <p className="text-xs text-[#A39284]">
              Kavárna U Sousedů • Rychlý přístup z plochy
            </p>
          </div>
        </div>

        {isStandalone && (
          <div className="mb-6 p-4 rounded-2xl bg-[#D89D60]/20 border border-[#D89D60] text-xs text-[#F5EBE1] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>
              Aplikace je již na tomto zařízení spuštěna jako plnohodnotná nainstalovaná PWA.
            </span>
          </div>
        )}

        {/* Přepínač platforem Android / iPhone */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#221912] border border-[#3E3025] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'android'
                ? 'bg-[#D89D60] text-[#1C140D]'
                : 'text-[#A39284] hover:text-[#F5EBE1]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-[#D89D60] text-[#1C140D]'
                : 'text-[#A39284] hover:text-[#F5EBE1]'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone (iOS)</span>
          </button>
        </div>

        {/* Obsah záložky: Android */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            {/* Stav detekce nativního promptu */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[#A39284]">Režim instalace:</span>
              {isPromptReady ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Rychlá instalace na 1 klik
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#221912] text-[#D89D60] border border-[#3E3025] text-[11px] font-medium">
                  <Info className="w-3.5 h-3.5" />
                  Přes menu Chrome (⋮)
                </span>
              )}
            </div>

            {/* Hlavní tlačítko */}
            <button
              type="button"
              onClick={() => void handleAndroidClick()}
              disabled={isTriggering}
              className="w-full py-3.5 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] active:scale-[0.98] text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#D89D60]/20 transition cursor-pointer disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>
                {isTriggering
                  ? 'Otevírám dialog...'
                  : isPromptReady
                    ? 'Nainstalovat aplikaci do mobilu'
                    : 'Spustit instalaci aplikace'}
              </span>
            </button>

            {/* Zpětná vazba po stisku tlačítka */}
            {statusFeedback?.type === 'success' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusFeedback.message}</span>
              </div>
            )}

            {statusFeedback?.type === 'dismissed' && (
              <div className="p-3.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs text-[#A39284] flex items-center gap-2.5 animate-in fade-in">
                <Info className="w-4 h-4 text-[#D89D60] shrink-0" />
                <span>{statusFeedback.message}</span>
              </div>
            )}

            {/* Detailní manuální postup při zablokování automatického dialogu */}
            {(showManualSteps || !isPromptReady || statusFeedback?.type === 'manual') && (
              <div className="p-4 rounded-2xl bg-[#D89D60]/10 border-2 border-[#D89D60] text-xs text-[#F5EBE1] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[#D89D60] font-bold text-sm">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Jak nainstalovat přes prohlížeč Chrome:</span>
                </div>
                <p className="text-xs text-[#A39284] leading-relaxed">
                  Chrome na Androidu potlačuje automatické vyskakování okna, pokud už aplikaci eviduje na ploše nebo v paměti. Můžete ji však kdykoliv nainstalovat přímo:
                </p>
                <div className="space-y-2 pt-1 font-medium text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                    <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="leading-snug">
                      Vpravo nahoře v prohlížeči klepněte na <strong>tři tečky (<MoreVertical className="w-3.5 h-3.5 inline text-[#D89D60]" />)</strong>.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                    <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="leading-snug">
                      Zvolte <strong>„Nainstalovat aplikaci“</strong> (nebo <strong>„Přidat na plochu“</strong>).
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                    <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="leading-snug">
                      Potvrďte tlačítkem <strong>„Nainstalovat“</strong>.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Informace o hlášce "Již nainstalována" */}
            <div className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] space-y-2 text-xs text-[#A39284] leading-relaxed">
              <div className="flex items-center gap-2 text-[#F5EBE1] font-semibold">
                <RefreshCw className="w-3.5 h-3.5 text-[#D89D60]" />
                <span>Píše vám telefon, že je aplikace již nainstalována?</span>
              </div>
              <p>
                Pokud máte na ploše zástupce, stačí jej smazat (odinstalovat) a přidat znovu, nebo otevřít přímo z plochy s novou kávovou ikonou.
              </p>
            </div>
          </div>
        )}

        {/* Obsah záložky: iPhone (iOS) */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs text-[#A39284] leading-relaxed space-y-3">
              <p className="font-semibold text-sm text-[#F5EBE1] flex items-center gap-2">
                <Apple className="w-4 h-4 text-[#D89D60]" />
                <span>Postup instalace pro iPhone (Safari):</span>
              </p>

              <div className="space-y-2.5 text-[#F5EBE1]">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                  <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Otevřete stránku v Safari</p>
                    <p className="text-[11px] text-[#A39284] mt-0.5">
                      Apple umožňuje instalaci webových aplikací pouze přes nativní prohlížeč Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                  <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium flex items-center gap-1.5">
                      <span>Klepněte na tlačítko</span>
                      <strong className="text-[#D89D60] inline-flex items-center gap-1">
                        Sdílet <Share2 className="w-3.5 h-3.5 inline" />
                      </strong>
                    </p>
                    <p className="text-[11px] text-[#A39284] mt-0.5">
                      Najdete jej dole uprostřed na navigační liště Safari (čtvereček se šipkou nahoru).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025]">
                  <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium flex items-center gap-1.5">
                      <span>Zvolte</span>
                      <strong className="text-[#D89D60] inline-flex items-center gap-1">
                        „Přidat na plochu“ <PlusSquare className="w-3.5 h-3.5 inline" />
                      </strong>
                    </p>
                    <p className="text-[11px] text-[#A39284] mt-0.5">
                      Sjeďte v nabídce o kousek dolů, klepněte na tuto možnost a vpravo nahoře potvrďte <strong>„Přidat“</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#D89D60]/10 border border-[#D89D60]/40 text-xs text-[#D89D60] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Aplikace se vám uloží na plochu s vlastní ikonou kávového zrnka a poběží na celou obrazovku.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
