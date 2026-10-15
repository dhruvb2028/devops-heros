export function filterEquipment(items, status, search) {
  const query = search.trim().toLowerCase();
  return items.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesText =
      !query ||
      [item.name, item.category, item.location].some((value) =>
        value.toLowerCase().includes(query),
      );
    return matchesStatus && matchesText;
  });
}
