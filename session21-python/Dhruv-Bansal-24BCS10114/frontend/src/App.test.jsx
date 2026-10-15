import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App.jsx";

let equipment;
let calls;

beforeEach(() => {
  equipment = [
    {
      id: 1,
      name: "USB microscope",
      category: "Imaging",
      location: "Lab B",
      status: "available",
      borrower: null,
      due_date: null,
    },
  ];
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path, options) => {
      calls.push([path, options]);
      if (path === "/api/equipment" && options.method === "GET") {
        return { ok: true, json: async () => [...equipment] };
      }
      if (path === "/api/equipment/stats") {
        return {
          ok: true,
          json: async () => ({
            total: equipment.length,
            available: equipment.length,
            checked_out: 0,
            maintenance: 0,
          }),
        };
      }
      if (path === "/api/equipment" && options.method === "POST") {
        const item = {
          id: equipment.length + 1,
          status: "available",
          borrower: null,
          due_date: null,
          ...JSON.parse(options.body),
        };
        equipment.push(item);
        return { ok: true, json: async () => item };
      }
      if (path === "/api/equipment/1/checkout" && options.method === "POST") {
        equipment[0] = {
          ...equipment[0],
          status: "checked_out",
          ...JSON.parse(options.body),
        };
        return { ok: true, json: async () => equipment[0] };
      }
      throw new Error(`Unexpected request: ${path}`);
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

test("shows the equipment catalog returned by the API", async () => {
  render(<App />);
  expect(await screen.findByText("USB microscope")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "LabGear" })).toBeTruthy();
});

test("creates equipment from the form and refreshes the catalog", async () => {
  render(<App />);
  await screen.findByText("USB microscope");
  fireEvent.click(screen.getByRole("button", { name: "Add equipment" }));
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Thermal camera" },
  });
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "Imaging" },
  });
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: "Lab C" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save equipment" }));

  await waitFor(() => expect(screen.getByText("Thermal camera")).toBeTruthy());
  expect(
    calls.some(
      ([path, options]) =>
        path === "/api/equipment" && options.method === "POST",
    ),
  ).toBe(true);
});

test("checkout records the borrower and updates the displayed status", async () => {
  render(<App />);
  await screen.findByText("USB microscope");
  fireEvent.click(
    screen.getByRole("button", { name: "Check out USB microscope" }),
  );
  fireEvent.change(screen.getByLabelText("Borrower"), {
    target: { value: "Maya" },
  });
  fireEvent.change(screen.getByLabelText("Due date"), {
    target: { value: "2026-11-01" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Confirm checkout" }));

  await waitFor(() => expect(screen.getByText("Maya")).toBeTruthy());
  expect(
    calls.some(
      ([path, options]) =>
        path.endsWith("/checkout") && options.method === "POST",
    ),
  ).toBe(true);
});
