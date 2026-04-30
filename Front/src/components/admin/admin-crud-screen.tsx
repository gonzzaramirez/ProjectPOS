"use client";

import { useMemo, useState } from "react";
import { apiRequest, getSession } from "@/src/lib/api";

type EntityConfig = {
  key: string;
  label: string;
  listPath: (ctx: { id_market: number; id_point: number }) => string;
  createPath?: string;
  updatePath?: (id: string) => string;
  deletePath?: (id: string) => string;
  defaultCreate: Record<string, unknown>;
};

const ENTITY_CONFIGS: EntityConfig[] = [
  {
    key: "markets",
    label: "Markets",
    listPath: () => "/markets",
    createPath: "/markets",
    updatePath: (id) => `/markets/${id}`,
    deletePath: (id) => `/markets/${id}`,
    defaultCreate: { name: "Nuevo Market", slug: "nuevo-market", flags: {} },
  },
  {
    key: "points",
    label: "Points",
    listPath: (ctx) => `/points?id_market=${ctx.id_market}`,
    createPath: "/points",
    updatePath: (id) => `/points/${id}`,
    deletePath: (id) => `/points/${id}`,
    defaultCreate: { point: "Caja 2", tag: "C2", id_market: 1 },
  },
  {
    key: "users",
    label: "Users",
    listPath: (ctx) => `/users?id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/users",
    updatePath: (id) => `/users/${id}`,
    deletePath: (id) => `/users/${id}`,
    defaultCreate: {
      user: "nuevo_user",
      password: "123456",
      role: "Cajero",
      id_point: 1,
      id_market: 1,
      pin: "1234",
    },
  },
  {
    key: "category",
    label: "Categories",
    listPath: (ctx) => `/category?id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/category",
    updatePath: (id) => `/category/${id}`,
    deletePath: (id) => `/category/${id}`,
    defaultCreate: {
      category: "Nueva categoria",
      description: "Descripcion",
      id_point: 1,
      id_market: 1,
    },
  },
  {
    key: "products",
    label: "Products",
    listPath: (ctx) => `/products?limit=200&id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/products",
    updatePath: (id) => `/products/${id}`,
    deletePath: (id) => `/products/${id}`,
    defaultCreate: {
      product_name: "Nuevo producto",
      price: 1000,
      stock: 10,
      id_category: 1,
      id_point: 1,
      id_market: 1,
      requires_cooking: false,
    },
  },
  {
    key: "orders",
    label: "Orders",
    listPath: (ctx) => `/orders?limit=200&id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/orders",
    updatePath: (id) => `/orders/${id}`,
    deletePath: (id) => `/orders/${id}`,
    defaultCreate: {
      uuid: "replace-with-uuid",
      client_name: "Consumidor Final",
      total: 1000,
      payment_method: "Efectivo",
      id_point: 1,
      id_market: 1,
      items: [{ id_product: 1, quantity: 1, price_at_sale: 1000 }],
    },
  },
  {
    key: "shifts",
    label: "Shifts",
    listPath: (ctx) => `/shifts?id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/shifts",
    updatePath: (id) => `/shifts/${id}/close`,
    defaultCreate: {
      id_user: 1,
      id_point: 1,
      id_market: 1,
      opening_amount: 10000,
    },
  },
  {
    key: "withdrawals",
    label: "Withdrawals",
    listPath: (ctx) => `/withdrawals?id_market=${ctx.id_market}&id_point=${ctx.id_point}`,
    createPath: "/withdrawals",
    defaultCreate: {
      amount: 1000,
      reason: "Retiro",
      id_user: 1,
      id_point: 1,
      id_market: 1,
      id_shift: 1,
    },
  },
];

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function AdminCrudScreen() {
  const [active, setActive] = useState<EntityConfig>(ENTITY_CONFIGS[0]);
  const [rows, setRows] = useState<unknown[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [createJson, setCreateJson] = useState<string>(pretty(active.defaultCreate));
  const [updateJson, setUpdateJson] = useState<string>("{}");
  const [formCreate, setFormCreate] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(active.defaultCreate).filter(([, v]) => !Array.isArray(v) && typeof v !== "object").map(([k, v]) => [k, String(v)]),
    ),
  );

  const entityTabs = useMemo(
    () =>
      ENTITY_CONFIGS.map((cfg) => (
        <button
          key={cfg.key}
          onClick={() => {
            setActive(cfg);
            setRows([]);
            setSelectedId("");
            setCreateJson(pretty(cfg.defaultCreate));
            setUpdateJson("{}");
            setFormCreate(
              Object.fromEntries(
                Object.entries(cfg.defaultCreate)
                  .filter(([, v]) => !Array.isArray(v) && typeof v !== "object")
                  .map(([k, v]) => [k, String(v)]),
              ),
            );
            setMessage("");
          }}
          className={`px-3 py-1.5 rounded-full text-xs border ${
            active.key === cfg.key ? "app-tab-active border-primary" : "app-card text-foreground border-border"
          }`}
        >
          {cfg.label}
        </button>
      )),
    [active.key],
  );

  const load = async () => {
    try {
      const session = await getSession();
      const data = await apiRequest<unknown>(
        active.listPath({
          id_market: session.user.id_market,
          id_point: session.user.id_point,
        }),
      );
      const normalized = Array.isArray(data)
        ? data
        : data && typeof data === "object" && "data" in (data as Record<string, unknown>)
          ? (((data as Record<string, unknown>).data as unknown[]) ?? [])
          : [];
      setRows(normalized);
      setMessage(`Cargados ${normalized.length} registros de ${active.label}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error cargando datos.");
    }
  };

  const create = async () => {
    if (!active.createPath) return;
    try {
      const payload = JSON.parse(createJson);
      await apiRequest(active.createPath, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(`Creado en ${active.label}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error creando.");
    }
  };

  const createFromForm = async () => {
    if (!active.createPath) return;
    const payload: Record<string, unknown> = {};
    Object.entries(formCreate).forEach(([k, v]) => {
      if (v.trim() === "") return;
      payload[k] = Number.isNaN(Number(v)) ? v : Number(v);
    });
    setCreateJson(pretty(payload));
    try {
      await apiRequest(active.createPath, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(`Creado en ${active.label} (formulario).`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error creando.");
    }
  };

  const update = async () => {
    if (!active.updatePath || !selectedId) return;
    try {
      const payload = JSON.parse(updateJson);
      await apiRequest(active.updatePath(selectedId), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setMessage(`Actualizado ${active.label} #${selectedId}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error actualizando.");
    }
  };

  const remove = async () => {
    if (!active.deletePath || !selectedId) return;
    try {
      await apiRequest(active.deletePath(selectedId), { method: "DELETE" });
      setMessage(`Eliminado ${active.label} #${selectedId}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error eliminando.");
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      <div className="px-4 py-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">{entityTabs}</div>
        <div className="app-card rounded-2xl p-3 shadow-sm flex gap-2">
          <button onClick={() => void load()} className="ps-pill-btn text-sm min-h-[40px]! px-4! py-2!">
            Cargar
          </button>
          <input
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            placeholder="ID para update/delete"
            className="ps-input px-3 py-2 text-sm w-56"
          />
        </div>
        {message ? <p className="app-text-muted-inverse text-xs">{message}</p> : null}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <section className="app-card rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-sm text-foreground">Create ({active.label})</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {Object.keys(formCreate).map((key) => (
              <label key={key} className="text-xs space-y-1">
                <span className="text-muted-foreground">{key}</span>
                <input
                  className="w-full ps-input px-3 py-2 text-sm"
                  value={formCreate[key]}
                  onChange={(e) =>
                    setFormCreate((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <button
            onClick={() => void createFromForm()}
            className="ps-pill-btn text-sm min-h-[40px]! px-4! py-2!"
          >
            Crear desde formulario
          </button>
          <textarea
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
            className="w-full min-h-40 ps-input p-3 font-mono text-xs"
          />
          <button onClick={() => void create()} className="ps-pill-btn text-sm min-h-[40px]! px-4! py-2!">
            Crear
          </button>
        </section>

        <section className="app-card rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-sm text-foreground">Update ({active.label})</h3>
          <textarea
            value={updateJson}
            onChange={(e) => setUpdateJson(e.target.value)}
            className="w-full min-h-32 ps-input p-3 font-mono text-xs"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void update()}
              className="ps-pill-btn text-sm min-h-[40px]! px-4! py-2!"
              disabled={!active.updatePath || !selectedId}
            >
              Actualizar
            </button>
            <button
              onClick={() => void remove()}
              className="ps-pill-btn bg-destructive text-destructive-foreground px-4 py-2 text-sm"
              disabled={!active.deletePath || !selectedId}
            >
              Eliminar
            </button>
          </div>
        </section>

        <section className="app-card rounded-2xl p-4 space-y-2 shadow-sm">
          <h3 className="font-semibold text-sm text-foreground">Resultados ({rows.length})</h3>
          <pre className="app-card-subtle w-full overflow-auto rounded-xl p-3 text-xs text-foreground">
            {pretty(rows)}
          </pre>
        </section>
      </div>
    </div>
  );
}
