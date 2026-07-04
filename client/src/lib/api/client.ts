export class ApiResponseError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError, message?: string) {
    super(message || data.message || "API request failed");
    this.name = "ApiResponseError";
    this.status = status;
    this.data = data;
  }
}

export type ApiError = {
  message: string;
};

export type RequestBody = FormData | BodyInit | Record<string, unknown>;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: RequestBody;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Refresh failed");
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function performRequest(
  path: string,
  options: RequestOptions
): Promise<Response> {
  console.log("performRequest");
  const body = options.body;
  const isFormData = body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  console.log("request called ", path, options);
  let response = await performRequest(path, options);

  if (response.status === 401 && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();
      response = await performRequest(path, options);
    } catch {
      throw new ApiResponseError(401, {
        message: "Authentication expired. Please log in again.",
      });
    }
  }

  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new ApiResponseError(response.status, payload);
  }

  return payload as T;
}