import { ReactNode } from "react";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { ClienteShell } from "@/components/layout/ClienteShell";

const CLIENT_ROLES = ["Cliente"] as const;

interface ClienteLayoutProps {
  children: ReactNode;
}

export default function ClienteLayout({ children }: ClienteLayoutProps) {
  return (
    <SessionGuard
      allowedRoles={[...CLIENT_ROLES]}
      redirectOnForbidden="/visao-geral"
    >
      <ClienteShell>{children}</ClienteShell>
    </SessionGuard>
  );
}
