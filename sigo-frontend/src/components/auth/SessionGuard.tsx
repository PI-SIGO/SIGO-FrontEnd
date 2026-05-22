"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/entities";
import { clearToken, getUserFromToken } from "@/services/auth";

interface SessionGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectOnForbidden: string;
  redirectOnUnauthenticated?: string;
}

export function SessionGuard({
  children,
  allowedRoles,
  redirectOnForbidden,
  redirectOnUnauthenticated = "/login",
}: SessionGuardProps) {
  const router = useRouter();

  const access = useMemo(() => {
    const user = getUserFromToken();

    if (!user) {
      return {
        allowed: false,
        redirectTo: redirectOnUnauthenticated,
        shouldClearToken: true,
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        redirectTo: redirectOnForbidden,
        shouldClearToken: false,
      };
    }

    return {
      allowed: true,
      redirectTo: null,
      shouldClearToken: false,
    };
  }, [allowedRoles, redirectOnForbidden, redirectOnUnauthenticated]);

  useEffect(() => {
    if (access.allowed || !access.redirectTo) {
      return;
    }

    if (access.shouldClearToken) {
      clearToken();
    }

    router.replace(access.redirectTo);
  }, [access, router]);

  if (!access.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8ff] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-blue-100 bg-white p-8 text-center shadow-[0_28px_70px_-38px_rgba(37,99,235,0.38)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
            SIGO
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Validando seu acesso
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Estamos conferindo sua sessao para abrir o ambiente correto.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
