import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Search,
  Users,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { UserRole } from '../lib/database.types';

export const AdminStaffPage: React.FC = () => {
  const { profiles, updateUserRole, currentUser } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: profiles.length,
      customers: profiles.filter((p) => p.role === 'customer').length,
      staff: profiles.filter((p) => p.role === 'staff').length,
      admins: profiles.filter((p) => p.role === 'admin').length,
    };
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return profiles.filter((p) => {
      const matchesSearch =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.card_number.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));

      const matchesRole = roleFilter === 'all' || p.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [profiles, searchQuery, roleFilter]);

  const handleRoleChange = async (
    userId: string,
    fullName: string,
    nextRole: UserRole
  ) => {
    setNotice(null);
    setErrorNotice(null);

    if (userId === currentUser?.id && nextRole !== 'admin') {
      if (
        !window.confirm(
          'Pozor: Chystáte se odebrat sami sobě roli administrátora. Ztratíte přístup do administrace. Chcete pokračovat?'
        )
      ) {
        return;
      }
    }

    const res = await updateUserRole(userId, nextRole);
    if (!res.ok) {
      setErrorNotice(res.error ?? 'Nepodařilo se změnit roli uživatele.');
      return;
    }

    const roleName =
      nextRole === 'admin'
        ? 'Správce'
        : nextRole === 'staff'
        ? 'Barista'
        : 'Zákazník';

    setNotice(`Uživatel "${fullName}" má nyní roli: ${roleName}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col w-full overflow-x-hidden">
      {/* Horní lišta administrace */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#D89D60] shrink-0" />
            <span>Zpět na Přehled kavárny</span>
          </Link>

          <Link
            to="/scanner"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition shrink-0"
          >
            Otevřít pokladní skener →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            Správa oprávnění
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            Správa zaměstnanců a rolí
          </h1>
          <p className="text-sm text-[#A39284] mt-1">
            Nastavení přístupových práv pro obsluhu kavárny ke skeneru a administraci.
          </p>
        </div>

        {notice && (
          <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Přehledové statistiky */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 shadow-lg">
            <span className="text-xs text-[#A39284]">Všichni uživatelé</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 shadow-lg">
            <span className="text-xs text-[#A39284]">Baristé (obsluha)</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#D89D60] mt-1">
              {stats.staff}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 shadow-lg">
            <span className="text-xs text-[#A39284]">Správci (admin)</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.admins}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 shadow-lg">
            <span className="text-xs text-[#A39284]">Zákazníci klubu</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#A39284] mt-1">
              {stats.customers}
            </p>
          </div>
        </div>

        {/* Vyhledávání a filtry */}
        <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhledat jméno, e-mail či číslo karty"
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'Všichni' },
                { id: 'staff', label: 'Baristé' },
                { id: 'admin', label: 'Správci' },
                { id: 'customer', label: 'Zákazníci' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setRoleFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  roleFilter === filter.id
                    ? 'bg-[#D89D60] text-[#1C140D]'
                    : 'bg-[#221912] border border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seznam členů */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5EBE1]">
              Uživatelé ({filteredProfiles.length})
            </h2>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <Users className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">Nenalezen žádný uživatel</p>
              <p className="text-xs mt-1">Zkuste upravit vyhledávací dotaz nebo zvolený filtr.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProfiles.map((member) => {
                const isCurrentUser = member.id === currentUser?.id;
                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition shadow-lg"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-sm font-bold text-[#D89D60] shrink-0">
                        {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm sm:text-base text-[#F5EBE1] truncate">
                            {member.full_name}
                          </p>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-[#D89D60]/20 text-[#D89D60] text-[10px] font-semibold">
                              Vy
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#A39284] truncate mt-0.5">{member.email}</p>
                        <p className="text-[11px] text-[#D89D60] font-mono mt-1">
                          Karta: {member.card_number} • {member.coffee_count < 10 ? `${member.coffee_count}/10 káv` : `${member.coffee_count} káv`}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3E3025]">
                      <label className="sr-only">Změnit roli</label>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          void handleRoleChange(
                            member.id,
                            member.full_name,
                            e.target.value as UserRole
                          )
                        }
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#221912] border text-xs font-bold transition focus:outline-none cursor-pointer ${
                          member.role === 'admin'
                            ? 'border-[#D89D60] text-[#D89D60]'
                            : member.role === 'staff'
                            ? 'border-[#D89D60]/60 text-[#F5EBE1]'
                            : 'border-[#3E3025] text-[#A39284]'
                        }`}
                      >
                        <option value="customer">Zákazník (customer)</option>
                        <option value="staff">Barista (staff)</option>
                        <option value="admin">Správce (admin)</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
