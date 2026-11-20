import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  LogOut,
  MessageSquare,
  ScanLine,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Wrench,
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
  const [toolsOpen, setToolsOpen] = useState(false);

  const staffMembers = profiles.filter(
    (p) => p.role === 'staff' || p.role === 'admin'
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col w-full overflow-x-hidden">
      {/* Čistá horní navigační lišta administrace */}
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

        {/* Mobil: 1 sloupec pod sebou (grid-cols-1 gap-4) -> Desktop: 2x2 (md:grid-cols-2 gap-6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Karta 1: Nabídka */}
          <Link
            to="/admin/menu"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 shadow-xl transition group active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {categories.length} kat. • {menuItems.length} položek
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                Nabídka
              </h2>
              <p className="text-xs sm:text-sm text-[#A39284] mt-1">
                Správa kategorií, nápojů a aktuálních cen v nabídce.
              </p>
            </div>

            <div className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#D89D60] group-hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2 transition mt-auto">
              <span>Upravit nabídku</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Karta 2: Kulturní akce */}
          <Link
            to="/admin/events"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 shadow-xl transition group active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {events.length} akcí
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                Kulturní akce
              </h2>
              <p className="text-xs sm:text-sm text-[#A39284] mt-1">
                Plánování cuppingů, koncertů a sousedských akcí.
              </p>
            </div>

            <div className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-sm flex items-center justify-center gap-2 transition mt-auto">
              <span>Spravovat akce</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </div>
          </Link>

          {/* Karta 3: Správa zaměstnanců */}
          <Link
            to="/admin/staff"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 shadow-xl transition group active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {staffMembers.length} v týmu
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                Zaměstnanci
              </h2>
              <p className="text-xs sm:text-sm text-[#A39284] mt-1">
                Správa členů obsluhy a jejich přístupových práv.
              </p>
            </div>

            <div className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-sm flex items-center justify-center gap-2 transition mt-auto">
              <span>Správa týmu</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </div>
          </Link>

          {/* Karta 4: Zprávy v aplikaci */}
          <Link
            to="/admin/messages"
            className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60] rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 shadow-xl transition group active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] group-hover:scale-105 transition shrink-0">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {messages.length} zpráv
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                Zprávy v aplikaci
              </h2>
              <p className="text-xs sm:text-sm text-[#A39284] mt-1">
                Rozesílání novinek na mlýnku a oznámení zákazníkům.
              </p>
            </div>

            <div className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#221912] group-hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] group-hover:text-[#D89D60] font-bold text-sm flex items-center justify-center gap-2 transition mt-auto">
              <span>Otevřít zprávy</span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </div>
          </Link>
        </div>

        {/* Schovaná servisní sekce: Kalibrace skeneru a náhled zákaznické aplikace */}
        <section className="bg-[#2D221A]/70 border border-[#3E3025] rounded-3xl overflow-hidden">
          <button
            type="button"
            onClick={() => setToolsOpen((prev) => !prev)}
            aria-expanded={toolsOpen}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#2D221A] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#A39284]">
                <Wrench className="w-4 h-4 text-[#D89D60]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F5EBE1]">
                  Servisní nástroje a kalibrace
                </h2>
                <p className="text-[11px] text-[#A39284]">
                  Test / kalibrace pokladního skeneru a náhled zákaznické PWA
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#A39284] transition-transform ${
                toolsOpen ? 'rotate-180 text-[#D89D60]' : ''
              }`}
            />
          </button>

          {toolsOpen && (
            <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-[#3E3025] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/scanner"
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] transition group"
              >
                <div className="flex items-center gap-3">
                  <ScanLine className="w-5 h-5 text-[#D89D60] shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                      Kalibrace pokladního skeneru
                    </p>
                    <p className="text-[11px] text-[#A39284]">
                      Ověření kamery a čtení QR kódů
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A39284] group-hover:text-[#D89D60] shrink-0" />
              </Link>

              <Link
                to="/app/home"
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] transition group"
              >
                <div className="flex items-center gap-3">
                  <CoffeeBeanIcon className="w-5 h-5 text-[#D89D60] shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5EBE1] group-hover:text-[#D89D60] transition">
                      Náhled zákaznické PWA
                    </p>
                    <p className="text-[11px] text-[#A39284]">
                      Zkontrolovat vzhled pro hosty
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A39284] group-hover:text-[#D89D60] shrink-0" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
