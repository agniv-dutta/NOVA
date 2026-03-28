import { getRiskLevel } from '@/types/employee';

interface RiskBadgeProps {
  value: number;
  showValue?: boolean;
}

export function RiskBadge({ value, showValue = true }: RiskBadgeProps) {
  const level = getRiskLevel(value);
  const className = `risk-badge risk-${level}`;

  return (
    <span className={className}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${
        level === 'low' ? 'bg-risk-low' : level === 'medium' ? 'bg-risk-medium' : 'bg-risk-high'
      }`} />
      {showValue && <span className="tabular-nums">{Math.round(value)}%</span>}
      <span className="capitalize">{level}</span>
    </span>
  );
}
