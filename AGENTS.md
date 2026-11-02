# AGENTS.md - U Sousedů (Responsive Mobile-First PWA & Supabase)

## Přehled projektu
Systém pro kavárnu "U Sousedů" spojující zákaznickou věrnostní PWA, skener pro baristy a administraci v jednom repozitáři. Architektura je striktně **Mobile-First**, ale všechny obrazovky (včetně zákaznické části a administrace) jsou plně responzivní a adaptují se na široké desktopové monitory. Backend běží na Supabase.

## Tech Stack
- **Frontend:** React (TypeScript) + Vite (nebo Next.js App Router)
- **Styling:** Tailwind CSS (Mobile-First breakpointy: výchozí stav = mobil, `md:` = tablet, `lg:` = desktop)
- **Ikony:** Lucide React (`lucide-react`)
- **PWA:** `vite-plugin-pwa` (Service Worker, Web App Manifest)
- **QR Kódy:** `qrcode.react` (generování u zákazníka), `html5-qrcode` (čtečka pro baristy)
- **Backend & DB:** `@supabase/supabase-js`

## Design System & UI Pravidla
Strikně dodržuj vizuální identitu z Figma návrhu (tmavé kávové téma):
- **Barvy:**
  - Hlavní pozadí aplikace: `#1C140D`
  - Pozadí karet / kontejnerů: `#2D221A`
  - Vnořené prvky / inputy: `#221912`
  - Primární akcent (tlačítka, aktivní stavy, ceny): `#D89D60`
  - Text primární: `#F5EBE1`
  - Text sekundární (popisky, labely): `#A39284`
  - Destruktivní akce (Smazat účet): `#D96B6B` (text a border)
- **Typografie:**
  - Nadpisy (`h1`, `h2`, názvy sekcí): Patkové písmo (Serif), např. `'Lora'` nebo `'Playfair Display'`, semi-bold/bold.
  - Běžný text, inputy, ceny: Bezpatkové písmo (Sans-serif), např. `'Inter'` nebo `'Plus Jakarta Sans'`.
- **Komponenty:**
  - Tlačítka mají plné zaoblení (`rounded-full`).
  - Karty mají výrazné zaoblení (`rounded-2xl` až `rounded-3xl`) a jemný 1px border (`border-[#3E3025]`).

## Pravidla pro Responzivní Layout (Mobile-First -> Web)
NIKDY neomezuj zákaznickou aplikaci na desktopu pouhým `max-w-md mx-auto` kontejnerem. Používej plnohodnotný webový kontejner (`max-w-6xl mx-auto px-4 md:px-8`):

1. **Navigace zákazníka (`CustomerLayout`):**
   - **Mobil (`< md`):** Fixní spodní lišta (`fixed bottom-0 left-0 right-0`) s 5 položkami; prostřední položka ("Kartička") je vyvýšené kruhové tlačítko (FAB) v barvě `#D89D60`.
   - **Desktop (`>= md`):** Spodní lišta je skrytá (`md:hidden`). Místo ní se zobrazí horní hlavička (`hidden md:flex`) s logem, odkazy (Domů, Nabídka, Můj účet, Další), zvýrazněným CTA tlačítkem "Moje kartička" a pozdravem uživatele ("Ahoj, Jano").
2. **Přihlašovací obrazovky (`/login` a `/admin/login`):**
   - **Mobil:** Formulář přes celou šířku, nahoře dekorativní podkresový obrázek s přechodem do ztracena.
   - **Desktop (`lg:grid-cols-2`):** Split-screen layout. Levá polovina obrazovky zobrazuje fotografii kavárny s textovým claimem, pravá polovina obsahuje centrovaný formulář (`max-w-md mx-auto`).
3. **Domů (`/app/home`):**
   - **Mobil:** Vertikální stack (Věrnostní karta -> horizontální scroll akcí -> pobočky).
   - **Desktop (`lg:grid-cols-12`):** Levý sloupec (`lg:col-span-5`) obsahuje věrnostní kartu (grid 5x2 pro 10 káv), pravý sloupec (`lg:col-span-7`) zobrazuje mřížku akcí (`grid-cols-2`) a sekci poboček.
4. **Nabídka (`/app/menu`) a Editace nabídky (`/admin/menu`):**
   - **Mobil:** Kategorie pod sebou (`grid-cols-1 gap-8`).
   - **Desktop:** Dvousloupcový grid kategorií (`md:grid-cols-2 gap-8`).
5. **Další (`/app/more`):**
   - **Mobil:** Sekce pod sebou.
   - **Desktop (`md:grid-cols-2 gap-8`):** Vlevo karta "O nás" s fotografií kavárny, vpravo karty "Zprávy a upozornění" a "Správa souhlasů".
6. **Administrace Dashboard (`/admin/dashboard`):**
   - **Mobil:** Karty pod sebou (`grid-cols-1 gap-4`).
   - **Desktop:** Grid 2x2 (`md:grid-cols-2 gap-6`).

## Architektura a Routing
- `/login` - Přihlášení zákazníka / baristy.
- `/app/*` - Zákaznická část (chráněno pro roli `customer`):
  - `/app/home` - Věrnostní stav, akce, pobočky.
  - `/app/menu` - Katalog produktů s tečkovanými vodícími linkami (`border-dotted`).
  - `/app/card` - Detail QR kódu a čísla karty (na desktopu lze otevřít i jako modál).
  - `/app/account` - Profil, změna údajů, smazání účtu, odhlášení.
  - `/app/more` - O nás, přepínače notifikací, zprávy, GDPR.
- `/scanner` - Rozhraní pro baristu (role `staff` a `admin`), čtečka QR kódů + tlačítko pro simulaci skenu.
- `/admin/*` - Administrace (role `admin`):
  - `/admin/login` - Přihlášení správce.
  - `/admin/dashboard` - Přehled kavárny (4 sekce).
  - `/admin/menu` - Formulář pro editaci kategorií a položek.

## Pravidla pro práci se Supabase (Backend Guidelines)
1. **Row Level Security (RLS):**
   - Tabulky `categories`, `menu_items`, `events`, `app_messages` mají povolený `SELECT` pro všechny, ale `INSERT/UPDATE/DELETE` pouze pro uživatele s `profiles.role = 'admin'`.
   - Tabulka `profiles` umožňuje uživatelům číst a upravovat vlastní záznam (`auth.uid() = id`). Sloupce `role` a `coffee_count` nesmí zákazník měnit přímo přes klientský `UPDATE`.
2. **Připisování bodů (Věrnostní logika):**
   - Inkrementaci `coffee_count` řeš výhradně přes PostgreSQL RPC funkci `scan_customer_card(card_num TEXT)` volanou baristou (`role IN ('staff', 'admin')`).
   - Při dosažení 10 bodů se uplatní odměna, počítadlo se vyresetuje a transakce se zapíše do `loyalty_logs`.

## Pokyny pro psaní kódu (Coding Standards)
- Piš striktně typovaný TypeScript (žádné `any`). Používej typy ze Supabase schématu (`database.types.ts`).
- Veškeré texty v UI musí být v češtině přesně podle návrhu.
- Všechny styly piš Mobile-First v Tailwind CSS (základní třídy pro mobil, prefixy `sm:`, `md:`, `lg:` pro větší obrazovky).
- Při implementaci čtečky QR kódů vždy ponech funkční fallback tlačítko "Klepněte pro simulaci skenu" pro snadné testování bez kamery.