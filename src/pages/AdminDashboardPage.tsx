import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  LogOut,
  MessageSquare,
  Plus,
  ScanLine,
  ShieldCheck,
  Trash2,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CoffeeBeanIcon } from '../components/CoffeeBeanIcon';
import type { UserRole } from '../lib/database.types';

type ActiveAdminModal = 'events' | 'staff' | 'messages' | null;

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    categories,
    menuItems,
    events,
    profiles,
    messages,
    addEvent,
    deleteEvent,
    updateUserRole,
    addAppMessage,
    deleteAppMessage,
    logout,
  } = useAppState();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState<ActiveAdminModal>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Stavy formuláře pro novou akci
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('2026-12-05T18:00');
  const [evtImage, setEvtImage] = useState(
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'
  );

  // Stavy formuláře pro novou zprávu v aplikaci
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const staffMembers = profiles.filter(
    (p) => p.role === 'staff' || p.role === 'admin'
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!evtTitle.trim()) return;
    const res = await addEvent({
      title: evtTitle.trim(),
      event_date: new Date(evtDate).toISOString(),
      image_url: evtImage.trim(),
    });
    if (!res.ok) {
      setAdminError(res.error ?? 'Nepodařilo se uložit akci.');
      return;
    }
    setEvtTitle('');
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!msgTitle.trim() || !msgBody.trim()) return;
    const res = await addAppMessage(msgTitle.trim(), msgBody.trim());
    if (!res.ok) {
      setAdminError(res.error ?? 'Nepodařilo se odeslat zprávu.');
      return;
    }
    setMsgTitle('');
    setMsgBody('');
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setAdminError(null);
    const res = await updateUserRole(userId, role);
    if (!res.ok) {
      setAdminError(res.error ?? 'Nepodařilo se změnit roli uživatele.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col">
      {/* Horní navigační lišta administrace */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif-heading text-xl font-bold text-[#F5EBE1] block leading-none">
                U Sousedů • Administrace
              </span>
              <span className="text-xs text-[#A39284]">
                Správce: {currentUser?.full_name ?? 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/home"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs font-medium text-[#F5EBE1] transition"
            >
              <CoffeeBeanIcon className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Zákaznická PWA</span>
            </Link>
            <Link
              to="/scanner"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-xs font-medium text-[#F5EBE1] transition"
            >
              <ScanLine className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Skener baristy</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-4 py-2 rounded-full bg-[#221912] hover:border-[#D96B6B] border border-[#3E3025] text-xs font-medium text-[#A39284] hover:text-[#D96B6B] inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Odhlásit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hlavní kontejner max-w-6xl mx-auto px-4 md:px-8 */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              admin.usousedu.cz
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1">
              Přehled kavárny
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Vyberte sekci pro správu nabídky, akcí, baristického týmu nebo zpráv v aplikaci.
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

        {adminError && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{adminError}</span>
          </div>
        )}

        {/* 4 hlavní navigační karty: Mobil grid-cols-1 gap-4 -> Desktop md:grid-cols-2 gap-6 (dle AGENTS.md) */}
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
                Hromadná úprava názvů a cen položek v kategoriích Teplé nápoje, Studené nápoje, Alkoholické nápoje a Brunch.
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
                {events.length} nadcházející akce
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">Akce</h2>
              <p className="text-sm text-[#A39284] mt-1">
                Plánování cuppingů, koncertů a sousedských brunchů zobrazovaných na domovské obrazovce zákazníků.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePanel(activePanel === 'events' ? null : 'events')
              }
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>
                {activePanel === 'events' ? 'Skrýt správu akcí' : 'Spravovat akce'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </button>
          </div>

          {/* 3. Karta: Správa zaměstnanců */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <Users className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {staffMembers.length} členů týmu
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">
                Správa zaměstnanců
              </h2>
              <p className="text-sm text-[#A39284] mt-1">
                Správa oprávnění uživatelů (`customer`, `staff`, `admin`) pro přístup ke skeneru a administraci.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePanel(activePanel === 'staff' ? null : 'staff')
              }
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>
                {activePanel === 'staff'
                  ? 'Skrýt správu zaměstnanců'
                  : 'Spravovat zaměstnance'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </button>
          </div>

          {/* 4. Karta: Zprávy v aplikaci */}
          <div className="bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-xs font-semibold text-[#D89D60]">
                {messages.length} publikované zprávy
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1]">
                Zprávy v aplikaci
              </h2>
              <p className="text-sm text-[#A39284] mt-1">
                Rozesílání aktualit, upozornění na novou kávu na mlýnku a speciálních členských nabídek.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePanel(activePanel === 'messages' ? null : 'messages')
              }
              className="w-full py-3.5 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-[#F5EBE1] font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>
                {activePanel === 'messages'
                  ? 'Skrýt správu zpráv'
                  : 'Spravovat zprávy v aplikaci'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#D89D60]" />
            </button>
          </div>
        </div>

        {/* Rozbalovací detailní panely pro Akce, Zaměstnance a Zprávy */}
        {activePanel === 'events' && (
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-2xl font-bold text-[#F5EBE1]">
              Správa kulturních akcí (`events`)
            </h3>

            <form
              onSubmit={(e) => void handleCreateEvent(e)}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#221912] p-4 rounded-2xl border border-[#3E3025]"
            >
              <input
                type="text"
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                placeholder="Název akce (např. Vánoční cupping)"
                required
                className="px-4 py-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1]"
              />
              <input
                type="datetime-local"
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                required
                className="px-4 py-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1]"
              />
              <input
                type="url"
                value={evtImage}
                onChange={(e) => setEvtImage(e.target.value)}
                placeholder="URL obrázku"
                required
                className="px-4 py-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1]"
              />
              <button
                type="submit"
                className="py-2.5 px-5 rounded-full bg-[#D89D60] text-[#1C140D] font-semibold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat akci</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#221912] border border-[#3E3025]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#F5EBE1]">
                        {evt.title}
                      </p>
                      <p className="text-xs text-[#A39284]">
                        {new Date(evt.event_date).toLocaleString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteEvent(evt.id)}
                    className="p-2 rounded-full text-[#D96B6B] hover:bg-[#D96B6B]/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePanel === 'staff' && (
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#F5EBE1]">
                Správa rolí uživatelů a zaměstnanců (`profiles`)
              </h3>
              <p className="text-xs text-[#A39284] mt-1">
                Změňte roli registrovaného uživatele na <code className="text-[#D89D60]">staff</code> (barista) nebo <code className="text-[#D89D60]">admin</code> (správce).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#221912] border border-[#3E3025]"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#F5EBE1] truncate">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-[#A39284] truncate">{member.email}</p>
                    <p className="text-[11px] text-[#D89D60] font-mono mt-0.5">
                      Karta: {member.card_number} • {member.coffee_count}/10 káv
                    </p>
                  </div>
                  <select
                    value={member.role}
                    onChange={(e) =>
                      void handleRoleChange(member.id, e.target.value as UserRole)
                    }
                    className="px-3.5 py-2 rounded-full bg-[#1C140D] border border-[#3E3025] text-xs font-semibold text-[#D89D60] focus:outline-none focus:border-[#D89D60]"
                  >
                    <option value="customer">customer (Zákazník)</option>
                    <option value="staff">staff (Barista)</option>
                    <option value="admin">admin (Správce)</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePanel === 'messages' && (
          <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-2xl font-bold text-[#F5EBE1]">
              Zprávy v aplikaci (`app_messages`)
            </h3>

            <form
              onSubmit={(e) => void handleCreateMessage(e)}
              className="space-y-3 bg-[#221912] p-4 rounded-2xl border border-[#3E3025]"
            >
              <input
                type="text"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                placeholder="Nadpis zprávy pro zákazníky"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1]"
              />
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Text zprávy nebo aktuality..."
                rows={2}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1]"
              />
              <button
                type="submit"
                className="py-2.5 px-6 rounded-full bg-[#D89D60] text-[#1C140D] font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Odeslat zprávu do aplikace</span>
              </button>
            </form>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#221912] border border-[#3E3025]"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#F5EBE1]">
                      {msg.title}
                    </p>
                    <p className="text-xs text-[#A39284] mt-1">{msg.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteAppMessage(msg.id)}
                    className="p-2 rounded-full text-[#D96B6B] hover:bg-[#D96B6B]/10 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
