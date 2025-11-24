import { ApiResponse, Cor } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/cores";

type CorResponse = ApiResponse<Cor[] | Cor | null>;

export async function listCores() {
  const payload = await apiFetch<CorResponse>(BASE_URL);
  return normalize(payload.Data);
}

export async function createCor(cor: Partial<Cor>) {
  return apiFetch<CorResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cor),
  });
}

export async function updateCor(id: number, cor: Partial<Cor>) {
  return apiFetch<CorResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cor),
  });
}

export async function deleteCor(id: number) {
  return apiFetch<CorResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchCorByNome(nome: string) {
  const payload = await apiFetch<CorResponse>(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  return normalize(payload.Data);
}

function normalize(data: Cor[] | Cor | null | undefined) {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}
