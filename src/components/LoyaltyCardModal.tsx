import React from 'react';
import { Coffee, QrCode, Sparkles, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';

interface LoyaltyCardContentProps {
  fullName: string;
  cardNumber: string;
  coffeeCount: number;
}

export const LoyaltyCardContent: React.FC<LoyaltyCardContentProps> = ({
  fullName,
  cardNumber,
  coffeeCount,
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Dekorativní kávový odlesk */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#D89D60]/10 blur-3xl" />

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#D89D60] text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('home.loyaltySubtitle')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] tracking-tight font-serif-heading">
          {t('card.title')}
        </h2>
        <p className="text-sm text-[#A39284] mt-1">
          {t('card.subtitle')}
        </p>
      </div>

      {/* QR kód v čistém kontrastním rámečku */}
      <div className="bg-[#F5EBE1] p-6 rounded-2xl mx-auto w-fit shadow-inner border-4 border-[#3E3025]">
        <QRCodeSVG
          value={cardNumber}
          size={200}
          bgColor="#F5EBE1"
          fgColor="#1C140D"
          level="M"
        />
      </div>

      {/* Číslo kartičky a majitel */}
      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-widest text-[#A39284] mb-1">
          {t('card.cardNumber')}
        </p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#D89D60]">
          {cardNumber}
        </p>
        <p className="text-sm text-[#F5EBE1] mt-1 font-medium">{fullName}</p>
      </div>

      {/* Stav bodů */}
      <div className="mt-6 pt-6 border-t border-[#3E3025]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#A39284]">{t('account.coffeeCountLabel')}</span>
          <span className="text-sm font-semibold text-[#D89D60]">
            {coffeeCount} / 10
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }).map((_, index) => {
            const position = index + 1;
            const isTenth = position === 10;
            const isFilled = position <= coffeeCount;

            return (
              <div
                key={position}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  isFilled
                    ? 'bg-[#D89D60] border-[#D89D60] text-[#1C140D] shadow-md shadow-[#D89D60]/20'
                    : isTenth
                    ? 'bg-[#221912] border-[#D89D60]/50 text-[#D89D60]'
                    : 'bg-[#221912] border-[#3E3025] text-[#A39284]/50'
                }`}
              >
                {isTenth ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <Coffee className="w-5 h-5" />
                )}
                <span className="text-[10px] font-bold mt-0.5">{position}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#A39284] bg-[#221912] py-2.5 px-4 rounded-xl border border-[#3E3025]">
          <QrCode className="w-4 h-4 text-[#D89D60] shrink-0" />
          <span>
            {coffeeCount >= 9
              ? t('home.freeCoffeeReady')
              : t('home.rewardsProgress', { count: 10 - coffeeCount })}
          </span>
        </div>
      </div>
    </div>
  );
};

