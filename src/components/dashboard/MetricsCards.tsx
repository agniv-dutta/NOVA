import { Users, TrendingUp, AlertTriangle, UserMinus } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  tooltip: string;
  delay: number;
}

function MetricCard({ title, value, subtitle, icon, accentClass, tooltip, delay }: MetricCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay * 0.1, duration: 0.4 }}
          className="metric-card group cursor-default"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={`mt-1 text-3xl font-bold tabular-nums ${accentClass}`}>{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${accentClass}`}>
              {icon}
            </div>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}

export function MetricsCards() {
  const { employees } = useEmployees();

  const totalEmployees = employees.length;
  const highPerformers = employees.filter(e => e.performanceScore >= 80).length;
  const burnoutRisk = employees.filter(e => e.burnoutRisk >= 60).length;
  const attritionRisk = employees.filter(e => e.attritionRisk >= 60).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Employees"
        value={totalEmployees}
        subtitle="Active in system"
        icon={<Users className="h-5 w-5" />}
        accentClass="text-metric-blue"
        tooltip="Total number of employees tracked in the system"
        delay={0}
      />
      <MetricCard
        title="High Performers"
        value={highPerformers}
        subtitle={`${Math.round(highPerformers / totalEmployees * 100)}% of workforce`}
        icon={<TrendingUp className="h-5 w-5" />}
        accentClass="text-metric-green"
        tooltip="Employees with performance score ≥ 80"
        delay={1}
      />
      <MetricCard
        title="Burnout Risk"
        value={burnoutRisk}
        subtitle="Employees at high risk"
        icon={<AlertTriangle className="h-5 w-5" />}
        accentClass="text-metric-amber"
        tooltip="Employees with burnout risk score ≥ 60%"
        delay={2}
      />
      <MetricCard
        title="Attrition Risk"
        value={attritionRisk}
        subtitle="Potential flight risks"
        icon={<UserMinus className="h-5 w-5" />}
        accentClass="text-metric-red"
        tooltip="Employees with attrition risk score ≥ 60%"
        delay={3}
      />
    </div>
  );
}
