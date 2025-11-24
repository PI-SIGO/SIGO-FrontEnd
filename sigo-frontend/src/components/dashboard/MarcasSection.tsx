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
  }

  function populateForm(marca: Marca) {
    setEditingId(marca.IdMarca);
    setForm({
      NomeMarca: marca.NomeMarca ?? "",
      DescMarca: marca.DescMarca ?? "",
      TipoMarca: marca.TipoMarca ?? "",
    });
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
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou tipo"
            className="w-64 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        }
      />

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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

        <aside className="app-card">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              {editingId ? "Editar marca" : "Nova marca"}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {editingId ? "Atualize as informações" : "Preencha os dados"}
            </h3>
          </header>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Nome da marca
              </label>
              <input
                required
                value={form.NomeMarca}
                onChange={(event) => setForm((prev) => ({ ...prev, NomeMarca: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Segmento ou linha
              </label>
              <input
                value={form.TipoMarca}
                onChange={(event) => setForm((prev) => ({ ...prev, TipoMarca: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Descrição
              </label>
              <textarea
                rows={3}
                value={form.DescMarca}
                onChange={(event) => setForm((prev) => ({ ...prev, DescMarca: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
