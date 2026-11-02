# Zadání projektu: Systém pro kavárnu „U Sousedů“ (Plně responzivní PWA)

## 1. Cíl a architektonický přístup
Vytvořit progresivní webovou aplikaci (PWA) napojenou na BaaS platformu Supabase pro správu věrnostního programu, nabídky a komunikace se zákazníky rodinné kavárny „U Sousedů“. Celá aplikace (zákaznická část, rozhraní pro baristy i administrace) je navržena přístupem **Mobile-First**, ale disponuje plnohodnotným responzivním rozložením pro desktopové obrazovky (žádné ořezávání do úzkého mobilního pruhu na monitoru).

## 2. Uživatelské role a oprávnění
* **Zákazník (`customer`):** Přístup do klientské části (věrnostní účet, QR kartička, nabídka, přehled akcí, nastavení souhlasů a notifikací).
* **Barista (`staff`):** Přístup k rozhraní se čtečkou QR kódů pro načítání věrnostních bodů zákazníkům.
* **Správce (`admin`):** Přístup do administrace s oprávněním upravovat menu, akce, zaměstnance a rozesílat zprávy do aplikace.

## 3. Funkční požadavky a responzivní chování (Mobile-First -> Desktop)

### Globální navigace (Zákaznická část)
* **Mobil (`< 768px`):** Fixní spodní lišta s 5 položkami a vyvýšeným středovým FAB tlačítkem „Kartička“.
* **Desktop (`>= 768px`):** Spodní lišta se transformuje na horní navigační bar (Header) nebo levý boční panel (Sidebar) s logem „U Sousedů“, přičemž položka „Kartička“ je vizuálně zvýrazněná jako primární akční tlačítko.

### A. Klientská část – Zákazník
1. **Autentizace:** Přihlášení přes e-mail/heslo nebo Google OAuth, registrace a obnova hesla.
   * *Mobil:* Formulář přes celou obrazovku s pozadím latte art v horní části.
   * *Desktop:* Split-screen layout (vlevo velká fotografie kavárny/kávy, vpravo centrovaný přihlašovací formulář) podobně jako u přihlášení do administrace.
2. **Domů (Dashboard):**
   * Věrnostní karta: Vizuální stav účtu (7/10 káv, „Každá 10. káva zdarma!“) s ikonami šálků a 10. pozicí jako odměnou (hvězda).
   * Výpis nadcházejících akcí (obrázek, datum, čas, název) a přehled poboček.
   * *Mobil:* Prvky pod sebou, akce v horizontálním posuvníku (carousel).
   * *Desktop:* Dvousloupcový až třísloupcový asymetrický grid (vlevo věrnostní karta, vpravo mřížka nadcházejících akcí a pod nimi karty poboček).
3. **Nabídka (Menu):** Výpis položek podle kategorií (Teplé nápoje, Studené nápoje, Alkoholické nápoje, Brunch) s názvem, tečkovanou vodící linkou a cenou v Kč.
   * *Mobil:* Kategorie řazené vertikálně pod sebou.
   * *Desktop:* Dvousloupcový grid kategorií vedle sebe (stejné rozložení, jaké využívá desktopová editace nabídky).
4. **Moje kartička:** Detail zákaznického QR kódu, unikátní číslo kartičky (`0042 1187`) a aktuální stav bodů.
   * *Mobil i Desktop:* Centrovaná karta (`max-w-md mx-auto`), na desktopu může být zobrazena i jako modální okno po kliknutí na tlačítko v navigaci.
5. **Můj účet:** Zobrazení e-mailu, maskovaného hesla a čísla kartičky. Akce pro změnu údajů, smazání účtu a odhlášení.
   * *Mobil:* Jednosloupcový layout.
   * *Desktop:* Centrovaný panel účtu s akčními tlačítky vedle sebe.
6. **Další (O nás & Nastavení):** Sekce „O nás“ s fotkou, přepínače (toggles) pro notifikace, výpis aktuality a správa GDPR souhlasů.
   * *Mobil:* Sekce pod sebou.
   * *Desktop:* Dvousloupcový layout (vlevo sekce „O nás“ s fotografií, vpravo panel „Zprávy a upozornění“ a „Správa souhlasů“).

### B. Rozhraní pro baristy
1. **Skener QR kódů:** Rozhraní s přístupem ke kameře (vč. možnosti simulace skenu) pro načtení QR kódu zákazníka.
   * *Mobil i Desktop:* Horní lišta se jménem baristy (`Tereza N.`) a odhlášením, pod ní centrovaný čtvercový hledáček kamery (`max-w-lg mx-auto`), použitelný na mobilu i na pokladním tabletu/PC s webkamerou.

### C. Administrace (`admin.usousedu.cz`)
1. **Login administrace:** Přihlašovací obrazovka pro správce.
   * *Mobil:* Centrovaný formulář s podkresovým obrázkem.
   * *Desktop:* Split-screen s fotografií interiéru kavárny a claimem „Kavárna, kde se sousedé potkávají.“ vlevo a formulářem vpravo.
2. **Přehled kavárny (Dashboard):** 4 hlavní navigační karty (Nabídka, Akce, Správa zaměstnanců, Zprávy v aplikaci).
   * *Mobil:* Karty pod sebou (`grid-cols-1`).
   * *Desktop:* Mřížka 2x2 (`md:grid-cols-2`).
3. **Editace nabídky:** Hromadná úprava názvů a cen položek v kategoriích, přidávání položek (`+ Přidat položku`) a uložení/zrušení změn.
   * *Mobil:* Kategorie pod sebou, hlavička s tlačítky „Uložit změny“ / „Zrušit změny“ zarovnaná pod nadpisem.
   * *Desktop:* Dvousloupcový grid kategorií (`lg:grid-cols-2`), akční tlačítka vpravo nahoře vedle nadpisu.

## 4. Databázové schéma (Supabase PostgreSQL)
* `profiles`: `id` (UUID, PK, vazba na `auth.users`), `email`, `full_name`, `role` (`customer` | `staff` | `admin`), `card_number` (unique, např. `'0042 1187'`), `coffee_count` (int, 0–10), `notify_events` (bool), `notify_messages` (bool), `gdpr_consent` (bool).
* `categories`: `id`, `name`, `sort_order`.
* `menu_items`: `id`, `category_id` (FK), `name`, `price` (int), `is_active` (bool).
* `events`: `id`, `title`, `event_date` (timestamptz), `image_url`.
* `app_messages`: `id`, `title`, `body`, `created_at`.
* `loyalty_logs`: `id`, `customer_id` (FK), `staff_id` (FK), `action` (`add_point` | `redeem_reward`), `created_at`.