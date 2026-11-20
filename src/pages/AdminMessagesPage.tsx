import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { AppMessage } from '../lib/database.types';

export const AdminMessagesPage: React.FC = () => {
  const { messages, addAppMessage, deleteAppMessage } = useAppState();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppMessage | null>(null);

  useEffect(() => {
    if (!isCreateOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsCreateOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateOpen, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setErrorNotice(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      setErrorNotice('Vyplňte prosím předmět i text zprávy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addAppMessage(trimmedTitle, trimmedBody);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se odeslat zprávu.');
        return;
      }

      setTitle('');
      setBody('');
      setIsCreateOpen(false);
      setNotice(`Zpráva „${trimmedTitle}“ byla úspěšně odeslána zákazníkům.`);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteAppMessage(deleteTarget.id);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se smazat zprávu.');
        return;
      }
      const deletedTitle = deleteTarget.title;
      setDeleteTarget(null);
      setNotice(`Zpráva „${deletedTitle}“ byla smazána.`);
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setIsSubmitting(false);
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

          <Link
            to="/app/more"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition shrink-0"
          >
            Zobrazit v Nastavení →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Komunikace se zákazníky
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
              Zprávy v aplikaci
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Rozesílání novinek na mlýnku, speciálních akcí a oznámení zákazníkům do jejich PWA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorNotice(null);
              setTitle('');
              setBody('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm shadow-lg shadow-[#D89D60]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nová zpráva</span>
          </button>
        </div>

        {notice && (
          <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {errorNotice && !isCreateOpen && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Historie publikovaných zpráv */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#F5EBE1]">
            Publikované zprávy ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <MessageSquare className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">
                Zatím nebyly publikovány žádné zprávy
              </p>
              <p className="text-xs mt-1">
                Klikněte na tlačítko „Nová zpráva“ a odešlete první oznámení zákazníkům.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-4 p-5 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition shadow-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-base text-[#F5EBE1]">
                        {msg.title}
                      </p>
                      {msg.created_at && (
                        <span className="text-[11px] text-[#A39284] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#D89D60]" />
                          {new Date(msg.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#A39284] mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(msg)}
                    title={`Smazat zprávu ${msg.title}`}
                    aria-label={`Smazat zprávu ${msg.title}`}
                    className="p-2.5 rounded-full text-[#A39284] hover:text-[#D96B6B] hover:bg-[#D96B6B]/10 border border-transparent hover:border-[#D96B6B]/30 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Dialog pro odeslání nové zprávy */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-message-dialog-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!isSubmitting) setIsCreateOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#D89D60] font-semibold">
                  Zprávy v aplikaci
                </span>
                <h2
                  id="create-message-dialog-title"
                  className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F5EBE1] mt-0.5"
                >
                  Nová zpráva pro zákazníky
                </h2>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCreateOpen(false)}
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

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Předmět / Nadpis zprávy
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Nová Etiopie na filtru i espressu!"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Obsah zprávy
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Napište podrobnosti pro zákazníky kavárny..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60] resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateOpen(false)}
                  className="py-3 px-4 rounded-full bg-[#221912] border border-[#3E3025] text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D89D60]/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Odeslat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vlastní dialog pro smazání zprávy */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Smazat zprávu?"
        description={
          deleteTarget
            ? `Opravdu chcete odstranit zprávu „${deleteTarget.title}“? Zmizí ze seznamu oznámení v aplikaci.`
            : ''
        }
        confirmLabel="Smazat zprávu"
        loading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
