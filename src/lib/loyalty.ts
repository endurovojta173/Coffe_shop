/**
 * Pomocné funkce pro výpočet a formátování věrnostního programu (kávy zdarma).
 * Zákazník může sbírat neomezeně káv nad 10 (např. 10, 11, 20 káv).
 * Za každých celých 10 káv má nárok na 1 kávu zdarma.
 */

export interface LoyaltyStatus {
  count: number;
  freeCoffees: number;
  remainder: number;
  currentInCycle: number;
  customerText: string;
  staffText: string;
  badgeText: string;
  freeCoffeeLabel: string;
}

export function getLoyaltyStatus(
  count: number,
  lang: 'cs' | 'en' | 'ko' = 'cs'
): LoyaltyStatus {
  const safeCount = Math.max(0, count);
  const freeCoffees = Math.floor(safeCount / 10);
  const remainder = 10 - (safeCount % 10);
  const currentInCycle = safeCount % 10;

  let customerText = '';
  let staffText = '';
  let badgeText = '';
  let freeCoffeeLabel = '';

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
        currentInCycle === 0
          ? 'Máte nárok na 1 kávu zdarma!'
          : `Máte nárok na 1 kávu zdarma! (do další zbývá ${remainder})`;
      staffText = 'Zákazník má nárok na 1 kávu zdarma';
      badgeText = `${safeCount} káv • 1× ZDARMA`;
      freeCoffeeLabel = 'Uplatnit kávu zdarma (1)';
    } else if (freeCoffees >= 2 && freeCoffees <= 4) {
      customerText =
        currentInCycle === 0
          ? `Máte nárok na ${freeCoffees} kávy zdarma!`
          : `Máte nárok na ${freeCoffees} kávy zdarma! (do další zbývá ${remainder})`;
      staffText = `Zákazník má nárok na ${freeCoffees} kávy zdarma`;
      badgeText = `${safeCount} káv • ${freeCoffees}× ZDARMA`;
      freeCoffeeLabel = `Uplatnit kávu zdarma (${freeCoffees})`;
    } else {
      customerText =
        currentInCycle === 0
          ? `Máte nárok na ${freeCoffees} káv zdarma!`
          : `Máte nárok na ${freeCoffees} káv zdarma! (do další zbývá ${remainder})`;
      staffText = `Zákazník má nárok na ${freeCoffees} káv zdarma`;
      badgeText = `${safeCount} káv • ${freeCoffees}× ZDARMA`;
      freeCoffeeLabel = `Uplatnit kávu zdarma (${freeCoffees})`;
    }
  } else if (lang === 'en') {
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
        currentInCycle === 0
          ? 'You are eligible for 1 free coffee!'
          : `You are eligible for 1 free coffee! (${remainder} left until next)`;
      staffText = 'Customer is eligible for 1 free coffee';
      badgeText = `${safeCount} coffees • 1× FREE`;
      freeCoffeeLabel = 'Redeem free coffee (1)';
    } else {
      customerText =
        currentInCycle === 0
          ? `You are eligible for ${freeCoffees} free coffees!`
          : `You are eligible for ${freeCoffees} free coffees! (${remainder} left until next)`;
      staffText = `Customer is eligible for ${freeCoffees} free coffees`;
      badgeText = `${safeCount} coffees • ${freeCoffees}× FREE`;
      freeCoffeeLabel = `Redeem free coffee (${freeCoffees})`;
    }
  } else {
    // ko (Korean)
    if (freeCoffees === 0) {
      customerText = `무료 커피까지 ${remainder}잔 남았습니다`;
      staffText = `무료 커피까지 ${remainder}잔 남음`;
      badgeText = `${safeCount}/10`;
      freeCoffeeLabel = '무료 커피';
    } else {
      customerText =
        currentInCycle === 0
          ? `무료 커피 ${freeCoffees}잔 혜택이 있습니다!`
          : `무료 커피 ${freeCoffees}잔 혜택이 있습니다! (다음 무료까지 ${remainder}잔)`;
      staffText = `무료 커피 ${freeCoffees}잔 수령 가능`;
      badgeText = `${safeCount}잔 • 무료 ${freeCoffees}잔`;
      freeCoffeeLabel = `무료 커피 사용 (${freeCoffees})`;
    }
  }

  return {
    count: safeCount,
    freeCoffees,
    remainder,
    currentInCycle,
    customerText,
    staffText,
    badgeText,
    freeCoffeeLabel,
  };
}

