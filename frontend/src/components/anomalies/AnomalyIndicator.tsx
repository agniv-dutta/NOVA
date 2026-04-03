import React from 'react';
import { AlertTriangle, TrendingDown, Users, MessageSquare, Zap } from 'lucide-react';

interface AnomalyData {
  detected: boolean;
  type: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  z_score: number;
  description: string;
}

interface AnomalyIndicatorProps {
  sentiment?: AnomalyData;
  engagement?: AnomalyData;
  performance?: AnomalyData;
  communication?: AnomalyData;
  composite?: {
    detected: boolean;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  compact?: boolean;
}

const severityColors: Record<string, { badge: string; icon: string; bg: string }> = {
  low: { badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-500', bg: 'bg-blue-50' },
  medium: {
    badge: 'bg-yellow-100 text-yellow-800',
    icon: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
  high: {
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  critical: { badge: 'bg-red-100 text-red-800', icon: 'text-red-600', bg: 'bg-red-50' },
};

const AnomalyIndicator: React.FC<AnomalyIndicatorProps> = ({
  sentiment,
  engagement,
  performance,
  communication,
  composite,
  compact = false,
}) => {
  const anomalies = [
    { label: 'Sentiment', data: sentiment, icon: TrendingDown },
    { label: 'Engagement', data: engagement, icon: Zap },
    { label: 'Performance', data: performance, icon: TrendingDown },
    { label: 'Communication', data: communication, icon: MessageSquare },
  ].filter((a) => a.data);

  const detectedAnomalies = anomalies.filter((a) => a.data?.detected);

  if (compact) {
    // Compact view: just show composite or detection count
    if (composite?.detected) {
      return (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
            severityColors[composite.severity].badge
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {detectedAnomalies.length} Anomal{detectedAnomalies.length === 1 ? 'y' : 'ies'}
        </div>
      );
    }
    return null;
  }

  // Full view: show all anomalies with details
  return (
    <div className="space-y-4">
      {/* Composite Result */}
      {composite && (
        <div
          className={`border-l-4 p-4 rounded-r-lg ${severityColors[composite.severity].bg} border-l-4 border-l-${
            composite.severity === 'critical'
              ? 'red-500'
              : composite.severity === 'high'
              ? 'orange-500'
              : composite.severity === 'medium'
              ? 'yellow-500'
              : 'blue-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`mt-0.5 flex-shrink-0 ${
                severityColors[composite.severity].icon
              }`}
              size={20}
            />
            <div>
              <p className="font-semibold">Behavioral Anomalies Detected</p>
              <p className="text-sm mt-1">{composite.reason}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                  severityColors[composite.severity].badge
                }`}
              >
                {composite.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Anomalies */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-gray-700">Detailed Analysis</h4>
        {anomalies.length === 0 ? (
          <p className="text-sm text-gray-500">No anomalies detected</p>
        ) : (
          <div className="space-y-2">
            {anomalies.map((anomaly, idx) => {
              const Icon = anomaly.icon;
              const severity = anomaly.data?.severity || 'low';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded border-l-2 ${
                    anomaly.data?.detected
                      ? `${severityColors[severity].bg} border-l-${
                          severity === 'critical'
                            ? 'red-500'
                            : severity === 'high'
                            ? 'orange-500'
                            : severity === 'medium'
                            ? 'yellow-500'
                            : 'blue-500'
                        }`
                      : 'bg-gray-50 border-l-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 ${
                        anomaly.data?.detected
                          ? severityColors[severity].icon
                          : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{anomaly.label}</p>
                        {anomaly.data?.detected && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              severityColors[severity].badge
                            }`}
                          >
                            {severity.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {anomaly.data?.description && (
                        <p className="text-sm mt-1 text-gray-600">
                          {anomaly.data.description}
                        </p>
                      )}
                      {anomaly.data?.detected && anomaly.data?.z_score && (
                        <p className="text-xs text-gray-500 mt-1">
                          Z-score: {anomaly.data.z_score.toFixed(2)} σ
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyIndicator;
