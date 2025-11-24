"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataTable } from "@/components/ui/DataTable";
import { situacaoOptions, sexoOptions, tipoClienteOptions } from "@/lib/constants";
import { Cliente } from "@/types/entities";
import {
  createCliente,
  deleteCliente,
  listClientes,
  updateCliente,
} from "@/services/clientes";

interface FormState {
  Nome: string;
  Email: string;
  senha: string;
  Cpf_Cnpj: string;
  DataNasc: string;
  Sexo: string;
  TipoCliente: string;
  Situacao: string;
  Rua: string;
  Numero: string;
  Bairro: string;
  Cidade: string;
  Estado: string;
  Cep: string;
  Pais: string;
  Complemento: string;
  Obs: string;
  razao: string;
}

const initialForm: FormState = {
  Nome: "",
  Email: "",
  senha: "",
  Cpf_Cnpj: "",
  DataNasc: new Date().toISOString().slice(0, 10),
  Sexo: "1",
  TipoCliente: "1",
  Situacao: "1",
  Rua: "",
  Numero: "0",
  Bairro: "",
  Cidade: "",
  Estado: "",
  Cep: "0",
  Pais: "Brasil",
  Complemento: "",
  Obs: "",
  razao: "",
};

export function ClientesSection() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listClientes();
      setClientes(data);
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function populateForm(cliente: Cliente) {
    setForm({
      Nome: cliente.Nome ?? "",
      Email: cliente.Email ?? "",
      senha: "",
      Cpf_Cnpj: cliente.Cpf_Cnpj ?? "",
      DataNasc: cliente.DataNasc?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      Sexo: String(cliente.Sexo ?? 1),
      TipoCliente: String(cliente.TipoCliente ?? 1),
      Situacao: String(cliente.Situacao ?? 1),
      Rua: cliente.Rua ?? "",
      Numero: String(cliente.Numero ?? 0),
      Bairro: cliente.Bairro ?? "",
      Cidade: cliente.Cidade ?? "",
      Estado: cliente.Estado ?? "",
      Cep: String(cliente.Cep ?? 0),
      Pais: cliente.Pais ?? "",
      Complemento: cliente.Complemento ?? "",
      Obs: cliente.Obs ?? "",
      razao: (cliente as Cliente & { Razao?: string }).Razao ?? cliente.razao ?? "",
    });
    setEditingId(cliente.Id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Cliente> = {
      Nome: form.Nome,
      Email: form.Email,
      Cpf_Cnpj: form.Cpf_Cnpj,
      DataNasc: form.DataNasc,
      Sexo: Number(form.Sexo),
      TipoCliente: Number(form.TipoCliente),
      Situacao: Number(form.Situacao),
      Rua: form.Rua,
      Numero: Number(form.Numero) || 0,
      Bairro: form.Bairro,
      Cidade: form.Cidade,
      Estado: form.Estado,
      Cep: Number(form.Cep) || 0,
      Pais: form.Pais,
      Complemento: form.Complemento,
      Obs: form.Obs,
      razao: form.razao,
    };

    if (!editingId || form.senha.trim()) {
      payload.senha = form.senha;
    }

    try {
      if (editingId) {
        await updateCliente(editingId, payload);
        setFeedback("Cliente atualizado com sucesso.");
      } else {
        await createCliente(payload);
        setFeedback("Cliente cadastrado com sucesso.");
      }
      await refresh();
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível salvar o cliente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cliente: Cliente) {
    if (!window.confirm(`Deseja remover o cliente ${cliente.Nome}?`)) {
      return;
    }
    try {
      await deleteCliente(cliente.Id);
      setFeedback("Cliente removido com sucesso.");
      await refresh();
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível remover o cliente.");
    }
  }

  const filteredClientes = useMemo(() => {
    if (!search.trim()) {
      return clientes;
    }
    const term = search.toLowerCase();
    return clientes.filter((cliente) =>
      [
        cliente.Nome,
        cliente.Email,
        cliente.Cidade,
        cliente.Estado,
        cliente.Cpf_Cnpj,
      ]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(term))
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clientes"
        description="Cadastre novos clientes, gerencie dados e acompanhe a situação."
        actionSlot={
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CPF ou cidade"
              className="w-64 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        }
      />

      {feedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <DataTable
            data={filteredClientes}
            columns={[
              { header: "Nome", key: "Nome" },
              { header: "E-mail", key: "Email" },
              { header: "Cidade", key: "Cidade" },
              { header: "Estado", key: "Estado", width: "80px" },
              {
                header: "Situação",
                key: "Situacao",
                render: (item) => (
                  <span
                    className={`badge ${
                      item.Situacao === 1 ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {
                      situacaoOptions.find((option) => option.value === item.Situacao)
                        ?.label
                    }
                  </span>
                ),
              },
              {
                header: "Ações",
                key: "Id",
                render: (item) => (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => populateForm(item)}
                      className="rounded-lg border border-blue-200 px-3 py-1 font-medium text-blue-600 hover:bg-blue-50"
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
              loading ? "Carregando clientes..." : "Nenhum cliente encontrado"
            }
            getRowId={(cliente) => cliente.Id}
          />
        </div>
        <aside className="app-card">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              {editingId ? "Editar cliente" : "Novo cliente"}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {editingId ? "Atualize as informações" : "Preencha os dados"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Campos obrigatórios: nome, e-mail e documento.
            </p>
          </header>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Nome completo
              </label>
              <input
                required
                value={form.Nome}
                onChange={(event) => setForm((prev) => ({ ...prev, Nome: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                E-mail
              </label>
              <input
                required
                type="email"
                value={form.Email}
                onChange={(event) => setForm((prev) => ({ ...prev, Email: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Senha de acesso
              </label>
              <input
                type="password"
                required={!editingId}
                value={form.senha}
                onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
                placeholder={editingId ? "Informe para atualizar" : undefined}
                className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                CPF / CNPJ
              </label>
              <input
                required
                value={form.Cpf_Cnpj}
                onChange={(event) => setForm((prev) => ({ ...prev, Cpf_Cnpj: event.target.value }))}
                className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Tipo
                </label>
                <select
                  value={form.TipoCliente}
                  onChange={(event) => setForm((prev) => ({ ...prev, TipoCliente: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {tipoClienteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Situação
                </label>
                <select
                  value={form.Situacao}
                  onChange={(event) => setForm((prev) => ({ ...prev, Situacao: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {situacaoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Data de nascimento
              </label>
              <input
                type="date"
                value={form.DataNasc}
                onChange={(event) => setForm((prev) => ({ ...prev, DataNasc: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Sexo
              </label>
              <select
                value={form.Sexo}
                onChange={(event) => setForm((prev) => ({ ...prev, Sexo: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {sexoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Cidade
                </label>
                <input
                  required
                  value={form.Cidade}
                  onChange={(event) => setForm((prev) => ({ ...prev, Cidade: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Estado
                </label>
                <input
                  required
                  value={form.Estado}
                  onChange={(event) => setForm((prev) => ({ ...prev, Estado: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Rua
                </label>
                <input
                  required
                  value={form.Rua}
                  onChange={(event) => setForm((prev) => ({ ...prev, Rua: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Número
                </label>
                <input
                  required
                  value={form.Numero}
                  onChange={(event) => setForm((prev) => ({ ...prev, Numero: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Bairro
                </label>
                <input
                  required
                  value={form.Bairro}
                  onChange={(event) => setForm((prev) => ({ ...prev, Bairro: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  CEP
                </label>
                <input
                  required
                  value={form.Cep}
                  onChange={(event) => setForm((prev) => ({ ...prev, Cep: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                País
              </label>
              <input
                required
                value={form.Pais}
                onChange={(event) => setForm((prev) => ({ ...prev, Pais: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Complemento
              </label>
              <input
                required
                value={form.Complemento}
                onChange={(event) => setForm((prev) => ({ ...prev, Complemento: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Observações
              </label>
              <textarea
                rows={3}
                value={form.Obs}
                onChange={(event) => setForm((prev) => ({ ...prev, Obs: event.target.value }))}
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
