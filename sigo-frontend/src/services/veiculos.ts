import { ApiResponse, Veiculo } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/veiculos";

type VeiculoResponse = ApiResponse<Veiculo[] | Veiculo | null>;

export async function listVeiculos() {
  const payload = await apiFetch<VeiculoResponse>(BASE_URL);
  return normalize(payload.Data);
}

export async function createVeiculo(veiculo: Partial<Veiculo>) {
  return apiFetch<VeiculoResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(veiculo),
  });
}

export async function updateVeiculo(id: number, veiculo: Partial<Veiculo>) {
  return apiFetch<VeiculoResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(veiculo),
  });
}

export async function deleteVeiculo(id: number) {
  return apiFetch<VeiculoResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchVeiculoByPlaca(placa: string) {
  const payload = await apiFetch<VeiculoResponse>(
    `${BASE_URL}/placa/${encodeURIComponent(placa)}`
  );
  return normalize(payload.Data);
}

export async function searchVeiculoByTipo(tipo: string) {
  const payload = await apiFetch<VeiculoResponse>(
    `${BASE_URL}/tipo/${encodeURIComponent(tipo)}`
  );
  return normalize(payload.Data);
}

function normalize(data: Veiculo[] | Veiculo | null | undefined) {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}
