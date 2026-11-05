import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  LogOut,
  MessageSquare,
  Plus,
  ScanLine,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CoffeeBeanIcon } from '../components/CoffeeBeanIcon';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    categories,
    menuItems,
    events,
    profiles,
    messages,
    logout,
  } = useAppState();
  const navigate = useNavigate();

  const staffMembers = profiles.filter(
    (p) => p.role === 'staff' || p.role === 'admin'
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col w-full overflow-x-hidden">
      {/* Horní navigační lišta administrace */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="font-serif-heading text-base sm:text-xl font-bold text-[#F5EBE1] block leading-none truncate">
                U Sousedů • Administrace
              </span>
              <span className="text-[11px] sm:text-xs text-[#A39284] truncate block mt-0.5">
                Správce: {currentUser?.full_name ?? 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/app/home"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs font-medium text-[#F5EBE1] transition"
            >
              <CoffeeBeanIcon className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Zákaznická PWA</span>
            </Link>
            <Link
              to="/scanner"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs font-medium text-[#F5EBE1] transition"
            >
              <ScanLine className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Skener</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              title="Odhlásit se"
              aria-label="Odhlásit se"
              className="w-9 h-9 rounded-full bg-[#221912] hover:border-[#D96B6B] border border-[#3E3025] text-[#A39284] hover:text-[#D96B6B] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hlavní obsah dashboardu */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Správa kavárny
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
              Přehled kavárny
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Vyberte sekci pro správu nabídky, kulturních akcí, baristického týmu nebo zpráv v aplikaci.
            </p>
          </div>

          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-semibold text-sm shadow-lg shadow-[#D89D60]/20 transition self-start sm:self-auto"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Upravit denní nabídku</span>
          </Link>
        </div>

        {/* 4 hlavní navigační karty: Grid 2x2 dle AGENTS.md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 1. Karta: Nabídka */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {categories.length} kategorie • {menuItems.length} položek
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">Nabídka</h2>
              <p className="text-sm text-[#A39284] mt-1">
                Správa kategorií, nápojů, jídla a aktuálních cen pro stálou i sezónní nabídku.
              </p>
            </div>

            <Link
              to="/admin/menu"
              className="w-full py-3.5 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>Otevřít editaci nabídky</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. Karta: Akce */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {events.length} naplánovaných akcí
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">Kulturní akce</h2>
              <p className="text-sm text-[#A39284] mt-1">
                Plánování cuppingů, koncertů a sousedských akcí zobrazovaných na domovské stránce zákazníků.
              </p>
            </div>

            <Link
              to="/admin/events"
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>Otevřít správu akcí</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </Link>
          </div>

          {/* 3. Karta: Správa zaměstnanců */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Users className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {staffMembers.length} členů obsluhy
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">
                Správa zaměstnanců
              </h2>
              <p className="text-sm text-[#A39284] mt-1">
                Přiřazování rolí (Zákazník, Barista, Správce) pro přístup k pokladnímu skeneru a administraci.
              </p>
            </div>

            <Link
              to="/admin/staff"
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>Otevřít správu zaměstnanců</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </Link>
          </div>

          {/* 4. Karta: Zprávy v aplikaci */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {messages.length} publikovaných zpráv
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">
                Zprávy v aplikaci
              </h2>
              <p className="text-sm text-[#A39284] mt-1">
                Rozesílání aktualit, zpráv o novinkách na mlýnku a oznámení všem zákazníkům do aplikace.
              </p>
            </div>

            <Link
              to="/admin/messages"
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>Otevřít zprávy v aplikaci</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </Link>
          </div>
        </div>

        {/* Rychlé zkratky pro přidání */}
        <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-[#F5EBE1] mb-4">
            Rychlé akce
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/admin/events"
              className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-sm text-[#F5EBE1] font-semibold flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#D89D60]" />
                <span>Přidat novou akci</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A39284] group-hover:text-[#D89D60] transition" />
            </Link>

            <Link
              to="/admin/messages"
              className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-sm text-[#F5EBE1] font-semibold flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#D89D60]" />
                <span>Napsat zprávu zákazníkům</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A39284] group-hover:text-[#D89D60] transition" />
            </Link>

            <Link
              to="/admin/menu"
              className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-sm text-[#F5EBE1] font-semibold flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#D89D60]" />
                <span>Přidat položku nabídky</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A39284] group-hover:text-[#D89D60] transition" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
