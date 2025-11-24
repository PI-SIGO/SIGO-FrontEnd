import { ApiResponse, Marca } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/marcas";

type MarcaResponse = ApiResponse<Marca[] | Marca | null>;

export async function listMarcas() {
  const payload = await apiFetch<MarcaResponse>(BASE_URL);
  return normalize(payload.Data);
}

export async function getMarca(id: number) {
  const result = await apiFetch<Marca | MarcaResponse>(`${BASE_URL}/${id}`);
  return isApiResponse(result) ? (result.Data as Marca | null) : (result as Marca);
}

export async function createMarca(marca: Partial<Marca>) {
  return apiFetch<MarcaResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(marca),
  });
}

export async function updateMarca(id: number, marca: Partial<Marca>) {
  return apiFetch<MarcaResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(marca),
  });
}

export async function deleteMarca(id: number) {
  return apiFetch<MarcaResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchMarcaByNome(nome: string) {
  const payload = await apiFetch<Marca[] | MarcaResponse>(
    `${BASE_URL}/nome/${encodeURIComponent(nome)}`
  );

  if (Array.isArray(payload)) {
    return payload;
  }

  if (isApiResponse(payload)) {
    return normalize(payload.Data);
  }

  return [];
}

function normalize(data: Marca[] | Marca | null | undefined) {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

function isApiResponse(value: unknown): value is MarcaResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "Code" in value &&
      "Data" in value
  );
}
