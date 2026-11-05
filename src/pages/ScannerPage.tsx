import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Coffee,
  History,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  Star,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CoffeeBeanIcon } from '../components/CoffeeBeanIcon';
import { supabase } from '../lib/supabase';
import { getLoyaltyStatus } from '../lib/loyalty';
import type { ScanCardResult } from '../lib/database.types';

interface ModalCustomerState {
  id: string;
  card_number: string;
  full_name: string;
  coffee_count: number;
}

export const ScannerPage: React.FC = () => {
  const {
    currentUser,
    profiles,
    loyaltyLogs,
    scanCustomerCard,
    redeemCustomerReward,
    logout,
  } = useAppState();
  const navigate = useNavigate();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  // Defaultně prázdné pole – nezobrazuje se žádné předvyplněné číslo zákaznické karty
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [lastResult, setLastResult] = useState<ScanCardResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Stav modálního okna po naskenování karty
  const [scannedCustomer, setScannedCustomer] = useState<ModalCustomerState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<ScanCardResult | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const customerProfiles = profiles.filter((p) => p.role === 'customer');

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        void scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'TN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Vyhledání zákazníka a otevření modálního okna
  const handleLookupCustomer = async (cardNumber: string) => {
    setScanError(null);
    const normalized = cardNumber.replace(/\s+/g, '').trim();
    if (!normalized) {
      setScanError('Zadejte prosím číslo zákaznické karty (např. 0042 1187).');
      return;
    }

    // 1. Zkusit najít v lokálním seznamu profilů
    let found = customerProfiles.find(
      (p) => p.card_number.replace(/\s+/g, '') === normalized
    );

    // 2. Pokud není v lokálním stavu, dotázat se přímo Supabase
    if (!found && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .ilike('card_number', `%${normalized}%`)
        .maybeSingle();
      if (data) {
        found = data;
      }
    }

    if (found) {
      setScannedCustomer({
        id: found.id,
        card_number: found.card_number,
        full_name: found.full_name,
        coffee_count: found.coffee_count,
      });
      setActionResult(null);
    } else {
      setScanError(`Zákaznická karta s číslem "${cardNumber}" nebyla v systému nalezena.`);
    }
  };

  // Připsání bodu za kávu (+1 káva) – zákazník může sbírat i nad 10 káv
  const handleAddCoffee = async (cardNumber: string) => {
    setActionLoading(true);
    setScanError(null);
    try {
      const res = await scanCustomerCard(cardNumber);
      setActionResult(res);
      setLastResult(res);

      if (res.reward_redeemed && res.new_count === 0 && scannedCustomer && scannedCustomer.coffee_count >= 9) {
        setScanError(
          'Upozornění: Vaše databáze Supabase stále běží na původní verzi funkce scan_customer_card, která při 10 kávách počítadlo vynulovala. Vložte a spusťte prosím SQL skript v Supabase SQL Editoru, aby se káva nevynulovala a zákazník mohl sbírat více jak 10 káv.'
        );
      }

      // Aktualizace lokálního počítadla v modálu dle výsledku
      setScannedCustomer((prev) =>
        prev
          ? {
              ...prev,
              coffee_count: res.new_count,
            }
          : null
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Chyba při připsání kávy.';
      setScanError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Uplatnění 1 kávy zdarma (-10 káv) – pouze pokud má zákazník >= 10 káv
  const handleRedeemReward = async (cardNumber: string) => {
    setActionLoading(true);
    setScanError(null);
    try {
      const res = await redeemCustomerReward(cardNumber);
      setActionResult(res);
      setLastResult(res);

      // Aktualizace lokálního počítadla v modálu dle výsledku
      setScannedCustomer((prev) =>
        prev
          ? {
              ...prev,
              coffee_count: res.new_count,
            }
          : null
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Chyba při uplatnění odměny.';
      setScanError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCamera = async () => {
    setCameraError(null);

    if (cameraActive && scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore stop error
      }
      setCameraActive(false);
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode('barista-qr-reader');
      scannerRef.current = html5QrCode;
      setCameraActive(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          void handleLookupCustomer(decodedText);
          void html5QrCode.stop().catch(() => undefined);
          setCameraActive(false);
        },
        () => {
          // ignore frame decode misses
        }
      );
    } catch {
      setCameraActive(false);
      setCameraError(
        'Kamera není v tomto prohlížeči/zařízení dostupná nebo nebyla povolena. Můžete zadat číslo karty ručně níže.'
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col w-full overflow-x-hidden">
      {/* Horní lišta: Barista avatar + název + pouze ikona odhlášení (žádný horizontální scroll) */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Vlevo: Barista avatar s iniciálami a jménem */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#221912] border border-[#3E3025] flex items-center justify-center text-xs font-bold text-[#D89D60] shrink-0">
              {getInitials(currentUser?.full_name)}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#F5EBE1] truncate">
              {currentUser?.full_name ?? 'Barista'}
            </span>
          </div>

          {/* Uprostřed: Logo kavárny */}
          <div className="flex items-center gap-2 shrink-0 px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025]">
            <div className="w-6 h-6 rounded-full bg-[#D89D60]/20 flex items-center justify-center text-[#D89D60]">
              <CoffeeBeanIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif-heading text-sm sm:text-base font-bold text-[#F5EBE1] tracking-wide">
              U Sousedů
            </span>
          </div>

          {/* Vpravo: Odkazy na sekce (desktop) + pouze ikona odhlášení (bez nápisu) */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/app/home"
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs text-[#A39284] hover:text-[#F5EBE1] transition"
            >
              Zákaznická část
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs text-[#A39284] hover:text-[#F5EBE1] transition"
              >
                Administrace
              </Link>
            )}

            {/* Místo nápisu odhlásit pouze zanechat ikonu dle zadání */}
            <button
              type="button"
              onClick={() => void handleLogout()}
              title="Odhlásit se"
              aria-label="Odhlásit se"
              className="w-9 h-9 rounded-full bg-[#221912] hover:border-[#D96B6B] border border-[#3E3025] text-[#A39284] hover:text-[#D96B6B] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Pokladní skener
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              Načtení věrnostní karty
            </h1>
            <p className="text-xs sm:text-sm text-[#A39284] mt-1">
              Namiřte kameru na QR kód zákazníka nebo zadejte číslo karty
            </p>
          </div>

          {/* Karta se čtvercovým hledáčkem */}
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Skenovací oblast – sken lze spustit i kliknutím přímo na ni */}
            <div
              onClick={() => void toggleCamera()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  void toggleCamera();
                }
              }}
              title={cameraActive ? 'Klepnutím zastavíte skenování' : 'Klepnutím spustíte skenování'}
              aria-label={cameraActive ? 'Zastavit skenování' : 'Spustit skenování'}
              className="relative aspect-square w-full max-w-sm mx-auto rounded-3xl bg-[#221912] border-2 border-dashed border-[#D89D60]/60 hover:border-[#D89D60] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition group"
            >
              <div id="barista-qr-reader" className="w-full h-full" />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex items-center justify-center mb-3">
                    <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-[#D89D60] rounded-tl-xl transition group-hover:scale-105" />
                    <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-[#D89D60] rounded-tr-xl transition group-hover:scale-105" />
                    <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-[#D89D60] rounded-bl-xl transition group-hover:scale-105" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-[#D89D60] rounded-br-xl transition group-hover:scale-105" />
                    <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-[#D89D60]/80 group-hover:text-[#D89D60] transition" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                    Klepnutím sem spustíte skenování
                  </p>
                  <p className="text-[11px] text-[#A39284] mt-1">
                    Nebo použijte tlačítko Skenovat níže
                  </p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3.5 rounded-2xl bg-[#221912] border border-[#D89D60]/50 text-xs text-[#A39284] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#D89D60] shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Pouze tlačítko Skenovat */}
            <div>
              <button
                type="button"
                onClick={() => void toggleCamera()}
                className={`w-full py-3.5 sm:py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl transition transform active:scale-[0.99] cursor-pointer ${
                  cameraActive
                    ? 'bg-[#221912] hover:border-[#D96B6B] border border-[#3E3025] text-[#D96B6B]'
                    : 'bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] shadow-[#D89D60]/25'
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#D96B6B]" />
                    <span>Zastavit skenování</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Skenovat</span>
                  </>
                )}
              </button>
            </div>

            {/* Ruční vyhledání čísla karty zákazníka bez předvyplněné hodnoty */}
            <div className="pt-4 border-t border-[#3E3025] space-y-2.5">
              <label className="block text-xs font-medium text-[#A39284]">
                Zadat číslo karty ručně:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCardNumber}
                  onChange={(e) => setManualCardNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleLookupCustomer(manualCardNumber);
                    }
                  }}
                  placeholder="např. 0042 1187"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-[#221912] border border-[#3E3025] text-xs sm:text-sm font-mono text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
                <button
                  type="button"
                  onClick={() => void handleLookupCustomer(manualCardNumber)}
                  className="px-4 sm:px-5 py-2.5 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-semibold text-[#D89D60] transition cursor-pointer shrink-0"
                >
                  Vyhledat
                </button>
              </div>
            </div>
          </div>

          {/* Chybová zpráva při vyhledávání */}
          {scanError && (
            <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-xs sm:text-sm text-[#F5EBE1] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Poslední výsledek připsání na pozadí */}
          {lastResult && !scannedCustomer && (
            <div
              className={`p-5 rounded-3xl border shadow-xl transition ${
                lastResult.reward_redeemed
                  ? 'bg-[#D89D60]/20 border-[#D89D60]'
                  : 'bg-[#2D221A] border-[#3E3025]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D89D60] text-[#1C140D] flex items-center justify-center shrink-0">
                    {lastResult.reward_redeemed ? (
                      <Star className="w-5 h-5 fill-current" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#D89D60] block">
                      Karta {lastResult.card_number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#F5EBE1]">
                      {lastResult.full_name}
                    </h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#D89D60] block">
                    {lastResult.new_count}/10
                  </span>
                  <span className="text-[10px] text-[#A39284]">
                    dříve {lastResult.previous_count}/10
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#F5EBE1] font-medium bg-[#221912] p-3 rounded-xl border border-[#3E3025]">
                {lastResult.message}
              </p>
            </div>
          )}

          {/* Historie posledních skenů (loyalty_logs) */}
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#F5EBE1]">
                <History className="w-4 h-4 text-[#D89D60]" />
                <span>Poslední transakce</span>
              </div>
              <span className="text-[11px] text-[#A39284]">
                Celkem {loyaltyLogs.length} záznamů
              </span>
            </div>

            {loyaltyLogs.length === 0 ? (
              <p className="text-xs text-[#A39284] py-2">
                Zatím nebyly zaznamenány žádné transakce.
              </p>
            ) : (
              <div className="space-y-2">
                {loyaltyLogs.slice(0, 6).map((log) => {
                  const customer = profiles.find((p) => p.id === log.customer_id);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-[#F5EBE1] truncate block">
                          {customer?.full_name ?? 'Zákazník'}
                        </span>
                        <span className="text-[#A39284] font-mono text-[11px]">
                          {customer?.card_number ?? '—'}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                            log.action === 'redeem_reward'
                              ? 'bg-[#D89D60] text-[#1C140D]'
                              : 'bg-[#2D221A] text-[#D89D60] border border-[#3E3025]'
                          }`}
                        >
                          {log.action === 'redeem_reward'
                            ? '10. káva ZDARMA'
                            : '+1 bod'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODÁLNÍ OKNO PO NASKENOVÁNÍ DLE FIGMA NÁVRHU                              */}
      {/* ========================================================================= */}
      {scannedCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setScannedCustomer(null);
              setActionResult(null);
            }
          }}
        >
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            {/* Záhlaví modálu: Číslo kartičky + Jméno + Křížek */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A39284]">
                ČÍSLO KARTIČKY
              </span>
              <div className="flex items-start justify-between gap-3 mt-0.5">
                <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F5EBE1] leading-tight">
                  {scannedCustomer.card_number} • {scannedCustomer.full_name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setScannedCustomer(null);
                    setActionResult(null);
                  }}
                  className="p-1 rounded-full text-[#A39284] hover:text-[#F5EBE1] hover:bg-[#221912] transition cursor-pointer shrink-0 mt-0.5"
                  aria-label="Zavřít"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Obsah modálu přesně dle návrhu */}
            {(() => {
              const status = getLoyaltyStatus(scannedCustomer.coffee_count, 'cs');
              return (
                <div className="mt-4 space-y-4">
                  {/* Tmavá vložená lišta: káva | X/10 */}
                  <div className="bg-[#221912] rounded-2xl px-5 py-3.5 flex items-center justify-between border border-[#3E3025]/50">
                    <span className="text-sm font-medium text-[#F5EBE1]">káva</span>
                    <span className="text-sm sm:text-base font-bold text-[#F5EBE1]">
                      {scannedCustomer.coffee_count < 10
                        ? `${scannedCustomer.coffee_count}/10`
                        : scannedCustomer.coffee_count === 10
                        ? '10/10'
                        : `${scannedCustomer.coffee_count} káv`}
                    </span>
                  </div>

                  {/* Grid 10 razítek v rozložení 5x2 přímo na pozadí karty */}
                  <div className="grid grid-cols-5 gap-3 justify-items-center py-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const isStamped =
                        scannedCustomer.coffee_count >= 10
                          ? true
                          : idx < scannedCustomer.coffee_count;
                      const isLast = idx === 9;
                      return (
                        <div
                          key={idx}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                            isStamped
                              ? 'bg-[#D89D60] text-[#1C140D] shadow-sm'
                              : 'bg-[#221912] border border-dashed border-[#554233] text-[#554233]'
                          }`}
                        >
                          {isStamped ? (
                            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          ) : isLast ? (
                            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Text: Do kávy zdarma zbývá X / Máte nárok na X káv zdarma */}
                  <div className="text-center py-1">
                    <p className="font-serif-heading text-base sm:text-lg text-[#F5EBE1]">
                      {status.customerText}
                    </p>
                  </div>

                  {/* Notifikace výsledku akce (pokud proběhla) */}
                  {actionResult && (
                    <div
                      className={`p-3 rounded-2xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
                        actionResult.reward_redeemed
                          ? 'bg-[#D89D60]/20 border-[#D89D60] text-[#D89D60] font-semibold'
                          : 'bg-[#221912] border-[#D89D60]/50 text-[#F5EBE1]'
                      }`}
                    >
                      {actionResult.reward_redeemed ? (
                        <Star className="w-4 h-4 text-[#D89D60] fill-current shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#D89D60] shrink-0" />
                      )}
                      <span className="leading-snug">{actionResult.message}</span>
                    </div>
                  )}

                  {/* Tlačítka dole: Káva zdarma + Přidat kávu dle návrhu */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={status.freeCoffees === 0 || actionLoading}
                      onClick={() => void handleRedeemReward(scannedCustomer.card_number)}
                      className={`py-3.5 px-4 rounded-full text-xs sm:text-sm font-medium transition flex items-center justify-center text-center ${
                        status.freeCoffees > 0
                          ? 'bg-[#2D221A] hover:bg-[#D89D60] hover:text-[#1C140D] border-2 border-[#D89D60] text-[#D89D60] cursor-pointer shadow-lg shadow-[#D89D60]/20 active:scale-95 font-bold'
                          : 'bg-[#221912] border border-[#3E3025] text-[#A39284]/50 cursor-not-allowed'
                      }`}
                    >
                      <span>
                        {status.freeCoffees > 1
                          ? `Káva zdarma (${status.freeCoffees})`
                          : 'Káva zdarma'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleAddCoffee(scannedCustomer.card_number)}
                      className="py-3.5 px-4 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl shadow-[#D89D60]/25 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 text-center"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                      <span>Přidat kávu</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
