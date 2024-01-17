import { saveDB } from "../Api";
import { updateWorkspaceIndexDB } from "./IndexDBUtils";
import { Table, loadTable } from "./WorkspaceDB";
import { indexdb } from "./indexdb";

export class TableBase<T> {
  public readonly tableName: Table;

  protected constructor(tableName: Table) {
    this.tableName = tableName;
  }

  public async listAll(): Promise<T[]> {
    const objs = await indexdb[this.tableName].toArray();
    if (objs?.length) return objs as T[];
    console.warn("indexdb not found", this.tableName, "fallback to legacy db");
    const records = await this.getRecords();
    return Object.values(records);
  }

  public async getRecords(): Promise<Record<string, T>> {
    console.warn("[DEPRECATED]getRecords() call", this.tableName);

    return await loadTable(this.tableName);
  }
  public async get(id: string): Promise<T | undefined> {
    const obj = await indexdb[this.tableName].get(id);
    if (obj) return obj as T;
    console.warn("indexdb not found", this.tableName, "fallback to legacy db");
    const records = await this.getRecords();
    return records[id];
  }

  public async delete(id: string) {
    await indexdb[this.tableName].delete(id);
    const records = await this.getRecords();
    delete records[id];
    saveDB(this.tableName, JSON.stringify(records));
    updateWorkspaceIndexDB();
  }
}
