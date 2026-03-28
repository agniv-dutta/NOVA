import { AuthUser, RegisterPayload, TokenResponse } from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body = null, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        errorMessage = String(payload.detail);
      }
    } catch {
      // Ignore JSON parse failures for non-JSON errors.
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function loginApi(email: string, password: string): Promise<TokenResponse> {
  const formData = new URLSearchParams();

  formData.set("username", email);
  formData.set("password", password);

  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function registerApi(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function meApi(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export async function logoutApi(token: string): Promise<void> {
  await apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}

export async function protectedGetApi<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>(path, { token });
}

export { API_BASE_URL };
