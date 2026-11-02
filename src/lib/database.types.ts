export type UserRole = 'customer' | 'staff' | 'admin';
export type LoyaltyAction = 'add_point' | 'redeem_reward';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  card_number: string;
  coffee_count: number;
  notify_events: boolean;
  notify_messages: boolean;
  gdpr_consent: boolean;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  is_active: boolean;
}

export interface CafeEvent {
  id: string;
  title: string;
  event_date: string;
  image_url: string;
}

export interface AppMessage {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface LoyaltyLog {
  id: string;
  customer_id: string;
  staff_id: string | null;
  action: LoyaltyAction;
  created_at: string;
}

export interface ScanCardResult {
  customer_id: string;
  full_name: string;
  card_number: string;
  previous_count: number;
  new_count: number;
  action: LoyaltyAction;
  reward_redeemed: boolean;
  message: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'> & { id?: string };
        Update: Partial<Omit<Category, 'id'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id'> & { id?: string };
        Update: Partial<Omit<MenuItem, 'id'>>;
      };
      events: {
        Row: CafeEvent;
        Insert: Omit<CafeEvent, 'id'> & { id?: string };
        Update: Partial<Omit<CafeEvent, 'id'>>;
      };
      app_messages: {
        Row: AppMessage;
        Insert: Omit<AppMessage, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AppMessage, 'id'>>;
      };
      loyalty_logs: {
        Row: LoyaltyLog;
        Insert: Omit<LoyaltyLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<LoyaltyLog, 'id'>>;
      };
    };
    Functions: {
      scan_customer_card: {
        Args: { card_num: string };
        Returns: ScanCardResult;
      };
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
}
