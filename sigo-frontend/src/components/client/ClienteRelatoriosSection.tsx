"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { downloadVehicleReport } from "@/services/relatorios";
import { getErrorMessage } from "@/services/errors";
import { listVeiculos } from "@/services/veiculos";
import {
  resolveVehicleStatusLabel,
  resolveVehicleStatusValue,
} from "@/lib/portal-formatters";
import type { Veiculo } from "@/types/entities";

function getStatusBadgeClass(status: number | null) {
  if (status === 3) {
    return "badge-success";
  }

  if (status === 2) {
    return "badge-warning";
  }

  return "badge";
}

export function ClienteRelatoriosSection() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setVeiculos(await listVeiculos());
      } catch (currentError) {
        setError(getErrorMessage(currentError, "Nao foi possivel carregar seus veiculos."));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleDownload(veiculoId: number) {
    try {
      setDownloadingId(veiculoId);
      setFeedback(null);
      setError(null);
      await downloadVehicleReport(veiculoId);
      setFeedback("Download do relatorio iniciado com sucesso.");
    } catch (currentError) {
      setError(getErrorMessage(currentError, "Nao foi possivel baixar o relatorio em PDF."));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="app-card space-y-4">
        <SectionHeader
          title="Relatorios"
          description="Selecione um veiculo para baixar o PDF do historico diretamente no seu dispositivo."
        />

        {feedback && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Carregando veiculos para emissao dos relatorios...
          </div>
        ) : veiculos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Nenhum veiculo encontrado para gerar relatorio.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {veiculos.map((veiculo) => {
              const status = resolveVehicleStatusValue(veiculo);

              return (
                <article
                  key={veiculo.Id}
                  className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.24)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                        Veiculo #{veiculo.Id}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {veiculo.NomeVeiculo || "Sem nome"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {veiculo.PlacaVeiculo || "Placa nao informada"} •{" "}
                        {veiculo.TipoVeiculo || "Tipo nao informado"}
                      </p>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(status)}`}>
                      {resolveVehicleStatusLabel(status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Quilometragem: {veiculo.Quilometragem.toLocaleString("pt-BR")} km</p>
                    <p>Combustivel: {veiculo.Combustivel || "Nao informado"}</p>
                    <p>Cor: {veiculo.Cor || "Nao informada"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(veiculo.Id)}
                    disabled={downloadingId === veiculo.Id}
                    className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {downloadingId === veiculo.Id
                      ? "Baixando relatorio..."
                      : "Baixar relatorio PDF"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
