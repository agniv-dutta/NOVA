import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { protectedGetApi } from "@/lib/api";

type FeatureContribution = {
  feature: string;
  label?: string;
  contribution: number;
  direction?: "positive" | "negative" | string;
  explanation: string;
};

type ExplainabilityResponse = {
  employee_id: string;
  score_type: "burnout" | "attrition" | "engagement";
  explanations: Array<{
    feature: string;
    label?: string;
    contribution: number;
    direction: string;
    plain_english: string;
  }>;
  confidence_coverage: number;
  source: string;
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildFallbackRows(employeeId: string): FeatureContribution[] {
  const seed = hashString(employeeId || 'unknown-employee');
  const values = [
    {
      feature: 'meeting_load_hours',
      label: 'Meeting load',
      direction: 'negative' as const,
      explanation: 'Heavy meetings reduce recovery time and make burnout more likely.',
      value: -1,
      weight: 0.28,
    },
    {
      feature: 'sentiment_score',
      label: 'Sentiment trend',
      direction: 'positive' as const,
      explanation: 'Declining sentiment is a strong early warning sign for burnout.',
      value: 1,
      weight: 0.26,
    },
    {
      feature: 'after_hours_ratio',
      label: 'After-hours work',
      direction: 'negative' as const,
      explanation: 'Late-night work often signals workload pressure and reduced recovery.',
      value: -1,
      weight: 0.24,
    },
    {
      feature: 'performance_score',
      label: 'Performance trajectory',
      direction: 'positive' as const,
      explanation: 'Consistent performance tends to buffer short-term burnout risk.',
      value: 1,
      weight: 0.22,
    },
  ];

  return values.map((item, index) => {
    const jitter = ((seed >> (index * 3)) % 7) / 100;
    const contribution = (item.value * item.weight) + (item.direction === 'positive' ? jitter : -jitter);
    return {
      feature: item.feature,
      label: item.label,
      value: item.value,
      weight: item.weight,
      contribution,
      direction: item.direction,
      explanation: item.explanation,
    };
  });
}

interface ScoreExplainabilityProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onClose: () => void;
}

function ContributionTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FeatureContribution }> }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-3 max-w-xs">
      <p className="text-sm font-semibold">{row.label}</p>
      <p className="text-xs text-slate-700 mt-1">{row.explanation}</p>
      <p className="text-xs text-slate-500 mt-1">Contribution: {Math.abs(row.contribution).toFixed(1)}%</p>
    </div>
  );
}

export default function ScoreExplainability({ employeeId, employeeName, open, onClose }: ScoreExplainabilityProps) {
  const { token } = useAuth();
  const [rows, setRows] = useState<FeatureContribution[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!open || !employeeId || !token) {
        if (open && employeeId && !token) {
          setRows(buildFallbackRows(employeeId));
          setSource('local-fallback');
          setError('Live credentials unavailable. Showing a local explanation instead.');
        }
        return;
      }

      setLoading(true);
      try {
        const data = await protectedGetApi<ExplainabilityResponse>(
            `/api/explain/burnout/${employeeId}`,
          token,
        );
        if (mounted) {
            setRows(
              (data.explanations || []).map((item) => ({
                feature: item.feature,
                label: item.label || item.feature,
                contribution: Number(item.contribution) * 100,
                direction: item.contribution >= 0 ? "positive" : "negative",
                explanation: item.plain_english,
              })),
            );
            setSource(data.source);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setRows(buildFallbackRows(employeeId));
          setSource('local-fallback');
          const message = err instanceof Error ? err.message : 'Failed to load explainability data';
          setError(message.includes('credentials') || message.includes('401')
            ? 'Live credentials unavailable. Showing a local explanation instead.'
            : 'Live explainability unavailable. Showing a local explanation instead.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [open, employeeId, token]);

  const chartData = useMemo(() => [...rows].reverse(), [rows]);

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Score Explainability - {employeeName}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Feature contributions to burnout risk. Positive values increase risk, negative values reduce risk.
          </p>

          {loading && <p className="text-sm text-slate-600">Loading feature contributions...</p>}
          {error && <p className="text-sm text-amber-700">{error}</p>}

          {!loading && rows.length > 0 && (
            <>
              <div className="border rounded-lg p-3 bg-slate-50">
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 24, left: 48, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="label" width={190} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ContributionTooltip />} />
                    <Bar dataKey="contribution" radius={[2, 2, 2, 2]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={`${entry.feature}-${idx}`} fill={entry.contribution >= 0 ? "#ef4444" : "#22c55e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.feature} className="border rounded-md p-3 bg-white">
                    <p className="text-sm font-medium" style={{ color: row.contribution >= 0 ? "#b91c1c" : "#15803d" }}>
                      {row.label}: {row.contribution >= 0 ? "+" : ""}{row.contribution.toFixed(1)}% risk
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{row.explanation}</p>
                  </div>
                ))}
              </div>

              {source && (
                <p className="text-xs text-muted-foreground">
                  Source: {source === 'local-fallback' ? 'local fallback explainability' : source}
                </p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
