import { useEffect, useState } from 'react';
import { protectedGetApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export type OrgNode = {
  id: string;
  name: string;
  role: string;
  department: string;
  org_level: number;
  tenure_months: number;
  burnout_score: number;
  engagement_score: number;
  sentiment_score: number;
  attrition_risk: number;
  is_at_risk: boolean;
  children: OrgNode[];
};

export type OrgStats = {
  total_levels: number;
  avg_span_of_control: number;
  deepest_chain: number;
  managers_count: number;
  ic_count: number;
};

type RawOrgNode = {
  id?: unknown;
  employee_id?: unknown;
  name?: unknown;
  role?: unknown;
  title?: unknown;
  department?: unknown;
  org_level?: unknown;
  tenure_months?: unknown;
  burnout_score?: unknown;
  engagement_score?: unknown;
  sentiment_score?: unknown;
  attrition_risk?: unknown;
  is_at_risk?: unknown;
  children?: unknown;
};

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNonEmptyString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeOrgNode(raw: unknown): OrgNode | null {
  if (!raw || typeof raw !== 'object') return null;
  const node = raw as RawOrgNode;

  const id =
    (typeof node.id === 'string' && node.id.trim()) ||
    (typeof node.employee_id === 'string' && node.employee_id.trim());

  if (!id) return null;

  const name = asNonEmptyString(node.name, id);
  const role =
    asNonEmptyString(node.role, '') || asNonEmptyString(node.title, 'Employee');
  const department = asNonEmptyString(node.department, 'Unknown');

  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const children = rawChildren
    .map((child) => normalizeOrgNode(child))
    .filter((child): child is OrgNode => Boolean(child));

  const burnout = asNumber(node.burnout_score, 0.3);
  const engagement = asNumber(node.engagement_score, 0.7);
  const sentiment = asNumber(node.sentiment_score, 0);
  const attrition = asNumber(node.attrition_risk, 0.2);
  const isAtRisk =
    typeof node.is_at_risk === 'boolean'
      ? node.is_at_risk
      : burnout >= 0.6 || attrition >= 0.6 || engagement < 0.5;

  return {
    id,
    name,
    role,
    department,
    org_level: asNumber(node.org_level, 0),
    tenure_months: asNumber(node.tenure_months, 0),
    burnout_score: burnout,
    engagement_score: engagement,
    sentiment_score: sentiment,
    attrition_risk: attrition,
    is_at_risk: isAtRisk,
    children,
  };
}

function extractHierarchyRoot(payload: unknown): OrgNode | null {
  if (!payload || typeof payload !== 'object') return null;

  const maybeWrapped = payload as { root?: unknown };
  if (typeof maybeWrapped.root === 'object' && maybeWrapped.root) {
    return normalizeOrgNode(maybeWrapped.root);
  }

  return normalizeOrgNode(payload);
}

function normalizeStats(payload: unknown): OrgStats {
  const source = payload && typeof payload === 'object' ? (payload as Partial<OrgStats>) : {};
  return {
    total_levels: asNumber(source.total_levels, 0),
    avg_span_of_control: asNumber(source.avg_span_of_control, 0),
    deepest_chain: asNumber(source.deepest_chain, 0),
    managers_count: asNumber(source.managers_count, 0),
    ic_count: asNumber(source.ic_count, 0),
  };
}

export function useOrgHierarchy(rootId?: string | null) {
  const { token } = useAuth();
  const [data, setData] = useState<OrgNode | null>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setData(null);
      setStats(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const path = rootId
      ? `/api/org/hierarchy/${encodeURIComponent(rootId)}/subtree`
      : '/api/org/hierarchy';

    Promise.all([
      protectedGetApi<unknown>(path, token),
      protectedGetApi<unknown>('/api/org/hierarchy/stats', token),
    ])
      .then(([treePayload, statsPayload]) => {
        if (cancelled) return;

        const normalizedTree = extractHierarchyRoot(treePayload);
        if (!normalizedTree) {
          throw new Error('Invalid hierarchy payload returned by API.');
        }

        setData(normalizedTree);
        setStats(normalizeStats(statsPayload));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, rootId]);

  return { data, stats, loading, error };
}
