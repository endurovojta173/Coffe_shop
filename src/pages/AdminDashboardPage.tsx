import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  LogOut,
  MessageSquare,
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
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            Správa kavárny
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            Přehled kavárny
          </h1>
          <p className="text-xs sm:text-sm text-[#A39284] mt-1">
            Vyberte sekci pro správu nabídky, kulturních akcí, baristického týmu nebo zpráv v aplikaci.
          </p>
        </div>

        {/* 4 hlavní navigační karty: 2 vedle sebe na mobilu i desktopu, přesně 2 řádky */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Řádek 1 - Karta 1: Nabídka */}
          <Link
            to="/admin/menu"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6 shadow-xl transition group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <UtensilsCrossed className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[10px] sm:text-xs font-semibold text-[#D89D60] truncate">
                <span className="hidden sm:inline">{categories.length} kat. • </span>{menuItems.length} položek
              </span>
            </div>

            <div>
              <h2 className="text-sm sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition truncate">
                Nabídka
              </h2>
              <p className="text-[11px] sm:text-sm text-[#A39284] mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                Správa kategorií, nápojů a aktuálních cen v nabídce.
              </p>
            </div>

            <div className="w-full py-2 sm:py-3.5 px-2.5 sm:px-6 rounded-full bg-[#D89D60] group-hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition mt-auto">
              <span>Upravit nabídku</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </Link>

          {/* Řádek 1 - Karta 2: Akce */}
          <Link
            to="/admin/events"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6 shadow-xl transition group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <Calendar className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[10px] sm:text-xs font-semibold text-[#D89D60] truncate">
                {events.length} akcí
              </span>
            </div>

            <div>
              <h2 className="text-sm sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition truncate">
                Kulturní akce
              </h2>
              <p className="text-[11px] sm:text-sm text-[#A39284] mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                Plánování cuppingů, koncertů a sousedských akcí.
              </p>
            </div>

            <div className="w-full py-2 sm:py-3.5 px-2.5 sm:px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition mt-auto">
              <span>Spravovat akce</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D89D60]" />
            </div>
          </Link>

          {/* Řádek 2 - Karta 1: Správa zaměstnanců */}
          <Link
            to="/admin/staff"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6 shadow-xl transition group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <Users className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[10px] sm:text-xs font-semibold text-[#D89D60] truncate">
                {staffMembers.length} v týmu
              </span>
            </div>

            <div>
              <h2 className="text-sm sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition truncate">
                Zaměstnanci
              </h2>
              <p className="text-[11px] sm:text-sm text-[#A39284] mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                Správa členů obsluhy a jejich přístupových práv.
              </p>
            </div>

            <div className="w-full py-2 sm:py-3.5 px-2.5 sm:px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition mt-auto">
              <span>Správa týmu</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D89D60]" />
            </div>
          </Link>

          {/* Řádek 2 - Karta 2: Zprávy v aplikaci */}
          <Link
            to="/admin/messages"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 flex flex-col justify-between gap-3 sm:gap-6 shadow-xl transition group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[10px] sm:text-xs font-semibold text-[#D89D60] truncate">
                {messages.length} zpráv
              </span>
            </div>

            <div>
              <h2 className="text-sm sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition truncate">
                Zprávy v aplikaci
              </h2>
              <p className="text-[11px] sm:text-sm text-[#A39284] mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                Rozesílání novinek na mlýnku a oznámení zákazníkům.
              </p>
            </div>

            <div className="w-full py-2 sm:py-3.5 px-2.5 sm:px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition mt-auto">
              <span>Otevřít zprávy</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D89D60]" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
