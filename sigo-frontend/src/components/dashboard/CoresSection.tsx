"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Cor } from "@/types/entities";
import {
  createCor,
  deleteCor,
  listCores,
  updateCor,
} from "@/services/cores";

const initialForm = {
  NomeCor: "",
};

export function CoresSection() {
  const [cores, setCores] = useState<Cor[]>([]);
  const [form, setForm] = useState(initialForm);
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
      const data = await listCores();
      setCores(data);
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível carregar as cores.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function populateForm(cor: Cor) {
    setEditingId(cor.Id);
    setForm({ NomeCor: cor.NomeCor ?? "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateCor(editingId, form);
        setFeedback("Cor atualizada com sucesso.");
      } else {
        await createCor(form);
        setFeedback("Cor cadastrada com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível salvar a cor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cor: Cor) {
    if (!window.confirm(`Remover a cor ${cor.NomeCor}?`)) {
      return;
    }
    try {
      await deleteCor(cor.Id);
      setFeedback("Cor removida com sucesso.");
      await refresh();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível remover a cor.");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return cores;
    }
    const term = search.toLowerCase();
    return cores.filter((item) => item.NomeCor?.toLowerCase().includes(term));
  }, [cores, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cores"
        description="Mantenha a base de cores disponível para os cadastros de veículos."
        actionSlot={
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cor"
            className="w-64 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        }
      />

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <DataTable
          data={filtered}
          columns={[
            { header: "Nome da cor", key: "NomeCor" },
            {
              header: "Ações",
              key: "Id",
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
          emptyMessage={loading ? "Carregando cores..." : "Nenhuma cor cadastrada"}
          getRowId={(item) => item.Id}
        />

        <aside className="app-card">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              {editingId ? "Editar cor" : "Nova cor"}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {editingId ? "Atualize o nome" : "Cadastre novas opções"}
            </h3>
          </header>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Nome da cor
              </label>
              <input
                required
                value={form.NomeCor}
                onChange={(event) => setForm({ NomeCor: event.target.value })}
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
