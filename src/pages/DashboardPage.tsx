import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { SentimentPieChart, PerformanceScatterPlot, DepartmentRiskHeatmap } from '@/components/dashboard/Charts';
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
      <MetricsCards />

      <div className="grid gap-4 lg:grid-cols-2">
        <SentimentPieChart />
        <PerformanceScatterPlot />
      </div>

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
