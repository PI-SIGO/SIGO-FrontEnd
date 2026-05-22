"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getErrorMessage } from "@/services/errors";
import { listPedidos, listMyPedidoServices } from "@/services/pedidos";
import { listVeiculos } from "@/services/veiculos";
import {
  formatCurrency,
  formatDate,
  getVehicleLabel,
  resolvePedidoStatusValue,
  resolveVehicleStatusLabel,
  resolveVehicleStatusValue,
} from "@/lib/portal-formatters";
import type { Pedido, Servico, Veiculo } from "@/types/entities";

interface DashboardState {
  veiculos: Veiculo[];
  pedidos: Pedido[];
  servicos: Servico[];
}

const initialState: DashboardState = {
  veiculos: [],
  pedidos: [],
  servicos: [],
};

function getStatusBadgeClass(status: number | null) {
  if (status === 3) {
    return "badge-success";
  }

  if (status === 2) {
    return "badge-warning";
  }

  return "badge";
}

function sortPedidosByDate(pedidos: Pedido[]) {
  return [...pedidos].sort((first, second) => second.DataInicio.localeCompare(first.DataInicio));
}

export function ClienteDashboardSection() {
  const [data, setData] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [veiculos, pedidos, servicos] = await Promise.all([
          listVeiculos(),
          listPedidos(),
          listMyPedidoServices(),
        ]);

        setData({ veiculos, pedidos, servicos });
      } catch (currentError) {
        setError(
          getErrorMessage(
            currentError,
            "Nao foi possivel carregar o resumo do seu portal."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const veiculosById = useMemo(
    () => new Map(data.veiculos.map((veiculo) => [veiculo.Id, veiculo])),
    [data.veiculos]
  );

  const servicosById = useMemo(
    () => new Map(data.servicos.map((servico) => [servico.Id, servico])),
    [data.servicos]
  );

  const pedidosOrdenados = useMemo(() => sortPedidosByDate(data.pedidos), [data.pedidos]);
  const pedidosFinalizados = useMemo(
    () =>
      data.pedidos.filter((pedido) => {
        const veiculo = veiculosById.get(pedido.idVeiculo);
        return resolvePedidoStatusValue(pedido, veiculo) === 3;
      }).length,
    [data.pedidos, veiculosById]
  );

  const pedidosEmAndamento = data.pedidos.length - pedidosFinalizados;

  const ultimoServico = useMemo(() => {
    for (const pedido of pedidosOrdenados) {
      for (const servico of pedido.Pedido_Servicos) {
        const nome = servicosById.get(servico.IdServico)?.Nome;
        if (nome) {
          return nome;
        }
      }
    }

    return data.servicos[0]?.Nome ?? "Sem servicos registrados";
  }, [data.servicos, pedidosOrdenados, servicosById]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de veiculos"
          value={loading ? "--" : String(data.veiculos.length)}
          helper="Veiculos vinculados a sua conta"
        />
        <StatCard
          title="Pedidos em andamento"
          value={loading ? "--" : String(Math.max(pedidosEmAndamento, 0))}
          helper="Atendimentos com acompanhamento ativo"
        />
        <StatCard
          title="Pedidos finalizados"
          value={loading ? "--" : String(pedidosFinalizados)}
          helper="Historico concluido no sistema"
        />
        <StatCard
          title="Ultimo servico"
          value={loading ? "--" : ultimoServico}
          helper="Servico mais recente encontrado nos seus pedidos"
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="app-card space-y-4">
        <SectionHeader
          title="Veiculos recentes"
          description="Uma visao curta dos veiculos mais recentes ou com informacoes ativas no seu cadastro."
        />
        <DataTable
          data={loading ? [] : data.veiculos.slice(0, 4)}
          columns={[
            {
              header: "Veiculo",
              key: "NomeVeiculo",
              render: (veiculo: Veiculo) => (
                <div>
                  <p className="font-medium text-slate-900">{veiculo.NomeVeiculo || "Sem nome"}</p>
                  <p className="text-xs text-slate-500">{veiculo.TipoVeiculo || "Tipo nao informado"}</p>
                </div>
              ),
            },
            { header: "Placa", key: "PlacaVeiculo", width: "140px" },
            {
              header: "Quilometragem",
              key: "Quilometragem",
              render: (veiculo: Veiculo) => `${veiculo.Quilometragem.toLocaleString("pt-BR")} km`,
            },
            {
              header: "Status",
              key: "Situacao",
              render: (veiculo: Veiculo) => {
                const status = resolveVehicleStatusValue(veiculo);
                return (
                  <span className={`badge ${getStatusBadgeClass(status)}`}>
                    {resolveVehicleStatusLabel(status)}
                  </span>
                );
              },
            },
          ]}
          emptyMessage={loading ? "Carregando veiculos..." : "Nenhum veiculo encontrado"}
          getRowId={(veiculo) => veiculo.Id}
        />
      </section>

      <section className="app-card space-y-4">
        <SectionHeader
          title="Pedidos recentes"
          description="Resumo dos pedidos mais recentes vinculados aos seus veiculos."
        />
        <DataTable
          data={loading ? [] : pedidosOrdenados.slice(0, 5)}
          columns={[
            {
              header: "Pedido",
              key: "Id",
              render: (pedido: Pedido) => `#${pedido.Id}`,
              width: "100px",
            },
            {
              header: "Veiculo",
              key: "idVeiculo",
              render: (pedido: Pedido) => getVehicleLabel(veiculosById.get(pedido.idVeiculo)),
            },
            {
              header: "Inicio",
              key: "DataInicio",
              render: (pedido: Pedido) => formatDate(pedido.DataInicio),
              width: "130px",
            },
            {
              header: "Status",
              key: "status",
              render: (pedido: Pedido) => {
                const status = resolvePedidoStatusValue(
                  pedido,
                  veiculosById.get(pedido.idVeiculo)
                );

                return (
                  <span className={`badge ${getStatusBadgeClass(status)}`}>
                    {resolveVehicleStatusLabel(status)}
                  </span>
                );
              },
            },
            {
              header: "Valor total",
              key: "ValorTotal",
              render: (pedido: Pedido) => formatCurrency(pedido.ValorTotal),
            },
          ]}
          emptyMessage={loading ? "Carregando pedidos..." : "Nenhum pedido encontrado"}
          getRowId={(pedido) => pedido.Id}
        />
      </section>
    </div>
  );
}
