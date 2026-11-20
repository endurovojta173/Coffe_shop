import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CAFE_BRANCHES } from '../lib/branches';
import type { CafeEvent } from '../lib/database.types';

const PHOTO_PRESETS = [
  {
    label: 'Cupping kávy',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Koncert & hudba',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Víkendový brunch',
    url: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Kavárenský večer',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
  },
];

function getDefaultEventDateTime(): string {
  const next = new Date();
  next.setDate(next.getDate() + 3);
  next.setHours(18, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T18:00`;
}

export const AdminEventsPage: React.FC = () => {
  const { events, addEvent, deleteEvent } = useAppState();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(getDefaultEventDateTime);
  const [location, setLocation] = useState(
    `${CAFE_BRANCHES[0].name} (${CAFE_BRANCHES[0].address})`
  );
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CafeEvent | null>(null);

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

  const openCreateDialog = () => {
    setErrorNotice(null);
    setTitle('');
    setEventDate(getDefaultEventDateTime());
    setLocation(`${CAFE_BRANCHES[0].name} (${CAFE_BRANCHES[0].address})`);
    setDescription('');
    setImageUrl(PHOTO_PRESETS[0].url);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setErrorNotice(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorNotice('Zadejte prosím název akce.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addEvent({
        title: trimmedTitle,
        event_date: new Date(eventDate).toISOString(),
        image_url: imageUrl.trim() || PHOTO_PRESETS[0].url,
        location: location.trim() || null,
        description: description.trim() || null,
      });

      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se uložit akci.');
        return;
      }

      setIsCreateOpen(false);
      setNotice(`Akce „${trimmedTitle}“ byla úspěšně přidána a publikována.`);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteEvent(deleteTarget.id);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se smazat akci.');
        return;
      }
      const deletedTitle = deleteTarget.title;
      setDeleteTarget(null);
      setNotice(`Akce „${deletedTitle}“ byla smazána.`);
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
            to="/app/home"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition shrink-0"
          >
            Zobrazit v aplikaci →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Správa kavárny
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
              Kulturní akce
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Plánování cuppingů, koncertů a sousedských akcí pro zákazníky kavárny.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm shadow-lg shadow-[#D89D60]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Přidat akci</span>
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

        {/* Seznam existujících akcí */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#F5EBE1]">
            Nadcházející a naplánované akce ({events.length})
          </h2>

          {events.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <Calendar className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">
                Zatím nejsou naplánovány žádné akce
              </p>
              <p className="text-xs mt-1">
                Klikněte na tlačítko „Přidat akci“ a naplánujte první kulturní akci.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[#3E3025]"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-base text-[#F5EBE1] leading-snug">
                        {evt.title}
                      </p>
                      <p className="text-xs text-[#D89D60] flex items-center gap-1.5 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {new Date(evt.event_date).toLocaleString('cs-CZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                      {evt.location && (
                        <p className="text-xs text-[#A39284] flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D89D60] shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(evt)}
                    title={`Smazat akci ${evt.title}`}
                    aria-label={`Smazat akci ${evt.title}`}
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

      {/* Dialog pro přidání nové kulturní akce */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-event-dialog-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!isSubmitting) setIsCreateOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#D89D60] font-semibold">
                  Kulturní akce
                </span>
                <h2
                  id="create-event-dialog-title"
                  className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F5EBE1] mt-0.5"
                >
                  Přidat novou akci
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
                  Název akce
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Vánoční cupping výběrové kávy"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Datum a čas konání
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Místo konání (pobočka)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CAFE_BRANCHES.map((b) => {
                    const labelValue = `${b.name} (${b.address})`;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setLocation(labelValue)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                          location === labelValue
                            ? 'bg-[#D89D60] text-[#1C140D] font-bold'
                            : 'bg-[#221912] border border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                        }`}
                      >
                        {b.shortName}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kde se akce koná..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Popis akce (volitelné)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Podrobnosti o programu, degustovaných kávách, vstupném..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs sm:text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-1.5">
                  Fotografie akce
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-[#D89D60] text-[#1C140D] font-bold'
                          : 'bg-[#221912] border border-[#3E3025] text-[#A39284] hover:text-[#F5EBE1]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#221912] border border-[#3E3025] overflow-hidden shrink-0">
                    <img
                      src={imageUrl}
                      alt="Náhled"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PHOTO_PRESETS[0].url;
                      }}
                    />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-[#221912] border border-[#3E3025] text-xs text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
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
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>Publikovat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vlastní dialog pro smazání akce */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Smazat akci?"
        description={
          deleteTarget
            ? `Opravdu chcete trvale smazat kulturní akci „${deleteTarget.title}“? Zmizí i ze zákaznické aplikace.`
            : ''
        }
        confirmLabel="Smazat akci"
        loading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
