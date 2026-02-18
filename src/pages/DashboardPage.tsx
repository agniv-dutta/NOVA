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
  { icon: TrendingDown, label: 'Projected Attrition Reduction', value: '25%', desc: 'With AI-driven interventions', color: '#4ECDC4' },
  { icon: ShieldCheck, label: 'Early Detection Rate', value: '87%', desc: 'Employees flagged before exit', color: '#00C853' },
  { icon: BarChart3, label: 'Productivity Gain', value: '18%', desc: 'From wellbeing interventions', color: '#FFE500' },
  { icon: Clock, label: 'HR Time Saved', value: '15hrs/wk', desc: 'Automated analysis vs manual', color: '#FF6B9D' },
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
        <h3 className="mb-3 text-sm font-bold font-heading text-foreground uppercase tracking-wider">Business Impact Projections</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_DATA.map((kpi, i) => (
            <div key={i} className="metric-card flex items-center gap-3 p-4">
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_#000]"
                style={{ backgroundColor: kpi.color }}
              >
                <kpi.icon className="h-4 w-4 text-[#1A1A1A]" />
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
