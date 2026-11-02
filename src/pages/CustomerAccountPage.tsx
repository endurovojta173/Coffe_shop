import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Edit3,
  Lock,
  LogOut,
  Mail,
  Trash2,
  User,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';

export const CustomerAccountPage: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    updatePassword,
    deleteCurrentUserAccount,
    logout,
  } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    const res = await updateCurrentUserProfile({
      full_name: fullName.trim(),
      email: email.trim(),
    });

    if (!res.ok) {
      setErrorMsg(res.error ?? 'Nepodařilo se uložit změny profilu.');
      return;
    }

    if (newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        setErrorMsg('Nové heslo musí mít alespoň 6 znaků.');
        return;
      }
      const passRes = await updatePassword(newPassword.trim());
      if (!passRes.ok) {
        setErrorMsg(passRes.error ?? 'Nepodařilo se změnit heslo.');
        return;
      }
      setNewPassword('');
    }

    setIsEditing(false);
    setStatusMsg('Osobní údaje byly úspěšně uloženy do databáze.');
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(null);
    const res = await deleteCurrentUserAccount();
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Nepodařilo se smazat účet.');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
          {t('common.appName')}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
          {t('account.title')}
        </h1>
        <p className="text-sm text-[#A39284] mt-1">
          {t('account.subtitle')}
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Horní hlavička profilu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#3E3025]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] text-2xl font-bold">
              {(currentUser.full_name || 'Z').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5EBE1]">
                {currentUser.full_name}
              </h2>
              <p className="text-xs text-[#A39284]">
                Člen věrnostního klubu U Sousedů • {currentUser.coffee_count}/10 káv
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="py-2.5 px-5 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-semibold text-[#F5EBE1] inline-flex items-center gap-2 self-start sm:self-auto transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Změnit údaje</span>
            </button>
          )}
        </div>

        {/* Formulář údajů */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#A39284] mb-1.5">
              Jméno a příjmení
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] disabled:opacity-75 focus:outline-none focus:border-[#D89D60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A39284] mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] disabled:opacity-75 focus:outline-none focus:border-[#D89D60]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A39284] mb-1.5">
                {isEditing ? 'Nové heslo (nepovinné)' : 'Heslo'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={isEditing ? newPassword : '••••••••••••'}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isEditing ? 'Ponechte prázdné beze změny' : '••••••••••••'}
                  disabled={!isEditing}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] disabled:opacity-75 focus:outline-none focus:border-[#D89D60]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A39284] mb-1.5">
                Číslo věrnostní kartičky
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#D89D60] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentUser.card_number}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm font-mono font-semibold text-[#D89D60] opacity-90 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="py-3 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-semibold text-sm transition cursor-pointer"
              >
                Uložit změny údajů
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(currentUser.full_name);
                  setEmail(currentUser.email);
                  setNewPassword('');
                }}
                className="py-3 px-6 rounded-full bg-[#221912] border border-[#3E3025] text-sm text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer"
              >
                Zrušit
              </button>
            </div>
          )}
        </form>

        {/* Akční tlačítka: Mobil pod sebou -> Desktop vedle sebe (dle zadani.md) */}
        <div className="mt-8 pt-6 border-t border-[#3E3025] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="py-3 px-6 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-sm font-semibold text-[#F5EBE1] inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#D89D60]" />
            <span>Odhlásit se z účtu</span>
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="py-3 px-6 rounded-full bg-transparent hover:bg-[#D96B6B]/10 border border-[#D96B6B] text-sm font-semibold text-[#D96B6B] inline-flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Smazat účet</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleDeleteAccount()}
                className="py-2.5 px-4 rounded-full bg-[#D96B6B] text-[#1C140D] font-bold text-xs cursor-pointer"
              >
                Potvrdit smazání účtu
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="py-2.5 px-4 rounded-full bg-[#221912] border border-[#3E3025] text-xs text-[#A39284] cursor-pointer"
              >
                Zrušit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
