import { ApiResponse, Funcionario } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/funcionarios";

type FuncionarioResponse = ApiResponse<Funcionario[] | Funcionario | null>;

export async function listFuncionarios() {
  const payload = await apiFetch<FuncionarioResponse>(BASE_URL);
  return normalize(payload.Data);
}

export async function getFuncionario(id: number) {
  const result = await apiFetch<Funcionario | FuncionarioResponse>(`${BASE_URL}/${id}`);
  return isApiResponse(result) ? (result.Data as Funcionario | null) : (result as Funcionario);
}

export async function createFuncionario(funcionario: Partial<Funcionario>) {
  return apiFetch<FuncionarioResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(funcionario),
  });
}

export async function updateFuncionario(id: number, funcionario: Partial<Funcionario>) {
  return apiFetch<FuncionarioResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(funcionario),
  });
}

export async function deleteFuncionario(id: number) {
  return apiFetch<FuncionarioResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchFuncionarioByNome(nome: string) {
  const payload = await apiFetch<FuncionarioResponse>(
    `${BASE_URL}/nome/${encodeURIComponent(nome)}`
  );
  return normalize(payload.Data);
}

function normalize(data: Funcionario[] | Funcionario | null | undefined) {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

function isApiResponse(value: unknown): value is FuncionarioResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "Code" in value &&
      "Data" in value
  );
}
