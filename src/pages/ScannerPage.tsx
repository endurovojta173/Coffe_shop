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
  LogOut,
  QrCode,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { ScanCardResult } from '../lib/database.types';

export const ScannerPage: React.FC = () => {
  const {
    currentUser,
    profiles,
    loyaltyLogs,
    scanCustomerCard,
    logout,
  } = useAppState();
  const navigate = useNavigate();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [lastResult, setLastResult] = useState<ScanCardResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const customerProfiles = profiles.filter((p) => p.role === 'customer');

  useEffect(() => {
    if (!manualCardNumber && customerProfiles.length > 0) {
      setManualCardNumber(customerProfiles[0].card_number);
    }
  }, [customerProfiles, manualCardNumber]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        void scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  const executeScan = async (cardNum: string) => {
    setScanError(null);
    const targetCard = cardNum.trim() || customerProfiles[0]?.card_number || '';
    if (!targetCard) {
      setScanError('Zadejte prosím číslo zákaznické karty (např. 0042 1187).');
      return;
    }

    try {
      const res = await scanCustomerCard(targetCard);
      setLastResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Chyba při načítání karty.';
      setScanError(msg);
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
          void executeScan(decodedText);
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
        'Kamera není v tomto prohlížeči/zařízení dostupná nebo nebyla povolena. Použijte tlačítko „Klepněte pro simulaci skenu“ níže.'
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col">
      {/* Horní lišta se jménem baristy a odhlášením přesně dle zadani.md */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-heading text-lg font-bold text-[#F5EBE1] block leading-none">
                U Sousedů • Pokladní skener
              </span>
              <span className="text-xs text-[#A39284]">
                RPC: <code className="text-[#D89D60]">scan_customer_card</code>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/home"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs text-[#A39284] hover:text-[#F5EBE1] transition"
            >
              Zákaznická část
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs text-[#A39284] hover:text-[#F5EBE1] transition"
              >
                Administrace
              </Link>
            )}

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025]">
              <UserCheck className="w-4 h-4 text-[#D89D60]" />
              <span className="text-xs font-semibold text-[#F5EBE1]">
                {currentUser?.full_name ?? 'Barista'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-4 py-1.5 rounded-full bg-[#221912] hover:border-[#D96B6B] border border-[#3E3025] text-xs font-medium text-[#A39284] hover:text-[#D96B6B] inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Odhlásit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Centrovaný čtvercový hledáček kamery (max-w-lg mx-auto) dle zadani.md */}
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Rozhraní pro baristy
            </span>
            <h1 className="text-3xl font-bold text-[#F5EBE1] mt-1">
              Načtení věrnostní karty
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Namiřte kameru na QR kód zákazníka nebo zadejte číslo karty
            </p>
          </div>

          {/* Karta se čtvercovým hledáčkem */}
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-3xl bg-[#221912] border-2 border-dashed border-[#D89D60]/60 overflow-hidden flex flex-col items-center justify-center">
              <div id="barista-qr-reader" className="w-full h-full" />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-48 h-48 relative flex items-center justify-center mb-4">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D89D60] rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#D89D60] rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#D89D60] rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D89D60] rounded-br-xl" />
                    <QrCode className="w-20 h-20 text-[#D89D60]/80" />
                  </div>
                  <p className="text-sm font-medium text-[#F5EBE1]">
                    Hledáček připraven ke skenování
                  </p>
                  <p className="text-xs text-[#A39284] mt-1">
                    Podporuje mobilní kameru i pokladní webkameru
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

            {/* Povinné fallback tlačítko "Klepněte pro simulaci skenu" přesně podle AGENTS.md */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void executeScan(manualCardNumber)}
                className="w-full py-4 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#D89D60]/25 transition transform active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Klepněte pro simulaci skenu</span>
              </button>

              <button
                type="button"
                onClick={() => void toggleCamera()}
                className="w-full py-3 px-5 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-semibold text-[#F5EBE1] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4 text-[#D96B6B]" />
                    <span>Vypnout kameru</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-[#D89D60]" />
                    <span>Spustit živou kameru</span>
                  </>
                )}
              </button>
            </div>

            {/* Výběr zákaznické karty nebo ruční zadání čísla */}
            <div className="pt-4 border-t border-[#3E3025] space-y-3">
              <label className="block text-xs font-medium text-[#A39284]">
                Číslo karty zákazníka:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCardNumber}
                  onChange={(e) => setManualCardNumber(e.target.value)}
                  placeholder="např. 0042 1187"
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#221912] border border-[#3E3025] text-sm font-mono text-[#F5EBE1] focus:outline-none focus:border-[#D89D60]"
                />
                <button
                  type="button"
                  onClick={() => void executeScan(manualCardNumber)}
                  className="px-5 py-2.5 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-semibold text-[#D89D60] transition cursor-pointer"
                >
                  Připsat bod
                </button>
              </div>

              {customerProfiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {customerProfiles.slice(0, 8).map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => setManualCardNumber(cust.card_number)}
                      className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                        manualCardNumber === cust.card_number
                          ? 'bg-[#D89D60]/20 border-[#D89D60] text-[#D89D60] font-semibold'
                          : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                      }`}
                    >
                      {cust.full_name} ({cust.card_number} • {cust.coffee_count}/10)
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Výsledek posledního skenu */}
          {scanError && (
            <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {lastResult && (
            <div
              className={`p-6 rounded-3xl border shadow-xl transition ${
                lastResult.reward_redeemed
                  ? 'bg-[#D89D60]/20 border-[#D89D60]'
                  : 'bg-[#2D221A] border-[#3E3025]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D89D60] text-[#1C140D] flex items-center justify-center shrink-0">
                    {lastResult.reward_redeemed ? (
                      <Star className="w-6 h-6 fill-current" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#D89D60] block">
                      Karta {lastResult.card_number}
                    </span>
                    <h2 className="text-xl font-bold text-[#F5EBE1]">
                      {lastResult.full_name}
                    </h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#D89D60] block">
                    {lastResult.new_count}/10
                  </span>
                  <span className="text-[11px] text-[#A39284]">
                    dříve {lastResult.previous_count}/10
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#F5EBE1] font-medium bg-[#221912] p-3.5 rounded-2xl border border-[#3E3025]">
                {lastResult.message}
              </p>
            </div>
          )}

          {/* Historie posledních skenů (loyalty_logs) */}
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5EBE1]">
                <History className="w-4 h-4 text-[#D89D60]" />
                <span>Poslední transakce (loyalty_logs)</span>
              </div>
              <span className="text-xs text-[#A39284]">
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
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#F5EBE1]">
                          {customer?.full_name ?? 'Zákazník'}
                        </span>
                        <span className="text-[#A39284] ml-2 font-mono">
                          ({customer?.card_number ?? '—'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold ${
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
    </div>
  );
};
