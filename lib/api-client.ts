import { getAuthToken } from "@/lib/auth-storage";
import { toBackendUrl } from "@/lib/config";

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = false, headers, ...rest } = options;
  const requestHeaders = new Headers(headers || undefined);

  if (auth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(toBackendUrl(path), {
    ...rest,
    headers: requestHeaders,
  });
}
