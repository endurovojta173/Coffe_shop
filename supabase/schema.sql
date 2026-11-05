-- =============================================================================
-- U Sousedů - Kompletní produkční databázové schéma, RLS, Auth Trigger a RPC
-- =============================================================================

-- 1. Vlastní ENUM typy
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE loyalty_action AS ENUM ('add_point', 'redeem_reward');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Funkce pro generování unikátního čísla kartičky (formát '0042 1187')
CREATE OR REPLACE FUNCTION public.generate_unique_card_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_candidate TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_candidate := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
                   || ' ' ||
                   lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE card_number = v_candidate) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_candidate;
END;
$$;

-- 3. Tabulka profilů (vazba na auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Zákazník',
  role user_role NOT NULL DEFAULT 'customer',
  card_number TEXT UNIQUE NOT NULL DEFAULT public.generate_unique_card_number(),
  coffee_count INT NOT NULL DEFAULT 0 CHECK (coffee_count >= 0),
  notify_events BOOLEAN NOT NULL DEFAULT true,
  notify_messages BOOLEAN NOT NULL DEFAULT true,
  gdpr_consent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uvolnění limitu pro coffee_count, aby zákazník mohl sbírat neomezeně více jak 10 káv
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_coffee_count_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_coffee_count_check CHECK (coffee_count >= 0);

-- 4. Trigger pro automatické založení profilu při registraci v Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    card_number,
    coffee_count,
    notify_events,
    notify_messages,
    gdpr_consent
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'Zákazník'), '@', 1)),
    'customer',
    public.generate_unique_card_number(),
    0,
    true,
    true,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Tabulka kategorií nabídky
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 6. Tabulka položek nabídky
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INT NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 7. Tabulka nadcházejících akcí
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  image_url TEXT NOT NULL
);

-- 8. Tabulka zpráv v aplikaci
CREATE TABLE IF NOT EXISTS public.app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabulka historie věrnostního programu
CREATE TABLE IF NOT EXISTS public.loyalty_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action loyalty_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_logs ENABLE ROW LEVEL SECURITY;

-- Pomocná funkce pro ověření role aktuálního uživatele
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Veřejné čtení pro categories, menu_items, events, app_messages
DROP POLICY IF EXISTS "Categories select for everyone" ON public.categories;
CREATE POLICY "Categories select for everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Menu items select for everyone" ON public.menu_items;
CREATE POLICY "Menu items select for everyone" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events select for everyone" ON public.events;
CREATE POLICY "Events select for everyone" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "App messages select for everyone" ON public.app_messages;
CREATE POLICY "App messages select for everyone" ON public.app_messages FOR SELECT USING (true);

-- Zápis pouze pro admina
DROP POLICY IF EXISTS "Categories admin write" ON public.categories;
CREATE POLICY "Categories admin write" ON public.categories FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Menu items admin write" ON public.menu_items;
CREATE POLICY "Menu items admin write" ON public.menu_items FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Events admin write" ON public.events;
CREATE POLICY "Events admin write" ON public.events FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "App messages admin write" ON public.app_messages;
CREATE POLICY "App messages admin write" ON public.app_messages FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Politiky pro profiles:
DROP POLICY IF EXISTS "Profiles select own or staff/admin" ON public.profiles;
CREATE POLICY "Profiles select own or staff/admin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.get_my_role() IN ('staff', 'admin'));

DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles update own or admin" ON public.profiles;
CREATE POLICY "Profiles update own or admin" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_my_role() = 'admin')
  WITH CHECK (auth.uid() = id OR public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Profiles delete own or admin" ON public.profiles;
CREATE POLICY "Profiles delete own or admin" ON public.profiles FOR DELETE
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

-- Trigger chránící sloupce role a coffee_count před přímým klientským UPDATEm od zákazníka
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Povolit změny při explicitním nastavení bypassu
  IF current_setting('app.bypass_profile_guard', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- 2. Povolit změny pro databázového superusera (SQL Editor, migrace v dashboardu)
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- 3. Povolit změny pro service_role (např. Supabase Table Editor nebo backend skripty)
  IF (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- 4. Povolit změny, pokud je přihlášený uživatel administrátor aplikace
  IF public.get_my_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Zákaz přímé změny role a počtu káv pro běžné klienty
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Nelze měnit uživatelskou roli přímo.';
  END IF;

  IF NEW.coffee_count IS DISTINCT FROM OLD.coffee_count THEN
    RAISE EXCEPTION 'Stav káv lze měnit pouze přes RPC funkci scan_customer_card.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- =============================================================================
-- Pomocná funkce pro bezpečné nastavení role v Supabase SQL Editoru
-- Příklad použití: SELECT public.set_user_role('vojtechbrenekprace@gmail.com', 'staff');
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_user_role(target_email TEXT, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.bypass_profile_guard', 'on', true);
  UPDATE public.profiles
  SET role = new_role
  WHERE lower(trim(email)) = lower(trim(target_email));
END;
$$;

-- Politiky pro loyalty_logs
DROP POLICY IF EXISTS "Loyalty logs select own or staff/admin" ON public.loyalty_logs;
CREATE POLICY "Loyalty logs select own or staff/admin" ON public.loyalty_logs FOR SELECT
  USING (customer_id = auth.uid() OR public.get_my_role() IN ('staff', 'admin'));

-- =============================================================================
-- RPC Funkce: scan_customer_card(card_num TEXT) - přičtení bonusové kávy
-- Zákazník může sbírat neomezeně káv (např. 10, 11, 20 káv).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.scan_customer_card(card_num TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_customer public.profiles%ROWTYPE;
  v_normalized_input TEXT;
  v_new_count INT;
  v_free_coffees INT;
BEGIN
  -- 1. Ověření oprávnění volajícího (pouze staff nebo admin)
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('staff', 'admin') THEN
    RAISE EXCEPTION 'Přístup odepřen: Pouze barista nebo správce může načítat karty.';
  END IF;

  -- Normalizace čísla karty (odstranění mezer pro flexibilní vyhledání)
  v_normalized_input := regexp_replace(trim(card_num), '\s+', '', 'g');

  -- 2. Vyhledání zákazníka
  SELECT * INTO v_customer
  FROM public.profiles
  WHERE regexp_replace(card_number, '\s+', '', 'g') = v_normalized_input
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Zákaznická karta s číslem "%" nebyla nalezena.', card_num;
  END IF;

  -- Povolení interní úpravy coffee_count v rámci této transakce
  PERFORM set_config('app.bypass_profile_guard', 'on', true);

  -- 3. Inkrementace bodů (zákazník sbírá dál i nad 10 káv)
  v_new_count := v_customer.coffee_count + 1;

  UPDATE public.profiles
  SET coffee_count = v_new_count
  WHERE id = v_customer.id;

  INSERT INTO public.loyalty_logs (customer_id, staff_id, action)
  VALUES (v_customer.id, auth.uid(), 'add_point');

  v_free_coffees := FLOOR(v_new_count / 10);

  RETURN jsonb_build_object(
    'customer_id', v_customer.id,
    'full_name', v_customer.full_name,
    'card_number', v_customer.card_number,
    'previous_count', v_customer.coffee_count,
    'new_count', v_new_count,
    'action', 'add_point',
    'reward_redeemed', false,
    'free_coffees_available', v_free_coffees,
    'message', CASE
      WHEN v_free_coffees = 1 THEN format('Bod za kávu byl připsán (celkem %s káv). Zákazník má nárok na 1 kávu zdarma!', v_new_count)
      WHEN v_free_coffees BETWEEN 2 AND 4 THEN format('Bod za kávu byl připsán (celkem %s káv). Zákazník má nárok na %s kávy zdarma!', v_new_count, v_free_coffees)
      WHEN v_free_coffees >= 5 THEN format('Bod za kávu byl připsán (celkem %s káv). Zákazník má nárok na %s káv zdarma!', v_new_count, v_free_coffees)
      ELSE format('Bod za kávu byl úspěšně připsán (celkem %s káv, do odměny zbývá %s).', v_new_count, 10 - (v_new_count % 10))
    END
  );
END;
$$;

-- =============================================================================
-- RPC Funkce: redeem_free_coffee(card_num TEXT) - uplatnění 1 kávy zdarma
-- Odečte 10 káv zákazníkovi pouze v případě, že má coffee_count >= 10.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.redeem_free_coffee(card_num TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_customer public.profiles%ROWTYPE;
  v_normalized_input TEXT;
  v_new_count INT;
  v_free_coffees INT;
BEGIN
  -- 1. Ověření oprávnění volajícího (pouze staff nebo admin)
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('staff', 'admin') THEN
    RAISE EXCEPTION 'Přístup odepřen: Pouze barista nebo správce může uplatňovat odměny.';
  END IF;

  -- Normalizace čísla karty
  v_normalized_input := regexp_replace(trim(card_num), '\s+', '', 'g');

  -- 2. Vyhledání zákazníka
  SELECT * INTO v_customer
  FROM public.profiles
  WHERE regexp_replace(card_number, '\s+', '', 'g') = v_normalized_input
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Zákaznická karta s číslem "%" nebyla nalezena.', card_num;
  END IF;

  -- 3. Ověření minimálního počtu káv (alespoň 10 káv pro 1 kávu zdarma)
  IF v_customer.coffee_count < 10 THEN
    RAISE EXCEPTION 'Zákazník nemá dostatek káv pro uplatnění odměny (má pouze %s káv, minimum pro kávu zdarma je 10).', v_customer.coffee_count;
  END IF;

  -- Povolení interní úpravy coffee_count
  PERFORM set_config('app.bypass_profile_guard', 'on', true);

  -- 4. Odečtení 10 káv za 1 uplatněnou odměnu
  v_new_count := v_customer.coffee_count - 10;

  UPDATE public.profiles
  SET coffee_count = v_new_count
  WHERE id = v_customer.id;

  INSERT INTO public.loyalty_logs (customer_id, staff_id, action)
  VALUES (v_customer.id, auth.uid(), 'redeem_reward');

  v_free_coffees := FLOOR(v_new_count / 10);

  RETURN jsonb_build_object(
    'customer_id', v_customer.id,
    'full_name', v_customer.full_name,
    'card_number', v_customer.card_number,
    'previous_count', v_customer.coffee_count,
    'new_count', v_new_count,
    'action', 'redeem_reward',
    'reward_redeemed', true,
    'free_coffees_available', v_free_coffees,
    'message', CASE
      WHEN v_free_coffees = 1 THEN format('Káva zdarma byla úspěšně uplatněna (-10 káv)! Zákazníkovi zbývá %s káv (stále nárok na 1 další kávu zdarma).', v_new_count)
      WHEN v_free_coffees BETWEEN 2 AND 4 THEN format('Káva zdarma byla úspěšně uplatněna (-10 káv)! Zákazníkovi zbývá %s káv (stále nárok na %s další kávy zdarma).', v_new_count, v_free_coffees)
      WHEN v_free_coffees >= 5 THEN format('Káva zdarma byla úspěšně uplatněna (-10 káv)! Zákazníkovi zbývá %s káv (stále nárok na %s dalších káv zdarma).', v_new_count, v_free_coffees)
      ELSE format('Káva zdarma byla úspěšně uplatněna (-10 káv)! Zákazníkovi zbývá %s káv (do další odměny zbývá %s).', v_new_count, 10 - (v_new_count % 10))
    END
  );
END;
$$;

-- =============================================================================
-- RPC Funkce pro smazání vlastního účtu zákazníkem
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Uživatel není přihlášen.';
  END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- =============================================================================
-- Výchozí katalog (Seed data pro kategorie, položky, akce a zprávy)
-- =============================================================================
DO $$
DECLARE
  v_cat_hot UUID;
  v_cat_cold UUID;
  v_cat_alcohol UUID;
  v_cat_brunch UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories) THEN
    INSERT INTO public.categories (name, sort_order) VALUES ('Teplé nápoje', 1) RETURNING id INTO v_cat_hot;
    INSERT INTO public.categories (name, sort_order) VALUES ('Studené nápoje', 2) RETURNING id INTO v_cat_cold;
    INSERT INTO public.categories (name, sort_order) VALUES ('Alkoholické nápoje', 3) RETURNING id INTO v_cat_alcohol;
    INSERT INTO public.categories (name, sort_order) VALUES ('Brunch', 4) RETURNING id INTO v_cat_brunch;

    INSERT INTO public.menu_items (category_id, name, price, is_active) VALUES
      (v_cat_hot, 'Espresso / Ristretto', 62, true),
      (v_cat_hot, 'Double Espresso (Doppio)', 78, true),
      (v_cat_hot, 'Cappuccino s hedvábnou pěnou', 85, true),
      (v_cat_hot, 'Flat White', 95, true),
      (v_cat_hot, 'Caffé Latte', 92, true),
      (v_cat_hot, 'Batch Brew (dle denního výběru)', 79, true),
      (v_cat_hot, 'Horká belgická čokoláda se šlehačkou', 98, true),
      (v_cat_cold, 'Espresso Tonic s rozmarýnem', 105, true),
      (v_cat_cold, 'Iced Caramel Latte', 99, true),
      (v_cat_cold, 'Cold Brew 24h (Etiopie)', 95, true),
      (v_cat_cold, 'Domácí malinová limonáda s mátou', 78, true),
      (v_cat_cold, 'Matcha Iced Latte (ovesné mléko)', 108, true),
      (v_cat_alcohol, 'Espresso Martini', 165, true),
      (v_cat_alcohol, 'Aperol Spritz s pomerančem', 145, true),
      (v_cat_alcohol, 'Prosecco DOC Brut (0,1 l)', 89, true),
      (v_cat_alcohol, 'Mimosa (čerstvý pomerančový džus)', 135, true),
      (v_cat_brunch, 'Avokádový kváskový chléb se zastřeným vejcem', 195, true),
      (v_cat_brunch, 'Vejce Benedikt s holandskou omáčkou a slaninou', 215, true),
      (v_cat_brunch, 'Domácí lívance s borůvkovým žahourem a mascarpone', 185, true),
      (v_cat_brunch, 'Máslový croissant s pistáciovým krémem', 95, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.events) THEN
    INSERT INTO public.events (title, event_date, image_url) VALUES
      ('Večerní Cupping: Výběrová káva z Kolumbie a Etiopie', '2026-11-12T18:00:00+01:00', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80'),
      ('Akustický jazzový podvečer u krbu', '2026-11-19T19:30:00+01:00', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80'),
      ('Kurz domácího Latte Artu s baristkou Terezou', '2026-11-26T16:30:00+01:00', 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80'),
      ('Nedělní sousedský brunch & bezedná Mimosa', '2026-11-29T10:00:00+01:00', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.app_messages) THEN
    INSERT INTO public.app_messages (title, body) VALUES
      ('Podzimní novinka na mlýnku: Etiopie Yirgacheffe', 'Od dnešního rána pro vás připravujeme promytou Etiopii s tóny bergamotu, jasmínu a zralých broskví. Zastavte se na filtr nebo espresso!'),
      ('Dvojnásobné body každé úterý odpoledne', 'Přijďte si zpříjemnit úterní odpoledne mezi 14:00 a 17:00 a ke každé kávě s dezertem získáte extra věrnostní bod na svou kartičku.');
  END IF;
END $$;

-- =============================================================================
-- Realtime publikace pro živé překreslování bodů a menu v aplikaci
-- =============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles, menu_items, events, app_messages;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

