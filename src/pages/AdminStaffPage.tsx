import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Profile, UserRole } from '../lib/database.types';

interface PendingConfirmState {
  userId: string;
  fullName: string;
  nextRole: UserRole;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'danger' | 'warning';
}

export const AdminStaffPage: React.FC = () => {
  const { profiles, updateUserRole, currentUser } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'admin'>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog pro přidání nového zaměstnance z existujících zákazníků
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');

  // Dialog pro úpravu role stávajícího zaměstnance
  const [editingMember, setEditingMember] = useState<Profile | null>(null);

  // Vlastní potvrzovací dialog (místo window.confirm)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmState | null>(null);

  const staffMembers = useMemo(
    () => profiles.filter((p) => p.role === 'staff' || p.role === 'admin'),
    [profiles]
  );

  const candidateCustomers = useMemo(() => {
    const q = candidateSearch.toLowerCase().trim();
    return profiles
      .filter((p) => p.role === 'customer')
      .filter(
        (p) =>
          !q ||
          p.full_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.card_number.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))
      );
  }, [profiles, candidateSearch]);

  const stats = useMemo(
    () => ({
      total: staffMembers.length,
      staff: staffMembers.filter((p) => p.role === 'staff').length,
      admins: staffMembers.filter((p) => p.role === 'admin').length,
    }),
    [staffMembers]
  );

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

  useEffect(() => {
    if (!isAddDialogOpen && !editingMember) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        setIsAddDialogOpen(false);
        setEditingMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddDialogOpen, editingMember, submitting]);

  const executeRoleChange = async (
    userId: string,
    fullName: string,
    nextRole: UserRole
  ) => {
    setSubmitting(true);
    setNotice(null);
    setErrorNotice(null);
    try {
      const res = await updateUserRole(userId, nextRole);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se změnit roli uživatele.');
        return;
      }

      if (nextRole === 'customer') {
        setNotice(`Uživatel „${fullName}“ byl odebrán ze zaměstnanců.`);
      } else {
        const roleLabel = nextRole === 'admin' ? 'Správce' : 'Barista';
        setNotice(`Zaměstnanci „${fullName}“ byla nastavena role: ${roleLabel}.`);
      }
      setEditingMember(null);
      setPendingConfirm(null);
      setTimeout(() => setNotice(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const requestRoleChange = (member: Profile, nextRole: UserRole) => {
    if (member.role === nextRole) {
      setEditingMember(null);
      return;
    }

    if (member.id === currentUser?.id && nextRole !== 'admin') {
      setEditingMember(null);
      setPendingConfirm({
        userId: member.id,
        fullName: member.full_name,
        nextRole,
        title: 'Odebrat si práva správce?',
        description:
          'Chystáte se odebrat sami sobě roli administrátora. Ztratíte přístup do administrace kavárny. Chcete pokračovat?',
        confirmLabel: 'Ano, změnit roli',
        variant: 'warning',
      });
      return;
    }

    if (nextRole === 'customer') {
      setEditingMember(null);
      setPendingConfirm({
        userId: member.id,
        fullName: member.full_name,
        nextRole,
        title: 'Odebrat ze zaměstnanců?',
        description: `Opravdu chcete odebrat uživatele „${member.full_name}“ ze zaměstnaneckého týmu? Přijde o přístup ke skeneru i administraci.`,
        confirmLabel: 'Odebrat z týmu',
        variant: 'danger',
      });
      return;
    }

    void executeRoleChange(member.id, member.full_name, nextRole);
  };

  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setErrorNotice(null);

    if (!selectedCustomerId) {
      setErrorNotice('Vyberte prosím uživatele ze seznamu.');
      return;
    }

    const targetUser = profiles.find((c) => c.id === selectedCustomerId);
    setSubmitting(true);
    try {
      const res = await updateUserRole(selectedCustomerId, newStaffRole);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se přidat uživatele do týmu.');
        return;
      }

      const roleLabel = newStaffRole === 'admin' ? 'Správce' : 'Barista';
      setNotice(
        `Uživatel „${targetUser?.full_name ?? 'Uživatel'}“ byl přidán do týmu jako ${roleLabel}.`
      );
      setSelectedCustomerId('');
      setCandidateSearch('');
      setIsAddDialogOpen(false);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setSubmitting(false);
    }
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
              Správa aktivních členů týmu (baristé a správci) a jejich přístupových práv.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorNotice(null);
              setSelectedCustomerId('');
              setCandidateSearch('');
              setNewStaffRole('staff');
              setIsAddDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm shadow-lg shadow-[#D89D60]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Přidat zaměstnance</span>
          </button>
        </div>

        {notice && (
          <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {errorNotice && !isAddDialogOpen && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Přehledové statistiky */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-4 sm:p-6 shadow-lg">
            <span className="text-[11px] sm:text-xs text-[#A39284]">Celkem v týmu</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-4 sm:p-6 shadow-lg">
            <span className="text-[11px] sm:text-xs text-[#A39284]">Baristé</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#D89D60] mt-1">
              {stats.staff}
            </p>
          </div>
          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-4 sm:p-6 shadow-lg">
            <span className="text-[11px] sm:text-xs text-[#A39284]">Správci</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#F5EBE1] mt-1">
              {stats.admins}
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
              placeholder="Vyhledat zaměstnance..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
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
          <h2 className="text-xl font-bold text-[#F5EBE1]">
            Zaměstnanci ({filteredStaff.length})
          </h2>

          {filteredStaff.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <Users className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">
                Nenalezen žádný zaměstnanec
              </p>
              <p className="text-xs mt-1">
                Zkuste upravit vyhledávací dotaz nebo filtr.
              </p>
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
                        <p className="text-xs text-[#A39284] truncate mt-0.5">
                          {member.email}
                        </p>
                        <p className="text-[11px] text-[#D89D60] font-mono mt-1">
                          Karta: {member.card_number}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingMember(member)}
                      className={`shrink-0 px-4 py-2.5 rounded-full bg-[#221912] border text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer hover:border-[#D89D60] ${
                        member.role === 'admin'
                          ? 'border-[#D89D60] text-[#D89D60]'
                          : 'border-[#3E3025] text-[#F5EBE1]'
                      }`}
                    >
                      <span>{member.role === 'admin' ? 'Správce' : 'Barista'}</span>
                      <Edit3 className="w-3.5 h-3.5 text-[#D89D60]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Dialog pro přidání zaměstnance (vlastní UI aplikace, žádný nativní select) */}
      {isAddDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-staff-dialog-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!submitting) setIsAddDialogOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#D89D60] font-semibold">
                  Tým kavárny
                </span>
                <h2
                  id="add-staff-dialog-title"
                  className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F5EBE1] mt-0.5"
                >
                  Přidat zaměstnance
                </h2>
                <p className="text-xs text-[#A39284] mt-0.5">
                  Vyberte registrovaného uživatele a zvolte jeho pracovní roli.
                </p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsAddDialogOpen(false)}
                aria-label="Zavřít"
                className="p-1.5 rounded-full text-[#A39284] hover:text-[#F5EBE1] hover:bg-[#221912] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorNotice && (
              <div className="p-3 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-xs text-[#F5EBE1] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D96B6B] shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleAddStaffMember(e)} className="space-y-4">
              {/* Vyhledávání a klikací výběr uživatele */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-[#A39284]">
                  Vyberte uživatele
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Hledat podle jména, e-mailu nebo karty..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {candidateCustomers.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-[#221912] border border-[#3E3025] text-center text-xs text-[#A39284]">
                      Nebyl nalezen žádný další registrovaný uživatel.
                    </div>
                  ) : (
                    candidateCustomers.map((c) => {
                      const isSelected = selectedCustomerId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(c.id)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                              : 'bg-[#221912] border-[#3E3025] hover:border-[#D89D60]/50 text-[#F5EBE1]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold truncate">
                              {c.full_name}
                            </p>
                            <p className="text-[11px] text-[#A39284] truncate">
                              {c.email}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-[#D89D60] text-[#1C140D] flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Výběr role v UI aplikace */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#A39284]">
                  Pracovní role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewStaffRole('staff')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newStaffRole === 'staff'
                        ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                        : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-[#F5EBE1]">
                      Barista
                    </p>
                    <p className="text-[11px] text-[#A39284] mt-0.5">
                      Přístup ke skeneru
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStaffRole('admin')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newStaffRole === 'admin'
                        ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                        : 'bg-[#221912] border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-[#D89D60]">
                      Správce
                    </p>
                    <p className="text-[11px] text-[#A39284] mt-0.5">
                      Plná administrace
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsAddDialogOpen(false)}
                  className="py-3 px-4 rounded-full bg-[#221912] border border-[#3E3025] text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedCustomerId}
                  className="py-3 px-4 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Zařadit do týmu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog pro změnu role stávajícího zaměstnance */}
      {editingMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-role-dialog-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            if (!submitting) setEditingMember(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[#D89D60] font-semibold">
                  Změna oprávnění
                </span>
                <h2
                  id="edit-role-dialog-title"
                  className="font-serif-heading text-xl font-bold text-[#F5EBE1] truncate mt-0.5"
                >
                  {editingMember.full_name}
                </h2>
                <p className="text-xs text-[#A39284] truncate">
                  {editingMember.email}
                </p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditingMember(null)}
                aria-label="Zavřít"
                className="p-1.5 rounded-full text-[#A39284] hover:text-[#F5EBE1] hover:bg-[#221912] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => requestRoleChange(editingMember, 'staff')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                  editingMember.role === 'staff'
                    ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                    : 'bg-[#221912] border-[#3E3025] hover:border-[#D89D60]/60 text-[#F5EBE1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#D89D60] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Barista (obsluha)</p>
                    <p className="text-[11px] text-[#A39284]">
                      Přístup k pokladnímu QR skeneru
                    </p>
                  </div>
                </div>
                {editingMember.role === 'staff' && (
                  <Check className="w-4 h-4 text-[#D89D60] shrink-0" />
                )}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => requestRoleChange(editingMember, 'admin')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                  editingMember.role === 'admin'
                    ? 'bg-[#D89D60]/15 border-[#D89D60] text-[#F5EBE1]'
                    : 'bg-[#221912] border-[#3E3025] hover:border-[#D89D60]/60 text-[#F5EBE1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#D89D60] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Správce (admin)</p>
                    <p className="text-[11px] text-[#A39284]">
                      Plná správa nabídky, akcí i týmu
                    </p>
                  </div>
                </div>
                {editingMember.role === 'admin' && (
                  <Check className="w-4 h-4 text-[#D89D60] shrink-0" />
                )}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => requestRoleChange(editingMember, 'customer')}
                className="w-full p-3.5 rounded-2xl border border-[#D96B6B]/40 bg-[#D96B6B]/10 hover:bg-[#D96B6B]/20 text-left flex items-center gap-3 text-[#D96B6B] transition cursor-pointer"
              >
                <UserMinus className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Odebrat ze zaměstnanců</p>
                  <p className="text-[11px] text-[#D96B6B]/80">
                    Převede účet zpět na běžného zákazníka
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vlastní potvrzovací dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.title ?? ''}
        description={pendingConfirm?.description ?? ''}
        confirmLabel={pendingConfirm?.confirmLabel ?? 'Potvrdit'}
        variant={pendingConfirm?.variant ?? 'danger'}
        loading={submitting}
        onConfirm={() => {
          if (pendingConfirm) {
            return executeRoleChange(
              pendingConfirm.userId,
              pendingConfirm.fullName,
              pendingConfirm.nextRole
            );
          }
        }}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
};
