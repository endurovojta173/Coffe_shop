export interface BranchInfo {
  id: string;
  name: string;
  shortName: string;
  address: string;
  hours: string;
  phone: string;
  imageUrl: string;
  description: string;
  features: string[];
  mapUrl: string;
  isCurrent?: boolean;
}

export const CAFE_BRANCHES: BranchInfo[] = [
  {
    id: 'branch-main',
    name: 'U Sousedů – Hlavní kavárna (Karlín)',
    shortName: 'Hlavní kavárna • Karlín',
    address: 'Křižíkova 34, Praha 8 – Karlín',
    hours: 'Po–Pá 7:30–20:00 • So–Ne 8:30–19:00',
    phone: '+420 776 412 889',
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
    description:
      'Naše domovská a největší kavárna s vlastní pekárnou, výběrovou pražírnou a útulným krbem pro sousedská setkání a večerní cuppingy.',
    features: ['Vlastní pekárna', 'Zahrádka ve vnitrobloku', 'Cuppingy & akce'],
    mapUrl: 'https://maps.google.com/?q=Křižíkova+34,+Praha+8',
    isCurrent: true,
  },
  {
    id: 'branch-vinohrady',
    name: 'U Sousedů – Vinohrady',
    shortName: 'Vinohrady',
    address: 'Korunní 48, Praha 2',
    hours: 'Po–Pá 7:30–20:00 • So–Ne 8:30–19:00',
    phone: '+420 776 412 890',
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    description:
      'Světlá rohová kavárna s velkými výlohami, ideální na ranní espresso, klidnou práci s notebookem i odpolední sklenku prosecca.',
    features: ['Rychlé Wi-Fi', 'Výběrový filtr', 'Domácí brunch'],
    mapUrl: 'https://maps.google.com/?q=Korunní+48,+Praha+2',
  },
  {
    id: 'branch-letna',
    name: 'U Sousedů – Letná',
    shortName: 'Letná',
    address: 'Milady Horákové 64, Praha 7',
    hours: 'Po–Pá 8:00–20:30 • So–Ne 9:00–19:30',
    phone: '+420 776 412 891',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
    description:
      'Kousek od Letenských sadů – zastavte se před procházkou pro výběrovou kávu s sebou, matcha latte nebo čerstvě napečený croissant.',
    features: ['Dog-friendly', 'Káva s sebou', 'Sezónní dezerty'],
    mapUrl: 'https://maps.google.com/?q=Milady+Horákové+64,+Praha+7',
  },
];
