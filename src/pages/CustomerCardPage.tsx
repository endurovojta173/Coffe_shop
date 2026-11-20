import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { LoyaltyCardContent } from '../components/LoyaltyCardModal';

export const CustomerCardPage: React.FC = () => {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto my-auto flex flex-col gap-2 md:gap-4">
      <div className="hidden md:flex items-center justify-between">
        <Link
          to="/app/home"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#A39284] hover:text-[#F5EBE1] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na přehled</span>
        </Link>
      </div>

      <LoyaltyCardContent
        fullName={currentUser.full_name}
        cardNumber={currentUser.card_number}
        coffeeCount={currentUser.coffee_count}
        variant="page"
      />
    </div>
  );
};
