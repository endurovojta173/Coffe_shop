import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Download,
  Home,
  MoreHorizontal,
  QrCode,
  ScanLine,
  ShieldCheck,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { LoyaltyCardContent } from './LoyaltyCardModal';
import { InstallPwaModal, usePwaInstall } from './InstallPwaModal';
import { CoffeeBeanIcon } from './CoffeeBeanIcon';

export const CustomerLayout: React.FC = () => {
  const { currentUser, isCardModalOpen, setCardModalOpen } = useAppState();
  const { isInstalled } = usePwaInstall();
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const location = useLocation();

  const firstName = currentUser
    ? currentUser.full_name.trim().split(/\s+/)[0] || 'Zákazníku'
    : 'Zákazníku';

  // Oslovení v 5. pádě (např. Jana -> "Ahoj, Jano")
  const greetingName =
    firstName.toLowerCase() === 'jana'
      ? 'Jano'
      : firstName.toLowerCase() === 'petr'
      ? 'Petře'
      : firstName.toLowerCase() === 'tereza'
      ? 'Terezo'
      : firstName.toLowerCase() === 'martin'
      ? 'Martine'
      : firstName.toLowerCase() === 'lukáš' || firstName.toLowerCase() === 'lukas'
      ? 'Lukáši'
      : firstName;

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col pb-24 md:pb-12">
      {/* Pokud má přihlášený uživatel roli staff nebo admin, zobrazíme mu rychlý odkaz do pokladního skeneru / administrace */}
      {currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin') && (
        <div className="bg-[#221912] border-b border-[#3E3025] text-xs text-[#A39284]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-2">
            <span>
              Přihlášen jako zaměstnanec:{' '}
              <strong className="text-[#F5EBE1]">{currentUser.full_name}</strong> ({currentUser.role})
            </span>
            <div className="flex items-center gap-2">
              <Link
                to="/scanner"
                className="px-3 py-1 rounded-full bg-[#2D221A] text-[#F5EBE1] border border-[#3E3025] hover:border-[#D89D60] transition inline-flex items-center gap-1.5"
              >
                <ScanLine className="w-3.5 h-3.5 text-[#D89D60]" />
                <span>Skener baristy</span>
              </Link>
              {currentUser.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1 rounded-full bg-[#2D221A] text-[#F5EBE1] border border-[#3E3025] hover:border-[#D89D60] transition inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D89D60]" />
                  <span>Administrace</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobilní horní lišta (< md) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#1C140D]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <Link to="/app/home" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2D221A] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
              <CoffeeBeanIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-heading text-lg font-bold tracking-tight text-[#F5EBE1] block leading-none">
                U Sousedů
              </span>
              <span className="text-[11px] text-[#A39284]">Rodinná kavárna</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {!isInstalled && (
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                title="Instalovat aplikaci do mobilu"
                className="px-3 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs font-medium text-[#D89D60] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalovat</span>
              </button>
            )}

            <Link
              to="/app/account"
              className="px-3 py-1.5 rounded-full bg-[#2D221A] border border-[#3E3025] text-xs font-medium text-[#F5EBE1] flex items-center gap-1.5"
            >
              <span>{firstName}</span>
              <div className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] font-bold flex items-center justify-center text-xs">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Desktopová horní hlavička (>= md) přesně podle AGENTS.md */}
      <header className="hidden md:flex sticky top-0 z-30 bg-[#1C140D]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/app/home" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#2D221A] border border-[#3E3025] group-hover:border-[#D89D60] transition flex items-center justify-center text-[#D89D60]">
              <CoffeeBeanIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif-heading text-xl font-bold text-[#F5EBE1] block leading-tight">
                U Sousedů
              </span>
              <span className="text-xs text-[#A39284]">Věrnostní klub & kavárna</span>
            </div>
          </Link>

          {/* Navigační odkazy */}
          <nav className="flex items-center gap-1 lg:gap-2">
            <NavLink
              to="/app/home"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2D221A] text-[#D89D60] border border-[#3E3025]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`
              }
            >
              Domů
            </NavLink>
            <NavLink
              to="/app/menu"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2D221A] text-[#D89D60] border border-[#3E3025]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`
              }
            >
              Nabídka
            </NavLink>
            <NavLink
              to="/app/account"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2D221A] text-[#D89D60] border border-[#3E3025]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`
              }
            >
              Můj účet
            </NavLink>
            <NavLink
              to="/app/more"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#2D221A] text-[#D89D60] border border-[#3E3025]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`
              }
            >
              Další
            </NavLink>
          </nav>

          {/* CTA Moje kartička + Instalovat + Pozdrav uživatele */}
          <div className="flex items-center gap-3">
            {!isInstalled && (
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-medium text-[#F5EBE1] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D89D60]" />
                <span>Instalovat aplikaci</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCardModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#D89D60] hover:bg-[#e2aa70] text-[#1C140D] font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#D89D60]/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Moje kartička</span>
            </button>

            <Link
              to="/app/account"
              className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] font-semibold text-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[#F5EBE1]">
                Ahoj, {greetingName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hlavní plnohodnotný webový kontejner (max-w-6xl mx-auto px-4 md:px-8) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <Outlet />
      </main>

      {/* Mobilní fixní spodní lišta (< md) s 5 položkami a vyvýšeným FAB tlačítkem "Kartička" */}
      <nav
        aria-label="Mobilní navigace"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2D221A]/95 backdrop-blur-lg border-t border-[#3E3025] px-2 pb-safe"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto h-16">
          <NavLink
            to="/app/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
                isActive ? 'text-[#D89D60]' : 'text-[#A39284]'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Domů</span>
          </NavLink>

          <NavLink
            to="/app/menu"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
                isActive ? 'text-[#D89D60]' : 'text-[#A39284]'
              }`
            }
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Nabídka</span>
          </NavLink>

          {/* Prostřední vyvýšené kruhové FAB tlačítko "Kartička" v barvě #D89D60 */}
          <div className="flex flex-col items-center justify-center relative -top-5">
            <Link
              to="/app/card"
              aria-label="Moje kartička"
              className={`w-14 h-14 rounded-full bg-[#D89D60] text-[#1C140D] flex items-center justify-center shadow-xl shadow-black/50 border-4 border-[#1C140D] transition transform active:scale-95 ${
                location.pathname === '/app/card' ? 'ring-2 ring-[#F5EBE1]' : ''
              }`}
            >
              <QrCode className="w-6 h-6" />
            </Link>
            <span
              className={`text-[11px] font-semibold mt-1 ${
                location.pathname === '/app/card' ? 'text-[#D89D60]' : 'text-[#F5EBE1]'
              }`}
            >
              Kartička
            </span>
          </div>

          <NavLink
            to="/app/account"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
                isActive ? 'text-[#D89D60]' : 'text-[#A39284]'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span>Můj účet</span>
          </NavLink>

          <NavLink
            to="/app/more"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
                isActive ? 'text-[#D89D60]' : 'text-[#A39284]'
              }`
            }
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Další</span>
          </NavLink>
        </div>
      </nav>

      {/* Modální okno pro Moji kartičku na desktopu */}
      {isCardModalOpen && currentUser && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCardModalOpen(false)}
        >
          <div
            className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCardModalOpen(false)}
              aria-label="Zavřít kartičku"
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#F5EBE1] hover:text-[#D89D60] flex items-center justify-center shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <LoyaltyCardContent
              fullName={currentUser.full_name}
              cardNumber={currentUser.card_number}
              coffeeCount={currentUser.coffee_count}
            />
            <div className="mt-3 text-center">
              <Link
                to="/app/card"
                onClick={() => setCardModalOpen(false)}
                className="text-xs text-[#A39284] hover:text-[#D89D60] underline"
              >
                Otevřít na samostatné stránce (/app/card)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modální okno pro instalaci aplikace na mobil (Android / iPhone) */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
};
