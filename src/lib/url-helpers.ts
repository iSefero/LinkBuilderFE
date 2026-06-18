export function toExternalUrl(value: string): string {
  if (!value.trim()) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function toServerUrl(server: string): string {
  if (!server.trim()) return "";
  const trimmed = server.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}:8888`;
}
