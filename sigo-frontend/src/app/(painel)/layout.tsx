import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SessionGuard } from "@/components/auth/SessionGuard";

const PANEL_ROLES = ["Admin", "Funcionario", "Oficina"] as const;

interface PanelLayoutProps {
  children: ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  return (
    <SessionGuard
      allowedRoles={[...PANEL_ROLES]}
      redirectOnForbidden="/cliente"
    >
      <AppShell>{children}</AppShell>
    </SessionGuard>
  );
}
