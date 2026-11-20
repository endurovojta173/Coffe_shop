import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Edit3,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Category, MenuItem } from '../lib/database.types';

interface ItemModalState {
  mode: 'create' | 'edit';
  categoryId: string;
  itemId?: string;
  name: string;
  price: string;
  isActive: boolean;
}

export const AdminMenuPage: React.FC = () => {
  const { categories, menuItems, saveMenuChanges } = useAppState();

  const [itemModal, setItemModal] = useState<ItemModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const sortedCategories: Category[] = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  useEffect(() => {
    if (!itemModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        setItemModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemModal, saving]);

  const openCreateModal = (categoryId: string) => {
    setErrorNotice(null);
    setItemModal({
      mode: 'create',
      categoryId,
      name: '',
      price: '',
      isActive: true,
    });
  };

  const openEditModal = (item: MenuItem) => {
    setErrorNotice(null);
    setItemModal({
      mode: 'edit',
      categoryId: item.category_id,
      itemId: item.id,
      name: item.name,
      price: String(item.price),
      isActive: item.is_active,
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemModal) return;

    const trimmedName = itemModal.name.trim();
    const parsedPrice = Number(itemModal.price);

    if (!trimmedName) {
      setErrorNotice('Zadejte prosím název položky.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorNotice('Zadejte platnou nezápornou cenu v Kč.');
      return;
    }

    setSaving(true);
    setSavedNotice(null);
    setErrorNotice(null);

    try {
      const updatedItem: MenuItem =
        itemModal.mode === 'create'
          ? {
              id: crypto.randomUUID(),
              category_id: itemModal.categoryId,
              name: trimmedName,
              price: Math.round(parsedPrice),
              is_active: itemModal.isActive,
            }
          : {
              id: itemModal.itemId ?? crypto.randomUUID(),
              category_id: itemModal.categoryId,
              name: trimmedName,
              price: Math.round(parsedPrice),
              is_active: itemModal.isActive,
            };

      const nextItems =
        itemModal.mode === 'create'
          ? [...menuItems, updatedItem]
          : menuItems.map((m) => (m.id === updatedItem.id ? updatedItem : m));

      const res = await saveMenuChanges(categories, nextItems, []);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se uložit položku do databáze.');
        return;
      }

      const successText =
        itemModal.mode === 'create'
          ? `Položka „${trimmedName}“ byla přidána do nabídky.`
          : `Položka „${trimmedName}“ byla úspěšně upravena.`;
      setItemModal(null);
      setSavedNotice(successText);
      setTimeout(() => setSavedNotice(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setSavedNotice(null);
    setErrorNotice(null);
    try {
      const nextItems = menuItems.filter((m) => m.id !== deleteTarget.id);
      const res = await saveMenuChanges(categories, nextItems, [deleteTarget.id]);
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se smazat položku.');
        return;
      }
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setSavedNotice(`Položka „${deletedName}“ byla odstraněna z nabídky.`);
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const activeCategoryName = itemModal
    ? categories.find((c) => c.id === itemModal.categoryId)?.name ?? ''
    : '';

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col w-full overflow-x-hidden">
      {/* Horní lišta administrace */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition min-w-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#D89D60] shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Zpět na Přehled kavárny</span>
              <span className="sm:hidden">Zpět na Přehled</span>
            </span>
          </Link>

          <Link
            to="/app/menu"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition shrink-0"
          >
            <span className="hidden sm:inline">Zobrazit živou nabídku →</span>
            <span className="sm:hidden">Živá nabídka →</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="pb-6 border-b border-[#3E3025]">
          <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
            Správa katalogu produktů
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1 font-serif-heading">
            Editace nabídky
          </h1>
          <p className="text-sm text-[#A39284] mt-1">
            Přidávejte a upravujte položky v přehledném dialogu – změny se ukládají rovnou do databáze.
          </p>
        </div>

        {savedNotice && (
          <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {errorNotice && !itemModal && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Mobil: grid-cols-1 gap-8 -> Desktop: md:grid-cols-2 gap-8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedCategories.map((category) => {
            const itemsInCategory = menuItems.filter(
              (item) => item.category_id === category.id
            );

            return (
              <section
                key={category.id}
                className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#3E3025]">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#F5EBE1] font-serif-heading">
                        {category.name}
                      </h2>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#A39284]">
                      {itemsInCategory.length} položek
                    </span>
                  </div>

                  {itemsInCategory.length === 0 ? (
                    <p className="text-xs text-[#A39284] italic py-3">
                      V této kategorii zatím nejsou žádné položky.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {itemsInCategory.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#221912] border transition ${
                            item.is_active
                              ? 'border-[#3E3025] hover:border-[#D89D60]/40'
                              : 'border-[#3E3025]/60 opacity-65'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#F5EBE1] truncate">
                                {item.name}
                              </p>
                              {!item.is_active && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2D221A] border border-[#3E3025] text-[10px] text-[#A39284] shrink-0">
                                  <EyeOff className="w-2.5 h-2.5" />
                                  Skryto
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[#D89D60] mt-0.5">
                              {item.price} Kč
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title={`Upravit ${item.name}`}
                              aria-label={`Upravit ${item.name}`}
                              className="p-2 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#A39284] hover:text-[#D89D60] hover:border-[#D89D60] transition cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              title={`Smazat ${item.name}`}
                              aria-label={`Smazat ${item.name}`}
                              className="p-2 rounded-full bg-[#2D221A] border border-[#3E3025] text-[#A39284] hover:text-[#D96B6B] hover:border-[#D96B6B]/50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openCreateModal(category.id)}
                  className="w-full py-3 px-4 rounded-full bg-[#221912] hover:border-[#D89D60] border border-dashed border-[#3E3025] text-xs font-semibold text-[#D89D60] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat položku</span>
                </button>
              </section>
            );
          })}
        </div>
      </main>

      {/* Dialog pro přidání / úpravu položky nabídky */}
      {itemModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-item-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!saving) setItemModal(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#D89D60] font-semibold">
                  {activeCategoryName}
                </span>
                <h2
                  id="menu-item-modal-title"
                  className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F5EBE1] mt-0.5"
                >
                  {itemModal.mode === 'create'
                    ? 'Nová položka nabídky'
                    : 'Upravit položku'}
                </h2>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setItemModal(null)}
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

            <form onSubmit={(e) => void handleSaveItem(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="menu-item-name"
                  className="block text-xs font-semibold text-[#A39284] mb-1.5"
                >
                  Název položky
                </label>
                <input
                  id="menu-item-name"
                  type="text"
                  autoFocus
                  value={itemModal.name}
                  onChange={(e) =>
                    setItemModal((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="např. Flat White nebo Domácí cheesecake"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm text-[#F5EBE1] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                />
              </div>

              <div>
                <label
                  htmlFor="menu-item-price"
                  className="block text-xs font-semibold text-[#A39284] mb-1.5"
                >
                  Cena (Kč)
                </label>
                <div className="relative">
                  <input
                    id="menu-item-price"
                    type="number"
                    min={0}
                    step={1}
                    value={itemModal.price}
                    onChange={(e) =>
                      setItemModal((prev) =>
                        prev ? { ...prev, price: e.target.value } : null
                      )
                    }
                    placeholder="např. 85"
                    required
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#221912] border border-[#3E3025] text-sm font-bold text-[#D89D60] placeholder-[#A39284]/50 focus:outline-none focus:border-[#D89D60]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A39284]">
                    Kč
                  </span>
                </div>
              </div>

              {/* Přepínač viditelnosti v zákaznické nabídce */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#221912] border border-[#3E3025]">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#F5EBE1]">
                    Zobrazit v nabídce zákazníkům
                  </p>
                  <p className="text-[11px] text-[#A39284]">
                    Vypnutím položku dočasně skryjete (např. vyprodáno)
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={itemModal.isActive}
                  onClick={() =>
                    setItemModal((prev) =>
                      prev ? { ...prev, isActive: !prev.isActive } : null
                    )
                  }
                  className={`w-12 h-7 rounded-full transition p-1 cursor-pointer shrink-0 ${
                    itemModal.isActive
                      ? 'bg-[#D89D60]'
                      : 'bg-[#1C140D] border border-[#3E3025]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#1C140D] transition transform ${
                      itemModal.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setItemModal(null)}
                  className="py-3 px-4 rounded-full bg-[#221912] border border-[#3E3025] text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer disabled:opacity-50"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-4 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D89D60]/25 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {itemModal.mode === 'create' ? 'Přidat' : 'Uložit'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vlastní dialog pro potvrzení smazání položky */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Smazat položku?"
        description={
          deleteTarget
            ? `Opravdu chcete odstranit položku „${deleteTarget.name}“ z nabídky? Tuto akci nelze vrátit zpět.`
            : ''
        }
        confirmLabel="Smazat položku"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
