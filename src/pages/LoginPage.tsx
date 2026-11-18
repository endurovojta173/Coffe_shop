import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { InstallPwaModal, usePwaInstall } from '../components/InstallPwaModal';
import { CoffeeBeanIcon } from '../components/CoffeeBeanIcon';
import { useLanguage } from '../context/LanguageContext';

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
  const { isInstalled } = usePwaInstall();
  const { t } = useLanguage();
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
    <div className="h-dvh overflow-hidden bg-[#1C140D] text-[#F5EBE1] lg:grid lg:h-auto lg:min-h-screen lg:grid-cols-2">
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
            <CoffeeBeanIcon className="w-6 h-6" />
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
      <div className="relative flex h-full min-h-0 flex-col lg:h-auto lg:min-h-screen lg:justify-center">
        {/* Dekorace v pozadí nezabírá na mobilu žádné místo formuláře. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden lg:hidden" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80"
            alt=""
            width={1000}
            height={667}
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C140D]/45 via-[#1C140D]/85 to-[#1C140D]" />
        </div>

        <header className="relative z-10 flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between px-5 pt-[env(safe-area-inset-top)] sm:px-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E3025] bg-[#2D221A]/90 text-[#D89D60] shadow-lg">
              <CoffeeBeanIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif-heading text-xl font-bold leading-tight text-[#F5EBE1]">U Sousedů</h1>
              <p className="text-[10px] text-[#A39284]">Vstup do systému</p>
            </div>
          </div>
          {!isInstalled && (
            <button
              type="button"
              onClick={() => setIsInstallOpen(true)}
              aria-label={t('auth.installPromo')}
              title={t('auth.installPromo')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3E3025] bg-[#2D221A]/80 text-[#D89D60] transition-colors hover:bg-[#2D221A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </header>

        {/* Centrovaný formulář využije na mobilu celou zbývající výšku viewportu. */}
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 lg:block lg:flex-none lg:px-6 lg:py-12">
          {!isConfigured && (
            <div role="alert" className="absolute inset-x-0 bottom-0 z-20 space-y-1.5 rounded-2xl border border-[#D96B6B] bg-[#321F19] p-3 text-xs text-[#F5EBE1] shadow-xl lg:static lg:mb-6 lg:bg-[#D96B6B]/15 lg:p-4 lg:shadow-none">
              <div className="flex items-center gap-2 font-semibold text-[#E78A8A]">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chybí konfigurace Supabase (.env)</span>
              </div>
              <p className="text-[#C2B1A3]">
                <span className="lg:hidden">Pro přihlášení nastavte připojení k Supabase.</span>
                <span className="hidden lg:inline">
                  Nastavte <code className="text-[#F5EBE1]">VITE_SUPABASE_URL</code> a{' '}
                  <code className="text-[#F5EBE1]">VITE_SUPABASE_ANON_KEY</code> v souboru{' '}
                  <code className="text-[#F5EBE1]">.env</code>.
                </span>
              </p>
            </div>
          )}

          <div className="relative lg:rounded-3xl lg:border lg:border-[#3E3025] lg:bg-[#2D221A] lg:p-8 lg:shadow-2xl">
            {/* Přepínač režimu: Přihlášení / Registrace + Jazyk */}
            <div className="mb-4 flex items-center justify-between gap-3 lg:mb-6">
              <div className="grid grid-cols-2 p-1 rounded-full bg-[#221912] border border-[#3E3025] flex-1 max-w-[260px]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className={`rounded-full py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5EBE1] ${
                    mode === 'login'
                      ? 'bg-[#D89D60] text-[#1C140D]'
                      : 'text-[#A39284] hover:text-[#F5EBE1]'
                  }`}
                >
                  {t('auth.loginTitle')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className={`rounded-full py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5EBE1] ${
                    mode === 'register'
                      ? 'bg-[#D89D60] text-[#1C140D]'
                      : 'text-[#A39284] hover:text-[#F5EBE1]'
                  }`}
                >
                  {t('auth.registerTitle')}
                </button>
              </div>
            </div>

            <div className="mb-4 lg:mb-6">
              <h2 className="font-serif-heading text-[1.75rem] font-bold leading-8 text-[#F5EBE1] text-pretty lg:text-2xl">
                {mode === 'login' && t('auth.loginTitle')}
                {mode === 'register' && t('auth.registerTitle')}
                {mode === 'reset' && t('auth.resetTitle')}
              </h2>
              <p className="mt-1 text-xs leading-[1.125rem] text-[#A39284] lg:text-sm lg:leading-5">
                {mode === 'login' && t('auth.loginSubtitle')}
                {mode === 'register' && t('auth.registerSubtitle')}
                {mode === 'reset' && t('auth.resetSubtitle')}
              </p>
            </div>

            {error && (
              <div role="alert" className="absolute inset-x-0 bottom-0 z-20 rounded-2xl border border-[#D96B6B] bg-[#321F19] p-3 text-xs text-[#F5EBE1] shadow-xl lg:static lg:mb-4 lg:bg-[#D96B6B]/15 lg:p-3.5 lg:shadow-none">
                {error}
              </div>
            )}

            {infoMessage && (
              <div role="status" className="absolute inset-x-0 bottom-0 z-20 flex items-start gap-2 rounded-2xl border border-[#D89D60] bg-[#30281A] p-3 text-xs text-[#F5EBE1] shadow-xl lg:static lg:mb-4 lg:bg-[#D89D60]/15 lg:p-3.5 lg:shadow-none">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D89D60]" aria-hidden="true" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39284]" aria-hidden="true" />
                  <label htmlFor="full-name" className="absolute left-11 top-1.5 z-10 text-[10px] font-medium leading-4 text-[#A39284]">
                    {t('auth.fullNameLabel')}
                  </label>
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    required
                    className="h-14 w-full rounded-2xl border border-[#3E3025] bg-[#221912] pl-11 pr-4 pt-4 text-base text-[#F5EBE1] placeholder-[#A39284]/60 focus:border-[#D89D60] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60]/30 lg:text-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39284]" aria-hidden="true" />
                <label htmlFor="email" className="absolute left-11 top-1.5 z-10 text-[10px] font-medium leading-4 text-[#A39284]">
                  {t('auth.emailLabel')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  className="h-14 w-full rounded-2xl border border-[#3E3025] bg-[#221912] pl-11 pr-4 pt-4 text-base text-[#F5EBE1] placeholder-[#A39284]/60 focus:border-[#D89D60] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60]/30 lg:text-sm"
                />
              </div>

              {mode !== 'reset' && (
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39284]" aria-hidden="true" />
                  <label htmlFor="password" className="absolute left-11 top-1.5 z-10 text-[10px] font-medium leading-4 text-[#A39284]">
                    {t('auth.passwordLabel')}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setError(null);
                        setInfoMessage(null);
                      }}
                      className="absolute right-3 top-1 z-10 rounded px-1 py-0.5 text-[10px] leading-4 text-[#D89D60] transition-colors hover:bg-[#3E3025]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60]"
                    >
                      {t('auth.forgotPasswordQuestion')}
                    </button>
                  )}
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="h-14 w-full rounded-2xl border border-[#3E3025] bg-[#221912] pl-11 pr-4 pt-4 text-base text-[#F5EBE1] placeholder-[#A39284]/60 focus:border-[#D89D60] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60]/30 lg:text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isConfigured}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D89D60] px-6 text-sm font-semibold text-[#1C140D] shadow-lg shadow-[#D89D60]/20 transition-colors hover:bg-[#e3aa6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5EBE1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C140D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && t('auth.loginButton')}
                      {mode === 'register' && t('auth.registerButton')}
                      {mode === 'reset' && t('auth.resetButton')}
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
                className="mt-3 w-full rounded-full border border-[#3E3025] py-2.5 text-xs text-[#A39284] transition-colors hover:text-[#F5EBE1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60] lg:mt-4"
              >
                {t('auth.backToLogin')}
              </button>
            ) : (
              <>
                <div className="relative my-4 flex items-center justify-center lg:my-6">
                  <div className="border-t border-[#3E3025] w-full" />
                  <span className="bg-[#1C140D] px-3 text-xs text-[#A39284] whitespace-nowrap lg:bg-[#2D221A]">
                    {t('auth.or')}
                  </span>
                  <div className="border-t border-[#3E3025] w-full" />
                </div>

                {/* Google OAuth tlačítko */}
                <button
                  type="button"
                  disabled={!isConfigured}
                  onClick={() => void handleGoogleOAuth()}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-[#3E3025] bg-[#221912] px-5 text-sm font-medium text-[#F5EBE1] transition-colors hover:bg-[#1C140D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D89D60] disabled:cursor-not-allowed disabled:opacity-50 lg:h-12"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
                  <span>{t('auth.googleLogin')}</span>
                </button>
              </>
            )}
          </div>
          {!isInstalled && (
            <div className="mt-6 hidden text-center text-xs text-[#A39284] lg:block">
              <button
                type="button"
                onClick={() => setIsInstallOpen(true)}
                className="hover:text-[#D89D60] underline inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D89D60]" />
                <span>{t('auth.installPromo')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};
