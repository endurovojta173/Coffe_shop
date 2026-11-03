import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Coffee,
  MapPin,
  Phone,
  QrCode,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';
import { CAFE_BRANCHES } from '../lib/branches';
import { getLoyaltyStatus } from '../lib/loyalty';

function formatCzechEventDate(isoString: string): { date: string; time: string } {
  try {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  } catch {
    return { date: isoString, time: '18:00' };
  }
}

export const CustomerHomePage: React.FC = () => {
  const { currentUser, events, setCardModalOpen } = useAppState();
  const { t, language } = useLanguage();

  const coffeeCount = currentUser?.coffee_count ?? 7;
  const cardNumber = currentUser?.card_number ?? '0042 1187';
  const status = getLoyaltyStatus(coffeeCount, language);

  return (
    <div className="space-y-8">
      {/* Úvodní hlavička sekce */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            {t('common.appName')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            {t('auth.loginSubtitle')}
          </h1>
        </div>
        <Link
          to="/app/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D221A] hover:border-[#D89D60] border border-[#3E3025] text-sm font-medium text-[#F5EBE1] transition self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-4 h-4 text-[#D89D60]" />
          <span>{t('menu.title')}</span>
        </Link>
      </div>

      {/* Hlavní asymetrický grid: Mobil stack -> Desktop lg:grid-cols-12 (5 + 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Levý sloupec (lg:col-span-5): Věrnostní karta s gridem 5x2 pro 10 káv */}
        <section className="lg:col-span-5 bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#D89D60]/10 blur-3xl" />

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#D89D60] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('home.loyaltySubtitle')}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">{t('home.loyaltyTitle')}</h2>
              <p className="text-xs text-[#A39284] mt-0.5 font-mono">
                {t('card.cardNumber')}: {cardNumber}
              </p>
            </div>
            <div className="text-right bg-[#221912] border border-[#3E3025] px-4 py-2.5 rounded-2xl shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-[#D89D60] block leading-none">
                {status.freeCoffees === 0 ? `${status.count}/10` : `${status.count}`}
              </span>
              <span className="text-[11px] text-[#A39284]">
                {status.freeCoffees > 0
                  ? `${status.freeCoffees}× ZDARMA`
                  : `${status.remainder} zbývá`}
              </span>
            </div>
          </div>

          {/* Zvýrazněný banner při nároku na kávu zdarma */}
          {status.freeCoffees > 0 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#D89D60]/20 border border-[#D89D60] flex items-center gap-2.5">
              <Star className="w-5 h-5 text-[#D89D60] fill-current shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#D89D60]">
                {status.customerText}
              </span>
            </div>
          )}

          {/* Grid 5x2 pro 10 káv, 10. pozice jako odměna (hvězda) */}
          <div className="grid grid-cols-5 gap-3 my-6">
            {Array.from({ length: 10 }).map((_, idx) => {
              const pos = idx + 1;
              const isTenth = pos === 10;
              const isCollected =
                status.freeCoffees === 0
                  ? pos <= status.count
                  : status.currentInCycle === 0
                  ? true
                  : pos <= status.currentInCycle;

              return (
                <div
                  key={pos}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    isCollected
                      ? 'bg-[#D89D60] border-[#D89D60] text-[#1C140D] shadow-md shadow-[#D89D60]/25'
                      : isTenth
                      ? 'bg-[#221912] border-[#D89D60]/60 text-[#D89D60]'
                      : 'bg-[#221912] border-[#3E3025] text-[#A39284]/45'
                  }`}
                >
                  {isTenth ? (
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  <span className="text-[10px] font-bold mt-1">
                    {isTenth ? 'ZDARMA' : `${pos}.`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar a info */}
          <div className="bg-[#221912] border border-[#3E3025] rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A39284]">Postup k odměně</span>
              <span className="font-semibold text-[#F5EBE1]">
                {status.freeCoffees > 0 && status.currentInCycle === 0
                  ? 100
                  : status.currentInCycle * 10} %
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#1C140D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D89D60] rounded-full transition-all duration-500"
                style={{
                  width: `${
                    status.freeCoffees > 0 && status.currentInCycle === 0
                      ? 100
                      : status.currentInCycle * 10
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-[#A39284] mt-2.5">
              {status.customerText}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/app/card"
              className="flex-1 py-3.5 px-5 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D89D60]/20 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('card.title')}</span>
            </Link>
            <button
              type="button"
              onClick={() => setCardModalOpen(true)}
              className="hidden md:inline-flex py-3.5 px-5 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-medium text-[#F5EBE1] items-center justify-center transition cursor-pointer"
            >
              {t('home.openCardDetail')}
            </button>
          </div>
        </section>

        {/* Pravý sloupec (lg:col-span-7): Nadcházející akce + Pobočky */}
        <div className="lg:col-span-7 space-y-8">
          {/* Sekce Nadcházející akce */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">
                  {t('home.eventsTitle')}
                </h2>
                <p className="text-xs text-[#A39284]">
                  Kulturní večery, cuppingy a sousedská setkání
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#D89D60]">
                {events.length} akce
              </span>
            </div>

            {/* Mobil: horizontální posuvník (carousel) -> Desktop: mřížka akcí (grid-cols-2) */}
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory no-scrollbar">
              {events.map((evt) => {
                const { date, time } = formatCzechEventDate(evt.event_date);
                return (
                  <article
                    key={evt.id}
                    className="min-w-[270px] sm:min-w-[300px] md:min-w-0 snap-start bg-[#2D221A] border border-[#3E3025] rounded-2xl overflow-hidden flex flex-col hover:border-[#D89D60]/50 transition group"
                  >
                    <div className="relative h-40 overflow-hidden bg-[#221912]">
                      <img
                        src={evt.image_url}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C140D]/90 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#F5EBE1]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C140D]/85 border border-[#3E3025]">
                          <Calendar className="w-3.5 h-3.5 text-[#D89D60]" />
                          <span>{date}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D89D60] text-[#1C140D] font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{time}</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-semibold text-base text-[#F5EBE1] leading-snug">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#A39284] mt-2">
                        Vstup zdarma pro členy věrnostního klubu U Sousedů
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Sekce Naše pobočky */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">
                {t('home.locationsTitle')}
              </h2>
              <p className="text-xs text-[#A39284]">
                Zastavte se u nás na šálek výběrové kávy nebo domácí dezert
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CAFE_BRANCHES.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-[#2D221A] border border-[#3E3025] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={branch.imageUrl}
                      alt={branch.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#3E3025] shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold text-base text-[#F5EBE1]">
                        {branch.name}
                      </h3>
                      <p className="text-xs text-[#D89D60] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{branch.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#3E3025] text-xs text-[#A39284]">
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D89D60] shrink-0" />
                      <span>{branch.hours}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#D89D60] shrink-0" />
                      <span>{branch.phone}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

