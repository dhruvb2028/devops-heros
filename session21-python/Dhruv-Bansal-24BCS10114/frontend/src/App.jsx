import { useCallback, useEffect, useMemo, useState } from "react";
import { createApi } from "./api.mjs";
import { filterEquipment } from "./state.mjs";

const emptyForm = { name: "", category: "", location: "" };
const emptyLoan = { borrower: "", due_date: "" };
const filters = ["all", "available", "checked_out", "maintenance"];

function prettyStatus(status) {
  return status.replace("_", " ");
}

export default function App() {
  const api = useMemo(() => createApi(), []);
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    checked_out: 0,
    maintenance: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loan, setLoan] = useState(emptyLoan);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [items, summary] = await Promise.all([api.list(), api.stats()]);
      setEquipment(items);
      setStats(summary);
      setError("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function runAction(action) {
    setBusy(true);
    try {
      await action();
      await refresh();
      setDialog(null);
      setForm(emptyForm);
      setLoan(emptyLoan);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  const visible = filterEquipment(equipment, statusFilter, search);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">LG</span>
          <span>
            LabGear<small>campus equipment</small>
          </span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <div className="nav-active">
          <span>▦</span> Equipment
        </div>
        <div className="sidebar-note">
          Keep lab equipment visible, bookable, and ready for the next class.
        </div>
        <div className="sidebar-foot">Dhruv Bansal · 24BCS10114</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">LAB OPERATIONS / EQUIPMENT</p>
            <h1>LabGear</h1>
            <p className="muted">
              A clear view of what is ready, borrowed, or being repaired.
            </p>
          </div>
          <button
            className="primary"
            aria-label="Add equipment"
            onClick={() => setDialog({ type: "create" })}
          >
            + Add equipment
          </button>
        </header>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <section className="stats" aria-label="Equipment totals">
          {[
            ["All equipment", stats.total, "total"],
            ["Available", stats.available, "available"],
            ["Checked out", stats.checked_out, "checked_out"],
            ["Maintenance", stats.maintenance, "maintenance"],
          ].map(([label, value, key]) => (
            <div className={`stat-card ${key}`} key={key}>
              <div className="stat-top">
                <span>{label}</span>
                <span className="stat-dot" />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="catalog">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CATALOG</p>
              <h2>Equipment</h2>
            </div>
            <span className="count">{visible.length} shown</span>
          </div>
          <div className="controls">
            <input
              aria-label="Search equipment"
              placeholder="Search equipment"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="filters" aria-label="Filter by status">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={statusFilter === filter ? "selected" : ""}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === "all" ? "All" : prettyStatus(filter)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="empty">Loading equipment…</p>
          ) : visible.length === 0 ? (
            <p className="empty">No equipment matches this view.</p>
          ) : (
            <div className="equipment-list">
              {visible.map((item) => (
                <article className="equipment-row" key={item.id}>
                  <div className="item-icon">
                    {item.category.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="item-main">
                    <h3>{item.name}</h3>
                    <p>
                      {item.category} <span>·</span> {item.location}
                    </p>
                    {item.borrower && (
                      <p className="borrower">
                        With <strong>{item.borrower}</strong>
                        {item.due_date && ` · Due ${item.due_date}`}
                      </p>
                    )}
                  </div>
                  <span className={`status-pill ${item.status}`}>
                    {prettyStatus(item.status)}
                  </span>
                  <div className="row-actions">
                    {item.status === "available" && (
                      <button
                        aria-label={`Check out ${item.name}`}
                        onClick={() => setDialog({ type: "checkout", item })}
                      >
                        Check out
                      </button>
                    )}
                    {item.status === "checked_out" && (
                      <button
                        onClick={() => runAction(() => api.returnItem(item.id))}
                      >
                        Return
                      </button>
                    )}
                    {item.status !== "checked_out" && (
                      <button
                        onClick={() =>
                          runAction(() =>
                            api.update(item.id, {
                              status:
                                item.status === "maintenance"
                                  ? "available"
                                  : "maintenance",
                            }),
                          )
                        }
                      >
                        {item.status === "maintenance"
                          ? "Mark ready"
                          : "Maintenance"}
                      </button>
                    )}
                    {item.status !== "checked_out" && (
                      <button
                        className="danger-link"
                        onClick={() => runAction(() => api.remove(item.id))}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {dialog && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              dialog.type === "create" ? "Add equipment" : "Check out equipment"
            }
          >
            <div className="dialog-head">
              <div>
                <p className="eyebrow">LABGEAR</p>
                <h2>
                  {dialog.type === "create"
                    ? "Add equipment"
                    : `Check out ${dialog.item.name}`}
                </h2>
              </div>
              <button aria-label="Close" onClick={() => setDialog(null)}>
                ×
              </button>
            </div>
            {dialog.type === "create" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(() => api.create(form));
                }}
              >
                <label>
                  Name
                  <input
                    required
                    maxLength="120"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  Category
                  <input
                    required
                    maxLength="80"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  />
                </label>
                <label>
                  Location
                  <input
                    required
                    maxLength="80"
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                  />
                </label>
                <div className="dialog-actions">
                  <button type="button" onClick={() => setDialog(null)}>
                    Cancel
                  </button>
                  <button className="primary" disabled={busy}>
                    Save equipment
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(() => api.checkout(dialog.item.id, loan));
                }}
              >
                <label>
                  Borrower
                  <input
                    required
                    maxLength="120"
                    value={loan.borrower}
                    onChange={(event) =>
                      setLoan({ ...loan, borrower: event.target.value })
                    }
                  />
                </label>
                <label>
                  Due date
                  <input
                    required
                    type="date"
                    value={loan.due_date}
                    onChange={(event) =>
                      setLoan({ ...loan, due_date: event.target.value })
                    }
                  />
                </label>
                <div className="dialog-actions">
                  <button type="button" onClick={() => setDialog(null)}>
                    Cancel
                  </button>
                  <button className="primary" disabled={busy}>
                    Confirm checkout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
