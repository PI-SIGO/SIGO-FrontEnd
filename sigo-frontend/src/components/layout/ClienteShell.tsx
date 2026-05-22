"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clientNavigation, getClientMeta } from "@/lib/client-navigation";
import { AUTH_CHANGE_EVENT, clearToken, getUserFromToken } from "@/services/auth";
import type { AuthUser } from "@/types/entities";

interface ClienteShellProps {
  children: ReactNode;
}

export function ClienteShell({ children }: ClienteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = getClientMeta(pathname);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(getUserFromToken());
    }

    syncUser();
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
    };
  }, []);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-8 flex flex-col gap-8 rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_28px_70px_-36px_rgba(37,99,235,0.28)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                Portal do Cliente
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">SIGO</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Um ambiente simples para acompanhar veiculos, pedidos, servicos e relatorios.
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {clientNavigation.map((item) => {
                const isActive = item.href === pathname;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-transparent text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-600">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400">{isActive ? "Aberta" : "Abrir"}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[28px] bg-[linear-gradient(145deg,#eff6ff,#dbeafe)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Sua sessao
              </p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {user?.name || "Cliente"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{user?.email || "Conta autenticada"}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-blue-100 bg-white px-5 py-4 shadow-[0_20px_50px_-38px_rgba(37,99,235,0.28)] lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                SIGO
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {user?.name || "Portal do cliente"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              Sair
            </button>
          </div>

          <nav className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {clientNavigation.map((item) => {
              const isActive = item.href === pathname;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <header className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.3)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Cliente
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                  {currentPage.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  {currentPage.subtitle}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{user?.name || "Cliente autenticado"}</p>
                <p className="mt-1">{user?.email || "Sessao ativa no dispositivo atual"}</p>
              </div>
            </div>
          </header>

          <div className="space-y-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
