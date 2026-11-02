import React from 'react';
import { Coffee, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';

export const CustomerMenuPage: React.FC = () => {
  const { categories, menuItems } = useAppState();
  const { t } = useLanguage();

  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-8">
      {/* Hlavička stránky nabídky */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#D89D60] text-xs font-semibold mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Stálá i sezónní nabídka</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] font-serif-heading">
            {t('menu.title')}
          </h1>
          <p className="text-sm text-[#A39284] mt-1">
            {t('menu.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D221A] border border-[#3E3025] text-xs text-[#A39284]">
          <Sparkles className="w-4 h-4 text-[#D89D60] shrink-0" />
          <span>Za každý teplý či studený kávový nápoj získáváte 1 bod</span>
        </div>
      </div>

      {/* Mobil: grid-cols-1 gap-8 -> Desktop: md:grid-cols-2 gap-8 přesně podle AGENTS.md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedCategories.map((category) => {
          const items = menuItems.filter(
            (item) => item.category_id === category.id && item.is_active
          );

          return (
            <section
              key={category.id}
              className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#3E3025]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F5EBE1]">
                    {category.name}
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#A39284]">
                  {items.length} položek
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-[#A39284] italic py-4">
                  {t('menu.emptyItems')}
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between gap-2 group"
                    >
                      <span className="text-sm sm:text-base font-medium text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                        {item.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex-1 border-b-2 border-dotted border-[#3E3025] mx-2 min-w-[24px]"
                      />
                      <span className="text-sm sm:text-base font-bold text-[#D89D60] whitespace-nowrap">
                        {item.price} {t('common.currency')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

