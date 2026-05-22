"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getErrorMessage } from "@/services/errors";
import { getPedido, listPedidos, listMyPedidoServices } from "@/services/pedidos";
import { listVeiculos } from "@/services/veiculos";
import {
  formatCurrency,
  formatDate,
  getVehicleLabel,
  resolvePedidoStatusValue,
  resolveVehicleStatusLabel,
} from "@/lib/portal-formatters";
import type { Pedido, PedidoPeca, PedidoServico, Servico, Veiculo } from "@/types/entities";

interface PedidosState {
  pedidos: Pedido[];
  veiculos: Veiculo[];
  servicos: Servico[];
}

const initialState: PedidosState = {
  pedidos: [],
  veiculos: [],
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

export function ClientePedidosSection() {
  const [data, setData] = useState<PedidosState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [pedidos, veiculos, servicos] = await Promise.all([
          listPedidos(),
          listVeiculos(),
          listMyPedidoServices(),
        ]);

        setData({ pedidos, veiculos, servicos });
      } catch (currentError) {
        setError(getErrorMessage(currentError, "Nao foi possivel carregar seus pedidos."));
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

  const filteredPedidos = useMemo(() => {
    if (!search.trim()) {
      return pedidosOrdenados;
    }

    const term = search.toLowerCase();

    return pedidosOrdenados.filter((pedido) => {
      const veiculo = veiculosById.get(pedido.idVeiculo);

      return [
        String(pedido.Id),
        pedido.Observacao,
        veiculo?.NomeVeiculo,
        veiculo?.PlacaVeiculo,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [pedidosOrdenados, search, veiculosById]);

  async function handleOpenDetails(pedidoId: number) {
    try {
      setDetailLoading(true);
      setError(null);
      setSelectedPedido(await getPedido(pedidoId));
    } catch (currentError) {
      setError(getErrorMessage(currentError, "Nao foi possivel carregar os detalhes do pedido."));
    } finally {
      setDetailLoading(false);
    }
  }

  function renderServicoLabel(servico: PedidoServico) {
    return servicosById.get(servico.IdServico)?.Nome ?? `Servico #${servico.IdServico}`;
  }

  function renderPecaLabel(peca: PedidoPeca) {
    return `Peca #${peca.IdPeca}`;
  }

  return (
    <div className="space-y-6">
      <section className="app-card space-y-4">
        <SectionHeader
          title="Meus pedidos"
          description="Seus pedidos sao listados abaixo com status, veiculo vinculado e acesso ao detalhe completo."
          actionSlot={
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por pedido, observacao ou placa"
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-80"
            />
          }
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <DataTable
          data={filteredPedidos}
          columns={[
            {
              header: "Pedido",
              key: "Id",
              render: (pedido: Pedido) => `#${pedido.Id}`,
              width: "100px",
            },
            {
              header: "Veiculo",
              key: "veiculo",
              render: (pedido: Pedido) => getVehicleLabel(veiculosById.get(pedido.idVeiculo)),
            },
            {
              header: "Inicio",
              key: "DataInicio",
              render: (pedido: Pedido) => formatDate(pedido.DataInicio),
              width: "120px",
            },
            {
              header: "Fim",
              key: "DataFim",
              render: (pedido: Pedido) => formatDate(pedido.DataFim),
              width: "120px",
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
            {
              header: "Acoes",
              key: "acoes",
              render: (pedido: Pedido) => (
                <button
                  type="button"
                  onClick={() => handleOpenDetails(pedido.Id)}
                  className="rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Detalhes
                </button>
              ),
            },
          ]}
          emptyMessage={loading ? "Carregando pedidos..." : "Nenhum pedido encontrado"}
          getRowId={(pedido) => pedido.Id}
        />
      </section>

      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setSelectedPedido(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Pedido #{selectedPedido.Id}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {getVehicleLabel(veiculosById.get(selectedPedido.idVeiculo))}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Inicio em {formatDate(selectedPedido.DataInicio)} e valor total de{" "}
                  {formatCurrency(selectedPedido.ValorTotal)}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            {detailLoading ? (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Atualizando detalhes do pedido...
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                  Resumo
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Status:</span>{" "}
                    {resolveVehicleStatusLabel(
                      resolvePedidoStatusValue(
                        selectedPedido,
                        veiculosById.get(selectedPedido.idVeiculo)
                      )
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Fim:</span>{" "}
                    {formatDate(selectedPedido.DataFim)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Funcionario:</span> #
                    {selectedPedido.idFuncionario}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Oficina:</span> #
                    {selectedPedido.idOficina}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                  Observacao
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedPedido.Observacao || "Nenhuma observacao registrada para este pedido."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                  Servicos vinculados
                </p>
                {selectedPedido.Pedido_Servicos.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Nenhum servico vinculado.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {selectedPedido.Pedido_Servicos.map((servico) => (
                      <li
                        key={`${servico.IdPedido}-${servico.IdServico}`}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                      >
                        <span className="font-semibold text-slate-900">
                          {renderServicoLabel(servico)}
                        </span>
                        {" • "}
                        Quantidade: {servico.QuantVezes}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                  Pecas vinculadas
                </p>
                {selectedPedido.Pedido_Pecas.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Nenhuma peca vinculada.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {selectedPedido.Pedido_Pecas.map((peca) => (
                      <li
                        key={`${peca.IdPedido}-${peca.IdPeca}`}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                      >
                        <span className="font-semibold text-slate-900">
                          {renderPecaLabel(peca)}
                        </span>
                        {" • "}
                        Quantidade: {peca.Quantidade}
                        {peca.Estado ? ` • Estado: ${peca.Estado}` : ""}
                        {peca.Observacao ? ` • ${peca.Observacao}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
