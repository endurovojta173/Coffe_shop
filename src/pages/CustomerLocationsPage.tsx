import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Coffee,
  ExternalLink,
  Heart,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import { CAFE_BRANCHES } from '../lib/branches';
import { useLanguage } from '../context/LanguageContext';

export const CustomerLocationsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          to="/app/home"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A39284] hover:text-[#D89D60] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back')}</span>
        </Link>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            {t('common.appName')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            {t('locations.pageTitle')}
          </h1>
          <p className="text-sm text-[#A39284] mt-1">
            {t('locations.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Sekce O kavárně U Sousedů (přesunuto z původního More options) */}
      <section className="bg-[#2D221A] border border-[#3E3025] rounded-3xl overflow-hidden shadow-xl md:grid md:grid-cols-12">
        <div className="relative h-60 md:h-auto md:col-span-5 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"
            alt="Kavárna U Sousedů interiér"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D221A] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#2D221A]/80" />
          <div className="absolute bottom-4 left-5">
            <span className="px-3 py-1 rounded-full bg-[#1C140D]/85 border border-[#3E3025] text-xs font-medium text-[#D89D60]">
              {t('common.openToday')}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 md:col-span-7 space-y-4 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60] shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">
                {t('more.aboutTitle')}
              </h2>
              <p className="text-xs text-[#A39284]">
                Kavárna • Pekárna • Komunitní prostor
              </p>
            </div>
          </div>

          <p className="text-sm text-[#A39284] leading-relaxed">
            {t('more.aboutParagraph1')}
          </p>

          <p className="text-sm text-[#A39284] leading-relaxed">
            {t('more.aboutParagraph2')}
          </p>

          <div className="pt-4 border-t border-[#3E3025] flex items-center gap-3 text-xs text-[#D89D60]">
            <Heart className="w-4 h-4 fill-current shrink-0" />
            <span>{t('more.communityThanks')}</span>
          </div>
        </div>
      </section>

      {/* Přehledný seznam všech kaváren U Sousedů */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#F5EBE1] font-serif-heading">
              {t('home.locationsTitle')}
            </h2>
            <p className="text-xs text-[#A39284] mt-0.5">
              {t('locations.listSubtitle')}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#D89D60] font-semibold">
            {CAFE_BRANCHES.length} pobočky
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAFE_BRANCHES.map((branch) => (
            <article
              key={branch.id}
              className={`bg-[#2D221A] border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition ${
                branch.isCurrent
                  ? 'border-[#D89D60]/70'
                  : 'border-[#3E3025] hover:border-[#D89D60]/40'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#221912]">
                  <img
                    src={branch.imageUrl}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D221A] via-[#2D221A]/20 to-transparent" />
                  {branch.isCurrent && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D89D60] text-[#1C140D] text-[11px] font-bold shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      <span>{t('locations.currentBadge')}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <div>
                    <h3 className="font-serif-heading text-xl font-bold text-[#F5EBE1]">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-[#D89D60] flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{branch.address}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#A39284] leading-relaxed">
                    {branch.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {branch.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-2.5 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[11px] text-[#F5EBE1]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-[#3E3025] space-y-3">
                <div className="space-y-1.5 text-xs text-[#A39284]">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D89D60] shrink-0" />
                    <span>{branch.hours}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#D89D60] shrink-0" />
                    <a
                      href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                      className="hover:text-[#F5EBE1] transition"
                    >
                      {branch.phone}
                    </a>
                  </p>
                </div>

                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-full bg-[#221912] hover:border-[#D89D60] border border-[#3E3025] text-xs font-semibold text-[#D89D60] flex items-center justify-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('home.showOnMap')}</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
