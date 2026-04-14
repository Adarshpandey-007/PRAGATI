const DEFAULT_BACKEND_URL = "http://localhost:4000";

export function getBackendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BACKEND_URL
  ).replace(/\/$/, "");
}

export function toBackendUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendUrl()}${normalizedPath}`;
}
