import { buildBackendUrl } from "@/lib/config";
import type { Relatorio } from "@/types/entities";
import { clearToken, getToken } from "./auth";
import { ApiError, extractApiMessage } from "./errors";

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  clearToken();
  window.location.assign("/login");
}

function tryParseJson(text: string) {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractFileName(disposition: string | null, veiculoId: number) {
  if (!disposition) {
    return `relatorio-veiculo-${veiculoId}.pdf`;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (fileNameMatch?.[1]) {
    return fileNameMatch[1];
  }

  return `relatorio-veiculo-${veiculoId}.pdf`;
}

export async function getVehicleReport(veiculoId: number): Promise<Relatorio> {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    throw new ApiError("Sessao expirada.", 401, null);
  }

  let response: Response;

  try {
    response = await fetch(buildBackendUrl(`Report/vehicle/${veiculoId}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError("Erro de rede", 0, error);
  }

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
  }

  if (!response.ok) {
    const text = await response.text();
    const payload = tryParseJson(text);
    throw new ApiError(
      extractApiMessage(payload) ?? `Erro HTTP ${response.status}`,
      response.status,
      payload
    );
  }

  return {
    veiculoId,
    fileName: extractFileName(response.headers.get("content-disposition"), veiculoId),
    contentType: response.headers.get("content-type") ?? "application/pdf",
    blob: await response.blob(),
  };
}

export async function downloadVehicleReport(veiculoId: number) {
  const report = await getVehicleReport(veiculoId);

  if (typeof window !== "undefined") {
    const url = window.URL.createObjectURL(report.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = report.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  return report;
}
