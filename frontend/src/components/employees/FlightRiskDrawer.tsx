import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MessageSquare, Award, TrendingUp, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { generateFlightRiskData, FlightRiskData, FlightRiskEvent } from "@/utils/mockAnalyticsData";

interface FlightRiskDrawerProps {
  employeeId: string | null;
  employeeName: string;
  open: boolean;
  onClose: () => void;
}

export default function FlightRiskDrawer({ employeeId, employeeName, open, onClose }: FlightRiskDrawerProps) {
  if (!employeeId) return null;
  
  const data = generateFlightRiskData(employeeId);

  const getRiskColor = (score: number): string => {
    if (score >= 70) return "#ef4444";
    if (score >= 50) return "#f59e0b";
    if (score >= 30) return "#eab308";
    return "#22c55e";
  };

  const getCurrentRisk = () => {
    return data.riskScores[data.riskScores.length - 1].score;
  };

  const getEventIcon = (type: FlightRiskEvent['type']) => {
    switch (type) {
      case 'review': return <Award className="h-4 w-4" />;
      case 'one-on-one': return <MessageSquare className="h-4 w-4" />;
      case 'milestone': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment-shift': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getEventColor = (impact: FlightRiskEvent['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{point.date}</p>
          <p className="text-sm" style={{ color: getRiskColor(point.score) }}>
            Risk Score: {point.score.toFixed(0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{employeeName} - Flight Risk Analysis</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Current Risk Score */}
          <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Flight Risk Score</p>
                <p className="text-4xl font-bold mt-1" style={{ color: getRiskColor(getCurrentRisk()) }}>
                  {getCurrentRisk().toFixed(0)}
                </p>
              </div>
              <Badge 
                className="text-base px-4 py-2"
                style={{ 
                  backgroundColor: getRiskColor(getCurrentRisk()),
                  color: 'white'
                }}
              >
                {getCurrentRisk() >= 70 ? 'High Risk' : getCurrentRisk() >= 50 ? 'Moderate' : 'Low Risk'}
              </Badge>
            </div>
          </Card>

          {/* 90-Day Trend Chart */}
          <div>
            <h3 className="text-sm font-semibold mb-3">90-Day Risk Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.riskScores}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#riskGradient)" 
                />
                
                {/* Mark events on the chart */}
                {data.events.map((event, i) => {
                  const point = data.riskScores.find(s => s.date === event.date);
                  return point ? (
                    <ReferenceDot
                      key={i}
                      x={event.date}
                      y={point.score}
                      r={6}
                      fill={event.impact === 'positive' ? '#22c55e' : event.impact === 'negative' ? '#ef4444' : '#64748b'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ) : null;
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Events Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Key Events Timeline</h3>
            <div className="space-y-3">
              {data.events.map((event, i) => (
                <div 
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(event.impact)}`}
                >
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold capitalize">
                        {event.type.replace('-', ' ')}
                      </p>
                      <span className="text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Recommended Actions
            </h3>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <Card key={i} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{rec}</p>
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <Button variant="default" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule 1:1
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full">
              <Award className="h-4 w-4 mr-2" />
              Recognition
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
