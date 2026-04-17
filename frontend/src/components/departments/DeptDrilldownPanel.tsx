import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DrilldownResponse, EfficiencyDimension } from '@/hooks/useDepartmentHeatmap';

const DIMENSION_LABELS: Record<EfficiencyDimension, string> = {
  avg_performance: 'Avg Performance',
  avg_engagement: 'Avg Engagement',
  burnout_rate: 'Burnout Rate',
  attrition_risk: 'Attrition Risk',
  sentiment_score: 'Sentiment Score',
  workload_index: 'Workload Index',
};

const NEGATIVE_DIMS = new Set<EfficiencyDimension>([
  'burnout_rate',
  'attrition_risk',
  'workload_index',
]);

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

type Props = {
  department: string | null;
  data: DrilldownResponse | null;
  loading: boolean;
  error: string | null;
};

export default function DeptDrilldownPanel({ department, data, loading, error }: Props) {
  const navigate = useNavigate();

  if (!department) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center border-2 border-foreground bg-[#60A5FA] shadow-[4px_4px_0px_#000]">
          <LayoutGrid className="h-10 w-10 text-foreground" />
        </div>
        <p className="max-w-xs text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Click any department to see detailed breakdown
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-[#FF1744]" />
        <p className="text-sm font-bold">Unable to load drilldown</p>
        <p className="text-xs text-muted-foreground">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  const efficiencyPct = Math.round(data.efficiency_score * 100);
  const trendPositive = data.trend_30d >= 0;
  const gaugeData = [
    {
      name: 'efficiency',
      value: efficiencyPct,
      fill:
        efficiencyPct >= 70 ? '#22c55e' : efficiencyPct >= 50 ? '#3b82f6' : '#ef4444',
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <Card className="border-2 border-foreground shadow-[4px_4px_0px_#000] bg-card">
        <CardContent className="flex flex-wrap items-center gap-4 pt-4">
          <div className="flex-1 min-w-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Department
            </p>
            <h2 className="text-xl font-bold font-heading text-foreground">
              {data.department}
            </h2>
            <Badge
              variant="outline"
              className="mt-1 border-2 border-foreground text-[10px] font-bold"
            >
              {data.employee_count} Employees
            </Badge>
          </div>
          <div className="h-24 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={4} background />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-sm font-bold"
                >
                  {efficiencyPct}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div
            className={`flex items-center gap-1 border-2 border-foreground px-2 py-1 text-xs font-bold ${
              trendPositive ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
            }`}
          >
            {trendPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendPositive ? '+' : ''}
            {Math.round(data.trend_30d * 100)}% vs last month
          </div>
        </CardContent>
      </Card>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Dimension Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(data.dimension_breakdown) as EfficiencyDimension[]).map((dim) => {
            const breakdown = data.dimension_breakdown[dim];
            const sparkData = breakdown.trend.map((y, i) => ({ x: i, y }));
            const vsAvgPct = Math.round(breakdown.vs_org_avg * 100);
            const isNeg = NEGATIVE_DIMS.has(dim);
            const betterThanAvg = isNeg ? breakdown.vs_org_avg < 0 : breakdown.vs_org_avg > 0;
            const chipColor = betterThanAvg ? '#22c55e' : '#ef4444';
            return (
              <div
                key={dim}
                className="border-2 border-foreground bg-card p-2 shadow-[2px_2px_0px_#000]"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {DIMENSION_LABELS[dim]}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {toPercent(breakdown.current)}
                </p>
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#1A1A1A"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span
                  className="inline-block mt-1 border border-foreground px-1 text-[10px] font-bold"
                  style={{ backgroundColor: chipColor, color: '#fff' }}
                >
                  {vsAvgPct > 0 ? '+' : ''}
                  {vsAvgPct}% vs org
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Top Performers
        </h3>
        <div className="grid gap-2">
          {data.top_performers.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 border-2 border-foreground bg-card p-2 shadow-[2px_2px_0px_#000]"
            >
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-[#60A5FA] text-sm font-bold">
                {initials(emp.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold">{emp.name}</p>
                <p className="truncate text-xs text-muted-foreground">{emp.role}</p>
              </div>
              <Badge
                className="border-2 border-foreground bg-[#22c55e] text-white"
              >
                {toPercent(emp.performance_score)}
              </Badge>
              <Link
                to={`/employees/${emp.id}/profile`}
                className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
              >
                View Profile <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-[#FF1744]" /> At-Risk Employees
        </h3>
        <div className="grid gap-2">
          {data.at_risk_employees.map((emp) => (
            <div
              key={emp.id}
              className="border-2 border-foreground bg-card p-2 shadow-[2px_2px_0px_#000]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-[#60A5FA] text-sm font-bold">
                  {initials(emp.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold">{emp.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{emp.role}</p>
                </div>
                <Badge className="border-2 border-foreground bg-[#FF1744] text-white">
                  Burnout {toPercent(emp.burnout_score)}
                </Badge>
                <Badge className="border-2 border-foreground bg-[#3B82F6] text-black">
                  Attrition {toPercent(emp.attrition_risk)}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="border border-foreground bg-background px-1 text-[10px] font-bold uppercase">
                  {emp.primary_risk_flag}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 border-foreground bg-[#60A5FA] text-xs font-bold shadow-[2px_2px_0px_#000]"
                  onClick={() => navigate(`/employees/${emp.id}/profile`)}
                >
                  Take Action <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Card className="border-2 border-foreground shadow-[4px_4px_0px_#000] bg-card">
          <CardHeader className="border-b-2 border-foreground pb-2">
            <CardTitle className="text-xs font-heading uppercase tracking-wider">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Active Interventions</p>
              <p className="text-lg font-bold">{data.intervention_count_active}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Anomalies</p>
              <p className="text-lg font-bold">{data.anomalies_detected}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Top Risk</p>
              <p className="text-[10px] font-bold leading-tight">{data.top_risk_reason}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
