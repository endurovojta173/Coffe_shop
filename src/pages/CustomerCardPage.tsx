import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { LoyaltyCardContent } from '../components/LoyaltyCardModal';
import { CoffeeBeanIcon } from '../components/CoffeeBeanIcon';
import { useLanguage } from '../context/LanguageContext';

export const CustomerCardPage: React.FC = () => {
  const { currentUser } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/app/home');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentUser) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('card.title')}
      className="fixed inset-0 z-50 bg-[#1C140D] text-[#F5EBE1] flex flex-col overflow-y-auto"
    >
      {/* Kompaktní horní lišta překryvu s tlačítkem zavřít */}
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#2D221A] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
            <CoffeeBeanIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif-heading text-base sm:text-lg font-bold text-[#F5EBE1] block leading-none">
              {t('common.appName')}
            </span>
            <span className="text-[11px] text-[#A39284]">
              {t('home.loyaltySubtitle')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label={t('common.close')}
          className="w-10 h-10 rounded-full bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] text-[#F5EBE1] hover:text-[#D89D60] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Obsah kartičky přes celou zbývající plochu displeje bez scrollu */}
      <div className="flex-1 w-full max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col justify-center">
        <LoyaltyCardContent
          fullName={currentUser.full_name}
          cardNumber={currentUser.card_number}
          coffeeCount={currentUser.coffee_count}
          variant="page"
        />
      </div>
    </div>
  );
};
