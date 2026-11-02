import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { Category, MenuItem } from '../lib/database.types';

export const AdminMenuPage: React.FC = () => {
  const { categories, menuItems, saveMenuChanges } = useAppState();

  const [draftCategories, setDraftCategories] = useState<Category[]>(categories);
  const [draftItems, setDraftItems] = useState<MenuItem[]>(menuItems);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraftCategories(categories);
    setDraftItems(menuItems);
    setDeletedItemIds([]);
  }, [categories, menuItems]);

  const sortedCategories = [...draftCategories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const handleItemChange = (
    itemId: string,
    field: 'name' | 'price' | 'is_active',
    value: string | number | boolean
  ) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      category_id: categoryId,
      name: 'Nová položka nabídky',
      price: 85,
      is_active: true,
    };
    setDraftItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== itemId));
    if (menuItems.some((m) => m.id === itemId)) {
      setDeletedItemIds((prev) => [...prev, itemId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedNotice(null);
    setErrorNotice(null);

    try {
      const res = await saveMenuChanges(
        draftCategories,
        draftItems,
        deletedItemIds
      );
      if (!res.ok) {
        setErrorNotice(res.error ?? 'Nepodařilo se uložit změny v nabídce.');
        return;
      }
      setDeletedItemIds([]);
      setSavedNotice(
        'Změny v nabídce byly úspěšně uloženy do Supabase a propsány do zákaznické aplikace.'
      );
      setTimeout(() => setSavedNotice(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftCategories(categories);
    setDraftItems(menuItems);
    setDeletedItemIds([]);
    setErrorNotice(null);
    setSavedNotice('Neuložené úpravy byly zrušeny.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col">
      {/* Horní lišta administrace */}
      <header className="sticky top-0 z-30 bg-[#2D221A]/95 backdrop-blur-md border-b border-[#3E3025]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between gap-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#D89D60]" />
            <span>Zpět na Přehled kavárny</span>
          </Link>

          <Link
            to="/app/menu"
            className="text-xs px-4 py-2 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#D89D60] text-[#D89D60] transition"
          >
            Zobrazit živou nabídku zákazníka →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Hlavička: Mobil tlačítka pod nadpisem -> Desktop vpravo nahoře vedle nadpisu (dle zadani.md) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#3E3025]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D89D60] font-semibold">
              Správa katalogu produktů
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5EBE1] mt-1">
              Editace nabídky
            </h1>
            <p className="text-sm text-[#A39284] mt-1">
              Upravte názvy a ceny položek v jednotlivých kategoriích nebo přidejte nové speciality.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="py-3 px-6 rounded-full bg-[#D89D60] hover:bg-[#e3aa6e] disabled:opacity-50 text-[#1C140D] font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#D89D60]/25 transition cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Uložit změny</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="py-3 px-6 rounded-full bg-[#2D221A] hover:border-[#D89D60] border border-[#3E3025] text-sm font-semibold text-[#A39284] hover:text-[#F5EBE1] inline-flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Zrušit změny</span>
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="p-4 rounded-2xl bg-[#D89D60]/15 border border-[#D89D60] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D89D60] shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-4 rounded-2xl bg-[#D96B6B]/15 border border-[#D96B6B] text-sm text-[#F5EBE1] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#D96B6B] shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Grid kategorií: Mobil grid-cols-1 gap-8 -> Desktop md:grid-cols-2 lg:grid-cols-2 gap-8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedCategories.map((category) => {
            const itemsInCategory = draftItems.filter(
              (item) => item.category_id === category.id
            );

            return (
              <section
                key={category.id}
                className="bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-6"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#3E3025]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#221912] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#F5EBE1]">
                        {category.name}
                      </h2>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#221912] border border-[#3E3025] text-[#A39284]">
                      {itemsInCategory.length} položek
                    </span>
                  </div>

                  {/* Seznam editovatelných položek */}
                  <div className="space-y-3">
                    {itemsInCategory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#221912] border border-[#3E3025]"
                      >
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, 'name', e.target.value)
                          }
                          aria-label="Název položky"
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm text-[#F5EBE1] focus:outline-none focus:border-[#D89D60]"
                        />

                        <div className="relative w-24 shrink-0">
                          <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'price',
                                Number(e.target.value) || 0
                              )
                            }
                            aria-label="Cena v Kč"
                            className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#1C140D] border border-[#3E3025] text-sm font-bold text-[#D89D60] text-right focus:outline-none focus:border-[#D89D60]"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#A39284]">
                            Kč
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Odstranit položku"
                          className="p-2 rounded-full text-[#A39284] hover:text-[#D96B6B] hover:bg-[#D96B6B]/10 transition cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tlačítko + Přidat položku přesně podle zadani.md */}
                <button
                  type="button"
                  onClick={() => handleAddItem(category.id)}
                  className="w-full py-3 px-4 rounded-full bg-[#221912] hover:border-[#D89D60] border border-dashed border-[#3E3025] text-xs font-semibold text-[#D89D60] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Přidat položku</span>
                </button>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
