"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { ClientesSection } from "@/components/dashboard/ClientesSection";
import { FuncionariosSection } from "@/components/dashboard/FuncionariosSection";
import { ServicosSection } from "@/components/dashboard/ServicosSection";
import { VeiculosSection } from "@/components/dashboard/VeiculosSection";
import { MarcasSection } from "@/components/dashboard/MarcasSection";
import { CoresSection } from "@/components/dashboard/CoresSection";

const sections = [
  {
    id: "overview",
    label: "Visão geral",
    icon: "📊",
    title: "Indicadores e resumo semanal",
    subtitle:
      "Acompanhe o desempenho da oficina, clientes ativos e andamento das ordens de serviço.",
    component: <OverviewSection />,
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: "👥",
    title: "Gestão de clientes",
    subtitle:
      "Cadastre novos clientes, atualize dados e acompanhe o relacionamento da sua base.",
    component: <ClientesSection />,
  },
  {
    id: "funcionarios",
    label: "Equipe",
    icon: "🧑‍🔧",
    title: "Equipe e cargos",
    subtitle:
      "Controle sua equipe interna, cargos, contatos e situação dos colaboradores.",
    component: <FuncionariosSection />,
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: "🛠️",
    title: "Portfólio de serviços",
    subtitle:
      "Defina preços, descrições e garantias para seus serviços de manutenção.",
    component: <ServicosSection />,
  },
  {
    id: "veiculos",
    label: "Veículos",
    icon: "🚗",
    title: "Veículos cadastrados",
    subtitle:
      "Gerencie o histórico de veículos, vincule cores e acompanhe o status de atendimento.",
    component: <VeiculosSection />,
  },
  {
    id: "marcas",
    label: "Marcas",
    icon: "🏷️",
    title: "Catálogo de marcas",
    subtitle:
      "Organize as marcas e linhas de produtos para facilitar o cadastro de veículos.",
    component: <MarcasSection />,
  },
  {
    id: "cores",
    label: "Cores",
    icon: "🎨",
    title: "Cores disponíveis",
    subtitle:
      "Cadastre cores para vincular aos veículos e manter o estoque organizado.",
    component: <CoresSection />,
  },
] as const;

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>(
    "overview"
  );

  const currentSection = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0],
    [activeSection]
  );

  return (
    <AppShell
      navigation={sections.map(({ id, label, icon }) => ({ id, label, icon }))}
      active={currentSection.id}
      onNavigate={setActiveSection}
      title={currentSection.title}
      subtitle={currentSection.subtitle}
    >
      {currentSection.component}
    </AppShell>
  );
}
