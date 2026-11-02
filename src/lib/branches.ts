export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  imageUrl: string;
}

export const CAFE_BRANCHES: BranchInfo[] = [
  {
    id: 'branch-vinohrady',
    name: 'U Sousedů – Vinohrady',
    address: 'Korunní 48, Praha 2',
    hours: 'Po–Pá 7:30–20:00 • So–Ne 8:30–19:00',
    phone: '+420 776 412 890',
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'branch-letna',
    name: 'U Sousedů – Letná',
    address: 'Milady Horákové 64, Praha 7',
    hours: 'Po–Pá 8:00–20:30 • So–Ne 9:00–19:30',
    phone: '+420 776 412 891',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  },
];

