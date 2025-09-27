// Report Entity Model
export interface Report {
  id: string;
  name: string;
  config: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface ReportConfig {
  type: 'table' | 'chart' | 'summary';
  filters?: Record<string, unknown>;
  columns?: string[];
  chartType?: 'bar' | 'line' | 'pie';
  groupBy?: string;
  aggregateBy?: string;
}

export interface CreateReportData {
  name: string;
  config: ReportConfig;
}

export interface UpdateReportData {
  name?: string;
  config?: ReportConfig;
}

// Report definition for services
export interface ReportDef {
  id: string;
  name: string;
  config: ReportConfig;
  created_at: string;
  updated_at: string;
}

// Report filter types
export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categoryIds?: string[];
  entryTypes?: ('expense' | 'income' | 'receivable')[];
  status?: ('pending' | 'paid' | 'received')[];
  amountRange?: {
    min: number;
    max: number;
  };
}

// Report result data
export interface ReportData {
  headers: string[];
  rows: Record<string, unknown>[];
  summary?: Record<string, number>;
  chartData?: ReportChartDataPoint[];
}

export interface ReportChartDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
}
