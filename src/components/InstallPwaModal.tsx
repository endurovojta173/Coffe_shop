import React, { useEffect, useState } from 'react';
import {
  Apple,
  CheckCircle2,
  Download,
  Info,
  MoreVertical,
  PlusSquare,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detekce standalone režimu (aplikace už běží nainstalovaná na ploše)
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari navigator.standalone
      window.navigator.standalone === true;
    setIsStandalone(standaloneMode);

    // Detekce OS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    setIsIos(iosDevice);
    setIsAndroid(androidDevice);

    // Zachycení nativního instalačního promptu pro Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      return 'unavailable';
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    return choice.outcome;
  };

  return {
    deferredPrompt,
    isStandalone,
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
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isIos) {
      setActiveTab('ios');
    }
  }, [isIos]);

  if (!isOpen) return null;

  const handleAndroidClick = async () => {
    setInstallStatus(null);
    if (deferredPrompt) {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        setInstallStatus('Instalace proběhla úspěšně!');
        setTimeout(onClose, 2000);
      }
    } else {
      setInstallStatus('prompt_unavailable');
    }
  };

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
            <button
              type="button"
              onClick={() => void handleAndroidClick()}
              className="w-full py-3.5 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#D89D60]/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Nainstalovat aplikaci (Android)</span>
            </button>

            {installStatus === 'Instalace proběhla úspěšně!' && (
              <div className="p-3.5 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-xs text-[#F5EBE1] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D89D60]" />
                <span>{installStatus}</span>
              </div>
            )}

            {/* Vysvětlení hlášky "Aplikace je již nainstalována" na Androidu */}
            <div className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] space-y-2.5 text-xs text-[#A39284] leading-relaxed">
              <div className="flex items-center gap-2 text-[#D89D60] font-semibold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Píše vám Android, že je aplikace již nainstalována?</span>
              </div>
              <p>
                To se stává, když jste si dříve přidali zástupce na plochu nebo ji Chrome má v paměti:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-[#F5EBE1]">
                <li>
                  <strong>Zkontrolujte plochu telefonu:</strong> Vyhledejte ikonu s šálkem kávy a názvem <em>„U Sousedů“</em>. Pokud ji tam máte, můžete ji rovnou otevřít!
                </li>
                <li>
                  <strong>Ruční přidání přes menu Chrome:</strong> V prohlížeči Chrome klepněte vpravo nahoře na <strong>tři tečky (<MoreVertical className="w-3.5 h-3.5 inline text-[#D89D60]" />)</strong> a vyberte <strong>„Nainstalovat aplikaci“</strong> nebo <strong>„Přidat na plochu“</strong>.
                </li>
              </ol>
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
              <span>Aplikace se vám uloží na plochu s vlastní ikonou a otevře se na celou obrazovku bez lišt prohlížeče.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
