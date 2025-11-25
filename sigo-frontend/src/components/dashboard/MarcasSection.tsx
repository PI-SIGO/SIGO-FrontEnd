"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Marca } from "@/types/entities";
import {
  createMarca,
  deleteMarca,
  listMarcas,
  updateMarca,
} from "@/services/marcas";

interface FormState {
  NomeMarca: string;
  DescMarca: string;
  TipoMarca: string;
}

const initialForm: FormState = {
  NomeMarca: "",
  DescMarca: "",
  TipoMarca: "",
};

export function MarcasSection() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listMarcas();
      setMarcas(data);
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível carregar as marcas.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(false);
  }

  function openModalForCreate() {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  }

  function populateForm(marca: Marca) {
    setEditingId(marca.IdMarca);
    setForm({
      NomeMarca: marca.NomeMarca ?? "",
      DescMarca: marca.DescMarca ?? "",
      TipoMarca: marca.TipoMarca ?? "",
    });
    setShowModal(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateMarca(editingId, form);
        setFeedback("Marca atualizada com sucesso.");
      } else {
        await createMarca(form);
        setFeedback("Marca cadastrada com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível salvar a marca.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(marca: Marca) {
    if (!window.confirm(`Remover a marca ${marca.NomeMarca}?`)) {
      return;
    }
    try {
      await deleteMarca(marca.IdMarca);
      setFeedback("Marca removida com sucesso.");
      await refresh();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível remover a marca.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return marcas;
    }
    const term = search.toLowerCase();
    return marcas.filter((item) =>
      [item.NomeMarca, item.TipoMarca]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [marcas, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marcas"
        description="Gerencie o catálogo de marcas relacionadas aos veículos e produtos."
        actionSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModalForCreate}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Nova marca
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou tipo"
              className="w-64 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        }
      />

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6">
        <DataTable
          data={filtered}
          columns={[
            { header: "Marca", key: "NomeMarca" },
            { header: "Descrição", key: "DescMarca" },
            { header: "Segmento", key: "TipoMarca" },
            {
              header: "Ações",
              key: "IdMarca",
              render: (item) => (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => populateForm(item)}
                    className="rounded-lg border border-emerald-200 px-3 py-1 font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg border border-rose-200 px-3 py-1 font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Remover
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage={
            loading ? "Carregando marcas..." : "Nenhuma marca cadastrada"
          }
          getRowId={(item) => item.IdMarca}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{editingId ? 'Editar' : 'Nova'} Marca</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{editingId ? 'Atualize as informações' : 'Preencha os dados'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <form className="mt-0 space-y-4 px-6 py-4 overflow-y-auto" id="marca-form" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Nome da marca</label>
                <input
                  required
                  value={form.NomeMarca}
                  onChange={(event) => setForm((prev) => ({ ...prev, NomeMarca: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Segmento ou linha</label>
                <input
                  value={form.TipoMarca}
                  onChange={(event) => setForm((prev) => ({ ...prev, TipoMarca: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400">Descrição</label>
                <textarea
                  rows={3}
                  value={form.DescMarca}
                  onChange={(event) => setForm((prev) => ({ ...prev, DescMarca: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
            </form>
            <div className="flex items-center gap-3 justify-end border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" form="marca-form" disabled={submitting} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
