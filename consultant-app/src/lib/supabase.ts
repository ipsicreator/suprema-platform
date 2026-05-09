import { pb } from './pocketbase';

type QueryResult<T = any> = { data: T; error: any };

const esc = (v: string | number | boolean) => String(v).replace(/'/g, "\\'");

class QueryBuilder implements PromiseLike<QueryResult<any>> {
  private collection: string;
  private filters: string[] = [];
  private sort = '';
  private limitCount: number | null = null;
  private action: 'select' | 'update' | 'delete' = 'select';
  private patchData: Record<string, any> = {};

  constructor(collection: string) {
    this.collection = collection;
  }

  select(_: string) { this.action = 'select'; return this; }
  eq(field: string, value: any) { if (value !== undefined && value !== null) this.filters.push(`${field}='${esc(value)}'`); return this; }
  order(field: string, opts?: { ascending?: boolean }) { this.sort = `${opts?.ascending === false ? '-' : '+'}${field}`; return this; }
  limit(n: number) { this.limitCount = n; return this; }
  update(values: Record<string, any>) { this.action = 'update'; this.patchData = values; return this; }
  delete() { this.action = 'delete'; return this; }

  async single(): Promise<QueryResult<any>> {
    const result = await this.execute();
    if (result.error) return result;
    const row = Array.isArray(result.data) ? result.data[0] ?? null : result.data;
    return { data: row, error: null };
  }

  then<TResult1 = QueryResult<any>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }

  private async execute(): Promise<QueryResult<any>> {
    const filter = this.filters.join(' && ');
    try {
      if (this.action === 'select') {
        const records = await pb.collection(this.collection).getFullList({ filter, sort: this.sort || undefined });
        return { data: this.limitCount ? records.slice(0, this.limitCount) : records, error: null };
      }

      const targets = await pb.collection(this.collection).getFullList({ filter });
      if (this.action === 'update') {
        const updated = await Promise.all(targets.map((r: any) => pb.collection(this.collection).update(r.id, this.patchData)));
        return { data: updated, error: null };
      }

      await Promise.all(targets.map((r: any) => pb.collection(this.collection).delete(r.id)));
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const supabase = {
  auth: {
    async getUser() {
      return { data: { user: pb.authStore.model }, error: null };
    },
  },
  from(table: string) {
    return {
      select(columns: string) { return new QueryBuilder(table).select(columns); },
      async insert(payload: any[] | Record<string, any>) {
        try {
          const rows = Array.isArray(payload) ? payload : [payload];
          const created = await Promise.all(rows.map((row) => pb.collection(table).create(row)));
          return { data: created, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      update(values: Record<string, any>) { return new QueryBuilder(table).update(values); },
      delete() { return new QueryBuilder(table).delete(); },
      async upsert(payload: Record<string, any>) {
        try {
          if (payload.id) {
            const updated = await pb.collection(table).update(payload.id, payload);
            return { data: updated, error: null };
          }
          const created = await pb.collection(table).create(payload);
          return { data: created, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
    };
  },
};
