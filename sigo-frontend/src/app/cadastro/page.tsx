"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { sexoOptions, tipoClienteOptions } from "@/lib/constants";
import { ApiError } from "@/services/api-client";
import { extractApiMessage } from "@/services/errors";
import { createCliente } from "@/services/clientes";
import { Cliente } from "@/types/entities";

interface CadastroFormState {
  Nome: string;
  Email: string;
  senha: string;
  Cpf_Cnpj: string;
  DataNasc: string;
  Sexo: number;
  TipoCliente: number;
  Numero: string;
  Rua: string;
  Cidade: string;
  Cep: string;
  Bairro: string;
  Estado: string;
  Pais: string;
  Complemento: string;
  razao: string;
}

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function createInitialFormState(): CadastroFormState {
  return {
    Nome: "",
    Email: "",
    senha: "",
    Cpf_Cnpj: "",
    DataNasc: getTodayInputValue(),
    Sexo: 3,
    TipoCliente: 1,
    Numero: "",
    Rua: "",
    Cidade: "",
    Cep: "",
    Bairro: "",
    Estado: "",
    Pais: "Brasil",
    Complemento: "",
    razao: "",
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const apiMessage = extractApiMessage(error.response);

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return "Erro de rede ao conectar com a API. Verifique se o backend do SIGO está em execução.";
    }

    return `Não foi possível concluir o cadastro (${error.message})`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível concluir o cadastro.";
}

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState<CadastroFormState>(createInitialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const documentoLabel = useMemo(
    () => (form.TipoCliente === 2 ? "CNPJ" : "CPF"),
    [form.TipoCliente]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: Partial<Cliente> = {
      Nome: form.Nome.trim(),
      Email: form.Email.trim(),
      senha: form.senha,
      Cpf_Cnpj: form.Cpf_Cnpj.trim(),
      DataNasc: form.DataNasc,
      Sexo: form.Sexo,
      TipoCliente: form.TipoCliente,
      Situacao: 1,
      Numero: Number(form.Numero) || 0,
      Rua: form.Rua.trim(),
      Cidade: form.Cidade.trim(),
      Cep: form.Cep.trim(),
      Bairro: form.Bairro.trim(),
      Estado: form.Estado.trim(),
      Pais: form.Pais.trim(),
      Complemento: form.Complemento.trim(),
      razao: form.razao.trim(),
      Obs: "",
    };

    try {
      setLoading(true);
      await createCliente(payload);
      setSuccess("Cadastro realizado com sucesso. Redirecionando para o login...");
      setForm(createInitialFormState());
      setTimeout(() => router.push("/login"), 1200);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Primeiro acesso"
      title="Crie seu cadastro para acompanhar sua oficina com mais clareza."
      description="Use os dados mínimos do cliente para iniciar no SIGO sem sair do padrão visual já adotado na plataforma."
      footer={
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Já possui acesso?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Entrar agora
            </Link>
          </p>
          <p className="mt-3">© {new Date().getFullYear()} SIGO. Todos os direitos reservados.</p>
        </div>
      }
    >
      <form
        className="mt-12 space-y-7 rounded-[30px] border border-blue-100/80 bg-white/85 p-5 shadow-[0_28px_70px_-44px_rgba(37,99,235,0.35)] backdrop-blur-sm sm:p-6 lg:p-7 [&_input]:min-h-[3.35rem] [&_select]:min-h-[3.35rem]"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="nome">
            <span>Nome completo</span>
            <input
              id="nome"
              type="text"
              required
              value={form.Nome}
              onChange={(event) => setForm((current) => ({ ...current, Nome: event.target.value }))}
              placeholder="Digite seu nome"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="name"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="tipo-cliente">
            <span>Tipo de cliente</span>
            <select
              id="tipo-cliente"
              value={form.TipoCliente}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  TipoCliente: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {tipoClienteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="sexo">
            <span>Sexo</span>
            <select
              id="sexo"
              value={form.Sexo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Sexo: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {sexoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="documento">
            <span>{documentoLabel}</span>
            <input
              id="documento"
              type="text"
              required
              value={form.Cpf_Cnpj}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Cpf_Cnpj: event.target.value,
                }))
              }
              placeholder={`Digite seu ${documentoLabel}`}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="off"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="data-nascimento">
            <span>Data de nascimento</span>
            <input
              id="data-nascimento"
              type="date"
              required
              value={form.DataNasc}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  DataNasc: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="razao">
            <span>Razão social / apelido</span>
            <input
              id="razao"
              type="text"
              value={form.razao}
              onChange={(event) => setForm((current) => ({ ...current, razao: event.target.value }))}
              placeholder="Opcional"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="email">
            <span>E-mail</span>
            <input
              id="email"
              type="email"
              required
              value={form.Email}
              onChange={(event) => setForm((current) => ({ ...current, Email: event.target.value }))}
              placeholder="seuemail@empresa.com"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="senha">
            <span>Senha</span>
            <input
              id="senha"
              type="password"
              required
              value={form.senha}
              onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
              placeholder="Crie sua senha"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="new-password"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="cep">
            <span>CEP</span>
            <input
              id="cep"
              type="text"
              required
              value={form.Cep}
              onChange={(event) => setForm((current) => ({ ...current, Cep: event.target.value }))}
              placeholder="00000-000"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="postal-code"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="estado">
            <span>Estado</span>
            <input
              id="estado"
              type="text"
              required
              value={form.Estado}
              onChange={(event) => setForm((current) => ({ ...current, Estado: event.target.value }))}
              placeholder="UF"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="address-level1"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="cidade">
            <span>Cidade</span>
            <input
              id="cidade"
              type="text"
              required
              value={form.Cidade}
              onChange={(event) => setForm((current) => ({ ...current, Cidade: event.target.value }))}
              placeholder="Sua cidade"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="address-level2"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="bairro">
            <span>Bairro</span>
            <input
              id="bairro"
              type="text"
              required
              value={form.Bairro}
              onChange={(event) => setForm((current) => ({ ...current, Bairro: event.target.value }))}
              placeholder="Seu bairro"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="rua">
            <span>Rua</span>
            <input
              id="rua"
              type="text"
              required
              value={form.Rua}
              onChange={(event) => setForm((current) => ({ ...current, Rua: event.target.value }))}
              placeholder="Informe a rua"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="street-address"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="numero">
            <span>Número</span>
            <input
              id="numero"
              type="number"
              required
              min="0"
              value={form.Numero}
              onChange={(event) => setForm((current) => ({ ...current, Numero: event.target.value }))}
              placeholder="0"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="address-line2"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="complemento">
            <span>Complemento</span>
            <input
              id="complemento"
              type="text"
              required
              value={form.Complemento}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  Complemento: event.target.value,
                }))
              }
              placeholder="Casa, bloco, sala..."
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2" htmlFor="pais">
            <span>País</span>
            <input
              id="pais"
              type="text"
              required
              value={form.Pais}
              onChange={(event) => setForm((current) => ({ ...current, Pais: event.target.value }))}
              placeholder="Brasil"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="country-name"
            />
          </label>
        </div>

        {error && (
          <p
            className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-medium text-rose-600"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-700"
            aria-live="polite"
          >
            {success}
          </p>
        )}

        <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Cadastro de cliente com os campos mínimos exigidos pelo backend atual.</p>
          <span className="font-medium text-blue-600">Integração pronta para uso</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#60a5fa)] px-4 py-[1.125rem] text-sm font-semibold text-white shadow-[0_24px_50px_-22px_rgba(37,99,235,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_55px_-22px_rgba(37,99,235,0.85)] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? "Criando cadastro..." : "Criar meu acesso"}
        </button>
      </form>
    </AuthShell>
  );
}
