import { situacaoOptions, statusVeiculoOptions, tipoClienteOptions } from "@/lib/constants";
import type { Cliente, Pedido, Telefone, Veiculo } from "@/types/entities";

const EMPTY_DATE_PREFIX = "0001-01-01";

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function formatDate(value?: string | null) {
  if (!value || value.startsWith(EMPTY_DATE_PREFIX)) {
    return "Nao informado";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

export function resolveSituacaoLabel(value?: number | null) {
  if (value === null || value === undefined) {
    return "Nao informado";
  }

  return situacaoOptions.find((option) => option.value === value)?.label ?? "Nao informado";
}

export function resolveTipoClienteLabel(value?: number | null) {
  if (value === null || value === undefined) {
    return "Nao informado";
  }

  return tipoClienteOptions.find((option) => option.value === value)?.label ?? "Nao informado";
}

export function resolveVehicleStatusLabel(value?: number | null) {
  if (value === null || value === undefined) {
    return "Nao informado";
  }

  return (
    statusVeiculoOptions.find((option) => option.value === value)?.label ?? "Nao informado"
  );
}

export function resolveVehicleStatusValue(veiculo?: Veiculo | null) {
  return veiculo?.Status ?? veiculo?.Situacao ?? null;
}

export function resolvePedidoStatusValue(pedido: Pedido, veiculo?: Veiculo | null) {
  const vehicleStatus = resolveVehicleStatusValue(veiculo);
  if (vehicleStatus !== null) {
    return vehicleStatus;
  }

  return pedido.DataFim && !pedido.DataFim.startsWith(EMPTY_DATE_PREFIX) ? 3 : 2;
}

export function formatPhoneNumber(telefone?: Telefone | null) {
  if (!telefone?.Numero) {
    return "Nao informado";
  }

  const digits = telefone.Numero.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return telefone.Numero;
}

export function formatPhoneList(telefones?: Telefone[] | null) {
  if (!telefones?.length) {
    return "Nao informado";
  }

  return telefones.map((telefone) => formatPhoneNumber(telefone)).join(" • ");
}

export function formatAddress(cliente?: Cliente | null) {
  if (!cliente) {
    return "Nao informado";
  }

  const parts = [
    cliente.Rua,
    cliente.Numero ? String(cliente.Numero) : "",
    cliente.Bairro,
    cliente.Cidade,
    cliente.Estado,
    cliente.Cep,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Nao informado";
}

export function getVehicleLabel(veiculo?: Veiculo | null) {
  if (!veiculo) {
    return "Veiculo nao identificado";
  }

  const pieces = [veiculo.NomeVeiculo, veiculo.PlacaVeiculo].filter(Boolean);
  return pieces.join(" • ");
}
