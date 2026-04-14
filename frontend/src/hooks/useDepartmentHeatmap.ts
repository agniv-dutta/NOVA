import { useCallback, useEffect, useState } from 'react';
import { protectedGetApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export type EfficiencyDimension =
  | 'avg_performance'
  | 'avg_engagement'
  | 'burnout_rate'
  | 'attrition_risk'
  | 'sentiment_score'
  | 'workload_index';

export type HeatmapResponse = {
  departments: string[];
  dimensions: EfficiencyDimension[];
  matrix: Record<string, Record<EfficiencyDimension, number>>;
  risk_flags: Record<string, string[]>;
  computed_at: string;
};

export type DrilldownResponse = {
  department: string;
  employee_count: number;
  efficiency_score: number;
  trend_30d: number;
  top_performers: Array<{
    id: string;
    name: string;
    role: string;
    performance_score: number;
    engagement_score: number;
  }>;
  at_risk_employees: Array<{
    id: string;
    name: string;
    role: string;
    burnout_score: number;
    attrition_risk: number;
    primary_risk_flag: string;
  }>;
  dimension_breakdown: Record<
    EfficiencyDimension,
    { current: number; trend: number[]; vs_org_avg: number }
  >;
  intervention_count_active: number;
  anomalies_detected: number;
  top_risk_reason: string;
};

export function useDepartmentHeatmap() {
  const { token } = useAuth();
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    protectedGetApi<HeatmapResponse>('/api/departments/efficiency-heatmap', token)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return { data, loading, error };
}

export function useDepartmentDrilldown(department: string | null) {
  const { token } = useAuth();
  const [data, setData] = useState<DrilldownResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartment = useCallback(
    async (dept: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const payload = await protectedGetApi<DrilldownResponse>(
          `/api/departments/${encodeURIComponent(dept)}/drilldown`,
          token,
        );
        setData(payload);
      } catch (err) {
        setError((err as Error).message);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!department) {
      setData(null);
      return;
    }
    void fetchDepartment(department);
  }, [department, fetchDepartment]);

  return { data, loading, error };
}
