import React from 'react';
import { Coffee, QrCode, Sparkles, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';
import { getLoyaltyStatus } from '../lib/loyalty';

interface LoyaltyCardContentProps {
  fullName: string;
  cardNumber: string;
  coffeeCount: number;
  variant?: 'modal' | 'page';
}

export const LoyaltyCardContent: React.FC<LoyaltyCardContentProps> = ({
  fullName,
  cardNumber,
  coffeeCount,
  variant = 'modal',
}) => {
  const { t, language } = useLanguage();
  const status = getLoyaltyStatus(coffeeCount, language);
  const isPage = variant === 'page';

  const qrBlock = (
    <div className="flex flex-col items-center">
      {/* QR kód v čistém kontrastním rámečku – škáluje podle výšky obrazovky */}
      <div
        className={`bg-[#F5EBE1] rounded-2xl mx-auto shadow-inner border-[3px] border-[#3E3025] ${
          isPage
            ? 'p-3 sm:p-4 md:p-5 w-[clamp(152px,27dvh,224px)] h-[clamp(152px,27dvh,224px)] md:w-[236px] md:h-[236px]'
            : 'p-3 sm:p-4 w-[clamp(132px,23dvh,184px)] h-[clamp(132px,23dvh,184px)]'
        }`}
      >
        <QRCodeSVG
          value={cardNumber}
          size={200}
          bgColor="#F5EBE1"
          fgColor="#1C140D"
          level="M"
          className="w-full h-full block"
        />
      </div>

      {/* Číslo kartičky a majitel */}
      <div className="mt-2.5 sm:mt-3 md:mt-4 text-center">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#A39284] leading-none mb-1">
          {t('card.cardNumber')}
        </p>
        <p
          className={`font-mono font-bold tracking-[0.18em] text-[#D89D60] leading-tight ${
            isPage ? 'text-xl sm:text-2xl md:text-3xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {cardNumber}
        </p>
        <p className="text-xs sm:text-sm text-[#F5EBE1] mt-0.5 font-medium">
          {fullName}
        </p>
      </div>
    </div>
  );

  const stampsBlock = (
    <div>
      <div className="flex items-center justify-between mb-2 sm:mb-2.5">
        <span className="text-xs sm:text-sm text-[#A39284]">
          {t('account.coffeeCountLabel')}
        </span>
        <span className="text-xs sm:text-sm font-semibold text-[#D89D60] shrink-0 ml-2">
          {status.badgeText}
        </span>
      </div>

      <div
        className={`grid grid-cols-5 ${
          isPage ? 'gap-1.5 sm:gap-2 md:gap-2.5' : 'gap-2'
        }`}
      >
        {Array.from({ length: 10 }).map((_, index) => {
          const position = index + 1;
          const isTenth = position === 10;
          const isFilled = position <= status.stampsCollected;

          return (
            <div
              key={position}
              className={`rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border transition-all ${
                isPage
                  ? 'h-9 sm:h-11 md:aspect-square md:h-auto'
                  : 'h-10 sm:h-11'
              } ${
                isFilled
                  ? 'bg-[#D89D60] border-[#D89D60] text-[#1C140D] shadow-md shadow-[#D89D60]/20'
                  : isTenth
                  ? 'bg-[#221912] border-[#D89D60]/50 text-[#D89D60]'
                  : 'bg-[#221912] border-[#3E3025] text-[#A39284]/50'
              }`}
            >
              {isTenth ? (
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              ) : (
                <Coffee className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span className="text-[9px] sm:text-[10px] font-bold leading-none mt-0.5">
                {position}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-2.5 sm:mt-3 flex items-center justify-center gap-2 text-xs py-2 px-3 rounded-xl border ${
          status.freeCoffees > 0
            ? 'bg-[#D89D60]/20 border-[#D89D60] text-[#D89D60] font-bold'
            : 'bg-[#221912] border-[#3E3025] text-[#A39284]'
        }`}
      >
        {status.freeCoffees > 0 ? (
          <Star className="w-4 h-4 text-[#D89D60] fill-current shrink-0" />
        ) : (
          <QrCode className="w-4 h-4 text-[#D89D60] shrink-0" />
        )}
        <span className="truncate sm:whitespace-normal">{status.customerText}</span>
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-4 sm:p-5 md:p-8 shadow-2xl relative overflow-hidden w-full">
        {/* Dekorativní kávový odlesk */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#D89D60]/10 blur-3xl" />

        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-center">
          {/* Mobilní hlavička (na desktopu je v pravém sloupci) */}
          <div className="md:hidden text-center mb-2.5 sm:mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-[#F5EBE1] tracking-tight font-serif-heading leading-tight">
              {t('card.title')}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#A39284] mt-0.5 line-clamp-1">
              {t('card.subtitle')}
            </p>
          </div>

          {/* Levý sloupec na desktopu / horní část na mobilu: QR kód + číslo */}
          <div className="md:col-span-5">{qrBlock}</div>

          {/* Pravý sloupec na desktopu / spodní část na mobilu: hlavička + razítka */}
          <div className="md:col-span-7 mt-3 pt-3 border-t border-[#3E3025] md:mt-0 md:pt-0 md:border-t-0 md:border-l md:pl-8 md:flex md:flex-col md:justify-center">
            <div className="hidden md:block mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#D89D60] text-xs font-medium mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('home.loyaltySubtitle')}</span>
              </div>
              <h1 className="text-3xl font-bold text-[#F5EBE1] tracking-tight font-serif-heading leading-tight">
                {t('card.title')}
              </h1>
              <p className="text-sm text-[#A39284] mt-1">{t('card.subtitle')}</p>
            </div>

            {stampsBlock}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Dekorativní kávový odlesk */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#D89D60]/10 blur-3xl" />

      <div className="text-center mb-3.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#221912] border border-[#3E3025] text-[#D89D60] text-[11px] font-medium mb-1.5">
          <Sparkles className="w-3 h-3" />
          <span>{t('home.loyaltySubtitle')}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] tracking-tight font-serif-heading leading-tight">
          {t('card.title')}
        </h2>
        <p className="text-xs text-[#A39284] mt-0.5">{t('card.subtitle')}</p>
      </div>

      {qrBlock}

      <div className="mt-4 pt-4 border-t border-[#3E3025]">{stampsBlock}</div>
    </div>
  );
};

