import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Coffee,
  Download,
  Heart,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { InstallPwaModal, usePwaInstall } from '../components/InstallPwaModal';

export const CustomerMorePage: React.FC = () => {
  const { currentUser, messages, updateCurrentUserProfile } = useAppState();
  const { isInstalled } = usePwaInstall();
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  const notifyEvents = currentUser?.notify_events ?? true;
  const notifyMessages = currentUser?.notify_messages ?? true;
  const gdprConsent = currentUser?.gdpr_consent ?? true;

  const toggleSetting = (
    key: 'notify_events' | 'notify_messages' | 'gdpr_consent',
    currentVal: boolean
  ) => {
    void updateCurrentUserProfile({ [key]: !currentVal });
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
          Příběh kavárny & soukromí
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1">
          Další informace a nastavení
        </h1>
      </div>

      {/* Mobil: sekce pod sebou -> Desktop: md:grid-cols-2 gap-8 (dle AGENTS.md) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Levý sloupec na desktopu: Karta "O nás" s fotografií kavárny */}
        <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl overflow-hidden shadow-xl">
          <div className="relative h-64 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"
              alt="Kavárna U Sousedů interiér"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D221A] via-[#2D221A]/30 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C140D]/90 border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#D89D60] font-semibold">
                  Od roku 2019
                </span>
                <h2 className="text-2xl font-bold text-[#F5EBE1]">O nás</h2>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4 text-sm text-[#A39284] leading-relaxed">
            <p className="text-[#F5EBE1] font-medium text-base">
              Jsme rodinná kavárna „U Sousedů“, kde věříme, že nejlepší káva chutná tam,
              kde vás znají jménem.
            </p>
            <p>
              Každý týden pro vás vybíráme čerstvě pražená zrna z malých evropských i českých
              pražíren. Na mlýnku u nás vždy najdete jak vyvážené espresso s čokoládovo-oříškovým
              profilem, tak ovocnější výběrovou kávu na filtr.
            </p>
            <p>
              Všechny koláče, kváskový chléb i lívance připravujeme přímo v naší kuchyni
              z poctivých surovin od lokálních farmářů.
            </p>

            <div className="pt-4 border-t border-[#3E3025] flex items-center gap-3 text-xs text-[#D89D60]">
              <Heart className="w-4 h-4 fill-current shrink-0" />
              <span>Děkujeme, že jste součástí naší sousedské komunity!</span>
            </div>
          </div>
        </section>

        {/* Pravý sloupec na desktopu: "Instalace aplikace", "Zprávy a upozornění" a "Správa souhlasů" */}
        <div className="space-y-8">
          {/* Karta Instalace mobilní aplikace (Android & iPhone) */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EBE1]">
                  Aplikace pro mobilní telefony
                </h2>
                <p className="text-xs text-[#A39284]">
                  Dostupné pro Android i iPhone (iOS)
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A39284] leading-relaxed">
              Mějte věrnostní kartičku vždy po ruce přímo na ploše telefonu. Funguje
              bleskově i bez čekání na otevírání prohlížeče.
            </p>

            {isInstalled ? (
              <div className="w-full py-3 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aplikace je nainstalována na tomto zařízení</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsInstallOpen(true)}
                className="w-full py-3 px-5 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D89D60]/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Nainstalovat aplikaci do mobilu</span>
              </button>
            )}
          </section>

          {/* Karta Zprávy a upozornění */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#F5EBE1]">
                  Zprávy a upozornění
                </h2>
                <p className="text-xs text-[#A39284]">
                  Nastavení notifikací a aktuality z kavárny
                </p>
              </div>
            </div>

            {/* Přepínače (toggles) pro notifikace */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#221912] border border-[#3E3025]">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#F5EBE1]">
                    Upozornění na nové akce a cuppingy
                  </p>
                  <p className="text-xs text-[#A39284] mt-0.5">
                    Dáme vám vědět o chystaných koncertech a degustacích
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyEvents}
                  onClick={() => toggleSetting('notify_events', notifyEvents)}
                  className={`w-12 h-7 rounded-full transition p-1 cursor-pointer shrink-0 ${
                    notifyEvents ? 'bg-[#D89D60]' : 'bg-[#1C140D] border border-[#3E3025]'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full transition transform ${
                      notifyEvents
                        ? 'translate-x-5 bg-[#1C140D]'
                        : 'translate-x-0 bg-[#A39284]'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#221912] border border-[#3E3025]">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#F5EBE1]">
                    Zprávy z kavárny a speciální nabídky
                  </p>
                  <p className="text-xs text-[#A39284] mt-0.5">
                    Informace o nové kávě na mlýnku a dvojnásobných bodech
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyMessages}
                  onClick={() => toggleSetting('notify_messages', notifyMessages)}
                  className={`w-12 h-7 rounded-full transition p-1 cursor-pointer shrink-0 ${
                    notifyMessages ? 'bg-[#D89D60]' : 'bg-[#1C140D] border border-[#3E3025]'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full transition transform ${
                      notifyMessages
                        ? 'translate-x-5 bg-[#1C140D]'
                        : 'translate-x-0 bg-[#A39284]'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Výpis aktualit (app_messages) */}
            <div className="pt-4 border-t border-[#3E3025] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D89D60]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nejnovější zprávy v aplikaci</span>
              </div>

              <div className="space-y-3">
                {messages.map((msg) => (
                  <article
                    key={msg.id}
                    className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#F5EBE1]">
                        {msg.title}
                      </h3>
                      <span className="text-[11px] text-[#A39284] whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#A39284] leading-relaxed">
                      {msg.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Karta Správa souhlasů (GDPR) */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#F5EBE1]">
                  Správa souhlasů
                </h2>
                <p className="text-xs text-[#A39284]">
                  Ochrana osobních údajů a nastavení GDPR
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#221912] border border-[#3E3025]">
              <div className="pr-4">
                <p className="text-sm font-medium text-[#F5EBE1]">
                  Souhlas se zpracováním údajů pro věrnostní program (GDPR)
                </p>
                <p className="text-xs text-[#A39284] mt-0.5">
                  Uchováváme pouze váš e-mail, jméno a počet nasbíraných káv.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={gdprConsent}
                onClick={() => toggleSetting('gdpr_consent', gdprConsent)}
                className={`w-12 h-7 rounded-full transition p-1 cursor-pointer shrink-0 ${
                  gdprConsent ? 'bg-[#D89D60]' : 'bg-[#1C140D] border border-[#3E3025]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full transition transform ${
                    gdprConsent
                      ? 'translate-x-5 bg-[#1C140D]'
                      : 'translate-x-0 bg-[#A39284]'
                  }`}
                />
              </button>
            </div>
          </section>
        </div>
      </div>

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};
