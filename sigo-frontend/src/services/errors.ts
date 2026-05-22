export class ApiError extends Error {
  status: number;
  response: unknown;

  constructor(message: string, status: number, response: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

export function extractApiMessage(response: unknown): string | null {
  if (typeof response === "string" && response.trim()) {
    return response.trim();
  }

  if (!response || typeof response !== "object") {
    return null;
  }

  const payload = response as {
    Message?: string | null;
    message?: string | null;
    title?: string | null;
    detail?: string | null;
    error?: string | null;
  };

  const message =
    payload.Message ?? payload.message ?? payload.title ?? payload.detail ?? payload.error;

  return typeof message === "string" && message.trim() ? message.trim() : null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const apiMessage = extractApiMessage(error.response);

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return "Erro de rede ao conectar com a API.";
    }

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
