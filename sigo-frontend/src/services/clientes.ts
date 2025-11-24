import { ApiResponse, Cliente } from "@/types/entities";
import { apiFetch } from "./api-client";

const BASE_URL = "/api/clientes";

type ClienteResponse = ApiResponse<Cliente[] | Cliente | null>;

export async function listClientes() {
  const payload = await apiFetch<ClienteResponse>(BASE_URL);
  if (Array.isArray(payload.Data)) {
    return payload.Data;
  }
  if (payload.Data && !Array.isArray(payload.Data)) {
    return [payload.Data];
  }
  return [];
}

export async function getCliente(id: number) {
  const payload = await apiFetch<Cliente | ClienteResponse>(`${BASE_URL}/${id}`);
  if (isApiResponse(payload)) {
    return payload.Data as Cliente | null;
  }
  return payload as Cliente;
}

export async function createCliente(cliente: Partial<Cliente>) {
  return apiFetch<ClienteResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export async function updateCliente(id: number, cliente: Partial<Cliente>) {
  return apiFetch<ClienteResponse>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cliente),
  });
}

export async function deleteCliente(id: number) {
  return apiFetch<ClienteResponse>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchClienteByNome(nome: string) {
  const payload = await apiFetch<ClienteResponse>(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  if (Array.isArray(payload.Data)) {
    return payload.Data;
  }
  if (payload.Data) {
    return [payload.Data as Cliente];
  }
  return [];
}

function isApiResponse(value: unknown): value is ClienteResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "Code" in value &&
      "Data" in value
  );
}
