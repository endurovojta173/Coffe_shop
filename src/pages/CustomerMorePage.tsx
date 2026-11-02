import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Coffee,
  Download,
  Globe,
  Heart,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { InstallPwaModal, usePwaInstall } from '../components/InstallPwaModal';
import { useLanguage } from '../context/LanguageContext';

export const CustomerMorePage: React.FC = () => {
  const { currentUser, messages, updateCurrentUserProfile } = useAppState();
  const { isInstalled } = usePwaInstall();
  const { t, preference, systemLanguage, setPreference } = useLanguage();
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
          {t('common.appName')}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
          {t('more.title')}
        </h1>
        <p className="text-xs text-[#A39284] mt-1">{t('more.subtitle')}</p>
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D221A] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6">
              <span className="px-3 py-1 rounded-full bg-[#1C140D]/80 border border-[#3E3025] text-xs font-medium text-[#D89D60]">
                {t('common.openToday')}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">
                  {t('more.aboutTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  Kavárna • Pekárna • Komunitní prostor
                </p>
              </div>
            </div>

            <p className="text-sm text-[#A39284] leading-relaxed">
              {t('more.aboutParagraph1')}
            </p>

            <p className="text-sm text-[#A39284] leading-relaxed">
              {t('more.aboutParagraph2')}
            </p>

            <div className="pt-4 border-t border-[#3E3025] flex items-center gap-3 text-xs text-[#D89D60]">
              <Heart className="w-4 h-4 fill-current shrink-0" />
              <span>{t('more.communityThanks')}</span>
            </div>
          </div>
        </section>

        {/* Pravý sloupec na desktopu: "Jazyk aplikace", "Instalace aplikace", "Zprávy a upozornění" a "Správa souhlasů" */}
        <div className="space-y-8">
          {/* Karta Jazyk aplikace / Language Settings */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EBE1]">
                  {t('more.languageSectionTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  {t('more.languageSectionSubtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setPreference('auto')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  preference === 'auto'
                    ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                    : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{t('more.languageAuto')}</p>
                  <p className="text-[11px] text-[#A39284] mt-0.5">
                    {systemLanguage === 'cs' ? 'Detekovaný systém: Čeština' : 'Detected system: English'}
                  </p>
                </div>
                {preference === 'auto' && (
                  <CheckCircle2 className="w-4 h-4 text-[#D89D60] shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPreference('cs')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  preference === 'cs'
                    ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                    : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🇨🇿</span>
                  <span className="text-xs font-semibold">{t('more.languageCs')}</span>
                </div>
                {preference === 'cs' && (
                  <CheckCircle2 className="w-4 h-4 text-[#D89D60] shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPreference('en')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  preference === 'en'
                    ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                    : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🇬🇧</span>
                  <span className="text-xs font-semibold">{t('more.languageEn')}</span>
                </div>
                {preference === 'en' && (
                  <CheckCircle2 className="w-4 h-4 text-[#D89D60] shrink-0" />
                )}
              </button>
            </div>
          </section>

          {/* Karta Instalace mobilní aplikace (Android & iPhone) */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EBE1]">
                  {t('more.appTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  {t('more.appSubtitle')}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A39284] leading-relaxed">
              {t('more.appDescription')}
            </p>

            {isInstalled ? (
              <div className="w-full py-3 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('more.appInstalledBadge')}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsInstallOpen(true)}
                className="w-full py-3 px-5 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D89D60]/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('more.appInstallButton')}</span>
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
                  {t('more.messagesTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  {t('more.messagesSubtitle')}
                </p>
              </div>
            </div>

            {/* Přepínače (toggles) pro notifikace */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#221912] border border-[#3E3025]">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#F5EBE1]">
                    {t('more.notifyEvents')}
                  </p>
                  <p className="text-xs text-[#A39284] mt-0.5">
                    Degustace, cuppingy a novinky
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
                  <div
                    className={`w-5 h-5 rounded-full bg-[#1C140D] transition transform ${
                      notifyEvents ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#221912] border border-[#3E3025]">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#F5EBE1]">
                    {t('more.notifyMessages')}
                  </p>
                  <p className="text-xs text-[#A39284] mt-0.5">
                    Provozní informace a oznámení
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
                  <div
                    className={`w-5 h-5 rounded-full bg-[#1C140D] transition transform ${
                      notifyMessages ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Poslední zprávy */}
            {messages.length > 0 && (
              <div className="pt-4 border-t border-[#3E3025] space-y-3">
                <p className="text-xs uppercase tracking-wider text-[#A39284] font-semibold flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D89D60]" />
                  <span>Přijaté zprávy</span>
                </p>
                <div className="space-y-2">
                  {messages.slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#F5EBE1] font-semibold">
                        <span>{msg.title}</span>
                        <span className="text-[10px] text-[#A39284]">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#A39284] leading-relaxed">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Karta Správa souhlasů (GDPR) */}
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EBE1]">
                  {t('more.gdprTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  {t('more.gdprSubtitle')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-between gap-4">
              <p className="text-xs text-[#A39284] leading-relaxed">
                {t('more.gdprConsent')}
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={gdprConsent}
                onClick={() => toggleSetting('gdpr_consent', gdprConsent)}
                className={`w-12 h-7 rounded-full transition p-1 cursor-pointer shrink-0 ${
                  gdprConsent ? 'bg-[#D89D60]' : 'bg-[#1C140D] border border-[#3E3025]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#1C140D] transition transform ${
                    gdprConsent ? 'translate-x-5' : 'translate-x-0'
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
