export function createApi(fetcher = fetch) {
  async function request(path, method = "GET", data) {
    const response = await fetcher(path, {
      method,
      headers: data === undefined ? {} : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed (${response.status})`);
    }
    return response.status === 204 ? undefined : response.json();
  }

  return {
    list: () => request("/api/equipment"),
    stats: () => request("/api/equipment/stats"),
    create: (data) => request("/api/equipment", "POST", data),
    update: (id, data) => request(`/api/equipment/${id}`, "PUT", data),
    checkout: (id, data) =>
      request(`/api/equipment/${id}/checkout`, "POST", data),
    returnItem: (id) => request(`/api/equipment/${id}/return`, "POST"),
    remove: (id) => request(`/api/equipment/${id}`, "DELETE"),
  };
}
