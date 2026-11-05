import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { UserRole } from '../lib/database.types';

export const AdminStaffPage: React.FC = () => {
  const { profiles, updateUserRole, currentUser } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'admin'>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Stav pro přidání nového zaměstnance z existujících zákazníků
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');

  // Pouze uživatelé, kteří jsou zaměstnanci (staff nebo admin)
  const staffMembers = useMemo(() => {
    return profiles.filter((p) => p.role === 'staff' || p.role === 'admin');
  }, [profiles]);

  // Zákazníci k případnému přidání do zaměstnaneckého týmu
  const candidateCustomers = useMemo(() => {
    return profiles.filter((p) => p.role === 'customer');
  }, [profiles]);

  const stats = useMemo(() => {
    return {
      total: staffMembers.length,
      staff: staffMembers.filter((p) => p.role === 'staff').length,
      admins: staffMembers.filter((p) => p.role === 'admin').length,
    };
  }, [staffMembers]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return staffMembers.filter((p) => {
      const matchesSearch =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.card_number.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));

      const matchesRole = roleFilter === 'all' || p.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staffMembers, searchQuery, roleFilter]);

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

    if (nextRole === 'customer') {
      if (
        !window.confirm(
          `Opravdu chcete odebrat uživatele "${fullName}" ze zaměstnanců? Přijde o přístup ke skeneru i administraci.`
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

    if (nextRole === 'customer') {
      setNotice(`Uživatel "${fullName}" byl odebrán ze zaměstnanců.`);
    } else {
      const roleLabel = nextRole === 'admin' ? 'Správce' : 'Barista';
      setNotice(`Zaměstnanci "${fullName}" byla nastavena role: ${roleLabel}.`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setErrorNotice(null);

    if (!selectedCustomerId) {
      setErrorNotice('Vyberte prosím uživatele, kterého chcete přidat mezi zaměstnance.');
      return;
    }

    const targetUser = candidateCustomers.find((c) => c.id === selectedCustomerId);
    const res = await updateUserRole(selectedCustomerId, newStaffRole);
    if (!res.ok) {
      setErrorNotice(res.error ?? 'Nepodařilo se přidat uživatele mezi zaměstnance.');
      return;
    }

    const roleLabel = newStaffRole === 'admin' ? 'Správce' : 'Barista';
    setNotice(
      `Uživatel "${targetUser?.full_name ?? 'Uživatel'}" byl úspěšně přidán do týmu jako ${roleLabel}.`
    );
    setSelectedCustomerId('');
    setIsAddingOpen(false);
    setTimeout(() => setNotice(null), 4000);
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Tým kavárny
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
              Správa zaměstnanců
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Správa aktivních členů týmu (baristé a správci) a jejich oprávnění ke skeneru a administraci.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm shadow-lg shadow-[#D89D60]/20 transition cursor-pointer self-start sm:self-auto"
          >
            {isAddingOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Zavřít přidávání</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Přidat zaměstnance</span>
              </>
            )}
          </button>
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

        {/* Formulář pro přidání nového zaměstnance */}
        {isAddingOpen && (
          <section className="bg-[#2D221A] border-2 border-[#D89D60]/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#3E3025]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F5EBE1]">Přidat zaměstnance do týmu</h2>
                  <p className="text-xs text-[#A39284]">
                    Vyberte registrovaného uživatele a přiřaďte mu roli baristy nebo správce.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingOpen(false)}
                className="p-1.5 rounded-full text-[#A39284] hover:text-[#F5EBE1] hover:bg-[#221912] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleAddStaffMember(e)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-semibold text-[#A39284] mb-2">
                    Vyberte uživatele
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] focus:outline-none focus:border-[#D89D60] cursor-pointer"
                  >
                    <option value="">-- Zvolte uživatele k zařazení do týmu --</option>
                    {candidateCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-[#A39284] mb-2">
                    Pracovní role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as 'staff' | 'admin')}
                    className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#D89D60] font-semibold focus:outline-none focus:border-[#D89D60] cursor-pointer"
                  >
                    <option value="staff">Barista (obsluha)</option>
                    <option value="admin">Správce (admin)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-xs sm:text-sm shadow-lg shadow-[#D89D60]/20 transition cursor-pointer"
                  >
                    Zařadit
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* Přehledové statistiky pouze pro zaměstnance */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-lg">
            <span className="text-xs text-[#A39284]">Celkem v týmu</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-lg">
            <span className="text-xs text-[#A39284]">Baristé (obsluha)</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#D89D60] mt-1">
              {stats.staff}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-lg">
            <span className="text-xs text-[#A39284]">Správci (admin)</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.admins}
            </p>
          </div>
        </div>

        {/* Vyhledávání a filtry zaměstnanců */}
        <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhledat zaměstnance..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(
              [
                { id: 'all', label: `Všichni (${stats.total})` },
                { id: 'staff', label: `Baristé (${stats.staff})` },
                { id: 'admin', label: `Správci (${stats.admins})` },
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

        {/* Seznam zaměstnanců */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5EBE1]">
              Zaměstnanci ({filteredStaff.length})
            </h2>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <Users className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">Nenalezen žádný zaměstnanec</p>
              <p className="text-xs mt-1">Zkuste upravit vyhledávací dotaz nebo filtr.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStaff.map((member) => {
                const isCurrentUser = member.id === currentUser?.id;
                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition shadow-lg"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-sm font-bold text-[#D89D60] shrink-0">
                        {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'Z'}
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
                          Karta: {member.card_number}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3E3025]">
                      <label className="sr-only">Role zaměstnance</label>
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
                            : 'border-[#D89D60]/60 text-[#F5EBE1]'
                        }`}
                      >
                        <option value="staff">Barista (staff)</option>
                        <option value="admin">Správce (admin)</option>
                        <option value="customer">Odebrat ze zaměstnanců</option>
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
