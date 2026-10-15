import test from "node:test";
import assert from "node:assert/strict";
import { createApi } from "./api.mjs";

test("list requests the equipment catalog", async () => {
  const calls = [];
  const api = createApi(async (...args) => {
    calls.push(args);
    return { ok: true, json: async () => [{ id: 4, name: "Camera" }] };
  });

  assert.deepEqual(await api.list(), [{ id: 4, name: "Camera" }]);
  assert.equal(calls[0][0], "/api/equipment");
  assert.equal(calls[0][1].method, "GET");
});

test("checkout sends the borrower and due date as JSON", async () => {
  const calls = [];
  const api = createApi(async (...args) => {
    calls.push(args);
    return { ok: true, json: async () => ({ id: 4, status: "checked_out" }) };
  });

  const result = await api.checkout(4, {
    borrower: "Maya",
    due_date: "2026-11-01",
  });
  assert.equal(result.status, "checked_out");
  assert.equal(calls[0][0], "/api/equipment/4/checkout");
  assert.equal(calls[0][1].method, "POST");
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    borrower: "Maya",
    due_date: "2026-11-01",
  });
});

test("API errors show the server explanation", async () => {
  const api = createApi(async () => ({
    ok: false,
    status: 409,
    json: async () => ({ detail: "Equipment is not available" }),
  }));
  await assert.rejects(
    api.checkout(4, { borrower: "Maya", due_date: "2026-11-01" }),
    /Equipment is not available/,
  );
});

test("create and update use the catalog write routes", async () => {
  const calls = [];
  const api = createApi(async (...args) => {
    calls.push(args);
    return { ok: true, json: async () => ({ id: 4 }) };
  });
  await api.create({ name: "Camera", category: "Imaging", location: "Lab B" });
  await api.update(4, { location: "Lab C" });
  assert.equal(calls[0][0], "/api/equipment");
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[1][0], "/api/equipment/4");
  assert.equal(calls[1][1].method, "PUT");
  assert.deepEqual(JSON.parse(calls[1][1].body), { location: "Lab C" });
});

test("return and delete use the right item routes", async () => {
  const calls = [];
  const api = createApi(async (...args) => {
    calls.push(args);
    return { ok: true, status: 204, json: async () => ({}) };
  });
  await api.returnItem(4);
  await api.remove(4);
  assert.deepEqual(
    calls.map(([path, options]) => [path, options.method]),
    [
      ["/api/equipment/4/return", "POST"],
      ["/api/equipment/4", "DELETE"],
    ],
  );
});

test("stats reads the summary endpoint", async () => {
  const api = createApi(async (path) => {
    assert.equal(path, "/api/equipment/stats");
    return { ok: true, json: async () => ({ total: 2, available: 1 }) };
  });
  assert.deepEqual(await api.stats(), { total: 2, available: 1 });
});
