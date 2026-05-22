"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  formatAddress,
  formatDate,
  formatPhoneList,
  resolveSituacaoLabel,
  resolveTipoClienteLabel,
} from "@/lib/portal-formatters";
import { getUserFromToken } from "@/services/auth";
import { getCliente, updateCliente } from "@/services/clientes";
import { getErrorMessage } from "@/services/errors";
import type { Cliente, Telefone } from "@/types/entities";

interface TelefoneFormState {
  Id: number;
  Numero: string;
}

interface ContaFormState {
  Nome: string;
  Email: string;
  Cpf_Cnpj: string;
  DataNasc: string;
  Numero: string;
  Rua: string;
  Cidade: string;
  Cep: string;
  Bairro: string;
  Estado: string;
  Pais: string;
  Complemento: string;
  Sexo: number;
  TipoCliente: number;
  Situacao: number;
  razao: string;
  Obs: string;
  Telefones: TelefoneFormState[];
}

function toContaForm(cliente: Cliente): ContaFormState {
  return {
    Nome: cliente.Nome ?? "",
    Email: cliente.Email ?? "",
    Cpf_Cnpj: cliente.Cpf_Cnpj ?? "",
    DataNasc: cliente.DataNasc ?? "",
    Numero: String(cliente.Numero ?? 0),
    Rua: cliente.Rua ?? "",
    Cidade: cliente.Cidade ?? "",
    Cep: cliente.Cep ?? "",
    Bairro: cliente.Bairro ?? "",
    Estado: cliente.Estado ?? "",
    Pais: cliente.Pais ?? "",
    Complemento: cliente.Complemento ?? "",
    Sexo: cliente.Sexo ?? 1,
    TipoCliente: cliente.TipoCliente ?? 1,
    Situacao: cliente.Situacao ?? 1,
    razao: cliente.razao ?? "",
    Obs: cliente.Obs ?? "",
    Telefones:
      cliente.Telefones?.map((telefone) => ({
        Id: telefone.Id ?? 0,
        Numero: telefone.Numero ?? "",
      })) ?? [],
  };
}

