import test from "node:test";
import assert from "node:assert/strict";
import { filterEquipment } from "./state.mjs";

const items = [
  {
    id: 1,
    name: "USB microscope",
    category: "Imaging",
    location: "Lab B",
    status: "available",
  },
  {
    id: 2,
    name: "Oscilloscope",
    category: "Electronics",
    location: "Lab C",
    status: "checked_out",
  },
];

test("status filter hides equipment in other states", () => {
  assert.deepEqual(filterEquipment(items, "available", ""), [items[0]]);
});

test("search matches equipment names without case sensitivity", () => {
  assert.deepEqual(filterEquipment(items, "all", "SCOPE"), [
    items[0],
    items[1],
  ]);
  assert.deepEqual(filterEquipment(items, "all", "oscillo"), [items[1]]);
});

test("search also matches location", () => {
  assert.deepEqual(filterEquipment(items, "all", "lab c"), [items[1]]);
});
