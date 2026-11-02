import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Download,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { InstallPwaModal } from '../components/InstallPwaModal';

type AuthMode = 'login' | 'register' | 'reset';

export const LoginPage: React.FC = () => {
  const {
    isConfigured,
    currentUser,
    isLoadingAuth,
    loginWithEmail,
    loginWithGoogle,
    registerCustomer,
    sendPasswordReset,
  } = useAppState();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Pokud je uživatel již přihlášen, automaticky ho přesměrujeme podle jeho role
  if (!isLoadingAuth && currentUser) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.role === 'staff') {
      return <Navigate to="/scanner" replace />;
    }
    return <Navigate to="/app/home" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'reset') {
        const res = await sendPasswordReset(email);
        if (!res.ok) {
          setError(res.error ?? 'Nepodařilo se odeslat obnovovací e-mail.');
        } else {
          setInfoMessage(
            `Odkaz pro obnovu hesla byl odeslán na adresu ${email.trim()}.`
          );
        }
        return;
      }

      if (mode === 'register') {
        const res = await registerCustomer(fullName, email, password);
        if (!res.ok) {
          setError(res.error ?? 'Registrace se nezdařila.');
          return;
        }

        // Rovnou vstup do aplikace podle role (nebo výchozí zákaznická část)
        const targetRole = res.profile?.role ?? 'customer';
        if (targetRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (targetRole === 'staff') {
          navigate('/scanner', { replace: true });
        } else {
          navigate('/app/home', { replace: true });
        }
        return;
      }

      // Jednotné přihlášení pro všechny role ('any')
      const res = await loginWithEmail(email, password, 'any');
      if (!res.ok || !res.profile) {
        setError(res.error ?? 'Přihlášení se nezdařilo.');
        return;
      }

      // Automatické přesměrování přesně podle role uživatele v databázi
      if (res.profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.profile.role === 'staff') {
        navigate('/scanner');
      } else {
        navigate('/app/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neočekávaná chyba.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    try {
      const res = await loginWithGoogle();
      if (!res.ok && res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při Google OAuth.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] lg:grid lg:grid-cols-2">
      {/* Levá polovina na desktopu (lg:grid-cols-2): Fotografie kavárny s textovým claimem */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden border-r border-[#3E3025]">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85"
          alt="Kavárna U Sousedů – výběrová káva"
          className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C140D] via-[#1C140D]/60 to-[#1C140D]/40" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2D221A]/90 border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif-heading text-2xl font-bold text-[#F5EBE1] block">
              U Sousedů
            </span>
            <span className="text-xs text-[#A39284]">Pražská rodinná kavárna</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D221A]/90 border border-[#3E3025] text-[#D89D60] text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D89D60]" />
            <span>Jednotné přihlášení</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-[#F5EBE1] mb-4">
            Kavárna, kde se sousedé potkávají u skvělé kávy.
          </h1>
          <p className="text-base text-[#A39284] leading-relaxed">
            Jediné přihlášení pro zákazníky, baristy i správce. Systém automaticky
            rozpozná vaši roli v kavárně a otevře vaše rozhraní.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#A39284] pt-6 border-t border-[#3E3025]/80">
          <span>Vinohrady • Letná</span>
          <span className="text-[#D89D60]">Zákazník • Barista • Správce</span>
        </div>
      </div>

      {/* Pravá polovina (a celý mobilní pohled) */}
      <div className="flex flex-col justify-center relative min-h-screen">
        {/* Mobilní horní dekorativní podkresový obrázek s přechodem do ztracena */}
        <div className="lg:hidden relative h-56 w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80"
            alt="Latte art U Sousedů"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C140D]/20 via-[#1C140D]/60 to-[#1C140D]" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2D221A] border border-[#3E3025] flex items-center justify-center text-[#D89D60] shadow-lg">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5EBE1]">U Sousedů</h1>
              <p className="text-xs text-[#A39284]">Vstup do systému</p>
            </div>
          </div>
        </div>

        {/* Centrovaný formulář (max-w-md mx-auto) */}
        <div className="w-full max-w-md mx-auto px-6 py-8 lg:py-12">
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-xs text-[#F5EBE1] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[#D96B6B]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Chybí konfigurace Supabase (.env)</span>
              </div>
              <p className="text-[#A39284]">
                Nastavte <code className="text-[#F5EBE1]">VITE_SUPABASE_URL</code> a{' '}
                <code className="text-[#F5EBE1]">VITE_SUPABASE_ANON_KEY</code> v souboru{' '}
                <code className="text-[#F5EBE1]">.env</code>.
              </p>
            </div>
          )}

          <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Přepínač režimu: Přihlášení / Registrace */}
            <div className="grid grid-cols-2 p-1 rounded-full bg-[#221912] border border-[#3E3025] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className={`py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#D89D60] text-[#1C140D]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                Přihlášení
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setInfoMessage(null);
                }}
                className={`py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#D89D60] text-[#1C140D]'
                    : 'text-[#A39284] hover:text-[#F5EBE1]'
                }`}
              >
                Registrace
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#F5EBE1]">
                {mode === 'login' && 'Vítejte zpátky'}
                {mode === 'register' && 'Vytvořit účet'}
                {mode === 'reset' && 'Obnova hesla'}
              </h2>
              <p className="text-sm text-[#A39284] mt-1">
                {mode === 'login' &&
                  'Zadejte svůj e-mail a heslo. Aplikace vás automaticky přesměruje podle vaší role.'}
                {mode === 'register' &&
                  'Založte si účet a získejte okamžitý přístup k digitální QR kartičce a výhodám.'}
                {mode === 'reset' &&
                  'Zadejte svůj e-mail a pošleme vám odkaz pro nastavení nového hesla.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-xs text-[#F5EBE1]">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-xs text-[#F5EBE1] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D89D60] shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
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
                      placeholder="Jana Nováková"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/60 focus:outline-none focus:border-[#D89D60]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#A39284] mb-1.5">
                  E-mailová adresa
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.cz"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/60 focus:outline-none focus:border-[#D89D60]"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#A39284]">
                      Heslo
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setError(null);
                          setInfoMessage(null);
                        }}
                        className="text-xs text-[#D89D60] hover:underline cursor-pointer"
                      >
                        Zapomenuté heslo?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A39284] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/60 focus:outline-none focus:border-[#D89D60]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isConfigured}
                className="w-full py-3.5 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D89D60]/20 transition cursor-pointer mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Přihlásit se do účtu'}
                      {mode === 'register' && 'Vytvořit účet'}
                      {mode === 'reset' && 'Odeslat obnovovací odkaz'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {mode === 'reset' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full mt-4 py-2.5 rounded-full border border-[#3E3025] text-xs text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer"
              >
                Zpět na přihlášení
              </button>
            ) : (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <div className="border-t border-[#3E3025] w-full" />
                  <span className="bg-[#2D221A] px-3 text-xs text-[#A39284] whitespace-nowrap">
                    nebo pokračujte přes
                  </span>
                  <div className="border-t border-[#3E3025] w-full" />
                </div>

                {/* Google OAuth tlačítko */}
                <button
                  type="button"
                  disabled={!isConfigured}
                  onClick={() => void handleGoogleOAuth()}
                  className="w-full py-3 px-5 rounded-full bg-[#221912] hover:bg-[#1C140D] disabled:opacity-50 border border-[#3E3025] text-sm font-medium text-[#F5EBE1] flex items-center justify-center gap-3 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                    />
                  </svg>
                  <span>Pokračovat přes účet Google</span>
                </button>
              </>
            )}
          </div>
          <div className="mt-6 text-center text-xs text-[#A39284]">
            <button
              type="button"
              onClick={() => setIsInstallOpen(true)}
              className="hover:text-[#D89D60] underline inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D89D60]" />
              <span>Nainstalovat aplikaci do mobilu (Android & iPhone)</span>
            </button>
          </div>
        </div>
      </div>

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};
