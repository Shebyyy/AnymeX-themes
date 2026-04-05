import { loadDb, saveDbWithRetry } from "./github-store";

// Generate a CUID-like ID (compatible with Prisma's cuid())
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

type Filter = { type: "eq"; field: string; value: any } | { type: "or"; raw: string };

class QueryBuilder {
  private table: string;
  private op: "select" | "insert" | "update" | "delete" = "select";
  private filters: Filter[] = [];
  private orderBy: { field: string; ascending?: boolean } | null = null;
  private selected = "*";
  private singleRow = false;
  private insertPayload: any[] = [];
  private updatePayload: Record<string, any> = {};
  private selectOpts: any;
  private limitCount: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*", options?: any) {
    this.op = "select";
    this.selected = columns;
    this.selectOpts = options;
    return this;
  }

  insert(payload: any | any[]) {
    this.op = "insert";
    this.insertPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  update(payload: Record<string, any>) {
    this.op = "update";
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ type: "eq", field, value });
    return this;
  }

  or(raw: string) {
    this.filters.push({ type: "or", raw });
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.orderBy = { field, ascending: opts?.ascending };
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  private applyOr(rows: any[], raw: string): any[] {
    const clauses = raw.split(",").map((c) => c.trim()).filter(Boolean);
    return rows.filter((row) =>
      clauses.some((clause) => {
        const parts = clause.split(".");
        if (parts.length < 3) return false;
        const [field, op, ...rest] = parts;
        const value = rest.join(".");
        if (op === "ilike") {
          const needle = value.replaceAll("%", "").toLowerCase();
          const hay = String(row[field] ?? "").toLowerCase();
          return hay.includes(needle);
        }
        return false;
      }),
    );
  }

  private async attachRelations(rows: any[]) {
    if (!this.selected.includes("User(") && !this.selected.includes("creator:User")) {
      return rows;
    }

    const { db } = await loadDb();
    return rows.map((row) => {
      const next = { ...row };
      if (this.selected.includes("User(") && row.userId) {
        next.User = db.User.find((u: any) => u.id === row.userId) || null;
      }
      if (this.selected.includes("creator:User") && row.createdBy) {
        next.creator = db.User.find((u: any) => u.id === row.createdBy) || null;
      }
      return next;
    });
  }

  private project(rows: any[]) {
    if (this.selected === "*" || this.selected.includes("*")) {
      return rows;
    }
    const fields = this.selected
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f && !f.includes("(") && !f.includes(":"));
    if (!fields.length) return rows;
    return rows.map((row) => {
      const picked: Record<string, any> = {};
      for (const field of fields) picked[field] = row[field];
      return picked;
    });
  }

  private filterRows(rows: any[]) {
    let out = [...rows];
    for (const filter of this.filters) {
      if (filter.type === "eq") {
        out = out.filter((row) => row[filter.field] === filter.value);
      } else if (filter.type === "or") {
        out = this.applyOr(out, filter.raw);
      }
    }
    if (this.orderBy) {
      const { field, ascending } = this.orderBy;
      out.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        return av > bv ? 1 : -1;
      });
      if (ascending === false) out.reverse();
    }
    return out;
  }

  async execute() {
    try {
      const { db, sha } = await loadDb();
      const rows = (db as any)[this.table] || [];
      const matched = this.filterRows(rows);

      if (this.op === "select") {
        if (this.selectOpts?.count === "exact" && this.selectOpts?.head) {
          return { data: null, error: null, count: matched.length };
        }

        let data = await this.attachRelations(matched);
        data = this.project(data);

        if (this.limitCount !== null) {
          data = data.slice(0, this.limitCount);
        }

        if (this.singleRow) {
          if (data.length !== 1) {
            return { data: null, error: { message: "Expected single row" } };
          }
          return { data: data[0], error: null };
        }
        return { data, error: null };
      }

      if (this.op === "insert") {
        const next = [...rows, ...this.insertPayload];
        (db as any)[this.table] = next;
        await saveDbWithRetry(db as any, sha, `chore(db): insert ${this.insertPayload.length} in ${this.table}`);
        const inserted = this.insertPayload;
        if (this.singleRow) return { data: inserted[0] || null, error: null };
        return { data: inserted, error: null };
      }

      if (this.op === "update") {
        const updatedRows: any[] = [];
        const next = rows.map((row: any) => {
          const isMatch = matched.some((m: any) => m.id === row.id);
          if (!isMatch) return row;
          const updated = { ...row, ...this.updatePayload };
          updatedRows.push(updated);
          return updated;
        });
        (db as any)[this.table] = next;
        await saveDbWithRetry(db as any, sha, `chore(db): update ${updatedRows.length} in ${this.table}`);

        let data: any = updatedRows;
        data = await this.attachRelations(data);
        data = this.project(data);
        if (this.singleRow) return { data: data[0] || null, error: null };
        return { data, error: null };
      }

      if (this.op === "delete") {
        const toDeleteIds = new Set(matched.map((m: any) => m.id));
        const next = rows.filter((row: any) => !toDeleteIds.has(row.id));
        const deleted = rows.filter((row: any) => toDeleteIds.has(row.id));
        (db as any)[this.table] = next;
        await saveDbWithRetry(db as any, sha, `chore(db): delete ${deleted.length} in ${this.table}`);
        if (this.singleRow) return { data: deleted[0] || null, error: null };
        return { data: deleted, error: null };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "DB error" } };
    }
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
};

// Legacy export for backward compatibility
export const db = supabase;
