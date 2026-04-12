import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from '@/types/employee';
import { Skeleton } from '@/components/ui/skeleton';

interface ParameterDef {
  name: string;
  required: boolean;
  description: string;
  annotation: string;
  constraints?: Record<string, number | string>;
}

interface DataSourcesPanelProps {
  employees: Employee[];
  onLowQualityCountChange?: (count: number) => void;
}

const TECH_DEPARTMENTS = new Set(['Engineering', 'Product']);

function mapEmployeeToSchema(employee: Employee): Record<string, unknown> {
  const isTech = TECH_DEPARTMENTS.has(employee.department);
  const afterHours = Math.max(0, employee.workHoursPerWeek - 40) * 2;
  const meetingLoad = Math.max(4, employee.projectLoad * 3.5);

  return {
    employee_id: employee.id,
    role_family: isTech ? 'tech' : 'non_tech',
    lines_of_code_14d: isTech ? Math.round((employee.performanceScore / 100) * 3200) : null,
    pull_requests_merged_14d: isTech ? Math.max(0, Math.round((employee.projectLoad / 6) * 14)) : null,
    leave_count_90d: employee.absenceDays,
    kpi_score: employee.performanceScore,
    after_hours_hours_14d: Number(afterHours.toFixed(2)),
    meeting_load_hours_weekly: Number(meetingLoad.toFixed(2)),
    sentiment_score: employee.sentimentScore,
    engagement_score: employee.engagementScore,
    attendance_rate: employee.attendanceRate,
    avg_weekly_hours: employee.avgWeeklyHours,
    leaves_taken_30d: employee.leavesTaken30d,
    last_1on1_days_ago: employee.lastOneOnOneDaysAgo,
    feedback_submissions_count: employee.feedbackSubmissionsCount,
    after_hours_sessions_weekly: employee.afterHoursSessionsWeekly,
    tenure_days: employee.tenureDays,
    manager_relationship_score: Number(Math.min(1, Math.max(0, employee.engagementScore / 100)).toFixed(3)),
    team_dynamics_score: Number(Math.min(1, Math.max(0, (employee.engagementScore - employee.burnoutRisk / 2) / 100)).toFixed(3)),
    growth_satisfaction_score: Number(Math.min(1, Math.max(0, employee.performanceScore / 100)).toFixed(3)),
    tenure_months: employee.tenure,
    absenteeism_days_90d: employee.absenceDays,
  };
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
}

export default function DataSourcesPanel({ employees, onLowQualityCountChange }: DataSourcesPanelProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<ParameterDef[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch('/api/schema/parameters', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setParams(data.parameters || []);
      } catch {
        setParams([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const fieldCompleteness = useMemo(() => {
    if (!params.length || !employees.length) return [] as Array<ParameterDef & { completeness: number }>;

    const mapped = employees.map(mapEmployeeToSchema);
    return params.map((param) => {
      const present = mapped.filter((row) => isPresent(row[param.name])).length;
      const completeness = (present / mapped.length) * 100;
      return { ...param, completeness: Number(completeness.toFixed(1)) };
    });
  }, [params, employees]);

  const lowQualityEmployees = useMemo(() => {
    if (!employees.length) return [] as Employee[];
    return employees.filter((employee) => (employee.dataQualityScore ?? 0) < 70);
  }, [employees]);

  useEffect(() => {
    onLowQualityCountChange?.(lowQualityEmployees.length);
  }, [lowQualityEmployees.length, onLowQualityCountChange]);

  const overallCompleteness = useMemo(() => {
    if (!employees.length) return 0;
    const total = employees.reduce((sum, employee) => sum + (employee.dataQualityScore ?? 0), 0);
    return Number((total / employees.length).toFixed(1));
  }, [employees]);

  const overallBadgeClass = overallCompleteness >= 80
    ? 'bg-emerald-100 text-emerald-800'
    : overallCompleteness >= 50
      ? 'bg-amber-100 text-amber-800'
      : 'bg-red-100 text-red-800';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Data Sources & Parameters
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="ml-1">{open ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Overall completeness:</span>
          <Badge className={overallBadgeClass}>{overallCompleteness}%</Badge>
          {lowQualityEmployees.length > 0 && (
            <Badge variant="destructive">{lowQualityEmployees.length} employees below 70%</Badge>
          )}
        </div>
      </CardHeader>

      {open && (
        <CardContent>
          {loading && (
            <div className="space-y-3 mb-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          <div className="space-y-3">
            {fieldCompleteness.map((param) => (
              <div key={param.name} className="rounded border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{param.name}</p>
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={param.completeness >= 70 ? 'secondary' : 'destructive'}>
                      {param.completeness}% complete
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {!fieldCompleteness.length && (
              <p className="text-sm text-muted-foreground">Schema metadata unavailable for current role/session.</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
