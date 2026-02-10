import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { SentimentPieChart, PerformanceScatterPlot, DepartmentRiskHeatmap } from '@/components/dashboard/Charts';
import WorkforceHealthScore from '@/components/dashboard/WorkforceHealthScore';
import AttritionPredictionTimeline from '@/components/dashboard/AttritionPredictionTimeline';
import EmployeeTenureDistribution from '@/components/dashboard/EmployeeTenureDistribution';
import EngagementPerformanceQuadrant from '@/components/dashboard/EngagementPerformanceQuadrant';
import BurnoutHeatmap from '@/components/dashboard/BurnoutHeatmap';
import SkillsGapRadar from '@/components/dashboard/SkillsGapRadar';
import CompensationEquityAnalysis from '@/components/dashboard/CompensationEquityAnalysis';
import HiringFunnel from '@/components/dashboard/HiringFunnel';
import AbsenteeismPatterns from '@/components/dashboard/AbsenteeismPatterns';
import ManagerEffectivenessScorecard from '@/components/dashboard/ManagerEffectivenessScorecard';
import { useEmployees } from '@/contexts/EmployeeContext';
import { BarChart3, TrendingDown, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const KPI_DATA = [
  { icon: TrendingDown, label: 'Projected Attrition Reduction', value: '25%', desc: 'With AI-driven interventions' },
  { icon: ShieldCheck, label: 'Early Detection Rate', value: '87%', desc: 'Employees flagged before exit' },
  { icon: BarChart3, label: 'Productivity Gain', value: '18%', desc: 'From wellbeing interventions' },
  { icon: Clock, label: 'HR Time Saved', value: '15hrs/wk', desc: 'Automated analysis vs manual' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top KPI - Workforce Health Score */}
      <WorkforceHealthScore />

      {/* Original Metrics Cards */}
      <MetricsCards />

      {/* Attrition Prediction Timeline */}
      <div className="grid gap-4 lg:grid-cols-1">
        <AttritionPredictionTimeline />
      </div>

      {/* Employee Tenure Distribution */}
      <div className="grid gap-4 lg:grid-cols-1">
        <EmployeeTenureDistribution />
      </div>

      {/* Engagement vs Performance Quadrant Matrix */}
      <EngagementPerformanceQuadrant />

      {/* Original Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SentimentPieChart />
        <PerformanceScatterPlot />
      </div>

      {/* Burnout Heatmap */}
      <BurnoutHeatmap />

      {/* Skills Gap Radar */}
      <div className="grid gap-4 lg:grid-cols-1">
        <SkillsGapRadar />
      </div>

      {/* Compensation Equity Analysis */}
      <CompensationEquityAnalysis />

      {/* Hiring Funnel */}
      <div className="grid gap-4 lg:grid-cols-1">
        <HiringFunnel />
      </div>

      {/* Absenteeism Patterns */}
      <AbsenteeismPatterns />

      {/* Manager Effectiveness Scorecard */}
      <ManagerEffectivenessScorecard />

      {/* Original Department Risk Heatmap */}
      <DepartmentRiskHeatmap />

      {/* Business Impact KPIs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">Business Impact Projections</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_DATA.map((kpi, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="rounded-lg bg-accent p-2">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
