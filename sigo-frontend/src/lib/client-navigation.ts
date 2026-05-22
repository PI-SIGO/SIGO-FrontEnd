export interface ClientNavItem {
  href: string;
  label: string;
  icon: string;
  title: string;
  subtitle: string;
}

export const clientNavigation: ClientNavItem[] = [
  {
    href: "/cliente",
    label: "Inicio",
    icon: "IN",
    title: "Acompanhe seu atendimento em tempo real",
    subtitle:
      "Consulte o resumo dos seus veiculos, pedidos recentes e o ultimo servico vinculado a sua conta.",
  },
  {
    href: "/cliente/veiculos",
    label: "Meus veiculos",
    icon: "VH",
    title: "Seus veiculos cadastrados",
    subtitle:
      "Visualize placas, quilometragem, combustivel e o status atual de cada veiculo vinculado a voce.",
  },
  {
    href: "/cliente/pedidos",
    label: "Meus pedidos",
    icon: "PD",
    title: "Pedidos e historico de atendimento",
    subtitle:
      "Acompanhe o andamento dos pedidos, veja observacoes e consulte os servicos e pecas associados.",
  },
  {
    href: "/cliente/servicos",
    label: "Servicos realizados",
    icon: "SV",
    title: "Servicos vinculados aos seus pedidos",
    subtitle:
      "Veja os servicos executados ou planejados para seus veiculos com valor e garantia informados pela oficina.",
  },
  {
    href: "/cliente/relatorios",
    label: "Relatorios",
    icon: "RL",
    title: "Baixe relatorios em PDF",
    subtitle:
      "Gere o historico em PDF de cada veiculo autorizado para manter seus registros sempre por perto.",
  },
  {
    href: "/cliente/minha-conta",
    label: "Minha conta",
    icon: "MC",
    title: "Dados do seu cadastro",
    subtitle:
      "Consulte seus dados de contato e endereco no mesmo ambiente em que acompanha seus atendimentos.",
  },
];

export function getClientMeta(pathname: string) {
  return clientNavigation.find((item) => item.href === pathname) ?? clientNavigation[0];
}
