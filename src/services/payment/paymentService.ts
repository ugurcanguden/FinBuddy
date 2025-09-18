// Payment Service - Entry ve Payment yönetimi
import { databaseService } from '@/services/database';
import { PAYMENT_SCRIPTS } from '@/constants/scripts/paymentScripts';

function addMonthsClamp(dateISO: string, monthsToAdd: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const base = new Date(y, m - 1 + monthsToAdd, 1);
  // hedef ayın gün sayısına clamp
  const daysInTarget = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const day = Math.min(d, daysInTarget);
  const res = new Date(base.getFullYear(), base.getMonth(), day);
  const yy = res.getFullYear();
  const mm = String(res.getMonth() + 1).padStart(2, '0');
  const dd = String(res.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

type EntryType = 'expense' | 'income' | 'receivable';

export interface CreateEntryInput {
  categoryId: string;
  title: string;
  amount: number;
  months: number; // 0 veya 1 => tek sefer, >1 => taksit sayısı
  startDate: string; // YYYY-MM-DD
  type?: EntryType;
}

class PaymentService {
  private async sumBy(type: 'expense' | 'income', status?: 'paid' | 'pending' | 'any', ym?: string): Promise<number> {
    const params: any[] = [];
    let where = `e.type = ?`;
    params.push(type);
    if (status && status !== 'any') {
      if (status === 'paid') {
        where += ` AND p.status IN ('paid','received')`;
      } else if (status === 'pending') {
        where += ` AND p.status = 'pending'`;
      }
    }
    if (ym) {
      where += ` AND substr(p.due_date,1,7) = ?`;
      params.push(ym);
    }
    const row = await databaseService.getFirst<{ total: number }>(
      `SELECT COALESCE(SUM(p.amount),0) AS total
       FROM payments p
       JOIN entries e ON e.id = p.entry_id
       WHERE ${where}`,
      params
    );
    return Number(row?.total || 0);
  }

  async getDashboardSummary(ym?: string): Promise<{
    expense: { total: number; paid: number; pending: number };
    income: { total: number; paid: number; pending: number };
  }> {
    const [eTotal, ePaid, ePending, iTotal, iPaid, iPending] = await Promise.all([
      this.sumBy('expense', 'any', ym),
      this.sumBy('expense', 'paid', ym),
      this.sumBy('expense', 'pending', ym),
      this.sumBy('income', 'any', ym),
      this.sumBy('income', 'paid', ym),
      this.sumBy('income', 'pending', ym),
    ]);
    return {
      expense: { total: eTotal, paid: ePaid, pending: ePending },
      income: { total: iTotal, paid: iPaid, pending: iPending },
    };
  }

  async getMonthlySeries(
    type: 'expense' | 'income',
    options?: { year?: string; limit?: number }
  ): Promise<Array<{ ym: string; total: number }>> {
    const { year, limit = 12 } = options ?? {};
    const today = new Date().toISOString().slice(0, 10);
    const where: string[] = ['e.type = ?'];
    const params: any[] = [type];
    if (year) {
      where.push('substr(p.due_date,1,4) = ?');
      params.push(year);
    }
    if (!year) {
      where.push('p.due_date <= ?');
      params.push(today);
    }

    const rows = await databaseService.getAll<{ ym: string; total: number }>(
      `SELECT substr(p.due_date,1,7) AS ym, COALESCE(SUM(p.amount),0) AS total
       FROM payments p
       JOIN entries e ON e.id = p.entry_id
       WHERE ${where.join(' AND ')}
       GROUP BY ym
       ORDER BY ym ASC`,
      params
    );
    return limit ? rows.slice(-limit) : rows;
  }

  async getMonthlyExpenseBreakdown(options?: { year?: string; limit?: number }): Promise<Array<{ ym: string; total: number; paid: number }>> {
    const { year, limit = 12 } = options ?? {};
    const today = new Date().toISOString().slice(0, 10);
    const where: string[] = [`e.type = 'expense'`];
    const params: any[] = [];
    if (year) {
      where.push('substr(p.due_date,1,4) = ?');
      params.push(year);
    }
    if (!year) {
      where.push('p.due_date <= ?');
      params.push(today);
    }

    const rows = await databaseService.getAll<{ ym: string; total: number; paid: number }>(
      `SELECT substr(p.due_date,1,7) AS ym,
              COALESCE(SUM(p.amount),0) AS total,
              COALESCE(SUM(CASE WHEN p.status IN ('paid','received') THEN p.amount ELSE 0 END),0) AS paid
       FROM payments p
       JOIN entries e ON e.id = p.entry_id
       WHERE ${where.join(' AND ')}
       GROUP BY ym
       ORDER BY ym ASC`,
      params
    );
    const sliced = limit ? rows.slice(-limit) : rows;
    return sliced.map((row) => ({
      ym: row.ym,
      total: Number(row.total || 0),
      paid: Number(row.paid || 0),
    }));
  }

  async getUpcomingPayments(limit = 5, daysAhead = 30): Promise<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number }>> {
    const today = new Date();
    const ahead = new Date();
    ahead.setDate(today.getDate() + daysAhead);
    const start = today.toISOString().slice(0, 10);
    const end = ahead.toISOString().slice(0, 10);
    return databaseService.getAll(
      `SELECT p.id, p.entry_id, p.due_date, p.amount, e.title
       FROM payments p
       JOIN entries e ON e.id = p.entry_id
       WHERE p.status = 'pending' AND p.due_date BETWEEN ? AND ?
       ORDER BY p.due_date ASC
       LIMIT ?`,
      [start, end, limit]
    );
  }

  async getOverduePayments(type: 'expense' | 'income', limit = 10): Promise<Array<{ id: string; entry_id: string; title: string | null; due_date: string; amount: number }>> {
    const today = new Date().toISOString().slice(0, 10);
    return databaseService.getAll(
      `SELECT p.id, p.entry_id, p.due_date, p.amount, e.title
       FROM payments p
        JOIN entries e ON e.id = p.entry_id
       WHERE e.type = ?
         AND p.status = 'pending'
         AND p.due_date < ?
       ORDER BY p.due_date ASC
       LIMIT ?`,
      [type, today, limit]
    );
  }

  async getAvailableYears(): Promise<string[]> {
    const rows = await databaseService.getAll<{ year: string | null }>(
      `SELECT DISTINCT substr(p.due_date,1,4) AS year
       FROM payments p
       WHERE p.due_date IS NOT NULL
       ORDER BY year DESC`
    );
    return rows
      .map((row) => row.year)
      .filter((year): year is string => Boolean(year));
  }

  async getTotalsByCategory(params?: { ym?: string; type?: 'expense' | 'income' }): Promise<Array<{ category_id: string; total: number }>> {
    const where: string[] = ['e.id = p.entry_id'];
    const bind: any[] = [];
    if (params?.type) {
      where.push('e.type = ?');
      bind.push(params.type);
    }
    if (params?.ym) {
      where.push('substr(p.due_date,1,7) = ?');
      bind.push(params.ym);
    }
    const sql = `SELECT e.category_id AS category_id, COALESCE(SUM(p.amount),0) AS total
                 FROM payments p JOIN entries e ON e.id = p.entry_id
                 WHERE ${where.join(' AND ')}
                 GROUP BY e.category_id
                 ORDER BY total DESC`;
    return databaseService.getAll(sql, bind);
  }

  async aggregate(params: {
    fact: 'payments_all' | 'payments_expense' | 'payments_income';
    dimension: 'month' | 'category' | 'status' | 'type';
    measure: 'sum' | 'count' | 'avg';
    filters?: { type?: EntryType; status?: 'pending' | 'paid'; date_from?: string; date_to?: string };
  }): Promise<Array<{ key: string; value: number }>> {
    const dimMap: Record<string, string> = {
      month: `substr(p.due_date,1,7)`,
      category: `e.category_id`,
      status: `p.status`,
      type: `e.type`,
    };
    const meaMap: Record<string, string> = {
      sum: `SUM(p.amount)`,
      count: `COUNT(1)`,
      avg: `AVG(p.amount)`,
    };
    const dimExpr = dimMap[params.dimension];
    const meaExpr = meaMap[params.measure];
    const where: string[] = ['e.id = p.entry_id'];
    const bind: any[] = [];
    const factType: EntryType | undefined =
      params.fact === 'payments_expense'
        ? 'expense'
        : params.fact === 'payments_income'
        ? 'income'
        : undefined;
    const filterType: EntryType | undefined = params.filters?.type;
    const effectiveType = filterType ?? factType;
    if (effectiveType) {
      where.push('e.type = ?');
      bind.push(effectiveType);
    }
    if (params.filters?.status) { where.push('p.status = ?'); bind.push(params.filters.status); }
    if (params.filters?.date_from) { where.push('p.due_date >= ?'); bind.push(params.filters.date_from); }
    if (params.filters?.date_to) { where.push('p.due_date <= ?'); bind.push(params.filters.date_to); }
    const sql = `SELECT ${dimExpr} AS k, ${meaExpr} AS v
      FROM payments p JOIN entries e ON e.id = p.entry_id
      WHERE ${where.join(' AND ')}
      GROUP BY k
      ORDER BY v DESC`;
    const rows = await databaseService.getAll<{ k: string; v: number }>(sql, bind);
    return rows.map(r => ({ key: r.k, value: Number(r.v || 0) }));
  }
  async getEntries(type?: 'expense' | 'income' | 'receivable'): Promise<any[]> {
    if (type) {
      return databaseService.getAll<any>(
        `SELECT * FROM entries WHERE is_active = 1 AND type = ? ORDER BY created_at DESC`,
        [type]
      );
    }
    return databaseService.getAll<any>(
      `SELECT * FROM entries WHERE is_active = 1 ORDER BY created_at DESC`
    );
  }

  async getEntryTypes(): Promise<EntryType[]> {
    const rows = await databaseService.getAll<{ type: string }>(
      `SELECT DISTINCT type FROM entries WHERE is_active = 1`
    );
    const allowed: EntryType[] = ['expense', 'income', 'receivable'];
    const types = rows
      .map((row) => row.type)
      .filter((type): type is EntryType => allowed.includes(type as EntryType));
    const unique = Array.from(new Set(types));
    return unique.length > 0 ? unique : ['expense', 'income'];
  }

  async getPaymentsByEntry(entryId: string): Promise<any[]> {
    return databaseService.getAll<any>(`SELECT * FROM payments WHERE entry_id = ? AND is_active = 1 ORDER BY due_date ASC`, [entryId]);
  }

  async updatePaymentStatus(paymentId: string, status: 'pending' | 'paid' | 'received'): Promise<void> {
    const paidAt = status === 'paid' || status === 'received' ? new Date().toISOString() : null;
    await databaseService.query(`UPDATE payments SET status = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, paidAt, paymentId]);
  }

  async deleteEntry(entryId: string): Promise<void> {
    await databaseService.transaction(async () => {
      await databaseService.query(
        `UPDATE entries SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [entryId]
      );
      await databaseService.query(
        `UPDATE payments SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE entry_id = ?`,
        [entryId]
      );
    });
  }
  async createEntryWithSchedule(input: CreateEntryInput): Promise<{ entryId: string }> {
    const entryId = `ent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const scheduleType = input.months && input.months > 1 ? 'installment' : 'once';
    const months = Math.max(0, Math.floor(input.months || 0));
    const total = input.amount;
    const perInstallment = months > 1 ? Number((total / months).toFixed(2)) : total;

    await databaseService.transaction(async () => {
      // Entry insert
      await databaseService.query(
        `INSERT INTO entries (id, category_id, type, title, amount, months, start_date, schedule_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entryId,
          input.categoryId,
          input.type || 'expense',
          input.title,
          total,
          months,
          input.startDate,
          scheduleType,
        ]
      );

      if (months > 1) {
        for (let i = 0; i < months; i++) {
          const pid = `pay_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;
          const due = addMonthsClamp(input.startDate, i);
          await databaseService.query(
            `INSERT INTO payments (id, entry_id, due_date, amount, status) VALUES (?, ?, ?, ?, 'pending')`,
            [pid, entryId, due, perInstallment]
          );
        }
      } else {
        const pid = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await databaseService.query(
          `INSERT INTO payments (id, entry_id, due_date, amount, status) VALUES (?, ?, ?, ?, 'pending')`,
          [pid, entryId, input.startDate, total]
        );
      }
    });

    return { entryId };
  }

  async getYearlyCashFlow(year: string): Promise<{ incomePaid: number; expensePaid: number }> {
    const row = await databaseService.getFirst<{ income_paid: number; expense_paid: number }>(
      `SELECT
         COALESCE(SUM(CASE WHEN e.type = 'income' AND p.status IN ('paid','received') THEN p.amount ELSE 0 END), 0) AS income_paid,
         COALESCE(SUM(CASE WHEN e.type = 'expense' AND p.status IN ('paid','received') THEN p.amount ELSE 0 END), 0) AS expense_paid
       FROM payments p
       JOIN entries e ON e.id = p.entry_id
       WHERE substr(p.due_date,1,4) = ?`,
      [year]
    );
    return {
      incomePaid: Number(row?.income_paid || 0),
      expensePaid: Number(row?.expense_paid || 0),
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