export function ClienteContaSection() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ContaFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = getUserFromToken();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const payload = await getCliente(user.id);

        if (!payload) {
          throw new Error("Cliente nao encontrado.");
        }

        setCliente(payload);
        setForm(toContaForm(payload));
      } catch (currentError) {
        setError(getErrorMessage(currentError, "Nao foi possivel carregar sua conta."));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updatePhone(index: number, value: string) {
    setForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      const telefones = [...currentForm.Telefones];
      telefones[index] = {
        ...telefones[index],
        Numero: value,
      };

      return {
        ...currentForm,
        Telefones: telefones,
      };
    });
  }

  function addPhone() {
    setForm((currentForm) =>
      currentForm
        ? {
            ...currentForm,
            Telefones: [...currentForm.Telefones, { Id: 0, Numero: "" }],
          }
        : currentForm
    );
  }

  function removePhone(index: number) {
    setForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        Telefones: currentForm.Telefones.filter((_, phoneIndex) => phoneIndex !== index),
      };
    });
  }

  async function handleSave() {
    const user = getUserFromToken();

    if (!user || !form || !cliente) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFeedback(null);

      const telefones: Telefone[] = form.Telefones.filter((telefone) => telefone.Numero.trim()).map(
        (telefone) => ({
          Id: telefone.Id,
          Numero: telefone.Numero,
          ClienteId: user.id,
        })
      );

      const payload: Partial<Cliente> = {
        Nome: form.Nome.trim(),
        Email: form.Email.trim(),
        Cpf_Cnpj: form.Cpf_Cnpj,
        DataNasc: form.DataNasc,
        Numero: Number(form.Numero) || 0,
        Rua: form.Rua.trim(),
        Cidade: form.Cidade.trim(),
        Cep: form.Cep.trim(),
        Bairro: form.Bairro.trim(),
        Estado: form.Estado.trim(),
        Pais: form.Pais.trim(),
        Complemento: form.Complemento.trim(),
        Sexo: form.Sexo,
        TipoCliente: form.TipoCliente,
        Situacao: form.Situacao,
        razao: form.razao.trim(),
        Obs: form.Obs.trim(),
        Telefones: telefones,
      };

      await updateCliente(user.id, payload);

      const refreshedCliente = await getCliente(user.id);
      if (!refreshedCliente) {
        throw new Error("Nao foi possivel atualizar os dados da conta.");
      }

      setCliente(refreshedCliente);
      setForm(toContaForm(refreshedCliente));
      setEditing(false);
      setFeedback("Dados atualizados com sucesso.");
    } catch (currentError) {
      setError(getErrorMessage(currentError, "Nao foi possivel salvar sua conta."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="app-card text-sm text-slate-600">
        Carregando os dados da sua conta...
      </div>
    );
  }

  if (!cliente || !form) {
    return (
      <div className="app-card text-sm text-rose-600">
        {error || "Nao foi possivel carregar sua conta."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-card space-y-4">
        <SectionHeader
          title="Minha conta"
          description="Seus dados sao exibidos abaixo. Como existe endpoint seguro para o proprio cliente, voce pode atualizar as informacoes de contato e endereco."
          actionSlot={
            <button
              type="button"
              onClick={() => {
                setEditing((currentEditing) => !currentEditing);
                setForm(toContaForm(cliente));
              }}
              className="rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {editing ? "Cancelar edicao" : "Editar dados"}
            </button>
          }
        />

        {feedback && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-blue-100 bg-blue-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Identificacao
            </p>
            <p className="mt-3 text-xl font-semibold text-slate-900">{cliente.Nome}</p>
            <p className="mt-2 text-sm text-slate-600">{cliente.Email}</p>
            <p className="mt-2 text-sm text-slate-600">{formatPhoneList(cliente.Telefones)}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Cadastro
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">CPF/CNPJ:</span>{" "}
                {cliente.Cpf_Cnpj}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Tipo:</span>{" "}
                {resolveTipoClienteLabel(cliente.TipoCliente)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Nascimento:</span>{" "}
                {formatDate(cliente.DataNasc)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Situacao:</span>{" "}
                {resolveSituacaoLabel(cliente.Situacao)}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Endereco
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{formatAddress(cliente)}</p>
          </div>
        </div>
      </section>

      <section className="app-card space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
            Dados editaveis
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Os campos abaixo ficam habilitados quando voce escolhe editar seus dados.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Nome</span>
            <input
              value={form.Nome}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Nome: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>E-mail</span>
            <input
              type="email"
              value={form.Email}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Email: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Rua</span>
            <input
              value={form.Rua}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Rua: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Numero</span>
            <input
              value={form.Numero}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Numero: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Bairro</span>
            <input
              value={form.Bairro}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Bairro: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Cidade</span>
            <input
              value={form.Cidade}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Cidade: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Estado</span>
            <input
              value={form.Estado}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Estado: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>CEP</span>
            <input
              value={form.Cep}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Cep: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Pais</span>
            <input
              value={form.Pais}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Pais: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Complemento</span>
            <input
              value={form.Complemento}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, Complemento: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Razao social ou apelido</span>
            <input
              value={form.razao}
              disabled={!editing}
              onChange={(event) => setForm({ ...form, razao: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Observacoes</span>
          <textarea
            value={form.Obs}
            disabled={!editing}
            onChange={(event) => setForm({ ...form, Obs: event.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Telefones</p>
            {editing && (
              <button
                type="button"
                onClick={addPhone}
                className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Adicionar telefone
              </button>
            )}
          </div>

          {form.Telefones.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Nenhum telefone cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {form.Telefones.map((telefone, index) => (
                <div key={`${telefone.Id}-${index}`} className="flex gap-3">
                  <input
                    value={telefone.Numero}
                    disabled={!editing}
                    onChange={(event) => updatePhone(index, event.target.value)}
                    placeholder="(00) 00000-0000"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm disabled:bg-slate-50"
                  />
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={!editing || saving}
            onClick={() => {
              setEditing(false);
              setForm(toContaForm(cliente));
            }}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Descartar
          </button>
          <button
            type="button"
            disabled={!editing || saving}
            onClick={handleSave}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </div>
      </section>
    </div>
  );
}
