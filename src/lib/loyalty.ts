/**
 * Pomocné funkce pro výpočet a formátování věrnostního programu (kávy zdarma).
 * Zákazník může sbírat neomezeně káv nad 10 (např. 10, 11, 20 káv).
 * Počítadlo se NIKDY při 10 kávách automaticky nevynuluje.
 * Káva zdarma se uplatní pouze tehdy, když obsluha klikne na tlačítko "Káva zdarma",
 * což odečte 10 káv.
 */

/**
 * Pomocné funkce pro výpočet a formátování věrnostního programu (kávy zdarma).
 * Zákazník může sbírat neomezeně káv nad 10 (např. 10, 11, 20 káv).
 * Počítadlo celkových káv se NIKDY při 10 kávách automaticky nevynuluje.
 * Po překonání 10 káv se ukazatel razítek/bodíků na kartičce sbírá od nuly (11 káv = 1 razítko),
 * přičemž celkový počet káv se dál načítá a zůstává nárok na kávu zdarma.
 * Káva zdarma se uplatní pouze tehdy, když obsluha klikne na tlačítko "Káva zdarma",
 * což odečte 10 káv.
 */

export interface LoyaltyStatus {
  count: number;
  freeCoffees: number;
  stampsCollected: number; // 0 až 10 razítek v aktuálním cyklu kartičky
  remainder: number;
  cardProgressPercent: number; // 0 až 100 % v aktuálním cyklu
  customerText: string;
  staffText: string;
  badgeText: string;
  freeCoffeeLabel: string;
  isCardComplete: boolean;
}

export function getLoyaltyStatus(
  count: number,
  lang: 'cs' | 'en' = 'cs'
): LoyaltyStatus {
  const safeCount = Math.max(0, count);
  const freeCoffees = Math.floor(safeCount / 10);

  // Ukazatel bodíků / razítek na kartičce (0 až 10):
  // 0 káv -> 0 razítek
  // 1 až 9 káv -> 1 až 9 razítek
  // 10 káv -> 10 razítek (karta dokončena, odměna připravena)
  // 11 káv -> 1 razítko (překonáno 10, nová karta se sbírá od začátku)
  // 20 káv -> 10 razítek (druhá karta dokončena)
  // 21 káv -> 1 razítko atd.
  let stampsCollected = 0;
  if (safeCount > 0) {
    const mod = safeCount % 10;
    stampsCollected = mod === 0 ? 10 : mod;
  }

  const isCardComplete = stampsCollected === 10;
  const cardProgressPercent = stampsCollected * 10;
  const remainder = 10 - stampsCollected;

  let customerText = '';
  let staffText = '';
  let badgeText = '';
  let freeCoffeeLabel = 'Káva zdarma';

  if (lang === 'cs') {
    if (freeCoffees === 0) {
      customerText =
        remainder === 1
          ? 'Do kávy zdarma zbývá 1 káva'
          : remainder >= 2 && remainder <= 4
          ? `Do kávy zdarma zbývají ${remainder} kávy`
          : `Do kávy zdarma zbývá ${remainder} káv`;
      staffText = `Do kávy zdarma zbývá ${remainder}`;
      badgeText = `${safeCount}/10`;
      freeCoffeeLabel = 'Káva zdarma';
    } else if (freeCoffees === 1) {
      customerText =
        safeCount === 10
          ? 'Máte nárok na 1 kávu zdarma!'
          : `Máte nárok na 1 kávu zdarma! (celkem ${safeCount} káv)`;
      staffText =
        safeCount === 10
          ? 'Zákazník má nárok na 1 kávu zdarma'
          : `Zákazník má nárok na 1 kávu zdarma (${safeCount} káv)`;
      badgeText = `${safeCount} káv • 1× ZDARMA`;
      freeCoffeeLabel = 'Káva zdarma';
    } else if (freeCoffees >= 2 && freeCoffees <= 4) {
      customerText = `Máte nárok na ${freeCoffees} kávy zdarma! (celkem ${safeCount} káv)`;
      staffText = `Zákazník má nárok na ${freeCoffees} kávy zdarma (${safeCount} káv)`;
      badgeText = `${safeCount} káv • ${freeCoffees}× ZDARMA`;
      freeCoffeeLabel = `Káva zdarma (${freeCoffees})`;
    } else {
      customerText = `Máte nárok na ${freeCoffees} káv zdarma! (celkem ${safeCount} káv)`;
      staffText = `Zákazník má nárok na ${freeCoffees} káv zdarma (${safeCount} káv)`;
      badgeText = `${safeCount} káv • ${freeCoffees}× ZDARMA`;
      freeCoffeeLabel = `Káva zdarma (${freeCoffees})`;
    }
  } else {
    // en (English default)
    if (freeCoffees === 0) {
      customerText =
        remainder === 1
          ? '1 coffee left until free reward'
          : `${remainder} coffees left until free reward`;
      staffText = `${remainder} coffees left until free reward`;
      badgeText = `${safeCount}/10`;
      freeCoffeeLabel = 'Free coffee';
    } else if (freeCoffees === 1) {
      customerText =
        safeCount === 10
          ? 'You are eligible for 1 free coffee!'
          : `You are eligible for 1 free coffee! (${safeCount} coffees total)`;
      staffText = 'Customer is eligible for 1 free coffee';
      badgeText = `${safeCount} coffees • 1× FREE`;
      freeCoffeeLabel = 'Free coffee';
    } else {
      customerText = `You are eligible for ${freeCoffees} free coffees! (${safeCount} coffees total)`;
      staffText = `Customer is eligible for ${freeCoffees} free coffees`;
      badgeText = `${safeCount} coffees • ${freeCoffees}× FREE`;
      freeCoffeeLabel = `Free coffee (${freeCoffees})`;
    }
  }

  return {
    count: safeCount,
    freeCoffees,
    stampsCollected,
    remainder,
    cardProgressPercent,
    customerText,
    staffText,
    badgeText,
    freeCoffeeLabel,
    isCardComplete,
  };
}
