import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AppMessage,
  CafeEvent,
  Category,
  LoyaltyLog,
  MenuItem,
  Profile,
  ScanCardResult,
  UserRole,
} from '../lib/database.types';
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';

export function generateCardNumber(): string {
  const part1 = String(Math.floor(1000 + Math.random() * 9000));
  const part2 = String(Math.floor(1000 + Math.random() * 9000));
  return `${part1} ${part2}`;
}

interface AppStateContextValue {
  isLoadingAuth: boolean;
  isConfigured: boolean;
  currentUser: Profile | null;
  profiles: Profile[];
  categories: Category[];
  menuItems: MenuItem[];
  events: CafeEvent[];
  messages: AppMessage[];
  loyaltyLogs: LoyaltyLog[];
  isCardModalOpen: boolean;
  setCardModalOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  loginWithEmail: (
    email: string,
    password: string,
    requiredRole?: UserRole | 'any'
  ) => Promise<{ ok: boolean; error?: string; profile?: Profile }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  registerCustomer: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; profile?: Profile }>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (
    patch: Partial<
      Pick<
        Profile,
        'full_name' | 'email' | 'notify_events' | 'notify_messages' | 'gdpr_consent'
      >
    >
  ) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  deleteCurrentUserAccount: () => Promise<{ ok: boolean; error?: string }>;
  scanCustomerCard: (cardNumber: string) => Promise<ScanCardResult>;
  saveMenuChanges: (
    nextCategories: Category[],
    nextMenuItems: MenuItem[],
    deletedItemIds: string[]
  ) => Promise<{ ok: boolean; error?: string }>;
  addEvent: (event: Omit<CafeEvent, 'id'>) => Promise<{ ok: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<{ ok: boolean; error?: string }>;
  addAppMessage: (
    title: string,
    body: string
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteAppMessage: (id: string) => Promise<{ ok: boolean; error?: string }>;
  updateUserRole: (
    userId: string,
    role: UserRole
  ) => Promise<{ ok: boolean; error?: string }>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(isSupabaseConfigured);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [events, setEvents] = useState<CafeEvent[]>([]);
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyLog[]>([]);
  const [isCardModalOpen, setCardModalOpen] = useState<boolean>(false);

  const ensureOrLoadProfile = useCallback(
    async (userId: string, email: string, metaFullName?: string): Promise<Profile | null> => {
      const client = supabase;
      if (!client) return null;

      // Vyzkoušíme načíst profil (databázový trigger on_auth_user_created může potřebovat pár milisekund)
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data: existingProfile } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfile) {
          return existingProfile as Profile;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const fallbackName =
        metaFullName?.trim() || email.split('@')[0] || 'Zákazník';

      const newProfile: Profile = {
        id: userId,
        email,
        full_name: fallbackName,
        role: 'customer',
        card_number: generateCardNumber(),
        coffee_count: 0,
        notify_events: true,
        notify_messages: true,
        gdpr_consent: true,
      };

      const { data: created, error: insertError } = await client
        .from('profiles')
        .insert(newProfile as never)
        .select('*')
        .single();

      if (insertError) {
        const { data: retryProfile } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (retryProfile) return retryProfile as Profile;
        return null;
      }
      return created as Profile;
    },
    []
  );

  const refreshData = useCallback(async () => {
    const client = supabase;
    if (!client) return;

    const [catRes, itemRes, evtRes, msgRes] = await Promise.all([
      client.from('categories').select('*').order('sort_order', { ascending: true }),
      client.from('menu_items').select('*'),
      client.from('events').select('*').order('event_date', { ascending: true }),
      client.from('app_messages').select('*').order('created_at', { ascending: false }),
    ]);

    if (catRes.data) setCategories(catRes.data as Category[]);
    if (itemRes.data) setMenuItems(itemRes.data as MenuItem[]);
    if (evtRes.data) setEvents(evtRes.data as CafeEvent[]);
    if (msgRes.data) setMessages(msgRes.data as AppMessage[]);

    const {
      data: { session },
    } = await client.auth.getSession();

    if (session?.user) {
      const profile = await ensureOrLoadProfile(
        session.user.id,
        session.user.email ?? '',
        session.user.user_metadata?.full_name as string | undefined
      );
      setCurrentUser(profile);

      if (profile && (profile.role === 'admin' || profile.role === 'staff')) {
        const [profRes, logsRes] = await Promise.all([
          client.from('profiles').select('*').order('full_name', { ascending: true }),
          client
            .from('loyalty_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30),
        ]);
        if (profRes.data) setProfiles(profRes.data as Profile[]);
        if (logsRes.data) setLoyaltyLogs(logsRes.data as LoyaltyLog[]);
      } else if (profile) {
        const { data: ownLogs } = await client
          .from('loyalty_logs')
          .select('*')
          .eq('customer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (ownLogs) setLoyaltyLogs(ownLogs as LoyaltyLog[]);
      }
    }
  }, [ensureOrLoadProfile]);

  // Inicializace autentizace a Realtime odběru ze Supabase
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        await refreshData();
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        setProfiles([]);
        setLoyaltyLogs([]);
        return;
      }
      void (async () => {
        const profile = await ensureOrLoadProfile(
          session.user.id,
          session.user.email ?? '',
          session.user.user_metadata?.full_name as string | undefined
        );
        if (isMounted) {
          setCurrentUser(profile);
        }
        await refreshData();
      })();
    });

    // Realtime synchronizace stavu bodů, menu, akcí a zpráv
    const channel = client
      .channel('usousedu-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          void refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          void refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          void refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_messages' },
        () => {
          void refreshData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      void client.removeChannel(channel);
    };
  }, [ensureOrLoadProfile, refreshData]);

  const loginWithEmail = useCallback(
    async (
      email: string,
      password: string,
      requiredRole: UserRole | 'any' = 'any'
    ): Promise<{ ok: boolean; error?: string; profile?: Profile }> => {
      const client = requireSupabase();
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await client.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        return {
          ok: false,
          error: error?.message ?? 'Neplatný e-mail nebo heslo.',
        };
      }

      const profile = await ensureOrLoadProfile(
        data.user.id,
        data.user.email ?? normalizedEmail,
        data.user.user_metadata?.full_name as string | undefined
      );

      if (!profile) {
        return {
          ok: false,
          error:
            'Profil uživatele se nepodařilo načíst. Ujistěte se, že jste v Supabase spustili migraci supabase/schema.sql.',
        };
      }

      if (requiredRole !== 'any' && profile.role !== requiredRole) {
        await client.auth.signOut();
        setCurrentUser(null);
        return {
          ok: false,
          error: `Přístup odepřen: Tento účet má roli "${profile.role}", ale sekce vyžaduje oprávnění "${requiredRole}".`,
        };
      }

      setCurrentUser(profile);
      await refreshData();
      return { ok: true, profile };
    },
    [ensureOrLoadProfile, refreshData]
  );

  const loginWithGoogle = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/home`,
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/app/account`,
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    },
    []
  );

  const registerCustomer = useCallback(
    async (
      fullName: string,
      email: string,
      password: string
    ): Promise<{ ok: boolean; error?: string; profile?: Profile }> => {
      const client = requireSupabase();
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();

      const { data, error } = await client.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        return {
          ok: false,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          ok: false,
          error: 'Registrace se nezdařila.',
        };
      }

      // Pokud signUp rovnou nevrátil session (např. projekt vyžaduje přihlašovací krok), přihlásíme uživatele automaticky
      let session = data.session;
      if (!session) {
        const { data: signInData, error: signInErr } =
          await client.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (!signInErr && signInData?.session) {
          session = signInData.session;
        }
      }

      // Načteme nebo zajistíme profil uživatele
      const profile = await ensureOrLoadProfile(
        data.user.id,
        normalizedEmail,
        trimmedName
      );

      if (profile) {
        setCurrentUser(profile);
        await refreshData();
        return { ok: true, profile };
      }

      // Pokud Supabase striktně blokuje session kvůli zapnutému potvrzování e-mailů
      if (!session) {
        return {
          ok: false,
          error:
            'Účet byl vytvořen, ale v Supabase máte zapnuté ověřování e-mailů. Vypněte v Supabase: Authentication → Providers → Email → odškrtněte Confirm email, aby vás to pustilo rovnou.',
        };
      }

      return {
        ok: true,
      };
    },
    [ensureOrLoadProfile, refreshData]
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCardModalOpen(false);
  }, []);

  const updateCurrentUserProfile = useCallback(
    async (
      patch: Partial<
        Pick<
          Profile,
          'full_name' | 'email' | 'notify_events' | 'notify_messages' | 'gdpr_consent'
        >
      >
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!currentUser) {
        return { ok: false, error: 'Nejste přihlášeni.' };
      }
      const client = requireSupabase();

      const { data, error } = await client
        .from('profiles')
        .update(patch as never)
        .eq('id', currentUser.id)
        .select('*')
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      if (patch.email && patch.email !== currentUser.email) {
        await client.auth.updateUser({ email: patch.email });
      }

      setCurrentUser(data as Profile);
      return { ok: true };
    },
    [currentUser]
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    },
    []
  );

  const deleteCurrentUserAccount = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    if (!currentUser) {
      return { ok: false, error: 'Nejste přihlášeni.' };
    }
    const client = requireSupabase();

    // Nejprve zkusíme RPC funkci delete_own_account (maže z auth.users + kaskádně profiles)
    const { error: rpcError } = await client.rpc('delete_own_account');
    if (rpcError) {
      // Fallback: smazání záznamu v profiles dle RLS politiky
      const { error: delError } = await client
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);
      if (delError) {
        return { ok: false, error: delError.message };
      }
    }

    await client.auth.signOut();
    setCurrentUser(null);
    setCardModalOpen(false);
    return { ok: true };
  }, [currentUser]);

  const scanCustomerCard = useCallback(
    async (cardNumber: string): Promise<ScanCardResult> => {
      const client = requireSupabase();
      const { data, error } = await client.rpc('scan_customer_card', {
        card_num: cardNumber.trim(),
      } as never);

      if (error) {
        throw new Error(error.message);
      }
      if (!data) {
        throw new Error('RPC funkce scan_customer_card nevrátila žádná data.');
      }

      const result = data as ScanCardResult;
      await refreshData();
      return result;
    },
    [refreshData]
  );

  const saveMenuChanges = useCallback(
    async (
      nextCategories: Category[],
      nextMenuItems: MenuItem[],
      deletedItemIds: string[]
    ): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();

      if (deletedItemIds.length > 0) {
        const { error: delErr } = await client
          .from('menu_items')
          .delete()
          .in('id', deletedItemIds);
        if (delErr) {
          return { ok: false, error: delErr.message };
        }
      }

      if (nextCategories.length > 0) {
        const { error: catErr } = await client
          .from('categories')
          .upsert(nextCategories as never);
        if (catErr) {
          return { ok: false, error: catErr.message };
        }
      }

      if (nextMenuItems.length > 0) {
        const { error: itemErr } = await client
          .from('menu_items')
          .upsert(nextMenuItems as never);
        if (itemErr) {
          return { ok: false, error: itemErr.message };
        }
      }

      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const addEvent = useCallback(
    async (
      event: Omit<CafeEvent, 'id'>
    ): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client.from('events').insert(event as never);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client.from('events').delete().eq('id', id);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const addAppMessage = useCallback(
    async (
      title: string,
      body: string
    ): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client
        .from('app_messages')
        .insert({ title, body } as never);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const deleteAppMessage = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client.from('app_messages').delete().eq('id', id);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const updateUserRole = useCallback(
    async (
      userId: string,
      role: UserRole
    ): Promise<{ ok: boolean; error?: string }> => {
      const client = requireSupabase();
      const { error } = await client
        .from('profiles')
        .update({ role } as never)
        .eq('id', userId);
      if (error) {
        return { ok: false, error: error.message };
      }
      await refreshData();
      return { ok: true };
    },
    [refreshData]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      isLoadingAuth,
      isConfigured: isSupabaseConfigured,
      currentUser,
      profiles,
      categories,
      menuItems,
      events,
      messages,
      loyaltyLogs,
      isCardModalOpen,
      setCardModalOpen,
      refreshData,
      loginWithEmail,
      loginWithGoogle,
      sendPasswordReset,
      registerCustomer,
      logout,
      updateCurrentUserProfile,
      updatePassword,
      deleteCurrentUserAccount,
      scanCustomerCard,
      saveMenuChanges,
      addEvent,
      deleteEvent,
      addAppMessage,
      deleteAppMessage,
      updateUserRole,
    }),
    [
      isLoadingAuth,
      currentUser,
      profiles,
      categories,
      menuItems,
      events,
      messages,
      loyaltyLogs,
      isCardModalOpen,
      refreshData,
      loginWithEmail,
      loginWithGoogle,
      sendPasswordReset,
      registerCustomer,
      logout,
      updateCurrentUserProfile,
      updatePassword,
      deleteCurrentUserAccount,
      scanCustomerCard,
      saveMenuChanges,
      addEvent,
      deleteEvent,
      addAppMessage,
      deleteAppMessage,
      updateUserRole,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
