// The shared fetch every service file uses. Each service supplies its
// own token (consumer store / rider store); this adds the Bearer header
// and turns non-2xx responses into thrown Errors carrying `.status`
// (and `.tiers` for fee errors), so callers just try/catch.
export async function apiFetch(path, { method = "GET", body, token, query } = {}) {
  if (!token) {
    throw new Error("Your session has expired — please sign in again.");
  }

  const qs = query ? `?${new URLSearchParams(query)}` : "";
  const response = await fetch(`${path}${qs}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    // empty / non-JSON body
  }

  if (!response.ok) {
    const error = new Error(result?.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.tiers = result?.tiers;
    throw error;
  }
  return result;
}
