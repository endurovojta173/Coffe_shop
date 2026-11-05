import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const AdminMessagesPage: React.FC = () => {
  const { messages, addAppMessage, deleteAppMessage } = useAppState();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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
      setNotice(`Zpráva "${trimmedTitle}" byla úspěšně odeslána zákazníkům.`);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, msgTitle: string) => {
    if (!window.confirm(`Opravdu chcete smazat zprávu "${msgTitle}"?`)) {
      return;
    }
    const res = await deleteAppMessage(id);
    if (!res.ok) {
      setErrorNotice(res.error ?? 'Nepodařilo se smazat zprávu.');
      return;
    }
    setNotice(`Zpráva "${msgTitle}" byla smazána.`);
    setTimeout(() => setNotice(null), 3000);
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
            Zobrazit v sekci Další →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            Komunikace se zákazníky
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            Zprávy v aplikaci
          </h1>
          <p className="text-sm text-[#A39284] mt-1">
            Rozesílání novinek na mlýnku, speciálních akcí a oznámení všem zákazníkům do jejich PWA.
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

        {/* Formulář pro novou zprávu */}
        <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3E3025]">
            <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5EBE1]">Nová zpráva pro zákazníky</h2>
              <p className="text-xs text-[#A39284] mt-0.5">
                Zpráva se ihned zobrazí zákazníkům v sekci Další → Zprávy a oznámení.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#A39284] mb-2">
                Předmět / Nadpis zprávy
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Např. Nová Etiopie na filtru i espressu!"
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39284] mb-2">
                Obsah zprávy
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Napište podrobnosti pro zákazníky kavárny..."
                rows={3}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60] resize-y"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3.5 px-7 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#D89D60]/25 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Odesílám...' : 'Odeslat zprávu do aplikace'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Historie publikovaných zpráv */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5EBE1]">
              Publikované zprávy ({messages.length})
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <MessageSquare className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">Zatím nebyly publikovány žádné zprávy</p>
              <p className="text-xs mt-1">Pomocí formuláře výše můžete odeslat první zprávu pro zákazníky.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-4 p-5 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition shadow-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
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
                    onClick={() => void handleDelete(msg.id, msg.title)}
                    title={`Smazat zprávu ${msg.title}`}
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
    </div>
  );
};
