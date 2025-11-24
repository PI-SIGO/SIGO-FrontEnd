import { ApiResponse, Servico } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/servicos";

type ServicoResponse = ApiResponse<Servico[] | Servico | null>;

export async function listServicos() {
  const payload = await apiFetch<ServicoResponse>(BASE_URL);
  return normalize(payload.Data);
}

export async function getServico(id: number) {
  const result = await apiFetch<Servico | ServicoResponse>(`${BASE_URL}/${id}`);
  return isApiResponse(result) ? (result.Data as Servico | null) : (result as Servico);
}

export async function createServico(servico: Partial<Servico>) {
  return apiFetch<ServicoResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(servico),
  });
}

export async function updateServico(id: number, servico: Partial<Servico>) {
  return apiFetch<ServicoResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(servico),
  });
}

export async function deleteServico(id: number) {
  return apiFetch<ServicoResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchServicoByNome(nome: string) {
  const payload = await apiFetch<ServicoResponse>(
    `${BASE_URL}/nome/${encodeURIComponent(nome)}`
  );
  return normalize(payload.Data);
}

function normalize(data: Servico[] | Servico | null | undefined) {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

function isApiResponse(value: unknown): value is ServicoResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "Code" in value &&
      "Data" in value
  );
}
