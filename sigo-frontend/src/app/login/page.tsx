"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  getUserRole,
  isInvalidCredentialsError,
  loginCliente,
  loginFuncionario,
  loginOficina,
  setToken,
} from "@/services/auth";
import { getErrorMessage } from "@/services/errors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();

    if (role === "Cliente") {
      router.replace("/cliente");
      return;
    }

    if (role === "Admin" || role === "Funcionario" || role === "Oficina") {
      router.replace("/visao-geral");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe o e-mail e a senha para continuar.");
      return;
    }

    try {
      setLoading(true);

      const loginAttempts = [loginCliente, loginFuncionario, loginOficina];
      let token: string | null = null;
      let lastError: unknown = null;

      for (const login of loginAttempts) {
        try {
          token = await login(email, password);
          break;
        } catch (attemptError) {
          lastError = attemptError;

          if (isInvalidCredentialsError(attemptError)) {
            continue;
          }

          throw attemptError;
        }
      }

      if (!token) {
        throw lastError ?? new Error("E-mail ou senha invalidos.");
      }

      setToken(token);

      const role = getUserRole(token);

      if (role === "Cliente") {
        router.replace("/cliente");
        return;
      }

      if (role === "Admin" || role === "Funcionario" || role === "Oficina") {
        router.replace("/visao-geral");
        return;
      }

      throw new Error("Nao foi possivel identificar o perfil do usuario.");
    } catch (currentError) {
      setError(
        getErrorMessage(
          currentError,
          "Falha ao autenticar. Verifique suas credenciais e tente novamente."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acesso seguro"
      title="Entre para acompanhar seu atendimento e sua operacao em tempo real."
      description="Clientes acompanham seus veiculos e pedidos. Oficina, administradores e funcionarios seguem para o painel operacional."
      footer={
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Nao tem acesso ainda?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Cadastre-se
            </Link>
          </p>
          <p className="mt-3">© {new Date().getFullYear()} SIGO. Todos os direitos reservados.</p>
        </div>
      }
    >
      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="email">
            <span>E-mail</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@empresa.com"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700" htmlFor="password">
            <span>Senha</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.35)] transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              autoComplete="current-password"
            />
          </label>
        </div>

        {error && (
          <p
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-2 focus:ring-blue-300"
            />
            Manter sessao ativa neste dispositivo
          </label>
          <span className="font-medium text-blue-600">Ambiente monitorado</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#60a5fa)] px-4 py-4 text-sm font-semibold text-white shadow-[0_24px_50px_-22px_rgba(37,99,235,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_55px_-22px_rgba(37,99,235,0.85)] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? "Entrando..." : "Entrar no SIGO"}
        </button>
      </form>
    </AuthShell>
  );
}
