import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

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

export const AdminEventsPage: React.FC = () => {
  const { events, addEvent, deleteEvent } = useAppState();

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-05T18:00');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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
      });

      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se uložit akci.');
        return;
      }

      setTitle('');
      setNotice(`Akce "${trimmedTitle}" byla úspěšně přidána a publikována.`);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Opravdu chcete smazat akci "${eventTitle}"?`)) {
      return;
    }
    const res = await deleteEvent(id);
    if (!res.ok) {
      setErrorNotice(res.error ?? 'Nepodařilo se smazat akci.');
      return;
    }
    setNotice(`Akce "${eventTitle}" byla smazána.`);
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
            to="/app/home"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition shrink-0"
          >
            Zobrazit v aplikaci →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">
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

        {/* Formulář pro přidání nové akce */}
        <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#3E3025]">
            <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5EBE1]">Přidat novou akci</h2>
              <p className="text-xs text-[#A39284] mt-0.5">
                Akce se okamžitě zobrazí na domovské stránce zákaznické aplikace.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-2">
                  Název akce
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Vánoční cupping výběrové kávy"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A39284] mb-2">
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39284] mb-2">
                Fotografie akce
              </label>

              {/* Rychlý výběr z předpřipravených tématických fotografií */}
              <div className="flex flex-wrap gap-2 mb-3">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
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
                <div className="w-16 h-16 rounded-2xl bg-[#221912] border border-[#3E3025] overflow-hidden shrink-0">
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
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3.5 px-7 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#D89D60]/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Ukládám...' : 'Přidat a publikovat akci'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Seznam existujících akcí */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5EBE1]">
              Nadcházející a naplánované akce ({events.length})
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-8 text-center text-[#A39284]">
              <Calendar className="w-10 h-10 mx-auto text-[#D89D60]/50 mb-2" />
              <p className="text-sm font-medium text-[#F5EBE1]">Zatím nejsou naplánovány žádné akce</p>
              <p className="text-xs mt-1">Využijte formulář výše a přidejte první kulturní akci.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-[#2D221A] border border-[#3E3025] hover:border-[#D89D60]/40 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[#3E3025]"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-base text-[#F5EBE1] truncate">
                        {evt.title}
                      </p>
                      <p className="text-xs text-[#D89D60] flex items-center gap-1.5 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(evt.event_date).toLocaleString('cs-CZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(evt.id, evt.title)}
                    title={`Smazat akci ${evt.title}`}
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
