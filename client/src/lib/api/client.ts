export type ApiError = {
  message: string;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
}