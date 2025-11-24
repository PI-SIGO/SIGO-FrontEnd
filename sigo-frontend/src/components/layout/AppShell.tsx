"use client";

import { Dispatch, ReactNode, SetStateAction } from "react";

interface NavItem<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface AppShellProps<T extends string = string> {
  title: string;
  subtitle?: string;
  navigation: NavItem<T>[];
  active: T;
  onNavigate: Dispatch<SetStateAction<T>>;
  children: ReactNode;
}

export function AppShell<T extends string>({
  title,
  subtitle,
  navigation,
  active,
  onNavigate,
  children,
}: AppShellProps<T>) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen gap-6 px-4 py-6 lg:px-10 lg:py-10">
        <aside className="hidden w-72 flex-shrink-0 lg:block">
          <div className="sticky top-10 flex flex-col gap-8 rounded-3xl bg-white p-8 shadow-xl shadow-blue-500/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                SIGO
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">Painel de Controle</h1>
              <p className="mt-2 text-sm text-slate-500">
                Acompanhe clientes, veículos, ordens de serviço e equipe.
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                        : "border-transparent bg-transparent text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400">{isActive ? "Ver" : "Ir"}</span>
                  </button>
                );
              })}
            </nav>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
              <p className="text-sm font-medium">Precisa de ajuda?</p>
              <p className="mt-1 text-xs text-white/70">
                Consulte os relatórios e acompanhe os indicadores em tempo real.
              </p>
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <header className="mb-8 flex flex-col gap-2 rounded-3xl bg-white/80 p-6 shadow-lg shadow-blue-500/10 backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  SIGO Dashboard
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-slate-900">{title}</h2>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
            </div>
          </header>
          <div className="space-y-6 pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
