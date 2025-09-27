// Reports Service - Kullanıcı rapor tanımları
import { databaseService } from '@/services/database';

export interface ReportConfig {
  fact: 'payments_all' | 'payments_expense' | 'payments_income' | 'payments' | 'entries';
  dimension: 'month' | 'category' | 'status' | 'type';
  measure: 'sum' | 'count' | 'avg';
  filters?: Record<string, unknown>;
  chart?: 'table' | 'bar' | 'line' | 'pie';
}

export interface ReportDef {
  id: string;
  name: string;
  config: ReportConfig;
  created_at: string;
  updated_at: string;
}

class ReportsService {
  async saveReport(name: string, config: ReportConfig): Promise<string> {
    const id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await databaseService.query(
      `INSERT INTO reports (id, name, config) VALUES (?, ?, ?)`,
      [id, name, JSON.stringify(config)]
    );
    return id;
  }

  async listReports(): Promise<ReportDef[]> {
    const rows = await databaseService.getAll<any>(`SELECT * FROM reports ORDER BY created_at DESC`);
    return rows.map(r => ({ ...r, config: JSON.parse(r.config) }));
  }

  async getReport(id: string): Promise<ReportDef | null> {
    const row = await databaseService.getFirst<any>(`SELECT * FROM reports WHERE id = ?`, [id]);
    return row ? { ...row, config: JSON.parse(row.config) } : null;
  }

  async updateReport(id: string, name: string, config: ReportConfig): Promise<void> {
    await databaseService.query(
      `UPDATE reports SET name = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, JSON.stringify(config), id]
    );
  }

  async deleteReport(id: string): Promise<void> {
    await databaseService.query(`DELETE FROM reports WHERE id = ?`, [id]);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
